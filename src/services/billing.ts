/**
 * Google Play Billing Service
 * 
 * This service handles in-app purchases via Google Play Billing.
 * It only activates when running as a native Android app (Capacitor/Cordova).
 * In web mode, purchase requests are logged but no real transactions occur.
 * 
 * Product IDs must match those created in Google Play Console:
 * - monthly_premium: $2.99/month
 * - yearly_premium: $19.99/year
 * - Both include 7-day free trial
 */

class BillingService {
  private isNative = false;
  private isInitialized = false;

  readonly MONTHLY_ID = "monthly_premium";
  readonly YEARLY_ID = "yearly_premium";

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Detect if running as native app
    this.isNative =
      typeof (window as any).Capacitor !== "undefined" ||
      typeof (window as any).cordova !== "undefined";

    if (!this.isNative) {
      console.log("[Billing] Web mode - Google Play Billing not available");
      this.isInitialized = true;
      this.setupWebListeners();
      return;
    }

    // Native: wait for Cordova/Capacitor device ready
    await new Promise<void>((resolve) => {
      if (typeof (window as any).CdvPurchase !== "undefined") {
        resolve();
      } else {
        document.addEventListener("deviceready", () => resolve(), false);
      }
    });

    const store = (window as any).CdvPurchase?.store;
    if (!store) {
      console.warn("[Billing] CdvPurchase.store not found");
      this.isInitialized = true;
      return;
    }

    const CdvPurchase = (window as any).CdvPurchase;

    // Register products
    store.register([
      {
        id: this.MONTHLY_ID,
        type: CdvPurchase.ProductType.PAID_SUBSCRIPTION,
        platform: CdvPurchase.Platform.GOOGLE_PLAY,
      },
      {
        id: this.YEARLY_ID,
        type: CdvPurchase.ProductType.PAID_SUBSCRIPTION,
        platform: CdvPurchase.Platform.GOOGLE_PLAY,
      },
    ]);

    // Handle approved transactions
    store.when().approved((transaction: any) => {
      transaction.products.forEach((product: any) => {
        if (
          product.id === this.MONTHLY_ID ||
          product.id === this.YEARLY_ID
        ) {
          const type = product.id === this.MONTHLY_ID ? "monthly" : "yearly";
          this.activateSubscription(type);
        }
      });
      return transaction.verify();
    });

    store.when().verified((receipt: any) => receipt.finish());

    await store.initialize([CdvPurchase.Platform.GOOGLE_PLAY]);
    this.isInitialized = true;
    console.log("[Billing] Google Play Billing initialized");
  }

  private setupWebListeners(): void {
    // Listen for purchase requests from useSubscription hook
    window.addEventListener("purchase-request", ((event: CustomEvent) => {
      const productId = event.detail;
      console.log(`[Billing] Web purchase request: ${productId}`);
      // In web mode, we can't process real purchases
      // The native APK build will handle this via CdvPurchase
    }) as EventListener);

    window.addEventListener("restore-purchases", () => {
      console.log("[Billing] Web restore request - not available in web mode");
    });
  }

  async purchaseMonthly(): Promise<void> {
    if (!this.isInitialized) await this.initialize();
    if (!this.isNative) {
      console.log("[Billing] Monthly purchase requires Google Play (native APK)");
      return;
    }
    const store = (window as any).CdvPurchase?.store;
    const product = store?.get(this.MONTHLY_ID);
    const offer = product?.getOffer();
    if (offer) await store.order(offer);
  }

  async purchaseYearly(): Promise<void> {
    if (!this.isInitialized) await this.initialize();
    if (!this.isNative) {
      console.log("[Billing] Yearly purchase requires Google Play (native APK)");
      return;
    }
    const store = (window as any).CdvPurchase?.store;
    const product = store?.get(this.YEARLY_ID);
    const offer = product?.getOffer();
    if (offer) await store.order(offer);
  }

  async restorePurchases(): Promise<void> {
    if (!this.isInitialized) await this.initialize();
    if (!this.isNative) return;
    const store = (window as any).CdvPurchase?.store;
    await store?.restorePurchases();
  }

  private activateSubscription(type: "monthly" | "yearly"): void {
    localStorage.setItem("pregnancy_toolkit_subscription", type);
    window.dispatchEvent(
      new CustomEvent("subscription-activated", { detail: type })
    );
    console.log(`[Billing] Subscription activated: ${type}`);
  }
}

export const billingService = new BillingService();

// Auto-initialize on load
billingService.initialize().catch(console.error);

export default billingService;
