// Type declarations for cordova-plugin-purchase (installed after export to Android Studio)
declare namespace CdvPurchase {
  interface Store {
    register(products: ProductDefinition[]): void;
    initialize(platforms: Platform[]): Promise<void>;
    get(id: string): Product | undefined;
    order(offer: Offer): Promise<void>;
    restorePurchases(): Promise<void>;
    when(): When;
  }

  interface ProductDefinition {
    id: string;
    type: ProductType;
    platform: Platform;
  }

  interface Product {
    id: string;
    getOffer(): Offer | undefined;
  }

  interface Offer {
    id: string;
  }

  interface Transaction {
    products: { id: string }[];
    verify(): Promise<void>;
  }

  interface Receipt {
    finish(): Promise<void>;
  }

  interface When {
    approved(callback: (transaction: Transaction) => Promise<void> | void): When;
    verified(callback: (receipt: Receipt) => Promise<void> | void): When;
    finished(callback: (transaction: Transaction) => void): When;
  }

  enum ProductType {
    PAID_SUBSCRIPTION = "paid subscription",
  }

  enum Platform {
    GOOGLE_PLAY = "android-playstore",
  }

  const store: Store;
}

declare global {
  interface Window {
    CdvPurchase?: typeof CdvPurchase;
  }
}

class BillingService {
  private store: CdvPurchase.Store | null = null;
  private isInitialized = false;

  // Product IDs (must match Google Play Console)
  readonly MONTHLY_ID = "monthly_premium";
  readonly YEARLY_ID = "yearly_premium";

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Wait for Cordova to load
    await new Promise<void>((resolve) => {
      if (typeof CdvPurchase !== "undefined") {
        resolve();
      } else {
        document.addEventListener("deviceready", () => resolve(), false);
      }
    });

    this.store = CdvPurchase.store;

    // Register products
    this.store.register([
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
    this.store.when().approved((transaction) => {
      console.log("✅ Transaction approved:", transaction.products);
      
      transaction.products.forEach((product) => {
        if (product.id === this.MONTHLY_ID) {
          this.activateSubscription("monthly");
        } else if (product.id === this.YEARLY_ID) {
          this.activateSubscription("yearly");
        }
      });

      return transaction.verify();
    });

    this.store.when().verified((receipt) => {
      console.log("✅ Receipt verified");
      return receipt.finish();
    });

    this.store.when().finished((transaction) => {
      console.log("✅ Transaction finished:", transaction);
    });

    // Initialize store
    await this.store.initialize([CdvPurchase.Platform.GOOGLE_PLAY]);
    this.isInitialized = true;
    console.log("✅ Billing service initialized");
  }

  // Purchase monthly subscription
  async purchaseMonthly(): Promise<void> {
    if (!this.store) {
      await this.initialize();
    }
    
    const product = this.store?.get(this.MONTHLY_ID);
    if (product) {
      const offer = product.getOffer();
      if (offer) {
        await this.store?.order(offer);
      }
    }
  }

  // Purchase yearly subscription
  async purchaseYearly(): Promise<void> {
    if (!this.store) {
      await this.initialize();
    }
    
    const product = this.store?.get(this.YEARLY_ID);
    if (product) {
      const offer = product.getOffer();
      if (offer) {
        await this.store?.order(offer);
      }
    }
  }

  // Restore purchases
  async restorePurchases(): Promise<void> {
    if (!this.store) {
      await this.initialize();
    }
    await this.store?.restorePurchases();
  }

  // Activate subscription locally
  private activateSubscription(type: "monthly" | "yearly"): void {
    localStorage.setItem("pregnancy_toolkit_subscription", type);
    window.dispatchEvent(new CustomEvent("subscription-activated", { detail: type }));
    console.log(`✅ Subscription activated: ${type}`);
  }

  // Check if running in native app
  isNativeApp(): boolean {
    return typeof CdvPurchase !== "undefined";
  }
}

export const billingService = new BillingService();
export default billingService;
