
## التشخيص

### مشكلة 1 — الـ splash يعرض صورة ثابتة بدلاً من الفيديو

عند فحص `index.html` (سطر 295-407):

- **شرط التخطي في سطر 328** يتخطى فيديو الـ splash نهائياً للمستخدمين الذين أنهوا onboarding (`splashSeenPersistent && onboardingDone`)، فيرون مباشرة `PageSkeleton` (الذي يستخدم `splash-logo-v2.webp` كصورة ثابتة) ويظنون ذلك هو الـ splash.
- الفيديو ليس عليه `loop` ولا `poster` صريح، وفي حال تأخر `play()` بسبب autoplay policy في WebView يبقى الإطار الأول معروضاً بدون حركة.
- حجم `splash-video.mp4` = **2.2MB** — على شبكة بطيئة في الزيارة الأولى، يستهلك ثوانٍ قبل بدء التشغيل، فيبدو ساكناً.

### مشكلة 2 — البطء في التنقلات الداخلية بعد التحميل الأول

السبب الجذري في `src/main.tsx`:

1. **سطر 73-77**: في معاينة Lovable و iframes يتم استدعاء `unregister()` لكل Service Worker عند كل تحميل ← يُلغي تخزين JavaScript chunks مؤقتاً، فكل صفحة جديدة تُحمَّل من الشبكة.
2. **سطر 130-148**: 6 imports ديناميكية مؤجلة (storageCleanup, webVitals, googlePlayBilling, indexedDBStore + migration لـ 3 جداول) كلها على main thread أثناء أول idle بعد التنقل ← تأخير ملحوظ.
3. **`src/lib/routePrefetch.ts` معرَّف لكنه لا يُستدعى من أي مكان** — تم التحقق عبر `rg "prefetchCriticalRoutes"` ← الصفحات لا تُحمَّل مسبقاً، فأول زيارة لأي أداة تنتظر تنزيل chunk كامل.
4. **`PageSkeleton` يستورد `framer-motion`** فقط لـ 3 نقاط متحركة ← chunk ثقيل يُحمَّل في كل suspense fallback خلال التنقل.

---

## الخطة

### A) إصلاح الـ splash بحيث يظهر الفيديو فقط (لا صورة ثابتة)

ملف: `index.html`

1. **حذف شرط التخطي للـ onboardingDone**: إزالة `(splashSeenPersistent && onboardingDone)` من سطر 328 بحيث يتم فقط تخطي الفيديو إن كان قد عُرض فعلاً **في نفس الجلسة** (refresh / deep-link). هذا يضمن أن كل تحميل cold-start يعرض الفيديو.
2. **إضافة `poster` شفاف 1×1** على عنصر `<video>` لمنع ظهور أي إطار ثابت قبل بدء التشغيل (إن لم يبدأ play بعد، يظهر فراغ أسود مطابق للخلفية بدلاً من إطار مجمَّد).
3. **إضافة `loop` كـ fallback**: إن استغرق React أكثر من مدة الفيديو، يستمر الفيديو في التشغيل بدلاً من التجميد على آخر إطار.
4. **محاولة play مرة ثانية على `loadedmetadata`** كحماية ضد فشل autoplay الأول في WebView.
5. **تقليل safety cap** من 8s إلى 5s حتى لا يعلق المستخدم خلف splash إن فشل الفيديو.

### B) حذف مصادر البطء في التنقلات

**ملف: `src/main.tsx`**

1. **استدعاء `prefetchCriticalRoutes()`** ضمن `deferAfterPaint` ← تحميل مسبق لـ Dashboard / Settings / أهم 3-4 أدوات حسب رحلة المستخدم بعد أول paint.
2. **حذف unregister المتعدد للـ Service Workers في المعاينة** أو على الأقل تنفيذه مرة واحدة فقط عبر `sessionStorage` flag بدلاً من كل تحميل.
3. **تأجيل migrations الـ IndexedDB** بـ `setTimeout(..., 5000)` بعد paint بدلاً من تشغيلها في أول idle ← ترك الـ main thread حراً للتنقلات.
4. **تجميع imports المؤجلة في `Promise.all`** بدلاً من إطلاقها متسلسلة عبر `.then()` متشعب.

**ملف: `src/components/PageSkeleton.tsx`**

5. **استبدال `framer-motion` بـ CSS keyframes خالصة** للنقاط الثلاث ← يحذف dependency ثقيلة من الـ critical chunk، فيظهر الـ skeleton فوراً ودون chunk إضافي.

### ملاحظة مهمة للمستخدم

سؤالك قال: "الانتقالات الداخلية يمكن أن تظل ثابتة كما هي بالـ splash ذو الثلاث نقاط". فهمت ذلك على أن **PageSkeleton (3 نقاط) يبقى للانتقالات الداخلية**، وفقط **الـ splash الأولي يجب أن يكون فيديو دائماً**. الخطة أعلاه تطبق هذا بالضبط.

### الملفات المعدّلة

- `index.html` — إصلاح منطق splash + poster + loop + retry play
- `src/main.tsx` — تفعيل route prefetch + تأجيل migrations + تنظيف SW logic + جمع imports
- `src/components/PageSkeleton.tsx` — استبدال framer-motion بـ CSS pure
