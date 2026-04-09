

# خطة إصلاح المفاتيح المفقودة في ملفات الترجمة

## المشكلة
- **4,983 مشكلة إجمالية** في ملفات الترجمة حسب أداة الفحص
- **ar.json**: 5 مفاتيح مفقودة + 1 مفتاح إضافي
- **de/fr**: ~350 مفتاح مفقود + ~284 مفتاح إضافي لكل منهما
- **es/pt/tr**: ~657 مفتاح مفقود + ~584 مفتاح إضافي لكل منهما
- مفتاح `wellness-checks` في الكود لكن الملفات تحتوي `wellness-check` (بدون s)
- مفاتيح `fetalDevelopment` غير موجودة في أي ملف ترجمة
- مفاتيح المكونات الجديدة (streak, countdown, certificate, challenge, tour, aiFeedback, offline, rating, stageRec, faq) غير موجودة

## الإجراءات

### 1. إصلاح `wellness-check` → `wellness-checks`
إضافة مفتاح `wellness-checks` بجانب `wellness-check` في جميع الملفات السبعة

### 2. إضافة مفاتيح `fetalDevelopment` المفقودة
إضافة داخل `toolsInternal` في كل الملفات السبعة:
- `title`, `subtitle`, `sizeOf`, `yourCurrentWeek`, `setAsMyWeek`, `aiWeeklyInsights`
- `organs`: brain, heart, eyes, ears, hands, feet
- `development`, `nutrition`, `exercise`
- `units`: cm, g, mm
- `sizes` و `developments` و `tips` (المفاتيح الديناميكية — سيتم إضافة الشائعة منها)
- أسماء الثلاثات: `firstTrimester`, `secondTrimester`, `thirdTrimester`

### 3. إضافة مفاتيح المكونات الجديدة (~50 مفتاح)
في كل الملفات السبعة:
```
streak.days
countdown.daysLeft, countdown.title, countdown.weeks, countdown.days, countdown.dueDate, countdown.complete
certificate.title, certificate.subtitle, certificate.share, certificate.shareTitle, certificate.shareBody
challenge.daily
tour.step1Title, tour.step1Desc, tour.step2Title, tour.step2Desc, tour.step3Title, tour.step3Desc, tour.next, tour.start
aiFeedback.thankYou, aiFeedback.willImprove, aiFeedback.question, aiFeedback.yes, aiFeedback.no
offline.title, offline.localTools
rating.reviews, rating.rateUs
stageRec.suggested
faq.title
```

### 4. إصلاح المفاتيح المفقودة في ar.json
- إضافة `tools.smartAppointment.title/description`
- إضافة `tools.lactationPrep.title/description`
- إضافة `toolsInternal.mentalHealthCoach.screeningDisclaimer`
- حذف المفتاح الإضافي `questionnaireDisclaimer`

### 5. إضافة المفاتيح المشتركة المفقودة في de/fr/es/pt/tr
أبرز المفاتيح: `pricing.*`, `trialBanner.*`, `trialExpired.*`, `paywall.*`, `subscription.*` وغيرها (~350-657 مفتاح لكل لغة)

## الملفات المتأثرة

| الملف | التغيير |
|-------|---------|
| `src/locales/ar.json` | +60 مفتاح، إصلاح 5 مفقودة |
| `src/locales/en.json` | +50 مفتاح (fetalDevelopment + مكونات جديدة) |
| `src/locales/de.json` | +400 مفتاح |
| `src/locales/fr.json` | +400 مفتاح |
| `src/locales/es.json` | +700 مفتاح |
| `src/locales/pt.json` | +700 مفتاح |
| `src/locales/tr.json` | +700 مفتاح |

## ملاحظة مهمة
حجم العمل كبير جداً (~3,000+ مفتاح مفقود عبر 7 ملفات). سأبدأ بالأولوية القصوى:
1. **المفاتيح المرئية للمستخدم** (fetalDevelopment, المكونات الجديدة, wellness-checks) — تؤثر على التجربة مباشرة
2. **ar.json** كأولوية أولى (اللغة الرئيسية)
3. **en.json** كقاعدة أساسية
4. ثم باقي اللغات الخمس

