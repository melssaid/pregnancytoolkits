

# Production Hardening Plan

## Audit Summary

### Critical Issues Found
1. **TOOL_WEIGHTS registry is dead code** — exists in types.ts but never used by executeSmartRequest. Weight resolution falls back to `request.weight || INSIGHT_WEIGHTS[section] || 1`, meaning components must hardcode weight. This is fragile.
2. **resetQuota and clearAdminBypass exported publicly** from smartEngine/index.ts and used in AIUsageContext.tsx `resetUsage()` — reachable in production UI.
3. **Hardcoded `weight: 1`** in usePregnancyAI.ts (line 131), AIMovementAnalysis.tsx (line 76), SmartPregnancyPlan.tsx (line 57) — violates centralized weight principle.
4. **usePregnancyAI still exists** with duplicated mapping logic (AITYPE_TO_SECTION) and error handling — zero consumers but exported.
5. **SmartPregnancyPlan calls executeSmartRequest directly** instead of using useSmartInsight, bypassing the hook's error normalization.

### Medium Issues
- Weight resolution in smartEngine uses `INSIGHT_WEIGHTS` keyed by section name, not by toolType. So `bump-photos` tool gets weight from `request.weight` (component-provided) not from registry.
- Tests exist but don't cover error normalization or weight registry enforcement.

---

## Plan (8 changes)

### 1. Create centralized weight resolver in smartEngine
**File: `src/services/smartEngine/types.ts`**
- Replace `TOOL_WEIGHTS` with a `TOOL_WEIGHT_REGISTRY` keyed by AIToolType
- Default all tools to weight 1, set `bump-photos` to weight 2
- Export a `resolveWeight(toolType, section)` function

### 2. Use registry in executeSmartRequest
**File: `src/services/smartEngine/smartEngine.ts`** (line 106)
- Change weight resolution: `const weight = resolveWeight(toolType, request.section)` instead of `request.weight || INSIGHT_WEIGHTS[section] || 1`
- This makes the registry the SINGLE source of truth — components no longer need to pass weight

### 3. Remove weight param from hooks and components
- **`src/hooks/useSmartInsight.ts`**: Remove `weight` from options, resolve internally via registry
- **`src/hooks/useSmartChat.ts`**: Same
- **`src/components/kick-counter/AIMovementAnalysis.tsx`**: Remove `weight: 1`
- **`src/pages/tools/AIBumpPhotos.tsx`**: Remove `weight: 2` (registry handles it)
- **`src/pages/tools/SmartPregnancyPlan.tsx`**: Migrate to useSmartInsight instead of direct executeSmartRequest

### 4. Lock down admin bypass for production
**File: `src/services/smartEngine/quotaManager.ts`**
- Add production guard to `clearAdminBypass`
- Keep `resetQuota` existing guard but strengthen it

**File: `src/services/smartEngine/index.ts`**
- Remove `resetQuota` and `clearAdminBypass` from public exports

**File: `src/contexts/AIUsageContext.tsx`**
- Remove `resetUsage` from context (or make it dev-only with guard)

### 5. Delete usePregnancyAI (dead code)
**File: `src/hooks/usePregnancyAI.ts`** — Delete entirely. Zero consumers confirmed.

### 6. Expand test coverage
**File: `src/services/smartEngine/__tests__/quotaManager.test.ts`**
- Add tests for: weight registry resolution, error normalization, double-deduction prevention, cache hit returns cost 0

### 7. Validate locale integrity
**File: `scripts/validate-locales.ts`** — Already exists, verify it runs correctly

### 8. Harden error handling
- Verify all error paths in useSmartInsight/useSmartChat return typed, localized errors
- Ensure `quota_exhausted` never shows retry button (already handled by AIErrorBanner)

---

## Files Changed

| File | Action |
|------|--------|
| `src/services/smartEngine/types.ts` | Add TOOL_WEIGHT_REGISTRY + resolveWeight() |
| `src/services/smartEngine/smartEngine.ts` | Use resolveWeight() for weight |
| `src/services/smartEngine/index.ts` | Remove unsafe exports, export resolveWeight |
| `src/services/smartEngine/quotaManager.ts` | Harden clearAdminBypass |
| `src/hooks/useSmartInsight.ts` | Remove weight param, use registry |
| `src/hooks/useSmartChat.ts` | Remove weight param, use registry |
| `src/hooks/usePregnancyAI.ts` | DELETE |
| `src/contexts/AIUsageContext.tsx` | Remove resetUsage or guard it |
| `src/components/kick-counter/AIMovementAnalysis.tsx` | Remove hardcoded weight |
| `src/pages/tools/AIBumpPhotos.tsx` | Remove hardcoded weight |
| `src/pages/tools/SmartPregnancyPlan.tsx` | Migrate to useSmartInsight |
| `src/services/smartEngine/__tests__/quotaManager.test.ts` | Expand tests |

## Final Status Target
- Quota safety: OK
- Weight correctness: OK (registry-only)
- AI path unification: OK (useSmartInsight + useSmartChat only)
- i18n integrity: OK (validate script)
- Production safety: OK (no bypass exposure)

