

# Plan: Fix PDF Report Titles Translation & Arabic Text Issues

## Problems Identified

1. **Smart Pregnancy Plan uses `exportElementToPDF` (html2pdf.js)** — This captures the DOM as-is via canvas screenshot. The report itself renders correctly in the browser (with proper Arabic, RTL, etc.), so the PDF should mirror that. The issue from the user's screenshot was about the **Data Backup PDF** (jsPDF-based), not the Smart Plan.

2. **Data Backup PDF (`exportDataBackupPDF`)** — Uses jsPDF directly with `reshapeArabicForPDF()` which has a broken visual bidi algorithm that garbles Arabic section headers (e.g., `(فحصلا عينة)` instead of correct text).

3. **Arabic reshaping bug in `reshapeArabicForPDF`** — The function applies visual bidi reversal on top of Arabic reshaping. But since jsPDF with right-aligned text (`{ align: 'right' }`) already handles basic RTL character ordering, the manual reversal double-reverses the text, producing garbled output.

4. **Missing key labels** — Dynamic localStorage keys like `Vitamin-tracker-data`, `Insight active *` are not in `keyLabels` map, so they show raw English names even in Arabic.

5. **AI insights dumped raw** — Long AI-generated content from localStorage keys like `Insight active mental-health-coach` gets dumped as raw text without truncation.

6. **Other jsPDF PDF exports affected** — `exportBirthPlanToPDF`, `exportHospitalBagPDF`, `exportAIResultPDF`, and `exportGenericPDF` all call `stripEmojis()` → `reshapeArabicForPDF()`, so they all have the same Arabic garbling issue.

## Root Cause

The `reshapeArabicForPDF` function does two things:
1. `ArabicReshaper.convertArabic(text)` — Converts Arabic to Presentation Forms (correct, needed for letter connection)
2. Visual bidi reversal — Manually reverses the string for LTR rendering

Step 2 conflicts with jsPDF's `{ align: 'right' }` which already handles RTL text ordering. The double-reversal garbles the text.

## Implementation Plan

### Step 1: Fix `reshapeArabicForPDF` in `src/lib/pdfExport.ts`
- **Remove the visual bidi step entirely** — Only keep `ArabicReshaper.convertArabic()` for letter connection
- jsPDF with `{ align: 'right' }` already handles RTL text direction correctly when characters are in Presentation Forms
- This fixes ALL PDF exports at once (birth plan, hospital bag, data backup, AI result, generic)

### Step 2: Expand `SKIP_PATTERNS` to filter AI insights
- Add `'Insight active'`, `'insight'` to `SKIP_PATTERNS` in `exportDataBackupPDF`
- This prevents raw AI-generated content from being dumped into the backup PDF

### Step 3: Add fuzzy key matching in `getKeyLabel`
- After exact match, try case-insensitive partial matching against `keyLabels`
- Add more dynamic key entries: `Vitamin-tracker-data`, `Milestones-completed`, `Notifications`, etc.

### Step 4: Truncate long string values in `formatValue`
- Cap string values at 200 characters with `...` suffix
- Skip values that look like full AI responses (containing markdown headers)

### Step 5: Ensure Smart Plan report PDF quality
- The `exportElementToPDF` approach (html2pdf.js) should work correctly since it captures rendered DOM
- Add `dir="rtl"` and proper font styling to the report container for Arabic to ensure html2canvas captures it correctly
- Add print-specific CSS to ensure no content clipping during capture

## Files to Modify

1. **`src/lib/pdfExport.ts`** — Main changes:
   - Simplify `reshapeArabicForPDF` to only do letter reshaping (remove lines 193-233)
   - Expand `SKIP_PATTERNS` with AI insight keys (line ~593-598)
   - Add more entries to `keyLabels` map (line ~581-587)
   - Improve `getKeyLabel` with fuzzy matching (line ~606-617)
   - Add string truncation in `formatValue` (line ~627-631)

2. **`src/pages/tools/SmartPregnancyPlan.tsx`** — Minor:
   - Ensure report container has proper `dir` and `lang` attributes for html2canvas

## Technical Details

### Arabic Reshaping Fix (Critical)
```typescript
// BEFORE (broken):
function reshapeArabicForPDF(text: string): string {
  const reshaped = ArabicReshaper.convertArabic(text);
  // ... 40 lines of visual bidi that garbles text
  return visualRuns.join('');
}

// AFTER (fixed):
function reshapeArabicForPDF(text: string): string {
  return ArabicReshaper.convertArabic(text);
}
```

All rendering functions already use `{ align: 'right' }` for RTL, so jsPDF handles the text direction. We only need the reshaping for connected Arabic letters.

### Key Label Fuzzy Matching
```typescript
const getKeyLabel = (key: string): string => {
  // Exact match
  if (keyLabels[key]) return keyLabels[key][language] || keyLabels[key].en;
  // Case-insensitive match
  const lowerKey = key.toLowerCase().replace(/[-_\s]/g, '');
  for (const [k, labels] of Object.entries(keyLabels)) {
    if (k.toLowerCase().replace(/[-_\s]/g, '') === lowerKey) 
      return labels[language] || labels.en;
  }
  // Fallback: clean up key name
  return key.replace(/[-_]/g, ' ').replace(/^\w/, c => c.toUpperCase()).trim();
};
```

### AI Content Filtering
Add to `SKIP_PATTERNS`: `'Insight active'`, `'insight_'`, `'ai_result_'`

Add to `formatValue`: truncate strings > 200 chars that contain markdown (`##`, `**`) to just show item count summary.

