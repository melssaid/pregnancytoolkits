# نظام السلامة السريرية — خطة التصميم والتنفيذ

## الوضع الحالي

يحتوي التطبيق على مكونات تحذيرية متفرقة وغير موحدة:

- `RiskAlertCard` — تنبيه بسيط في الداشبورد (ضغط مرتفع، ركلات قليلة)
- `LaborPhaseIndicator` — مؤشر مراحل المخاض في عداد الانقباضات
- `TrimesterAlert` — تنبيه ثلث الحمل في أداة اللياقة
- `InlineDisclaimer` / `MedicalInfoBar` — إخلاءات مسؤولية نصية صغيرة
- نصوص "متى تتصلين بالطبيب" مبعثرة داخل صفحات فردية (Kick Counter فقط)

**المشكلة**: لا يوجد نظام موحد للتحذيرات السياقية، ولا بطاقات تصعيد طوارئ، ولا أقسام "متى تتصلين بالطبيب" منتشرة عبر الأدوات الحساسة.

## الرؤية الجديدة — نظام سلامة سريري موحد

```text
3 مكونات أساسية قابلة لإعادة الاستخدام:

┌─ 1. ContextualWarningBanner ────────┐
│  ⚠ تنبيه سياقي                      │  ← شريط ناعم (amber/rose/blue)
│  "الانقباضات كل 5 دقائق.            │     يظهر تلقائياً حسب البيانات
│   قد يكون الوقت مناسباً للمستشفى"   │     3 مستويات: info / warning / urgent
│  [لون خلفية ناعم، ليس مخيفاً]       │
└─────────────────────────────────────┘

┌─ 2. WhenToCallDoctorCard ───────────┐
│  📋 متى تتصلين بطبيبتكِ             │  ← بطاقة تعليمية ثابتة
│                                      │     محتوى يختلف حسب الأداة
│  ✦ أقل من 10 حركات في ساعتين       │
│  ✦ نزيف مهبلي                       │     (Kick Counter / Contraction /
│  ✦ صداع شديد مع تغيرات بالرؤية     │      Symptoms / Preeclampsia)
│  ✦ تورم مفاجئ في الوجه أو اليدين   │
│                                      │
│  📞 في حالة الطوارئ: اتصلي          │  ← زر طوارئ (اختياري)
│     بخدمات الطوارئ فوراً             │
└─────────────────────────────────────┘

┌─ 3. EvidenceInfoBlock ──────────────┐
│  ℹ معلومة طبية                      │  ← كتلة معلومات بأسلوب تعليمي
│  "قاعدة 5-1-1: انقباضات كل 5        │     خلفية هادئة (blue/slate)
│   دقائق، مدة 1 دقيقة، لمدة ساعة"   │     مع مصدر اختياري
│  المصدر: ACOG                        │
└─────────────────────────────────────┘
```

## التفاصيل التقنية

### مكونات جديدة (`src/components/safety/`)

**1. `ContextualWarningBanner.tsx**`

- Props: `level` ('info' | 'warning' | 'urgent')، `message` (string)، `icon?`
- 3 ألوان: info=blue ناعم، warning=amber ناعم، urgent=rose ناعم (ليس أحمر صارخ)
- تصميم مطمئن: rounded-xl، أيقونات ناعمة (Shield/AlertCircle/Heart)، خطوط صغيرة
- Animation: fade-in هادئ بدون حركات مفزعة

**2. `WhenToCallDoctorCard.tsx**`

- Props: `context` ('kickCounter' | 'contraction' | 'symptoms' | 'preeclampsia' | 'general')
- يعرض قائمة أعراض تحذيرية مخصصة لكل أداة من ملفات الترجمة
- قسم طوارئ اختياري مع `showEmergency?: boolean`
- تصميم: بطاقة rounded-2xl بخلفية slate/5 وحدود slate/20، أيقونة Phone

**3. `EvidenceInfoBlock.tsx**`

- Props: `title`، `content`، `source?` (اختياري)
- كتلة معلومات تعليمية بأسلوب "حقيقة طبية"
- تصميم: bg-blue-50/50 مع حدود خفيفة، أيقونة BookOpen

### التكامل مع الأدوات الموجودة


| الأداة            | المكون المضاف                                                                          | السياق       |
| ----------------- | -------------------------------------------------------------------------------------- | ------------ |
| Kick Counter      | `WhenToCallDoctorCard` context="kickCounter" + `ContextualWarningBanner` عند <10 ركلات | أسفل الصفحة  |
| Contraction Timer | `EvidenceInfoBlock` لقاعدة 5-1-1 + `WhenToCallDoctorCard` context="contraction"        | أسفل المؤقت  |
| Wellness Diary    | `WhenToCallDoctorCard` context="symptoms"                                              | أسفل الإدخال |
| Preeclampsia      | `WhenToCallDoctorCard` context="preeclampsia"                                          | بعد النتيجة  |
| Maternal Health   | `EvidenceInfoBlock` + `WhenToCallDoctorCard` context="general"                         | أسفل الصفحة  |


### الترجمة

- مفاتيح `safety.whenToCall.{context}.items[]` و `safety.levels.{info|warning|urgent}` في الـ 7 لغات
- محتوى طبي دقيق مختلف لكل أداة

### مبادئ التصميم

- **مطمئن وليس مخيفاً**: ألوان ناعمة (amber-50, rose-50, blue-50) بدلاً من أحمر صارخ
- **تعليمي**: "متى تتصلين" وليس "خطر!"
- **سياقي**: كل أداة تعرض تحذيرات مختلفة ذات صلة
- **RTL كامل**: عبر logical properties

## خطوات التنفيذ

1. إنشاء 3 مكونات في `src/components/safety/`
2. إضافة مفاتيح الترجمة `safety.*` للغات السبع
3. دمج المكونات في 5 أدوات (Kick Counter، Contraction Timer، Wellness Diary، Preeclampsia، Maternal Health)
4. تحديث `RiskAlertCard` في الداشبورد ليستخدم `ContextualWarningBanner`
5. لابد من ربط البنود ببعضها يشكل احترافي 
6. مراعاة اللغات السبع وفحص المفاتيح
7. دمج المكونات بشكل احترافي ومنطقي ثم فحص كل شئ 