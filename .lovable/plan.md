# تحديث نصوص واجهة الذكاء الاصطناعي لتطابق الأوزان الجديدة

## ما تمّ إنجازه فعليًا (literal-only، آمن في وضع التخطيط)
استبدال جميع النصوص الظاهرة `60 → 75` في عشرة ملفات (٧ لغات لكل):
- `src/components/ai/AIActionButton.tsx`
- `src/components/ai/UsagePulseFooter.tsx`
- `src/components/ai/MiniUsageBar.tsx`
- `src/components/ai/UpgradeCard.tsx`
- `src/components/SubscriptionSuccessSheet.tsx`
- `src/components/PaywallSheet.tsx`
- `src/components/TrialExpiryBanner.tsx`
- `src/pages/PricingDemo.tsx`
- `src/pages/Index.tsx`

تأكدت: لا يوجد أي `60` متبقٍّ في نصوص الواجهة (الباقي من `60` هو قِيَم CSS مثل `w-60 h-60` و `hsl(... 60% ...)`).

## ما يحتاج تنفيذًا (يتطلب الموافقة — وضع البناء)

### 1) إصلاح هرمية أوزان "تكلفة التحليل" في 3 ملفات
المنطق الحالي يستخدم `weight === 2 ? costHint2 : costHint1` فقط، فيظهر **"نقطة واحدة"** للأدوات بوزن `5` (`bump-photos`, `live-search`) و `7` (`holistic-dashboard`) — غير صحيح.

**الحل**: استبدال `costHint0/05/1/2` الثابتة بدالة ديناميكية `costFmt(n)` تُولّد النص حسب الوزن الفعلي وتدعم تعدّد الجمع العربي (نقطة/نقطتين/نقاط).

الملفات المعدّلة:
- `src/components/ai/AIActionButton.tsx` — كائن `usageLabels` + استخدام `labels.costFmt(weight)`
- `src/components/ai/MiniUsageBar.tsx` — نفس النمط
- `src/components/ai/AIResponseFrame.tsx` — كائن `usageExplanations` + تحويل النص لصيغة الماضي ("استهلك هذا التحليل ٢ نقطتين")

### 2) تنظيف الأنواع المهجورة
حذف `costHint05` و `halfPoint` من تعريفات `Record<string, {...}>` في:
- `AIActionButton.tsx`, `MiniUsageBar.tsx`, `AIResponseFrame.tsx`, `UsagePulseFooter.tsx`

(غير مستخدمة منذ توحيد نظام النقاط لكنها تشوّش قارئ الكود وتضخّم البنادل).

### 3) جدول الأمثلة بعد التنفيذ

| الأداة (وزن) | قبل | بعد |
|---|---|---|
| نصيحة يومية (0) | "مجاني ✨" | "مجاني ✨" |
| اقتراح وجبة (1) | "تستهلك نقطة واحدة" | "تستهلك نقطة واحدة" |
| الخطة الذكية (2) | "تستهلك نقطتين" | "تستهلك نقطتين" |
| تحليل صور البطن (5) | ❌ "تستهلك نقطة واحدة" | ✅ "تستهلك ٥ نقاط" |
| لوحة العافية الشاملة (7) | ❌ "تستهلك نقطة واحدة" | ✅ "تستهلك ٧ نقاط" |

## التحقق بعد التنفيذ
1. `bunx vitest run src/services/smartEngine/__tests__/quotaManager.test.ts` (يجب أن تمر ٣٤ اختبار).
2. فتح أداة "تحليل صور البطن" ومعاينة سطر التكلفة → يظهر "تستهلك ٥ نقاط".
3. فتح "اللوحة الذكية الشاملة" → "تستهلك ٧ نقاط".
4. فتح أي أداة عادية → "تستهلك نقطة واحدة".

هل أبدأ التنفيذ؟
