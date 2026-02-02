/**
 * Google Play Billing Service
 * يتعامل مع الاشتراكات عبر cordova-plugin-purchase
 */

// Product IDs - يجب أن تتطابق مع Google Play Console
export const PRODUCT_IDS = {
  MONTHLY: "monthly_premium",
  YEARLY: "yearly_premium",
} as const;

// Subscription types
export type SubscriptionType = "none" | "trial" | "monthly" | "yearly" | "free";

// Storage keys
const STORAGE_KEYS = {
  INSTALL_DATE: "pregnancy_toolkit_install_date",
  SUBSCRIPTION: "pregnancy_toolkit_subscription",
  TRIAL_STARTED: "pregnancy_toolkit_trial_started",
};

// Trial duration
const TRIAL_DAYS = 3;

// Check if running in Capacitor/Cordova environment
const isNativeApp = (): boolean => {
  return typeof (window as any).CdvPurchase !== "undefined" || 
         typeof (window as any).cordova !== "undefined";
};

class BillingService {
  private store: any = null;
  private isInitialized = false;
  private listeners: Set<(type: SubscriptionType) => void> = new Set();

  /**
   * Initialize the billing service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Check for native environment
    if (!isNativeApp()) {
      console.log("📱 Web environment detected - Google Play Billing requires native app");
      this.isInitialized = true;
      return;
    }

    try {
      // Wait for Cordova/Capacitor to be ready
      await new Promise<void>((resolve) => {
        if (typeof (window as any).CdvPurchase !== "undefined") {
          resolve();
        } else {
          document.addEventListener("deviceready", () => resolve(), false);
        }
      });

      const CdvPurchase = (window as any).CdvPurchase;
      this.store = CdvPurchase.store;

      // Register products
      this.store.register([
        {
          id: PRODUCT_IDS.MONTHLY,
          type: CdvPurchase.ProductType.PAID_SUBSCRIPTION,
          platform: CdvPurchase.Platform.GOOGLE_PLAY,
        },
        {
          id: PRODUCT_IDS.YEARLY,
          type: CdvPurchase.ProductType.PAID_SUBSCRIPTION,
          platform: CdvPurchase.Platform.GOOGLE_PLAY,
        },
      ]);

      // Handle approved transactions
      this.store.when().approved((transaction: any) => {
        console.log("✅ Transaction approved:", transaction.products);
        
        transaction.products.forEach((product: any) => {
          if (product.id === PRODUCT_IDS.MONTHLY) {
            this.activateSubscription("monthly");
          } else if (product.id === PRODUCT_IDS.YEARLY) {
            this.activateSubscription("yearly");
          }
        });

        return transaction.verify();
      });

      // Handle verified receipts
      this.store.when().verified((receipt: any) => {
        console.log("✅ Receipt verified");
        return receipt.finish();
      });

      // Handle finished transactions
      this.store.when().finished((transaction: any) => {
        console.log("✅ Transaction finished:", transaction);
      });

      // Handle errors
      this.store.error((error: any) => {
        console.error("❌ Store error:", error);
      });

      // Initialize the store
      await this.store.initialize([CdvPurchase.Platform.GOOGLE_PLAY]);
      
      this.isInitialized = true;
      console.log("✅ Billing service initialized");

      // Check for existing subscriptions
      await this.checkExistingSubscriptions();

    } catch (error) {
      console.error("❌ Failed to initialize billing:", error);
      this.isInitialized = true; // Prevent retry loops
    }
  }

  /**
   * Check for existing active subscriptions
   */
  private async checkExistingSubscriptions(): Promise<void> {
    if (!this.store) return;

    const products = [PRODUCT_IDS.MONTHLY, PRODUCT_IDS.YEARLY];
    
    for (const productId of products) {
      const product = this.store.get(productId);
      if (product?.owned) {
        const type = productId === PRODUCT_IDS.MONTHLY ? "monthly" : "yearly";
        this.activateSubscription(type);
        return;
      }
    }
  }

  /**
   * Purchase monthly subscription
   */
  async purchaseMonthly(): Promise<boolean> {
    return this.purchase(PRODUCT_IDS.MONTHLY);
  }

  /**
   * Purchase yearly subscription
   */
  async purchaseYearly(): Promise<boolean> {
    return this.purchase(PRODUCT_IDS.YEARLY);
  }

