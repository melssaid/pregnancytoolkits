# خطة: ترقية تسعير الذكاء الاصطناعي + زر تحليل عداد الركلات

## 1. زر الذكاء الاصطناعي في عداد ركلات الجنين

المكوّن `src/components/kick-counter/AIMovementAnalysis.tsx` موجود بالفعل ومجهّز بـ `toolType: 'kick-analysis'` (وزن = 1 نقطة) لكنه **غير مستورَد في أي صفحة**.

- إضافته إلى `src/pages/tools/SmartKickCounter.tsx` تحت لوحة الإحصائيات.
- يستهلك نقطة واحدة (موجود مسبقًا في السجل، لا تغيير).
- يظهر فقط بعد تسجيل ≥3 جلسات (شرط داخلي بالفعل).

## 2. إلغاء "نصف نقطة" نهائيًا — توحيد كل أداة على نقطة كاملة

**التغييرات في الكود (`src/services/smartEngine/types.ts`):**

| المفتاح | الوزن الحالي | الوزن الجديد |
|---|---|---|
| meal-suggestion | 0.5 | **1** |
| sleep-analysis | 0.5 | **1** |
| sleep-meditation | 0.5 | **1** |
| sleep-routine | 0.5 | **1** |
| vitamin-advice | 0.5 | **1** |
| baby-cry-analysis | 0.5 | **1** |
| birth-position | 0.5 | **1** |
| partner-guide | 0.5 | **1** |
| nausea-relief | 0.5 | **1** |
| skincare-advice | 0.5 | **1** |
| craving-alternatives | 0.5 | **1** |
| grocery-list | 0.5 | **1** |

**ملاحظات تقنية مرافقة:**
- إزالة `0.5` من `InsightWeight` → `0 | 1 | 2 | 5 | 7`.
- تحديث تعليق `quotaManager.ts` السطر 8.
- تحديث الاختبار `src/services/smartEngine/__tests__/quotaManager.test.ts` (السطور 144–160) ليتحقق من 1 بدل 0.5.

**النصوص الظاهرة للمستخدم — حذف عبارات نصف نقطة:**
- `src/components/ai/UsagePulseFooter.tsx`: حذف `halfPoint` من قواميس اللغات السبع وحذف فرع `weight === 0.5` من منطق العرض.
- `src/components/ai/AIActionButton.tsx`: حذف `costHint05` من اللغات السبع.
- `src/components/ai/AIResponseFrame.tsx`: حذف `costHint05`.
- `src/components/ai/MiniUsageBar.tsx`: حذف `costHint05`.

النتيجة: أي تحليل ذكي → "تستهلك نقطة واحدة" / "1 point". بقية أرقام العداد (60 شهريًا، نقاط الكوبونات، الإنذارات) تبقى ثابتة كما هي.

## 3. تقييم تسويقي/برمجي لأوزان جميع أزرار الذكاء الاصطناعي

> الهدف: دفع المستخدم نحو الترقية المدفوعة (60 نقطة/شهر) عبر هندسة ندرة معتدلة — لا نخنقه فيهرب، ولا نعطيه فائضًا فيستغني.

### الفئة أ — أدوات يومية تخلق العادة (إبقاؤها رخيصة = استمرار التفاعل اليومي → يصل للحد بسرعة)

| الأداة | الوزن المقترح | المنطق التسويقي |
|---|---|---|
| daily-tips | **0** (يبقى) | الميزة الإدمانية المجانية — تثبيت العادة |
| meal-suggestion | **1** (مرفوع من 0.5) | استخدام يومي محتمل × 30 يوم = استنفاد سريع |
| vitamin-advice | **1** (مرفوع) | يومي → يدفع للترقية خلال أسبوعين |
| craving-alternatives | **1** (مرفوع) | عاطفي/متكرر |
| nausea-relief | **1** (مرفوع) | متكرر في الثلث الأول |
| skincare-advice | **1** (مرفوع) | متكرر |
| grocery-list | **1** (مرفوع) | أسبوعي على الأقل |
| baby-cry-analysis | **1** (مرفوع) | متعدد المرات يوميًا للأمهات الجدد |

### الفئة ب — أدوات تخطيط متوسطة (تبقى عند 1 — توازن جيد)

`pregnancy-assistant`, `weekly-summary`, `symptom-analysis`, `kick-analysis`, `birth-plan`, `hospital-bag`, `lactation-prep`, `mental-health`, `pregnancy-plan`, `baby-growth-analysis`, `weight-analysis`, `contraction-analysis`, `posture-coach`, `walking-coach`, `stretch-reminder`, `back-pain-relief`, `leg-cramp-preventer`, `smoothie-generator`, `labor-tracker`, `appointment-prep`, `postpartum-recovery`, `sleep-analysis`, `sleep-meditation`, `sleep-routine`, `birth-position`, `partner-guide`.

### الفئة ج — أدوات بريميوم (رفع مدروس لزيادة الإحساس بالقيمة)

| الأداة | الحالي | المقترح | لماذا |
|---|---|---|---|
| bump-photos | 5 | **5** (يبقى) | تحليل بصري ثقيل — السعر يعكس التكلفة |
| live-search (سونار) | 5 | **5** (يبقى) | بحث ويب فوري بمصادر — قيمة عالية واضحة |
| holistic-dashboard | 7 | **7** (يبقى) | تحليل شامل بـPro model — يستحق الـ7 |

### النتيجة المتوقعة

- متوسط مستخدم نشط حاليًا (مع 0.5): يستهلك ~25 تحليل في 60 نقطة → يكفيه شهرين.
- بعد التوحيد على 1: 60 تحليل = 60 نقطة → استنفاد شهري دقيق + لحظة "احتاج المزيد".
- مع رفع الأدوات اليومية إلى 1، المستخدم النشط (5 تحليلات/يوم) يستنفد رصيده المجاني بحلول اليوم 12 → نافذة شراء مثالية في منتصف الشهر.

### مقترحات تسويقية إضافية (لا تنفّذ في هذه الجولة — للنقاش)

1. **عداد رؤية ندرة** عند ≤10 نقاط متبقية: شريط إنذار ذهبي + CTA ترقية (الأساس موجود في `nearLimit`).
2. **خطة "Kick Counter Pro" مصغّرة**: تحليل عداد الركلات اليومي مجاني للمشتركين فقط — تحويل تلقائي.
3. **خصم نهاية الشهر** (للمستخدم الذي استنفد رصيده ولم يشترِ): كوبون 30% لمدة 48 ساعة.

## 4. الملفات المعدّلة

- `src/services/smartEngine/types.ts` — توحيد الأوزان + إزالة `0.5` من `InsightWeight`.
- `src/services/smartEngine/quotaManager.ts` — تحديث التعليق فقط.
- `src/services/smartEngine/__tests__/quotaManager.test.ts` — تحديث الاختبار.
- `src/components/ai/UsagePulseFooter.tsx` — إزالة `halfPoint`.
- `src/components/ai/AIActionButton.tsx` — إزالة `costHint05`.
- `src/components/ai/AIResponseFrame.tsx` — إزالة `costHint05`.
- `src/components/ai/MiniUsageBar.tsx` — إزالة `costHint05`.
- `src/pages/tools/SmartKickCounter.tsx` — استيراد ودمج `AIMovementAnalysis` تحت قسم الإحصائيات.

بعد موافقتك أنفّذ التعديلات دفعة واحدة.