import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import DOMPurify from 'dompurify';

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
  language?: 'en' | 'ar' | 'de' | 'fr' | 'es' | 'pt' | 'tr';
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
async function renderHTMLToPDF(htmlContent: string, fileName: string, language: string = 'en'): Promise<void> {
  const isRTL = language === 'ar';
  const fontFamily = getFontFamily(language);

  // A4 at 96dpi ≈ 794×1123px. We use a fixed wrapper width for consistency.
  const WRAPPER_WIDTH_PX = 794;

  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    position: absolute;
    left: -9999px;
    top: 0;
    width: ${WRAPPER_WIDTH_PX}px;
    background: #ffffff;
    font-family: ${fontFamily};
    color: #1e293b;
    direction: ${isRTL ? 'rtl' : 'ltr'};
    padding: 0;
    line-height: 1.6;
    z-index: -1;
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
  await new Promise(resolve => setTimeout(resolve, 500));

  // PDF constants
  const A4_WIDTH_MM = 210;
  const A4_HEIGHT_MM = 297;
  const MARGIN_X_MM = 10;
  const MARGIN_Y_MM = 8;
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
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: WRAPPER_WIDTH_PX,
        windowWidth: WRAPPER_WIDTH_PX,
      });
      const scaleFactor = CONTENT_WIDTH_MM / (canvas.width / 2.5);
      const pageHeightPx = CONTENT_HEIGHT_MM / scaleFactor;
      let remaining = canvas.height;
      let srcY = 0;
      let pageIdx = 0;
      while (remaining > 0) {
        if (pageIdx > 0) doc.addPage();
        const sliceH = Math.min(remaining, pageHeightPx * 2.5);
        const sliceHMM = (sliceH / 2.5) * scaleFactor;
        const pc = document.createElement('canvas');
        pc.width = canvas.width; pc.height = sliceH;
        const ctx = pc.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, pc.width, pc.height);
          ctx.drawImage(canvas, 0, srcY, canvas.width, sliceH, 0, 0, pc.width, sliceH);
        }
        doc.addImage(pc.toDataURL('image/png'), 'PNG', MARGIN_X_MM, MARGIN_Y_MM, CONTENT_WIDTH_MM, sliceHMM);
        srcY += sliceH; remaining -= sliceH; pageIdx++;
      }
    } finally {
      document.body.removeChild(wrapper);
    }
    doc.save(fileName);
    return;
  }

  // Section-based rendering with proper margins
  let currentY = MARGIN_Y_MM;

  for (const section of sections) {
    let canvas: HTMLCanvasElement;
    try {
      canvas = await html2canvas(section, {
        scale: 2.5,
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

    // Calculate the real dimensions
    const realWidthPx = canvas.width / 2.5;
    const realHeightPx = canvas.height / 2.5;
    const scaleFactor = CONTENT_WIDTH_MM / realWidthPx;
    const sectionHeightMM = realHeightPx * scaleFactor;

    // If a single section is taller than a full page, split it across pages
    if (sectionHeightMM > CONTENT_HEIGHT_MM) {
      const pageSliceHeightPx = (CONTENT_HEIGHT_MM / scaleFactor) * 2.5;
      let remaining = canvas.height;
      let srcY = 0;
      while (remaining > 0) {
        const availableHeightMM = (currentY === MARGIN_Y_MM) ? CONTENT_HEIGHT_MM : (A4_HEIGHT_MM - MARGIN_Y_MM - currentY);
        const availableSlicePx = (availableHeightMM / scaleFactor) * 2.5;
        
        if (availableHeightMM < 20 && currentY > MARGIN_Y_MM) {
          doc.addPage();
          currentY = MARGIN_Y_MM;
          continue;
        }
        
        const sliceH = Math.min(remaining, availableSlicePx);
        const sliceHMM = (sliceH / 2.5) * scaleFactor;
        const pc = document.createElement('canvas');
        pc.width = canvas.width; pc.height = sliceH;
        const ctx = pc.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, pc.width, pc.height);
          ctx.drawImage(canvas, 0, srcY, canvas.width, sliceH, 0, 0, pc.width, sliceH);
        }
        doc.addImage(pc.toDataURL('image/png'), 'PNG', MARGIN_X_MM, currentY, CONTENT_WIDTH_MM, sliceHMM);
        currentY += sliceHMM;
        srcY += sliceH; remaining -= sliceH;
        if (remaining > 0) { doc.addPage(); currentY = MARGIN_Y_MM; }
      }
      currentY += SECTION_GAP_MM;
      continue;
    }

    // Check if section fits on current page
    const spaceLeft = A4_HEIGHT_MM - MARGIN_Y_MM - currentY;
    if (sectionHeightMM > spaceLeft && currentY > MARGIN_Y_MM) {
      doc.addPage();
      currentY = MARGIN_Y_MM;
    }

    const imgData = canvas.toDataURL('image/png');
    doc.addImage(imgData, 'PNG', MARGIN_X_MM, currentY, CONTENT_WIDTH_MM, sectionHeightMM);
    currentY += sectionHeightMM + SECTION_GAP_MM;
  }

  document.body.removeChild(wrapper);
  doc.save(fileName);
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
    <div data-pdf-section style="background:#fcfcfd;padding:24px 40px 20px;text-align:center;">
      ${logoData ? `<img src="${logoData}" style="width:36px;height:36px;margin:0 auto 8px;display:block;border-radius:8px;" />` : ''}
      <div style="font-size:24px;font-weight:700;color:#1e293b;margin-bottom:4px;font-family:${fontFamily};">${stripEmojis(title)}</div>
      ${subtitle ? `<div style="font-size:12px;color:#94a3b8;margin-bottom:4px;font-family:${fontFamily};">${stripEmojis(subtitle)}</div>` : ''}
      <div style="font-size:10px;color:${rgbStr(accentColor)};font-weight:500;font-family:${fontFamily};">${getBrandName(language)}</div>
      <div style="height:2px;background:${rgbStr(accentColor)};border-radius:1px;margin:12px auto 0;max-width:180px;"></div>
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
  const text = `${exportLabel} ${dateStr} • ${getBrandName(language)}`;
  return `
    <div data-pdf-section style="padding:12px 40px 20px;text-align:center;background:#fcfcfd;">
      <div style="height:1px;background:${rgbaStr(accentColor, 0.3)};margin-bottom:12px;"></div>
      <div style="font-size:9px;color:#94a3b8;font-family:${fontFamily};">${text}</div>
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
    <div data-pdf-section style="margin:12px 40px 0;padding-bottom:4px;">
      <div style="display:flex;align-items:stretch;border-radius:6px 6px 0 0;overflow:hidden;background:${rgbaStr(accentColor, 0.08)};">
        <div style="width:4px;min-width:4px;background:${rgbStr(accentColor)};${isRTL ? 'order:1;' : ''}"></div>
        <div style="padding:8px 14px;font-size:14px;font-weight:700;color:${rgbStr(accentColor)};font-family:${fontFamily};flex:1;">
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
    <div data-pdf-section style="margin:12px 40px 0;">
      <div style="display:flex;align-items:stretch;border-radius:6px;overflow:hidden;background:${rgbaStr(accentColor, 0.08)};">
        <div style="width:4px;min-width:4px;background:${rgbStr(accentColor)};${isRTL ? 'order:1;' : ''}"></div>
        <div style="padding:8px 14px;font-size:14px;font-weight:700;color:${rgbStr(accentColor)};font-family:${fontFamily};flex:1;">
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
    <div style="display:flex;align-items:flex-start;gap:8px;padding:3px 40px;font-size:12px;color:#1e293b;font-family:${fontFamily};line-height:1.7;direction:${dir};">
      <span style="width:5px;height:5px;min-width:5px;background:${rgbStr(accentColor)};border-radius:50%;display:inline-block;margin-top:8px;flex-shrink:0;"></span>
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
    <div style="display:flex;align-items:flex-start;gap:8px;padding:3px 40px;font-size:12px;color:#1e293b;font-family:${fontFamily};line-height:1.7;direction:${dir};">
      <span style="width:5px;height:5px;min-width:5px;background:${rgbStr(accentColor)};border-radius:50%;display:inline-block;margin-top:8px;flex-shrink:0;"></span>
      <span style="flex:1;"><strong>${stripEmojis(label)}:</strong> <span style="color:#64748b;">${stripEmojis(value)}</span></span>
    </div>
  `;
}

