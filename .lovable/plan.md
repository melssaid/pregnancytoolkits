# 🎯 خطة التنفيذ الشاملة — Smart Dashboard Transformation

## 📋 معالجة الفجوات (Pre-flight Gap Analysis)

قبل البدء، تم تحديد الفجوات التقنية التالية في الخطة الأصلية ومعالجتها:


| الفجوة                                                           | الحل                                                                                       |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| ❌ `useDashboardDataCheck` لا يفحص بيانات الترطيب/الفيتامينات     | ✅ توسيع الهوك ليشمل `hydration_data`، `vitamin_logs`، `appointments`                       |
| ❌ لا يوجد فحص للـ `dueDate` في حالة عدم وجود حمل                 | ✅ إضافة guard في `TodayStoryHero` لإخفاء العناصر الحملية إذا `week <= 0`                   |
| ❌ `Tabs` السميك (h-14) قد يكسر sticky على شاشات صغيرة (321px)    | ✅ استخدام `h-12` على الموبايل + `text-[11px]` للـ labels                                   |
| ❌ Mood Quick-Tap قد يتعارض مع `quick_symptom_logs` schema الحالي | ✅ قراءة `QuickSymptomLogger.tsx` أولاً والالتزام بنفس البنية `{date, mood, symptoms[]}`    |
| ❌ Lazy Loading للتبويبات قد يسبب CLS (تخطيط متذبذب)              | ✅ استخدام `<Suspense>` مع `PageSkeleton` بنفس ارتفاع المحتوى المتوقع                       |
| ❌ كسر `useScrollRestoration` عند التبديل بين التبويبات           | ✅ حفظ موضع scroll لكل تبويب في `sessionStorage` بمفتاح `dashboard_tab_scroll_${tab}`       |
| ❌ معايير الـ Wellness قد تتأثر بالتسميات الجديدة                 | ✅ التحقق من جميع labels مقابل `wellness-terminology-standard-v2` (لا "fetal" → "baby")     |
| ❌ RTL للتبويبات (الترتيب)                                        | ✅ الترتيب البصري في RTL: 🛠️ المزيد ← 📅 أرشيف ← 📊 رؤى ← 🌟 اليوم (طبيعي عبر `dir="rtl"`) |


---

## 🏗️ المرحلة 1: البنية الأساسية (Restructuring)

### 1.1 توسيع `useDashboardDataCheck.ts`

إضافة فحوصات للترطيب، الفيتامينات، المواعيد:

```ts
const hydration = safeParseLocalStorage("hydration_data", { glasses: 0 });
const vitamins = safeParseLocalStorage("vitamin_logs", []);
const appointments = safeParseLocalStorage("appointments", []);

return {
  hasSymptomsData, hasMoodData, hasContractions, hasSavedResults,
  hasWeight, hasRecentActivity,
  hasHydration: hydration.glasses > 0,
  hasVitamins: vitamins.length > 0,
  hasAppointments: appointments.length > 0,
  hasAnyData: /* OR of all above */,
};
```

### 1.2 إنشاء `TodayStoryHero.tsx` (مكون جديد)

بطل احترافي بنمط Apple Health + Instagram Stories:

- **Progress Ring 140px** (مكبّر من 88px الحالي)
- رقم الأسبوع: `text-6xl font-black` (مكبّر من `text-xl`)
- تحية ذكية حسب الوقت (`getTimeBasedGreeting()`)
- **Mood Quick-Tap**: 5 إيموجي (😍 😊 😐 😟 😢) → يكتب في `quick_symptom_logs` بنفس البنية الحالية
- يحترم `direction: rtl` تلقائياً
- يخفي محتواه الحملي إذا `week <= 0` (للنساء غير الحوامل)
- استبدل الاموجي بشئ اكثر رسمية وجدية

### 1.3 نظام التبويبات في `SmartDashboard.tsx`

