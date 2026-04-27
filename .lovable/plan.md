# تنفيذ التوصية ١ + التوصية ٤

## الهدف التسويقي
- **التوصية ١**: تفعيل وزن `2 نقاط` لثماني أدوات عالية القيمة → استنزاف أسرع للنقاط المجانية → ضغط تحويل أعلى نحو البريميوم.
- **التوصية ٤**: إعادة معايرة الحصص (مجاني 10→8، بريميوم 60→75) → تضييق المجاني + تعزيز قيمة البريميوم لتبرير السعر.

## التغييرات التفصيلية

### 1) `src/services/smartEngine/types.ts`
- ترقية الأوزان في `TOOL_WEIGHT_REGISTRY` (من 1 إلى 2) للأدوات الثماني التالية:
  - `pregnancy-plan` (الخطة الذكية الشاملة)
  - `weekly-summary` (الملخص الأسبوعي)
  - `kick-analysis` (تحليل ركلات الجنين العميق)
  - `contraction-analysis` (تحليل الانقباضات)
  - `weight-analysis` (تحليل اتجاه الوزن)
  - `mental-health` (الصحة النفسية)
  - `birth-plan` (خطة الولادة)
  - `postpartum-recovery` (تعافي ما بعد الولادة)
- تحديث `QUOTA_TIERS`:
  - `free.monthly`: `10 → 8`
  - `premium.monthly`: `60 → 75`

### 2) ملفات الترجمة (٧ لغات: ar, en, de, fr, es, pt, tr)
استبدال كل ظهور للرقم `60` (في سياق التحليلات الشهرية) بـ `75` في:
- `subscription.feature2`, `subscription.premiumBenefit`, `subscription.upgrade`, `subscription.nearLimit`
- `pricing.allAIFeatures`, `pricing.unlimitedAI`, `pricing.trialDesc`, `pricing.dailyAnalyses`
- `usage.postAnalysisHint`
- أي مفتاح آخر يذكر "60 تحليل/analyses/análises/Analysen/analyses/análisis"

(الرقم `10` في النصوص الحرة لا يخص الحصة المجانية ولا يتم تعديله — الحصة المجانية يتم عرضها ديناميكياً من `QUOTA_TIERS`.)

### 3) ملفات الاختبارات
- تحديث `src/services/smartEngine/__tests__/quotaManager.test.ts`:
  - السماح بوزن `2` ضمن الأوزان المقبولة.
  - إضافة assertion: الأدوات الثماني الجديدة تعيد وزن `2`.
  - تحديث أي اختبار يفترض `free.monthly === 10` أو `premium.monthly === 60`.

### 4) واجهة المستخدم — التحقق فقط
- `UsagePulseFooter.tsx`, `MiniUsageBar.tsx`, `AIActionButton.tsx`, `AIResponseFrame.tsx`: تستخدم بالفعل `resolveWeight()` ديناميكياً، فستعرض "نقطتان" تلقائياً للأدوات المرقّاة. لا حاجة لتعديل.
- `UpgradeCard` و `TrialExpiryBanner`: يقرآن من `QUOTA_TIERS` ديناميكياً → يعكسان 75 تلقائياً.

## المخاطر والحدود
- المستخدم البريميوم الحالي يحصل على **+15 نقطة** الشهر القادم (تعزيز ولاء، لا انخفاض).
- المستخدم المجاني يفقد نقطتين (10→8) — مقصود لتسريع التحويل، ومتوافق مع توجّهك التسويقي.
- لا تغيير على `bump-photos` (5) أو `live-search` (5) أو `holistic-dashboard` (7) — تحافظ على هويتها كأدوات بريميوم نخبوية.
- لا تأثير على عداد ركلات الجنين كأداة قاعدية (التحليل القاعدي يبقى مجانياً — فقط زر التحليل العميق `AIMovementAnalysis` يصبح نقطتين).

## التحقق بعد التنفيذ
1. تشغيل اختبارات `quotaManager.test.ts`.
2. فتح أداة "الخطة الذكية" والتأكد من عرض **"نقطتان"** قبل الإرسال.
3. فتح صفحة البريميوم (`/pricing-demo`) والتأكد من ظهور **"75 تحليل شهرياً"** في كل اللغات السبع.
4. التأكد من شريط الاستخدام يعرض `0/8` للمستخدم المجاني الجديد.

هل أبدأ التنفيذ؟
