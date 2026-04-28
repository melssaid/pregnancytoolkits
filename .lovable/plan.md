# خطة تحسين رحلة المرأة + منظومة المقالات

## نتائج الفحص الرئيسية (مع أدلة من الكود وقاعدة البيانات)

### 1) منظومة المقالات اليومية — توجد مشاكل حرجة

تم فحص `article_refresh_runs` و `article_daily_content`:


| التاريخ    | الحالة             | المعالج |
| ---------- | ------------------ | ------- |
| 2026-04-28 | **failed**         | 13      |
| 2026-04-27 | **failed**         | 5       |
| 2026-04-26 | **failed**         | 4       |
| 2026-04-25 | **failed**         | 6       |
| 2026-04-24 | **failed**         | 12      |
| 2026-04-23 | failed → completed | 0 / 1   |


**المشاكل المؤكدة:**

1. **كل عمليات التحديث اليومية تفشل** بسبب `Unterminated string in JSON` — استجابة الـ AI تتجاوز `max_tokens: 1800` فيُقطع JSON قبل اكتماله.
2. **التغطية ناقصة جداً**: ليوم 28/4 يوجد فقط مقالان (`fertility-window-guide`, `cycle-quality-signals`) بـ 6-7 لغات — أي **مقالان من أصل 36** فقط لديهما محتوى يومي.
3. **سجل البذور مكرر ومنقوص**: `supabase/functions/daily-article-refresh/index.ts` يحتوي **11 بذرة فقط** (تخطيط فقط)، بينما `src/data/articles.ts` يحتوي **36 مقالاً** عبر 3 أقسام (planning/pregnant/postpartum). أقسام الحمل وما بعد الولادة لا يتم تحديثها أبداً.
4. **لا يوجد cron schedule** مُلاحَظ يستدعي الـ function (الفحص في `cron.job` محجوب — يجب التحقق عبر إنشاء جدولة جديدة).
5. **خطأ منطقي في `useDailyArticleContent**`: يستخدم `today = new Date()` بتوقيت المتصفح، بينما `effective_date` يُكتب بتوقيت الخادم (UTC) — يسبب فجوات لمدة ساعات في بعض المناطق الزمنية.
6. **لا يوجد fallback** عند فشل التحديث — صفحة المقال تعتمد على المحتوى الثابت (`article.sections`) فقط، وأكثرية المقالات في `articles.ts` تحتوي بنية `sections: []` فارغة (تظهر `contentFallback` للمستخدم).

### 2) صفحة المقال (`ArticlePage.tsx`) — تحسينات مطلوبة

- **الأدوات المرتبطة باهتة بصرياً**: `text-[9px]` + `grid-cols-1 sm:grid-cols-2` بلا أيقونة أو CTA واضح.
- **لا يوجد**: شريط تقدم القراءة، Table of Contents، زر مشاركة، أو ربط بـ "احفظي للقراءة لاحقاً".
- **اقتراحات الأدوات لا تستخدم `journeyStage**` — حامل ترى أدوات تخطيط في مقال خصوبة.
- `**FeaturedArticlesRail` في الأسفل يكرر مقالات** قد تكون موجودة في `RelatedArticles` بالأعلى (لا منع للتكرار).

### 3) الصفحة الرئيسية (`Index.tsx`) ولوحة التحكم (`SmartDashboard.tsx`)

- **3 أقسام رحلة (`planning/pregnant/postpartum`)** + لكل قسم `SectionFeaturedArticles` — جيد، لكن المحتوى ثابت (لا يتجدد يومياً).
- **لا يوجد قسم رئيسي يبرز "مشكلة اليوم"** التي تبحث عنها المرأة (مثلاً: "أسبوع 24: ألم ظهر؟ إليك 3 خطوات").
- `**TodayTab` يُظهر `EmptyStateCard**` للمستخدمات الجدد بدون رحلة محددة — جيد، لكن لا يوجد رابط مباشر إلى قسم المقالات أو `LanguageSelection`/`/onboarding`.
- **عدم اتساق المرحلة بين الصفحتين**: `Index.tsx` يعرض كل الأقسام الثلاثة دائماً، بينما `TodayTab` و`SmartDashboard` يعرضان محتوى حسب `journeyStage` — المرأة في مرحلة postpartum ترى أدوات الحمل بشكل بارز في الرئيسية.
- **عدم وجود "Next Best Action"** بعد فتح أداة (مثل: "بعد عداد الركلات → اقرئي مقال حركة الجنين").

