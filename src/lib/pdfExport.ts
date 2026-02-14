import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

interface PDFExportOptions {
  title: string;
  content: string;
  date: string;
  preferences?: Record<string, string>;
  language?: string;
  contentElement?: HTMLElement;
}

interface DataBackupPDFOptions {
  title: string;
  subtitle?: string;
  data: Record<string, any>;
  language?: 'en' | 'ar';
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
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';
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

// Unified html2canvas-to-PDF renderer 
async function renderHTMLToPDF(htmlContent: string, fileName: string, language: string = 'en'): Promise<void> {
  const isRTL = language === 'ar';
  const fontFamily = getFontFamily(language);
  const textAlign = isRTL ? 'justify' : 'left';

  const container = document.createElement('div');
  container.style.cssText = `
    position: absolute;
    left: -9999px;
    top: 0;
    width: 794px;
    background: #ffffff;
    font-family: ${fontFamily};
    color: #1e293b;
    direction: ${isRTL ? 'rtl' : 'ltr'};
    text-align: ${textAlign};
    padding: 0;
    line-height: 1.6;
    z-index: -1;
    letter-spacing: normal;
    word-spacing: normal;
  `;

  container.innerHTML = `
    <style>
      * { 
        font-family: ${fontFamily} !important; 
        text-rendering: optimizeLegibility;
        letter-spacing: normal !important;
        word-spacing: normal !important;
      }
      h1, h2, h3, h4, h5, h6, p, div, span, strong, em, li, ul, ol {
        font-family: ${fontFamily} !important;
        direction: ${isRTL ? 'rtl' : 'ltr'};
        text-align: ${textAlign} !important;
      }
    </style>
    ${htmlContent}
  `;

  document.body.appendChild(container);

  try {
    await document.fonts.ready;
  } catch { /* fallback */ }
  await new Promise(resolve => setTimeout(resolve, 400));

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 794,
      windowWidth: 794,
      removeContainer: false,
    });

    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error('Canvas rendered with 0 dimensions');
    }

    const A4_WIDTH_MM = 210;
    const A4_HEIGHT_MM = 297;
    const pixelsPerMM = canvas.width / A4_WIDTH_MM;
    const pageHeightPx = A4_HEIGHT_MM * pixelsPerMM;

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    let remainingHeight = canvas.height;
    let srcYPx = 0;
    let pageIndex = 0;

    while (remainingHeight > 0) {
      if (pageIndex > 0) doc.addPage();

      const sliceHeightPx = Math.min(remainingHeight, pageHeightPx);
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeightPx;
      const ctx = pageCanvas.getContext('2d');

      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(canvas, 0, srcYPx, canvas.width, sliceHeightPx, 0, 0, pageCanvas.width, sliceHeightPx);
      }

      const pageImgData = pageCanvas.toDataURL('image/png');
      const sliceHeightMM = sliceHeightPx / pixelsPerMM;
      doc.addImage(pageImgData, 'PNG', 0, 0, A4_WIDTH_MM, sliceHeightMM);

      srcYPx += sliceHeightPx;
      remainingHeight -= sliceHeightPx;
      pageIndex++;
    }

    doc.save(fileName);
  } finally {
    document.body.removeChild(container);
  }
}

// Build PDF header HTML
function buildHeaderHTML(
  title: string, 
  subtitle: string | undefined, 
  accentColor: { r: number; g: number; b: number }, 
  logoData: string | null, 
  language: string
): string {
  const fontFamily = getFontFamily(language);
  return `
    <div style="background:#fcfcfd;border-bottom:2px solid ${rgbStr(accentColor)};padding:24px 40px 20px;text-align:center;">
      ${logoData ? `<img src="${logoData}" style="width:36px;height:36px;margin:0 auto 8px;display:block;border-radius:8px;" />` : ''}
      <div style="font-size:24px;font-weight:700;color:#1e293b;margin-bottom:4px;font-family:${fontFamily};">${stripEmojis(title)}</div>
      ${subtitle ? `<div style="font-size:12px;color:#94a3b8;margin-bottom:4px;font-family:${fontFamily};">${stripEmojis(subtitle)}</div>` : ''}
      <div style="font-size:10px;color:${rgbStr(accentColor)};font-weight:500;font-family:${fontFamily};">Pregnancy Toolkits</div>
    </div>
  `;
}

