import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import DOMPurify from 'dompurify';

export type PDFProgressCallback = (percent: number) => void;

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
  language?: 'en' | 'ar';
  accentColor?: { r: number; g: number; b: number };
  onProgress?: PDFProgressCallback;
}

// Cache for logo image data
let logoImageCache: string | null = null;

// Load logo image as base64
async function loadLogoImage(): Promise<string | null> {
  if (logoImageCache) return logoImageCache;
  
  try {
    const response = await fetch('/logo.png');
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        logoImageCache = reader.result as string;
        resolve(logoImageCache);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// Premium color palette
const COLORS = {
  primary: { r: 236, g: 72, b: 153 },
  secondary: { r: 139, g: 92, b: 246 },
  accent: { r: 251, g: 146, b: 60 },
  success: { r: 34, g: 197, b: 94 },
  info: { r: 59, g: 130, b: 246 },
  dark: { r: 30, g: 41, b: 59 },
  light: { r: 248, g: 250, b: 252 },
  muted: { r: 148, g: 163, b: 184 },
  headerBg: { r: 253, g: 242, b: 248 },
};

function rgbStr(c: { r: number; g: number; b: number }) {
  return `rgb(${c.r},${c.g},${c.b})`;
}

function rgbaStr(c: { r: number; g: number; b: number }, a: number) {
  return `rgba(${c.r},${c.g},${c.b},${a})`;
}

// Strip emoji characters from text to prevent Arabic text shaping issues
function stripEmojis(text: string): string {
  return text.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2702}-\u{27B0}\u{FE00}-\u{FE0F}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{FE0F}]/gu, '').replace(/\s{2,}/g, ' ').trim();
}

