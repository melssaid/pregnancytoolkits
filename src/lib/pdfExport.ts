import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

// Add logo to PDF header
function addLogoToHeader(
  doc: jsPDF, 
  logoData: string | null, 
  x: number, 
  y: number, 
  size: number = 12
): void {
  if (logoData) {
    try {
      doc.addImage(logoData, 'PNG', x, y, size, size);
    } catch (e) {
      console.warn('Failed to add logo to PDF:', e);
    }
  }
}

// Premium color palette
const COLORS = {
  primary: { r: 236, g: 72, b: 153 }, // Pink
  secondary: { r: 139, g: 92, b: 246 }, // Purple
  accent: { r: 251, g: 146, b: 60 }, // Orange
  success: { r: 34, g: 197, b: 94 }, // Green
  info: { r: 59, g: 130, b: 246 }, // Blue
  dark: { r: 30, g: 41, b: 59 }, // Slate
  light: { r: 248, g: 250, b: 252 }, // Light
  muted: { r: 148, g: 163, b: 184 }, // Gray
};

// Convert markdown to clean text for PDF
function markdownToText(markdown: string): string {
  return markdown
    .replace(/^### (.*$)/gm, '$1')
    .replace(/^## (.*$)/gm, '$1')
    .replace(/^# (.*$)/gm, '$1')
    .replace(/\*\*\*(.*?)\*\*\*/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^[-*+] /gm, '• ')
    .replace(/^\d+\. /gm, '• ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Split text into lines that fit within PDF width
function splitTextToLines(doc: jsPDF, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  const paragraphs = text.split('\n');
  
  paragraphs.forEach(para => {
    if (para.trim() === '') {
      lines.push('');
      return;
    }
    const splitLines = doc.splitTextToSize(para, maxWidth);
    lines.push(...splitLines);
  });
  
  return lines;
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

// Draw clean header with subtle accent line (no dark backgrounds)
function drawCleanHeader(doc: jsPDF, pageWidth: number, height: number, accentColor: typeof COLORS.primary) {
  // Light background
  doc.setFillColor(252, 252, 253);
  doc.rect(0, 0, pageWidth, height, 'F');
  
  // Bottom accent line
  doc.setDrawColor(accentColor.r, accentColor.g, accentColor.b);
  doc.setLineWidth(1.5);
  doc.line(0, height - 1, pageWidth, height - 1);
  
  // Subtle top accent
  doc.setFillColor(accentColor.r, accentColor.g, accentColor.b, 0.1);
  doc.rect(0, 0, pageWidth, 3, 'F');
}

// Draw a simple bar chart
function drawBarChart(
  doc: jsPDF, 
  x: number, 
  y: number, 
  width: number, 
  height: number, 
  data: { label: string; value: number; color?: typeof COLORS.primary }[],
  title: string
) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const barWidth = (width - 10) / data.length - 4;
  const chartHeight = height - 25;
  
  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text(title, x + width / 2, y + 5, { align: 'center' });
  
  // Background
  doc.setFillColor(COLORS.light.r, COLORS.light.g, COLORS.light.b);
  doc.roundedRect(x, y + 8, width, height - 8, 3, 3, 'F');
  
  // Draw bars
  data.forEach((item, i) => {
    const barHeight = (item.value / maxValue) * (chartHeight - 15);
    const barX = x + 8 + i * (barWidth + 4);
    const barY = y + height - 12 - barHeight;
    const color = item.color || COLORS.primary;
    
    // Bar shadow
    doc.setFillColor(0, 0, 0, 0.1);
    doc.roundedRect(barX + 1, barY + 1, barWidth, barHeight, 2, 2, 'F');
    
    // Bar
    doc.setFillColor(color.r, color.g, color.b);
    doc.roundedRect(barX, barY, barWidth, barHeight, 2, 2, 'F');
    
    // Value on top
    doc.setFontSize(7);
    doc.setTextColor(color.r, color.g, color.b);
    doc.text(String(item.value), barX + barWidth / 2, barY - 2, { align: 'center' });
    
    // Label
    doc.setFontSize(6);
    doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
    doc.text(item.label.substring(0, 6), barX + barWidth / 2, y + height - 4, { align: 'center' });
  });
}

// Draw a progress ring/pie
function drawProgressRing(
  doc: jsPDF,
  cx: number,
  cy: number,
  radius: number,
  percentage: number,
  color: typeof COLORS.primary,
  label: string
) {
  // Background circle
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(3);
  doc.circle(cx, cy, radius, 'S');
  
  // Progress arc (simplified as filled segment)
  doc.setFillColor(color.r, color.g, color.b);
  const segments = Math.round(percentage / 10);
  for (let i = 0; i < segments; i++) {
    const angle = (i * 36 - 90) * Math.PI / 180;
    const x = cx + Math.cos(angle) * (radius - 1.5);
    const y = cy + Math.sin(angle) * (radius - 1.5);
    doc.circle(x, y, 1.5, 'F');
  }
  
  // Center text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(color.r, color.g, color.b);
  doc.text(`${percentage}%`, cx, cy + 1, { align: 'center' });
  
  // Label below
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  doc.text(label, cx, cy + radius + 6, { align: 'center' });
}

// Draw stat card
function drawStatCard(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  value: string,
  label: string,
  color: typeof COLORS.primary
) {
  // Card background with subtle gradient effect
  doc.setFillColor(color.r, color.g, color.b, 0.1);
  doc.roundedRect(x, y, width, height, 4, 4, 'F');
  
  // Left accent bar
  doc.setFillColor(color.r, color.g, color.b);
  doc.roundedRect(x, y, 3, height, 2, 2, 'F');
  
  // Value
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(color.r, color.g, color.b);
  doc.text(value, x + width / 2, y + height / 2 - 2, { align: 'center' });
  
  // Label
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  doc.text(label, x + width / 2, y + height / 2 + 6, { align: 'center' });
}

// Draw content frame border
function drawContentFrame(doc: jsPDF, pageWidth: number, pageHeight: number, headerHeight: number, color: typeof COLORS.primary) {
  const margin = 10;
  const frameTop = headerHeight + 5;
  const frameBottom = pageHeight - 18;
  const frameWidth = pageWidth - (margin * 2);
  const frameHeight = frameBottom - frameTop;
  
  // Outer subtle border
  doc.setDrawColor(230, 230, 235);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, frameTop, frameWidth, frameHeight, 4, 4, 'S');
  
  // Inner accent line at top
  doc.setDrawColor(color.r, color.g, color.b);
  doc.setLineWidth(0.8);
  doc.line(margin + 4, frameTop, margin + 30, frameTop);
  
  // Corner accents
  const cornerSize = 8;
  doc.setLineWidth(0.6);
  
  // Top left corner
  doc.line(margin, frameTop + 4, margin, frameTop + cornerSize + 4);
  doc.line(margin, frameTop + 4, margin + cornerSize, frameTop + 4);
  
  // Top right corner
  doc.line(pageWidth - margin, frameTop + 4, pageWidth - margin, frameTop + cornerSize + 4);
  doc.line(pageWidth - margin, frameTop + 4, pageWidth - margin - cornerSize, frameTop + 4);
  
  // Bottom left corner
  doc.line(margin, frameBottom - 4, margin, frameBottom - cornerSize - 4);
  doc.line(margin, frameBottom - 4, margin + cornerSize, frameBottom - 4);
  
  // Bottom right corner
  doc.line(pageWidth - margin, frameBottom - 4, pageWidth - margin, frameBottom - cornerSize - 4);
  doc.line(pageWidth - margin, frameBottom - 4, pageWidth - margin - cornerSize, frameBottom - 4);
}

// Draw decorative elements (legacy - kept for compatibility)
function drawDecorations(doc: jsPDF, pageWidth: number, pageHeight: number, color: typeof COLORS.primary) {
  drawContentFrame(doc, pageWidth, pageHeight, 50, color);
}

// Data backup PDF export with charts
export async function exportDataBackupPDF(options: DataBackupPDFOptions): Promise<void> {
  const { title, subtitle, data, language = 'en' } = options;
  
  // Load logo
  const logoData = await loadLogoImage();
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  
  // Draw clean header
  drawCleanHeader(doc, pageWidth, 50, COLORS.primary);
  
  // Add logo to header
  addLogoToHeader(doc, logoData, pageWidth / 2 - 8, 6, 16);
  
  // Title (dark text on light background)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text(title, pageWidth / 2, 28, { align: 'center' });
  
  // Subtitle
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  doc.text(subtitle || formatDateForPDF(new Date(), language), pageWidth / 2, 36, { align: 'center' });
  
  // App branding
  doc.setFontSize(8);
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.text('Pregnancy Toolkits', pageWidth / 2, 44, { align: 'center' });
  
  let yPos = 58;
  
  // Categorize data
  const categories: Record<string, { label: string; value: string; rawValue: any }[]> = {
    profile: [],
    health: [],
    appointments: [],
    nutrition: [],
    planning: [],
    other: []
  };
  
  const categoryMeta: Record<string, { label: { en: string; ar: string }; color: typeof COLORS.primary }> = {
    profile: { label: { en: 'Profile & Settings', ar: 'الملف الشخصي' }, color: COLORS.info },
    health: { label: { en: 'Health Tracking', ar: 'تتبع الصحة' }, color: COLORS.primary },
    appointments: { label: { en: 'Appointments', ar: 'المواعيد' }, color: COLORS.secondary },
    nutrition: { label: { en: 'Nutrition', ar: 'التغذية' }, color: COLORS.success },
    planning: { label: { en: 'Birth Planning', ar: 'تخطيط الولادة' }, color: COLORS.accent },
    other: { label: { en: 'Other Data', ar: 'بيانات أخرى' }, color: COLORS.muted }
  };
  
  // Categorize all data
  Object.entries(data).forEach(([key, value]) => {
    const displayValue = typeof value === 'object' 
      ? (Array.isArray(value) ? `${value.length} ${language === 'ar' ? 'عنصر' : 'items'}` : JSON.stringify(value).substring(0, 80))
      : String(value);
    
    const item = { label: key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim(), value: displayValue, rawValue: value };
    
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
  
  // Summary stats cards
  const totalItems = Object.values(categories).reduce((sum, cat) => sum + cat.length, 0);
  const healthItems = categories.health.length;
  const planningItems = categories.planning.length;
  
  const cardWidth = (contentWidth - 10) / 3;
  drawStatCard(doc, margin, yPos, cardWidth, 22, String(totalItems), language === 'ar' ? 'إجمالي البيانات' : 'Total Items', COLORS.primary);
  drawStatCard(doc, margin + cardWidth + 5, yPos, cardWidth, 22, String(healthItems), language === 'ar' ? 'بيانات صحية' : 'Health Data', COLORS.success);
  drawStatCard(doc, margin + (cardWidth + 5) * 2, yPos, cardWidth, 22, String(planningItems), language === 'ar' ? 'التخطيط' : 'Planning', COLORS.secondary);
  
  yPos += 30;
  
  // Data distribution chart
  const chartData = Object.entries(categories)
    .filter(([_, items]) => items.length > 0)
    .map(([cat, items]) => ({
      label: categoryMeta[cat].label[language].substring(0, 6),
      value: items.length,
      color: categoryMeta[cat].color
    }));
  
  if (chartData.length > 0) {
    drawBarChart(doc, margin, yPos, contentWidth, 45, chartData, language === 'ar' ? 'توزيع البيانات حسب الفئة' : 'Data Distribution by Category');
    yPos += 52;
  }
  
  // Decorative line
  doc.setDrawColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;
  
  const lineHeight = 5;
  
  // Render each category
  Object.entries(categories).forEach(([cat, items]) => {
    if (items.length === 0) return;
    
    const meta = categoryMeta[cat];
    
    // Check for new page
    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = margin;
      
      // Mini header on new page (light style)
      doc.setFillColor(252, 252, 253);
      doc.rect(0, 0, pageWidth, 12, 'F');
      doc.setDrawColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
      doc.setLineWidth(0.5);
      doc.line(0, 12, pageWidth, 12);
      doc.setFontSize(9);
      doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
      doc.text(`${title} (${language === 'ar' ? 'تابع' : 'continued'})`, pageWidth / 2, 8, { align: 'center' });
      yPos = 20;
    }
    
    // Category header with colored background
    doc.setFillColor(meta.color.r, meta.color.g, meta.color.b, 0.15);
    doc.roundedRect(margin, yPos - 2, contentWidth, 10, 3, 3, 'F');
    
    // Accent bar
    doc.setFillColor(meta.color.r, meta.color.g, meta.color.b);
    doc.roundedRect(margin, yPos - 2, 3, 10, 1, 1, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(meta.color.r, meta.color.g, meta.color.b);
    doc.text(meta.label[language], margin + 6, yPos + 4);
    
    // Item count badge
    doc.setFillColor(meta.color.r, meta.color.g, meta.color.b);
    const countText = String(items.length);
    const countWidth = doc.getTextWidth(countText) + 6;
    doc.roundedRect(pageWidth - margin - countWidth - 2, yPos, countWidth, 6, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(countText, pageWidth - margin - countWidth / 2 - 2, yPos + 4, { align: 'center' });
    
    yPos += 14;
    
    // Items
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    items.forEach((item) => {
      if (yPos > pageHeight - 25) {
        doc.addPage();
        yPos = margin;
      }
      
      // Bullet point
      doc.setFillColor(meta.color.r, meta.color.g, meta.color.b);
      doc.circle(margin + 3, yPos - 1, 1, 'F');
      
      // Label
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
      const labelText = item.label.substring(0, 25);
      doc.text(labelText, margin + 7, yPos);
      
      // Value
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
      const valueText = item.value.substring(0, 50);
      const labelWidth = doc.getTextWidth(labelText + ': ');
      if (labelWidth + doc.getTextWidth(valueText) < contentWidth - 10) {
        doc.text(': ' + valueText, margin + 7 + doc.getTextWidth(labelText), yPos);
      } else {
        yPos += lineHeight;
        doc.text(valueText, margin + 10, yPos);
      }
      
      yPos += lineHeight + 1;
    });
    
    yPos += 5;
  });
  
  // Footer
  const footerY = pageHeight - 12;
  doc.setDrawColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  
  doc.setFontSize(7);
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  const footerText = language === 'ar' 
    ? `تم التصدير بتاريخ ${formatDateForPDF(new Date(), language)} • Pregnancy Tools`
    : `Exported on ${formatDateForPDF(new Date(), language)} • Pregnancy Tools`;
  doc.text(footerText, pageWidth / 2, footerY, { align: 'center' });
  
  // Decorative corners
  drawDecorations(doc, pageWidth, pageHeight, COLORS.primary);
  
  // Save
  const fileName = `pregnancy-data-backup-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

// Generic PDF export function
export async function exportGenericPDF(options: GenericPDFOptions): Promise<void> {
  const { title, subtitle, sections, language = 'en', accentColor = COLORS.primary } = options;
  
  // Load logo
  const logoData = await loadLogoImage();
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  
  // Draw clean header
  drawCleanHeader(doc, pageWidth, 50, accentColor);
  
  // Add logo to header
  addLogoToHeader(doc, logoData, pageWidth / 2 - 8, 6, 16);
  
  // Title (dark text on light background)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text(title, pageWidth / 2, 28, { align: 'center' });
  
  // Subtitle
  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
    doc.text(subtitle, pageWidth / 2, 36, { align: 'center' });
  }
  
  // App branding
  doc.setFontSize(8);
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.text('Pregnancy Toolkits', pageWidth / 2, 44, { align: 'center' });
  
  let yPos = 58;
  
  // Decorative line
  doc.setDrawColor(accentColor.r, accentColor.g, accentColor.b);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;
  
  const lineHeight = 5;
  
  sections.forEach((section, sectionIndex) => {
    // Check for new page
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = margin;
      
      // Mini header on new page (light style)
      doc.setFillColor(252, 252, 253);
      doc.rect(0, 0, pageWidth, 12, 'F');
      doc.setDrawColor(accentColor.r, accentColor.g, accentColor.b);
      doc.setLineWidth(0.5);
      doc.line(0, 12, pageWidth, 12);
      doc.setFontSize(9);
      doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
      doc.text(`${title} (${language === 'ar' ? 'تابع' : 'continued'})`, pageWidth / 2, 8, { align: 'center' });
      yPos = 18;
    }
    
    // Section header
    doc.setFillColor(accentColor.r, accentColor.g, accentColor.b, 0.12);
    doc.roundedRect(margin, yPos - 3, contentWidth, 9, 3, 3, 'F');
    
    // Accent bar
    doc.setFillColor(accentColor.r, accentColor.g, accentColor.b);
    doc.roundedRect(margin, yPos - 3, 3, 9, 1, 1, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
    doc.text(section.title, margin + 6, yPos + 3);
    
    yPos += 13;
    
    // Section items
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
    
    section.items.forEach((item) => {
      if (yPos > pageHeight - 25) {
        doc.addPage();
        yPos = margin;
      }
      
      if (typeof item === 'string') {
        // Simple string item with colored bullet
        doc.setFillColor(accentColor.r, accentColor.g, accentColor.b);
        doc.circle(margin + 3, yPos - 1, 1, 'F');
        
        doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
        const lines = splitTextToLines(doc, item, contentWidth - 10);
        lines.forEach((line, i) => {
          doc.text(line, margin + 7, yPos);
          yPos += lineHeight;
        });
      } else {
        // Label-value item
        doc.setFillColor(accentColor.r, accentColor.g, accentColor.b);
        doc.circle(margin + 3, yPos - 1, 1, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
        doc.text(`${item.label}:`, margin + 7, yPos);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
        const labelWidth = doc.getTextWidth(`${item.label}: `);
        const valueLines = splitTextToLines(doc, item.value, contentWidth - labelWidth - 12);
        valueLines.forEach((line, i) => {
          if (i === 0) {
            doc.text(line, margin + 7 + labelWidth, yPos);
          } else {
            yPos += lineHeight;
            doc.text(line, margin + 7 + labelWidth, yPos);
          }
        });
        yPos += lineHeight;
      }
    });
    
    yPos += 5;
  });
  
  // Footer
  const footerY = pageHeight - 12;
  doc.setDrawColor(accentColor.r, accentColor.g, accentColor.b);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  
  doc.setFontSize(7);
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  const footerText = language === 'ar' 
    ? `تم التصدير بتاريخ ${formatDateForPDF(new Date(), language)} • Pregnancy Tools`
    : `Exported on ${formatDateForPDF(new Date(), language)} • Pregnancy Tools`;
  doc.text(footerText, pageWidth / 2, footerY, { align: 'center' });
  
  // Decorative corners
  drawDecorations(doc, pageWidth, pageHeight, accentColor);
  
  // Save
  const fileName = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

// Birth plan PDF export using pure html2canvas for full multilingual support
export async function exportBirthPlanToPDF(options: PDFExportOptions): Promise<void> {
  const { title, content, date, preferences, language = 'en', contentElement } = options;
  
  const isRTL = language === 'ar';
  
  // Labels translations
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
  
  // Create a temporary styled container with EVERYTHING rendered in HTML
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed; top: -9999px; left: -9999px;
    width: 794px; /* A4 at 96dpi */
    background: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans Arabic', 'Arial', sans-serif;
    color: #1e293b;
    direction: ${isRTL ? 'rtl' : 'ltr'};
    padding: 0;
    line-height: 1.6;
  `;
  
  // Build the full HTML content
  container.innerHTML = `
    <!-- Header -->
    <div style="background: #fcfcfd; border-bottom: 2px solid #ec4899; padding: 24px 40px 20px; text-align: center;">
      <div style="font-size: 28px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">${l.title}</div>
      <div style="font-size: 13px; color: #94a3b8; margin-bottom: 4px;">${date}</div>
      <div style="font-size: 11px; color: #ec4899; font-weight: 500;">${l.brand}</div>
    </div>
    
    <!-- Preferences Summary -->
    ${prefCount > 0 ? `
    <div style="margin: 20px 40px 0; padding: 12px 16px; background: rgba(236,72,153,0.06); border-radius: 8px; border-${isRTL ? 'right' : 'left'}: 4px solid #ec4899;">
      <div style="font-size: 14px; font-weight: 600; color: #ec4899;">${l.prefSummary}</div>
      <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">${prefCount} ${l.prefCount}</div>
    </div>
    ` : ''}
    
    <!-- Separator -->
    <div style="margin: 16px 40px; height: 1px; background: linear-gradient(to right, #ec4899, transparent);"></div>
    
    <!-- Main Content (from the rendered element or markdown) -->
    <div style="padding: 0 40px 20px; font-size: 13px; line-height: 1.8; color: #1e293b;">
      ${contentElement ? contentElement.innerHTML : markdownToHTML(content)}
    </div>
    
    <!-- Footer -->
    <div style="margin: 10px 40px 0; padding-top: 10px; border-top: 1px solid #ec4899; text-align: center;">
      <div style="font-size: 9px; color: #94a3b8; line-height: 1.5;">${l.footer}</div>
    </div>
  `;
  
  document.body.appendChild(container);
  
  try {
    // Render the entire container to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 794,
      windowWidth: 794,
    });
    
    // PDF dimensions in mm
    const A4_WIDTH_MM = 210;
    const A4_HEIGHT_MM = 297;
    const MARGIN_MM = 0; // Content already has padding
    const CONTENT_WIDTH_MM = A4_WIDTH_MM;
    
    // Calculate how many pixels of the canvas fit on one page
    const pixelsPerMM = canvas.width / A4_WIDTH_MM;
    const pageHeightPx = A4_HEIGHT_MM * pixelsPerMM;
    
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    
    let remainingHeight = canvas.height;
    let srcYPx = 0;
    let pageIndex = 0;
    
    while (remainingHeight > 0) {
      if (pageIndex > 0) {
        doc.addPage();
      }
      
      const sliceHeightPx = Math.min(remainingHeight, pageHeightPx);
      
      // Create a slice canvas for this page
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeightPx;
      const ctx = pageCanvas.getContext('2d');
      
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(
          canvas,
          0, srcYPx,           // Source x, y
          canvas.width, sliceHeightPx,  // Source width, height
          0, 0,                // Dest x, y
          pageCanvas.width, sliceHeightPx // Dest width, height
        );
      }
      
      const pageImgData = pageCanvas.toDataURL('image/png');
      const sliceHeightMM = sliceHeightPx / pixelsPerMM;
      
      doc.addImage(pageImgData, 'PNG', 0, 0, CONTENT_WIDTH_MM, sliceHeightMM);
      
      srcYPx += sliceHeightPx;
      remainingHeight -= sliceHeightPx;
      pageIndex++;
    }
    
    const fileName = `birth-plan-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  } finally {
    document.body.removeChild(container);
  }
}

// Convert markdown to simple HTML for PDF rendering
function markdownToHTML(markdown: string): string {
  return markdown
    .replace(/^### (.*$)/gm, '<h3 style="font-size:15px;font-weight:600;color:#ec4899;margin:16px 0 8px;padding:6px 12px;background:rgba(236,72,153,0.08);border-radius:6px;border-left:3px solid #ec4899;">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 style="font-size:17px;font-weight:700;color:#ec4899;margin:20px 0 10px;padding:8px 14px;background:rgba(236,72,153,0.08);border-radius:8px;border-left:4px solid #ec4899;">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 style="font-size:20px;font-weight:700;color:#1e293b;margin:20px 0 12px;">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^[-*+] (.*$)/gm, '<div style="padding:3px 0 3px 16px;position:relative;"><span style="position:absolute;left:0;top:8px;width:6px;height:6px;background:#ec4899;border-radius:50;display:inline-block;"></span>$1</div>')
    .replace(/^\d+\. (.*$)/gm, '<div style="padding:3px 0 3px 8px;">$1</div>')
    .replace(/\n{2,}/g, '<div style="height:10px;"></div>')
    .replace(/\n/g, '<br/>')
    .trim();
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
  
  // Load logo
  const logoData = await loadLogoImage();
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  const isRTL = language === 'ar';
  
  // Accent color for hospital bag (teal)
  const accentColor = { r: 20, g: 184, b: 166 }; // Teal
  
  // Draw clean header
  drawCleanHeader(doc, pageWidth, 50, accentColor);
  
  // Add logo to header
  addLogoToHeader(doc, logoData, pageWidth / 2 - 8, 6, 16);
  
  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text(title, pageWidth / 2, 28, { align: 'center' });
  
  // Subtitle
  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
    doc.text(subtitle, pageWidth / 2, 36, { align: 'center' });
  }
  
  // App branding
  doc.setFontSize(8);
  doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
  doc.text('Pregnancy Toolkits', pageWidth / 2, 44, { align: 'center' });
  
  let yPos = 58;
  
  // Calculate stats
  const packedCount = items.filter(i => i.packed).length;
  const totalCount = items.length;
  const progress = Math.round((packedCount / totalCount) * 100);
  
  const categoryStats = {
    mom: items.filter(i => i.category === 'mom'),
    baby: items.filter(i => i.category === 'baby'),
    partner: items.filter(i => i.category === 'partner'),
    documents: items.filter(i => i.category === 'documents'),
  };
  
  // Progress bar section
  doc.setFillColor(accentColor.r, accentColor.g, accentColor.b, 0.1);
  doc.roundedRect(margin, yPos, contentWidth, 22, 4, 4, 'F');
  
  // Progress label
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.text(`${labels.progress}: ${progress}%`, margin + 8, yPos + 8);
  
  // Items count
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  doc.text(`${packedCount} / ${totalCount} ${labels.totalItems}`, margin + 8, yPos + 15);
  
  // Progress bar background
  const barX = margin + 90;
  const barWidth = contentWidth - 100;
  const barHeight = 8;
  const barY = yPos + 7;
  
  doc.setFillColor(230, 230, 235);
  doc.roundedRect(barX, barY, barWidth, barHeight, 3, 3, 'F');
  
  // Progress bar fill
  const fillWidth = (progress / 100) * barWidth;
  if (fillWidth > 0) {
    doc.setFillColor(accentColor.r, accentColor.g, accentColor.b);
    doc.roundedRect(barX, barY, fillWidth, barHeight, 3, 3, 'F');
  }
  
  yPos += 30;
  
  // Category summary cards
  const cardWidth = (contentWidth - 15) / 4;
  const cardHeight = 18;
  const categoryColors = {
    mom: { r: 236, g: 72, b: 153 }, // Pink
    baby: { r: 59, g: 130, b: 246 }, // Blue
    partner: { r: 139, g: 92, b: 246 }, // Purple
    documents: { r: 245, g: 158, b: 11 }, // Amber
  };
  
  const categoryLabels = {
    mom: labels.mom,
    baby: labels.baby,
    partner: labels.partner,
    documents: labels.documents,
  };
  
  Object.entries(categoryStats).forEach(([cat, catItems], index) => {
    const cardX = margin + index * (cardWidth + 5);
    const color = categoryColors[cat as keyof typeof categoryColors];
    const label = categoryLabels[cat as keyof typeof categoryLabels];
    const catPacked = catItems.filter(i => i.packed).length;
    
    // Card background
    doc.setFillColor(color.r, color.g, color.b, 0.12);
    doc.roundedRect(cardX, yPos, cardWidth, cardHeight, 3, 3, 'F');
    
    // Left accent
    doc.setFillColor(color.r, color.g, color.b);
    doc.roundedRect(cardX, yPos, 2.5, cardHeight, 1, 1, 'F');
    
    // Count
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(color.r, color.g, color.b);
    doc.text(`${catPacked}/${catItems.length}`, cardX + cardWidth / 2, yPos + 7, { align: 'center' });
    
    // Label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
    doc.text(label.substring(0, 10), cardX + cardWidth / 2, yPos + 14, { align: 'center' });
  });
  
  yPos += 28;
  
  // Separator
  doc.setDrawColor(accentColor.r, accentColor.g, accentColor.b);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;
  
  const lineHeight = 6;
  
  // Render items by category
  Object.entries(categoryStats).forEach(([cat, catItems]) => {
    if (catItems.length === 0) return;
    
    const color = categoryColors[cat as keyof typeof categoryColors];
    const label = categoryLabels[cat as keyof typeof categoryLabels];
    
    // Check for new page
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = margin;
      
      // Mini header on new page
      doc.setFillColor(252, 252, 253);
      doc.rect(0, 0, pageWidth, 12, 'F');
      doc.setDrawColor(accentColor.r, accentColor.g, accentColor.b);
      doc.setLineWidth(0.5);
      doc.line(0, 12, pageWidth, 12);
      doc.setFontSize(9);
      doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
      doc.text(`${title} (${isRTL ? 'تابع' : 'continued'})`, pageWidth / 2, 8, { align: 'center' });
      yPos = 20;
    }
    
    // Category header
    doc.setFillColor(color.r, color.g, color.b, 0.15);
    doc.roundedRect(margin, yPos - 2, contentWidth, 10, 3, 3, 'F');
    
    // Accent bar
    doc.setFillColor(color.r, color.g, color.b);
    doc.roundedRect(margin, yPos - 2, 3, 10, 1, 1, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(color.r, color.g, color.b);
    doc.text(label, margin + 6, yPos + 4);
    
    // Count badge
    const catPacked = catItems.filter(i => i.packed).length;
    const badgeText = `${catPacked}/${catItems.length}`;
    doc.setFillColor(color.r, color.g, color.b);
    doc.roundedRect(pageWidth - margin - 18, yPos, 14, 6, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(badgeText, pageWidth - margin - 11, yPos + 4, { align: 'center' });
    
    yPos += 14;
    
    // Items
    catItems.forEach((item) => {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = margin;
      }
      
      // Checkbox
      doc.setDrawColor(color.r, color.g, color.b);
      doc.setLineWidth(0.4);
      doc.rect(margin + 2, yPos - 3, 4, 4, 'S');
      
      if (item.packed) {
        // Checkmark
        doc.setFillColor(color.r, color.g, color.b);
        doc.rect(margin + 2.5, yPos - 2.5, 3, 3, 'F');
      }
      
      // Item name
      doc.setFont('helvetica', item.packed ? 'normal' : 'normal');
      doc.setFontSize(9);
      
      if (item.packed) {
        doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
      } else {
        doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
      }
      
      const itemText = item.name.substring(0, 45);
      doc.text(itemText, margin + 10, yPos);
      
      // Status badge
      const statusText = item.packed ? labels.packed : labels.notPacked;
      const statusColor = item.packed ? { r: 34, g: 197, b: 94 } : { r: 239, g: 68, b: 68 };
      
      doc.setFillColor(statusColor.r, statusColor.g, statusColor.b, 0.15);
      const statusWidth = doc.getTextWidth(statusText) + 6;
      doc.roundedRect(pageWidth - margin - statusWidth - 2, yPos - 3.5, statusWidth, 5, 1.5, 1.5, 'F');
      
      doc.setFontSize(7);
      doc.setTextColor(statusColor.r, statusColor.g, statusColor.b);
      doc.text(statusText, pageWidth - margin - statusWidth / 2 - 2, yPos - 0.5, { align: 'center' });
      
      // Priority badge for essential items
      if (item.priority === 'essential' && !item.packed) {
        doc.setFillColor(239, 68, 68, 0.15);
        const priorityWidth = doc.getTextWidth(labels.essential) + 4;
        doc.roundedRect(pageWidth - margin - statusWidth - priorityWidth - 6, yPos - 3.5, priorityWidth, 5, 1.5, 1.5, 'F');
        doc.setTextColor(239, 68, 68);
        doc.text(labels.essential, pageWidth - margin - statusWidth - priorityWidth / 2 - 6, yPos - 0.5, { align: 'center' });
      }
      
      yPos += lineHeight + 1;
    });
    
    yPos += 5;
  });
  
  // Footer
  const footerY = pageHeight - 12;
  doc.setDrawColor(accentColor.r, accentColor.g, accentColor.b);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  
  doc.setFontSize(7);
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  const footerText = isRTL
    ? `تم التصدير بتاريخ ${formatDateForPDF(new Date(), language)} • Pregnancy Tools`
    : `Exported on ${formatDateForPDF(new Date(), language)} • Pregnancy Tools`;
  doc.text(footerText, pageWidth / 2, footerY, { align: 'center' });
  
  // Decorative corners
  drawDecorations(doc, pageWidth, pageHeight, accentColor);
  
  // Save
  const fileName = `hospital-bag-checklist-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
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
