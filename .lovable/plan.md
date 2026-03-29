

## Fix: `let score` → `const score` in BabySleepTracker.tsx

**Problem**: ESLint `prefer-const` error — `score` is declared with `let` but never reassigned.

**Fix**: Change line 150 from `let score` to `const score`.

**File**: `src/pages/tools/BabySleepTracker.tsx`, line 150

