---
name: stage-adaptive-data-sources
description: DataSourcesPanel filters sources by journeyStage; engagementScore/dataRichness computed against in-stage total; AI snapshot is stage-scoped via explicit prompt rule
type: architecture
---

The dashboard's holistic analysis is **stage-adaptive** — every signal, badge,
and recommendation is scoped to the user's active `journeyStage`
(`pregnant` / `postpartum` / `fertility`). Three layers enforce this:

1. **DataSourcesPanel (`src/components/dashboard/DataSourcesPanel.tsx`)**
   - `SOURCES` catalogue tags each row with `scope: "universal" | "pregnancy" | "postpartum" | "fertility"`
   - Only `universal + currentStage` rows render in the grid
   - A coloured **stage badge** (`dashboardV2.dataSources.stageBadge`) appears under the header to communicate scoping
   - `stageRichness` = active / visible total (NOT the global 14)

2. **useHolisticDashboardSnapshot (`src/hooks/useHolisticDashboardSnapshot.ts`)**
   - `SOURCES_BY_STAGE` constant: `pregnant: 14, postpartum: 9, fertility: 9`
   - `sourcesCount` splits universal vs pregnancy-only buckets; pregnancy bucket is skipped for non-pregnant stages
   - `engagementScore = round((sourcesCount / totalSources) * 100)` — fair across stages
   - Prompt to the AI now starts with `**Active Journey Stage**: <label>` + an explicit `**Scope rule**` line forbidding cross-stage advice

3. **InsightsTab (`src/components/dashboard/tabs/InsightsTab.tsx`)**
   - Pregnancy-only summary cards (`UltrasoundSummaryCard`, `WeeklyComparisonCard`, `FetalMovementCard`, kick/contraction charts) are gated behind `stage === "pregnant"`

**Order in InsightsTab (Option A)**: HealthScoreRing → DataSourcesPanel → SignalsPreviewPanel → HolisticAIAnalysisCard → SonarHistoryTrendsCard → stage cards → trend charts → detail cards.

**SavedHolisticReports** lives in `ArchiveTab` (history), not `InsightsTab` (live analysis).

**Route integrity** is guarded by `src/test/data-sources-routes.test.ts` — every `href` in the panel must exist in `AnimatedRoutes.tsx`.

Translation keys: `dashboardV2.dataSources.stageBadge`, `dashboardV2.dataSources.stageBadgeAria`, `dashboardV2.dataSources.stages.{pregnant,postpartum,fertility}` exist in all 7 locales (ar/en/de/es/fr/pt/tr).