---

## خطة التحسين (4 مراحل)

### المرحلة 1 — إصلاح منظومة المقالات اليومية (أولوية قصوى)

**1.1 — تصليح Edge Function `daily-article-refresh`:**

- رفع `max_tokens` من 1800 إلى **4000**.
- معالجة آمنة لـ JSON: إذا فشل `JSON.parse`، إعادة المحاولة مرة واحدة بطلب أقصر، ثم تخطي البذرة بدل إفشال الدفعة كلها.
- توسيع `ARTICLE_SEED_REGISTRY` ليشمل **36 بذرة كاملة** عبر الأقسام الثلاثة (تطابق `articles.ts`).
- نقل السجل إلى ملف مشترك `supabase/functions/daily-article-refresh/article-seed-registry.ts` (موجود مسبقاً — استخدامه فعلياً).
- معالجة على دفعات صغيرة (4 لغات × بذرة واحدة في كل مرة) لتقليل أخطاء التزامن.

**1.2 — إنشاء/تأكيد جدولة cron يومية** (3 صباحاً UTC) عبر `pg_cron` لاستدعاء الـ function تلقائياً، مع آلية تشغيل يدوي من `/admin` كاحتياط.

ثم الفحص والتأكد من إصلاح المشكلة 

**1.3 — إصلاح** `useDailyArticleContent`**:**

- استخدام تاريخ UTC: `new Date().toISOString().slice(0,10)` — صحيح فعلياً، لكن السجل يجب أن يدعم رؤية محتوى الأمس إذا اليوم الحالي غير منشور بعد (`order by effective_date desc limit 1` — موجود — جيد).
- إضافة `placeholderData` لعرض آخر محتوى متاح أثناء التحميل بدل وميض.

**1.4 — إنشاء جدول/عرض admin** لرؤية أحدث `article_refresh_runs` وزر "إعادة التشغيل الآن" في `/admin/usage` (يستخدم Edge Function موجودة).

### المرحلة 2 — تحسين صفحة المقال (`ArticlePage.tsx`)

**2.1 — Hero محسّن:**

- شارة "مُحدَّث اليوم" عند توفر `dailyContent.data?.effective_date === today`.
- وقت قراءة ديناميكي من `reading_minutes` بدل `readTime` الثابت.
- زر مشاركة + زر "احفظ" (يستخدم `useSavedResults`).

**2.2 — Table of Contents جانبي/علوي:**

- يولّد تلقائياً من `## headings` في `markdownBody`، ويتفاعل مع التمرير.

**2.3 — شريط تقدم القراءة** أعلى الصفحة (أرفع 2px، يتلوّن primary).

**2.4 — الأدوات المرتبطة (relatedTools) — ترقية بصرية:**

- شبكة `grid-cols-2` مع أيقونة الأداة (LucideIcon من tools-data) + CTA "ابدئي الآن".
- فلترة حسب `journeyStage` للمستخدم: إذا كانت `pregnant` لا تُعرض أدوات `planning` (مع fallback إذا كل الأدوات غير متوافقة).

**2.5 — منع التكرار** بين `RelatedArticles` و `FeaturedArticlesRail` (تمرير `excludeSlugs`).

**2.6 — قسم "بعد القراءة"** في الأسفل: 3 أزرار = افتح أداة مرتبطة + احفظي + شاركي.

### المرحلة 3 — تحسين رحلة المرأة (Index + Dashboard)

**3.1 — `Index.tsx` ذكي حسب المرحلة:**

- ترتيب الأقسام الثلاثة بحيث **مرحلة المستخدمة الحالية تفتح تلقائياً** (`isOpen` افتراضياً) وتظهر أولاً.
- إخفاء أو طي صامت لأقسام المراحل الأخرى (تبقى متاحة لكن مغلقة).

**3.2 — بطاقة "حلّ سريع لمشكلتكِ" في `Index.tsx` و`TodayTab`:**

- أعلى الصفحة، تستخدم `pregnancyWeek` + `journeyStage` لاقتراح **مقال + أداة + سؤال متكرر** مرتبطين بالأسبوع/المرحلة.
- مثال: أسبوع 24 → "ألم الظهر شائع الآن" + رابط لمقال + رابط لأداة `AIBackPainRelief`.

**3.3 — `TodayTab` — قسم "اقرئي اليوم":**

