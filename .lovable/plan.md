

## AI Entry Points Audit & Cleanup Plan

### Current State — All AI Entry Points Found

#### Dashboard (SmartDashboard.tsx) — 3 overlapping AI sections:
| # | Component | What it does | Verdict |
|---|-----------|-------------|---------|
| 1 | `TodaysInsightCard` | Static tip based on week + data, CTA → `/daily-insights` | **KEEP** — clean entry point |
| 2 | `RecentAIResults` | Shows latest saved AI results from various tools | **KEEP** — useful recap |
| 3 | `DailyAIInsight` | Another AI card with Brain icon + quick prompt chips → `/tools/pregnancy-assistant` | **REMOVE** — overlaps with TodaysInsightCard, redundant CTA to assistant |

#### Tool-Level AI (inside individual tools) — Legitimate, keep all:
| Component | Used In | Verdict |
|-----------|---------|---------|
| `AIActionButton` | 22 tool pages (BackPain, BirthPlan, Skincare, etc.) | **KEEP** — primary analyze CTA per tool |
| `AIInsightCard` | 11 tools (KickCounter, WeightGain, Contraction, DueDate, etc.) | **KEEP** — unified analysis card |
| `DiaperAIAnalysis` | DiaperTracker | **KEEP** — specialized but singular |
| `AIMovementAnalysis` | KickCounter (component exists) | **CHECK** — may overlap with `AIInsightCard` in same page |

#### Auto-Loading AI (ToolFrame level):
| Component | Scope | Verdict |
|-----------|-------|---------|
| `ToolInsightTabs` | Auto-loads AI tips for ~15 tools via ToolFrame | **REMOVE** — generates unsolicited AI content, consumes quota silently, overlaps with in-tool `AIInsightCard`/`AIActionButton` |
| `FertilityDailyTip` | Fertility tools only, static tips (no AI call) | **KEEP** — no AI quota usage, just static i18n tips |

#### Quick Actions referencing AI:
| Location | Item | Verdict |
|----------|------|---------|
| `QuickActionsBar` | "Assistant" button → pregnancy-assistant | **KEEP** — single clean entry |
| `QuickActions` (home) | "Assistant" pill → pregnancy-assistant | **KEEP** — same pattern |

---

### Cleanup Actions

#### 1. Remove `DailyAIInsight` from Dashboard
- **File**: `src/pages/SmartDashboard.tsx` — remove import and `<DailyAIInsight>` (line 20, 82)
- **Reason**: `TodaysInsightCard` already serves as the AI entry point on dashboard. Having both is confusing — two cards that say "ask AI" in different styles

#### 2. Remove `ToolInsightTabs` from ToolFrame
- **File**: `src/components/ToolFrame.tsx` — remove import (line 10) and rendering block (lines 280-283)
- **Reason**: Auto-fires AI requests when user scrolls, silently consuming quota. Tools already have their own `AIActionButton` or `AIInsightCard` for intentional AI usage
- **Note**: Don't delete the component file yet — just disconnect it. Can be fully removed in next phase

#### 3. Check `AIMovementAnalysis` vs `AIInsightCard` in KickCounter
- **File**: `src/pages/tools/SmartKickCounter.tsx`
- **Action**: Verify if both are rendered. If `AIInsightCard` is present, the separate `AIMovementAnalysis` component is redundant
- Need to read the file to confirm

#### Summary of Changes

| Action | File | Change |
|--------|------|--------|
| Remove | `SmartDashboard.tsx` | Delete `DailyAIInsight` import + usage |
| Remove | `ToolFrame.tsx` | Delete `ToolInsightTabs` import + rendering |
| Keep | `TodaysInsightCard` | Clean dashboard AI entry point |
| Keep | `RecentAIResults` | Useful saved results recap |
| Keep | All `AIActionButton` in tools | Intentional, user-triggered |
| Keep | All `AIInsightCard` in tools | Unified analysis pattern |
| Keep | `FertilityDailyTip` | Static, no AI cost |
| Keep | `QuickActionsBar` assistant link | Single clean CTA |

### Screens Cleaned
1. **SmartDashboard** — from 3 AI sections → 2 (TodaysInsight + RecentResults)
2. **ToolFrame** (affects ~15 tools) — remove auto-loading AI tips that consume quota

### Unified CTA Labels Kept
- "Analyze" / "تحليل" — `AIActionButton` in tools
- "View Insight" / "عرض التفاصيل" — `TodaysInsightCard` CTA
- Tool-specific labels (Analyze Movement, Generate Plan, etc.) — contextual and clear

### What This Prepares For
- Clean base for unified quota system (no hidden AI calls eating quota)
- Clear separation: dashboard = overview, tools = intentional AI usage
- Single AI entry point pattern per screen