// Build PDF footer HTML
function buildFooterHTML(language: string, accentColor: { r: number; g: number; b: number }): string {
  const fontFamily = getFontFamily(language);
  const isRTL = language === 'ar';
  const dateStr = formatDateForPDF(new Date(), language);
  const text = isRTL
    ? `تم التصدير بتاريخ ${dateStr} • Pregnancy Toolkits`
    : `Exported on ${dateStr} • Pregnancy Toolkits`;
  return `
    <div style="margin:16px 40px 20px;padding-top:12px;border-top:1px solid ${rgbaStr(accentColor, 0.3)};text-align:center;">
      <div style="font-size:9px;color:#94a3b8;font-family:${fontFamily};">${text}</div>
    </div>
  `;
}

// Build section header HTML
function buildSectionHTML(sectionTitle: string, accentColor: { r: number; g: number; b: number }, language: string): string {
  const fontFamily = getFontFamily(language);
  const isRTL = language === 'ar';
  const borderSide = isRTL ? 'right' : 'left';
  return `
    <div style="margin:16px 40px 8px;padding:8px 14px;background:${rgbaStr(accentColor, 0.08)};border-radius:6px;border-${borderSide}:4px solid ${rgbStr(accentColor)};font-size:15px;font-weight:700;color:${rgbStr(accentColor)};font-family:${fontFamily};">
      ${stripEmojis(sectionTitle)}
    </div>
  `;
}

// Build a bullet item HTML
function buildBulletItemHTML(text: string, accentColor: { r: number; g: number; b: number }, language: string): string {
  const fontFamily = getFontFamily(language);
  const isRTL = language === 'ar';
  const paddingSide = isRTL ? 'right' : 'left';
  const dotSide = isRTL ? 'right' : 'left';
  return `
    <div style="padding:3px 40px 3px 56px;padding-${paddingSide}:56px;position:relative;font-size:12px;color:#1e293b;font-family:${fontFamily};line-height:1.7;">
      <span style="position:absolute;${dotSide}:42px;top:10px;width:5px;height:5px;background:${rgbStr(accentColor)};border-radius:50%;display:inline-block;"></span>
      ${stripEmojis(text)}
    </div>
  `;
}

// Build a label:value item HTML
function buildLabelValueHTML(label: string, value: string, accentColor: { r: number; g: number; b: number }, language: string): string {
  const fontFamily = getFontFamily(language);
  const isRTL = language === 'ar';
  const paddingSide = isRTL ? 'right' : 'left';
  const dotSide = isRTL ? 'right' : 'left';
  return `
    <div style="padding:3px 40px 3px 56px;padding-${paddingSide}:56px;position:relative;font-size:12px;color:#1e293b;font-family:${fontFamily};line-height:1.7;">
      <span style="position:absolute;${dotSide}:42px;top:10px;width:5px;height:5px;background:${rgbStr(accentColor)};border-radius:50%;display:inline-block;"></span>
      <strong>${stripEmojis(label)}:</strong> <span style="color:#64748b;">${stripEmojis(value)}</span>
    </div>
  `;
}

