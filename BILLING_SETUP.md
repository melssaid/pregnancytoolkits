# 🚀 دليل إعداد Google Play Billing - خطوة بخطوة

## ✅ التحديث: الكود جاهز للاستخدام!

تم إنشاء جميع ملفات الكود اللازمة. الآن تحتاج فقط إلى إعداد Google Play Console ورفع التطبيق.

---

## 📦 الملفات المُنشأة تلقائياً

| الملف | الوصف |
|-------|-------|
| `src/services/billingService.ts` | خدمة Google Play Billing الكاملة |
| `src/hooks/useSubscription.ts` | Hook للتحكم بالاشتراكات |
| `src/components/SubscriptionModal.tsx` | واجهة الاشتراك بالعربية |
| `src/components/PaywallGate.tsx` | حماية المحتوى المدفوع |
| `src/lib/tools-data.ts` | تحديد الأدوات المجانية والمدفوعة |

---

## 🆓 الأدوات المجانية (13 أداة)

1. ✅ تذكير المواعيد الذكي
2. ✅ صور البطن
3. ✅ متتبع الفيتامينات
4. ✅ الأطعمة الممنوعة
5. ✅ متتبع الدورة
6. ✅ حاسبة موعد الولادة
7. ✅ عداد الركلات
8. ✅ سكري الحمل
9. ✅ تسمم الحمل
10. ✅ متتبع نوم الطفل
11. ✅ نمو الطفل
12. ✅ متتبع الحفاضات

## 👑 الأدوات المدفوعة (21 أداة)

جميع أدوات AI المتقدمة تتطلب اشتراك.

---

## 🏪 الخطوة 1: إنشاء حساب Google Play Console

1. افتح [Google Play Console](https://play.google.com/console)
2. ادفع رسوم التسجيل ($25 مرة واحدة)
3. أكمل التحقق من الهوية

---

## 📱 الخطوة 2: إنشاء التطبيق

1. اضغط **Create app**
2. املأ البيانات:
   - **App name**: Pregnancy Toolkits
   - **Default language**: العربية
   - **App or game**: App
   - **Free or paid**: Free (with in-app purchases)

---

## 💳 الخطوة 3: إنشاء منتجات الاشتراك

اذهب إلى **Monetize** → **Products** → **Subscriptions**

### الاشتراك الشهري:
```
Product ID: monthly_premium
Name: الاشتراك الشهري - Premium Monthly
Description: وصول كامل لجميع أدوات الحمل المميزة
السعر: $1.99 / شهر
الفترة التجريبية: 3 أيام مجاناً
```

### الاشتراك السنوي:
```
Product ID: yearly_premium  
Name: الاشتراك السنوي - Premium Yearly
Description: وصول كامل لجميع أدوات الحمل المميزة - وفّر 37%
السعر: $14.99 / سنة
الفترة التجريبية: 3 أيام مجاناً
```

⚠️ **مهم**: يجب أن تكون الـ Product IDs متطابقة تماماً مع الكود!

---

## 🧪 الخطوة 4: إعداد الاختبار

1. اذهب إلى **Setup** → **License testing**
2. أضف بريدك الإلكتروني كـ License tester
3. هذا يسمح لك باختبار الشراء بدون دفع حقيقي

---

## 💻 الخطوة 5: بناء التطبيق محلياً

```bash
# 1. استنساخ المشروع من GitHub
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

# 2. تثبيت المكتبات
npm install

# 3. تثبيت مكتبة الفوترة
npm install cordova-plugin-purchase
npm install @capgo/capacitor-purchases

# 4. إضافة منصة Android
npx cap add android

# 5. بناء المشروع
npm run build

# 6. مزامنة مع Android
npx cap sync android

# 7. فتح في Android Studio
npx cap open android
```

---

## 📦 الخطوة 6: إنشاء ملف AAB

في Android Studio:

1. اضغط **Build** → **Generate Signed Bundle / APK**
2. اختر **Android App Bundle**
3. أنشئ **keystore** جديد (احفظه في مكان آمن!)
4. اختر **release** وأكمل العملية

---

## 🚀 الخطوة 7: رفع التطبيق

### للاختبار الداخلي أولاً (موصى به):
1. في Google Play Console، اذهب إلى **Release** → **Testing** → **Internal testing**
2. أنشئ قائمة مختبرين وأضف بريدك
3. ارفع ملف `.aab`
4. انتظر الموافقة (عادة ساعات)
5. ثبّت التطبيق من رابط الاختبار

### للإنتاج:
1. اذهب إلى **Release** → **Production**
2. أكمل جميع المتطلبات (سياسة الخصوصية، لقطات الشاشة، إلخ)
3. ارفع ملف `.aab`
4. اضغط **Submit for review**

---

## ✅ قائمة التحقق النهائية

- [ ] إنشاء حساب Google Play Console
- [ ] إنشاء التطبيق في Console
- [ ] إنشاء منتج `monthly_premium`
- [ ] إنشاء منتج `yearly_premium`
- [ ] إضافة License testers
- [ ] استنساخ المشروع محلياً
- [ ] تثبيت cordova-plugin-purchase
- [ ] بناء ملف AAB
- [ ] رفع للاختبار الداخلي
- [ ] اختبار الشراء بنجاح
- [ ] رفع للإنتاج

---

## 💰 الأرباح المتوقعة

| الاشتراك | السعر | حصة Google (15%) | صافي الربح |
|----------|-------|------------------|------------|
| شهري | $1.99 | $0.30 | $1.69 |
| سنوي | $14.99 | $2.25 | $12.74 |

*ملاحظة: Google تأخذ 15% فقط للمطورين الصغار (أقل من مليون دولار سنوياً)*

---

## ❓ الأسئلة الشائعة

### لماذا لا يظهر زر الشراء؟
- تأكد من أن المنتجات في Google Play Console بحالة **Active**
- تأكد من أن `Product ID` متطابق: `monthly_premium` و `yearly_premium`

### لماذا يظهر خطأ عند الشراء؟
- تأكد من أنك License tester
- تأكد من أن التطبيق من الاختبار الداخلي (ليس من Android Studio مباشرة)

### كيف أختبر على جهازي الحقيقي؟
1. ارفع التطبيق للاختبار الداخلي
2. أضف بريدك كـ tester
3. ثبّت من رابط الاختبار
4. جرّب الشراء (لن يُخصم منك)

---

## 📞 للمساعدة

- [توثيق Google Play Billing](https://developer.android.com/google/play/billing)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [cordova-plugin-purchase](https://github.com/nicklockwood/cordova-plugin-purchase)

---

**🎉 مبروك! تطبيقك جاهز لكسب المال!**
