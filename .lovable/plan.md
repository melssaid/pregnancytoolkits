# تحسين بطاقات قسم "أحلم بطفل" بنفس تصميم أكاديمية الخصوبة

## الملفات المتأثرة

1. `src/pages/tools/NutritionSupplementsGuide.tsx`
2. `src/pages/tools/TWWCompanion.tsx`
3. `src/pages/tools/PreconceptionCheckup.tsx` (تحسينات طفيفة)

## التصميم المرجعي

سنستخدم نفس المكونات التي صُممت في `FertilityAcademy.tsx`:

- **AccordionItem**: بطاقات `rounded-2xl` مع شريط جانبي ملون، `backdrop-blur-sm`، `shadow-md` عند الفتح
- **NumberBadge**: دائرة متدرجة `w-7 h-7` مع رقم أبيض
- **ContentBlock**: أيقونة + خلفية متدرجة + `text-[13px] leading-[1.9]`
- **TipBlock**: أيقونة + حدود جانبية ملونة + `rounded-xl`
- **SectionHeader**: أيقونة + عداد + خط فاصل

---

### 1. NutritionSupplementsGuide.tsx — إعادة تصميم كاملة

**تبويب التغذية (Nutrition):**

- استبدال `Card` البسيطة بـ `AccordionItem` مع `NumberBadge` متدرج بلون أخضر `from-[hsl(160,45%,45%)] to-[hsl(140,40%,50%)]`
- تحويل وصف الطعام إلى `ContentBlock` مع أيقونة `Apple`/`Salad`
- تحويل قائمة الأطعمة إلى `TipBlock` بلون أخضر
- إضافة `SectionHeader` فوق كل تبويب مع عداد البطاقات

**تبويب المكملات (Supplements):**

- استبدال البطاقات بـ `AccordionItem` مع شارة `CheckCircle` بدل الرقم
- تحويل الوصف إلى `ContentBlock` مع أيقونة `Pill`
- تحويل الجرعة إلى `TipBlock` بلون برتقالي/ذهبي
- الإبقاء على عداد التقدم `checked/total` مع تصميم أجمل

### 2. TWWCompanion.tsx — ترقية البطاقات

- استبدال `Card` بنفس نمط `AccordionItem` مع `rounded-2xl`، شريط جانبي `border-l-3` بلون وردي/أحمر
- الإبقاء على `NumberBadge` الموجود (بالفعل دائري) لكن إضافة التدرج اللوني `from-destructive to-destructive/70`
- تحويل محتوى اليوم إلى `ContentBlock` مع أيقونة `Heart`
- تحويل النصيحة إلى `TipBlock` بلون `destructive` مع أيقونة `Smile`
- إضافة `SectionHeader` أعلى القائمة

### 3. PreconceptionCheckup.tsx — تحسينات طفيفة

- تحويل بطاقات الفحوصات الداخلية من `rounded-xl` إلى `rounded-2xl`
- إضافة `backdrop-blur-sm` للبطاقات المغلقة
- تحسين ترويسات الفئات بإضافة خط فاصل مشابه لـ `SectionHeader`

## التفاصيل التقنية

- إنشاء نفس المكونات المحلية (`AccordionItem`, `NumberBadge`, `ContentBlock`, `TipBlock`, `SectionHeader`) داخل كل ملف بنفس الأسلوب
- لا تغيير في مفاتيح الترجمة
- دعم RTL كامل مع تبديل `border-l` ↔ `border-r`
- ألوان مخصصة لكل أداة تتناسب مع هويتها
- الترجمات باللغات السبع لكل البطاقات والبنود الداخلية