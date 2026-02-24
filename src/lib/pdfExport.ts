import jsPDF from 'jspdf';

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
  language?: 'en' | 'ar' | 'de' | 'fr' | 'es' | 'pt' | 'tr';
  accentColor?: { r: number; g: number; b: number };
  onProgress?: PDFProgressCallback;
}

// Cache for logo image data
let logoImageCache: string | null = null;

async function loadLogoImage(): Promise<string | null> {
  if (logoImageCache) return logoImageCache;
  try {
    const response = await fetch('/logo.png');
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
let unicodeFontCache: { regular: string; bold: string } | null = null;
let unicodeFontLoading: Promise<typeof unicodeFontCache> | null = null;

// Amiri — static TTF, excellent Arabic + Latin coverage, works with jsPDF
// Loaded from local public/fonts/ directory for reliability
const FONT_URLS = {
  regular: '/fonts/Amiri-Regular.ttf',
  bold: '/fonts/Amiri-Bold.ttf',
};

async function fetchFontAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  } catch { return null; }
}

async function loadUnicodeFont(): Promise<typeof unicodeFontCache> {
  if (unicodeFontCache) return unicodeFontCache;
  if (unicodeFontLoading) return unicodeFontLoading;
  
  unicodeFontLoading = (async () => {
    const [regular, bold] = await Promise.all([
      fetchFontAsBase64(FONT_URLS.regular),
      fetchFontAsBase64(FONT_URLS.bold),
    ]);
    if (regular) {
      unicodeFontCache = { regular, bold: bold || regular };
      return unicodeFontCache;
    }
    return null;
  })();
  
  return unicodeFontLoading;
}

const UNICODE_FONT_NAME = 'Amiri';

function setupUnicodeFont(doc: jsPDF, fontData: typeof unicodeFontCache) {
  if (!fontData) return;
  try {
    doc.addFileToVFS('Amiri-Regular.ttf', fontData.regular);
    doc.addFont('Amiri-Regular.ttf', UNICODE_FONT_NAME, 'normal');
    doc.addFileToVFS('Amiri-Bold.ttf', fontData.bold);
    doc.addFont('Amiri-Bold.ttf', UNICODE_FONT_NAME, 'bold');
    doc.setFont(UNICODE_FONT_NAME, 'normal');
  } catch { /* font already added */ }
}

// Helpers to set bold/normal while respecting Unicode font
let _activeFont: string = 'helvetica';
let _isRTL: boolean = false;

function setFontBold(doc: jsPDF) {
  doc.setFont(_activeFont, 'bold');
}
function setFontNormal(doc: jsPDF) {
  doc.setFont(_activeFont, 'normal');
}

// RTL-aware text helper: flips alignment and x-position for Arabic
function rtlText(doc: jsPDF, text: string, x: number, y: number, options?: any) {
  if (_isRTL) {
    const opts = { ...options };
    // Flip alignment
    if (!opts.align || opts.align === 'left') {
      opts.align = 'right';
      // Mirror x from left margin to right margin
      x = PAGE_W - (x - MARGIN_X) - MARGIN_X;
    } else if (opts.align === 'right') {
      opts.align = 'left';
      x = PAGE_W - (x - MARGIN_X) - MARGIN_X;
    }
    // 'center' stays center
    doc.text(text, x, y, opts);
  } else {
    doc.text(text, x, y, options);
  }
}

// Create a pre-configured PDF document with Unicode font support
async function createPDFDoc(language: string): Promise<{ doc: jsPDF }> {
  const fontData = await loadUnicodeFont();
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  _isRTL = language === 'ar';
  if (fontData) {
    setupUnicodeFont(doc, fontData);
    _activeFont = UNICODE_FONT_NAME;
  } else {
    _activeFont = 'helvetica';
  }
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
};

type RGB = { r: number; g: number; b: number };

function stripEmojis(text: string): string {
  return text.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2702}-\u{27B0}\u{FE00}-\u{FE0F}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{FE0F}]/gu, '').replace(/\s{2,}/g, ' ').trim();
}