// Format date for display
function formatDateForPDF(date: Date, language: string): string {
  const localeMap: Record<string, string> = {
    ar: 'ar-SA', de: 'de-DE', fr: 'fr-FR', es: 'es-ES', pt: 'pt-BR', tr: 'tr-TR', en: 'en-US'
  };
  const locale = localeMap[language] || 'en-US';
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Get font family based on language
function getFontFamily(language: string): string {
  const isRTL = language === 'ar';
  return isRTL
    ? "'Tajawal', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
    : "'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
}

// Unified section-based html2canvas-to-PDF renderer
// Each [data-pdf-section] is rendered separately to avoid mid-content page cuts
async function renderHTMLToPDF(htmlContent: string, fileName: string, language: string = 'en', onProgress?: PDFProgressCallback): Promise<void> {
  const isRTL = language === 'ar';
  const fontFamily = getFontFamily(language);

  // Render scale – 2 for crisp text
  const RENDER_SCALE = 2;

  // Use a narrower wrapper to reduce white space – content fills more of the page
  const WRAPPER_WIDTH_PX = 680;

  // Prevent page layout shift by using a fixed-position offscreen container
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: ${WRAPPER_WIDTH_PX}px;
    background: #ffffff;
    font-family: ${fontFamily};
    color: #1e293b;
    direction: ${isRTL ? 'rtl' : 'ltr'};
    padding: 0;
    line-height: 1.45;
    z-index: -1;
    visibility: visible;
    pointer-events: none;
    -webkit-font-smoothing: antialiased;
  `;

  const sanitizedContent = DOMPurify.sanitize(htmlContent, {
    ALLOWED_TAGS: ['h1','h2','h3','h4','h5','h6','p','div','span','strong','em','b','i','br','ul','ol','li','table','thead','tbody','tr','th','td','img','style'],
    ALLOWED_ATTR: ['style','class','data-pdf-section','src','alt','dir'],
    ALLOW_DATA_ATTR: true,
  });

  wrapper.innerHTML = `
    <style>
      * { font-family: ${fontFamily} !important; box-sizing: border-box; margin: 0; padding: 0; }
      h1,h2,h3,h4,h5,h6,p,div,span,strong,em,li {
        font-family: ${fontFamily} !important;
        direction: ${isRTL ? 'rtl' : 'ltr'};
      }
    </style>
    ${sanitizedContent}
  `;

  document.body.appendChild(wrapper);

  try {
    await document.fonts.ready;
  } catch { /* fallback */ }
  await new Promise(resolve => setTimeout(resolve, 60));

  // PDF constants – balanced margins for professional look
  const A4_WIDTH_MM = 210;
  const A4_HEIGHT_MM = 297;
  const MARGIN_X_MM = 12;
  const MARGIN_Y_MM = 10;
  const CONTENT_WIDTH_MM = A4_WIDTH_MM - MARGIN_X_MM * 2;
  const CONTENT_HEIGHT_MM = A4_HEIGHT_MM - MARGIN_Y_MM * 2;
  const SECTION_GAP_MM = 2;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Find all sections
  const sections = Array.from(wrapper.querySelectorAll('[data-pdf-section]')) as HTMLElement[];

  // If no sections found, fall back to rendering the entire wrapper as one image
  if (sections.length === 0) {
    try {
      const canvas = await html2canvas(wrapper, {
        scale: RENDER_SCALE,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: WRAPPER_WIDTH_PX,
        windowWidth: WRAPPER_WIDTH_PX,
      });
      const scaleFactor = CONTENT_WIDTH_MM / (canvas.width / RENDER_SCALE);
      const pageHeightPx = CONTENT_HEIGHT_MM / scaleFactor;
      let remaining = canvas.height;
      let srcY = 0;
      let pageIdx = 0;
      while (remaining > 0) {
        if (pageIdx > 0) doc.addPage();
        const sliceH = Math.min(remaining, pageHeightPx * RENDER_SCALE);
        const sliceHMM = (sliceH / RENDER_SCALE) * scaleFactor;
        const pc = document.createElement('canvas');
        pc.width = canvas.width; pc.height = sliceH;
        const ctx = pc.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, pc.width, pc.height);
          ctx.drawImage(canvas, 0, srcY, canvas.width, sliceH, 0, 0, pc.width, sliceH);
        }
        doc.addImage(pc.toDataURL('image/jpeg', 0.9), 'JPEG', MARGIN_X_MM, MARGIN_Y_MM, CONTENT_WIDTH_MM, sliceHMM);
        srcY += sliceH; remaining -= sliceH; pageIdx++;
      }
    } finally {
      document.body.removeChild(wrapper);
    }
    doc.save(fileName);
    return;
  }

  // Section-based rendering
  let currentY = MARGIN_Y_MM;
  const totalSections = sections.length;

  onProgress?.(10);

  for (let sIdx = 0; sIdx < sections.length; sIdx++) {
    const section = sections[sIdx];
    let canvas: HTMLCanvasElement;
    try {
      canvas = await html2canvas(section, {
        scale: RENDER_SCALE,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: WRAPPER_WIDTH_PX,
        windowWidth: WRAPPER_WIDTH_PX,
      });
    } catch {
      continue;
    }

    if (canvas.width === 0 || canvas.height === 0) continue;

    // Crop canvas: trim bottom whitespace
    const croppedCanvas = cropCanvasWhitespace(canvas);

    const realWidthPx = croppedCanvas.width / RENDER_SCALE;
    const realHeightPx = croppedCanvas.height / RENDER_SCALE;
    const scaleFactor = CONTENT_WIDTH_MM / realWidthPx;
    const sectionHeightMM = realHeightPx * scaleFactor;

    if (sectionHeightMM > CONTENT_HEIGHT_MM) {
      // Line-snap constant: approximate rendered line height in scaled pixels
      // font-size ~11px, line-height 1.4 → ~15.4px per line → ~31px at RENDER_SCALE=2
      const LINE_SNAP_PX = Math.round(15.4 * RENDER_SCALE);

      let remaining = croppedCanvas.height;
      let srcY = 0;
      while (remaining > 0) {
        const availableHeightMM = (currentY === MARGIN_Y_MM) ? CONTENT_HEIGHT_MM : (A4_HEIGHT_MM - MARGIN_Y_MM - currentY);
        let availableSlicePx = (availableHeightMM / scaleFactor) * RENDER_SCALE;
        
        if (availableHeightMM < 15 && currentY > MARGIN_Y_MM) {
          doc.addPage();
          currentY = MARGIN_Y_MM;
          continue;
        }
        
        let sliceH = Math.min(remaining, availableSlicePx);
        // Snap slice height DOWN to the nearest line boundary to avoid cutting text
        if (sliceH < remaining && LINE_SNAP_PX > 0) {
          sliceH = Math.max(LINE_SNAP_PX, Math.floor(sliceH / LINE_SNAP_PX) * LINE_SNAP_PX);
        }
        const sliceHMM = (sliceH / RENDER_SCALE) * scaleFactor;
        const pc = document.createElement('canvas');
        pc.width = croppedCanvas.width; pc.height = sliceH;
        const ctx = pc.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, pc.width, pc.height);
          ctx.drawImage(croppedCanvas, 0, srcY, croppedCanvas.width, sliceH, 0, 0, pc.width, sliceH);
        }
        doc.addImage(pc.toDataURL('image/jpeg', 0.9), 'JPEG', MARGIN_X_MM, currentY, CONTENT_WIDTH_MM, sliceHMM);
        currentY += sliceHMM;
        srcY += sliceH; remaining -= sliceH;
        if (remaining > 0) { doc.addPage(); currentY = MARGIN_Y_MM; }
      }
      currentY += SECTION_GAP_MM;
      continue;
    }

    const spaceLeft = A4_HEIGHT_MM - MARGIN_Y_MM - currentY;
    if (sectionHeightMM > spaceLeft && currentY > MARGIN_Y_MM) {
      doc.addPage();
      currentY = MARGIN_Y_MM;
    }

    const imgData = croppedCanvas.toDataURL('image/jpeg', 0.9);
    doc.addImage(imgData, 'JPEG', MARGIN_X_MM, currentY, CONTENT_WIDTH_MM, sectionHeightMM);
    currentY += sectionHeightMM + SECTION_GAP_MM;

    onProgress?.(10 + Math.round(((sIdx + 1) / totalSections) * 85));
  }

  document.body.removeChild(wrapper);
  onProgress?.(100);
  doc.save(fileName);
}

// Lightweight canvas crop — only trims bottom whitespace to avoid oversized gaps
// Skips expensive full-pixel scan; samples a few columns instead
function cropCanvasWhitespace(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  
  const { width, height } = canvas;
  if (width === 0 || height === 0) return canvas;
  
  // Sample 5 columns to find the lowest non-white row
  const sampleCols = [Math.floor(width * 0.1), Math.floor(width * 0.3), Math.floor(width * 0.5), Math.floor(width * 0.7), Math.floor(width * 0.9)];
  let maxY = 0;
  
  for (const x of sampleCols) {
    // Read a single column
    const colData = ctx.getImageData(x, 0, 1, height).data;
    for (let y = height - 1; y >= maxY; y--) {
      const i = y * 4;
      if (colData[i] < 250 || colData[i + 1] < 250 || colData[i + 2] < 250) {
        if (y > maxY) maxY = y;
        break;
      }
    }
  }
  
  const PAD = 8;
  const cropH = Math.min(height, maxY + PAD);
  
  // Only crop if we save >10% height
  if (cropH >= height * 0.9) return canvas;
  
  const cropped = document.createElement('canvas');
  cropped.width = width;
  cropped.height = cropH;
  const cCtx = cropped.getContext('2d');
  if (cCtx) {
    cCtx.fillStyle = '#ffffff';
    cCtx.fillRect(0, 0, width, cropH);
    cCtx.drawImage(canvas, 0, 0, width, cropH, 0, 0, width, cropH);
  }
  return cropped;
}


// Build PDF header HTML
// =============================================
// HTML SECTION BUILDERS (each wrapped in data-pdf-section)
// =============================================
function buildHeaderHTML(
  title: string, 
  subtitle: string | undefined, 
  accentColor: { r: number; g: number; b: number }, 
  logoData: string | null, 
  language: string
): string {
  const fontFamily = getFontFamily(language);
  return `
    <div data-pdf-section style="background:linear-gradient(180deg, ${rgbaStr(accentColor, 0.06)} 0%, #ffffff 100%);padding:20px 24px 14px;text-align:center;">
      ${logoData ? `<img src="${logoData}" style="width:36px;height:36px;margin:0 auto 8px;display:block;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.08);" />` : ''}
      <div style="font-size:22px;font-weight:800;color:#1e293b;margin-bottom:4px;font-family:${fontFamily};letter-spacing:-0.3px;">${stripEmojis(title)}</div>
      ${subtitle ? `<div style="font-size:11px;color:#64748b;margin-bottom:4px;font-family:${fontFamily};">${stripEmojis(subtitle)}</div>` : ''}
      <div style="font-size:9px;color:${rgbStr(accentColor)};font-weight:600;font-family:${fontFamily};letter-spacing:0.5px;text-transform:uppercase;">${getBrandName(language)}</div>
      <div style="height:2.5px;background:linear-gradient(90deg, transparent, ${rgbStr(accentColor)}, transparent);border-radius:2px;margin:12px auto 0;max-width:200px;"></div>
    </div>
  `;
}

// Build PDF footer HTML
function getBrandName(language: string): string {
  const brands: Record<string, string> = {
    ar: 'أدوات الحمل الذكية', de: 'Schwangerschafts-Toolkit', fr: 'Outils de Grossesse',
    es: 'Herramientas de Embarazo', pt: 'Ferramentas de Gravidez', tr: 'Gebelik Araçları',
  };
  return brands[language] || 'Pregnancy Toolkits';
}

function buildFooterHTML(language: string, accentColor: { r: number; g: number; b: number }): string {
  const fontFamily = getFontFamily(language);
  const dateStr = formatDateForPDF(new Date(), language);
  const exportLabels: Record<string, string> = {
    ar: 'تم التصدير بتاريخ', de: 'Exportiert am', fr: 'Exporté le',
    es: 'Exportado el', pt: 'Exportado em', tr: 'Dışa aktarma tarihi',
  };
  const exportLabel = exportLabels[language] || 'Exported on';
  const text = `${exportLabel} ${dateStr}`;
  return `
    <div data-pdf-section style="padding:10px 24px 14px;text-align:center;background:linear-gradient(180deg, #ffffff 0%, ${rgbaStr(accentColor, 0.04)} 100%);">
      <div style="height:1.5px;background:linear-gradient(90deg, transparent, ${rgbaStr(accentColor, 0.3)}, transparent);margin-bottom:10px;"></div>
      <div style="font-size:8.5px;color:#94a3b8;font-family:${fontFamily};line-height:1.5;">${text}</div>
      <div style="font-size:8px;color:${rgbaStr(accentColor, 0.6)};font-family:${fontFamily};font-weight:600;margin-top:2px;">${getBrandName(language)}</div>
    </div>
  `;
}

// Build section HTML — header + all its items are grouped inside ONE data-pdf-section
// so they never get split across pages unexpectedly.
// Usage: openSectionHTML(...) + items + closeSectionHTML()
function openSectionHTML(sectionTitle: string, accentColor: { r: number; g: number; b: number }, language: string): string {
  const fontFamily = getFontFamily(language);
  const isRTL = language === 'ar';
  return `
    <div data-pdf-section style="margin:6px 20px 2px;padding-bottom:4px;">
      <div style="display:flex;align-items:stretch;border-radius:6px 6px 0 0;overflow:hidden;background:${rgbaStr(accentColor, 0.07)};">
        <div style="width:4px;min-width:4px;background:${rgbStr(accentColor)};${isRTL ? 'order:1;' : ''}"></div>
        <div style="padding:7px 14px;font-size:12.5px;font-weight:700;color:${rgbStr(accentColor)};font-family:${fontFamily};flex:1;letter-spacing:-0.1px;">
          ${stripEmojis(sectionTitle)}
        </div>
      </div>
  `;
}

function closeSectionHTML(): string {
  return `</div>`;
}

/** @deprecated use openSectionHTML + closeSectionHTML for grouped rendering */
function buildSectionHTML(sectionTitle: string, accentColor: { r: number; g: number; b: number }, language: string): string {
  const fontFamily = getFontFamily(language);
  const isRTL = language === 'ar';
  return `
    <div data-pdf-section style="margin:6px 20px 2px;">
      <div style="display:flex;align-items:stretch;border-radius:6px;overflow:hidden;background:${rgbaStr(accentColor, 0.07)};">
        <div style="width:4px;min-width:4px;background:${rgbStr(accentColor)};${isRTL ? 'order:1;' : ''}"></div>
        <div style="padding:7px 14px;font-size:12.5px;font-weight:700;color:${rgbStr(accentColor)};font-family:${fontFamily};flex:1;letter-spacing:-0.1px;">
          ${stripEmojis(sectionTitle)}
        </div>
      </div>
    </div>
  `;
}


// Build a bullet item HTML - uses flexbox instead of position:absolute for html2canvas compatibility
function buildBulletItemHTML(text: string, accentColor: { r: number; g: number; b: number }, language: string): string {
  const fontFamily = getFontFamily(language);
  const isRTL = language === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';
  return `
    <div style="display:flex;align-items:flex-start;gap:8px;padding:3px 20px;font-size:11px;color:#334155;font-family:${fontFamily};line-height:1.5;direction:${dir};">
      <span style="width:5px;height:5px;min-width:5px;background:${rgbStr(accentColor)};border-radius:50%;display:inline-block;margin-top:6px;flex-shrink:0;"></span>
      <span style="flex:1;">${stripEmojis(text)}</span>
    </div>
  `;
}

// Build a label:value item HTML - uses flexbox instead of position:absolute
function buildLabelValueHTML(label: string, value: string, accentColor: { r: number; g: number; b: number }, language: string): string {
  const fontFamily = getFontFamily(language);
  const isRTL = language === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';
  return `
    <div style="display:flex;align-items:flex-start;gap:8px;padding:3px 20px;font-size:11px;color:#334155;font-family:${fontFamily};line-height:1.5;direction:${dir};">
      <span style="width:5px;height:5px;min-width:5px;background:${rgbStr(accentColor)};border-radius:50%;display:inline-block;margin-top:6px;flex-shrink:0;"></span>
      <span style="flex:1;"><strong style="color:#1e293b;">${stripEmojis(label)}:</strong> <span style="color:#64748b;">${stripEmojis(value)}</span></span>
    </div>
  `;
}

// Convert markdown to HTML
function markdownToHTMLWithLang(markdown: string, fontFamily: string, isRTL: boolean): string {
  const paddingSide = isRTL ? 'right' : 'left';
  const textAlign = isRTL ? 'justify' : 'left';
  const dir = isRTL ? 'rtl' : 'ltr';
  const cleaned = stripEmojis(markdown);

  // Use background-color for the accent bar instead of border (html2canvas renders borders as dashed)
  const makeHeading = (level: number, text: string) => {
    const sizes = [16, 14, 12.5, 11.5];
    const weights = [800, 700, 700, 600];
    const paddings = ['7px 14px 7px 16px', '6px 12px 6px 14px', '5px 10px 5px 12px', '4px 10px 4px 12px'];
    const margins = ['14px 0 6px', '10px 0 5px', '8px 0 4px', '6px 0 3px'];
    const barWidths = [4, 3, 3, 2];
    const idx = level - 1;
    const headingColor = level <= 2 ? '#1e293b' : '#be185d';
    return `<div style="display:flex;align-items:stretch;margin:${margins[idx]};border-radius:6px;overflow:hidden;background:rgba(236,72,153,0.06);direction:${dir};">` +
      `<div style="width:${barWidths[idx]}px;min-width:${barWidths[idx]}px;background:#ec4899;flex-shrink:0;${isRTL ? 'order:1;' : ''}"></div>` +
      `<div style="padding:${paddings[idx]};font-size:${sizes[idx]}px;font-weight:${weights[idx]};color:${headingColor};font-family:${fontFamily};text-align:${textAlign};flex:1;letter-spacing:-0.1px;">${text}</div>` +
      `</div>`;
  };

  return cleaned
    .replace(/^#### (.*$)/gm, (_, p1) => makeHeading(4, p1))
    .replace(/^### (.*$)/gm, (_, p1) => makeHeading(3, p1))
    .replace(/^## (.*$)/gm, (_, p1) => makeHeading(2, p1))
    .replace(/^# (.*$)/gm, (_, p1) => makeHeading(1, p1))
    .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight:700;color:#1e293b;">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em style="color:#475569;">$1</em>')
    .replace(/^[-*+] (.*$)/gm, `<div style="display:flex;align-items:flex-start;gap:7px;padding:2px 0;font-family:${fontFamily};direction:${dir};text-align:${textAlign};font-size:11px;line-height:1.5;color:#334155;"><span style="width:5px;height:5px;min-width:5px;background:#ec4899;border-radius:50%;display:inline-block;margin-top:6px;"></span><span style="flex:1;">$1</span></div>`)
    .replace(/^\d+\.\s+(.*$)/gm, `<div style="padding:2px 0 2px 16px;padding-${paddingSide}:16px;font-family:${fontFamily};direction:${dir};text-align:${textAlign};font-size:11px;line-height:1.5;color:#334155;">$1</div>`)
    .replace(/^[-*_]{3,}$/gm, `<div style="height:1.5px;background:linear-gradient(90deg, transparent, rgba(236,72,153,0.25), transparent);margin:8px 0;"></div>`)
    .replace(/\n{2,}/g, '<div style="height:6px;"></div>')
    .replace(/\n/g, '<br/>')
    .trim();
}

// Strip emojis from HTML content and fix text-align for html2canvas compatibility
function stripEmojisFromHTML(html: string, isRTL: boolean = false): string {
  let cleaned = html.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2702}-\u{27B0}\u{FE00}-\u{FE0F}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{FE0F}]/gu, '');
  if (isRTL) {
    cleaned = cleaned.replace(/text-align:\s*right/gi, 'text-align: justify');
  }
  return cleaned;
}

// =============================================
// EXPORT FUNCTIONS
// =============================================

// Generic PDF export function (sections-based)
export async function exportGenericPDF(options: GenericPDFOptions): Promise<void> {
  const { title, subtitle, sections, language = 'en', accentColor = COLORS.primary } = options;
  const logoData = await loadLogoImage();

  let html = buildHeaderHTML(title, subtitle, accentColor, logoData, language);
  html += `<div data-pdf-section style="margin:10px 16px;height:1px;background:${rgbaStr(accentColor, 0.3)};"></div>`;

  sections.forEach((section) => {
    // Group section header + items together in one data-pdf-section
    html += openSectionHTML(section.title, accentColor, language);
    section.items.forEach((item) => {
      if (typeof item === 'string') {
        html += buildBulletItemHTML(item, accentColor, language);
      } else {
        html += buildLabelValueHTML(item.label, item.value, accentColor, language);
      }
    });
    html += closeSectionHTML();
  });

  html += buildFooterHTML(language, accentColor);

  const fileName = `${title.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
  await renderHTMLToPDF(html, fileName, language, options.onProgress);
}

// Data backup PDF export
export async function exportDataBackupPDF(options: DataBackupPDFOptions): Promise<void> {
  const { title, subtitle, data, language = 'en' } = options;
  const logoData = await loadLogoImage();
  const isRTL = language === 'ar';
  const fontFamily = getFontFamily(language);

  // Multilingual labels for all 7 languages
  const i18nLabels: Record<string, Record<string, string>> = {
    en: { totalItems: 'Total Items', healthData: 'Health Data', planning: 'Planning', profile: 'Profile & Settings', health: 'Health Tracking', appointments: 'Appointments & Reminders', nutrition: 'Nutrition & Meals', birthPlanning: 'Birth Planning & Preparation', other: 'Other Data', items: 'items', noData: 'No data', disclaimer: 'This report was generated automatically from saved data. Always consult your healthcare provider.' },
    ar: { totalItems: 'إجمالي البيانات', healthData: 'بيانات صحية', planning: 'التخطيط', profile: 'الملف الشخصي والإعدادات', health: 'تتبع الصحة', appointments: 'المواعيد والتذكيرات', nutrition: 'التغذية والوجبات', birthPlanning: 'تخطيط الولادة والتحضير', other: 'بيانات أخرى', items: 'عنصر', noData: 'لا بيانات', disclaimer: 'تم إنشاء هذا التقرير تلقائياً من البيانات المحفوظة. استشيري طبيبتك دائماً.' },
    de: { totalItems: 'Gesamtelemente', healthData: 'Gesundheitsdaten', planning: 'Planung', profile: 'Profil & Einstellungen', health: 'Gesundheitstracking', appointments: 'Termine & Erinnerungen', nutrition: 'Ernährung & Mahlzeiten', birthPlanning: 'Geburtsplanung & Vorbereitung', other: 'Sonstige Daten', items: 'Elemente', noData: 'Keine Daten', disclaimer: 'Dieser Bericht wurde automatisch erstellt. Konsultieren Sie immer Ihren Arzt.' },
    fr: { totalItems: 'Total éléments', healthData: 'Données santé', planning: 'Planification', profile: 'Profil & Paramètres', health: 'Suivi santé', appointments: 'Rendez-vous & Rappels', nutrition: 'Nutrition & Repas', birthPlanning: 'Plan de naissance & Préparation', other: 'Autres données', items: 'éléments', noData: 'Aucune donnée', disclaimer: 'Ce rapport a été généré automatiquement. Consultez toujours votre médecin.' },
    es: { totalItems: 'Total elementos', healthData: 'Datos de salud', planning: 'Planificación', profile: 'Perfil y Configuración', health: 'Seguimiento de salud', appointments: 'Citas y Recordatorios', nutrition: 'Nutrición y Comidas', birthPlanning: 'Plan de parto y Preparación', other: 'Otros datos', items: 'elementos', noData: 'Sin datos', disclaimer: 'Este informe fue generado automáticamente. Consulte siempre a su médico.' },
    pt: { totalItems: 'Total de itens', healthData: 'Dados de saúde', planning: 'Planejamento', profile: 'Perfil e Configurações', health: 'Acompanhamento de saúde', appointments: 'Consultas e Lembretes', nutrition: 'Nutrição e Refeições', birthPlanning: 'Plano de parto e Preparação', other: 'Outros dados', items: 'itens', noData: 'Sem dados', disclaimer: 'Este relatório foi gerado automaticamente. Consulte sempre o seu médico.' },
    tr: { totalItems: 'Toplam öğe', healthData: 'Sağlık verileri', planning: 'Planlama', profile: 'Profil ve Ayarlar', health: 'Sağlık Takibi', appointments: 'Randevular ve Hatırlatıcılar', nutrition: 'Beslenme ve Yemekler', birthPlanning: 'Doğum Planı ve Hazırlık', other: 'Diğer veriler', items: 'öğe', noData: 'Veri yok', disclaimer: 'Bu rapor otomatik olarak oluşturulmuştur. Her zaman doktorunuza danışın.' },
  };
  const L = i18nLabels[language] || i18nLabels.en;

  // Human-readable key labels
  const keyLabels: Record<string, Record<string, string>> = {
    pregnancy_profile: { en: 'Pregnancy Profile', ar: 'ملف الحمل', de: 'Schwangerschaftsprofil', fr: 'Profil de grossesse', es: 'Perfil de embarazo', pt: 'Perfil de gravidez', tr: 'Gebelik Profili' },
    user_settings: { en: 'User Settings', ar: 'إعدادات المستخدم', de: 'Benutzereinstellungen', fr: 'Paramètres', es: 'Configuración', pt: 'Configurações', tr: 'Ayarlar' },
    pregnancy_week: { en: 'Pregnancy Week', ar: 'أسبوع الحمل', de: 'Schwangerschaftswoche', fr: 'Semaine de grossesse', es: 'Semana de embarazo', pt: 'Semana de gravidez', tr: 'Gebelik Haftası' },
    due_date: { en: 'Due Date', ar: 'تاريخ الولادة المتوقع', de: 'Geburtstermin', fr: 'Date prévue', es: 'Fecha de parto', pt: 'Data prevista', tr: 'Beklenen Doğum' },
    last_period_date: { en: 'Last Period Date', ar: 'تاريخ آخر دورة', de: 'Letzte Periode', fr: 'Dernières règles', es: 'Última regla', pt: 'Última menstruação', tr: 'Son Adet Tarihi' },
    kick_sessions: { en: 'Kick Sessions', ar: 'جلسات الركلات', de: 'Tritte-Sitzungen', fr: 'Sessions de coups', es: 'Sesiones de patadas', pt: 'Sessões de chutes', tr: 'Tekme Oturumları' },
    kick_history: { en: 'Kick History', ar: 'سجل الركلات', de: 'Tritte-Verlauf', fr: 'Historique des coups', es: 'Historial de patadas', pt: 'Histórico de chutes', tr: 'Tekme Geçmişi' },
    water_intake: { en: 'Water Intake', ar: 'شرب الماء', de: 'Wasseraufnahme', fr: "Consommation d'eau", es: 'Ingesta de agua', pt: 'Consumo de água', tr: 'Su Tüketimi' },
    weight_records: { en: 'Weight Records', ar: 'سجل الوزن', de: 'Gewichtsaufzeichnungen', fr: 'Enregistrements de poids', es: 'Registros de peso', pt: 'Registros de peso', tr: 'Kilo Kayıtları' },
    vitamin_tracker: { en: 'Vitamin Tracker', ar: 'متتبع الفيتامينات', de: 'Vitamin-Tracker', fr: 'Suivi vitamines', es: 'Seguimiento vitaminas', pt: 'Rastreador de vitaminas', tr: 'Vitamin Takibi' },
    vitamin_records: { en: 'Vitamin Records', ar: 'سجل الفيتامينات', de: 'Vitamin-Aufzeichnungen', fr: 'Enregistrements vitamines', es: 'Registros de vitaminas', pt: 'Registros de vitaminas', tr: 'Vitamin Kayıtları' },
    sleep_records: { en: 'Sleep Records', ar: 'سجل النوم', de: 'Schlafaufzeichnungen', fr: 'Enregistrements de sommeil', es: 'Registros de sueño', pt: 'Registros de sono', tr: 'Uyku Kayıtları' },
    contraction_records: { en: 'Contraction Records', ar: 'سجل الانقباضات', de: 'Wehenaufzeichnungen', fr: 'Enregistrements contractions', es: 'Registros de contracciones', pt: 'Registros de contrações', tr: 'Kasılma Kayıtları' },
    appointments: { en: 'Appointments', ar: 'المواعيد', de: 'Termine', fr: 'Rendez-vous', es: 'Citas', pt: 'Consultas', tr: 'Randevular' },
    reminders: { en: 'Reminders', ar: 'التذكيرات', de: 'Erinnerungen', fr: 'Rappels', es: 'Recordatorios', pt: 'Lembretes', tr: 'Hatırlatıcılar' },
    meal_history: { en: 'Meal History', ar: 'سجل الوجبات', de: 'Mahlzeiten-Verlauf', fr: 'Historique repas', es: 'Historial de comidas', pt: 'Histórico de refeições', tr: 'Yemek Geçmişi' },
    grocery_lists: { en: 'Grocery Lists', ar: 'قوائم التسوق', de: 'Einkaufslisten', fr: 'Listes de courses', es: 'Listas de compras', pt: 'Listas de compras', tr: 'Alışveriş Listeleri' },
    birth_plans: { en: 'Birth Plans', ar: 'خطط الولادة', de: 'Geburtspläne', fr: 'Plans de naissance', es: 'Planes de parto', pt: 'Planos de parto', tr: 'Doğum Planları' },
    hospital_bag: { en: 'Hospital Bag', ar: 'حقيبة المستشفى', de: 'Kliniktasche', fr: 'Valise maternité', es: 'Bolsa hospital', pt: 'Mala maternidade', tr: 'Hastane Çantası' },
    baby_names: { en: 'Baby Names', ar: 'أسماء الأطفال', de: 'Babynamen', fr: 'Prénoms', es: 'Nombres de bebé', pt: 'Nomes de bebê', tr: 'Bebek İsimleri' },
    bump_photos_local: { en: 'Bump Photos', ar: 'صور البطن', de: 'Bauchfotos', fr: 'Photos du ventre', es: 'Fotos del vientre', pt: 'Fotos da barriga', tr: 'Karın Fotoğrafları' },
    cycle_data: { en: 'Cycle Data', ar: 'بيانات الدورة', de: 'Zyklusdaten', fr: 'Données du cycle', es: 'Datos del ciclo', pt: 'Dados do ciclo', tr: 'Döngü Verileri' },
    journal_entries: { en: 'Journal Entries', ar: 'إدخالات اليوميات', de: 'Tagebucheinträge', fr: 'Entrées du journal', es: 'Entradas del diario', pt: 'Entradas do diário', tr: 'Günlük Girdileri' },
    doctor_questions: { en: 'Doctor Questions', ar: 'أسئلة الطبيب', de: 'Arztfragen', fr: 'Questions médecin', es: 'Preguntas médico', pt: 'Perguntas médico', tr: 'Doktor Soruları' },
  };

  const getKeyLabel = (key: string): string => {
    const labels = keyLabels[key];
    if (labels) return labels[language] || labels.en;
    return key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase()).trim();
  };

  // Smart value formatter
  const formatValue = (key: string, value: any): string => {
    if (value === null || value === undefined) return L.noData;
    if (typeof value === 'string') {
      if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
        try { return formatDateForPDF(new Date(value), language); } catch { return value; }
      }
      return value;
    }
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return value ? '✓' : '✗';
    if (Array.isArray(value)) {
      if (value.length === 0) return L.noData;
      if (key.includes('appointment') || key.includes('reminder')) {
        return value.slice(0, 5).map((item: any) => {
          if (typeof item === 'object' && item !== null) {
            const name = item.title || item.name || item.type || '';
            const date = item.date || item.time || '';
            return `${stripEmojis(name)}${date ? ` (${date})` : ''}`;
          }
          return String(item);
        }).join(' | ') + (value.length > 5 ? ` +${value.length - 5}` : '');
      }
      if (value.length > 0 && typeof value[0] === 'object' && value[0]?.date) {
        const dates = value.map((v: any) => v.date).filter(Boolean).sort();
        const first = dates[0];
        const last = dates[dates.length - 1];
        return `${value.length} ${L.items}${first && last && first !== last ? ` (${first} → ${last})` : ''}`;
      }
      if (value.length <= 3 && value.every((v: any) => typeof v === 'string')) {
        return value.join(', ');
      }
      return `${value.length} ${L.items}`;
    }
    if (typeof value === 'object') {
      const keys = Object.keys(value);
      if (keys.length === 0) return L.noData;
      const summary = keys.slice(0, 4).map(k => {
        const v = value[k];
        if (typeof v === 'string' || typeof v === 'number') return `${k}: ${v}`;
        if (Array.isArray(v)) return `${k}: ${v.length} ${L.items}`;
        return null;
      }).filter(Boolean).join(' • ');
      return summary || `${keys.length} ${L.items}`;
    }
    return String(value);
  };

  const categoryMeta: Record<string, { label: string; color: typeof COLORS.primary }> = {
    profile: { label: L.profile, color: COLORS.info },
    health: { label: L.health, color: COLORS.primary },
    appointments: { label: L.appointments, color: COLORS.secondary },
    nutrition: { label: L.nutrition, color: COLORS.success },
    planning: { label: L.birthPlanning, color: COLORS.accent },
    other: { label: L.other, color: COLORS.muted }
  };

  const categories: Record<string, { label: string; value: string }[]> = {
    profile: [], health: [], appointments: [], nutrition: [], planning: [], other: []
  };

  Object.entries(data).forEach(([key, value]) => {
    if (key.includes('disclaimer') || key.includes('onboarding') || key.includes('backup') || key === 'user_selected_language') return;
    
    const displayLabel = getKeyLabel(key);
    const displayValue = formatValue(key, value);
    const item = { label: displayLabel, value: displayValue };

    if (key.includes('profile') || key.includes('settings') || key.includes('week') || (key.includes('date') && !key.includes('update'))) {
      categories.profile.push(item);
    } else if (key.includes('kick') || key.includes('weight') || key.includes('vitamin') || key.includes('sleep') || key.includes('contraction') || key.includes('water') || key.includes('mood')) {
      categories.health.push(item);
    } else if (key.includes('appointment') || key.includes('reminder')) {
      categories.appointments.push(item);
    } else if (key.includes('meal') || key.includes('food') || key.includes('nutrition') || key.includes('grocery') || key.includes('smoothie')) {
      categories.nutrition.push(item);
    } else if (key.includes('birth') || key.includes('hospital') || key.includes('baby_name') || key.includes('bag')) {
      categories.planning.push(item);
    } else {
      categories.other.push(item);
    }
  });

  const totalItems = Object.values(categories).reduce((sum, cat) => sum + cat.length, 0);

  let html = buildHeaderHTML(title, subtitle || formatDateForPDF(new Date(), language), COLORS.primary, logoData, language);

  // Summary stats — own section so it stays together (use nested divs for accent bars instead of borders)
  const statCard = (color: typeof COLORS.primary, value: number | string, label: string) => `
    <div style="flex:1;background:${rgbaStr(color, 0.08)};border-radius:6px;overflow:hidden;display:flex;align-items:stretch;">
      <div style="width:2px;min-width:2px;background:${rgbStr(color)};${isRTL ? 'order:1;' : ''}"></div>
      <div style="padding:6px;text-align:center;flex:1;">
        <div style="font-size:16px;font-weight:700;color:${rgbStr(color)};font-family:${fontFamily};">${value}</div>
        <div style="font-size:8px;color:#94a3b8;font-family:${fontFamily};">${label}</div>
      </div>
    </div>
  `;
  html += `
    <div data-pdf-section style="display:flex;gap:10px;margin:10px 20px 6px;">
      ${statCard(COLORS.primary, totalItems, L.totalItems)}
      ${statCard(COLORS.success, categories.health.length, L.healthData)}
      ${statCard(COLORS.secondary, categories.planning.length, L.planning)}
    </div>
  `;

  // Render each category — header + all items together in one data-pdf-section
  Object.entries(categories).forEach(([cat, items]) => {
    if (items.length === 0) return;
    const meta = categoryMeta[cat];

    html += `<div data-pdf-section style="margin:6px 20px 2px;padding-bottom:4px;">`;
    html += `
      <div style="display:flex;align-items:stretch;border-radius:6px 6px 0 0;overflow:hidden;background:${rgbaStr(meta.color, 0.07)};">
        <div style="width:4px;min-width:4px;background:${rgbStr(meta.color)};${isRTL ? 'order:1;' : ''}"></div>
        <div style="padding:6px 14px;font-size:12px;font-weight:700;color:${rgbStr(meta.color)};font-family:${fontFamily};flex:1;">
          ${stripEmojis(meta.label)} (${items.length})
        </div>
      </div>
    `;
    items.forEach((item) => {
      html += `
        <div style="display:flex;gap:6px;padding:3px 10px 3px 18px;font-size:10.5px;font-family:${fontFamily};color:#334155;line-height:1.45;">
          <span style="font-weight:600;color:#475569;min-width:0;flex-shrink:0;">${stripEmojis(item.label)}:</span>
          <span style="color:#64748b;word-break:break-word;">${stripEmojis(item.value)}</span>
        </div>
      `;
    });
    html += `</div>`;
  });

  // Disclaimer — own section
  html += `
    <div data-pdf-section style="margin:8px 20px 4px;padding:8px 14px;background:${rgbaStr(COLORS.primary, 0.05)};border-radius:6px;font-size:8.5px;color:#94a3b8;font-family:${fontFamily};text-align:center;line-height:1.4;">
      ${L.disclaimer}
    </div>
  `;

  html += buildFooterHTML(language, COLORS.primary);

  const fileName = `pregnancy-data-backup-${new Date().toISOString().split('T')[0]}.pdf`;
  await renderHTMLToPDF(html, fileName, language, options.onProgress);
}


