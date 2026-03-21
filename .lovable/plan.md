

## Plan: "Today's Insight" Preview Card + New "Daily Insights" Screen

### What We're Building

1. **A preview card on SmartDashboard** — lightweight "Today's Insight" card showing a short contextual message based on pregnancy week + tracked data, with a "View full insight" CTA navigating to `/daily-insights`

2. **A new `/daily-insights` page** — full intelligent experience with:
   - Main AI-generated recommendation (contextual to week, symptoms, hydration, etc.)
   - 2 secondary suggestion cards (nutrition, activity, etc.)
   - Quick action buttons (track symptoms, log water, view appointments)
   - Trust/disclaimer section

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/dashboard/TodaysInsightCard.tsx` | Preview card for dashboard — generates a short contextual tip from local data (no AI call), with CTA to `/daily-insights` |
| `src/pages/DailyInsights.tsx` | Full insights screen with AI-powered main recommendation, secondary suggestions, quick actions, trust section |

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/SmartDashboard.tsx` | Insert `<TodaysInsightCard />` between Risk Alerts and Daily Priorities (position 2.5) |
| `src/components/AnimatedRoutes.tsx` | Add lazy import + route for `/daily-insights` |
| `src/locales/en.json` | Add `dailyInsights.*` keys |
| `src/locales/ar.json` | Arabic translations |
| `src/locales/de.json` | German translations |
| `src/locales/es.json` | Spanish translations |
| `src/locales/fr.json` | French translations |
| `src/locales/pt.json` | Portuguese translations |
| `src/locales/tr.json` | Turkish translations |

### Technical Details

**TodaysInsightCard** — Pure client-side logic, no AI call. Uses `useUserProfile` and `useTrackingStats` to pick a contextual tip from a week-based map (e.g., week 28 → hydration focus, week 36 → hospital bag reminder). Renders as a gradient card with Sparkles icon, short text, and a "View full insight →" button.

**DailyInsights page** — Uses `usePregnancyAI` to generate a main recommendation via streaming. Secondary suggestions are derived from local data (upcoming appointments, vitamin status, symptom trends). Quick actions link to existing tools. Trust section uses existing `InlineDisclaimer`.

**Data sources**: `useUserProfile` (week, due date, conditions), `useTrackingStats` (kicks, water, vitamins, symptoms), `safeParseLocalStorage` for wellness diary entries and appointments.