function formatDateForPDF(date: Date, language: string): string {
  const localeMap: Record<string, string> = { ar: 'ar-SA', de: 'de-DE', fr: 'fr-FR', es: 'es-ES', pt: 'pt-BR', tr: 'tr-TR', en: 'en-US' };
  return date.toLocaleDateString(localeMap[language] || 'en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getBrandName(language: string): string {
  const brands: Record<string, string> = { ar: 'أدوات الحمل الذكية', de: 'Schwangerschafts-Toolkit', fr: 'Outils de Grossesse', es: 'Herramientas de Embarazo', pt: 'Ferramentas de Gravidez', tr: 'Gebelik Araçları' };
  return brands[language] || 'Pregnancy Toolkits';
}

// =============================================
// Shared jsPDF helpers
// =============================================

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN_X = 16;
const MARGIN_Y = 12;
const CONTENT_W = PAGE_W - MARGIN_X * 2;

interface PDFState { doc: jsPDF; y: number; }

function ensureSpace(s: PDFState, needed: number) {
  if (s.y + needed > PAGE_H - MARGIN_Y) { s.doc.addPage(); s.y = MARGIN_Y; }
}

function drawLogo(s: PDFState, logoData: string | null) {
  if (logoData) {
    try { s.doc.addImage(logoData, 'PNG', PAGE_W / 2 - 8, s.y, 16, 16); s.y += 20; } catch { s.y += 4; }
  }
}

function drawTitle(s: PDFState, title: string, subtitle?: string) {
  s.doc.setFontSize(18);
  s.doc.setTextColor(30, 41, 59);
  s.doc.text(stripEmojis(title), PAGE_W / 2, s.y, { align: 'center' });
  s.y += 7;
  if (subtitle) {
    s.doc.setFontSize(10);
    s.doc.setTextColor(100, 116, 139);
    s.doc.text(stripEmojis(subtitle), PAGE_W / 2, s.y, { align: 'center' });
    s.y += 5;
  }
}

function drawBrand(s: PDFState, language: string, color: RGB) {
  s.doc.setFontSize(8);
  s.doc.setTextColor(color.r, color.g, color.b);
  s.doc.text(getBrandName(language), PAGE_W / 2, s.y, { align: 'center' });
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
  s.doc.text(formatDateForPDF(new Date(), language), PAGE_W / 2, s.y, { align: 'center' });
  s.y += 4;
  s.doc.setFontSize(7);
  s.doc.setTextColor(color.r, color.g, color.b);
  s.doc.text(getBrandName(language), PAGE_W / 2, s.y, { align: 'center' });
}

function drawSectionHeader(s: PDFState, title: string, color: RGB, count?: string) {
  ensureSpace(s, 12);
  const lightR = Math.min(255, color.r + 200), lightG = Math.min(255, color.g + 200), lightB = Math.min(255, color.b + 200);
  s.doc.setFillColor(lightR, lightG, lightB);
  s.doc.roundedRect(MARGIN_X, s.y, CONTENT_W, 8, 2, 2, 'F');
  s.doc.setFillColor(color.r, color.g, color.b);
  // Accent bar on the correct side for RTL
  if (_isRTL) {
    s.doc.rect(MARGIN_X + CONTENT_W - 2.5, s.y, 2.5, 8, 'F');
  } else {
    s.doc.rect(MARGIN_X, s.y, 2.5, 8, 'F');
  }
  s.doc.setFontSize(10);
  s.doc.setTextColor(color.r, color.g, color.b);
  if (_isRTL) {
    s.doc.text(stripEmojis(title), MARGIN_X + CONTENT_W - 8, s.y + 5.5, { align: 'right' });
  } else {
    s.doc.text(stripEmojis(title), MARGIN_X + 8, s.y + 5.5);
  }
  if (count) {
    s.doc.setFontSize(8);
    s.doc.setTextColor(148, 163, 184);
    if (_isRTL) {
      s.doc.text(count, MARGIN_X + 4, s.y + 5.5);
    } else {
      s.doc.text(count, MARGIN_X + CONTENT_W - 4, s.y + 5.5, { align: 'right' });
    }
  }
  s.y += 11;
}

function drawBulletItem(s: PDFState, text: string, color: RGB) {
  ensureSpace(s, 6);
  // Bullet dot
  s.doc.setFillColor(color.r, color.g, color.b);
  if (_isRTL) {
    s.doc.circle(MARGIN_X + CONTENT_W - 6, s.y + 2, 1.2, 'F');
  } else {
    s.doc.circle(MARGIN_X + 6, s.y + 2, 1.2, 'F');
  }
  // Text
  s.doc.setFontSize(9);
  s.doc.setTextColor(51, 65, 85);
  const lines = s.doc.splitTextToSize(stripEmojis(text), CONTENT_W - 14);
  if (_isRTL) {
    s.doc.text(lines, MARGIN_X + CONTENT_W - 10, s.y + 3, { align: 'right' });
  } else {
    s.doc.text(lines, MARGIN_X + 10, s.y + 3);
  }
  s.y += lines.length * 4.5 + 1;
}

function drawLabelValueItem(s: PDFState, label: string, value: string, color: RGB) {
  ensureSpace(s, 6);
  s.doc.setFillColor(color.r, color.g, color.b);
  if (_isRTL) {
    s.doc.circle(MARGIN_X + CONTENT_W - 6, s.y + 2, 1.2, 'F');
  } else {
    s.doc.circle(MARGIN_X + 6, s.y + 2, 1.2, 'F');
  }
  s.doc.setFontSize(9);
  setFontBold(s.doc);
  s.doc.setTextColor(71, 85, 105);
  const lbl = stripEmojis(label) + ': ';
  if (_isRTL) {
    s.doc.text(lbl, MARGIN_X + CONTENT_W - 10, s.y + 3, { align: 'right' });
    const lblW = s.doc.getTextWidth(lbl);
    setFontNormal(s.doc);
    s.doc.setTextColor(100, 116, 139);
    const valLines = s.doc.splitTextToSize(stripEmojis(value), CONTENT_W - 14 - lblW);
    s.doc.text(valLines, MARGIN_X + CONTENT_W - 10 - lblW, s.y + 3, { align: 'right' });
    s.y += Math.max(valLines.length, 1) * 4.5 + 1;
  } else {
    s.doc.text(lbl, MARGIN_X + 10, s.y + 3);
    const lblW = s.doc.getTextWidth(lbl);
    setFontNormal(s.doc);
    s.doc.setTextColor(100, 116, 139);
    const valLines = s.doc.splitTextToSize(stripEmojis(value), CONTENT_W - 14 - lblW);
    s.doc.text(valLines, MARGIN_X + 10 + lblW, s.y + 3);
    s.y += Math.max(valLines.length, 1) * 4.5 + 1;
  }
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
      if (_isRTL) {
        s.doc.rect(MARGIN_X + CONTENT_W - (level <= 2 ? 3 : 2), s.y, level <= 2 ? 3 : 2, barH, 'F');
      } else {
        s.doc.rect(MARGIN_X, s.y, level <= 2 ? 3 : 2, barH, 'F');
      }
      s.doc.setFontSize(sizes[level - 1]);
      setFontBold(s.doc);
      s.doc.setTextColor(level <= 2 ? 30 : accentColor.r, level <= 2 ? 41 : accentColor.g, level <= 2 ? 59 : accentColor.b);
      if (_isRTL) {
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
      if (_isRTL) {
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
  const s: PDFState = { doc, y: MARGIN_Y };

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


// Data backup PDF export
export async function exportDataBackupPDF(options: DataBackupPDFOptions): Promise<void> {
  const { title, subtitle, data, language = 'en' } = options;
  const logoData = await loadLogoImage();
  const { doc } = await createPDFDoc(language);
  const s: PDFState = { doc, y: MARGIN_Y };

  options.onProgress?.(10);

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
    stretch_reminders: { en: 'Stretch Reminders', ar: 'تذكيرات التمدد', de: 'Dehnungserinnerungen', fr: 'Rappels étirements', es: 'Recordatorios de estiramientos', pt: 'Lembretes de alongamento', tr: 'Esneme Hatırlatıcıları' },
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
    ai_insights: { en: 'AI Insights', ar: 'تحليلات الذكاء الاصطناعي', de: 'KI-Einblicke', fr: 'Analyses IA', es: 'Análisis IA', pt: 'Análises IA', tr: 'Yapay Zeka Analizleri' },
  };

  const getKeyLabel = (key: string): string => {
    const labels = keyLabels[key];
    if (labels) return labels[language] || labels.en;
    return key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase()).trim();
  };

  const formatValue = (key: string, value: any): string => {
    if (value === null || value === undefined) return L.noData;
    if (typeof value === 'string') {
      if (/^\d{4}-\d{2}-\d{2}/.test(value)) { try { return formatDateForPDF(new Date(value), language); } catch { return value; } }
      return value;
    }
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return value ? '✓' : '✗';
    if (Array.isArray(value)) {
      if (value.length === 0) return L.noData;
      if (key.includes('appointment') || key.includes('reminder')) {
        return value.slice(0, 5).map((item: any) => {
          if (typeof item === 'object' && item !== null) { const name = item.title || item.name || item.type || ''; const date = item.date || item.time || ''; return `${stripEmojis(name)}${date ? ` (${date})` : ''}`; }
          return String(item);
        }).join(' | ') + (value.length > 5 ? ` +${value.length - 5}` : '');
      }
      if (value.length > 0 && typeof value[0] === 'object' && value[0]?.date) {
        const dates = value.map((v: any) => v.date).filter(Boolean).sort();
        return `${value.length} ${L.items}${dates.length >= 2 ? ` (${dates[0]} → ${dates[dates.length - 1]})` : ''}`;
      }
      if (value.length <= 3 && value.every((v: any) => typeof v === 'string')) return value.join(', ');
      return `${value.length} ${L.items}`;
    }
    if (typeof value === 'object') {
      const keys = Object.keys(value);
      if (keys.length === 0) return L.noData;
      const summary = keys.slice(0, 4).map(k => { const v = value[k]; if (typeof v === 'string' || typeof v === 'number') return `${k}: ${v}`; if (Array.isArray(v)) return `${k}: ${v.length} ${L.items}`; return null; }).filter(Boolean).join(' • ');
      return summary || `${keys.length} ${L.items}`;
    }
    return String(value);
  };

  const categoryMeta: Record<string, { label: string; color: RGB }> = {
    profile: { label: L.profile, color: COLORS.info },
    health: { label: L.health, color: COLORS.primary },
    appointments: { label: L.appointments, color: COLORS.secondary },
    nutrition: { label: L.nutrition, color: COLORS.success },
    planning: { label: L.birthPlanning, color: COLORS.accent },
    other: { label: L.other, color: COLORS.muted }
  };

  const categories: Record<string, { label: string; value: string }[]> = { profile: [], health: [], appointments: [], nutrition: [], planning: [], other: [] };

  Object.entries(data).forEach(([key, value]) => {
    if (key.includes('disclaimer') || key.includes('onboarding') || key.includes('backup') || key === 'user_selected_language') return;
    const displayLabel = getKeyLabel(key);
    const displayValue = formatValue(key, value);
    const item = { label: displayLabel, value: displayValue };
    if (key.includes('profile') || key.includes('settings') || key.includes('week') || (key.includes('date') && !key.includes('update'))) categories.profile.push(item);
    else if (key.includes('kick') || key.includes('weight') || key.includes('vitamin') || key.includes('sleep') || key.includes('contraction') || key.includes('water') || key.includes('mood')) categories.health.push(item);
    else if (key.includes('appointment') || key.includes('reminder')) categories.appointments.push(item);
    else if (key.includes('meal') || key.includes('food') || key.includes('nutrition') || key.includes('grocery') || key.includes('smoothie')) categories.nutrition.push(item);
    else if (key.includes('birth') || key.includes('hospital') || key.includes('baby_name') || key.includes('bag')) categories.planning.push(item);
    else categories.other.push(item);
  });

  const totalItems = Object.values(categories).reduce((sum, cat) => sum + cat.length, 0);

  drawLogo(s, logoData);
  drawTitle(s, title, subtitle || formatDateForPDF(new Date(), language));
  drawBrand(s, language, COLORS.primary);
  drawDivider(s, COLORS.primary);

  options.onProgress?.(20);

  // Summary stats
  ensureSpace(s, 16);
  const statW = (CONTENT_W - 8) / 3;
  const stats = [
    { value: totalItems, label: L.totalItems, color: COLORS.primary },
    { value: categories.health.length, label: L.healthData, color: COLORS.success },
    { value: categories.planning.length, label: L.planning, color: COLORS.secondary },
  ];
  stats.forEach((st, i) => {
    const x = MARGIN_X + i * (statW + 4);
    const lightR = Math.min(255, st.color.r + 200), lightG = Math.min(255, st.color.g + 200), lightB = Math.min(255, st.color.b + 200);
    s.doc.setFillColor(lightR, lightG, lightB);
    s.doc.roundedRect(x, s.y, statW, 12, 2, 2, 'F');
    s.doc.setFontSize(14);
    s.doc.setTextColor(st.color.r, st.color.g, st.color.b);
    s.doc.text(String(st.value), x + statW / 2, s.y + 5.5, { align: 'center' });
    s.doc.setFontSize(7);
    s.doc.setTextColor(148, 163, 184);
    s.doc.text(st.label, x + statW / 2, s.y + 10, { align: 'center' });
  });
  s.y += 16;

  options.onProgress?.(30);

  // Categories
  const catEntries = Object.entries(categories).filter(([, items]) => items.length > 0);
  catEntries.forEach(([cat, items], idx) => {
    const meta = categoryMeta[cat];
    drawSectionHeader(s, `${stripEmojis(meta.label)} (${items.length})`, meta.color);
    items.forEach(item => drawLabelValueItem(s, item.label, item.value, meta.color));
    s.y += 3;
    options.onProgress?.(30 + Math.round(((idx + 1) / catEntries.length) * 60));
  });

  // Disclaimer
  ensureSpace(s, 10);
  s.doc.setFontSize(7);
  s.doc.setTextColor(148, 163, 184);
  const disclaimerLines = s.doc.splitTextToSize(L.disclaimer, CONTENT_W - 20);
  s.doc.text(disclaimerLines, PAGE_W / 2, s.y, { align: 'center' });
  s.y += disclaimerLines.length * 3.5 + 3;

  drawFooter(s, language, COLORS.primary);
  options.onProgress?.(100);

  s.doc.save(`pregnancy-data-backup-${new Date().toISOString().split('T')[0]}.pdf`);
}


// Birth plan PDF export
export async function exportBirthPlanToPDF(options: PDFExportOptions): Promise<void> {
  const { title, content, date, preferences, additionalNotes, language = 'en' } = options;
  const logoData = await loadLogoImage();
  const { doc } = await createPDFDoc(language);
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

  const s: PDFState = { doc, y: MARGIN_Y };

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
      if (_isRTL) {
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
  const { doc } = await createPDFDoc(language);
  const s: PDFState = { doc, y: MARGIN_Y };

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
  if (_isRTL) {
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
      const checkX = _isRTL ? MARGIN_X + CONTENT_W - 8 : MARGIN_X + 4;
      
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
      
      if (_isRTL) {
        s.doc.text(truncName, checkX - 3, checkY + 3.2, { align: 'right' });
      } else {
        s.doc.text(truncName, checkX + 7, checkY + 3.2);
      }

      if (item.priority === 'essential' && !item.packed) {
        const badgeText = stripEmojis(labels.essential);
        const badgeW = s.doc.getTextWidth(badgeText) + 4;
        if (_isRTL) {
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
      if (_isRTL) {
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
  const s: PDFState = { doc, y: MARGIN_Y };

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
