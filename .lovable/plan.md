# خطة التنفيذ: زر "التحليل الذكي الشامل" — 7 نقاط

## الهدف
إضافة زر مميز في أعلى تبويب **Insights** بلوحة التحكم يجمع كافة بيانات المستخدم (وزن، أعراض، مزاج، نوم، حركة، تغذية، نشاط...) ويرسلها لأقوى نموذج (`google/gemini-2.5-pro`) لإنتاج تحليل احترافي شامل بصيغة CEO Persona أنثوية — بتكلفة **7 نقاط** من خطة الاستهلاك.

---

## 1) تسجيل الأداة في المحرك الذكي
**ملف:** `src/services/smartEngine/types.ts`
- إضافة `"holistic-dashboard"` ضمن `AIToolType`.
- توسيع `InsightWeight` ليشمل `7`: `0 | 0.5 | 1 | 2 | 5 | 7`.
- إضافة المفتاح في `TOOL_WEIGHT_REGISTRY` بقيمة **7** (المصدر الوحيد للحقيقة).

## 2) توسيع الـ Edge Function
**ملف:** `supabase/functions/pregnancy-ai-perplexity/index.ts`
- فرع جديد للحالة `holistic-dashboard`:
  - النموذج `google/gemini-2.5-pro` (سياق ضخم + تحليل عميق).
  - System prompt بشخصية CEO أنثوية: ملخص تنفيذي → مؤشرات بارزة → تنبيهات لينة → توصيات أسبوعية → خطة الأيام السبعة القادمة.
  - يستقبل `snapshot` كنص JSON منظم في `messages`.

## 3) هوك تجميع البيانات
**ملف جديد:** `src/hooks/useHolisticDashboardSnapshot.ts`
- يجمع من المصادر الموجودة دون لمس مفاتيح التخزين:
  - `useUserProfile` (بروفايل/أسبوع/مرحلة).
  - `useDashboardData` (وزن/أعراض/dataCheck).
  - `kick_sessions` / `water_logs_<uid>` / `contraction_timer_data`.
  - `mood_logs` / `sleep_logs` / `meal_logs` / `fitness_logs` / `vitamin_logs` / `appointments`.
- يحسب `dataRichness` (٪) و `hasMinimumData` (≥ 3 مصادر).
- يرجع `{ snapshot, dataRichness, hasMinimumData, sourcesCount }`.

## 4) بطاقة الزر المميز
**ملف جديد:** `src/components/dashboard/HolisticAIAnalysisCard.tsx`
- glassmorphism + gradient وردي-بنفسجي + حدود ذهبية رفيعة (متوافق مع Warm Rose-to-Lavender).
- شارة **"7 نقاط"** + أيقونة Crown صغيرة + Sparkles.
- شريط `dataRichness` بصري.
- زر CTA يستخدم `AIActionButton` مع `costHint="7"`.
- النتيجة داخل `AIInsightCard` + `UsagePulseFooter` + `AIFeedbackPrompt` + `SaveResultButton` + `AIResultDisclaimer` (نفس نمط بقية الأدوات).

## 5) دعم تكلفة 7 في زر الإجراء
**ملف:** `src/components/ai/AIActionButton.tsx`
- إضافة دعم `costHint="7"` في الواجهة (badge "7 نقاط / 7 points / 7 puntos…").
- منطق الاستهلاك يبقى عبر `resolveWeight()` فقط.

## 6) دمج البطاقة في تبويب Insights
**ملف:** `src/components/dashboard/tabs/InsightsTab.tsx`
- إضافة `<HolisticAIAnalysisCard />` كأول عنصر (قبل `HealthScoreRing`).
- إذا `!hasMinimumData` تُعرض حالة لطيفة تشجع على التتبع.

## 7) ترجمات السبع لغات
**ملفات:** `src/locales/{ar,en,de,fr,es,pt,tr}.json`
- مفتاح جديد `dashboardV2.holistic`:
  - `title`, `subtitle`, `cta`, `cost` (بأرقام غربية: **7**), `dataRichness`, `minDataNeeded`, `whatItAnalyzes`, `disclaimerNote`.

---

## ضمانات الجودة
- ✅ CEO Persona أنثوية بالعربية، فصحى، مختصرة.
- ✅ مصطلحات عافية فقط (ملاحظات، لا تشخيص/طبي).
- ✅ التكلفة **7 نقاط** في `TOOL_WEIGHT_REGISTRY` كمصدر وحيد.
- ✅ شريط الاستهلاك واستطلاع الرضا بنفس نمط `AIInsightCard`.
- ✅ أرقام غربية للتكلفة (**7**) في كل اللغات.
- ✅ RTL تلقائي عبر بنية `ToolFrame`/الكلاسات الموجودة.
- ✅ عدم لمس `client.ts` / `types.ts` المُولّدين.

---

## الملفات المتأثرة
**جديدة:**
- `src/hooks/useHolisticDashboardSnapshot.ts`
- `src/components/dashboard/HolisticAIAnalysisCard.tsx`

**معدّلة:**
- `src/services/smartEngine/types.ts`
- `src/components/ai/AIActionButton.tsx`
- `src/components/dashboard/tabs/InsightsTab.tsx`
- `supabase/functions/pregnancy-ai-perplexity/index.ts`
- `src/locales/ar.json`, `en.json`, `de.json`, `fr.json`, `es.json`, `pt.json`, `tr.json`