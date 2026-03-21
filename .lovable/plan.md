

## خطة إصلاح مفاتيح الترجمة والنصوص العربية المتسربة

### المشكلة
174 موضع في 9 ملفات تستخدم `t('key', 'نص عربي كفولباك')` — عند عدم وجود المفتاح في ملفات اللغة الأخرى، يظهر النص العربي بدلاً من لغة المستخدم. أيضاً دائرة نقاط الحركة في عداد الركلات غير منسقة (النص يتكسر).

### الملفات المتأثرة والتغييرات

#### 1. إضافة المفاتيح المفقودة لجميع اللغات السبع (7 ملفات JSON)
إضافة المفاتيح التالية لكل لغة:

**kickCounter** (مفقودة في كل اللغات):
- `toolsInternal.kickCounter.aiAnalysisTitle`
- `toolsInternal.kickCounter.aiAnalysisButton`

**evidence blocks** (مفقودة في en, fr, de, tr, es, pt):
- `preeclampsiaRisk.evidence.*` + `evidence2.*`
- `gdm.evidence.*` + `evidence2.*`
- `symptomAnalyzer.evidence.*` + `evidence2.*`

**settings** (مفقودة):
- `settings.deleteAccount.title/description`
- `settings.aiReset.title/status/success/button`

**paywall** (مفقودة):
- `paywall.title/subtitle/trialDesc/startTrial/subscribeButton/maybeLater`

**AI components** (مفقودة):
- `aiUsage.subscribePro`
- `toolsInternal.babyGrowth.monthUnit`

#### 2. إصلاح الفولباك في الملفات TSX (9 ملفات)
تغيير كل `t('key', 'نص عربي')` إلى `t('key')` فقط — بدون فولباك عربي — لأن النص الصحيح سيكون موجود في ملفات اللغة.

**الملفات**:
- `src/pages/tools/SmartKickCounter.tsx`
- `src/pages/tools/PreeclampsiaRisk.tsx`
- `src/pages/tools/GestationalDiabetes.tsx`
- `src/pages/tools/AISymptomAnalyzer.tsx`
- `src/pages/tools/BabyGrowth.tsx`
- `src/pages/tools/SmartWeightGainAnalyzer.tsx`
- `src/pages/Settings.tsx`
- `src/components/PaywallSheet.tsx`
- `src/components/ai/AIResponseFrame.tsx`

#### 3. إصلاح تنسيق دائرة نقاط الحركة
في `KickPatternVisualizer.tsx`: إضافة `flex-shrink-0` للدائرة و `min-w-0 overflow-hidden` للنصوص لمنع التكسر على الشاشات الصغيرة.

### ملفات الترجمة المعدّلة
- `src/locales/en.json`
- `src/locales/fr.json`
- `src/locales/ar.json`
- `src/locales/de.json`
- `src/locales/tr.json`
- `src/locales/es.json`
- `src/locales/pt.json`

### الملخص
- ~174 فولباك عربي → مفاتيح ترجمة صحيحة
- 7 ملفات لغة تحتاج مفاتيح جديدة
- 9 ملفات TSX تحتاج إزالة الفولباك العربي
- إصلاح تنسيق دائرة الحركة للشاشات الصغيرة

