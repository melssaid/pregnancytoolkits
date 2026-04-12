# نظام القسائم الترويجية (Coupon System)

## ملخص

إنشاء نظام قسائم احترافي يمنح المستخدمين المجانيين وصولاً مؤقتاً لأدوات الذكاء الاصطناعي (يوم/أسبوع/شهر)، مع حماية ضد إعادة الاستخدام حتى بعد مسح بيانات التطبيق.

## التصميم العام

```text
┌─────────────────────┐
│  جدول coupons       │  ← أنت تنشئ القسائم (اسم + مدة + حد استخدام)
│  (Lovable Cloud DB) │
├─────────────────────┤
│  جدول coupon_claims │  ← يسجل كل استخدام (user_id + device_fingerprint)
│  (Lovable Cloud DB) │
└─────────────────────┘
         ↕
┌─────────────────────┐
│  Edge Function      │  ← التحقق + التفعيل
│  redeem-coupon      │
└─────────────────────┘
         ↕
┌─────────────────────┐
│  واجهة المستخدم     │  ← حقل إدخال القسيمة في الإعدادات
│  + quotaManager     │  ← تحديث الحصة تلقائياً
└─────────────────────┘
```

## الخطوات التقنية

### 1. جداول قاعدة البيانات (Migration)

**جدول `coupons**` — القسائم المتاحة:

- `id`, `code` (فريد، مثل "RAMADAN2026")، `duration_type` (day/week/month)، `max_claims` (الحد الأقصى للاستخدام)، `current_claims`، `is_active`، `expires_at`، `created_at`

**جدول `coupon_claims**` — سجل الاستخدام:

- `id`, `coupon_id`, `user_id`, `device_fingerprint` (بصمة الجهاز)، `activated_at`, `expires_at`

**سياسات RLS:**

- `coupons`: قراءة عامة فقط (لا تعديل/حذف من العميل)
- `coupon_claims`: المستخدم يرى سجلاته فقط، الإدخال عبر Edge Function فقط

### 2. Edge Function: `redeem-coupon`

- يستقبل `{ code, device_fingerprint }`
- يتحقق: القسيمة موجودة + نشطة + لم تنتهِ + لم يتجاوز الحد
- يتحقق: الجهاز لم يستخدم هذه القسيمة من قبل (عبر `device_fingerprint`)
- يتحقق: المستخدم لم يستخدم هذه القسيمة من قبل (عبر `user_id`)
- ينشئ سجل في `coupon_claims` مع تاريخ الانتهاء المحسوب
- يُرجع `{ success, expires_at, duration_type }`

### 3. بصمة الجهاز (Device Fingerprint)

لمنع إعادة الاستخدام حتى بعد مسح البيانات:

- توليد بصمة من: `navigator.userAgent + screen.width + screen.height + navigator.hardwareConcurrency + navigator.language + timezone`
- تُخزن مع كل استخدام في الخادم

### 4. تكامل مع نظام الحصص (Quota Integration)

**في `quotaManager.ts`:**

- إضافة دالة `applyCoupon(expiresAt)` تضبط الـ tier مؤقتاً إلى `premium`
- إضافة فحص `checkActiveCoupon()` يتحقق من وجود قسيمة نشطة عند كل تحميل

**في `AIUsageContext.tsx`:**

- عند التحميل، يفحص `coupon_claims` للمستخدم الحالي
- إذا وُجدت قسيمة نشطة (expires_at > now) → يضبط الحصة على 60 نقطة

**في `AIActionButton.tsx`:**

- لا تغيير مطلوب — يتبع تلقائياً الـ tier الحالي

### 5. واجهة المستخدم

**في صفحة الإعدادات (`Settings.tsx`):**

- إضافة قسم "استخدام قسيمة" مع حقل إدخال وزر تفعيل
- عند النجاح: عرض رسالة + مدة الصلاحية المتبقية
- عند الفشل: رسالة خطأ واضحة (قسيمة غير صالحة / مستخدمة سابقاً)

**شريط القسيمة النشطة:**

- مكون صغير يظهر أسفل صندوق premiumيوضح "قسيمة نشطة — تنتهي خلال X"

### 6. الأمان

- التحقق يتم بالكامل على الخادم (Edge Function) — لا يمكن التلاعب
- بصمة الجهاز + user_id = حماية مزدوجة
- القسيمة لا تُفعّل إلا مرة واحدة لكل جهاز حتى مع حسابات مختلفة
- `max_claims` يحد العدد الإجمالي للاستخدامات

### 7. فحص الجودة النهائي

بعد التنفيذ سيتم:

- اختبار Edge Function مباشرة عبر curl
- فحص RLS policies
- التحقق من عمل البصمة ومنع التكرار
- تقديم تقرير شامل بالنتائج

## الملفات المتأثرة


| ملف                                         | تغيير                   |
| ------------------------------------------- | ----------------------- |
| `supabase/migrations/`                      | جدولان جديدان + RLS     |
| `supabase/functions/redeem-coupon/index.ts` | Edge Function جديدة     |
| `src/services/smartEngine/quotaManager.ts`  | دعم القسائم             |
| `src/contexts/AIUsageContext.tsx`           | فحص القسيمة عند التحميل |
| `src/pages/Settings.tsx`                    | واجهة إدخال القسيمة     |
| `src/lib/deviceFingerprint.ts`              | ملف جديد لبصمة الجهاز   |
| `src/hooks/useActiveCoupon.ts`              | hook جديد لحالة القسيمة |
