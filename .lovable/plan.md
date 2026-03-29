
# خطة إصلاح الترجمات الطبية المفقودة والخاطئة

## المشاكل المكتشفة

### 1. نصوص إنجليزية خام في 6 ملفات لغة (AR, DE, TR, FR, ES, PT)

**قسم `preconceptionCheckup` — ~30 مفتاح لكل لغة:**
- `ai.title/analyze/readinessTitle/priorityTitle/tipsTitle/timelineTitle` — 6 مفاتيح إنجليزية
- `categories.essential/screening/specialized/medications` — 4 مفاتيح إنجليزية
- `checks` — 12 فحص × (title + description) = **24 مفتاح إنجليزي** (generalCheckup, bloodWork, pap, thyroid, rubella, hepatitis, hiv, dental, geneticScreening, mentalHealth, medications, vaccinations)

**قسم `preconceptionNutrition.categories` — ~30 مفتاح لكل لغة:**
- 10 فئات × (title + description + foods) = **30 مفتاح إنجليزي** (folateRich, ironSources, omega3, antioxidants, zinc, vitaminD, calcium, protein, hydration, avoidList)

**قسم `prenatalVitamins.vitamins` — ~36 مفتاح لكل لغة:**
- 12 فيتامين × (title + description + dosage) = **36 مفتاح إنجليزي**

**قسم `preeclampsia` في FR فقط — ~12 مفتاح:**
- `highRiskFactors, moderateRiskFactors, firstPregnancy, previousPreeclampsia, chronicHypertension, kidneyDisease, obesity, age35Plus, multiplePregnancy, familyHistory, calculateRisk` — كلها إنجليزية

**قسم `gestationalDiabetes` في FR فقط — ~8 مفاتيح:**
- `age35Plus, overweight, familyHistory, previousGDM, previousLargeBaby, pcos, calculateRisk, prevention, aiGuidance` — كلها إنجليزية

### 2. ترجمات ألمانية خاطئة (مجال مختلف)
- `"Vorurteilsvolle Ernährung"` = "تغذية متحيزة" — يجب أن تكون `"Ernährung und Nahrungsergänzungsmittel vor der Empfängnis"` (تغذية ما قبل الحمل)
- `"Vorführungen verfolgt"` = "عروض تقديمية مُتتبعة" — يجب أن تكون `"Untersuchungen verfolgt"` (فحوصات مُتتبعة)

### 3. المجموع التقريبي: ~540 ترجمة طبية مفقودة + إصلاحات جودة

## خطة التنفيذ

### الملفات المتأثرة: 6 ملفات لغة
`ar.json`, `de.json`, `tr.json`, `fr.json`, `es.json`, `pt.json`

### التغييرات لكل ملف:

**1. ترجمة `preconceptionCheckup.ai` (6 مفاتيح × 6 لغات)**
- عناوين AI مثل "رؤى التحضير"، "تحليل استعدادي"، إلخ.

**2. ترجمة `preconceptionCheckup.categories` (4 مفاتيح × 6 لغات)**
- أسماء الفئات الطبية: "الفحوصات الأساسية"، "فحوصات العدوى والمناعة"، إلخ.

**3. ترجمة `preconceptionCheckup.checks` (24 مفتاح × 6 لغات)**
- أسماء الفحوصات الطبية مع أوصافها: "فحص الغدة الدرقية TSH"، "فحص التهاب الكبد"، إلخ.
- يجب استخدام المصطلحات الطبية المعتمدة في كل لغة

**4. ترجمة `preconceptionNutrition.categories` (30 مفتاح × 6 لغات)**
- فئات التغذية: "أطعمة غنية بالفولات"، "مصادر الحديد"، "أوميغا-3"، إلخ.

**5. ترجمة `prenatalVitamins.vitamins` (36 مفتاح × 6 لغات)**
- أسماء المكملات والجرعات: "حمض الفوليك"، "الحديد"، "فيتامين د"، إلخ.

**6. إصلاح `preeclampsia` + `gestationalDiabetes` في FR**
- ترجمة ~20 مفتاح فرنسي متبقي

**7. إصلاح ترجمات ألمانية خاطئة**
- `Vorurteilsvolle` → مصطلح طبي صحيح
- `Vorführungen` → `Untersuchungen`

### ضوابط الجودة الطبية:
- استخدام المصطلحات الطبية الرسمية المعتمدة (مثل: Gestationsdiabetes بالألمانية، diabète gestationnel بالفرنسية)
- الحفاظ على الاختصارات الطبية العالمية (TSH, CBC, HIV, PCOS, BMI, IOM, WHO)
- عدم ترجمة أسماء الأدوية أو الاختصارات المعروفة عالمياً