// Birth plan PDF export
export async function exportBirthPlanToPDF(options: PDFExportOptions): Promise<void> {
  const { title, content, date, preferences, additionalNotes, language = 'en' } = options;
  const isRTL = language === 'ar';
  const logoData = await loadLogoImage();
  const fontFamily = getFontFamily(language);
  const textAlign = isRTL ? 'justify' : 'left';

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
  const prefCount = preferences ? Object.keys(preferences).length : 0;

  // Split content by headings (H1, H2, H3) so each becomes its own data-pdf-section
  // This prevents truncation by keeping each section small enough for html2canvas
  const splitContentIntoSections = (md: string): string[] => {
    const lines = md.split('\n');
    const sections: string[] = [];
    let current: string[] = [];
    
    for (const line of lines) {
      // Split on any heading level (H1, H2, H3) to keep sections small
      if (/^#{1,3} /.test(line) && current.length > 0) {
        sections.push(current.join('\n'));
        current = [line];
      } else {
        current.push(line);
      }
    }
    if (current.length > 0) sections.push(current.join('\n'));
    
    // Further split any section that has too many lines (>30) to prevent canvas overflow
    const MAX_LINES = 30;
    const finalSections: string[] = [];
    for (const section of sections) {
      const sLines = section.split('\n');
      if (sLines.length <= MAX_LINES) {
        finalSections.push(section);
      } else {
        // Split at blank lines or bullet boundaries
        let chunk: string[] = [];
        for (const line of sLines) {
          chunk.push(line);
          if (chunk.length >= MAX_LINES && (line.trim() === '' || /^[-*+] /.test(line))) {
            finalSections.push(chunk.join('\n'));
            chunk = [];
          }
        }
        if (chunk.length > 0) finalSections.push(chunk.join('\n'));
      }
    }
    return finalSections;
  };

  const contentSections = splitContentIntoSections(content);

  // Build preferences list if available
  let prefsHTML = '';
  if (preferences && prefCount > 0) {
    const prefEntries = Object.entries(preferences).filter(([_, v]) => v);
    prefsHTML = prefEntries.map(([_, value]) => 
      `<div style="display:inline-block;padding:3px 10px;margin:2px 4px;background:rgba(236,72,153,0.08);border-radius:12px;font-size:10px;color:#ec4899;font-weight:500;font-family:${fontFamily};">${stripEmojis(value)}</div>`
    ).join('');
  }

  let html = `
    <div data-pdf-section style="background:#fcfcfd;padding:14px 16px 10px;text-align:center;">
      ${logoData ? `<img src="${logoData}" style="width:30px;height:30px;margin:0 auto 4px;display:block;border-radius:8px;" />` : ''}
      <div style="font-size:20px;font-weight:700;color:#1e293b;margin-bottom:3px;font-family:${fontFamily};">${l.title}</div>
      <div style="font-size:10px;color:#94a3b8;margin-bottom:2px;font-family:${fontFamily};">${date}</div>
      <div style="font-size:9px;color:#ec4899;font-weight:500;font-family:${fontFamily};">${l.brand}</div>
      <div style="height:2px;background:#ec4899;border-radius:1px;margin:8px auto 0;max-width:160px;"></div>
      ${prefCount > 0 ? `
        <div style="margin:14px auto 0;max-width:500px;padding:0;background:#fdf2f8;border-radius:10px;text-align:${textAlign};overflow:hidden;">
          <div style="display:flex;align-items:stretch;">
            <div style="width:4px;min-width:4px;background:#ec4899;${isRTL ? 'order:1;' : ''}"></div>
            <div style="padding:12px 16px;flex:1;">
              <div style="font-size:13px;font-weight:600;color:#ec4899;font-family:${fontFamily};margin-bottom:6px;">${l.prefSummary}</div>
              <div style="font-size:11px;color:#94a3b8;margin-bottom:8px;font-family:${fontFamily};">${prefCount} ${l.prefCount}</div>
              <div style="text-align:center;">${prefsHTML}</div>
            </div>
          </div>
        </div>
      ` : ''}
    </div>
  `;

  // Additional notes section if provided
  if (additionalNotes && additionalNotes.trim()) {
    html += `
      <div data-pdf-section style="margin:6px 16px 4px;padding:0;background:#fdf2f8;border-radius:8px;overflow:hidden;">
        <div style="display:flex;align-items:stretch;">
          <div style="width:4px;min-width:4px;background:#ec4899;${isRTL ? 'order:1;' : ''}"></div>
          <div style="padding:10px 14px;flex:1;">
            <div style="font-size:12px;font-weight:600;color:#ec4899;font-family:${fontFamily};margin-bottom:6px;">${l.notesTitle}</div>
            <div style="font-size:10.5px;color:#334155;font-family:${fontFamily};line-height:1.5;text-align:${textAlign};direction:${isRTL ? 'rtl' : 'ltr'};white-space:pre-wrap;">${stripEmojis(additionalNotes.trim())}</div>
          </div>
        </div>
      </div>
    `;
  }

  // Each markdown section becomes its own data-pdf-section for proper page breaking
  for (const section of contentSections) {
    const sectionHTML = DOMPurify.sanitize(
      markdownToHTMLWithLang(section, fontFamily, isRTL),
      {
        ALLOWED_TAGS: ['h1','h2','h3','h4','h5','h6','p','div','span','strong','em','b','i','br','ul','ol','li','table','thead','tbody','tr','th','td','style'],
        ALLOWED_ATTR: ['style','class','data-pdf-section','dir'],
        ALLOW_DATA_ATTR: true,
      }
    );
    html += `
      <div data-pdf-section style="padding:4px 24px;font-size:11px;line-height:1.5;color:#334155;font-family:${fontFamily};text-align:${textAlign};direction:${isRTL ? 'rtl' : 'ltr'};">
        ${sectionHTML}
      </div>
    `;
  }

  html += `
    <div data-pdf-section style="margin:4px 20px 10px;padding:8px 16px;text-align:center;background:rgba(236,72,153,0.04);border-radius:6px;">
      <div style="height:1.5px;background:linear-gradient(90deg, transparent, rgba(236,72,153,0.25), transparent);margin-bottom:6px;"></div>
      <div style="font-size:8.5px;color:#94a3b8;line-height:1.5;font-family:${fontFamily};">${l.footer}</div>
    </div>
  `;

  const fileName = `birth-plan-${new Date().toISOString().split('T')[0]}.pdf`;
  await renderHTMLToPDF(html, fileName, language, options.onProgress);
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
    mom: string;
    baby: string;
    partner: string;
    documents: string;
    packed: string;
    notPacked: string;
    essential: string;
    recommended: string;
    optional: string;
    progress: string;
    totalItems: string;
  };
}

