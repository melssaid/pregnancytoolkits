# Sync AI Movement Analysis with the Chart's Metrics

## Problem
`AIMovementAnalysis.tsx` recomputes its own averages internally, so the AI prompt receives **different numbers** than what the user sees in the chart strip (`getMovementScore()`, `getAverageKicks()`, average duration). This breaks the perceived consistency between the chart and the AI write-up.

## Fix

### 1) `src/components/kick-counter/AIMovementAnalysis.tsx`
Add three optional props:
- `movementScore?: number` — the 0–100 score shown in the circular gauge
- `avgKicks?: number` — average kicks per session
- `avgDurationMinutes?: number` — average session duration

In `runDeepAnalysis()`, prefer these props over locally-recomputed values, and add a new line to the prompt:
```
## Statistics (these are the exact numbers shown to the user in the chart)
- Movement Score (shown in chart): {score}/100
- Average kicks per session: {avgKicks}
- Average session duration: {avgDuration} min
- Fastest / Slowest / Most active time …
```
Plus an explicit instruction:
> "Refer to the Movement Score and averages above by their exact values when explaining the pattern."

Local recompute remains as a fallback so the component still works when used elsewhere without the props.

### 2) `src/pages/tools/SmartKickCounter.tsx` (line ~492)
Pass the three values that the parent already computes:
```tsx
<AIMovementAnalysis
  sessions={…}
  currentWeek={currentWeek}
  movementScore={movementScore}
  avgKicks={getAverageKicks()}
  avgDurationMinutes={
    history.length > 0
      ? Math.round(history.reduce((sum, s: any) => sum + (s.duration_minutes || 0), 0) / history.length)
      : 0
  }
/>
```

## Result
The AI now writes things like *"Your Movement Score is 82/100, with an average of 12 kicks per session…"* — matching the chart 1-for-1. No new quota cost, no UI redesign.
