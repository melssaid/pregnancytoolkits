

## خطة إنشاء Google Play Billing Webhook Edge Function

### الهدف
إنشاء Edge Function تستقبل إشعارات Google Play (RTDN - Real-Time Developer Notifications) عبر Pub/Sub وتحدّث حالة الاشتراك في جدول `subscriptions` تلقائياً.

### المتطلبات المسبقة
يجب إضافة secret جديد: **`GOOGLE_PLAY_PACKAGE_NAME`** (اسم حزمة التطبيق مثل `com.yourapp.name`). يمكن أيضاً إضافة secret اختياري لتأمين الـ webhook بمفتاح سري.

### التغييرات المطلوبة

#### 1. إنشاء Edge Function: `google-play-webhook`
- **المسار**: `supabase/functions/google-play-webhook/index.ts`
- تستقبل POST requests من Google Cloud Pub/Sub
- تفك تشفير الـ `message.data` (Base64) لاستخراج بيانات الإشعار
- تعالج أنواع الإشعارات:
  - `SUBSCRIPTION_PURCHASED` → تحديث الاشتراك إلى active مع تعيين `subscription_type` (monthly/yearly) و`subscription_start/end`
  - `SUBSCRIPTION_RENEWED` → تمديد `subscription_end`
  - `SUBSCRIPTION_CANCELED` / `SUBSCRIPTION_EXPIRED` → تحديث `status` إلى `canceled`/`expired`
  - `SUBSCRIPTION_REVOKED` → إلغاء فوري
- تستخدم `service_role` key للتحديث (لأن RLS لا تسمح بالـ UPDATE من المستخدم)
- تتحقق من صحة الطلب عبر header سري (Webhook Secret)
- CORS headers مضمنة

#### 2. تحديث قاعدة البيانات (Migration)
- إضافة RLS policy للـ UPDATE على جدول `subscriptions` مقيّدة بـ `service_role` فقط (لتمكين الـ Edge Function من التحديث)

#### 3. تحديث `supabase/config.toml`
```toml
[functions.google-play-webhook]
verify_jwt = false
```

### الأمان
- التحقق من الطلبات عبر Webhook Secret Header
- استخدام `service_role` key فقط في الـ Edge Function (لا يُكشف للعميل)
- تسجيل كل عملية تحديث في الـ logs
- رفض أي طلب لا يحمل المفتاح السري الصحيح

### كيفية الربط مع Google Play Console
بعد النشر، ستحتاج إلى:
1. إعداد Cloud Pub/Sub topic في Google Cloud Console
2. إنشاء Push Subscription يشير إلى URL الـ Edge Function
3. ربط الـ topic في Google Play Console → Monetization → Monetization settings

