

# Comprehensive Fix Plan: Quota Flow, UI Polish, Scroll Restoration, and Production Hardening

## Overview

This plan addresses 12+ distinct issues spanning quota/upgrade flow gaps, UI text truncation, translation key errors, scroll restoration, font sizing, pricing page copy cleanup, and production hardening.

---

## 1. Fix Missing Upgrade Button After AI Analysis (Weight Gain + All Tools)

**Problem**: `AIInsightCard` shows `QuotaExhaustedCTA` only when `isLimitReached && !hasGenerated`. After generating a result, no upgrade prompt appears.

**Fix**: After every successful AI generation (in `AIInsightCard`, `AIResponseFrame`, and `AIActionButton`), show a contextual upgrade nudge:
- Add a new `PostAnalysisUpgradeHint` component shown after every AI result for free-tier users
- Text pattern: "Unlock 40 monthly analyses for deeper {section} insights" (localized in all 7 langs)
- Add locale keys: `quotaExhausted.postAnalysisHint` with `{{remaining}}` and `{{limit}}` interpolation
- Show in `AIResponseFrame` footer area (already has a Pro link, but enhance it to be more visible)
- Show in `AIInsightCard` after content renders
- Files: `AIResponseFrame.tsx`, `AIInsightCard.tsx`, all 7 locale files

## 2. Ultrasound/Bump Photos Quota Alignment

**Problem**: Currently allows 2 daily photos for free users. Should be: Free = 1/month (weight 2, effectively using 2 of 5 quota), Premium = 2/day.

**Fix**:
- Remove `MAX_DAILY_PHOTOS` constant (daily limit concept) from `AIBumpPhotos.tsx`
- The unified quota system already handles this: weight=2 means free users get effectively 1 ultrasound analysis (2 of 5) before exhaustion
- Add a clear message after analysis showing remaining quota and upgrade CTA
- Files: `AIBumpPhotos.tsx`

## 3. PregnancyComfort AI Buttons Not Linked to Upgrade

**Problem**: Sleep tab buttons guard with `isLimitReached` but NauseaTab's `AIActionButton` already handles this. The sleep tab buttons need unified handling.

**Fix**: Sleep tab already has `guardedAction` that navigates to `/pricing-demo`. Verify NauseaTab uses `AIActionButton` which auto-transforms. Both are already connected. The issue is the 3 small sleep buttons show "Upgrade" text but may not be clear enough.
- Enhance the sleep tab guard buttons to use full `AIActionButton` component or ensure they redirect properly
- Files: `PregnancyComfort.tsx`

## 4. Partner Guide AI Button Not Linked

**Problem**: `AIPartnerGuide.tsx` button calls `generate` directly without checking `isLimitReached`.

**Fix**: Add `isLimitReached` check from `useAIUsage`, redirect to `/pricing-demo` when exhausted. Replace plain `Button` with `AIActionButton`.
- Files: `AIPartnerGuide.tsx`

## 5. Postpartum Mental Health - Untranslated Keys

**Problem**: Code references keys that don't exist in locale files:
- `personalizedPlan` → should be `aiPersonalizedPlan`
- `scoreLabel` → missing
- `riskLevels.{level}.description` → should be `.message`
- `retake` → missing (should be `takeScreeningAgain`)
- `helpfulVideos` → missing (should be `mentalWellnessVideos`)

**Fix**: Add missing keys to all 7 locale files OR fix code to use existing keys. Prefer fixing code to match existing keys.
- Files: `PostpartumMentalHealthCoach.tsx`, all 7 locale files

## 6. Pricing Page - Remove "3 Days Free" References

**Problem**: Multiple locale keys reference "3 days free trial" which no longer applies.

**Fix**: Update these keys across all 7 locales:
- `pricing.trialNote` → "Subscribe now · Cancel anytime"
- `pricing.cta` → "Start Premium Access"
- `pricing.autoRenew` → "Auto-renews. Cancel anytime in Google Play."
- `subscriptionModal.freeTrialDays` → remove/update
- `subscriptionModal.startFreeTrial` → "Subscribe Now"
- `subscriptionModal.trialActivated/trialDesc/trialRemaining` → update
- `paywall.trialTitle` → remove "3 Days Free"
- `paywall.startTrial` → "Subscribe Now"
- Files: All 7 locale files