```tsx
const [activeTab, setActiveTab] = useState(() => 
  sessionStorage.getItem("dashboard_active_tab") || "today"
);

<Tabs value={activeTab} onValueChange={(v) => {
  sessionStorage.setItem("dashboard_active_tab", v);
  setActiveTab(v);
}}>
  <TabsList className="sticky top-14 z-20 grid grid-cols-4 h-12 sm:h-14
                       bg-background/95 backdrop-blur-xl border-b 
                       border-primary/10 rounded-none px-1">
    <TabsTrigger value="today" className="text-[11px] sm:text-xs">🌟 اليوم</TabsTrigger>
    <TabsTrigger value="insights" className="text-[11px] sm:text-xs">📊 رؤى</TabsTrigger>
    <TabsTrigger value="archive" className="text-[11px] sm:text-xs">📅 أرشيف</TabsTrigger>
    <TabsTrigger value="more" className="text-[11px] sm:text-xs">🛠️ المزيد</TabsTrigger>
  </TabsList>
  ...
</Tabs>
```

### 1.4 توزيع البطاقات على التبويبات


| 🌟 اليوم           | 📊 رؤى                   | 📅 أرشيف               | 🛠️ المزيد                    |
| ------------------ | ------------------------ | ---------------------- | ----------------------------- |
| TodayStoryHero     | HealthScoreRing          | ResultsArchiveCalendar | UnifiedToolsGrid              |
| RiskAlertCard      | WeeklyComparisonCard     | MilestonesTimeline     | DoctorVisitPrepCard           |
| DailyPriorities    | MoodTrendCard            | WeekCertificateCard    | PartnerSummaryCard            |
| BabySizeCard       | WeeklySymptomsCard       | StageRecommendation    | DailyHealthChallengeCard      |
| BirthCountdownCard | WeightTrendCard          | AppRatingCard          | ContractionSummaryCard (≥32w) |
| NutritionTipCard   | FetalMovementCard        | UsageStatsNudge        | DynamicFAQ                    |
| HydrationTracker   | RecentMealFitnessSummary | &nbsp;                 | &nbsp;                        |


---

## 🎨 المرحلة 2: التخصيص الذكي

### 2.1 ترتيب ديناميكي حسب الوقت في تبويب "اليوم"

```ts
const hour = new Date().getHours();
const order = hour < 11 
  ? ["NutritionTip", "Hydration", "DailyPriorities", "BabySize"]   // صباحاً
  : hour < 17 
  ? ["DailyPriorities", "Hydration", "RecentMeals", "BabySize"]    // ظهراً
  : ["MoodTrend", "DailyPriorities", "DoctorPrep", "BabySize"];    // مساءً
```

### 2.2 تحيات ذكية في `TodayStoryHero`

- 🌅 صباحاً: "صباح الخير 🌸 ابدئي يومك بكوب ماء"
- ☀️ ظهراً: "وقت الفيتامين 💊"
- 🌙 مساءً: "كيف كان شعورك اليوم؟"

### 2.3 إخفاء البطاقات الفارغة (Smart Empty States)

كل بطاقة في "رؤى" تستخدم `useDashboardDataCheck` لتخفي نفسها إذا لا توجد بيانات، مع عرض **EmptyState واحد** في أعلى التبويب يقترح بدء التتبع.

---

## 🖼️ المرحلة 3: تحسينات بصرية

### 3.1 معايرة الطباعة (Typography Calibration)


| العنصر             | قبل               | بعد                         |
| ------------------ | ----------------- | --------------------------- |
| رقم الأسبوع (Hero) | text-xl           | **text-6xl font-black**     |
| عنوان البطل        | text-base         | **text-2xl font-extrabold** |
| عناوين البطاقات    | text-sm/text-base | **text-lg font-bold**       |
| الأرقام الإحصائية  | text-lg           | **text-3xl font-black**     |


### 3.2 معايرة المسافات والـ radius

- `space-y-3.5` → `space-y-4`
- `p-4` (بطاقات رئيسية) → `p-5`
- `rounded-2xl` (Hero, HealthScore) → `rounded-3xl`
- `shadow-sm` → `shadow-lg shadow-primary/5`

### 3.3 Skeleton Loading

استخدام `Skeleton` الموجود في `src/components/ui/skeleton.tsx` لكل تبويب أثناء التحميل (بدلاً من شاشة فارغة).

### 3.4 احترام معايير المشروع

- ✅ **RTL تلقائي** عبر `dir` المتوارث من `ToolFrame`/`Layout`
- ✅ **PDF Export**: `window.print()` فقط (لا jsPDF)
- ✅ **Wellness Terminology**: لا "fetal/medical" — استخدام "baby/wellness"
- ✅ **Curved Design**: `rounded-3xl` للبطاقات الرئيسية
- ✅ **Color Palette**: Warm Rose-to-Lavender (لا تغيير على الـ tokens)
- ✅ **Haptics**: `haptics.selection()` عند تغيير التبويب

