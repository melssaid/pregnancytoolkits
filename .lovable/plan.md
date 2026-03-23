

# Pre-Launch Quality Check Plan

## What This Does
The `npm run prelaunch` command runs two checks sequentially:
1. **Locale Validation** (`validate:locales`) — Compares all 6 non-English locale files against `en.json` for missing keys, extra keys, and broken placeholders
2. **Smart Engine Tests** (`vitest run src/services/smartEngine`) — Runs 3 test suites: `quotaManager.test.ts`, `cacheManager.test.ts`, `errorClassification.test.ts`

## Execution
This is a read-only diagnostic task. I will run the prelaunch command and report results — number of locale issues found, test pass/fail status, and any specific failures that need fixing.

## Files Involved
- `scripts/validate-locales.ts` — locale validator
- `src/services/smartEngine/__tests__/quotaManager.test.ts`
- `src/services/smartEngine/__tests__/cacheManager.test.ts`
- `src/services/smartEngine/__tests__/errorClassification.test.ts`
- `src/locales/*.json` (7 files)

