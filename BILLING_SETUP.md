# 🚀 دليل إعداد Google Play Billing - خطوة بخطوة

## المتطلبات الأساسية

قبل البدء، تأكد من تحميل:
- ✅ [Node.js](https://nodejs.org) (الإصدار 18 أو أحدث)
- ✅ [Android Studio](https://developer.android.com/studio) (مجاني)
- ✅ حساب [Google Play Console](https://play.google.com/console) ($25 رسوم تسجيل لمرة واحدة)

---

## 📦 الخطوة 1: تصدير المشروع من Lovable

1. في Lovable، اضغط على زر **GitHub** في الأعلى
2. اضغط **Connect to GitHub** وسجّل الدخول
3. اضغط **Create Repository** لإنشاء مستودع جديد
4. انسخ رابط المستودع (مثال: `https://github.com/username/wellmama`)

---

## 💻 الخطوة 2: إعداد البيئة المحلية

افتح Terminal (Mac/Linux) أو Command Prompt (Windows) واكتب:

```bash
# 1. استنساخ المشروع
git clone https://github.com/USERNAME/REPO_NAME.git
cd REPO_NAME

# 2. تثبيت المكتبات
npm install

# 3. إضافة منصة Android
npx cap add android

# 4. تثبيت مكتبة الفوترة
npm install cordova-plugin-purchase
npm install @awesome-cordova-plugins/in-app-purchase-2

# 5. بناء المشروع
npm run build

# 6. مزامنة مع Android
npx cap sync android

# 7. فتح في Android Studio
npx cap open android
```

---

## 📝 الخطوة 3: إنشاء ملف خدمة الفوترة

أنشئ ملف جديد: `src/services/billing.ts`

```typescript
import "cordova-plugin-purchase";

class BillingService {
  private store: CdvPurchase.Store | null = null;
  private isInitialized = false;

  // معرّفات المنتجات (يجب أن تتطابق مع Google Play Console)
  readonly MONTHLY_ID = "monthly_premium";
  readonly YEARLY_ID = "yearly_premium";

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // انتظر تحميل Cordova
    await new Promise<void>((resolve) => {
      if (typeof CdvPurchase !== "undefined") {
        resolve();
      } else {
        document.addEventListener("deviceready", () => resolve(), false);
      }
    });

    this.store = CdvPurchase.store;

    // تسجيل المنتجات
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

    // معالجة المعاملات
    this.store.when().approved((transaction) => {
      console.log("✅ تمت الموافقة على المعاملة:", transaction.products);
      
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
      console.log("✅ تم التحقق من الإيصال");
      return receipt.finish();
    });

    this.store.when().finished((transaction) => {
      console.log("✅ اكتملت المعاملة:", transaction);
    });

    // تهيئة المتجر
    await this.store.initialize([CdvPurchase.Platform.GOOGLE_PLAY]);
    this.isInitialized = true;
    console.log("✅ تم تهيئة خدمة الفوترة");
  }

  // شراء الاشتراك الشهري
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

  // شراء الاشتراك السنوي
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

  // استعادة المشتريات
  async restorePurchases(): Promise<void> {
    if (!this.store) {
      await this.initialize();
    }
    await this.store?.restorePurchases();
  }

  // تفعيل الاشتراك محلياً
  private activateSubscription(type: "monthly" | "yearly"): void {
    localStorage.setItem("pregnancy_toolkit_subscription", type);
    window.dispatchEvent(new CustomEvent("subscription-activated", { detail: type }));
    console.log(`✅ تم تفعيل الاشتراك: ${type}`);
  }
}

export const billingService = new BillingService();
export default billingService;
```

---

## 🔗 الخطوة 4: ربط الفوترة بالتطبيق

عدّل ملف `src/hooks/useSubscription.ts`:

```typescript
import { useState, useEffect, useCallback } from "react";
import billingService from "@/services/billing";

const INSTALLATION_KEY = "pregnancy_toolkit_install_date";
const SUBSCRIPTION_KEY = "pregnancy_toolkit_subscription";
const TRIAL_DAYS = 3;

interface SubscriptionState {
  isTrialActive: boolean;
  isSubscribed: boolean;
  installDate: Date | null;
  trialDaysLeft: number;
  subscriptionType: "none" | "trial" | "monthly" | "yearly";
}

export const useSubscription = () => {
  const [state, setState] = useState<SubscriptionState>({
    isTrialActive: false,
    isSubscribed: false,
    installDate: null,
    trialDaysLeft: TRIAL_DAYS,
    subscriptionType: "none",
  });

  useEffect(() => {
    // تهيئة خدمة الفوترة
    billingService.initialize().catch(console.error);

    // الاستماع لتفعيل الاشتراك
    const handleActivation = (event: CustomEvent) => {
      const type = event.detail as "monthly" | "yearly";
      setState(prev => ({ 
        ...prev, 
        isSubscribed: true,
        subscriptionType: type,
      }));
    };

    window.addEventListener("subscription-activated", handleActivation as EventListener);

    // حساب الفترة التجريبية
    let installDate = localStorage.getItem(INSTALLATION_KEY);
    
    if (!installDate) {
      installDate = new Date().toISOString();
      localStorage.setItem(INSTALLATION_KEY, installDate);
    }

    const install = new Date(installDate);
    const now = new Date();
    const daysSinceInstall = Math.floor((now.getTime() - install.getTime()) / (1000 * 60 * 60 * 24));
    const trialDaysLeft = Math.max(0, TRIAL_DAYS - daysSinceInstall);
    const isTrialActive = trialDaysLeft > 0;
    
    const subscription = localStorage.getItem(SUBSCRIPTION_KEY);
    const isSubscribed = subscription === "monthly" || subscription === "yearly";
    
    let subscriptionType: SubscriptionState["subscriptionType"] = "none";
    if (subscription === "monthly") subscriptionType = "monthly";
    else if (subscription === "yearly") subscriptionType = "yearly";
    else if (isTrialActive) subscriptionType = "trial";

    setState({
      isTrialActive,
      isSubscribed,
      installDate: install,
      trialDaysLeft,
      subscriptionType,
    });

    return () => {
      window.removeEventListener("subscription-activated", handleActivation as EventListener);
    };
  }, []);

  const hasAccess = useCallback((isPremium?: boolean): boolean => {
    if (!isPremium) return true;
    return state.isSubscribed || state.isTrialActive;
  }, [state.isSubscribed, state.isTrialActive]);

  // ⭐ هذه الدوال تستدعي Google Play Billing
  const subscribeMonthly = useCallback(async () => {
    try {
      await billingService.purchaseMonthly();
    } catch (error) {
      console.error("خطأ في الاشتراك الشهري:", error);
    }
  }, []);

  const subscribeYearly = useCallback(async () => {
    try {
      await billingService.purchaseYearly();
    } catch (error) {
      console.error("خطأ في الاشتراك السنوي:", error);
    }
  }, []);

  const restorePurchases = useCallback(async () => {
    try {
      await billingService.restorePurchases();
    } catch (error) {
      console.error("خطأ في استعادة المشتريات:", error);
    }
  }, []);

  const activateSubscription = useCallback((type: "monthly" | "yearly") => {
    localStorage.setItem(SUBSCRIPTION_KEY, type);
    setState(prev => ({ 
      ...prev, 
      isSubscribed: true,
      subscriptionType: type,
    }));
  }, []);

  const deactivateSubscription = useCallback(() => {
    localStorage.removeItem(SUBSCRIPTION_KEY);
    setState(prev => ({ 
      ...prev, 
      isSubscribed: false,
      subscriptionType: prev.isTrialActive ? "trial" : "none",
    }));
  }, []);

  return {
    ...state,
    hasAccess,
    subscribeMonthly,
    subscribeYearly,
    restorePurchases,
    activateSubscription,
    deactivateSubscription,
  };
};

export default useSubscription;
```

---

## 🏪 الخطوة 5: إعداد Google Play Console

### 5.1 إنشاء التطبيق
1. افتح [Google Play Console](https://play.google.com/console)
2. اضغط **Create app**
3. املأ البيانات:
   - **App name**: WellMama
   - **Default language**: العربية
   - **App or game**: App
   - **Free or paid**: Free

### 5.2 إنشاء منتجات الاشتراك
1. اذهب إلى **Monetize** → **Products** → **Subscriptions**
2. اضغط **Create subscription**

#### الاشتراك الشهري:
```
Product ID: monthly_premium
Name: الاشتراك الشهري
Description: وصول كامل لجميع أدوات الحمل المميزة
السعر: $1.99 / شهر
الفترة التجريبية: 3 أيام مجاناً
```

#### الاشتراك السنوي:
```
Product ID: yearly_premium
Name: الاشتراك السنوي
Description: وصول كامل لجميع أدوات الحمل المميزة - وفّر 41%
السعر: $14.00 / سنة
الفترة التجريبية: 3 أيام مجاناً
```

### 5.3 إعداد الاختبار
1. اذهب إلى **Setup** → **License testing**
2. أضف بريدك الإلكتروني كـ License tester
3. هذا يسمح لك باختبار الشراء بدون دفع حقيقي

---

## 📱 الخطوة 6: بناء ورفع التطبيق

### في Android Studio:

1. اضغط **Build** → **Generate Signed Bundle / APK**
2. اختر **Android App Bundle**
3. أنشئ **keystore** جديد (احفظه في مكان آمن!)
4. اضغط **Finish**

### رفع إلى Google Play:

1. في Google Play Console، اذهب إلى **Release** → **Production**
2. اضغط **Create new release**
3. ارفع ملف `.aab` من مجلد `android/app/release/`
4. أكمل معلومات الإصدار واضغط **Save**

---

## 🧪 الخطوة 7: الاختبار

### اختبار داخلي (موصى به أولاً):
1. اذهب إلى **Release** → **Testing** → **Internal testing**
2. أنشئ قائمة مختبرين وأضف بريدك
3. ارفع نسخة اختبارية
4. ثبّت التطبيق من رابط الاختبار
5. جرّب الشراء (لن يُخصم منك لأنك License tester)

---

## ✅ قائمة التحقق النهائية

- [ ] تم تصدير المشروع من Lovable إلى GitHub
- [ ] تم تثبيت Node.js و Android Studio
- [ ] تم تشغيل أوامر الإعداد
- [ ] تم إنشاء ملف `src/services/billing.ts`
- [ ] تم تحديث `src/hooks/useSubscription.ts`
- [ ] تم إنشاء منتجات الاشتراك في Google Play Console
- [ ] تم إضافة License testers
- [ ] تم بناء ملف AAB
- [ ] تم رفع التطبيق للاختبار الداخلي
- [ ] تم اختبار الشراء بنجاح

---

## ❓ الأسئلة الشائعة

### لماذا لا يظهر زر الشراء؟
- تأكد من أن المنتجات في Google Play Console بحالة **Active**
- تأكد من أن `Product ID` متطابق في الكود وGoogle Play

### لماذا يُخصم مني مبلغ حقيقي؟
- تأكد من إضافة بريدك كـ License tester

### كيف أختبر على جهازي؟
1. فعّل **USB Debugging** في الجهاز
2. وصّل الجهاز بالكمبيوتر
3. في Android Studio، اختر جهازك واضغط **Run**

---

## 📞 للمساعدة

- [توثيق Google Play Billing](https://developer.android.com/google/play/billing)
- [توثيق Capacitor](https://capacitorjs.com/docs)
- [cordova-plugin-purchase](https://github.com/nicklockwood/cordova-plugin-purchase)

---

**🎉 مبروك! تطبيقك جاهز الآن لكسب المال من الاشتراكات!**