---

## ⚡ المرحلة 4: التحسين التقني

### 4.1 دمج `QuickActionsBar` + `MyToolsQuickGrid` → `UnifiedToolsGrid.tsx`

شبكة 3-أعمدة موحدة مع scroll أفقي للأدوات الإضافية.

### 4.2 Lazy Loading للتبويبات (تقليل bundle بـ ~35%)

```tsx
const InsightsTab = lazy(() => import("@/components/dashboard/tabs/InsightsTab"));
const ArchiveTab = lazy(() => import("@/components/dashboard/tabs/ArchiveTab"));
const MoreTab = lazy(() => import("@/components/dashboard/tabs/MoreTab"));

<Suspense fallback={<DashboardTabSkeleton />}>
  {activeTab === "insights" && <InsightsTab />}
</Suspense>
```

### 4.3 Hook موحّد `useDashboardData.ts`

يجمع: `profile`, `stats`, `dataCheck`, `healthCheckin`, `bloodPressure` في hook واحد لتقليل re-renders.

---

## 📁 الملفات المتأثرة

### ملفات جديدة (8):

1. `src/hooks/useDashboardData.ts` — Hook بيانات موحّد
2. `src/components/dashboard/TodayStoryHero.tsx` — بطل جديد + Mood Quick-Tap
3. `src/components/dashboard/UnifiedToolsGrid.tsx` — دمج QuickActions + MyTools
4. `src/components/dashboard/DashboardTabSkeleton.tsx` — Skeleton للتبويبات
5. `src/components/dashboard/tabs/TodayTab.tsx`
6. `src/components/dashboard/tabs/InsightsTab.tsx`
7. `src/components/dashboard/tabs/ArchiveTab.tsx`
8. `src/components/dashboard/tabs/MoreTab.tsx`

### ملفات معدّلة (2):

1. `src/pages/SmartDashboard.tsx` — إعادة هيكلة كاملة بنظام Tabs + Lazy
2. `src/hooks/useDashboardDataCheck.ts` — توسيع الفحوصات (hydration/vitamins/appointments)

### ملفات محفوظة بدون كسر (Backwards-compatible):

- جميع المكونات الـ 30+ الحالية تبقى كما هي وتُستدعى من ملفات التبويبات الجديدة.

---

## ✅ معايير الجودة (Quality Checklist) — فحص بعد كل خطوة

- RTL يعمل بشكل صحيح على عرض 321px
- لا يوجد horizontal scroll على أي شاشة
- التبويبات sticky تعمل تحت الهيدر بدون تداخل
- Mood Quick-Tap يحفظ في نفس schema `quick_symptom_logs`
- جميع البطاقات الفارغة تختفي تلقائياً
- Lazy chunks تُحمَّل بنجاح بدون CLS
- scroll position يُحفظ لكل تبويب
- لا توجد مصطلحات طبية محظورة (fetal/diagnosis/medical device)
- الطباعة (`window.print()`) تعمل على تبويب "أرشيف"
- Haptics تعمل عند تغيير التبويب
- الترقيم بأحجام جديدة (text-6xl للأسبوع) لا يكسر التخطيط
- لون trimester يتغير ديناميكياً مع `useTrimesterTheme`

---

## 🎬 ترتيب التنفيذ

1. **توسيع `useDashboardDataCheck.ts**` ← الأساس للفحوصات
2. **إنشاء `useDashboardData.ts**` ← مصدر بيانات موحّد
3. **إنشاء `TodayStoryHero.tsx**` ← البطل الجديد + Mood Tap
4. **إنشاء `UnifiedToolsGrid.tsx**` ← دمج المكونات
5. **إنشاء `DashboardTabSkeleton.tsx**` ← حالة التحميل
6. **إنشاء 4 ملفات تبويبات** (`TodayTab`, `InsightsTab`, `ArchiveTab`, `MoreTab`)
7. **إعادة هيكلة `SmartDashboard.tsx**` ← Tabs + Lazy + Sticky
8. **مراجعة نهائية**: Console clean, no CLS, RTL مثالي

---

**النتيجة المتوقعة**: لوحة تحكم بمستوى **Flo / Apple Health / Ovia** — قابلة للقراءة، سريعة، ذكية، ومتوافقة 100% مع معايير المشروع.