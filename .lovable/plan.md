## إجابة سؤال التكلفة

بخصوص سؤالك عن 20,000 مشترك يومياً: **نعم، هناك تكلفة**. كل طلب AI يستهلك رصيد من Lovable AI (المبني على Gemini/GPT). Lovable Cloud يقدم حصة مجانية محدودة ثم يتحول لتسعير حسب الاستخدام. مع 20K مستخدم × 15-60 طلب = 300K-1.2M طلب يومي، ستكون التكلفة كبيرة. لذلك تقييد غير المشتركين مهم جداً لتقليل التكلفة.

---

## خطة التنفيذ

### 1. تحديث Edge Function — حدود مختلفة حسب الاشتراك

**ملف:** `supabase/functions/pregnancy-ai-perplexity/index.ts`

- إضافة ثابتين: `FREE_DAILY_LIMIT = 05` و `PREMIUM_DAILY_LIMIT = 30`
- بعد استخراج `userId`، التحقق من جدول `subscriptions` لمعرفة هل المستخدم مشترك (status=active, subscription_type≠trial أو trial_end > now)
- تطبيق الحد المناسب (05 أو 30) بدلاً من الحد الثابت 30
- إرسال header جديد `X-Daily-Limit` بالقيمة الصحيحة حسب نوع الاشتراك
- إضافة header `X-Subscription-Tier` (free/trial/premium) للعميل

### 2. تحديث Hook العميل — مزامنة الحد الديناميكي

**ملف:** `src/hooks/useAIUsageLimit.ts`

- جعل `limit` ديناميكي بدلاً من ثابت 30
- إضافة `syncLimit` لتحديث الحد من header `X-Daily-Limit`
- إضافة حالة `isNearLimit` (عندما يتبقى 05 طلبات أو أقل)

### 3. تحديث `usePregnancyAI` — مزامنة الحد

**ملف:** `src/hooks/usePregnancyAI.ts`

- قراءة `X-Daily-Limit` من الاستجابة ومزامنته مع `useAIUsageLimit`

### 4. إضافة شريط تنبيه الاقتراب من الحد

**ملف جديد:** `src/components/ai/AIUsageWarning.tsx`

- مكون يظهر تلقائياً عندما يتبقى ≤05 طلبات
- يعرض: "متبقي لك X طلبات اليوم" مع شريط تقدم
- للمستخدم المجاني: يعرض رسالة ترقية "اشترك للحصول على 30 طلب يومياً"
- يُدمج في `AIResponseFrame` ليظهر فوق كل نتيجة AI

### 5. إضافة إيماءة الاستخدام المتاح تحت كل أداة AI

**ملف:** `src/components/ToolFrame.tsx` أو `src/components/ai/AIResponseFrame.tsx`

- إضافة نص صغير أسفل كل أداة AI: "متبقي X/30 طلب يومي" (أو X/05 لغير المشتركين)
- بتصميم خفيف (text-xs, text-muted-foreground)

### 6. إضافة الترجمات

**ملف:** `src/locales/ar.json` + باقي اللغات

مفاتيح جديدة:

- `aiUsage.remaining` — "متبقي {{remaining}} من {{limit}} طلب يومي"
- `aiUsage.nearLimit` — "أنت على وشك الوصول للحد اليومي"
- `aiUsage.upgradeHint` — "اشترك في Pro للحصول على 30 طلب يومياً"
- `aiUsage.limitReachedFree` — "وصلت للحد اليومي (05 طلب). اشترك للحصول على المزيد"

### ملخص الحدود

```text
┌──────────────┬────────────┐
│ نوع المستخدم │ الحد اليومي │
├──────────────┼────────────┤
│ مجاني/تجريبي │     05     │
│ مشترك Pro    │     30     │
└──────────────┴────────────┘
```