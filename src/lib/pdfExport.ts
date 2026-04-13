import jsPDF from 'jspdf';
import ArabicReshaper from 'arabic-reshaper';
import i18n from '@/i18n';

export type PDFProgressCallback = (percent: number) => void;

// =============================================
// Daily export limit (4 per day)
// =============================================
const MAX_DAILY_EXPORTS = 4;
const EXPORT_DATE_KEY = 'pdf_export_date';
const EXPORT_COUNT_KEY = 'pdf_export_count';

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function canExportPDF(): boolean {
  const today = getTodayStr();
  const lastDate = localStorage.getItem(EXPORT_DATE_KEY);
  if (lastDate !== today) return true;
  const count = parseInt(localStorage.getItem(EXPORT_COUNT_KEY) || '0', 10);
  return count < MAX_DAILY_EXPORTS;
}

export function getRemainingExports(): number {
  const today = getTodayStr();
  const lastDate = localStorage.getItem(EXPORT_DATE_KEY);
  if (lastDate !== today) return MAX_DAILY_EXPORTS;
  const count = parseInt(localStorage.getItem(EXPORT_COUNT_KEY) || '0', 10);
  return Math.max(0, MAX_DAILY_EXPORTS - count);
}

export function incrementPDFExportCount(): void {
  const today = getTodayStr();
  const lastDate = localStorage.getItem(EXPORT_DATE_KEY);
  let count = 0;
  if (lastDate === today) {
    count = parseInt(localStorage.getItem(EXPORT_COUNT_KEY) || '0', 10);
  }
  count++;
  localStorage.setItem(EXPORT_DATE_KEY, today);
  localStorage.setItem(EXPORT_COUNT_KEY, String(count));
}

interface PDFExportOptions {
  title: string;
  content: string;
  date: string;
  preferences?: Record<string, string>;
  additionalNotes?: string;
  language?: string;
  contentElement?: HTMLElement;
  onProgress?: PDFProgressCallback;
}

interface DataBackupPDFOptions {
  title: string;
  subtitle?: string;
  data: Record<string, any>;
  language?: 'en' | 'ar' | 'de' | 'fr' | 'es' | 'pt' | 'tr';
  onProgress?: PDFProgressCallback;
}

interface GenericPDFOptions {
  title: string;
  subtitle?: string;
  sections: {
    title: string;
    items: string[] | { label: string; value: string }[];
  }[];
  language?: 'en' | 'ar' | 'de' | 'fr' | 'es' | 'pt' | 'tr';
  accentColor?: { r: number; g: number; b: number };
  onProgress?: PDFProgressCallback;
}

interface MedicalSummaryPDFOptions {
  language?: 'en' | 'ar' | 'de' | 'fr' | 'es' | 'pt' | 'tr';
  profile: {
    isPregnant?: boolean;
    pregnancyWeek: number;
    dueDate?: string | null;
    lastPeriodDate?: string | null;
    bloodType?: string | null;
    weight?: number | null;
    prePregnancyWeight?: number | null;
    height?: number | null;
  };
  summary: {
    currentWeight: string;
    todayKicks: number;
    waterToday: number;
    vitaminsToday: number;
    upcomingAppointments: number;
    weightEntriesCount: number;
    symptomEntriesCount: number;
  };
  weightEntries: Array<{ week?: number; date?: string; weight: string | number }>;
  waterDays: Array<{ date: string; amount: number }>;
  vitaminDays: Array<{ date: string; taken: boolean }>;
  kickSessions: Array<{ date?: string; total: number }>;
  symptoms: Array<{ date?: string; symptom: string; severity?: string }>;
  appointments: Array<{ date?: string; title?: string; doctor?: string }>;
  onProgress?: PDFProgressCallback;
}

// Cache for logo image data
let logoImageCache: string | null = null;

async function loadLogoImage(): Promise<string | null> {
  if (logoImageCache) return logoImageCache;
  try {
    const response = await fetch('/logo.webp');
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => { logoImageCache = reader.result as string; resolve(logoImageCache); };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch { return null; }
}

// =============================================
// Unicode font support for Arabic/Turkish/etc.
// =============================================
async function fetchFontAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`[PDF] Font fetch failed: ${url} (${response.status})`);
      return null;
    }
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Extract base64 from data URL: "data:font/ttf;base64,XXXX"
        const base64 = result.split(',')[1] || null;
        resolve(base64);
      };
      reader.onerror = () => {
        console.warn(`[PDF] Font FileReader failed: ${url}`);
        resolve(null);
      };
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn(`[PDF] Font load error: ${url}`, e);
    return null;
  }
}

let tajawalFontCache: { regular: string; bold: string } | null = null;
let amiriFontCache: { regular: string; bold: string } | null = null;
let cairoFontCache: { regular: string; bold: string } | null = null;

const FONT_URLS = {
  tajawalRegular: '/fonts/Tajawal-Regular.ttf',
  tajawalBold: '/fonts/Tajawal-Bold.ttf',
  amiriRegular: '/fonts/Amiri-Regular.ttf',
  amiriBold: '/fonts/Amiri-Bold.ttf',
  cairoRegular: '/fonts/Cairo-Regular.ttf',
  cairoBold: '/fonts/Cairo-Bold.ttf',
};

async function loadAllFonts(): Promise<void> {
  if (cairoFontCache && tajawalFontCache && amiriFontCache) return;
  
  const [tajawalReg, tajawalBold, amiriReg, amiriBold, cairoReg, cairoBold] = await Promise.all([
    !tajawalFontCache ? fetchFontAsBase64(FONT_URLS.tajawalRegular) : Promise.resolve(null),
    !tajawalFontCache ? fetchFontAsBase64(FONT_URLS.tajawalBold) : Promise.resolve(null),
    !amiriFontCache ? fetchFontAsBase64(FONT_URLS.amiriRegular) : Promise.resolve(null),
    !amiriFontCache ? fetchFontAsBase64(FONT_URLS.amiriBold) : Promise.resolve(null),
    !cairoFontCache ? fetchFontAsBase64(FONT_URLS.cairoRegular) : Promise.resolve(null),
    !cairoFontCache ? fetchFontAsBase64(FONT_URLS.cairoBold) : Promise.resolve(null),
  ]);
  if (tajawalReg && !tajawalFontCache) {
    tajawalFontCache = { regular: tajawalReg, bold: tajawalBold || tajawalReg };
  }
  if (amiriReg && !amiriFontCache) {
    amiriFontCache = { regular: amiriReg, bold: amiriBold || amiriReg };
  }
  if (cairoReg && !cairoFontCache) {
    cairoFontCache = { regular: cairoReg, bold: cairoBold || cairoReg };
    console.log('[PDF] Cairo font loaded successfully');
  }
  if (!cairoFontCache) console.warn('[PDF] Cairo font failed to load');
}

function setupFonts(doc: jsPDF) {
  try {
    if (cairoFontCache) {
      doc.addFileToVFS('Cairo-Regular.ttf', cairoFontCache.regular);
      doc.addFont('Cairo-Regular.ttf', 'Cairo', 'normal');
      doc.addFileToVFS('Cairo-Bold.ttf', cairoFontCache.bold);
      doc.addFont('Cairo-Bold.ttf', 'Cairo', 'bold');
    }
    if (tajawalFontCache) {
      doc.addFileToVFS('Tajawal-Regular.ttf', tajawalFontCache.regular);
      doc.addFont('Tajawal-Regular.ttf', 'Tajawal', 'normal');
      doc.addFileToVFS('Tajawal-Bold.ttf', tajawalFontCache.bold);
      doc.addFont('Tajawal-Bold.ttf', 'Tajawal', 'bold');
    }
    if (amiriFontCache) {
      doc.addFileToVFS('Amiri-Regular.ttf', amiriFontCache.regular);
      doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
      doc.addFileToVFS('Amiri-Bold.ttf', amiriFontCache.bold);
      doc.addFont('Amiri-Bold.ttf', 'Amiri', 'bold');
    }
  } catch { /* fonts already added */ }
}

// ── PDF Context: encapsulates all mutable state per-export ──────────────
interface PDFContext {
  activeFont: string;
  isRTL: boolean;
  reportTitle: string;
}

let _ctx: PDFContext = { activeFont: 'helvetica', isRTL: false, reportTitle: '' };

function setFontBold(doc: jsPDF) {
  doc.setFont(_ctx.activeFont, 'bold');
}
function setFontNormal(doc: jsPDF) {
  doc.setFont(_ctx.activeFont, 'normal');
}

// RTL-aware text helper: flips alignment and x-position for Arabic
function rtlText(doc: jsPDF, text: string, x: number, y: number, options?: any) {
  if (_ctx.isRTL) {
    const opts = { ...options };
    if (!opts.align || opts.align === 'left') {
      opts.align = 'right';
      x = PAGE_W - (x - MARGIN_X) - MARGIN_X;
    } else if (opts.align === 'right') {
      opts.align = 'left';
      x = PAGE_W - (x - MARGIN_X) - MARGIN_X;
    }
    doc.text(text, x, y, opts);
  } else {
    doc.text(text, x, y, options);
  }
}

/**
 * Safe centered text helper. Uses doc.text with align:'center' — the centralized
 * wrapper intercepts this for RTL and converts to manual positioning automatically.
 */
function drawCenteredText(doc: jsPDF, text: string, y: number, opts?: { fontSize?: number }) {
  if (opts?.fontSize) doc.setFontSize(opts.fontSize);
  doc.text(text, PAGE_W / 2, y, { align: 'center' });
}

// Create a pre-configured PDF document with Unicode font support
async function createPDFDoc(language: string): Promise<{ doc: jsPDF }> {
  // Clear reshape cache between exports to prevent stale data
  _reshapedCache.clear();

  await loadAllFonts();
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  
  // Reset all mutable context for this export
  _ctx = {
    activeFont: 'helvetica',
    isRTL: language === 'ar',
    reportTitle: '',
  };

  setupFonts(doc);
  
  // For Arabic: Amiri has the best Arabic glyph coverage (Presentation Forms B)
  // For other languages: Cairo supports Latin + Arabic well
  if (_ctx.isRTL && amiriFontCache) {
    _ctx.activeFont = 'Amiri';
  } else if (cairoFontCache) {
    _ctx.activeFont = 'Cairo';
  } else if (tajawalFontCache) {
    _ctx.activeFont = 'Tajawal';
  }
  doc.setFont(_ctx.activeFont, 'normal');

  // Centralized text pipeline to prevent per-call RTL mistakes
  const rawText = doc.text.bind(doc) as any;
  const rawSplitTextToSize = doc.splitTextToSize.bind(doc) as any;
  const rawGetTextWidth = doc.getTextWidth.bind(doc) as any;
  const PROCESSED_MARKER = '\u2063'; // invisible separator, used to avoid double processing

  const markProcessed = (value: string) => `${PROCESSED_MARKER}${value}`;
  const unmarkIfProcessed = (value: string): { text: string; processed: boolean } => {
    if (value.startsWith(PROCESSED_MARKER)) {
      return { text: value.slice(PROCESSED_MARKER.length), processed: true };
    }
    return { text: value, processed: false };
  };

  (doc as any).text = (text: any, ...args: any[]) => {
    // For RTL, intercept align:'center' and convert to manual positioning
    // This prevents jsPDF's internal alignment from conflicting with pre-reversed Arabic text
    if (_ctx.isRTL && args.length >= 2) {
      const x = args[0];
      const y = args[1];
      const opts = args[2] as any;
      if (opts && opts.align === 'center') {
        const processLine = (line: string) => {
          const { text: unmarked, processed } = unmarkIfProcessed(line);
          return processed ? unmarked : prepareText(unmarked);
        };
        
        if (typeof text === 'string') {
          const prepared = processLine(text);
          const textW = rawGetTextWidth(prepared);
          return rawText(prepared, x - textW / 2, y, { ...opts, align: undefined });
        }
        if (Array.isArray(text)) {
          const processedLines = text.map((line) => processLine(String(line ?? '')));
          // For multi-line, use the widest line to find center offset
          const maxW = Math.max(...processedLines.map((l) => rawGetTextWidth(l)));
          return rawText(processedLines, x - maxW / 2, y, { ...opts, align: undefined });
        }
      }
    }

    if (typeof text === 'string') {
      const { text: unmarked, processed } = unmarkIfProcessed(text);
      return rawText(processed ? unmarked : prepareText(unmarked), ...args);
    }
    if (Array.isArray(text)) {
      const processedLines = text.map((line) => {
        const rawLine = String(line ?? '');
        const { text: unmarked, processed } = unmarkIfProcessed(rawLine);
        return processed ? unmarked : prepareText(unmarked);
      });
      return rawText(processedLines, ...args);
    }
    return rawText(text, ...args);
  };

  (doc as any).splitTextToSize = (text: any, size: any, options?: any) => {
    if (typeof text !== 'string') return rawSplitTextToSize(text, size, options);

    const { text: unmarked, processed } = unmarkIfProcessed(text);
    const prepared = processed ? unmarked : prepareText(unmarked);
    const lines = rawSplitTextToSize(prepared, size, options);

    if (Array.isArray(lines)) {
      return lines.map((line) => markProcessed(String(line ?? '')));
    }
    return markProcessed(String(lines ?? ''));
  };

  (doc as any).getTextWidth = (text: any) => {
    if (typeof text === 'string') {
      const { text: unmarked, processed } = unmarkIfProcessed(text);
      return rawGetTextWidth(processed ? unmarked : prepareText(unmarked));
    }
    return rawGetTextWidth(text);
  };

  return { doc };
}

// Premium color palette
const COLORS = {
  primary: { r: 236, g: 72, b: 153 },
  secondary: { r: 139, g: 92, b: 246 },
  accent: { r: 251, g: 146, b: 60 },
  success: { r: 34, g: 197, b: 94 },
  info: { r: 59, g: 130, b: 246 },
  dark: { r: 30, g: 41, b: 59 },
  muted: { r: 148, g: 163, b: 184 },
  lightBg: { r: 248, g: 250, b: 252 },
  tableBorder: { r: 226, g: 232, b: 240 },
};

type RGB = { r: number; g: number; b: number };

// Track already-reshaped strings for current export context
const _reshapedCache = new Map<string, string>();

/**
 * Removes unsupported visual symbols while preserving textual content.
 */
function sanitizeText(text: string): string {
  if (!text) return '';
  return text
    // eslint-disable-next-line no-misleading-character-class
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2702}-\u{27B0}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{20E3}\u{FE0F}]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Core text processing for PDF output.
 * For RTL (Arabic): sanitize → reshape → bidi-safe reverse for jsPDF LTR rendering.
 * For LTR: sanitize only.
 */
function prepareText(text: string): string {
  const cleaned = sanitizeText(text);
  if (!cleaned || !_ctx.isRTL) return cleaned;

  // Check if text has any Arabic characters that need processing
  const hasStandardArabic = /[\u0600-\u06FF]/.test(cleaned);
  const hasArabicNumerals = /[\u0660-\u0669\u06F0-\u06F9]/.test(cleaned);

  if (!hasStandardArabic && !hasArabicNumerals) return cleaned;

  // Use cache for performance
  const cacheKey = cleaned;
  const cached = _reshapedCache.get(cacheKey);
  if (cached) return cached;

  try {
    const result = processArabicForJsPDF(cleaned);
    _reshapedCache.set(cacheKey, result);
    return result;
  } catch (e) {
    console.warn('[PDF] Arabic processing failed:', e);
    return cleaned;
  }
}

// Compatibility helper name: now only sanitizes (no reshaping)
function stripEmojis(text: string): string {
  return sanitizeText(text);
}

/**
 * Full Arabic text processing pipeline for jsPDF:
 * 1. Reshape Arabic characters (connect letters using Presentation Forms)
 * 2. Reverse for jsPDF's LTR rendering engine
 */
