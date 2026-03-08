

## الوضع الحالي — كل شيء جاهز تقريباً

### ما تم إنشاؤه بالفعل:

1. **Edge Function** (`supabase/functions/google-play-webhook/index.ts`) — موجودة وتعالج جميع أنواع إشعارات Google Play:
   - `SUBSCRIPTION_PURCHASED` → active
   - `SUBSCRIPTION_RENEWED/RECOVERED/RESTARTED` → تمديد
   - `SUBSCRIPTION_CANCELED` → canceled
   - `SUBSCRIPTION_EXPIRED` → expired
   - `SUBSCRIPTION_REVOKED` → revoked + إنهاء فوري
   - `ON_HOLD/GRACE_PERIOD/PAUSED` → on_hold

2. **RLS Policy** — سياسة "Service role can update subscriptions" مفعّلة على جدول `subscriptions`

3. **Config** — `verify_jwt = false` مضاف في `config.toml` (مطلوب لاستقبال طلبات خارجية)

### ما يحتاج إضافته:

| # | العنصر | التفاصيل |
|---|--------|----------|
| 1 | **Secret: `GOOGLE_PLAY_WEBHOOK_SECRET`** | مفتاح سري تختاره أنت (مثل سلسلة عشوائية 32+ حرف). يُرسل كـ header `x-webhook-secret` من Google Pub/Sub لتأمين الـ endpoint |

### خطوات ما بعد النشر (إعداد Google Cloud):
1. إنشاء Pub/Sub Topic في Google Cloud Console
2. إنشاء Push Subscription يشير إلى: `https://frlrngdogjzqpqpjhjvq.supabase.co/functions/v1/google-play-webhook`
3. إضافة header مخصص `x-webhook-secret` بنفس القيمة المخزنة في الـ secret
4. ربط الـ Topic في Google Play Console → Monetization Settings

### الخطة:
- إضافة الـ secret `GOOGLE_PLAY_WEBHOOK_SECRET` فقط — باقي المكونات جاهزة ولا تحتاج تعديل