// Hospital Bag PDF export
export async function exportHospitalBagPDF(options: HospitalBagPDFOptions): Promise<void> {
  const { title, subtitle, items, language = 'en', labels } = options;
  const logoData = await loadLogoImage();
  const isRTL = language === 'ar';
  const fontFamily = getFontFamily(language);
  const accentColor = { r: 20, g: 184, b: 166 }; // Teal

  const packedCount = items.filter(i => i.packed).length;
  const totalCount = items.length;
  const progress = Math.round((packedCount / totalCount) * 100);

  const categoryColors: Record<string, { r: number; g: number; b: number }> = {
    mom: { r: 236, g: 72, b: 153 },
    baby: { r: 59, g: 130, b: 246 },
    partner: { r: 139, g: 92, b: 246 },
    documents: { r: 245, g: 158, b: 11 },
  };

  const categoryLabels: Record<string, string> = {
    mom: labels.mom,
    baby: labels.baby,
    partner: labels.partner,
    documents: labels.documents,
  };

  const categoryStats: Record<string, HospitalBagItem[]> = {
    mom: items.filter(i => i.category === 'mom'),
    baby: items.filter(i => i.category === 'baby'),
    partner: items.filter(i => i.category === 'partner'),
    documents: items.filter(i => i.category === 'documents'),
  };

  let html = buildHeaderHTML(title, subtitle, accentColor, logoData, language);

  // Progress bar - wrapped in data-pdf-section
  const progressBarFill = `${progress}%`;
  html += `
    <div data-pdf-section style="margin:10px 20px;padding:10px 16px;background:${rgbaStr(accentColor, 0.05)};border-radius:8px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <span style="font-size:12px;font-weight:700;color:#1e293b;font-family:${fontFamily};">${stripEmojis(labels.progress)}: ${progress}%</span>
        <span style="font-size:10px;color:#64748b;font-family:${fontFamily};">${packedCount} / ${totalCount} ${stripEmojis(labels.totalItems)}</span>
      </div>
      <div style="height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;">
        <div style="height:100%;width:${progressBarFill};background:linear-gradient(90deg, ${rgbStr(accentColor)}, ${rgbaStr(accentColor, 0.7)});border-radius:4px;"></div>
      </div>
    </div>
  `;

  // Category summary cards - wrapped in data-pdf-section
  html += `<div data-pdf-section style="display:flex;gap:8px;margin:8px 20px 10px;">`;
  Object.entries(categoryStats).forEach(([cat, catItems]) => {
    const color = categoryColors[cat];
    const label = categoryLabels[cat];
    const catPacked = catItems.filter(i => i.packed).length;
    html += `
      <div style="flex:1;background:${rgbaStr(color, 0.06)};border-radius:8px;padding:8px 6px;text-align:center;">
        <div style="font-size:14px;font-weight:800;color:${rgbStr(color)};font-family:${fontFamily};">${catPacked}/${catItems.length}</div>
        <div style="font-size:8px;color:#94a3b8;font-family:${fontFamily};margin-top:2px;">${stripEmojis(label)}</div>
      </div>
    `;
  });
  html += `</div>`;

  html += `<div data-pdf-section style="margin:0 20px 10px;height:1.5px;background:linear-gradient(90deg, transparent, ${rgbaStr(accentColor, 0.2)}, transparent);"></div>`;

  // Items by category - each category is a data-pdf-section
  Object.entries(categoryStats).forEach(([cat, catItems]) => {
    if (catItems.length === 0) return;
    const color = categoryColors[cat];
    const label = categoryLabels[cat];
    const catPacked = catItems.filter(i => i.packed).length;

    html += `<div data-pdf-section style="margin:6px 20px 6px;">`;
    html += `
      <div style="padding:7px 14px;background:${rgbaStr(color, 0.07)};border-radius:6px;display:flex;justify-content:space-between;align-items:center;">
        <div style="display:flex;align-items:center;gap:0;">
          <div style="width:4px;min-width:4px;height:18px;background:${rgbStr(color)};border-radius:2px;margin-${isRTL ? 'left' : 'right'}:10px;"></div>
          <span style="font-size:12.5px;font-weight:700;color:${rgbStr(color)};font-family:${fontFamily};">${stripEmojis(label)}</span>
        </div>
        <span style="font-size:10px;color:#94a3b8;font-family:${fontFamily};">${catPacked}/${catItems.length}</span>
      </div>
    `;

    catItems.forEach(item => {
      const checkColor = item.packed ? rgbStr(COLORS.success) : '#cbd5e1';
      const checkBg = item.packed ? rgbaStr(COLORS.success, 0.12) : 'transparent';
      const textColor = item.packed ? '#94a3b8' : '#334155';
      const textDecoration = item.packed ? 'line-through' : 'none';

      const statusColor = item.packed ? COLORS.success : { r: 239, g: 68, b: 68 };
      const statusText = item.packed ? labels.packed : labels.notPacked;

      let priorityBadge = '';
      if (item.priority === 'essential' && !item.packed) {
        priorityBadge = `<span style="font-size:9px;color:rgb(239,68,68);background:rgba(239,68,68,0.08);padding:2px 8px;border-radius:4px;font-family:${fontFamily};margin-${isRTL ? 'left' : 'right'}:6px;">${stripEmojis(labels.essential)}</span>`;
      }

      html += `
        <div style="padding:4px 14px;display:flex;align-items:center;gap:8px;font-family:${fontFamily};">
          <div style="width:14px;height:14px;border-radius:3px;border:1.5px solid ${checkColor};background:${checkBg};flex-shrink:0;display:flex;align-items:center;justify-content:center;">
            ${item.packed ? `<span style="color:${rgbStr(COLORS.success)};font-size:9px;font-weight:700;">✓</span>` : ''}
          </div>
          <span style="flex:1;font-size:11px;color:${textColor};text-decoration:${textDecoration};line-height:1.4;">${stripEmojis(item.name)}</span>
          ${priorityBadge}
          <span style="font-size:8.5px;color:${rgbStr(statusColor)};background:${rgbaStr(statusColor, 0.08)};padding:2px 7px;border-radius:4px;font-weight:500;">${stripEmojis(statusText)}</span>
        </div>
      `;
    });
    html += `</div>`;
  });

  html += buildFooterHTML(language, accentColor);

  const fileName = `hospital-bag-checklist-${new Date().toISOString().split('T')[0]}.pdf`;
  await renderHTMLToPDF(html, fileName, language, options.onProgress);
}

