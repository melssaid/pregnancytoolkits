

## المشاكل المكتشفة بعد مراجعة شاملة

### المشكلة 1: الأيقونات (تم حلها)
تم إنشاء ملفات الأيقونات في `public/icons/`. يجب نشر الموقع أولاً قبل إعادة تشغيل البناء حتى تكون متاحة على `pregnancytoolkits.lovable.app`.

### المشكلة 2: ملف `assetlinks.json` غير موجود (حرج)
مجلد `public/.well-known/` **فارغ تماماً**. بدون `assetlinks.json`، سيظهر شريط العنوان في التطبيق (لن يعمل كـ TWA حقيقي). هذا الملف ضروري لإثبات ملكية الدومين.

**المطلوب:** إنشاء `public/.well-known/assetlinks.json` بالمحتوى:
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.pregnancytoolkits.app",
    "sha256_cert_fingerprints": ["__FINGERPRINT__"]
  }
}]
```
> الـ fingerprint سيُعرف بعد أول بناء ناجح من logs الـ keystore.

### المشكلة 3: `_redirects` لا يخدم `.well-known`
ملف `public/_redirects` لا يحتوي على قاعدة لمجلد `.well-known`. بدون ذلك، SPA catch-all (`/* → /index.html`) سيعترض الطلب ولن يصل الملف.

**المطلوب:** إضافة سطر:
```
/.well-known/*  /.well-known/:splat  200
```

### المشكلة 4: `fingerprints` فارغ في `twa-manifest.json`
السطر `"fingerprints": []` يعني أن Bubblewrap لن يضيف أي fingerprint تلقائياً. هذا مقبول للبناء الأول، لكن يجب تحديثه لاحقاً.

### المشكلة 5: `bubblewrap update` بدون مشروع سابق
أمر `update` مصمم لتحديث مشروع Android موجود. في CI نظيف (بدون ملفات gradle محفوظة)، قد يعمل لأن Bubblewrap 1.24 يتعامل مع هذه الحالة، لكن هذا هو أكبر خطر. إذا فشل بعد حل مشكلة الأيقونات، سنحتاج لحفظ ملفات المشروع المُولّدة كـ artifact أو استخدام `init` بطريقة أخرى.

---

## خطة التنفيذ

### الخطوة 1: إنشاء `public/.well-known/assetlinks.json`
ملف placeholder بـ fingerprint مؤقت (يُحدّث بعد أول بناء).

### الخطوة 2: تحديث `public/_redirects`
إضافة قاعدة `.well-known` قبل الـ catch-all.

### الخطوة 3: التأكد من نشر الموقع
الأيقونات و `assetlinks.json` يجب أن تكون متاحة على الدومين قبل تشغيل البناء.

### الخطوة 4: إعادة تشغيل البناء
إذا نجح → استخراج SHA-256 fingerprint من logs → تحديث `assetlinks.json` و `twa-manifest.json`.

