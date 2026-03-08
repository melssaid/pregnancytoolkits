

## تسريع التطبيق — إزالة السبلاش وتسريع الانتقالات

### المشكلة
1. **سبلاش في index.html** يبقى ظاهراً حتى تحميل i18n أو 3 ثوانٍ (أيهما أقرب) — تأخير غير ضروري
2. **مكون SplashScreen + صفحة /splash** موجودان لكن لا يُستخدمان في أي تنقل فعلي — كود زائد
3. **PageTransition** تضيف 0.25 ثانية أنيميشن لكل انتقال — يمكن تقليلها

### التغييرات

**1. تسريع إزالة السبلاش الأصلي** (`src/main.tsx`)
- إزالة انتظار `i18nReady` — إزالة السبلاش فوراً بعد render
- تقليل timeout الاحتياطي من 3 ثوانٍ إلى 500ms
- استدعاء `dismissNativeSplash()` مباشرة بعد `createRoot().render()`

**2. تسريع أنيميشن الانتقال** (`src/components/PageTransition.tsx`)
- تقليل `duration` من 0.25s إلى 0.15s
- تقليل `y` offset من 8px إلى 4px لانتقال أخف

**3. حذف الملفات غير المستخدمة**
- حذف `src/components/SplashScreen.tsx`
- حذف `src/pages/Splash.tsx`
- إزالة route `/splash` من `AnimatedRoutes.tsx`