// Generate WhatsApp share text for hospital bag
export function generateHospitalBagShareText(
  items: HospitalBagItem[],
  labels: {
    title: string;
    mom: string;
    baby: string;
    partner: string;
    documents: string;
    packed: string;
    notPacked: string;
    progress: string;
  }
): string {
  const packedCount = items.filter(i => i.packed).length;
  const totalCount = items.length;
  const progress = Math.round((packedCount / totalCount) * 100);

  const categoryLabels = {
    mom: labels.mom,
    baby: labels.baby,
    partner: labels.partner,
    documents: labels.documents,
  };

  let text = `*${labels.title}*\n`;
  text += `${labels.progress}: ${progress}% (${packedCount}/${totalCount})\n\n`;

  const categories = ['documents', 'mom', 'baby', 'partner'] as const;

  categories.forEach(cat => {
    const catItems = items.filter(i => i.category === cat);
    if (catItems.length === 0) return;

    const catPacked = catItems.filter(i => i.packed).length;
    text += `*${categoryLabels[cat]}* (${catPacked}/${catItems.length})\n`;

    catItems.forEach(item => {
      const icon = item.packed ? '✅' : '⬜';
      text += `${icon} ${item.name}\n`;
    });

    text += '\n';
  });

  text += `_Pregnancy Toolkits_`;

  return text;
}