  /**
   * Generic purchase method
   */
  private async purchase(productId: string): Promise<boolean> {
    if (!isNativeApp()) {
      console.log("📱 Purchase requires native app - showing simulation");
      return false;
    }

    if (!this.store) {
      await this.initialize();
    }

    try {
      const product = this.store?.get(productId);
      if (!product) {
        console.error("❌ Product not found:", productId);
        return false;
      }

      const offer = product.getOffer();
      if (!offer) {
        console.error("❌ No offer available for product:", productId);
        return false;
      }

      await this.store.order(offer);
      return true;
    } catch (error) {
      console.error("❌ Purchase failed:", error);
      return false;
    }
  }

  /**
   * Restore purchases (for users who reinstall or switch devices)
   */
  async restorePurchases(): Promise<boolean> {
    if (!isNativeApp()) {
      console.log("📱 Restore requires native app");
      return false;
    }

    if (!this.store) {
      await this.initialize();
    }

    try {
      await this.store?.restorePurchases();
      return true;
    } catch (error) {
      console.error("❌ Restore failed:", error);
      return false;
    }
  }

  /**
   * Activate subscription locally
   */
  activateSubscription(type: "monthly" | "yearly"): void {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, type);
    this.notifyListeners(type);
    console.log(`✅ Subscription activated: ${type}`);
  }

  /**
   * Deactivate subscription
   */
  deactivateSubscription(): void {
    localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTION);
    this.notifyListeners(this.isTrialActive() ? "trial" : "none");
  }

  /**
   * Start free trial
   */
  startTrial(): boolean {
    const trialStarted = localStorage.getItem(STORAGE_KEYS.TRIAL_STARTED);
    if (trialStarted) {
      console.log("⚠️ Trial already started");
      return false;
    }

    const now = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.TRIAL_STARTED, now);
    localStorage.setItem(STORAGE_KEYS.INSTALL_DATE, now);
    this.notifyListeners("trial");
    console.log("✅ Free trial started");
    return true;
  }

  /**
   * Check if trial is active
   */
  isTrialActive(): boolean {
    const trialStarted = localStorage.getItem(STORAGE_KEYS.TRIAL_STARTED);
    if (!trialStarted) return false;

    const startDate = new Date(trialStarted);
    const now = new Date();
    const daysSinceStart = Math.floor(
      (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSinceStart < TRIAL_DAYS;
  }

  /**
   * Get remaining trial days
   */
  getTrialDaysLeft(): number {
    const trialStarted = localStorage.getItem(STORAGE_KEYS.TRIAL_STARTED);
    if (!trialStarted) return TRIAL_DAYS;

    const startDate = new Date(trialStarted);
    const now = new Date();
    const daysSinceStart = Math.floor(
      (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return Math.max(0, TRIAL_DAYS - daysSinceStart);
  }

  /**
   * Get current subscription type
   */
  getCurrentSubscription(): SubscriptionType {
    const subscription = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
    
    if (subscription === "monthly") return "monthly";
    if (subscription === "yearly") return "yearly";
    if (this.isTrialActive()) return "trial";
    
    return "none";
  }

  /**
   * Check if user has premium access
   */
  hasPremiumAccess(): boolean {
    const subscription = this.getCurrentSubscription();
    return subscription === "monthly" || subscription === "yearly" || subscription === "trial";
  }

  /**
   * Get product prices (from Google Play)
   */
  async getProductPrices(): Promise<{ monthly: string; yearly: string }> {
    const defaultPrices = { monthly: "$1.99/month", yearly: "$14.99/year" };

    if (!isNativeApp() || !this.store) {
      return defaultPrices;
    }

    try {
      const monthlyProduct = this.store.get(PRODUCT_IDS.MONTHLY);
      const yearlyProduct = this.store.get(PRODUCT_IDS.YEARLY);

      return {
        monthly: monthlyProduct?.pricing?.price || defaultPrices.monthly,
        yearly: yearlyProduct?.pricing?.price || defaultPrices.yearly,
      };
    } catch {
      return defaultPrices;
    }
  }

  /**
   * Add subscription change listener
   */
  addListener(callback: (type: SubscriptionType) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of subscription change
   */
  private notifyListeners(type: SubscriptionType): void {
    this.listeners.forEach((callback) => callback(type));
    
    // Also dispatch a custom event for broader compatibility
    window.dispatchEvent(
      new CustomEvent("subscription-changed", { detail: type })
    );
  }

  /**
   * Check if running in native app
   */
  isNativeEnvironment(): boolean {
    return isNativeApp();
  }
}

// Singleton instance
export const billingService = new BillingService();
export default billingService;
