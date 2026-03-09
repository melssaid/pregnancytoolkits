## خطة تسريع التحميل وإزالة الشاشة الخضراء

### المشكلة

الشاشة الخضراء (splash screen) في `index.html` تبقى ظاهرة لفترة طويلة أثناء تحميل الـ JS chunks، مما يعطي انطباعاً بالبطء.

### الحل — 3 تغييرات

#### 1. إزالة الشاشة الخضراء والغاء السبلاش

- تقليل مدة الـ fade-out transition

#### 2. Eager-load الصفحة الرئيسية (Index)

- في `AnimatedRoutes.tsx`: تحويل `Index` من `lazy()` إلى import عادي (eager) لأنها أول صفحة يراها المستخدم دائماً

- استخدام single `requestAnimationFrame` بدل double
- تقليل fallback timeout