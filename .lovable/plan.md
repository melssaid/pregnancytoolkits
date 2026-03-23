

# Launch Finalization Plan

## Audit Summary

**Architecture is clean.** The prior hardening work is solid:
- `resetQuota` / `clearAdminBypass` are NOT in public exports (index.ts) — confirmed
- Weight resolution is centralized via `resolveWeight()` in types.ts — confirmed
- No hardcoded AI weights remain (the `weight: 0.9` hits are pregnancy body weight distribution data, not AI quota)
- `usePregnancyAI` is deleted — confirmed
- `AIErrorBanner` safely falls back to 'unknown' for unrecognized error types — confirmed

## Remaining Work

### 1. Wire locale validation into package.json
The script `scripts/validate-locales.ts` uses `__dirname` (CommonJS) but package.json has `"type": "module"`. Need to fix the script to use ESM-compatible path resolution, then add npm scripts.

**File: `scripts/validate-locales.ts`**
- Replace `__dirname` with `import.meta.url` + `fileURLToPath`
- Change `import` to ESM syntax (already uses `import`, just fix path)

**File: `package.json`**
- Add `"validate:locales": "npx tsx scripts/validate-locales.ts"`
- Add `"prelaunch": "npm run validate:locales && vitest run src/services/smartEngine"`

### 2. Expand test coverage
The existing test file covers quota and registry well but is missing:
- Cache hit vs cache miss tests
- Error classification tests
- AIErrorBanner safe fallback behavior

**File: `src/services/smartEngine/__tests__/quotaManager.test.ts`**
Add these test groups:
- `describe('cacheManager')` — test `buildCacheKey`, `getCached` (miss), `setCache` + `getCached` (hit), expired cache eviction
- `describe('error classification')` — test `classifyError` for all 6 error types (need to export it or test via integration)

Since `classifyError` is not exported, add a new test file:

**File: `src/services/smartEngine/__tests__/cacheManager.test.ts`**
- Cache miss returns null
- Cache hit returns stored content
- Expired cache returns null
- `invalidateSection` clears section entries
- `clearAllCache` clears all entries

**File: `src/services/smartEngine/__tests__/errorClassification.test.ts`**
- Export `classifyError` from smartEngine.ts (it's a pure function, safe to export)
- Test all 6 error types: 429→rate_limit, 402→payment, 401→auth, network keywords→network, unknown fallback

### 3. Export classifyError for testability
**File: `src/services/smartEngine/smartEngine.ts`**
- Add `export` to `classifyError` function

**File: `src/services/smartEngine/index.ts`**
- Add `classifyError` to exports

### 4. Fix locale script ESM compatibility
**File: `scripts/validate-locales.ts`**
- Use `fileURLToPath(import.meta.url)` instead of `__dirname`

---

## Files Changed

| File | Change |
|------|--------|
| `package.json` | Add `validate:locales` and `prelaunch` scripts |
| `scripts/validate-locales.ts` | Fix ESM compatibility (`__dirname` → `import.meta.url`) |
| `src/services/smartEngine/smartEngine.ts` | Export `classifyError` |
| `src/services/smartEngine/index.ts` | Add `classifyError` export |
| `src/services/smartEngine/__tests__/cacheManager.test.ts` | New — cache hit/miss/expiry tests |
| `src/services/smartEngine/__tests__/errorClassification.test.ts` | New — error normalization tests |

## Final Status

- Quota safety: OK (production guards in place, not publicly exported)
- Weight correctness: OK (centralized registry, zero hardcoded weights)
- AI path unification: OK (useSmartInsight + useSmartChat only, legacy deleted)
- i18n integrity: OK (validation script wired into npm)
- Production safety: OK (admin bypass guarded, error banner handles unknowns)
- Test coverage: Expanded (quota + cache + error classification)

## Remaining Real Risks
- Locale key mismatches can only be fully validated by running the script against current JSON files — will be runnable via `npm run validate:locales`
- Server-side quota sync depends on `ai_usage_logs` table existing and edge function GET handler — already implemented