function processArabicForJsPDF(text: string): string {
  if (!text) return text;

  // Step 1: Reshape entire text at once (handles word boundaries & ligatures correctly)
  const reshaped = ArabicReshaper.convertArabic(text);

  // Step 2: If no embedded LTR content, simply reverse entire string
  if (!/[a-zA-Z0-9]/.test(reshaped)) {
    return [...reshaped].reverse().join('');
  }

  // Step 3: Mixed content — split around LTR sequences, preserve their order
  // Match LTR runs: sequences of Latin chars, digits, and common punctuation between them
  const ltrPattern = /([a-zA-ZÀ-ÖØ-öø-ÿ0-9][a-zA-ZÀ-ÖØ-öø-ÿ0-9.,%:()\/\-+@ ]*[a-zA-ZÀ-ÖØ-öø-ÿ0-9]|[a-zA-ZÀ-ÖØ-öø-ÿ0-9])/g;

  const parts: { text: string; isLTR: boolean }[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = ltrPattern.exec(reshaped)) !== null) {
    // Add RTL segment before this LTR match
    if (match.index > lastIndex) {
      parts.push({ text: reshaped.slice(lastIndex, match.index), isLTR: false });
    }
    // Add LTR match (keep original spacing to avoid collapsed words)
    parts.push({ text: match[0], isLTR: true });
    lastIndex = match.index + match[0].length;
  }
  // Add remaining RTL segment
  if (lastIndex < reshaped.length) {
    parts.push({ text: reshaped.slice(lastIndex), isLTR: false });
  }

  // Step 4: Reverse RTL parts' characters, keep LTR parts intact
  const processed = parts.map(p => {
    if (p.isLTR) return p.text;
    return [...p.text].reverse().join('');
  });

  // Step 5: Reverse overall order for RTL paragraph direction in jsPDF's LTR engine
  return processed.reverse().join('');
}

