

## الخطة: تدرج وردي + خط Almarai

### التغييرات المطلوبة

**1. إضافة خط Almarai (من Google Fonts)**
- إضافة رابط Google Fonts في `index.html` لخط Almarai بأوزان 400 و 700
- تحديث `tailwind.config.ts` لإضافة Almarai كخط عربي

**2. تحديث FooterCard في `src/pages/Index.tsx`**
- إضافة تدرج وردي خفيف من الجانب الأيسر (start) للصندوق الرئيسي:
  ```
  bg-gradient-to-r from-primary/8 via-card to-card
  ```
  (في RTL سيكون التدرج من اليمين تلقائياً بفضل CSS الموجود)
- تطبيق خط Almarai على جميع النصوص داخل FooterCard بدلاً من Tajawal
- تحسين أسلوب الكتابة: جعل النصوص أكثر احترافية ووضوحاً

**3. تحديث `src/index.css`**
- إضافة Almarai كخيار في font-family للنسخة العربية حيث مناسب

### الملفات المتأثرة
- `index.html` — إضافة رابط Google Fonts
- `src/pages/Index.tsx` — تدرج وردي + خط Almarai في FooterCard
- `src/index.css` — تحديث font stack (اختياري)

