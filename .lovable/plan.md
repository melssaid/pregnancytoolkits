

## خطة تطبيق خط IBM Plex Arabic للعناوين العربية

### الهدف
استبدال خط العناوين العربية في الصفحة الرئيسية بخط **IBM Plex Arabic** مع إبقاء Tajawal للنصوص الصغيرة والأوصاف.

### التغييرات المطلوبة

**1. تحميل الخط — `index.html`**
- إضافة رابط Google Fonts لـ IBM Plex Sans Arabic (أوزان 600, 700)

**2. تعريف CSS — `src/index.css`**
- إضافة CSS class مخصص `.ar-heading` يطبق `font-family: 'IBM Plex Sans Arabic'` فقط عندما يكون `html[lang="ar"]`

**3. تطبيق على العناوين — `src/pages/Index.tsx`**
- إضافة class `ar-heading` على عناوين الأقسام الثلاثة (Journey headers — `h2`)
- إضافة class `ar-heading` على عناوين الأدوات (`h3` في ToolRow)
- لا تغيير على الأوصاف أو النصوص الصغيرة (تبقى Tajawal)

### ملاحظات تقنية
- IBM Plex Sans Arabic متوفر مجاناً عبر Google Fonts
- التطبيق يستخدم `lang="ar"` على `<html>` مما يسهل الاستهداف عبر CSS
- لا تأثير على اللغات الأخرى — الخط يُطبق فقط في وضع العربية