function formatDateForPDF(date: Date, language: string): string {
  const localeMap: Record<string, string> = { ar: 'ar-SA', de: 'de-DE', fr: 'fr-FR', es: 'es-ES', pt: 'pt-BR', tr: 'tr-TR', en: 'en-US' };
  return date.toLocaleDateString(localeMap[language] || 'en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getBrandName(language: string): string {
  const brands: Record<string, string> = { ar: 'أدوات الحمل الذكية', de: 'Schwangerschafts-Toolkit', fr: 'Outils de Grossesse', es: 'Herramientas de Embarazo', pt: 'Ferramentas de Gravidez', tr: 'Gebelik Araçları' };
  return brands[language] || 'Pregnancy Toolkits';
}

/** Get brand name for PDF rendering */
function getBrandNameForPDF(language: string): string {
  return getBrandName(language);
}

// =============================================
// Shared jsPDF helpers
// =============================================

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN_X = 16;
const MARGIN_Y = 12;
const CONTENT_W = PAGE_W - MARGIN_X * 2;

interface PDFState { doc: jsPDF; y: number; pageNum: number; }

function ensureSpace(s: PDFState, needed: number) {
  if (s.y + needed > PAGE_H - MARGIN_Y - 12) {
    addPageWithHeader(s);
  }
}

function addPageWithHeader(s: PDFState) {
  // Add page number to current page before moving to next
  drawPageNumber(s);
  s.doc.addPage();
  s.pageNum++;
  s.y = MARGIN_Y + 4;
  // Continuation header - subtle brand bar
  s.doc.setFillColor(248, 250, 252);
  s.doc.rect(0, 0, PAGE_W, 8, 'F');
  s.doc.setFontSize(6);
  s.doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  // Process entire header as one unit for correct RTL ordering via centralized doc.text wrapper
  const lang = _ctx.isRTL ? 'ar' : 'en';
  const rawHeader = _ctx.reportTitle ? `${getBrandName(lang)} — ${_ctx.reportTitle}` : getBrandName(lang);
  drawCenteredText(s.doc, rawHeader, 5);
  s.y = MARGIN_Y + 6;
}

function drawPageNumber(s: PDFState) {
  s.doc.setFontSize(7);
  s.doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  // Page numbers are just digits, safe to center normally
  s.doc.text(String(s.pageNum), PAGE_W / 2, PAGE_H - 5, { align: 'center' });
}

function addPageNumbers(s: PDFState) {
  // Add page number to the last page
  drawPageNumber(s);
}

function drawLogo(s: PDFState, logoData: string | null) {
  if (logoData) {
    try { s.doc.addImage(logoData, 'PNG', PAGE_W / 2 - 8, s.y, 16, 16); s.y += 20; } catch { s.y += 4; }
  }
}

function drawTitle(s: PDFState, title: string, subtitle?: string) {
  s.doc.setFontSize(18);
  s.doc.setTextColor(30, 41, 59);
  drawCenteredText(s.doc, stripEmojis(title), s.y);
  s.y += 7;
  if (subtitle) {
    s.doc.setFontSize(10);
    s.doc.setTextColor(100, 116, 139);
    drawCenteredText(s.doc, stripEmojis(subtitle), s.y);
    s.y += 5;
  }
}

function drawBrand(s: PDFState, language: string, color: RGB) {
  s.doc.setFontSize(8);
  s.doc.setTextColor(color.r, color.g, color.b);
  drawCenteredText(s.doc, getBrandNameForPDF(language), s.y);
  s.y += 3;
}

function drawDivider(s: PDFState, color: RGB) {
  s.doc.setDrawColor(color.r, color.g, color.b);
  s.doc.setLineWidth(0.5);
  s.doc.line(PAGE_W / 2 - 40, s.y, PAGE_W / 2 + 40, s.y);
  s.y += 6;
}

function drawFooter(s: PDFState, language: string, color: RGB) {
  ensureSpace(s, 15);
  s.y += 4;
  s.doc.setDrawColor(color.r, color.g, color.b);
  s.doc.setLineWidth(0.2);
  s.doc.line(MARGIN_X + 30, s.y, MARGIN_X + CONTENT_W - 30, s.y);
  s.y += 5;
  s.doc.setFontSize(7);
  s.doc.setTextColor(148, 163, 184);
  drawCenteredText(s.doc, formatDateForPDF(new Date(), language), s.y);
  s.y += 4;
  s.doc.setFontSize(7);
  s.doc.setTextColor(color.r, color.g, color.b);
  drawCenteredText(s.doc, getBrandNameForPDF(language), s.y);
  // Add page numbers to all pages at the end
  addPageNumbers(s);
}

// Draw a table row with alternating background
function drawTableRow(s: PDFState, cells: { text: string; width: number; align?: 'left' | 'right' | 'center'; bold?: boolean }[], rowIndex: number, color: RGB) {
  const ROW_H = 6;
  ensureSpace(s, ROW_H + 1);
  
  // Alternating row background
  if (rowIndex % 2 === 0) {
    s.doc.setFillColor(248, 250, 252);
    s.doc.rect(MARGIN_X, s.y, CONTENT_W, ROW_H, 'F');
  }
  
  let x = _ctx.isRTL ? MARGIN_X + CONTENT_W : MARGIN_X;
  
  cells.forEach(cell => {
    const cellX = _ctx.isRTL ? x - cell.width + 3 : x + 3;
    if (cell.bold) setFontBold(s.doc);
    else setFontNormal(s.doc);
    
    s.doc.setFontSize(8);
    const processedText = stripEmojis(cell.text);
    const maxW = cell.width - 6;
    const truncated = s.doc.getTextWidth(processedText) > maxW 
      ? processedText.substring(0, Math.floor(processedText.length * maxW / s.doc.getTextWidth(processedText))) + '...'
      : processedText;
    
    if (_ctx.isRTL) {
      s.doc.text(truncated, cellX + cell.width - 6, s.y + 4, { align: 'right' });
      x -= cell.width;
    } else {
      s.doc.text(truncated, cellX, s.y + 4);
      x += cell.width;
    }
  });
  
  setFontNormal(s.doc);
  s.y += ROW_H;
}

// Detect i18n translation keys (e.g. "groceryList.groceryItems.spinach") and extract readable text
function isI18nKey(value: any): boolean {
  if (typeof value !== 'string') return false;
  // Pattern: at least 2 dots, no spaces, looks like a dotted path
  return /^[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*){2,}$/.test(value);
}

function humanizeI18nKey(value: string): string {
  // Try to resolve via i18n first (gets Arabic/localized translation)
  const translated = i18n.t(value);
  if (translated && translated !== value) return translated;
  
  // Fallback: extract the last segment and convert camelCase to spaces
  const lastSegment = value.split('.').pop() || value;
  return lastSegment
    .replace(/([A-Z])/g, ' $1')
    .replace(/^\w/, c => c.toUpperCase())
    .trim();
}

// Common standalone values that need translation (categories, statuses, types, etc.)
const _valueTranslations: Record<string, Record<string, string>> = {
  // Grocery categories
  produce: { ar: 'الخضروات والفواكه', de: 'Obst & Gemüse', fr: 'Fruits & Légumes', es: 'Frutas y Verduras', pt: 'Frutas e Vegetais', tr: 'Sebze & Meyve' },
  dairy: { ar: 'الألبان', de: 'Milchprodukte', fr: 'Produits laitiers', es: 'Lácteos', pt: 'Laticínios', tr: 'Süt Ürünleri' },
  protein: { ar: 'البروتين', de: 'Eiweiß', fr: 'Protéines', es: 'Proteínas', pt: 'Proteínas', tr: 'Protein' },
  grains: { ar: 'الحبوب', de: 'Getreide', fr: 'Céréales', es: 'Cereales', pt: 'Cereais', tr: 'Tahıllar' },
  supplements: { ar: 'المكملات', de: 'Ergänzungen', fr: 'Suppléments', es: 'Suplementos', pt: 'Suplementos', tr: 'Takviyeler' },
  snacks: { ar: 'الوجبات الخفيفة', de: 'Snacks', fr: 'Collations', es: 'Aperitivos', pt: 'Lanches', tr: 'Atıştırmalıklar' },
  other: { ar: 'أخرى', de: 'Sonstiges', fr: 'Autres', es: 'Otros', pt: 'Outros', tr: 'Diğer' },
  // Common boolean/status values
  true: { ar: 'نعم', de: 'Ja', fr: 'Oui', es: 'Sí', pt: 'Sim', tr: 'Evet' },
  false: { ar: 'لا', de: 'Nein', fr: 'Non', es: 'No', pt: 'Não', tr: 'Hayır' },
  yes: { ar: 'نعم', de: 'Ja', fr: 'Oui', es: 'Sí', pt: 'Sim', tr: 'Evet' },
  no: { ar: 'لا', de: 'Nein', fr: 'Non', es: 'No', pt: 'Não', tr: 'Hayır' },
  // Priority levels
  high: { ar: 'عالية', de: 'Hoch', fr: 'Élevée', es: 'Alta', pt: 'Alta', tr: 'Yüksek' },
  medium: { ar: 'متوسطة', de: 'Mittel', fr: 'Moyenne', es: 'Media', pt: 'Média', tr: 'Orta' },
  low: { ar: 'منخفضة', de: 'Niedrig', fr: 'Basse', es: 'Baja', pt: 'Baixa', tr: 'Baixa' },
  // Common statuses
  completed: { ar: 'مكتمل', de: 'Abgeschlossen', fr: 'Terminé', es: 'Completado', pt: 'Concluído', tr: 'Tamamlandı' },
  pending: { ar: 'قيد الانتظار', de: 'Ausstehend', fr: 'En attente', es: 'Pendiente', pt: 'Pendente', tr: 'Beklemede' },
  active: { ar: 'نشط', de: 'Aktiv', fr: 'Actif', es: 'Activo', pt: 'Ativo', tr: 'Aktif' },
  // Nutrient names
  iron: { ar: 'الحديد', de: 'Eisen', fr: 'Fer', es: 'Hierro', pt: 'Ferro', tr: 'Demir' },
  folate: { ar: 'حمض الفوليك', de: 'Folsäure', fr: 'Folate', es: 'Ácido fólico', pt: 'Folato', tr: 'Folik Asit' },
  calcium: { ar: 'الكالسيوم', de: 'Kalzium', fr: 'Calcium', es: 'Calcio', pt: 'Cálcio', tr: 'Kalsiyum' },
  omega3: { ar: 'أوميغا-3', de: 'Omega-3', fr: 'Oméga-3', es: 'Omega-3', pt: 'Ômega-3', tr: 'Omega-3' },
  // Hospital bag categories
  momessentials: { ar: 'أساسيات الأم', de: 'Mutter-Essentials', fr: 'Essentiels maman', es: 'Esenciales mamá', pt: 'Essenciais da mãe', tr: 'Anne İhtiyaçları' },
  babyessentials: { ar: 'أساسيات الطفل', de: 'Baby-Essentials', fr: 'Essentiels bébé', es: 'Esenciales bebé', pt: 'Essenciais do bebê', tr: 'Bebek İhtiyaçları' },
  documents: { ar: 'المستندات', de: 'Dokumente', fr: 'Documents', es: 'Documentos', pt: 'Documentos', tr: 'Belgeler' },
  comfort: { ar: 'الراحة', de: 'Komfort', fr: 'Confort', es: 'Comodidad', pt: 'Conforto', tr: 'Konfor' },
  toiletries: { ar: 'مستلزمات العناية', de: 'Toilettenartikel', fr: 'Toilette', es: 'Artículos de aseo', pt: 'Higiene', tr: 'Kişisel Bakım' },
  electronics: { ar: 'الإلكترونيات', de: 'Elektronik', fr: 'Électronique', es: 'Electrónica', pt: 'Eletrônicos', tr: 'Elektronik' },
  clothing: { ar: 'الملابس', de: 'Kleidung', fr: 'Vêtements', es: 'Ropa', pt: 'Roupas', tr: 'Giyim' },
  // Meal types
  breakfast: { ar: 'فطور', de: 'Frühstück', fr: 'Petit-déjeuner', es: 'Desayuno', pt: 'Café da manhã', tr: 'Kahvaltı' },
  lunch: { ar: 'غداء', de: 'Mittagessen', fr: 'Déjeuner', es: 'Almuerzo', pt: 'Almoço', tr: 'Öğle yemeği' },
  dinner: { ar: 'عشاء', de: 'Abendessen', fr: 'Dîner', es: 'Cena', pt: 'Jantar', tr: 'Akşam yemeği' },
  snack: { ar: 'وجبة خفيفة', de: 'Snack', fr: 'Collation', es: 'Merienda', pt: 'Lanche', tr: 'Atıştırmalık' },
  // Mood values
  happy: { ar: 'سعيدة', de: 'Glücklich', fr: 'Heureuse', es: 'Feliz', pt: 'Feliz', tr: 'Mutlu' },
  sad: { ar: 'حزينة', de: 'Traurig', fr: 'Triste', es: 'Triste', pt: 'Triste', tr: 'Üzgün' },
  anxious: { ar: 'قلقة', de: 'Ängstlich', fr: 'Anxieuse', es: 'Ansiosa', pt: 'Ansiosa', tr: 'Endişeli' },
  calm: { ar: 'هادئة', de: 'Ruhig', fr: 'Calme', es: 'Tranquila', pt: 'Calma', tr: 'Sakin' },
  tired: { ar: 'متعبة', de: 'Müde', fr: 'Fatiguée', es: 'Cansada', pt: 'Cansada', tr: 'Yorgun' },
  energetic: { ar: 'نشيطة', de: 'Energiegeladen', fr: 'Énergique', es: 'Enérgica', pt: 'Energética', tr: 'Enerjik' },
};

function translateValue(value: string, language: string): string | null {
  const key = value.toLowerCase().replace(/[-_\s]/g, '');
  const entry = _valueTranslations[key];
  if (entry && entry[language]) return entry[language];
  return null;
}

// Resolve a value: if it's an i18n key, translate it; otherwise try value translation
function resolveValue(value: any): any {
  if (isI18nKey(value)) return humanizeI18nKey(value);
  if (typeof value === 'string' && _ctx.isRTL) {
    const lang = i18n.language || 'ar';
    const translated = translateValue(value, lang);
    if (translated) return translated;
  } else if (typeof value === 'string' && i18n.language !== 'en') {
    const translated = translateValue(value, i18n.language);
    if (translated) return translated;
  }
  return value;
}

// Draw a detailed list of array items
function drawDetailedArrayItems(s: PDFState, items: any[], color: RGB, language: string) {
  const maxItems = 30; // Show up to 30 items in detail
  const displayItems = items.slice(0, maxItems);
  
  // Localized field labels for common data keys (including grocery-specific keys)
  const fieldLabels: Record<string, Record<string, string>> = {
    name: { ar: 'الاسم', de: 'Name', fr: 'Nom', es: 'Nombre', pt: 'Nome', tr: 'İsim', en: 'Name' },
    namekey: { ar: 'الاسم', de: 'Name', fr: 'Nom', es: 'Nombre', pt: 'Nome', tr: 'İsim', en: 'Name' },
    date: { ar: 'التاريخ', de: 'Datum', fr: 'Date', es: 'Fecha', pt: 'Data', tr: 'Tarih', en: 'Date' },
    time: { ar: 'الوقت', de: 'Zeit', fr: 'Heure', es: 'Hora', pt: 'Hora', tr: 'Saat', en: 'Time' },
    type: { ar: 'النوع', de: 'Typ', fr: 'Type', es: 'Tipo', pt: 'Tipo', tr: 'Tür', en: 'Type' },
    notes: { ar: 'ملاحظات', de: 'Notizen', fr: 'Notes', es: 'Notas', pt: 'Notas', tr: 'Notlar', en: 'Notes' },
    value: { ar: 'القيمة', de: 'Wert', fr: 'Valeur', es: 'Valor', pt: 'Valor', tr: 'Değer', en: 'Value' },
    status: { ar: 'الحالة', de: 'Status', fr: 'Statut', es: 'Estado', pt: 'Estado', tr: 'Durum', en: 'Status' },
    title: { ar: 'العنوان', de: 'Titel', fr: 'Titre', es: 'Título', pt: 'Título', tr: 'Başlık', en: 'Title' },
    description: { ar: 'الوصف', de: 'Beschreibung', fr: 'Description', es: 'Descripción', pt: 'Descrição', tr: 'Açıklama', en: 'Description' },
    count: { ar: 'العدد', de: 'Anzahl', fr: 'Nombre', es: 'Cantidad', pt: 'Quantidade', tr: 'Sayı', en: 'Count' },
    duration: { ar: 'المدة', de: 'Dauer', fr: 'Durée', es: 'Duración', pt: 'Duração', tr: 'Süre', en: 'Duration' },
    weight: { ar: 'الوزن', de: 'Gewicht', fr: 'Poids', es: 'Peso', pt: 'Peso', tr: 'Ağırlık', en: 'Weight' },
    week: { ar: 'الأسبوع', de: 'Woche', fr: 'Semaine', es: 'Semana', pt: 'Semana', tr: 'Hafta', en: 'Week' },
    packed: { ar: 'محضّر', de: 'Gepackt', fr: 'Emballé', es: 'Empacado', pt: 'Embalado', tr: 'Hazır', en: 'Packed' },
    priority: { ar: 'الأولوية', de: 'Priorität', fr: 'Priorité', es: 'Prioridad', pt: 'Prioridade', tr: 'Öncelik', en: 'Priority' },
    category: { ar: 'الفئة', de: 'Kategorie', fr: 'Catégorie', es: 'Categoría', pt: 'Categoria', tr: 'Kategori', en: 'Category' },
    amount: { ar: 'الكمية', de: 'Menge', fr: 'Quantité', es: 'Cantidad', pt: 'Quantidade', tr: 'Miktar', en: 'Amount' },
    glasses: { ar: 'أكواب', de: 'Gläser', fr: 'Verres', es: 'Vasos', pt: 'Copos', tr: 'Bardak', en: 'Glasses' },
    mood: { ar: 'المزاج', de: 'Stimmung', fr: 'Humeur', es: 'Estado de ánimo', pt: 'Humor', tr: 'Ruh hali', en: 'Mood' },
    taken: { ar: 'تم تناوله', de: 'Eingenommen', fr: 'Pris', es: 'Tomado', pt: 'Tomado', tr: 'Alındı', en: 'Taken' },
    kicks: { ar: 'الركلات', de: 'Tritte', fr: 'Coups', es: 'Patadas', pt: 'Chutes', tr: 'Tekmeler', en: 'Kicks' },
    ischecked: { ar: 'محدد', de: 'Ausgewählt', fr: 'Coché', es: 'Marcado', pt: 'Marcado', tr: 'Seçili', en: 'Checked' },
    pregnancybenefitkey: { ar: 'الفائدة', de: 'Nutzen', fr: 'Bénéfice', es: 'Beneficio', pt: 'Benefício', tr: 'Fayda', en: 'Benefit' },
    nutrients: { ar: 'العناصر الغذائية', de: 'Nährstoffe', fr: 'Nutriments', es: 'Nutrientes', pt: 'Nutrientes', tr: 'Besin Değerleri', en: 'Nutrients' },
  };
  
  const getFieldLabel = (key: string): string => {
    const lowerKey = key.toLowerCase().replace(/[-_]/g, '');
    for (const [k, labels] of Object.entries(fieldLabels)) {
      if (lowerKey === k || lowerKey.includes(k)) return labels[language] || labels.en;
    }
    return key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
  };
  
  displayItems.forEach((item, idx) => {
    if (typeof item === 'object' && item !== null) {
      const fields = Object.entries(item)
        .filter(([k]) => !['id', 'userId', 'user_id', 'createdAt', 'updatedAt', '__typename'].includes(k))
        .slice(0, 8);
      
      if (fields.length === 0) return;
      
      ensureSpace(s, 6 + fields.length * 4.5);
      
      // Item number badge
      s.doc.setFillColor(Math.min(255, color.r + 180), Math.min(255, color.g + 180), Math.min(255, color.b + 180));
      const badgeX = _ctx.isRTL ? MARGIN_X + CONTENT_W - 8 : MARGIN_X + 4;
      s.doc.roundedRect(badgeX, s.y, 8, 5, 1.5, 1.5, 'F');
      s.doc.setFontSize(7);
      s.doc.setTextColor(color.r, color.g, color.b);
      s.doc.text(String(idx + 1), badgeX + 4, s.y + 3.5, { align: 'center' });
      
      // Draw fields
      const fieldStartX = _ctx.isRTL ? MARGIN_X + CONTENT_W - 20 : MARGIN_X + 16;
      fields.forEach(([key, value]) => {
        s.y += 4.5;
        ensureSpace(s, 4.5);
        const displayKey = getFieldLabel(key);
        let displayValue = '';
        const resolved = resolveValue(value);
        if (resolved === null || resolved === undefined) displayValue = '-';
        else if (typeof resolved === 'boolean') displayValue = resolved ? '✓' : '✗';
        else if (typeof resolved === 'string' && /^\d{4}-\d{2}-\d{2}/.test(resolved)) {
          try { displayValue = formatDateForPDF(new Date(resolved), language); } catch { displayValue = String(resolved); }
        }
        else if (Array.isArray(resolved)) displayValue = resolved.length > 0 ? (resolved.every(v => typeof v === 'string') ? resolved.map(v => String(resolveValue(v))).join(', ') : `[${resolved.length}]`) : '-';
        else if (typeof resolved === 'object') {
          const entries = Object.entries(resolved).slice(0, 3);
          displayValue = entries.map(([k, v]) => `${getFieldLabel(k)}: ${String(resolveValue(v)).substring(0, 30)}`).join(' | ');
        }
        else displayValue = String(resolved).substring(0, 100);
        
        setFontBold(s.doc);
        s.doc.setFontSize(7);
        s.doc.setTextColor(71, 85, 105);
        const keyText = stripEmojis(displayKey);
        const valText = stripEmojis(displayValue);
        if (_ctx.isRTL) {
          s.doc.text(keyText + ':', fieldStartX, s.y + 3, { align: 'right' });
          setFontNormal(s.doc);
          s.doc.setTextColor(100, 116, 139);
          s.doc.text(valText, fieldStartX - s.doc.getTextWidth(keyText + ': '), s.y + 3, { align: 'right' });
        } else {
          s.doc.text(keyText + ':', fieldStartX, s.y + 3);
          setFontNormal(s.doc);
          s.doc.setTextColor(100, 116, 139);
          s.doc.text(valText, fieldStartX + s.doc.getTextWidth(keyText + ': ') + 1, s.y + 3);
        }
      });
      s.y += 4;
      
      // Thin separator between items
      if (idx < displayItems.length - 1) {
        s.doc.setDrawColor(COLORS.tableBorder.r, COLORS.tableBorder.g, COLORS.tableBorder.b);
        s.doc.setLineWidth(0.1);
        s.doc.line(MARGIN_X + 14, s.y, MARGIN_X + CONTENT_W - 14, s.y);
        s.y += 2;
      }
    } else {
      // Simple value
      drawBulletItem(s, String(item), color);
    }
  });
  
  if (items.length > maxItems) {
    ensureSpace(s, 5);
    s.doc.setFontSize(7);
    s.doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
    const moreLabels: Record<string, string> = {
      ar: `+${items.length - maxItems} عنصر إضافي`,
      de: `+${items.length - maxItems} weitere Elemente`,
      fr: `+${items.length - maxItems} éléments supplémentaires`,
      es: `+${items.length - maxItems} elementos más`,
      pt: `+${items.length - maxItems} itens adicionais`,
      tr: `+${items.length - maxItems} daha fazla öğe`,
      en: `+${items.length - maxItems} more items`,
    };
    const moreText = stripEmojis(moreLabels[language] || moreLabels.en);
    s.doc.text(moreText, PAGE_W / 2, s.y + 3, { align: 'center' });
    s.y += 5;
  }
}

function drawSectionHeader(s: PDFState, title: string, color: RGB, count?: string) {
  ensureSpace(s, 12);
  const lightR = Math.min(255, color.r + 200), lightG = Math.min(255, color.g + 200), lightB = Math.min(255, color.b + 200);
  s.doc.setFillColor(lightR, lightG, lightB);
  s.doc.roundedRect(MARGIN_X, s.y, CONTENT_W, 8, 2, 2, 'F');
  s.doc.setFillColor(color.r, color.g, color.b);
  // Accent bar on the correct side for RTL
  if (_ctx.isRTL) {
    s.doc.rect(MARGIN_X + CONTENT_W - 2.5, s.y, 2.5, 8, 'F');
  } else {
    s.doc.rect(MARGIN_X, s.y, 2.5, 8, 'F');
  }
  s.doc.setFontSize(10);
  s.doc.setTextColor(color.r, color.g, color.b);
  if (_ctx.isRTL) {
    s.doc.text(stripEmojis(title), MARGIN_X + CONTENT_W - 8, s.y + 5.5, { align: 'right' });
  } else {
    s.doc.text(stripEmojis(title), MARGIN_X + 8, s.y + 5.5);
  }
  if (count) {
    s.doc.setFontSize(8);
    s.doc.setTextColor(148, 163, 184);
    if (_ctx.isRTL) {
      s.doc.text(count, MARGIN_X + 4, s.y + 5.5);
    } else {
      s.doc.text(count, MARGIN_X + CONTENT_W - 4, s.y + 5.5, { align: 'right' });
    }
  }
  s.y += 11;
}

function drawBulletItem(s: PDFState, text: string, color: RGB) {
  // Pre-calculate lines to know how much space we actually need
  s.doc.setFontSize(9);
  const processedText = stripEmojis(text);
  const lines = s.doc.splitTextToSize(processedText, CONTENT_W - 14);
  const neededSpace = lines.length * 4.5 + 2;
  ensureSpace(s, neededSpace);
  
  // Bullet dot
  s.doc.setFillColor(color.r, color.g, color.b);
  if (_ctx.isRTL) {
    s.doc.circle(MARGIN_X + CONTENT_W - 6, s.y + 2, 1.2, 'F');
  } else {
    s.doc.circle(MARGIN_X + 6, s.y + 2, 1.2, 'F');
  }
  // Text
  s.doc.setTextColor(51, 65, 85);
  if (_ctx.isRTL) {
    s.doc.text(lines, MARGIN_X + CONTENT_W - 10, s.y + 3, { align: 'right' });
  } else {
    s.doc.text(lines, MARGIN_X + 10, s.y + 3);
  }
  s.y += neededSpace;
}

function drawLabelValueItem(s: PDFState, label: string, value: string, color: RGB) {
  s.doc.setFontSize(9);
  const lbl = stripEmojis(label) + ': ';
  const lblW = s.doc.getTextWidth(lbl);
  const valLines = s.doc.splitTextToSize(stripEmojis(value), CONTENT_W - 14 - lblW);
  const neededSpace = Math.max(valLines.length, 1) * 4.5 + 2;
  ensureSpace(s, neededSpace);
  
  s.doc.setFillColor(color.r, color.g, color.b);
  if (_ctx.isRTL) {
    s.doc.circle(MARGIN_X + CONTENT_W - 6, s.y + 2, 1.2, 'F');
  } else {
    s.doc.circle(MARGIN_X + 6, s.y + 2, 1.2, 'F');
  }
  setFontBold(s.doc);
  s.doc.setTextColor(71, 85, 105);
  if (_ctx.isRTL) {
    s.doc.text(lbl, MARGIN_X + CONTENT_W - 10, s.y + 3, { align: 'right' });
    setFontNormal(s.doc);
    s.doc.setTextColor(100, 116, 139);
    s.doc.text(valLines, MARGIN_X + CONTENT_W - 10 - lblW, s.y + 3, { align: 'right' });
  } else {
    s.doc.text(lbl, MARGIN_X + 10, s.y + 3);
    setFontNormal(s.doc);
    s.doc.setTextColor(100, 116, 139);
    s.doc.text(valLines, MARGIN_X + 10 + lblW, s.y + 3);
  }
  s.y += neededSpace;
}

// Render markdown text line by line into jsPDF
function renderMarkdownToPDF(s: PDFState, markdown: string, accentColor: RGB) {
  const cleaned = stripEmojis(markdown);
  const lines = cleaned.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { s.y += 2; continue; }

    // Headings
    const h1 = trimmed.match(/^# (.+)$/);
    const h2 = trimmed.match(/^## (.+)$/);
    const h3 = trimmed.match(/^### (.+)$/);
    const h4 = trimmed.match(/^#### (.+)$/);

    if (h1 || h2 || h3 || h4) {
      const level = h1 ? 1 : h2 ? 2 : h3 ? 3 : 4;
      const text = (h1 || h2 || h3 || h4)![1].replace(/\*\*/g, '');
      const sizes = [14, 12, 11, 10];
      ensureSpace(s, 12);
      // Section header bar
      const lightR = Math.min(255, accentColor.r + 200), lightG = Math.min(255, accentColor.g + 200), lightB = Math.min(255, accentColor.b + 200);
      s.doc.setFillColor(lightR, lightG, lightB);
      const barH = level <= 2 ? 8 : 7;
      s.doc.roundedRect(MARGIN_X, s.y, CONTENT_W, barH, 2, 2, 'F');
      s.doc.setFillColor(accentColor.r, accentColor.g, accentColor.b);
      if (_ctx.isRTL) {
        s.doc.rect(MARGIN_X + CONTENT_W - (level <= 2 ? 3 : 2), s.y, level <= 2 ? 3 : 2, barH, 'F');
      } else {
        s.doc.rect(MARGIN_X, s.y, level <= 2 ? 3 : 2, barH, 'F');
      }
      s.doc.setFontSize(sizes[level - 1]);
      setFontBold(s.doc);
      s.doc.setTextColor(level <= 2 ? 30 : accentColor.r, level <= 2 ? 41 : accentColor.g, level <= 2 ? 59 : accentColor.b);
      if (_ctx.isRTL) {
        s.doc.text(text, MARGIN_X + CONTENT_W - 8, s.y + barH - 2.5, { align: 'right' });
      } else {
        s.doc.text(text, MARGIN_X + 8, s.y + barH - 2.5);
      }
      setFontNormal(s.doc);
      s.y += barH + 3;
      continue;
    }

    // Horizontal rules
    if (/^[-*_]{3,}$/.test(trimmed)) {
      s.y += 2;
      s.doc.setDrawColor(accentColor.r, accentColor.g, accentColor.b);
      s.doc.setLineWidth(0.2);
      s.doc.line(MARGIN_X + 20, s.y, MARGIN_X + CONTENT_W - 20, s.y);
      s.y += 4;
      continue;
    }

    // Bullet items
    const bullet = trimmed.match(/^[-*+] (.+)$/);
    if (bullet) {
      drawBulletItem(s, bullet[1].replace(/\*\*/g, ''), accentColor);
      continue;
    }

    // Numbered items
    const numbered = trimmed.match(/^\d+\.\s+(.+)$/);
    if (numbered) {
      drawBulletItem(s, numbered[1].replace(/\*\*/g, ''), accentColor);
      continue;
    }

    // Regular paragraph
    ensureSpace(s, 5);
    s.doc.setFontSize(9);
    s.doc.setTextColor(51, 65, 85);
    // Handle bold within text
    const plainText = trimmed.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
    const wrappedLines = s.doc.splitTextToSize(plainText, CONTENT_W - 8);
    for (const wl of wrappedLines) {
      ensureSpace(s, 4.5);
      if (_ctx.isRTL) {
        s.doc.text(wl, MARGIN_X + CONTENT_W - 4, s.y + 3, { align: 'right' });
      } else {
        s.doc.text(wl, MARGIN_X + 4, s.y + 3);
      }
      s.y += 4.5;
    }
    s.y += 1;
  }
}


// =============================================
// EXPORT FUNCTIONS — all pure jsPDF, no html2canvas
// =============================================

// Generic PDF export
export async function exportGenericPDF(options: GenericPDFOptions): Promise<void> {
  const { title, subtitle, sections, language = 'en', accentColor = COLORS.primary } = options;
  const logoData = await loadLogoImage();
  const { doc } = await createPDFDoc(language);
  const s: PDFState = { doc, y: MARGIN_Y, pageNum: 1 };
  _ctx.reportTitle = title;

  options.onProgress?.(10);
  drawLogo(s, logoData);
  drawTitle(s, title, subtitle);
  drawBrand(s, language, accentColor);
  drawDivider(s, accentColor);

  options.onProgress?.(20);

  sections.forEach((section, idx) => {
    drawSectionHeader(s, section.title, accentColor);
    section.items.forEach((item) => {
      if (typeof item === 'string') {
        drawBulletItem(s, item, accentColor);
      } else {
        drawLabelValueItem(s, item.label, item.value, accentColor);
      }
    });
    s.y += 3;
    options.onProgress?.(20 + Math.round(((idx + 1) / sections.length) * 70));
  });

  drawFooter(s, language, accentColor);
  options.onProgress?.(100);

  const fileName = `${title.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
  s.doc.save(fileName);
}

export async function exportMedicalSummaryPDF(options: MedicalSummaryPDFOptions): Promise<void> {
  const language = (options.language || 'en').split('-')[0] as 'en' | 'ar' | 'de' | 'fr' | 'es' | 'pt' | 'tr';
  const logoData = await loadLogoImage();
  const { doc } = await createPDFDoc(language);
  const s: PDFState = { doc, y: MARGIN_Y, pageNum: 1 };

  const labels = {
    en: {
      reportTitle: 'Pregnancy Medical Report',
      reportSubtitle: 'Professional summary generated from your dashboard data',
      overview: 'Overview',
      profileInfo: 'Pregnancy profile',
      dailySnapshot: 'Daily snapshot',
      weightHistory: 'Weight history',
      hydrationHistory: 'Hydration - last 7 days',
      vitaminsHistory: 'Vitamins - last 7 days',
      kickHistory: 'Kick monitoring sessions',
      symptomHistory: 'Symptoms log',
      appointmentHistory: 'Upcoming appointments',
      currentWeek: 'Current week',
      currentWeight: 'Current weight',
      bloodType: 'Blood type',
      dueDate: 'Due date',
      lastPeriodDate: 'Last period date',
      height: 'Height',
      prePregnancyWeight: 'Pre-pregnancy weight',
      todayKicks: 'Today kicks',
      waterToday: 'Water today',
      vitaminsToday: 'Vitamins today',
      upcomingAppointments: 'Upcoming appointments',
      weightEntries: 'Weight entries',
      symptomEntries: 'Symptom entries',
      status: 'Status',
      pregnant: 'Pregnant',
      planning: 'Planning',
      noData: 'No data recorded',
      taken: 'Recorded',
      notRecorded: 'Not recorded',
      date: 'Date',
      amount: 'Amount',
      severity: 'Severity',
      doctor: 'Doctor',
      fileName: 'pregnancy-medical-report',
      disclaimer: 'This report is generated automatically from your dashboard data and is intended as a supportive summary only. Please consult your healthcare provider for medical decisions.',
      kg: 'kg',
      glasses: 'glasses',
      kicks: 'kicks',
    },
    ar: {
      reportTitle: 'التقرير الطبي للحمل',
      reportSubtitle: 'ملخص احترافي شامل من بيانات لوحة التحكم',
      overview: 'نظرة عامة',
      profileInfo: 'بيانات الحمل',
      dailySnapshot: 'المؤشرات اليومية',
      weightHistory: 'سجل الوزن',
      hydrationHistory: 'سجل شرب الماء - آخر 7 أيام',
      vitaminsHistory: 'سجل الفيتامينات - آخر 7 أيام',
      kickHistory: 'جلسات متابعة حركة الجنين',
      symptomHistory: 'سجل الأعراض',
      appointmentHistory: 'المواعيد القادمة',
      currentWeek: 'الأسبوع الحالي',
      currentWeight: 'الوزن الحالي',
      bloodType: 'فصيلة الدم',
      dueDate: 'تاريخ الولادة المتوقع',
      lastPeriodDate: 'آخر دورة شهرية',
      height: 'الطول',
      prePregnancyWeight: 'الوزن قبل الحمل',
      todayKicks: 'ركلات اليوم',
      waterToday: 'ماء اليوم',
      vitaminsToday: 'فيتامينات اليوم',
      upcomingAppointments: 'المواعيد القادمة',
      weightEntries: 'سجلات الوزن',
      symptomEntries: 'سجلات الأعراض',
      status: 'الحالة',
      pregnant: 'حامل',
      planning: 'تخطيط',
      noData: 'لا توجد بيانات مسجلة',
      taken: 'تم التسجيل',
      notRecorded: 'غير مسجل',
      date: 'التاريخ',
      amount: 'القيمة',
      severity: 'الشدة',
      doctor: 'الطبيبة/الطبيب',
      fileName: 'pregnancy-medical-report',
      disclaimer: 'تم إنشاء هذا التقرير تلقائياً من بيانات لوحة التحكم، وهو مخصص كملخص مساعد فقط ولا يغني عن استشارة الطبيبة أو الطبيب لاتخاذ القرارات الطبية.',
      kg: 'كغ',
      glasses: 'أكواب',
      kicks: 'ركلات',
    },
    de: {
      reportTitle: 'Medizinischer Schwangerschaftsbericht',
      reportSubtitle: 'Professional summary generated from your dashboard data',
      overview: 'Overview', profileInfo: 'Pregnancy profile', dailySnapshot: 'Daily snapshot', weightHistory: 'Weight history', hydrationHistory: 'Hydration - last 7 days', vitaminsHistory: 'Vitamins - last 7 days', kickHistory: 'Kick monitoring sessions', symptomHistory: 'Symptoms log', appointmentHistory: 'Upcoming appointments', currentWeek: 'Current week', currentWeight: 'Current weight', bloodType: 'Blood type', dueDate: 'Due date', lastPeriodDate: 'Last period date', height: 'Height', prePregnancyWeight: 'Pre-pregnancy weight', todayKicks: 'Today kicks', waterToday: 'Water today', vitaminsToday: 'Vitamins today', upcomingAppointments: 'Upcoming appointments', weightEntries: 'Weight entries', symptomEntries: 'Symptom entries', status: 'Status', pregnant: 'Pregnant', planning: 'Planning', noData: 'No data recorded', taken: 'Recorded', notRecorded: 'Not recorded', date: 'Date', amount: 'Amount', severity: 'Severity', doctor: 'Doctor', fileName: 'pregnancy-medical-report', disclaimer: 'This report is generated automatically from your dashboard data and is intended as a supportive summary only. Please consult your healthcare provider for medical decisions.', kg: 'kg', glasses: 'glasses', kicks: 'kicks'
    },
    fr: {
      reportTitle: 'Rapport médical de grossesse',
      reportSubtitle: 'Professional summary generated from your dashboard data',
      overview: 'Overview', profileInfo: 'Pregnancy profile', dailySnapshot: 'Daily snapshot', weightHistory: 'Weight history', hydrationHistory: 'Hydration - last 7 days', vitaminsHistory: 'Vitamins - last 7 days', kickHistory: 'Kick monitoring sessions', symptomHistory: 'Symptoms log', appointmentHistory: 'Upcoming appointments', currentWeek: 'Current week', currentWeight: 'Current weight', bloodType: 'Blood type', dueDate: 'Due date', lastPeriodDate: 'Last period date', height: 'Height', prePregnancyWeight: 'Pre-pregnancy weight', todayKicks: 'Today kicks', waterToday: 'Water today', vitaminsToday: 'Vitamins today', upcomingAppointments: 'Upcoming appointments', weightEntries: 'Weight entries', symptomEntries: 'Symptom entries', status: 'Status', pregnant: 'Pregnant', planning: 'Planning', noData: 'No data recorded', taken: 'Recorded', notRecorded: 'Not recorded', date: 'Date', amount: 'Amount', severity: 'Severity', doctor: 'Doctor', fileName: 'pregnancy-medical-report', disclaimer: 'This report is generated automatically from your dashboard data and is intended as a supportive summary only. Please consult your healthcare provider for medical decisions.', kg: 'kg', glasses: 'glasses', kicks: 'kicks'
    },
    es: {
      reportTitle: 'Informe médico del embarazo',
      reportSubtitle: 'Professional summary generated from your dashboard data',
      overview: 'Overview', profileInfo: 'Pregnancy profile', dailySnapshot: 'Daily snapshot', weightHistory: 'Weight history', hydrationHistory: 'Hydration - last 7 days', vitaminsHistory: 'Vitamins - last 7 days', kickHistory: 'Kick monitoring sessions', symptomHistory: 'Symptoms log', appointmentHistory: 'Upcoming appointments', currentWeek: 'Current week', currentWeight: 'Current weight', bloodType: 'Blood type', dueDate: 'Due date', lastPeriodDate: 'Last period date', height: 'Height', prePregnancyWeight: 'Pre-pregnancy weight', todayKicks: 'Today kicks', waterToday: 'Water today', vitaminsToday: 'Vitamins today', upcomingAppointments: 'Upcoming appointments', weightEntries: 'Weight entries', symptomEntries: 'Symptom entries', status: 'Status', pregnant: 'Pregnant', planning: 'Planning', noData: 'No data recorded', taken: 'Recorded', notRecorded: 'Not recorded', date: 'Date', amount: 'Amount', severity: 'Severity', doctor: 'Doctor', fileName: 'pregnancy-medical-report', disclaimer: 'This report is generated automatically from your dashboard data and is intended as a supportive summary only. Please consult your healthcare provider for medical decisions.', kg: 'kg', glasses: 'glasses', kicks: 'kicks'
    },
    pt: {
      reportTitle: 'Relatório médico da gravidez',
      reportSubtitle: 'Professional summary generated from your dashboard data',
      overview: 'Overview', profileInfo: 'Pregnancy profile', dailySnapshot: 'Daily snapshot', weightHistory: 'Weight history', hydrationHistory: 'Hydration - last 7 days', vitaminsHistory: 'Vitamins - last 7 days', kickHistory: 'Kick monitoring sessions', symptomHistory: 'Symptoms log', appointmentHistory: 'Upcoming appointments', currentWeek: 'Current week', currentWeight: 'Current weight', bloodType: 'Blood type', dueDate: 'Due date', lastPeriodDate: 'Last period date', height: 'Height', prePregnancyWeight: 'Pre-pregnancy weight', todayKicks: 'Today kicks', waterToday: 'Water today', vitaminsToday: 'Vitamins today', upcomingAppointments: 'Upcoming appointments', weightEntries: 'Weight entries', symptomEntries: 'Symptom entries', status: 'Status', pregnant: 'Pregnant', planning: 'Planning', noData: 'No data recorded', taken: 'Recorded', notRecorded: 'Not recorded', date: 'Date', amount: 'Amount', severity: 'Severity', doctor: 'Doctor', fileName: 'pregnancy-medical-report', disclaimer: 'This report is generated automatically from your dashboard data and is intended as a supportive summary only. Please consult your healthcare provider for medical decisions.', kg: 'kg', glasses: 'glasses', kicks: 'kicks'
    },
    tr: {
      reportTitle: 'Gebelik tıbbi raporu',
      reportSubtitle: 'Professional summary generated from your dashboard data',
      overview: 'Overview', profileInfo: 'Pregnancy profile', dailySnapshot: 'Daily snapshot', weightHistory: 'Weight history', hydrationHistory: 'Hydration - last 7 days', vitaminsHistory: 'Vitamins - last 7 days', kickHistory: 'Kick monitoring sessions', symptomHistory: 'Symptoms log', appointmentHistory: 'Upcoming appointments', currentWeek: 'Current week', currentWeight: 'Current weight', bloodType: 'Blood type', dueDate: 'Due date', lastPeriodDate: 'Last period date', height: 'Height', prePregnancyWeight: 'Pre-pregnancy weight', todayKicks: 'Today kicks', waterToday: 'Water today', vitaminsToday: 'Vitamins today', upcomingAppointments: 'Upcoming appointments', weightEntries: 'Weight entries', symptomEntries: 'Symptom entries', status: 'Status', pregnant: 'Pregnant', planning: 'Planning', noData: 'No data recorded', taken: 'Recorded', notRecorded: 'Not recorded', date: 'Date', amount: 'Amount', severity: 'Severity', doctor: 'Doctor', fileName: 'pregnancy-medical-report', disclaimer: 'This report is generated automatically from your dashboard data and is intended as a supportive summary only. Please consult your healthcare provider for medical decisions.', kg: 'kg', glasses: 'glasses', kicks: 'kicks'
    },
  } as const;

  const L = labels[language] || labels.en;
  _ctx.reportTitle = L.reportTitle;

  const formatLocalDate = (value?: string | null) => {
    if (!value) return L.noData;
    try {
      return formatDateForPDF(new Date(value), language);
    } catch {
      return String(value);
    }
  };

  const drawMetricGrid = (items: { label: string; value: string; color: RGB }[]) => {
    const columns = 2;
    const gap = 5;
    const cardW = (CONTENT_W - gap) / columns;
    const cardH = 18;
    items.forEach((item, index) => {
      if (index % columns === 0) {
        ensureSpace(s, cardH + 4);
      }
      const row = Math.floor(index / columns);
      const col = index % columns;
      const x = MARGIN_X + col * (cardW + gap);
      const y = s.y + row * (cardH + 4);
      const fill = { r: Math.min(255, item.color.r + 205), g: Math.min(255, item.color.g + 205), b: Math.min(255, item.color.b + 205) };
      s.doc.setFillColor(fill.r, fill.g, fill.b);
      s.doc.roundedRect(x, y, cardW, cardH, 3, 3, 'F');
      s.doc.setDrawColor(item.color.r, item.color.g, item.color.b);
      s.doc.setLineWidth(0.2);
      s.doc.roundedRect(x, y, cardW, cardH, 3, 3, 'S');
      s.doc.setFontSize(14);
      setFontBold(s.doc);
      s.doc.setTextColor(item.color.r, item.color.g, item.color.b);
      s.doc.text(stripEmojis(item.value), x + cardW / 2, y + 7, { align: 'center' });
      s.doc.setFontSize(7);
      setFontNormal(s.doc);
      s.doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
      const labelLines = s.doc.splitTextToSize(stripEmojis(item.label), cardW - 8);
      s.doc.text(labelLines, x + cardW / 2, y + 12, { align: 'center' });
    });
    s.y += Math.ceil(items.length / columns) * (cardH + 4);
  };

  const drawDetailCard = (label: string, value: string, color: RGB = COLORS.primary) => {
    const safeValue = stripEmojis(value || L.noData);
    s.doc.setFontSize(10);
    const valueLines = s.doc.splitTextToSize(safeValue, CONTENT_W - 16);
    const cardH = 10 + valueLines.length * 4.5;
    ensureSpace(s, cardH + 3);
    s.doc.setFillColor(255, 255, 255);
    s.doc.setDrawColor(COLORS.tableBorder.r, COLORS.tableBorder.g, COLORS.tableBorder.b);
    s.doc.setLineWidth(0.2);
    s.doc.roundedRect(MARGIN_X, s.y, CONTENT_W, cardH, 3, 3, 'FD');
    s.doc.setFillColor(color.r, color.g, color.b);
    if (_ctx.isRTL) {
      s.doc.rect(MARGIN_X + CONTENT_W - 2.5, s.y, 2.5, cardH, 'F');
    } else {
      s.doc.rect(MARGIN_X, s.y, 2.5, cardH, 'F');
    }
    s.doc.setFontSize(7);
    setFontBold(s.doc);
    s.doc.setTextColor(color.r, color.g, color.b);
    if (_ctx.isRTL) {
      s.doc.text(stripEmojis(label), MARGIN_X + CONTENT_W - 7, s.y + 4.5, { align: 'right' });
    } else {
      s.doc.text(stripEmojis(label), MARGIN_X + 7, s.y + 4.5);
    }
    s.doc.setFontSize(10);
    setFontNormal(s.doc);
    s.doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
    if (_ctx.isRTL) {
      s.doc.text(valueLines, MARGIN_X + CONTENT_W - 7, s.y + 9.5, { align: 'right' });
    } else {
      s.doc.text(valueLines, MARGIN_X + 7, s.y + 9.5);
    }
    s.y += cardH + 3;
  };

  const drawRecordSection = (title: string, items: Array<{ label: string; value: string }>, color: RGB) => {
    drawSectionHeader(s, title, color);
    if (items.length === 0) {
      drawDetailCard(title, L.noData, color);
      s.y += 1;
      return;
    }
    items.forEach((item) => drawDetailCard(item.label, item.value, color));
    s.y += 1;
  };

  options.onProgress?.(10);
  s.doc.setFillColor(252, 244, 248);
  s.doc.rect(0, 0, PAGE_W, 50, 'F');
  s.doc.setFillColor(248, 250, 252);
  s.doc.roundedRect(MARGIN_X, 18, CONTENT_W, 24, 5, 5, 'F');
  drawLogo(s, logoData);
  drawTitle(s, L.reportTitle, `${L.reportSubtitle} • ${formatDateForPDF(new Date(), language)}`);
  drawBrand(s, language, COLORS.primary);
  drawDivider(s, COLORS.primary);

  options.onProgress?.(20);
  drawSectionHeader(s, L.overview, COLORS.primary);
  drawMetricGrid([
    { label: L.currentWeek, value: String(options.profile.pregnancyWeek || 0), color: COLORS.primary },
    { label: L.currentWeight, value: stripEmojis(options.summary.currentWeight || L.noData), color: COLORS.secondary },
    { label: L.todayKicks, value: `${options.summary.todayKicks} ${L.kicks}`, color: COLORS.info },
    { label: L.waterToday, value: `${options.summary.waterToday} ${L.glasses}`, color: COLORS.success },
    { label: L.vitaminsToday, value: String(options.summary.vitaminsToday || 0), color: COLORS.accent },
    { label: L.upcomingAppointments, value: String(options.summary.upcomingAppointments || 0), color: COLORS.muted },
  ]);
  s.y += 2;

  drawSectionHeader(s, L.profileInfo, COLORS.secondary);
  const profileItems = [
    { label: L.status, value: options.profile.isPregnant === false ? L.planning : L.pregnant },
    { label: L.currentWeek, value: String(options.profile.pregnancyWeek || 0) },
    { label: L.bloodType, value: options.profile.bloodType || L.noData },
    { label: L.dueDate, value: formatLocalDate(options.profile.dueDate) },
    { label: L.lastPeriodDate, value: formatLocalDate(options.profile.lastPeriodDate) },
    { label: L.height, value: options.profile.height ? `${options.profile.height} ${L.kg === 'كغ' ? 'سم' : 'cm'}` : L.noData },
    { label: L.prePregnancyWeight, value: options.profile.prePregnancyWeight ? `${options.profile.prePregnancyWeight} ${L.kg}` : L.noData },
    { label: L.weightEntries, value: String(options.summary.weightEntriesCount || 0) },
    { label: L.symptomEntries, value: String(options.summary.symptomEntriesCount || 0) },
  ].filter((item) => item.value && item.value !== '0');
  profileItems.forEach((item) => drawDetailCard(item.label, item.value, COLORS.secondary));
  s.y += 1;

  drawSectionHeader(s, L.dailySnapshot, COLORS.info);
  [
    { label: L.currentWeight, value: options.summary.currentWeight || L.noData },
    { label: L.todayKicks, value: `${options.summary.todayKicks} ${L.kicks}` },
    { label: L.waterToday, value: `${options.summary.waterToday} ${L.glasses}` },
    { label: L.vitaminsToday, value: String(options.summary.vitaminsToday || 0) },
  ].forEach((item) => drawDetailCard(item.label, item.value, COLORS.info));
  s.y += 1;

  drawRecordSection(
    L.weightHistory,
    options.weightEntries.map((entry) => ({
      label: entry.week ? `${L.currentWeek} ${entry.week}` : formatLocalDate(entry.date),
      value: `${entry.weight} ${L.kg}`,
    })),
    COLORS.primary,
  );

  drawRecordSection(
    L.hydrationHistory,
    options.waterDays.map((entry) => ({
      label: formatLocalDate(entry.date),
      value: `${entry.amount} ${L.glasses}`,
    })),
    COLORS.success,
  );

  drawRecordSection(
    L.vitaminsHistory,
    options.vitaminDays.map((entry) => ({
      label: formatLocalDate(entry.date),
      value: entry.taken ? L.taken : L.notRecorded,
    })),
    COLORS.accent,
  );

  drawRecordSection(
    L.kickHistory,
    options.kickSessions.map((entry, index) => ({
      label: entry.date ? formatLocalDate(entry.date) : `${L.kickHistory} ${index + 1}`,
      value: `${entry.total} ${L.kicks}`,
    })),
    COLORS.info,
  );

  drawRecordSection(
    L.symptomHistory,
    options.symptoms.map((entry) => ({
      label: entry.symptom || L.noData,
      value: [entry.date ? formatLocalDate(entry.date) : '', entry.severity || ''].filter(Boolean).join(' • ') || L.noData,
    })),
    COLORS.secondary,
  );

  drawRecordSection(
    L.appointmentHistory,
    options.appointments.map((entry) => ({
      label: entry.title || formatLocalDate(entry.date),
      value: [entry.date ? formatLocalDate(entry.date) : '', entry.doctor ? `${L.doctor}: ${entry.doctor}` : ''].filter(Boolean).join(' • ') || L.noData,
    })),
    COLORS.muted,
  );

  ensureSpace(s, 18);
  s.doc.setFillColor(248, 250, 252);
  s.doc.roundedRect(MARGIN_X, s.y, CONTENT_W, 16, 3, 3, 'F');
  s.doc.setFontSize(7);
  s.doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  const disclaimerLines = s.doc.splitTextToSize(stripEmojis(L.disclaimer), CONTENT_W - 14);
  if (_ctx.isRTL) {
    s.doc.text(disclaimerLines, MARGIN_X + CONTENT_W - 7, s.y + 5, { align: 'right' });
  } else {
    s.doc.text(disclaimerLines, MARGIN_X + 7, s.y + 5);
  }
  s.y += 18;

  drawFooter(s, language, COLORS.primary);
  options.onProgress?.(100);
  s.doc.save(`${L.fileName}-${new Date().toISOString().split('T')[0]}.pdf`);
}


// Data backup PDF export — DETAILED version
export async function exportDataBackupPDF(options: DataBackupPDFOptions): Promise<void> {
  const { title, subtitle, data, language = 'en' } = options;
  const logoData = await loadLogoImage();
  const { doc } = await createPDFDoc(language);
  const s: PDFState = { doc, y: MARGIN_Y, pageNum: 1 };
  _ctx.reportTitle = title;

  options.onProgress?.(10);

  const i18nLabels: Record<string, Record<string, string>> = {
    en: { totalItems: 'Total Items', healthData: 'Personal Data', planning: 'Planning', profile: 'Profile & Settings', health: 'Wellness Tracking', appointments: 'Appointments & Reminders', nutrition: 'Nutrition & Meals', birthPlanning: 'Birth Planning & Preparation', other: 'Other Data', items: 'items', noData: 'No data', disclaimer: 'This report was generated automatically from saved data. Always consult your healthcare provider.', generatedOn: 'Generated on', dataEntries: 'Data entries', categories: 'Categories', records: 'records', entry: 'entry' },
    ar: { totalItems: 'إجمالي البيانات', healthData: 'بيانات شخصية', planning: 'التخطيط', profile: 'الملف الشخصي والإعدادات', health: 'متابعة العافية', appointments: 'المواعيد والتذكيرات', nutrition: 'التغذية والوجبات', birthPlanning: 'تخطيط الولادة والتحضير', other: 'بيانات أخرى', items: 'عنصر', noData: 'لا بيانات', disclaimer: 'تم إنشاء هذا التقرير تلقائياً من البيانات المحفوظة. استشيري طبيبتك دائماً.', generatedOn: 'تاريخ الإنشاء', dataEntries: 'إدخالات البيانات', categories: 'الأقسام', records: 'سجلات', entry: 'إدخال' },
    de: { totalItems: 'Gesamtelemente', healthData: 'Persönliche Daten', planning: 'Planung', profile: 'Profil & Einstellungen', health: 'Wohlbefinden-Tracking', appointments: 'Termine & Erinnerungen', nutrition: 'Ernährung & Mahlzeiten', birthPlanning: 'Geburtsplanung & Vorbereitung', other: 'Sonstige Daten', items: 'Elemente', noData: 'Keine Daten', disclaimer: 'Dieser Bericht wurde automatisch erstellt. Konsultieren Sie immer Ihren Arzt.', generatedOn: 'Erstellt am', dataEntries: 'Dateneinträge', categories: 'Kategorien', records: 'Datensätze', entry: 'Eintrag' },
    fr: { totalItems: 'Total éléments', healthData: 'Données personnelles', planning: 'Planification', profile: 'Profil & Paramètres', health: 'Suivi bien-être', appointments: 'Rendez-vous & Rappels', nutrition: 'Nutrition & Repas', birthPlanning: 'Plan de naissance & Préparation', other: 'Autres données', items: 'éléments', noData: 'Aucune donnée', disclaimer: 'Ce rapport a été généré automatiquement. Consultez toujours votre médecin.', generatedOn: 'Généré le', dataEntries: 'Entrées de données', categories: 'Catégories', records: 'enregistrements', entry: 'entrée' },
    es: { totalItems: 'Total elementos', healthData: 'Datos personales', planning: 'Planificación', profile: 'Perfil y Configuración', health: 'Seguimiento de bienestar', appointments: 'Citas y Recordatorios', nutrition: 'Nutrición y Comidas', birthPlanning: 'Plan de parto y Preparación', other: 'Otros datos', items: 'elementos', noData: 'Sin datos', disclaimer: 'Este informe fue generado automáticamente. Consulte siempre a su médico.', generatedOn: 'Generado el', dataEntries: 'Entradas de datos', categories: 'Categorías', records: 'registros', entry: 'entrada' },
    pt: { totalItems: 'Total de itens', healthData: 'Dados pessoais', planning: 'Planejamento', profile: 'Perfil e Configurações', health: 'Acompanhamento de bem-estar', appointments: 'Consultas e Lembretes', nutrition: 'Nutrição e Refeições', birthPlanning: 'Plano de parto e Preparação', other: 'Outros dados', items: 'itens', noData: 'Sem dados', disclaimer: 'Este relatório foi gerado automaticamente. Consulte sempre o seu médico.', generatedOn: 'Gerado em', dataEntries: 'Entradas de dados', categories: 'Categorias', records: 'registros', entry: 'entrada' },
    tr: { totalItems: 'Toplam öğe', healthData: 'Kişisel veriler', planning: 'Planlama', profile: 'Profil ve Ayarlar', health: 'Sağlık Takibi', appointments: 'Randevular ve Hatırlatıcılar', nutrition: 'Beslenme ve Yemekler', birthPlanning: 'Doğum Planı ve Hazırlık', other: 'Diğer veriler', items: 'öğe', noData: 'Veri yok', disclaimer: 'Bu rapor otomatik olarak oluşturulmuştur. Her zaman doktorunuza danışın.', generatedOn: 'Oluşturulma tarihi', dataEntries: 'Veri girdileri', categories: 'Kategoriler', records: 'kayıt', entry: 'girdi' },
  };
  const L = i18nLabels[language] || i18nLabels.en;

  const keyLabels: Record<string, Record<string, string>> = {
    pregnancy_profile: { en: 'Pregnancy Profile', ar: 'ملف الحمل', de: 'Schwangerschaftsprofil', fr: 'Profil de grossesse', es: 'Perfil de embarazo', pt: 'Perfil de gravidez', tr: 'Gebelik Profili' },
    user_settings: { en: 'User Settings', ar: 'إعدادات المستخدم', de: 'Benutzereinstellungen', fr: 'Paramètres', es: 'Configuración', pt: 'Configurações', tr: 'Ayarlar' },
    pregnancy_week: { en: 'Pregnancy Week', ar: 'أسبوع الحمل', de: 'Schwangerschaftswoche', fr: 'Semaine de grossesse', es: 'Semana de embarazo', pt: 'Semana de gravidez', tr: 'Gebelik Haftası' },
    due_date: { en: 'Due Date', ar: 'تاريخ الولادة المتوقع', de: 'Geburtstermin', fr: 'Date prévue', es: 'Fecha de parto', pt: 'Data prevista', tr: 'Beklenen Doğum' },
    last_period_date: { en: 'Last Period Date', ar: 'تاريخ آخر دورة', de: 'Letzte Periode', fr: 'Dernières règles', es: 'Última regla', pt: 'Última menstruação', tr: 'Son Adet Tarihi' },
    kick_sessions: { en: 'Kick Sessions', ar: 'جلسات الركلات', de: 'Tritte-Sitzungen', fr: 'Sessions de coups', es: 'Sesiones de patadas', pt: 'Sessões de chutes', tr: 'Tekme Oturumları' },
    kick_history: { en: 'Kick History', ar: 'سجل الركلات', de: 'Tritte-Verlauf', fr: 'Historique des coups', es: 'Historial de patadas', pt: 'Histórico de chutes', tr: 'Tekme Geçmişi' },
    water_intake: { en: 'Water Intake', ar: 'شرب الماء', de: 'Wasseraufnahme', fr: "Consommation d'eau", es: 'Ingesta de agua', pt: 'Consumo de água', tr: 'Su Tüketimi' },
    water_history: { en: 'Water History', ar: 'سجل شرب الماء', de: 'Wasserverlauf', fr: "Historique d'eau", es: 'Historial de agua', pt: 'Histórico de água', tr: 'Su Geçmişi' },
    weight_records: { en: 'Weight Records', ar: 'سجل الوزن', de: 'Gewichtsaufzeichnungen', fr: 'Enregistrements de poids', es: 'Registros de peso', pt: 'Registros de peso', tr: 'Kilo Kayıtları' },
    vitamin_tracker: { en: 'Vitamin Tracker', ar: 'متتبع الفيتامينات', de: 'Vitamin-Tracker', fr: 'Suivi vitamines', es: 'Seguimiento vitaminas', pt: 'Rastreador de vitaminas', tr: 'Vitamin Takibi' },
    vitamin_records: { en: 'Vitamin Records', ar: 'سجل الفيتامينات', de: 'Vitamin-Aufzeichnungen', fr: 'Enregistrements vitamines', es: 'Registros de vitaminas', pt: 'Registros de vitaminas', tr: 'Vitamin Kayıtları' },
    sleep_records: { en: 'Sleep Records', ar: 'سجل النوم', de: 'Schlafaufzeichnungen', fr: 'Enregistrements de sommeil', es: 'Registros de sueño', pt: 'Registros de sono', tr: 'Uyku Kayıtları' },
    contraction_records: { en: 'Contraction Records', ar: 'سجل الانقباضات', de: 'Wehenaufzeichnungen', fr: 'Enregistrements contractions', es: 'Registros de contracciones', pt: 'Registros de contrações', tr: 'Kasılma Kayıtları' },
    appointments: { en: 'Appointments', ar: 'المواعيد', de: 'Termine', fr: 'Rendez-vous', es: 'Citas', pt: 'Consultas', tr: 'Randevular' },
    reminders: { en: 'Reminders', ar: 'التذكيرات', de: 'Erinnerungen', fr: 'Rappels', es: 'Recordatorios', pt: 'Lembretes', tr: 'Hatırlatıcılar' },
    stretch_reminders: { en: 'Stretch Reminders', ar: 'تذكيرات التمدد', de: 'Dehnungserinnerungen', fr: 'Rappels étirements', es: 'Recordatorios estiramientos', pt: 'Lembretes de alongamento', tr: 'Esneme Hatırlatıcıları' },
    meal_history: { en: 'Meal History', ar: 'سجل الوجبات', de: 'Mahlzeiten-Verlauf', fr: 'Historique repas', es: 'Historial de comidas', pt: 'Histórico de refeições', tr: 'Yemek Geçmişi' },
    grocery_lists: { en: 'Grocery Lists', ar: 'قوائم التسوق', de: 'Einkaufslisten', fr: 'Listes de courses', es: 'Listas de compras', pt: 'Listas de compras', tr: 'Alışveriş Listeleri' },
    food_diary: { en: 'Food Diary', ar: 'يوميات الطعام', de: 'Ernährungstagebuch', fr: 'Journal alimentaire', es: 'Diario alimenticio', pt: 'Diário alimentar', tr: 'Yemek Günlüğü' },
    nutrition_log: { en: 'Nutrition Log', ar: 'سجل التغذية', de: 'Ernährungsprotokoll', fr: 'Journal nutritionnel', es: 'Registro nutricional', pt: 'Registro nutricional', tr: 'Beslenme Kaydı' },
    birth_plans: { en: 'Birth Plans', ar: 'خطط الولادة', de: 'Geburtspläne', fr: 'Plans de naissance', es: 'Planes de parto', pt: 'Planos de parto', tr: 'Doğum Planları' },
    hospital_bag: { en: 'Hospital Bag', ar: 'حقيبة المستشفى', de: 'Kliniktasche', fr: 'Valise maternité', es: 'Bolsa hospital', pt: 'Mala maternidade', tr: 'Hastane Çantası' },
    baby_names: { en: 'Baby Names', ar: 'أسماء الأطفال', de: 'Babynamen', fr: 'Prénoms', es: 'Nombres de bebé', pt: 'Nomes de bebê', tr: 'Bebek İsimleri' },
    bump_photos_local: { en: 'Bump Photos', ar: 'صور البطن', de: 'Bauchfotos', fr: 'Photos du ventre', es: 'Fotos del vientre', pt: 'Fotos da barriga', tr: 'Karın Fotoğrafları' },
    milestones: { en: 'Milestones', ar: 'المعالم المهمة', de: 'Meilensteine', fr: 'Jalons', es: 'Hitos', pt: 'Marcos', tr: 'Kilometre Taşları' },
    cycle_data: { en: 'Cycle Data', ar: 'بيانات الدورة', de: 'Zyklusdaten', fr: 'Données du cycle', es: 'Datos del ciclo', pt: 'Dados do ciclo', tr: 'Döngü Verileri' },
    ovulation_data: { en: 'Ovulation Data', ar: 'بيانات التبويض', de: 'Eisprungdaten', fr: "Données d'ovulation", es: 'Datos de ovulación', pt: 'Dados de ovulação', tr: 'Yumurtlama Verileri' },
    period_history: { en: 'Period History', ar: 'سجل الدورة الشهرية', de: 'Periodenverlauf', fr: 'Historique des règles', es: 'Historial menstrual', pt: 'Histórico menstrual', tr: 'Adet Geçmişi' },
    journal_entries: { en: 'Journal Entries', ar: 'إدخالات اليوميات', de: 'Tagebucheinträge', fr: 'Entrées du journal', es: 'Entradas del diario', pt: 'Entradas do diário', tr: 'Günlük Girdileri' },
    pregnancy_notes: { en: 'Pregnancy Notes', ar: 'ملاحظات الحمل', de: 'Schwangerschaftsnotizen', fr: 'Notes de grossesse', es: 'Notas de embarazo', pt: 'Notas de gravidez', tr: 'Gebelik Notları' },
    doctor_questions: { en: 'Doctor Questions', ar: 'أسئلة الطبيب', de: 'Arztfragen', fr: 'Questions médecin', es: 'Preguntas médico', pt: 'Perguntas médico', tr: 'Doktor Soruları' },
    weekly_summaries: { en: 'Weekly Summaries', ar: 'الملخصات الأسبوعية', de: 'Wöchentliche Zusammenfassungen', fr: 'Résumés hebdomadaires', es: 'Resúmenes semanales', pt: 'Resumos semanais', tr: 'Haftalık Özetler' },
    ai_insights: { en: 'AI Insights', ar: 'تحليلات ذكية', de: 'KI-Einblicke', fr: 'Analyses IA', es: 'Análisis IA', pt: 'Análises IA', tr: 'Yapay Zeka Analizleri' },
    'Pregnancy Grocery List': { en: 'Grocery List', ar: 'قائمة التسوق', de: 'Einkaufsliste', fr: 'Liste de courses', es: 'Lista de compras', pt: 'Lista de compras', tr: 'Alışveriş Listesi' },
    'Pregnancy Notifications': { en: 'Notifications', ar: 'الإشعارات', de: 'Benachrichtigungen', fr: 'Notifications', es: 'Notificaciones', pt: 'Notificações', tr: 'Bildirimler' },
    'Pregnancy Appointments': { en: 'Appointments', ar: 'المواعيد', de: 'Termine', fr: 'Rendez-vous', es: 'Citas', pt: 'Consultas', tr: 'Randevular' },
    'Baby Name Favorites': { en: 'Favorite Names', ar: 'الأسماء المفضلة', de: 'Lieblingsnamen', fr: 'Prénoms favoris', es: 'Nombres favoritos', pt: 'Nomes favoritos', tr: 'Favori İsimler' },
    'Pregnancy-milestones-completed': { en: 'Completed Milestones', ar: 'المعالم المكتملة', de: 'Erreichte Meilensteine', fr: 'Jalons atteints', es: 'Hitos completados', pt: 'Marcos alcançados', tr: 'Tamamlanan Kilometre Taşları' },
    'Milestones-completed': { en: 'Completed Milestones', ar: 'المعالم المكتملة', de: 'Erreichte Meilensteine', fr: 'Jalons atteints', es: 'Hitos completados', pt: 'Marcos alcançados', tr: 'Tamamlanan Kilometre Taşları' },
    'Vitamin-tracker-data': { en: 'Vitamin Tracker', ar: 'متتبع الفيتامينات', de: 'Vitamin-Tracker', fr: 'Suivi vitamines', es: 'Seguimiento vitaminas', pt: 'Rastreador de vitaminas', tr: 'Vitamin Takibi' },
    'Notifications': { en: 'Notifications', ar: 'الإشعارات', de: 'Benachrichtigungen', fr: 'Notifications', es: 'Notificaciones', pt: 'Notificações', tr: 'Bildirimler' },
    'diaper_tracker_data': { en: 'Diaper Tracker', ar: 'متتبع الحفاضات', de: 'Windel-Tracker', fr: 'Suivi couches', es: 'Seguimiento pañales', pt: 'Rastreador de fraldas', tr: 'Bebek Bezi Takibi' },
    'baby_sleep_data': { en: 'Baby Sleep Data', ar: 'بيانات نوم الطفل', de: 'Baby-Schlafdaten', fr: 'Données sommeil bébé', es: 'Datos sueño bebé', pt: 'Dados sono bebê', tr: 'Bebek Uyku Verileri' },
    'baby_growth_data': { en: 'Baby Growth Data', ar: 'بيانات نمو الطفل', de: 'Baby-Wachstumsdaten', fr: 'Données croissance bébé', es: 'Datos crecimiento bebé', pt: 'Dados crescimento bebê', tr: 'Bebek Büyüme Verileri' },
    'pregnancy_tracker_data': { en: 'Pregnancy Tracker', ar: 'متتبع الحمل', de: 'Schwangerschafts-Tracker', fr: 'Suivi de grossesse', es: 'Seguimiento embarazo', pt: 'Rastreador de gravidez', tr: 'Gebelik Takibi' },
    'health_records': { en: 'Health Records', ar: 'السجلات الصحية', de: 'Gesundheitsdaten', fr: 'Dossiers médicaux', es: 'Registros de salud', pt: 'Registros de saúde', tr: 'Sağlık Kayıtları' },
    'mood_records': { en: 'Mood Records', ar: 'سجل المزاج', de: 'Stimmungsaufzeichnungen', fr: 'Suivi humeur', es: 'Registro de estado de ánimo', pt: 'Registros de humor', tr: 'Ruh Hali Kayıtları' },
    'mood_history': { en: 'Mood History', ar: 'سجل المزاج', de: 'Stimmungsverlauf', fr: 'Historique humeur', es: 'Historial de ánimo', pt: 'Histórico de humor', tr: 'Ruh Hali Geçmişi' },
    'smoothie_recipes': { en: 'Smoothie Recipes', ar: 'وصفات العصائر', de: 'Smoothie-Rezepte', fr: 'Recettes smoothies', es: 'Recetas batidos', pt: 'Receitas de smoothies', tr: 'Smoothie Tarifleri' },
    'exercise_history': { en: 'Exercise History', ar: 'سجل التمارين', de: 'Trainingsverlauf', fr: 'Historique exercices', es: 'Historial de ejercicios', pt: 'Histórico de exercícios', tr: 'Egzersiz Geçmişi' },
    'exercise_records': { en: 'Exercise Records', ar: 'سجل التمارين', de: 'Trainingsaufzeichnungen', fr: 'Enregistrements exercices', es: 'Registros de ejercicios', pt: 'Registros de exercícios', tr: 'Egzersiz Kayıtları' },
    'baby_cry_data': { en: 'Baby Cry Data', ar: 'بيانات بكاء الطفل', de: 'Baby-Weindaten', fr: 'Données pleurs bébé', es: 'Datos llanto bebé', pt: 'Dados choro bebê', tr: 'Bebek Ağlama Verileri' },
    'symptom_records': { en: 'Symptom Records', ar: 'سجل الأعراض', de: 'Symptomaufzeichnungen', fr: 'Suivi symptômes', es: 'Registro de síntomas', pt: 'Registros de sintomas', tr: 'Semptom Kayıtları' },
    'blood_pressure_records': { en: 'Blood Pressure', ar: 'ضغط الدم', de: 'Blutdruck', fr: 'Tension artérielle', es: 'Presión arterial', pt: 'Pressão arterial', tr: 'Tansiyon' },
    'glucose_records': { en: 'Glucose Records', ar: 'سجل السكر', de: 'Glukoseaufzeichnungen', fr: 'Glycémie', es: 'Registros de glucosa', pt: 'Registros de glicose', tr: 'Şeker Kayıtları' },
    'craving_history': { en: 'Craving History', ar: 'سجل الرغبات', de: 'Heißhunger-Verlauf', fr: 'Historique envies', es: 'Historial de antojos', pt: 'Histórico de desejos', tr: 'İstek Geçmişi' },
    'skincare_records': { en: 'Skincare Records', ar: 'سجل العناية بالبشرة', de: 'Hautpflege', fr: 'Soins de peau', es: 'Cuidado de piel', pt: 'Cuidados da pele', tr: 'Cilt Bakımı' },
    'partner_notes': { en: 'Partner Notes', ar: 'ملاحظات الشريك', de: 'Partner-Notizen', fr: 'Notes partenaire', es: 'Notas del compañero', pt: 'Notas do parceiro', tr: 'Eş Notları' },
    'budget_data': { en: 'Budget Data', ar: 'بيانات الميزانية', de: 'Budgetdaten', fr: 'Données budget', es: 'Datos de presupuesto', pt: 'Dados de orçamento', tr: 'Bütçe Verileri' },
    'meditation_records': { en: 'Meditation Records', ar: 'سجل التأمل', de: 'Meditationsaufzeichnungen', fr: 'Séances méditation', es: 'Registros de meditación', pt: 'Registros de meditação', tr: 'Meditasyon Kayıtları' },
    'breathing_records': { en: 'Breathing Records', ar: 'سجل تمارين التنفس', de: 'Atemübungen', fr: 'Exercices respiration', es: 'Ejercicios respiración', pt: 'Exercícios de respiração', tr: 'Nefes Egzersizleri' },
  };

  const SKIP_KEYS = ['disclaimer_accepted', 'onboarding_completed', 'user_selected_language', 'last_backup_date'];
  const SKIP_PATTERNS = [
    'session_id', 'session_expiry', 'user_id', 'install_date', 'expanded_categories',
    'encrypted', 'checked_user', 'cookie', 'cache', 'token', 'auth_', '_v2', '_version',
    'sb-', 'supabase', 'Baby gear checked', 'Cycle-tracker-v2', 'Cycle-tracker-data',
    'Insight active', 'insight_', 'ai_result_', 'ai-result-', 'AI_', 'ai_insight',
  ];

  const shouldSkipKey = (key: string): boolean => {
    if (SKIP_KEYS.includes(key)) return true;
    const lowerKey = key.toLowerCase();
    return SKIP_PATTERNS.some(p => lowerKey.includes(p.toLowerCase()));
  };

  const getKeyLabel = (key: string): string => {
    const labels = keyLabels[key];
    if (labels) return labels[language] || labels.en;
    const normalizedKey = key.toLowerCase().replace(/[-_\s]/g, '');
    for (const [k, kLabels] of Object.entries(keyLabels)) {
      if (k.toLowerCase().replace(/[-_\s]/g, '') === normalizedKey) return kLabels[language] || kLabels.en;
    }
    for (const [k, kLabels] of Object.entries(keyLabels)) {
      if (normalizedKey.includes(k.toLowerCase().replace(/[-_\s]/g, ''))) return kLabels[language] || kLabels.en;
    }
    return key.replace(/^Pregnancy[\s-]?/i, '').replace(/_/g, ' ').replace(/[-]/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase()).replace(/\s{2,}/g, ' ').trim();
  };

  const isEncryptedOrRawData = (value: any): boolean => {
    if (typeof value === 'string' && value.length > 300 && /^[A-Za-z0-9+/=]+$/.test(value.replace(/\s/g, ''))) return true;
    return false;
  };

  // Format a simple value for inline display
  const formatSimpleValue = (value: any): string => {
    if (value === null || value === undefined) return L.noData;
    if (isEncryptedOrRawData(value)) return `[encrypted]`;
    if (typeof value === 'string') {
      if (isI18nKey(value)) return humanizeI18nKey(value);
      if (/^\d{4}-\d{2}-\d{2}/.test(value)) { try { return formatDateForPDF(new Date(value), language); } catch { return value; } }
      if (/^[a-f0-9-]{36}$/i.test(value) || /^[a-f0-9]{20,}$/i.test(value)) return '';
      // Try translating standalone values (categories, statuses, etc.)
      const translated = translateValue(value, language);
      if (translated) return translated;
      return value;
    }
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return value ? '✓' : '✗';
    return String(value);
  };

  // Categorize data with raw values preserved for detailed rendering
  interface DataItem { key: string; label: string; rawValue: any; }
  const categoryMeta: Record<string, { label: string; color: RGB }> = {
    profile: { label: L.profile, color: COLORS.info },
    health: { label: L.health, color: COLORS.primary },
    appointments: { label: L.appointments, color: COLORS.secondary },
    nutrition: { label: L.nutrition, color: COLORS.success },
    planning: { label: L.birthPlanning, color: COLORS.accent },
    other: { label: L.other, color: COLORS.muted }
  };

  const categories: Record<string, DataItem[]> = { profile: [], health: [], appointments: [], nutrition: [], planning: [], other: [] };

  Object.entries(data).forEach(([key, value]) => {
    if (shouldSkipKey(key)) return;
    if (isEncryptedOrRawData(value)) return;
    // Skip empty values
    if (value === null || value === undefined) return;
    if (typeof value === 'string' && value.trim() === '') return;
    if (Array.isArray(value) && value.length === 0) return;
    if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) return;
    
    const displayLabel = getKeyLabel(key);
    const item: DataItem = { key, label: displayLabel, rawValue: value };
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('profile') || lowerKey.includes('settings') || lowerKey.includes('week') || (lowerKey.includes('date') && !lowerKey.includes('update'))) categories.profile.push(item);
    else if (lowerKey.includes('kick') || lowerKey.includes('weight') || lowerKey.includes('vitamin') || lowerKey.includes('sleep') || lowerKey.includes('contraction') || lowerKey.includes('water') || lowerKey.includes('mood') || lowerKey.includes('milestone') || lowerKey.includes('diaper')) categories.health.push(item);
    else if (lowerKey.includes('appointment') || lowerKey.includes('reminder') || lowerKey.includes('notification')) categories.appointments.push(item);
    else if (lowerKey.includes('meal') || lowerKey.includes('food') || lowerKey.includes('nutrition') || lowerKey.includes('grocery') || lowerKey.includes('smoothie')) categories.nutrition.push(item);
    else if (lowerKey.includes('birth') || lowerKey.includes('hospital') || lowerKey.includes('baby_name') || lowerKey.includes('baby name') || lowerKey.includes('bag')) categories.planning.push(item);
    else categories.other.push(item);
  });

  const totalItems = Object.values(categories).reduce((sum, cat) => sum + cat.length, 0);
  const catEntries = Object.entries(categories).filter(([, items]) => items.length > 0);

  // ===== COVER PAGE =====
  drawLogo(s, logoData);
  s.y += 4;
  drawTitle(s, title, subtitle || formatDateForPDF(new Date(), language));
  drawBrand(s, language, COLORS.primary);
  s.y += 2;
  drawDivider(s, COLORS.primary);

  options.onProgress?.(15);

  // Summary statistics cards (2 rows)
  ensureSpace(s, 30);
  const statW = (CONTENT_W - 12) / 3;
  const stats = [
    { value: totalItems, label: L.totalItems, color: COLORS.primary },
    { value: catEntries.length, label: L.categories, color: COLORS.secondary },
    { value: Object.values(data).filter(v => Array.isArray(v)).reduce((s, v) => s + (v as any[]).length, 0), label: L.records, color: COLORS.success },
  ];
  stats.forEach((st, i) => {
    const x = MARGIN_X + i * (statW + 4);
    const lightR = Math.min(255, st.color.r + 180), lightG = Math.min(255, st.color.g + 180), lightB = Math.min(255, st.color.b + 180);
    s.doc.setFillColor(lightR, lightG, lightB);
    s.doc.roundedRect(x, s.y, statW, 14, 3, 3, 'F');
    s.doc.setFontSize(16);
    setFontBold(s.doc);
    s.doc.setTextColor(st.color.r, st.color.g, st.color.b);
    s.doc.text(String(st.value), x + statW / 2, s.y + 6, { align: 'center' });
    s.doc.setFontSize(7);
    setFontNormal(s.doc);
    s.doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
    s.doc.text(stripEmojis(st.label), x + statW / 2, s.y + 11.5, { align: 'center' });
  });
  s.y += 18;

  // Category overview mini-cards
  ensureSpace(s, 14);
  s.doc.setFillColor(248, 250, 252);
  s.doc.roundedRect(MARGIN_X, s.y, CONTENT_W, 10 + Math.ceil(catEntries.length / 3) * 8, 3, 3, 'F');
  const overviewY = s.y + 3;
  catEntries.forEach(([cat, items], i) => {
    const meta = categoryMeta[cat];
    const col = i % 3;
    const row = Math.floor(i / 3);
    const cellW = (CONTENT_W - 16) / 3;
    const cellX = MARGIN_X + 8 + col * cellW;
    const cellY = overviewY + row * 8;
    
    s.doc.setFillColor(meta.color.r, meta.color.g, meta.color.b);
    s.doc.circle(cellX + 2, cellY + 2.5, 1.5, 'F');
    
    s.doc.setFontSize(7);
    setFontBold(s.doc);
    s.doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
    s.doc.text(`${stripEmojis(meta.label)} (${items.length})`, cellX + 6, cellY + 3.5);
    setFontNormal(s.doc);
  });
  s.y += 12 + Math.ceil(catEntries.length / 3) * 8;

  options.onProgress?.(25);

  // ===== DETAILED DATA SECTIONS =====
  catEntries.forEach(([cat, items], catIdx) => {
    const meta = categoryMeta[cat];
    drawSectionHeader(s, `${stripEmojis(meta.label)}`, meta.color, `${items.length} ${L.items}`);
    
    items.forEach((item, itemIdx) => {
      const { rawValue } = item;
      
      if (typeof rawValue === 'string' || typeof rawValue === 'number' || typeof rawValue === 'boolean') {
        // Simple scalar values — render as label: value
        drawLabelValueItem(s, item.label, formatSimpleValue(rawValue), meta.color);
      } else if (Array.isArray(rawValue)) {
        // Array data — render with detail
        ensureSpace(s, 8);
        // Sub-header for this data key
        s.doc.setFontSize(9);
        setFontBold(s.doc);
        s.doc.setTextColor(meta.color.r, meta.color.g, meta.color.b);
        const arrayLabel = `${stripEmojis(item.label)} — ${rawValue.length} ${L.records}`;
        if (_ctx.isRTL) {
          s.doc.text(arrayLabel, MARGIN_X + CONTENT_W - 6, s.y + 3, { align: 'right' });
        } else {
          s.doc.text(arrayLabel, MARGIN_X + 6, s.y + 3);
        }
        setFontNormal(s.doc);
        s.y += 6;
        
        // Render detailed items
        drawDetailedArrayItems(s, rawValue, meta.color, language);
        s.y += 2;
      } else if (typeof rawValue === 'object' && rawValue !== null) {
        // Object — render all visible fields
        const fields = Object.entries(rawValue)
          .filter(([k]) => !['id', 'userId', 'user_id', 'createdAt', 'updatedAt', '__typename'].includes(k))
          .filter(([, v]) => v !== null && v !== undefined && v !== '');
        
        if (fields.length > 0) {
          ensureSpace(s, 8);
          s.doc.setFontSize(9);
          setFontBold(s.doc);
          s.doc.setTextColor(meta.color.r, meta.color.g, meta.color.b);
          if (_ctx.isRTL) {
            s.doc.text(stripEmojis(item.label), MARGIN_X + CONTENT_W - 6, s.y + 3, { align: 'right' });
          } else {
            s.doc.text(stripEmojis(item.label), MARGIN_X + 6, s.y + 3);
          }
          setFontNormal(s.doc);
          s.y += 6;
          
          fields.forEach(([fieldKey, fieldValue]) => {
            const displayKey = fieldKey.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase()).trim();
            let displayVal = '';
            if (Array.isArray(fieldValue)) {
              displayVal = fieldValue.length > 0 
                ? (fieldValue.every((v: any) => typeof v === 'string') ? fieldValue.join(', ') : `${fieldValue.length} ${L.items}`)
                : L.noData;
            } else if (typeof fieldValue === 'object' && fieldValue !== null) {
              const subKeys = Object.keys(fieldValue);
              displayVal = subKeys.slice(0, 3).map(k => `${k}: ${String((fieldValue as any)[k]).substring(0, 30)}`).join(' | ');
            } else {
              displayVal = formatSimpleValue(fieldValue);
            }
            if (displayVal) {
              drawLabelValueItem(s, displayKey, displayVal, meta.color);
            }
          });
          s.y += 2;
        }
      }
      
      // Separator between items within a category
      if (itemIdx < items.length - 1 && (Array.isArray(rawValue) || (typeof rawValue === 'object' && !Array.isArray(rawValue)))) {
        s.doc.setDrawColor(COLORS.tableBorder.r, COLORS.tableBorder.g, COLORS.tableBorder.b);
        s.doc.setLineWidth(0.1);
        s.doc.line(MARGIN_X + 20, s.y, MARGIN_X + CONTENT_W - 20, s.y);
        s.y += 3;
      }
    });
    
    s.y += 4;
    options.onProgress?.(25 + Math.round(((catIdx + 1) / catEntries.length) * 65));
  });

  // Disclaimer
  ensureSpace(s, 12);
  s.doc.setFillColor(248, 250, 252);
  s.doc.roundedRect(MARGIN_X, s.y, CONTENT_W, 12, 2, 2, 'F');
  s.doc.setFontSize(7);
  s.doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  const disclaimerLines = s.doc.splitTextToSize(stripEmojis(L.disclaimer), CONTENT_W - 12);
  disclaimerLines.forEach((line: string, i: number) => {
    s.doc.text(line, PAGE_W / 2, s.y + 4 + i * 3, { align: 'center' });
  });
  s.y += 14;

  drawFooter(s, language, COLORS.primary);
  options.onProgress?.(100);

  s.doc.save(`pregnancy-data-backup-${new Date().toISOString().split('T')[0]}.pdf`);
}


// Birth plan PDF export
export async function exportBirthPlanToPDF(options: PDFExportOptions): Promise<void> {
  const { title, content, date, preferences, additionalNotes, language = 'en' } = options;
  const logoData = await loadLogoImage();
  const { doc } = await createPDFDoc(language);
  _ctx.reportTitle = title;
  const accentColor = COLORS.primary;

  const labels: Record<string, Record<string, string>> = {
    en: { title: 'Birth Plan', prefSummary: 'Preferences Summary', prefCount: 'preferences selected', notesTitle: 'Additional Notes', footer: 'This birth plan is a guide for your healthcare team. Flexibility may be needed based on medical circumstances.', brand: 'Pregnancy Toolkits' },
    ar: { title: 'خطة الولادة', prefSummary: 'ملخص التفضيلات', prefCount: 'تفضيلات محددة', notesTitle: 'ملاحظات إضافية', footer: 'خطة الولادة هذه هي دليل لفريقك الطبي. قد تكون المرونة مطلوبة بناءً على الظروف الطبية.', brand: 'Pregnancy Toolkits' },
    de: { title: 'Geburtsplan', prefSummary: 'Präferenzen Zusammenfassung', prefCount: 'Präferenzen ausgewählt', notesTitle: 'Zusätzliche Hinweise', footer: 'Dieser Geburtsplan ist ein Leitfaden für Ihr medizinisches Team.', brand: 'Pregnancy Toolkits' },
    tr: { title: 'Doğum Planı', prefSummary: 'Tercihler Özeti', prefCount: 'tercih seçildi', notesTitle: 'Ek Notlar', footer: 'Bu doğum planı sağlık ekibiniz için bir rehberdir.', brand: 'Pregnancy Toolkits' },
    fr: { title: 'Plan de naissance', prefSummary: 'Résumé des préférences', prefCount: 'préférences sélectionnées', notesTitle: 'Notes supplémentaires', footer: 'Ce plan de naissance est un guide pour votre équipe soignante.', brand: 'Pregnancy Toolkits' },
    es: { title: 'Plan de parto', prefSummary: 'Resumen de preferencias', prefCount: 'preferencias seleccionadas', notesTitle: 'Notas adicionales', footer: 'Este plan de parto es una guía para su equipo médico.', brand: 'Pregnancy Toolkits' },
    pt: { title: 'Plano de parto', prefSummary: 'Resumo das preferências', prefCount: 'preferências selecionadas', notesTitle: 'Notas adicionais', footer: 'Este plano de parto é um guia para a sua equipa médica.', brand: 'Pregnancy Toolkits' },
  };
  const l = labels[language] || labels.en;

  const s: PDFState = { doc, y: MARGIN_Y, pageNum: 1 };

  options.onProgress?.(10);

  drawLogo(s, logoData);
  drawTitle(s, l.title, date);
  drawBrand(s, language, accentColor);
  drawDivider(s, accentColor);

  // Preferences summary
  const prefCount = preferences ? Object.entries(preferences).filter(([, v]) => v).length : 0;
  if (prefCount > 0) {
    ensureSpace(s, 14);
    drawSectionHeader(s, `${l.prefSummary} (${prefCount} ${l.prefCount})`, accentColor);
    Object.entries(preferences!).filter(([, v]) => v).forEach(([, value]) => {
      drawBulletItem(s, value, accentColor);
    });
    s.y += 3;
  }

  options.onProgress?.(25);

  // Additional notes
  if (additionalNotes && additionalNotes.trim()) {
    drawSectionHeader(s, l.notesTitle, accentColor);
    ensureSpace(s, 6);
    s.doc.setFontSize(9);
    s.doc.setTextColor(51, 65, 85);
    const noteLines = s.doc.splitTextToSize(stripEmojis(additionalNotes.trim()), CONTENT_W - 12);
    for (const nl of noteLines) {
      ensureSpace(s, 4.5);
      if (_ctx.isRTL) {
        s.doc.text(nl, MARGIN_X + CONTENT_W - 6, s.y + 3, { align: 'right' });
      } else {
        s.doc.text(nl, MARGIN_X + 6, s.y + 3);
      }
      s.y += 4.5;
    }
    s.y += 4;
  }

  options.onProgress?.(35);

  // Main content (markdown)
  renderMarkdownToPDF(s, content, accentColor);

  options.onProgress?.(90);

  // Disclaimer footer
  ensureSpace(s, 10);
  s.doc.setFontSize(7);
  s.doc.setTextColor(148, 163, 184);
  const footerLines = s.doc.splitTextToSize(l.footer, CONTENT_W - 20);
  s.doc.text(footerLines, PAGE_W / 2, s.y, { align: 'center' });
  s.y += footerLines.length * 3.5 + 3;

  drawFooter(s, language, accentColor);
  options.onProgress?.(100);

  s.doc.save(`birth-plan-${new Date().toISOString().split('T')[0]}.pdf`);
}

export const MAX_SAVED_PLANS = 9;


// Hospital Bag Checklist Types
interface HospitalBagItem {
  id: string;
  name: string;
  category: 'mom' | 'baby' | 'partner' | 'documents';
  packed: boolean;
  priority: 'essential' | 'recommended' | 'optional';
}

interface HospitalBagPDFOptions {
  title: string;
  subtitle?: string;
  items: HospitalBagItem[];
  language?: 'en' | 'ar' | 'de' | 'fr' | 'es' | 'pt' | 'tr';
  onProgress?: PDFProgressCallback;
  labels: {
    mom: string; baby: string; partner: string; documents: string;
    packed: string; notPacked: string; essential: string; recommended: string; optional: string;
    progress: string; totalItems: string;
  };
}

// Hospital Bag PDF export — pure jsPDF
export async function exportHospitalBagPDF(options: HospitalBagPDFOptions): Promise<void> {
  const { title, subtitle, items, language = 'en', labels } = options;
  const logoData = await loadLogoImage();
  const accentColor = { r: 20, g: 184, b: 166 };
  _ctx.reportTitle = title;
  const { doc } = await createPDFDoc(language);
  const s: PDFState = { doc, y: MARGIN_Y, pageNum: 1 };

  options.onProgress?.(10);
  drawLogo(s, logoData);
  drawTitle(s, title, subtitle);
  drawBrand(s, language, accentColor);
  drawDivider(s, accentColor);

  options.onProgress?.(20);

  const packedCount = items.filter(i => i.packed).length;
  const totalCount = items.length;
  const progress = Math.round((packedCount / totalCount) * 100);

  // Progress bar
  s.doc.setFillColor(241, 245, 249);
  s.doc.roundedRect(MARGIN_X, s.y, CONTENT_W, 14, 3, 3, 'F');
  s.doc.setFontSize(11);
  s.doc.setTextColor(30, 41, 59);
  if (_ctx.isRTL) {
    s.doc.text(`${stripEmojis(labels.progress)}: ${progress}%`, MARGIN_X + CONTENT_W - 6, s.y + 6, { align: 'right' });
    s.doc.setFontSize(9);
    s.doc.setTextColor(100, 116, 139);
    s.doc.text(`${packedCount} / ${totalCount} ${stripEmojis(labels.totalItems)}`, MARGIN_X + 6, s.y + 6);
  } else {
    s.doc.text(`${stripEmojis(labels.progress)}: ${progress}%`, MARGIN_X + 6, s.y + 6);
    s.doc.setFontSize(9);
    s.doc.setTextColor(100, 116, 139);
    s.doc.text(`${packedCount} / ${totalCount} ${stripEmojis(labels.totalItems)}`, MARGIN_X + CONTENT_W - 6, s.y + 6, { align: 'right' });
  }
  const barY = s.y + 9;
  const barW = CONTENT_W - 12;
  s.doc.setFillColor(226, 232, 240);
  s.doc.roundedRect(MARGIN_X + 6, barY, barW, 3, 1.5, 1.5, 'F');
  if (progress > 0) { s.doc.setFillColor(20, 184, 166); s.doc.roundedRect(MARGIN_X + 6, barY, barW * (progress / 100), 3, 1.5, 1.5, 'F'); }
  s.y += 20;

  options.onProgress?.(30);

  const categoryColors: Record<string, [number, number, number]> = { mom: [236, 72, 153], baby: [59, 130, 246], partner: [139, 92, 246], documents: [245, 158, 11] };
  const categoryLabels: Record<string, string> = { mom: labels.mom, baby: labels.baby, partner: labels.partner, documents: labels.documents };
  const categoryStats: Record<string, HospitalBagItem[]> = {
    mom: items.filter(i => i.category === 'mom'), baby: items.filter(i => i.category === 'baby'),
    partner: items.filter(i => i.category === 'partner'), documents: items.filter(i => i.category === 'documents'),
  };

  // Category summary cards
  const cardW = (CONTENT_W - 12) / 4;
  let cardX = MARGIN_X;
  Object.entries(categoryStats).forEach(([cat, catItems]) => {
    const [r, g, b] = categoryColors[cat];
    const catPacked = catItems.filter(i => i.packed).length;
    s.doc.setFillColor(Math.min(255, r + 180), Math.min(255, g + 180), Math.min(255, b + 180));
    s.doc.roundedRect(cardX, s.y, cardW, 14, 2, 2, 'F');
    s.doc.setFontSize(12); s.doc.setTextColor(r, g, b);
    s.doc.text(`${catPacked}/${catItems.length}`, cardX + cardW / 2, s.y + 6, { align: 'center' });
    s.doc.setFontSize(7); s.doc.setTextColor(148, 163, 184);
    s.doc.text(stripEmojis(categoryLabels[cat]), cardX + cardW / 2, s.y + 11, { align: 'center' });
    cardX += cardW + 4;
  });
  s.y += 20;

  options.onProgress?.(40);

  // Items by category
  const catEntries = Object.entries(categoryStats);
  catEntries.forEach(([cat, catItems], catIdx) => {
    if (catItems.length === 0) return;
    const [r, g, b] = categoryColors[cat];
    const catPacked = catItems.filter(i => i.packed).length;
    drawSectionHeader(s, categoryLabels[cat], { r, g, b }, `${catPacked}/${catItems.length}`);

    catItems.forEach(item => {
      ensureSpace(s, 7);
      const checkY = s.y;
      
      // Position checkbox on correct side for RTL
      const checkX = _ctx.isRTL ? MARGIN_X + CONTENT_W - 8 : MARGIN_X + 4;
      
      if (item.packed) {
        s.doc.setFillColor(34, 197, 94);
        s.doc.roundedRect(checkX, checkY, 4, 4, 0.8, 0.8, 'F');
        s.doc.setFontSize(7); s.doc.setTextColor(255, 255, 255);
        s.doc.text('✓', checkX + 1.2, checkY + 3.2);
      } else {
        s.doc.setDrawColor(203, 213, 225); s.doc.setLineWidth(0.3);
        s.doc.roundedRect(checkX, checkY, 4, 4, 0.8, 0.8, 'S');
      }

      const textColor = item.packed ? [148, 163, 184] : [51, 65, 85];
      s.doc.setFontSize(9); s.doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      const itemName = stripEmojis(item.name);
      const maxTextW = CONTENT_W - 50;
      const truncName = s.doc.getTextWidth(itemName) > maxTextW ? itemName.substring(0, Math.floor(itemName.length * maxTextW / s.doc.getTextWidth(itemName))) + '...' : itemName;
      
      if (_ctx.isRTL) {
        s.doc.text(truncName, checkX - 3, checkY + 3.2, { align: 'right' });
      } else {
        s.doc.text(truncName, checkX + 7, checkY + 3.2);
      }

      if (item.priority === 'essential' && !item.packed) {
        const badgeText = stripEmojis(labels.essential);
        const badgeW = s.doc.getTextWidth(badgeText) + 4;
        if (_ctx.isRTL) {
          s.doc.setFillColor(254, 226, 226);
          s.doc.roundedRect(MARGIN_X + 14, checkY - 0.5, badgeW, 5, 1, 1, 'F');
          s.doc.setFontSize(7); s.doc.setTextColor(239, 68, 68);
          s.doc.text(badgeText, MARGIN_X + 14 + badgeW / 2, checkY + 3, { align: 'center' });
        } else {
          s.doc.setFillColor(254, 226, 226);
          s.doc.roundedRect(MARGIN_X + CONTENT_W - badgeW - 18, checkY - 0.5, badgeW, 5, 1, 1, 'F');
          s.doc.setFontSize(7); s.doc.setTextColor(239, 68, 68);
          s.doc.text(badgeText, MARGIN_X + CONTENT_W - 17 - badgeW / 2, checkY + 3, { align: 'center' });
        }
      }

      const statusColor = item.packed ? [34, 197, 94] : [239, 68, 68];
      const statusText = stripEmojis(item.packed ? labels.packed : labels.notPacked);
      s.doc.setFontSize(7); s.doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      if (_ctx.isRTL) {
        s.doc.text(statusText, MARGIN_X + 4, checkY + 3.2);
      } else {
        s.doc.text(statusText, MARGIN_X + CONTENT_W - 4, checkY + 3.2, { align: 'right' });
      }
      s.y += 6;
    });
    s.y += 4;
    options.onProgress?.(40 + Math.round(((catIdx + 1) / catEntries.length) * 50));
  });

  drawFooter(s, language, accentColor);
  options.onProgress?.(100);
  s.doc.save(`hospital-bag-checklist-${new Date().toISOString().split('T')[0]}.pdf`);
}


// Generate WhatsApp share text for hospital bag
export function generateHospitalBagShareText(
  items: HospitalBagItem[],
  labels: { title: string; mom: string; baby: string; partner: string; documents: string; packed: string; notPacked: string; progress: string; }
): string {
  const packedCount = items.filter(i => i.packed).length;
  const totalCount = items.length;
  const progress = Math.round((packedCount / totalCount) * 100);
  const categoryLabels = { mom: labels.mom, baby: labels.baby, partner: labels.partner, documents: labels.documents };
  let text = `*${labels.title}*\n${labels.progress}: ${progress}% (${packedCount}/${totalCount})\n\n`;
  (['documents', 'mom', 'baby', 'partner'] as const).forEach(cat => {
    const catItems = items.filter(i => i.category === cat);
    if (catItems.length === 0) return;
    const catPacked = catItems.filter(i => i.packed).length;
    text += `*${categoryLabels[cat]}* (${catPacked}/${catItems.length})\n`;
    catItems.forEach(item => { text += `${item.packed ? '✅' : '⬜'} ${item.name}\n`; });
    text += '\n';
  });
  text += `_Pregnancy Toolkits_`;
  return text;
}


// AI Result PDF export
interface AIResultPDFOptions {
  title: string;
  subtitle?: string;
  content: string;
  score?: { value: number; max: number; label: string };
  language?: string;
  onProgress?: PDFProgressCallback;
}

export async function exportAIResultPDF(options: AIResultPDFOptions): Promise<void> {
  const { title, subtitle, content, score, language = 'en' } = options;
  const logoData = await loadLogoImage();
  _ctx.reportTitle = title;
  const accentColor = COLORS.secondary; // Violet

  const disclaimerLabels: Record<string, string> = {
    en: 'This report is for informational purposes only and does not replace professional medical or psychological advice.',
    ar: 'هذا التقرير لأغراض تعليمية فقط ولا يُغني عن الاستشارة الطبية أو النفسية المتخصصة.',
    de: 'Dieser Bericht dient nur zu Informationszwecken und ersetzt keine professionelle medizinische oder psychologische Beratung.',
    fr: 'Ce rapport est fourni à titre informatif uniquement et ne remplace pas un avis médical ou psychologique professionnel.',
    es: 'Este informe es solo informativo y no sustituye el consejo médico o psicológico profesional.',
    pt: 'Este relatório é apenas informativo e não substitui aconselhamento médico ou psicológico profissional.',
    tr: 'Bu rapor yalnızca bilgilendirme amaçlıdır ve profesyonel tıbbi veya psikolojik danışmanlığın yerini almaz.',
  };
  const disclaimer = disclaimerLabels[language] || disclaimerLabels.en;

  const { doc } = await createPDFDoc(language);
  const s: PDFState = { doc, y: MARGIN_Y, pageNum: 1 };

  options.onProgress?.(10);
  drawLogo(s, logoData);
  drawTitle(s, title, subtitle);
  drawBrand(s, language, accentColor);
  drawDivider(s, accentColor);

  // Score card
  if (score) {
    ensureSpace(s, 16);
    const lightR = Math.min(255, accentColor.r + 200), lightG = Math.min(255, accentColor.g + 200), lightB = Math.min(255, accentColor.b + 200);
    s.doc.setFillColor(lightR, lightG, lightB);
    s.doc.roundedRect(MARGIN_X + 20, s.y, CONTENT_W - 40, 14, 3, 3, 'F');
    s.doc.setFontSize(16); s.doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
    s.doc.text(`${score.value} / ${score.max}`, PAGE_W / 2, s.y + 6, { align: 'center' });
    s.doc.setFontSize(8); s.doc.setTextColor(148, 163, 184);
    s.doc.text(stripEmojis(score.label), PAGE_W / 2, s.y + 11, { align: 'center' });
    s.y += 18;
  }

  options.onProgress?.(25);

  // Main content
  renderMarkdownToPDF(s, content, accentColor);

  options.onProgress?.(90);

  // Disclaimer
  ensureSpace(s, 10);
  s.doc.setFontSize(7);
  s.doc.setTextColor(148, 163, 184);
  const dLines = s.doc.splitTextToSize(disclaimer, CONTENT_W - 20);
  s.doc.text(dLines, PAGE_W / 2, s.y, { align: 'center' });
  s.y += dLines.length * 3.5 + 3;

  drawFooter(s, language, accentColor);
  options.onProgress?.(100);

  s.doc.save(`${title.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
}


// =============================================
// Smart Pregnancy Plan PDF — pure jsPDF (fixes html2canvas Arabic bug)
// =============================================

interface SmartPlanPDFOptions {
  week: number;
  weight: number;
  bmi: string;
  calories: number;
  painLevel: number;
  trimester: { num: number; label: string };
  progress: number;
  daysRemaining: number;
  reportContent: string;
  language?: string;
  onProgress?: PDFProgressCallback;
}

export async function exportSmartPlanPDF(options: SmartPlanPDFOptions): Promise<void> {
  const {
    week, weight, bmi, calories, painLevel,
    trimester, progress, daysRemaining,
    reportContent, language = 'en',
  } = options;

  const logoData = await loadLogoImage();
  const { doc } = await createPDFDoc(language);
  const accentColor = COLORS.primary;
  const s: PDFState = { doc, y: MARGIN_Y, pageNum: 1 };

  const i18nLabels: Record<string, Record<string, string>> = {
    en: { title: 'Weekly Report', weekLabel: 'Week', bmiLabel: 'BMI', caloriesLabel: 'Calories', painLabel: 'Pain Level', progressLabel: 'Pregnancy Progress', daysLabel: 'days remaining', disclaimer: 'This report was generated using AI. Always consult your healthcare provider for medical advice.' },
    ar: { title: 'التقرير الأسبوعي', weekLabel: 'الأسبوع الحالي', bmiLabel: 'مؤشر الكتلة', caloriesLabel: 'سعرات', painLabel: 'مستوى الألم', progressLabel: 'تقدم الحمل', daysLabel: 'يوم متبقي', disclaimer: 'تم إنشاء هذا التقرير باستخدام الذكاء الاصطناعي. استشيري طبيبتك دائماً للحصول على المشورة الطبية.' },
    de: { title: 'Wochenbericht', weekLabel: 'Woche', bmiLabel: 'BMI', caloriesLabel: 'Kalorien', painLabel: 'Schmerz', progressLabel: 'Schwangerschaftsfortschritt', daysLabel: 'Tage verbleibend', disclaimer: 'Dieser Bericht wurde mit KI erstellt. Konsultieren Sie immer Ihren Arzt.' },
    fr: { title: 'Rapport hebdomadaire', weekLabel: 'Semaine', bmiLabel: 'IMC', caloriesLabel: 'Calories', painLabel: 'Douleur', progressLabel: 'Progression de la grossesse', daysLabel: 'jours restants', disclaimer: 'Ce rapport a été généré par IA. Consultez toujours votre médecin.' },
    es: { title: 'Informe semanal', weekLabel: 'Semana', bmiLabel: 'IMC', caloriesLabel: 'Calorías', painLabel: 'Dolor', progressLabel: 'Progreso del embarazo', daysLabel: 'días restantes', disclaimer: 'Este informe fue generado con IA. Consulte siempre a su médico.' },
    pt: { title: 'Relatório semanal', weekLabel: 'Semana', bmiLabel: 'IMC', caloriesLabel: 'Calorias', painLabel: 'Dor', progressLabel: 'Progresso da gravidez', daysLabel: 'dias restantes', disclaimer: 'Este relatório foi gerado por IA. Consulte sempre o seu médico.' },
    tr: { title: 'Haftalık Rapor', weekLabel: 'Hafta', bmiLabel: 'VKİ', caloriesLabel: 'Kalori', painLabel: 'Ağrı', progressLabel: 'Gebelik İlerlemesi', daysLabel: 'gün kaldı', disclaimer: 'Bu rapor yapay zeka ile oluşturulmuştur. Her zaman doktorunuza danışın.' },
  };
  const L = i18nLabels[language] || i18nLabels.en;
  _ctx.reportTitle = L.title;


  // Header
  drawLogo(s, logoData);
  drawTitle(s, `${L.title} — ${L.weekLabel} ${week}`, formatDateForPDF(new Date(), language));
  drawBrand(s, language, accentColor);
  s.y += 2;

  // Trimester badge
  doc.setFillColor(accentColor.r, accentColor.g, accentColor.b);
  const trimLabel = stripEmojis(trimester.label);
  const badgeW = doc.getTextWidth(trimLabel) + 10;
  doc.roundedRect(PAGE_W / 2 - badgeW / 2, s.y, badgeW, 6, 3, 3, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(trimLabel, PAGE_W / 2, s.y + 4.2, { align: 'center' });
  s.y += 10;

  // Progress bar
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`${stripEmojis(L.progressLabel)}: ${progress}%`, PAGE_W / 2, s.y, { align: 'center' });
  s.y += 4;
  doc.setFillColor(226, 232, 240);
  doc.roundedRect(MARGIN_X + 20, s.y, CONTENT_W - 40, 3, 1.5, 1.5, 'F');
  if (progress > 0) {
    doc.setFillColor(accentColor.r, accentColor.g, accentColor.b);
    doc.roundedRect(MARGIN_X + 20, s.y, (CONTENT_W - 40) * (progress / 100), 3, 1.5, 1.5, 'F');
  }
  s.y += 5;
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`${daysRemaining} ${L.daysLabel}`, PAGE_W / 2, s.y, { align: 'center' });
  s.y += 6;

  // Stats grid (4 boxes)
  const statsData = [
    { label: L.weekLabel, value: `${week}/40` },
    { label: L.bmiLabel, value: bmi },
    { label: L.caloriesLabel, value: `${calories}` },
    { label: L.painLabel, value: `${painLevel}/10` },
  ];
  const boxW = (CONTENT_W - 12) / 4;
  statsData.forEach((stat, i) => {
    const x = MARGIN_X + i * (boxW + 4);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, s.y, boxW, 14, 2, 2, 'F');
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text(stat.value, x + boxW / 2, s.y + 6, { align: 'center' });
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(stripEmojis(stat.label), x + boxW / 2, s.y + 11, { align: 'center' });
  });
  s.y += 18;

  drawDivider(s, accentColor);

  options.onProgress?.(30);

  // Render AI report markdown
  renderMarkdownToPDF(s, reportContent, accentColor);

  options.onProgress?.(90);

  // Disclaimer
  ensureSpace(s, 10);
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  const dLines = doc.splitTextToSize(stripEmojis(L.disclaimer), CONTENT_W - 20);
  doc.text(dLines, PAGE_W / 2, s.y, { align: 'center' });
  s.y += dLines.length * 3.5 + 3;

  drawFooter(s, language, accentColor);
  options.onProgress?.(100);

  doc.save(`pregnancy-report-week-${week}-${new Date().toISOString().split('T')[0]}.pdf`);
}