- إضافة `SectionFeaturedArticles` مع `sectionKey={journeyStage}` بعد `DailyPriorities` — يجلب المقال اليومي المتجدد بشكل بارز.

**3.4 — Next Best Action في نهاية كل أداة:**

- توحيد `ToolFrame` ليعرض في الأسفل: "بعد هذه الأداة → اقرئي [مقال مرتبط]" (يستخدم خريطة tool→article في `articles.ts/relatedToolIds` معكوسة).

**3.5 — تنظيف `EmptyStateCard`:**

- إضافة CTAs: "ابدئي رحلة" → onboarding، "اكتشفي الأدوات" → DiscoverTools، "اقرئي مقال اليوم" → ArticlePage للمقال البارز.

### المرحلة 4 — جودة المحتوى ومعايرة الدقة

**4.1 — معايرة AI prompt** في `daily-article-refresh`:

- إضافة قيود السلامة (الالتزام بسياسة `wellness-only`، ممنوع تشخيص، صياغة CEO Persona للعربية).
- التزام بـ `**Active Journey Stage**` كما في `useHolisticDashboardSnapshot`.
- ذكر اسم الأداة المرتبطة في خاتمة المقال صراحة لربط القراءة بالعمل.

**4.2 — اختبار تحقق:**

- اختبار `vitest` يتأكد أن كل `slug` في `articleSeeds` موجود في `ARTICLE_SEED_REGISTRY` (مماثل لـ `data-sources-routes.test.ts`).
- اختبار يضمن أن كل مقال له `relatedToolIds` صالحة (`getToolById` لا يعيد undefined).

**4.3 — تشغيل الـ function يدوياً مرة واحدة** بعد النشر لملء محتوى اليوم لكل البذور الـ 36.

---

## ملخص الملفات التي ستُعدَّل/تُنشأ

**سيتم تعديلها:**

- `supabase/functions/daily-article-refresh/index.ts` (إصلاح JSON, max_tokens, دفعات, prompt)
- `supabase/functions/daily-article-refresh/article-seed-registry.ts` (توسيع لـ 36 بذرة)
- `src/hooks/useDailyArticleContent.ts` (placeholderData)
- `src/pages/ArticlePage.tsx` (TOC, progress bar, share, save, دمج)
- `src/components/articles/RelatedArticles.tsx` (`excludeSlugs`)
- `src/components/articles/FeaturedArticlesRail.tsx` (دعم `excludeSlugs`)
- `src/pages/Index.tsx` (ترتيب وفتح حسب المرحلة + بطاقة حل سريع)
- `src/components/dashboard/tabs/TodayTab.tsx` (قسم اقرئي اليوم + EmptyState CTAs)
- `src/components/ToolFrame.tsx` (Next Best Action)
- `src/data/articles.ts` (تحسين `getRelatedToolRecords` لفلترة المرحلة)

**ستُنشأ:**

- `src/components/articles/ReadingProgressBar.tsx`
- `src/components/articles/TableOfContents.tsx`
- `src/components/articles/RelatedToolsGrid.tsx` (نسخة محسّنة)
- `src/components/dashboard/QuickProblemSolverCard.tsx`
- `src/components/admin/ArticleRefreshAdminCard.tsx`
- `src/test/article-seed-registry.test.ts`
- جدولة pg_cron (عبر insert SQL، ليست migration)

**ستُحدَّث الذاكرة:**

- `mem://features/daily-articles-system` (جديد)
- `mem://index.md` (إضافة المرجع)

---

## ملاحظات تقنية

- **عدد البذور 36 × 7 لغات = 252 طلب يومياً** للـ AI Gateway. مع `gemini-2.5-flash` و `max_tokens: 4000`، كل طلب ~3-5 ثوان × سرعة سحب موازية لكل بذرة (7 لغات معاً). إجمالي ~3-5 دقائق لتحديث الكامل.
- **استراتيجية الفشل**: المقال الذي يفشل اليوم يبقى محتواه من أمس متاحاً (`order by effective_date desc limit 1`).
- لن يتم تعديل `src/integrations/supabase/types.ts` أو `client.ts`.
- لن يتم إنشاء جداول جديدة — البنية موجودة (`article_daily_content`, `article_refresh_runs`).

هل توافقين على المضي قدماً بهذه الخطة؟ يمكن تنفيذها كاملة أو على دفعات (المرحلة 1 وحدها أولاً للحصول على محتوى يومي حقيقي يعمل، ثم 2-4).