## 7. Font Sizing Normalization

**Problem**: Dashboard fonts reported as too large; Hospital bag cards have oversized text; Small buttons with oversized text in Appointments and other sections.

**Fix**:
- Audit and normalize font sizes across dashboard cards
- Hospital bag item cards: reduce font from current to `text-xs` / `text-[11px]`
- Appointment buttons: ensure `text-xs` and `whitespace-normal` on small action buttons
- Apply `overflow-wrap-anywhere` class to buttons with long localized text
- Files: `QuickStats.tsx`, `DailyHeroCard.tsx`, `AIHospitalBag.tsx`, `SmartAppointmentReminder.tsx`

## 8. Hide AI Tips When Quota Exhausted

**Problem**: After exhausting 5 free attempts, AI-generated tips still show input forms with no clear indication they need premium.

**Fix**: In tools using `AIActionButton`, the button already transforms to upgrade CTA. Add a subtle message below exhausted state: "Subscribe to Premium to unlock {toolName} analyses" with section-specific context.
- Enhance `AIActionButton` exhausted state label to be section-aware using a new prop `sectionLabel`
- Files: `AIActionButton.tsx`

## 9. Scroll Restoration on Back Navigation

**Problem**: Going back from a tool doesn't return to the same scroll position.

**Fix**: The `useScrollRestoration` hook already exists and handles POP navigation. The issue might be:
- The hook may not be mounted in the right place
- Lazy-loaded content may not have rendered when restoration attempts
- Increase retry attempts from 8 to 12 and delay from 260ms to 350ms
- Files: `useScrollRestoration.ts`

## 10. Production Hardening

### 10a. Lock Down Admin Bypass
- `resetQuota()` sets admin bypass and is exported publicly
- Wrap with `process.env.NODE_ENV !== 'production'` guard
- Remove from public exports or add runtime guard
- Files: `quotaManager.ts`, `smartEngine/index.ts`

### 10b. Centralize Weight Registry
- Create `TOOL_WEIGHTS` typed registry in `types.ts`
- Standard tools = 1, ultrasound/image = 2
- Reference from `AIBumpPhotos` and `AIInsightCard` instead of hardcoding
- Files: `types.ts`, `AIBumpPhotos.tsx`

### 10c. Add Locale Validation Script
- Create `scripts/validate-locales.ts` that compares all locale files against `en.json`
- Detect missing keys, extra keys, broken interpolation
- Add `"validate:locales"` script to `package.json`
- Files: `scripts/validate-locales.ts`, `package.json`

### 10d. Add Quota Tests
- Test free quota exhaustion at 5
- Test premium quota exhaustion at 40
- Test weight-1 vs weight-2 deduction
- Test `canAfford` logic
- Files: `src/services/smartEngine/__tests__/quotaManager.test.ts`

---

## Files Changed Summary

| Category | Files |
|----------|-------|
| Quota/Upgrade Flow | `AIResponseFrame.tsx`, `AIInsightCard.tsx`, `AIActionButton.tsx`, `AIBumpPhotos.tsx` |
| Tool Fixes | `PregnancyComfort.tsx`, `AIPartnerGuide.tsx`, `PostpartumMentalHealthCoach.tsx` |
| UI/Fonts | `AIHospitalBag.tsx`, `SmartAppointmentReminder.tsx`, `QuickStats.tsx`, `DailyHeroCard.tsx` |
| Scroll | `useScrollRestoration.ts` |
| Locales | All 7 locale files (en, ar, de, fr, es, pt, tr) |
| Pricing | All 7 locale files |
| Hardening | `quotaManager.ts`, `types.ts`, `index.ts` |
| Tests | `quotaManager.test.ts` |
| Scripts | `scripts/validate-locales.ts`, `package.json` |

## Execution Order

1. Fix broken translation keys (PostpartumMentalHealth)
2. Remove "3 days" from pricing copy (all locales)
3. Add upgrade nudge after AI results
4. Fix Partner Guide + PregnancyComfort quota linking
5. Ultrasound quota alignment
6. Font sizing normalization
7. Scroll restoration tuning
8. Production hardening (admin bypass, tests, locale validation)