// Convert markdown to HTML
function markdownToHTMLWithLang(markdown: string, fontFamily: string, isRTL: boolean): string {
  const borderSide = isRTL ? 'right' : 'left';
  const paddingSide = isRTL ? 'right' : 'left';
  const textAlign = isRTL ? 'justify' : 'left';
  const dir = isRTL ? 'rtl' : 'ltr';
  const cleaned = stripEmojis(markdown);

  // Use background-color for the accent bar instead of border (html2canvas renders borders as dashed)
  const makeHeading = (level: number, text: string) => {
    const sizes = [18, 16, 14, 13];
    const weights = [700, 700, 600, 600];
    const paddings = ['10px 14px 10px 18px', '8px 14px 8px 16px', '6px 12px 6px 14px', '5px 10px 5px 12px'];
    const margins = ['20px 0 12px', '18px 0 10px', '14px 0 8px', '12px 0 6px'];
    const barWidths = [4, 4, 3, 3];
    const idx = level - 1;
    const headingColor = level <= 2 ? '#1e293b' : '#be185d';
    // Accent bar via a nested span instead of border to avoid dashed rendering
    return `<div style="display:flex;align-items:stretch;margin:${margins[idx]};border-radius:8px;overflow:hidden;background:rgba(236,72,153,0.07);direction:${dir};">` +
      `<div style="width:${barWidths[idx]}px;min-width:${barWidths[idx]}px;background:#ec4899;flex-shrink:0;${isRTL ? 'order:1;' : ''}"></div>` +
      `<div style="padding:${paddings[idx]};font-size:${sizes[idx]}px;font-weight:${weights[idx]};color:${headingColor};font-family:${fontFamily};text-align:${textAlign};flex:1;">${text}</div>` +
      `</div>`;
  };

  return cleaned
    .replace(/^#### (.*$)/gm, (_, p1) => makeHeading(4, p1))
    .replace(/^### (.*$)/gm, (_, p1) => makeHeading(3, p1))
    .replace(/^## (.*$)/gm, (_, p1) => makeHeading(2, p1))
    .replace(/^# (.*$)/gm, (_, p1) => makeHeading(1, p1))
    .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight:600;color:#1e293b;">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^[-*+] (.*$)/gm, `<div style="display:flex;align-items:flex-start;gap:8px;padding:4px 0;font-family:${fontFamily};direction:${dir};text-align:${textAlign};font-size:12px;line-height:1.7;color:#334155;"><span style="width:6px;height:6px;min-width:6px;background:#ec4899;border-radius:50%;display:inline-block;margin-top:7px;"></span><span style="flex:1;">$1</span></div>`)
    .replace(/^\d+\.\s+(.*$)/gm, `<div style="padding:4px 0 4px 18px;padding-${paddingSide}:18px;font-family:${fontFamily};direction:${dir};text-align:${textAlign};font-size:12px;line-height:1.7;color:#334155;">$1</div>`)
    .replace(/^[-*_]{3,}$/gm, `<div style="height:1px;background:rgba(236,72,153,0.2);margin:14px 0;"></div>`)
    .replace(/\n{2,}/g, '<div style="height:8px;"></div>')
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
    <div style="flex:1;background:${rgbaStr(color, 0.08)};border-radius:8px;overflow:hidden;display:flex;align-items:stretch;">
      <div style="width:3px;min-width:3px;background:${rgbStr(color)};${isRTL ? 'order:1;' : ''}"></div>
      <div style="padding:12px;text-align:center;flex:1;">
        <div style="font-size:20px;font-weight:700;color:${rgbStr(color)};font-family:${fontFamily};">${value}</div>
        <div style="font-size:9px;color:#94a3b8;font-family:${fontFamily};">${label}</div>
      </div>
    </div>
  `;
  html += `
    <div data-pdf-section style="display:flex;gap:10px;margin:16px 40px 8px;">
      ${statCard(COLORS.primary, totalItems, L.totalItems)}
      ${statCard(COLORS.success, categories.health.length, L.healthData)}
      ${statCard(COLORS.secondary, categories.planning.length, L.planning)}
    </div>
  `;

  // Render each category — header + all items together in one data-pdf-section
  Object.entries(categories).forEach(([cat, items]) => {
    if (items.length === 0) return;
    const meta = categoryMeta[cat];
    const borderSide = isRTL ? 'right' : 'left';

    html += `<div data-pdf-section style="margin:10px 40px 0;padding-bottom:6px;border-bottom:1px solid ${rgbaStr(meta.color, 0.15)};">`;
    html += `
      <div style="display:flex;align-items:stretch;border-radius:6px 6px 0 0;overflow:hidden;background:${rgbaStr(meta.color, 0.08)};">
        <div style="width:4px;min-width:4px;background:${rgbStr(meta.color)};${isRTL ? 'order:1;' : ''}"></div>
        <div style="padding:7px 12px;font-size:13px;font-weight:700;color:${rgbStr(meta.color)};font-family:${fontFamily};flex:1;">
          ${stripEmojis(meta.label)} (${items.length})
        </div>
      </div>
    `;
    items.forEach((item) => {
      html += `
        <div style="display:flex;gap:6px;padding:4px 10px 4px 16px;font-size:11.5px;font-family:${fontFamily};color:#1e293b;">
          <span style="font-weight:600;color:#475569;min-width:0;flex-shrink:0;">${stripEmojis(item.label)}:</span>
          <span style="color:#64748b;word-break:break-word;">${stripEmojis(item.value)}</span>
        </div>
      `;
    });
    html += `</div>`;
  });

  // Disclaimer — own section
  html += `
    <div data-pdf-section style="margin:12px 40px 4px;padding:10px 14px;background:${rgbaStr(COLORS.primary, 0.06)};border-radius:6px;font-size:9px;color:#94a3b8;font-family:${fontFamily};text-align:center;line-height:1.5;">
      ${L.disclaimer}
    </div>
  `;

  html += buildFooterHTML(language, COLORS.primary);

  const fileName = `pregnancy-data-backup-${new Date().toISOString().split('T')[0]}.pdf`;
  await renderHTMLToPDF(html, fileName, language);
}


// Birth plan PDF export
export async function exportBirthPlanToPDF(options: PDFExportOptions): Promise<void> {
  const { title, content, date, preferences, language = 'en' } = options;
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

  // Always use markdown-to-HTML conversion for clean, consistent styling
  const mainContent = DOMPurify.sanitize(
    markdownToHTMLWithLang(content, fontFamily, isRTL),
    {
      ALLOWED_TAGS: ['h1','h2','h3','h4','h5','h6','p','div','span','strong','em','b','i','br','ul','ol','li','table','thead','tbody','tr','th','td','style'],
      ALLOWED_ATTR: ['style','class','data-pdf-section','dir'],
      ALLOW_DATA_ATTR: true,
    }
  );

  // Build preferences list if available
  let prefsHTML = '';
  if (preferences && prefCount > 0) {
    const prefEntries = Object.entries(preferences).filter(([_, v]) => v);
    prefsHTML = prefEntries.map(([_, value]) => 
      `<div style="display:inline-block;padding:3px 10px;margin:2px 4px;background:rgba(236,72,153,0.08);border-radius:12px;font-size:10px;color:#ec4899;font-weight:500;font-family:${fontFamily};">${stripEmojis(value)}</div>`
    ).join('');
  }

  let html = `
    <div data-pdf-section style="background:#fcfcfd;padding:28px 40px 22px;text-align:center;">
      ${logoData ? `<img src="${logoData}" style="width:44px;height:44px;margin:0 auto 10px;display:block;border-radius:10px;" />` : ''}
      <div style="font-size:26px;font-weight:700;color:#1e293b;margin-bottom:6px;font-family:${fontFamily};">${l.title}</div>
      <div style="font-size:12px;color:#94a3b8;margin-bottom:4px;font-family:${fontFamily};">${date}</div>
      <div style="font-size:10px;color:#ec4899;font-weight:500;font-family:${fontFamily};">${l.brand}</div>
      <div style="height:3px;background:#ec4899;border-radius:2px;margin:14px auto 0;max-width:200px;"></div>
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
    
    <div data-pdf-section style="padding:20px 40px 24px;font-size:12px;line-height:1.8;color:#334155;font-family:${fontFamily};text-align:${textAlign};direction:${isRTL ? 'rtl' : 'ltr'};">
      ${mainContent}
    </div>
    
    <div data-pdf-section style="margin:4px 40px 16px;padding:12px 16px;text-align:center;background:#fdf2f8;border-radius:0 0 8px 8px;">
      <div style="height:2px;background:rgba(236,72,153,0.3);margin-bottom:10px;border-radius:1px;"></div>
      <div style="font-size:9px;color:#94a3b8;line-height:1.6;font-family:${fontFamily};">${l.footer}</div>
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

  // Progress bar - wrapped in data-pdf-section
  const progressBarFill = `${progress}%`;
  html += `
    <div data-pdf-section style="margin:16px 40px;padding:14px 16px;background:${rgbaStr(accentColor, 0.06)};border-radius:8px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <span style="font-size:13px;font-weight:600;color:#1e293b;font-family:${fontFamily};">${stripEmojis(labels.progress)}: ${progress}%</span>
        <span style="font-size:11px;color:#94a3b8;font-family:${fontFamily};">${packedCount} / ${totalCount} ${stripEmojis(labels.totalItems)}</span>
      </div>
      <div style="height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;">
        <div style="height:100%;width:${progressBarFill};background:${rgbStr(accentColor)};border-radius:4px;"></div>
      </div>
    </div>
  `;

  // Category summary cards - wrapped in data-pdf-section
  html += `<div data-pdf-section style="display:flex;gap:8px;margin:12px 40px 16px;">`;
  Object.entries(categoryStats).forEach(([cat, catItems]) => {
    const color = categoryColors[cat];
    const label = categoryLabels[cat];
    const catPacked = catItems.filter(i => i.packed).length;
    html += `
      <div style="flex:1;background:${rgbaStr(color, 0.08)};border-radius:8px;padding:10px 8px;text-align:center;">
        <div style="font-size:16px;font-weight:700;color:${rgbStr(color)};font-family:${fontFamily};">${catPacked}/${catItems.length}</div>
        <div style="font-size:8px;color:#94a3b8;font-family:${fontFamily};margin-top:2px;">${stripEmojis(label)}</div>
      </div>
    `;
  });
  html += `</div>`;

  html += `<div data-pdf-section style="margin:0 40px 12px;height:1px;background:${rgbaStr(accentColor, 0.2)};"></div>`;

  // Items by category - each category is a data-pdf-section
  Object.entries(categoryStats).forEach(([cat, catItems]) => {
    if (catItems.length === 0) return;
    const color = categoryColors[cat];
    const label = categoryLabels[cat];
    const catPacked = catItems.filter(i => i.packed).length;
    const borderSide = isRTL ? 'right' : 'left';

    html += `<div data-pdf-section style="margin:10px 40px 6px;">`;
    html += `
      <div style="padding:8px 14px;background:${rgbaStr(color, 0.08)};border-radius:6px;display:flex;justify-content:space-between;align-items:center;">
        <div style="display:flex;align-items:center;gap:0;">
          <div style="width:4px;min-width:4px;height:22px;background:${rgbStr(color)};border-radius:2px;margin-${isRTL ? 'left' : 'right'}:10px;"></div>
          <span style="font-size:14px;font-weight:700;color:${rgbStr(color)};font-family:${fontFamily};">${stripEmojis(label)}</span>
        </div>
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
        <div style="padding:4px 14px;display:flex;align-items:center;gap:8px;font-family:${fontFamily};">
          <div style="width:14px;height:14px;border-radius:3px;border:1.5px solid ${checkColor};background:${checkBg};flex-shrink:0;display:flex;align-items:center;justify-content:center;">
            ${item.packed ? `<span style="color:${rgbStr(COLORS.success)};font-size:10px;font-weight:700;">✓</span>` : ''}
          </div>
          <span style="flex:1;font-size:11px;color:${textColor};text-decoration:${textDecoration};">${stripEmojis(item.name)}</span>
          ${priorityBadge}
          <span style="font-size:9px;color:${rgbStr(statusColor)};background:${rgbaStr(statusColor, 0.1)};padding:1px 6px;border-radius:3px;">${stripEmojis(statusText)}</span>
        </div>
      `;
    });
    html += `</div>`;
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