// AI Result PDF export (generic markdown-based AI output)
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
  const isRTL = language === 'ar';
  const logoData = await loadLogoImage();
  const fontFamily = getFontFamily(language);
  const textAlign = isRTL ? 'justify' : 'left';
  const accentColor = { r: 139, g: 92, b: 246 }; // Violet

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

  let html = buildHeaderHTML(title, subtitle, accentColor, logoData, language);

  // Score card if provided
  if (score) {
    html += `
      <div data-pdf-section style="margin:8px 16px;padding:10px 16px;background:${rgbaStr(accentColor, 0.06)};border-radius:8px;text-align:center;">
        <div style="font-size:22px;font-weight:700;color:${rgbStr(accentColor)};font-family:${fontFamily};">${score.value} / ${score.max}</div>
        <div style="font-size:10px;color:#94a3b8;font-family:${fontFamily};margin-top:2px;">${stripEmojis(score.label)}</div>
      </div>
    `;
  }

  // Split content by H1/H2/H3 headings for proper page breaking
  const splitContentSections = (md: string): string[] => {
    const mdLines = md.split('\n');
    const result: string[] = [];
    let cur: string[] = [];
    for (const line of mdLines) {
      if (/^#{1,3} /.test(line) && cur.length > 0) {
        result.push(cur.join('\n'));
        cur = [line];
      } else {
        cur.push(line);
      }
    }
    if (cur.length > 0) result.push(cur.join('\n'));
    // Further split large sections (>30 lines)
    const MAX_LINES = 30;
    const final: string[] = [];
    for (const s of result) {
      const sLines = s.split('\n');
      if (sLines.length <= MAX_LINES) { final.push(s); continue; }
      let chunk: string[] = [];
      for (const line of sLines) {
        chunk.push(line);
        if (chunk.length >= MAX_LINES && (line.trim() === '' || /^[-*+] /.test(line))) {
          final.push(chunk.join('\n'));
          chunk = [];
        }
      }
      if (chunk.length > 0) final.push(chunk.join('\n'));
    }
    return final;
  };

  const contentSections = splitContentSections(content);

  for (const section of contentSections) {
    const sectionHTML = DOMPurify.sanitize(
      markdownToHTMLWithLang(section, fontFamily, isRTL),
      {
        ALLOWED_TAGS: ['h1','h2','h3','h4','h5','h6','p','div','span','strong','em','b','i','br','ul','ol','li','style'],
        ALLOWED_ATTR: ['style','class','data-pdf-section','dir'],
        ALLOW_DATA_ATTR: true,
      }
    );
    html += `
      <div data-pdf-section style="padding:4px 24px;font-size:11px;line-height:1.5;color:#334155;font-family:${fontFamily};text-align:${textAlign};direction:${isRTL ? 'rtl' : 'ltr'};">
        ${sectionHTML}
      </div>
    `;
  }

  // Disclaimer
  html += `
    <div data-pdf-section style="margin:8px 20px 4px;padding:8px 14px;background:${rgbaStr(accentColor, 0.05)};border-radius:6px;font-size:8.5px;color:#94a3b8;font-family:${fontFamily};text-align:center;line-height:1.4;">
      ${disclaimer}
    </div>
  `;

  html += buildFooterHTML(language, accentColor);

  const fileName = `${title.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
  await renderHTMLToPDF(html, fileName, language, options.onProgress);
}
