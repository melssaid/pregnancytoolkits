# تقرير التدقيق الشامل وخطة التحسين

---

## 1. الإشعارات (Push Notifications)

### الوضع الحالي

- خطوة الإشعارات (Step 6) مدمجة بنجاح في الأونبوردنغ — جيد
- Edge Function `send-push-notification` تعمل بدون أي مصادقة (JWT) — **ثغرة أمنية خطيرة**
- لا يوجد تحديد معدل (Rate Limit) على إرسال الإشعارات — أي شخص يمكنه إرسال إشعارات لجميع المشتركين
- السجلات (logs) محفوظة في localStorage فقط — تُفقد عند تبديل الجهاز

### المطلوب (أولوية عالية)

1. **حماية Edge Function بـ JWT + قائمة Admin**: إضافة التحقق من `Authorization` header و`ADMIN_USER_IDS` في `send-push-notification` (نفس نمط `ai-usage-stats`)
2. **إضافة جدول `notification_logs**` في قاعدة البيانات بدل localStorage لتتبع الإشعارات المرسلة
3. **إضافة تحديد معدل**: منع إرسال أكثر من 3 إشعارات يومياً عبر الـ Edge Function
4. **إشعارات المناسبات**: إضافة حقل `scheduled_at` اختياري + وظيفة Cron لإرسال مجدول

### ممنوعات

- ❌ لا ترسل إشعارات أكثر من 2-3 شهرياً للحملات التسويقية
- ❌ لا تستخدم عناوين مبالغ فيها أو clickbait
- ❌ لا ترسل إشعارات بدون خيار واضح لإلغاء الاشتراك

---

## 2. Google Play Billing

### الوضع الحالي — جيد بشكل عام

- Digital Goods API مع retry logic وdiagnostics — ممتاز
- `acknowledge` بنوع `repeatable` — صحيح
- Optimistic caching — جيد لتجربة المستخدم
- Server-side activation عبر Edge Function محمية بـ JWT — جيد

### مشاكل يجب إصلاحها

1. **Anonymous Sign-In في `activateOnServer**` (سطر 593): يستخدم `signInAnonymously()` — يخالف قواعد المشروع. يجب أن يكون المستخدم مسجلاً مسبقاً عبر الأونبوردنغ
2. **تعليق في الكود** (سطر 644): يقول "40 credits" بينما الحصة الفعلية 60 — تعليق مضلل.. قم بإصلاحها لانها ٦٠ بالفعل
3. **رسائل خطأ مختلطة**: بعضها عربي وبعضها إنجليزي — يجب توحيدها عبر `i18n`
4. **لا يوجد Google Play RTDN verification حقيقي**: الـ webhook موجود لكن يجب التحقق أنه يعالج أحداث `SUBSCRIPTION_CANCELED` و`SUBSCRIPTION_EXPIRED` لتحديث قاعدة البيانات

### ممنوعات

- ❌ لا تعرض أسعاراً ثابتة (hardcoded) — دائماً استخدم `getProductDetails`
- ❌ لا تعتمد على localStorage فقط لحالة الاشتراك — تحقق من الخادم

---

## 3. ASO والمتجر

### ما هو جيد

- وجود نظام ASO متكامل (`/admin/aso-generator`) — ممتاز
- 240+ كلمة مفتاحية مصنفة
- الالتزام ببراندينغ "Wellness/Lifestyle"

### تحسينات مقترحة

لا تعديلات برمجية مطلوبة — هذه تعديلات على Google Play Console:

لكن كيف اقوم بها 