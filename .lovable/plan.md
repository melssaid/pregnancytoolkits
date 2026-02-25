

# Plan: Fix Arabic Text Corruption in PDF Exports

## Root Cause Analysis

The PDF shows systematic Arabic text corruption:
- "التقرير الأسبوعي" → "تقرير لاسبوعي" (الف مفقودة)
- "الحمل الذكية" → "لحمل لذكية" (الف مفقودة)
- "مستوى الألم" → "مستو لألم" (ى مفقودة)
- "تقدم الحمل" → "تقد لحمل" (م مفقودة)
- "يوم متبقي" → "يو متبقي" (م مفقودة)

**The real problem**: `ArabicReshaper.convertArabic()` converts Arabic text from standard Unicode (U+0600-U+06FF) to **Arabic Presentation Forms** (U+FE70-U+FEFF). But **Tajawal font does NOT have glyphs** for many of these Presentation Form code points. Tajawal is a modern OpenType font designed for browsers where the text engine does shaping — it doesn't need Presentation Forms glyphs.

When jsPDF tries to render a Presentation Form character that has no glyph in Tajawal, the character is silently dropped — causing the missing letters.

## Solution

**Switch the PDF font from Tajawal to Amiri** for Arabic text. Amiri is a traditional Arabic font with **comprehensive Presentation Forms** (U+FB50-U+FDFF, U+FE70-U+FEFF) glyph coverage. The Amiri font files are already in the project (`public/fonts/Amiri-Regular.ttf`, `public/fonts/Amiri-Bold.ttf`).

For non-Arabic languages, continue using Tajawal (which handles Latin, Turkish, German characters well).

## Changes

### File: `src/lib/pdfExport.ts`

1. **Load Amiri font alongside Tajawal** — Add Amiri to `loadUnicodeFont()` so both fonts are cached
2. **Register both fonts in `setupUnicodeFont()`** — Add Amiri-Regular and Amiri-Bold to jsPDF's VFS
3. **Select font based on language in `createPDFDoc()`** — When `language === 'ar'`, set `_activeFont = 'Amiri'`; otherwise use Tajawal
4. **Update font URL constants** to include Amiri paths

No other files need changes. The fix is entirely within the PDF font selection logic.

## Technical Details

```text
Current flow (broken):
  Arabic text → ArabicReshaper → Presentation Forms → Tajawal font → missing glyphs → garbled text

Fixed flow:
  Arabic text → ArabicReshaper → Presentation Forms → Amiri font → complete glyphs → correct text
  Non-Arabic → no reshaping → Tajawal font → correct text
```

The reshaping logic (`reshapeArabicForPDF`) remains unchanged — it correctly converts Arabic to Presentation Forms for jsPDF. Only the font needs to change.

