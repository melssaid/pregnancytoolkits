import jsPDF from 'jspdf';

interface PDFExportOptions {
  title: string;
  content: string;
  date: string;
  preferences?: Record<string, string>;
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

// Draw gradient header
function drawGradientHeader(doc: jsPDF, pageWidth: number, height: number, color1: typeof COLORS.primary, color2: typeof COLORS.secondary) {
  const steps = 20;
  const stepHeight = height / steps;
  
  for (let i = 0; i < steps; i++) {
    const ratio = i / steps;
    const r = Math.round(color1.r + (color2.r - color1.r) * ratio);
    const g = Math.round(color1.g + (color2.g - color1.g) * ratio);
    const b = Math.round(color1.b + (color2.b - color1.b) * ratio);
    doc.setFillColor(r, g, b);
    doc.rect(0, i * stepHeight, pageWidth, stepHeight + 0.5, 'F');
  }
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

// Draw decorative elements
function drawDecorations(doc: jsPDF, pageWidth: number, pageHeight: number, color: typeof COLORS.primary) {
  doc.setDrawColor(color.r, color.g, color.b);
  doc.setLineWidth(0.8);
  
  // Corner decorations
  const cornerSize = 12;
  const offset = 5;
  
  // Top left
  doc.line(offset, 40, offset, 40 + cornerSize);
  doc.line(offset, 40, offset + cornerSize, 40);
  
  // Top right
  doc.line(pageWidth - offset, 40, pageWidth - offset, 40 + cornerSize);
  doc.line(pageWidth - offset, 40, pageWidth - offset - cornerSize, 40);
  
  // Bottom left
  doc.line(offset, pageHeight - 20, offset, pageHeight - 20 - cornerSize);
  doc.line(offset, pageHeight - 20, offset + cornerSize, pageHeight - 20);
  
  // Bottom right
  doc.line(pageWidth - offset, pageHeight - 20, pageWidth - offset, pageHeight - 20 - cornerSize);
  doc.line(pageWidth - offset, pageHeight - 20, pageWidth - offset - cornerSize, pageHeight - 20);
}

// Data backup PDF export with charts
export function exportDataBackupPDF(options: DataBackupPDFOptions): void {
  const { title, subtitle, data, language = 'en' } = options;
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  
  // Draw gradient header
  drawGradientHeader(doc, pageWidth, 45, COLORS.primary, COLORS.secondary);
  
  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text(title, pageWidth / 2, 20, { align: 'center' });
  
  // Subtitle
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(subtitle || formatDateForPDF(new Date(), language), pageWidth / 2, 30, { align: 'center' });
  
  // App branding
  doc.setFontSize(8);
  doc.text('Pregnancy Tools', pageWidth / 2, 38, { align: 'center' });
  
  let yPos = 55;
  
  // Categorize data
  const categories: Record<string, { label: string; value: string; rawValue: any }[]> = {
    profile: [],
    health: [],
    appointments: [],
    nutrition: [],
    planning: [],
    other: []
  };
  
  const categoryMeta: Record<string, { label: { en: string; ar: string }; icon: string; color: typeof COLORS.primary }> = {
    profile: { label: { en: 'Profile & Settings', ar: 'الملف الشخصي' }, icon: '👤', color: COLORS.info },
    health: { label: { en: 'Health Tracking', ar: 'تتبع الصحة' }, icon: '❤️', color: COLORS.primary },
    appointments: { label: { en: 'Appointments', ar: 'المواعيد' }, icon: '📅', color: COLORS.secondary },
    nutrition: { label: { en: 'Nutrition', ar: 'التغذية' }, icon: '🍎', color: COLORS.success },
    planning: { label: { en: 'Birth Planning', ar: 'تخطيط الولادة' }, icon: '📝', color: COLORS.accent },
    other: { label: { en: 'Other Data', ar: 'بيانات أخرى' }, icon: '📦', color: COLORS.muted }
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
      
      // Mini header on new page
      doc.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
      doc.rect(0, 0, pageWidth, 12, 'F');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
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
    doc.text(`${meta.icon} ${meta.label[language]}`, margin + 6, yPos + 4);
    
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
export function exportGenericPDF(options: GenericPDFOptions): void {
  const { title, subtitle, sections, language = 'en', accentColor = COLORS.primary } = options;
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  
  // Draw gradient header
  drawGradientHeader(doc, pageWidth, 40, accentColor, COLORS.secondary);
  
  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text(title, pageWidth / 2, 18, { align: 'center' });
  
  // Subtitle
  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, pageWidth / 2, 28, { align: 'center' });
  }
  
  // App branding
  doc.setFontSize(8);
  doc.text('Pregnancy Tools', pageWidth / 2, 35, { align: 'center' });
  
  let yPos = 48;
  
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
      
      // Mini header on new page
      doc.setFillColor(accentColor.r, accentColor.g, accentColor.b);
      doc.rect(0, 0, pageWidth, 12, 'F');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
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

// Birth plan PDF export
export function exportBirthPlanToPDF(options: PDFExportOptions): void {
  const { title, content, date, preferences } = options;
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  // Draw gradient header
  drawGradientHeader(doc, pageWidth, 40, COLORS.primary, COLORS.accent);
  
  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text('Birth Plan', pageWidth / 2, 18, { align: 'center' });
  
  // Date
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(date, pageWidth / 2, 28, { align: 'center' });
  
  // Branding
  doc.setFontSize(8);
  doc.text('Pregnancy Tools', pageWidth / 2, 36, { align: 'center' });
  
  let yPos = 50;
  
  // Decorative line
  doc.setDrawColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;
  
  // Preferences summary card
  if (preferences && Object.keys(preferences).length > 0) {
    const prefCount = Object.keys(preferences).length;
    
    doc.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b, 0.08);
    doc.roundedRect(margin, yPos, contentWidth, 20, 4, 4, 'F');
    
    // Accent bar
    doc.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
    doc.roundedRect(margin, yPos, 4, 20, 2, 2, 'F');
    
    doc.setFontSize(11);
    doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
    doc.setFont('helvetica', 'bold');
    doc.text('Preferences Summary', margin + 8, yPos + 8);
    
    doc.setFontSize(9);
    doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
    doc.setFont('helvetica', 'normal');
    doc.text(`${prefCount} preferences selected`, margin + 8, yPos + 15);
    
    // Badge
    doc.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
    doc.roundedRect(pageWidth - margin - 20, yPos + 6, 16, 8, 3, 3, 'F');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(String(prefCount), pageWidth - margin - 12, yPos + 11, { align: 'center' });
    
    yPos += 28;
  }
  
  // Main content
  doc.setFontSize(10);
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
  doc.setFont('helvetica', 'normal');
  
  const cleanContent = markdownToText(content);
  const lines = splitTextToLines(doc, cleanContent, contentWidth);
  
  const lineHeight = 5.5;
  let currentSection = '';
  
  lines.forEach((line) => {
    if (yPos > pageHeight - margin - 20) {
      doc.addPage();
      yPos = margin;
      
      doc.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
      doc.rect(0, 0, pageWidth, 12, 'F');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text('Birth Plan (continued)', pageWidth / 2, 8, { align: 'center' });
      yPos = 20;
      
      doc.setFontSize(10);
      doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
    }
    
    // Detect section headers
    if (line && !line.startsWith('•') && !line.startsWith(' ') && line.length < 50) {
      if (line !== currentSection) {
        currentSection = line;
        yPos += 4;
        
        doc.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b, 0.12);
        doc.roundedRect(margin, yPos - 4, contentWidth, 9, 3, 3, 'F');
        
        doc.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
        doc.roundedRect(margin, yPos - 4, 3, 9, 1, 1, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
        doc.text(line, margin + 6, yPos + 1);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
        
        yPos += lineHeight + 4;
        return;
      }
    }
    
    // Bullet points
    if (line.startsWith('•')) {
      doc.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
      doc.circle(margin + 3, yPos - 1, 1, 'F');
      doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
      doc.text(line.substring(2), margin + 7, yPos);
    } else if (line.trim() === '') {
      yPos += 2;
      return;
    } else {
      doc.text(line, margin, yPos);
    }
    
    yPos += lineHeight;
  });
  
  // Footer
  const footerY = pageHeight - 15;
  doc.setDrawColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  
  doc.setFontSize(7);
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  doc.text('This birth plan is a guide for your healthcare team. Flexibility may be needed based on medical circumstances.', pageWidth / 2, footerY, { align: 'center' });
  
  // Decorative corners
  drawDecorations(doc, pageWidth, pageHeight, COLORS.primary);
  
  const fileName = `birth-plan-${date.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
  doc.save(fileName);
}

export const MAX_SAVED_PLANS = 9;