// Convert markdown to HTML
function markdownToHTMLWithLang(markdown: string, fontFamily: string, isRTL: boolean): string {
  const borderSide = isRTL ? 'right' : 'left';
  const paddingSide = isRTL ? 'right' : 'left';
  const textAlign = isRTL ? 'justify' : 'left';
  const cleaned = stripEmojis(markdown);

  return cleaned
    .replace(/^### (.*$)/gm, `<h3 style="font-size:15px;font-weight:600;color:#ec4899;margin:16px 0 8px;padding:6px 12px;background:rgba(236,72,153,0.08);border-radius:6px;border-${borderSide}:3px solid #ec4899;font-family:${fontFamily};direction:${isRTL ? 'rtl' : 'ltr'};text-align:${textAlign};">$1</h3>`)
    .replace(/^## (.*$)/gm, `<h2 style="font-size:17px;font-weight:700;color:#ec4899;margin:20px 0 10px;padding:8px 14px;background:rgba(236,72,153,0.08);border-radius:8px;border-${borderSide}:4px solid #ec4899;font-family:${fontFamily};direction:${isRTL ? 'rtl' : 'ltr'};text-align:${textAlign};">$1</h2>`)
    .replace(/^# (.*$)/gm, `<h1 style="font-size:20px;font-weight:700;color:#1e293b;margin:20px 0 12px;font-family:${fontFamily};direction:${isRTL ? 'rtl' : 'ltr'};text-align:${textAlign};">$1</h1>`)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^[-*+] (.*$)/gm, `<div style="padding:3px 0 3px 16px;padding-${paddingSide}:16px;position:relative;font-family:${fontFamily};direction:${isRTL ? 'rtl' : 'ltr'};text-align:${textAlign};"><span style="position:absolute;${paddingSide}:0;top:8px;width:6px;height:6px;background:#ec4899;border-radius:50%;display:inline-block;"></span>$1</div>`)
    .replace(/^\d+\. (.*$)/gm, `<div style="padding:3px 0 3px 8px;font-family:${fontFamily};direction:${isRTL ? 'rtl' : 'ltr'};text-align:${textAlign};">$1</div>`)
    .replace(/\n{2,}/g, '<div style="height:10px;"></div>')
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
  html += `<div style="margin:12px 40px;height:1px;background:${rgbaStr(accentColor, 0.3)};"></div>`;

  sections.forEach((section) => {
    html += buildSectionHTML(section.title, accentColor, language);
    section.items.forEach((item) => {
      if (typeof item === 'string') {
        html += buildBulletItemHTML(item, accentColor, language);
      } else {
        html += buildLabelValueHTML(item.label, item.value, accentColor, language);
      }
    });
  });

  html += buildFooterHTML(language, accentColor);

  const fileName = `${title.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
  await renderHTMLToPDF(html, fileName, language);
}

// Data backup PDF export
export async function exportDataBackupPDF(options: DataBackupPDFOptions): Promise<void> {
  const { title, subtitle, data, language = 'en' } = options;
  const logoData = await loadLogoImage();
  const isRTL = language === 'ar';
  const fontFamily = getFontFamily(language);
  const textAlign = isRTL ? 'justify' : 'left';

  // Categorize data
  const categoryMeta: Record<string, { label: Record<string, string>; color: typeof COLORS.primary }> = {
    profile: { label: { en: 'Profile & Settings', ar: 'الملف الشخصي والإعدادات' }, color: COLORS.info },
    health: { label: { en: 'Health Tracking', ar: 'تتبع الصحة' }, color: COLORS.primary },
    appointments: { label: { en: 'Appointments', ar: 'المواعيد' }, color: COLORS.secondary },
    nutrition: { label: { en: 'Nutrition', ar: 'التغذية' }, color: COLORS.success },
    planning: { label: { en: 'Birth Planning', ar: 'تخطيط الولادة' }, color: COLORS.accent },
    other: { label: { en: 'Other Data', ar: 'بيانات أخرى' }, color: COLORS.muted }
  };

  const categories: Record<string, { label: string; value: string }[]> = {
    profile: [], health: [], appointments: [], nutrition: [], planning: [], other: []
  };

  Object.entries(data).forEach(([key, value]) => {
    const displayValue = typeof value === 'object'
      ? (Array.isArray(value) ? `${value.length} ${isRTL ? 'عنصر' : 'items'}` : JSON.stringify(value).substring(0, 80))
      : String(value);

    const item = { label: key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim(), value: displayValue };

    if (key.includes('profile') || key.includes('settings') || key.includes('week') || key.includes('date') || key.includes('language')) {
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

  // Summary stats
  html += `
    <div style="display:flex;gap:10px;margin:16px 40px;">
      <div style="flex:1;background:${rgbaStr(COLORS.primary, 0.08)};border-radius:8px;padding:12px;text-align:center;border-left:3px solid ${rgbStr(COLORS.primary)};">
        <div style="font-size:20px;font-weight:700;color:${rgbStr(COLORS.primary)};font-family:${fontFamily};">${totalItems}</div>
        <div style="font-size:9px;color:#94a3b8;font-family:${fontFamily};">${isRTL ? 'إجمالي البيانات' : 'Total Items'}</div>
      </div>
      <div style="flex:1;background:${rgbaStr(COLORS.success, 0.08)};border-radius:8px;padding:12px;text-align:center;border-left:3px solid ${rgbStr(COLORS.success)};">
        <div style="font-size:20px;font-weight:700;color:${rgbStr(COLORS.success)};font-family:${fontFamily};">${categories.health.length}</div>
        <div style="font-size:9px;color:#94a3b8;font-family:${fontFamily};">${isRTL ? 'بيانات صحية' : 'Health Data'}</div>
      </div>
      <div style="flex:1;background:${rgbaStr(COLORS.secondary, 0.08)};border-radius:8px;padding:12px;text-align:center;border-left:3px solid ${rgbStr(COLORS.secondary)};">
        <div style="font-size:20px;font-weight:700;color:${rgbStr(COLORS.secondary)};font-family:${fontFamily};">${categories.planning.length}</div>
        <div style="font-size:9px;color:#94a3b8;font-family:${fontFamily};">${isRTL ? 'التخطيط' : 'Planning'}</div>
      </div>
    </div>
  `;

  html += `<div style="margin:12px 40px;height:1px;background:${rgbaStr(COLORS.primary, 0.2)};"></div>`;

  // Render each category
  Object.entries(categories).forEach(([cat, items]) => {
    if (items.length === 0) return;
    const meta = categoryMeta[cat];
    const catLabel = meta.label[language] || meta.label.en;

    html += buildSectionHTML(`${catLabel} (${items.length})`, meta.color, language);
    items.forEach((item) => {
      html += buildLabelValueHTML(item.label, item.value, meta.color, language);
    });
  });

  html += buildFooterHTML(language, COLORS.primary);

  const fileName = `pregnancy-data-backup-${new Date().toISOString().split('T')[0]}.pdf`;
  await renderHTMLToPDF(html, fileName, language);
}

// Birth plan PDF export
export async function exportBirthPlanToPDF(options: PDFExportOptions): Promise<void> {
  const { title, content, date, preferences, language = 'en', contentElement } = options;
  const isRTL = language === 'ar';
  const logoData = await loadLogoImage();
  const fontFamily = getFontFamily(language);
  const textAlign = isRTL ? 'justify' : 'left';

  const labels: Record<string, Record<string, string>> = {
    en: { title: 'Birth Plan', prefSummary: 'Preferences Summary', prefCount: 'preferences selected', footer: 'This birth plan is a guide for your healthcare team. Flexibility may be needed based on medical circumstances.', brand: 'Pregnancy Toolkits' },
    ar: { title: 'خطة الولادة', prefSummary: 'ملخص التفضيلات', prefCount: 'تفضيلات محددة', footer: 'خطة الولادة هذه هي دليل لفريقك الطبي. قد تكون المرونة مطلوبة بناءً على الظروف الطبية.', brand: 'Pregnancy Toolkits' },
    de: { title: 'Geburtsplan', prefSummary: 'Präferenzen Zusammenfassung', prefCount: 'Präferenzen ausgewählt', footer: 'Dieser Geburtsplan ist ein Leitfaden für Ihr medizinisches Team.', brand: 'Pregnancy Toolkits' },
    tr: { title: 'Doğum Planı', prefSummary: 'Tercihler Özeti', prefCount: 'tercih seçildi', footer: 'Bu doğum planı sağlık ekibiniz için bir rehberdir.', brand: 'Pregnancy Toolkits' },
    fr: { title: 'Plan de naissance', prefSummary: 'Résumé des préférences', prefCount: 'préférences sélectionnées', footer: 'Ce plan de naissance est un guide pour votre équipe soignante.', brand: 'Pregnancy Toolkits' },
    es: { title: 'Plan de parto', prefSummary: 'Resumen de preferencias', prefCount: 'preferencias seleccionadas', footer: 'Este plan de parto es una guía para su equipo médico.', brand: 'Pregnancy Toolkits' },
    pt: { title: 'Plano de parto', prefSummary: 'Resumo das preferências', prefCount: 'preferências selecionadas', footer: 'Este plano de parto é um guia para a sua equipa médica.', brand: 'Pregnancy Toolkits' },
  };

  const l = labels[language] || labels.en;
  const prefCount = preferences ? Object.keys(preferences).length : 0;

  const mainContent = contentElement
    ? stripEmojisFromHTML(contentElement.innerHTML, isRTL)
    : markdownToHTMLWithLang(content, fontFamily, isRTL);

  let html = `
    <div style="background:#fcfcfd;border-bottom:2px solid #ec4899;padding:24px 40px 20px;text-align:center;">
      ${logoData ? `<img src="${logoData}" style="width:40px;height:40px;margin:0 auto 8px;display:block;border-radius:8px;" />` : ''}
      <div style="font-size:28px;font-weight:700;color:#1e293b;margin-bottom:6px;font-family:${fontFamily};">${l.title}</div>
      <div style="font-size:13px;color:#94a3b8;margin-bottom:4px;font-family:${fontFamily};">${date}</div>
      <div style="font-size:11px;color:#ec4899;font-weight:500;font-family:${fontFamily};">${l.brand}</div>
    </div>
    
    ${prefCount > 0 ? `
    <div style="margin:20px 40px 0;padding:12px 16px;background:#fdf2f8;border-radius:8px;border-${isRTL ? 'right' : 'left'}:4px solid #ec4899;text-align:${textAlign};">
      <div style="font-size:14px;font-weight:600;color:#ec4899;font-family:${fontFamily};text-align:${textAlign};">${l.prefSummary}</div>
      <div style="font-size:12px;color:#94a3b8;margin-top:2px;font-family:${fontFamily};text-align:${textAlign};">${prefCount} ${l.prefCount}</div>
    </div>
    ` : ''}
    
    <div style="margin:16px 40px;height:1px;background:#ec4899;"></div>
    
    <div style="padding:0 40px 20px;font-size:13px;line-height:1.8;color:#1e293b;font-family:${fontFamily};text-align:${textAlign};direction:${isRTL ? 'rtl' : 'ltr'};">
      ${mainContent}
    </div>
    
    <div style="margin:10px 40px 20px;padding-top:10px;border-top:1px solid #ec4899;text-align:center;">
      <div style="font-size:9px;color:#94a3b8;line-height:1.5;font-family:${fontFamily};">${l.footer}</div>
    </div>
  `;

  const fileName = `birth-plan-${new Date().toISOString().split('T')[0]}.pdf`;
  await renderHTMLToPDF(html, fileName, language);
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

  // Progress bar
  const progressBarFill = `${progress}%`;
  html += `
    <div style="margin:16px 40px;padding:14px 16px;background:${rgbaStr(accentColor, 0.06)};border-radius:8px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <span style="font-size:13px;font-weight:600;color:#1e293b;font-family:${fontFamily};">${stripEmojis(labels.progress)}: ${progress}%</span>
        <span style="font-size:11px;color:#94a3b8;font-family:${fontFamily};">${packedCount} / ${totalCount} ${stripEmojis(labels.totalItems)}</span>
      </div>
      <div style="height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;">
        <div style="height:100%;width:${progressBarFill};background:${rgbStr(accentColor)};border-radius:4px;"></div>
      </div>
    </div>
  `;

  // Category summary cards
  html += `<div style="display:flex;gap:8px;margin:12px 40px 16px;">`;
  Object.entries(categoryStats).forEach(([cat, catItems]) => {
    const color = categoryColors[cat];
    const label = categoryLabels[cat];
    const catPacked = catItems.filter(i => i.packed).length;
    html += `
      <div style="flex:1;background:${rgbaStr(color, 0.08)};border-radius:8px;padding:10px 8px;text-align:center;border-left:3px solid ${rgbStr(color)};">
        <div style="font-size:16px;font-weight:700;color:${rgbStr(color)};font-family:${fontFamily};">${catPacked}/${catItems.length}</div>
        <div style="font-size:8px;color:#94a3b8;font-family:${fontFamily};margin-top:2px;">${stripEmojis(label)}</div>
      </div>
    `;
  });
  html += `</div>`;

  html += `<div style="margin:0 40px 12px;height:1px;background:${rgbaStr(accentColor, 0.2)};"></div>`;

  // Items by category
  Object.entries(categoryStats).forEach(([cat, catItems]) => {
    if (catItems.length === 0) return;
    const color = categoryColors[cat];
    const label = categoryLabels[cat];
    const catPacked = catItems.filter(i => i.packed).length;
    const borderSide = isRTL ? 'right' : 'left';

    html += `
      <div style="margin:14px 40px 6px;padding:8px 14px;background:${rgbaStr(color, 0.08)};border-radius:6px;border-${borderSide}:4px solid ${rgbStr(color)};display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:14px;font-weight:700;color:${rgbStr(color)};font-family:${fontFamily};">${stripEmojis(label)}</span>
        <span style="font-size:11px;color:#94a3b8;font-family:${fontFamily};">${catPacked}/${catItems.length}</span>
      </div>
    `;

    catItems.forEach(item => {
      const checkColor = item.packed ? rgbStr(COLORS.success) : '#cbd5e1';
      const checkBg = item.packed ? rgbaStr(COLORS.success, 0.15) : 'transparent';
      const textColor = item.packed ? '#94a3b8' : '#1e293b';
      const textDecoration = item.packed ? 'line-through' : 'none';

      const statusColor = item.packed ? COLORS.success : { r: 239, g: 68, b: 68 };
      const statusText = item.packed ? labels.packed : labels.notPacked;

      let priorityBadge = '';
      if (item.priority === 'essential' && !item.packed) {
        priorityBadge = `<span style="font-size:9px;color:rgb(239,68,68);background:rgba(239,68,68,0.1);padding:1px 6px;border-radius:3px;font-family:${fontFamily};margin-${isRTL ? 'left' : 'right'}:6px;">${stripEmojis(labels.essential)}</span>`;
      }

      html += `
        <div style="padding:4px 40px 4px 56px;padding-${isRTL ? 'right' : 'left'}:56px;display:flex;align-items:center;gap:8px;font-family:${fontFamily};">
          <div style="width:14px;height:14px;border-radius:3px;border:1.5px solid ${checkColor};background:${checkBg};flex-shrink:0;display:flex;align-items:center;justify-content:center;">
            ${item.packed ? `<span style="color:${rgbStr(COLORS.success)};font-size:10px;font-weight:700;">✓</span>` : ''}
          </div>
          <span style="flex:1;font-size:11px;color:${textColor};text-decoration:${textDecoration};">${stripEmojis(item.name)}</span>
          ${priorityBadge}
          <span style="font-size:9px;color:${rgbStr(statusColor)};background:${rgbaStr(statusColor, 0.1)};padding:1px 6px;border-radius:3px;">${stripEmojis(statusText)}</span>
        </div>
      `;
    });
  });

  html += buildFooterHTML(language, accentColor);

  const fileName = `hospital-bag-checklist-${new Date().toISOString().split('T')[0]}.pdf`;
  await renderHTMLToPDF(html, fileName, language);
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
