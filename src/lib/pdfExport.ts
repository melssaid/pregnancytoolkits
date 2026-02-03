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

// Generic PDF export function
export function exportGenericPDF(options: GenericPDFOptions): void {
  const { title, subtitle, sections, language = 'en', accentColor = { r: 244, g: 114, b: 182 } } = options;
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  
  let yPos = margin;
  
  // Header background
  doc.setFillColor(accentColor.r, accentColor.g, accentColor.b);
  doc.rect(0, 0, pageWidth, 30, 'F');
  
  // Darker top strip
  doc.setFillColor(Math.max(0, accentColor.r - 30), Math.max(0, accentColor.g - 30), Math.max(0, accentColor.b - 30));
  doc.rect(0, 0, pageWidth, 4, 'F');
  
  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text(title, pageWidth / 2, 16, { align: 'center' });
  
  // Subtitle
  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, pageWidth / 2, 24, { align: 'center' });
  }
  
  yPos = 38;
  
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
      doc.setFillColor(accentColor.r, accentColor.g, accentColor.b, 0.2);
      doc.rect(0, 0, pageWidth, 12, 'F');
      doc.setFontSize(9);
      doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
      doc.text(`${title} (${language === 'ar' ? 'تابع' : 'continued'})`, pageWidth / 2, 8, { align: 'center' });
      yPos = 18;
    }
    
    // Section header
    doc.setFillColor(accentColor.r, accentColor.g, accentColor.b, 0.15);
    doc.roundedRect(margin, yPos - 3, contentWidth, 8, 2, 2, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(Math.max(0, accentColor.r - 60), Math.max(0, accentColor.g - 60), Math.max(0, accentColor.b - 60));
    doc.text(section.title, margin + 3, yPos + 2);
    
    yPos += 12;
    
    // Section items
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    
    section.items.forEach((item) => {
      if (yPos > pageHeight - 25) {
        doc.addPage();
        yPos = margin;
      }
      
      if (typeof item === 'string') {
        // Simple string item
        const lines = splitTextToLines(doc, `• ${item}`, contentWidth - 5);
        lines.forEach((line, i) => {
          if (i === 0) {
            doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
            doc.text('•', margin + 2, yPos);
            doc.setTextColor(60, 60, 60);
            doc.text(line.substring(2), margin + 6, yPos);
          } else {
            doc.text(line, margin + 6, yPos);
          }
          yPos += lineHeight;
        });
      } else {
        // Label-value item
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(80, 80, 80);
        doc.text(`${item.label}:`, margin + 3, yPos);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        const labelWidth = doc.getTextWidth(`${item.label}: `);
        const valueLines = splitTextToLines(doc, item.value, contentWidth - labelWidth - 8);
        valueLines.forEach((line, i) => {
          if (i === 0) {
            doc.text(line, margin + 3 + labelWidth, yPos);
          } else {
            yPos += lineHeight;
            doc.text(line, margin + 3 + labelWidth, yPos);
          }
        });
        yPos += lineHeight;
      }
    });
    
    yPos += 5; // Space between sections
  });
  
  // Footer
  const footerY = pageHeight - 10;
  doc.setDrawColor(accentColor.r, accentColor.g, accentColor.b);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);
  
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  const footerText = language === 'ar' 
    ? `تم التصدير بتاريخ ${formatDateForPDF(new Date(), language)} • Pregnancy Tools`
    : `Exported on ${formatDateForPDF(new Date(), language)} • Pregnancy Tools`;
  doc.text(footerText, pageWidth / 2, footerY, { align: 'center' });
  
  // Decorative corners
  doc.setDrawColor(accentColor.r, accentColor.g, accentColor.b);
  doc.setLineWidth(0.8);
  doc.line(5, 35, 5, 45);
  doc.line(5, 35, 15, 35);
  doc.line(pageWidth - 5, 35, pageWidth - 5, 45);
  doc.line(pageWidth - 5, 35, pageWidth - 15, 35);
  doc.line(5, pageHeight - 15, 5, pageHeight - 25);
  doc.line(5, pageHeight - 15, 15, pageHeight - 15);
  doc.line(pageWidth - 5, pageHeight - 15, pageWidth - 5, pageHeight - 25);
  doc.line(pageWidth - 5, pageHeight - 15, pageWidth - 15, pageHeight - 15);
  
  // Save
  const fileName = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

// Data backup PDF export
export function exportDataBackupPDF(options: DataBackupPDFOptions): void {
  const { title, subtitle, data, language = 'en' } = options;
  
  const sections: GenericPDFOptions['sections'] = [];
  
  // Group data by category
  const categories: Record<string, { label: string; value: string }[]> = {
    profile: [],
    health: [],
    appointments: [],
    nutrition: [],
    planning: [],
    other: []
  };
  
  const categoryLabels: Record<string, { en: string; ar: string }> = {
    profile: { en: '👤 Profile & Settings', ar: '👤 الملف الشخصي والإعدادات' },
    health: { en: '❤️ Health Tracking', ar: '❤️ تتبع الصحة' },
    appointments: { en: '📅 Appointments & Reminders', ar: '📅 المواعيد والتذكيرات' },
    nutrition: { en: '🍎 Nutrition & Meals', ar: '🍎 التغذية والوجبات' },
    planning: { en: '📝 Birth Planning', ar: '📝 تخطيط الولادة' },
    other: { en: '📦 Other Data', ar: '📦 بيانات أخرى' }
  };
  
  // Categorize data
  Object.entries(data).forEach(([key, value]) => {
    const displayValue = typeof value === 'object' 
      ? (Array.isArray(value) ? `${value.length} ${language === 'ar' ? 'عنصر' : 'items'}` : JSON.stringify(value).substring(0, 100) + '...')
      : String(value);
    
    const item = { label: key.replace(/_/g, ' '), value: displayValue };
    
    if (key.includes('profile') || key.includes('settings') || key.includes('week') || key.includes('date')) {
      categories.profile.push(item);
    } else if (key.includes('kick') || key.includes('weight') || key.includes('vitamin') || key.includes('sleep') || key.includes('contraction') || key.includes('water')) {
      categories.health.push(item);
    } else if (key.includes('appointment') || key.includes('reminder')) {
      categories.appointments.push(item);
    } else if (key.includes('meal') || key.includes('food') || key.includes('nutrition') || key.includes('grocery')) {
      categories.nutrition.push(item);
    } else if (key.includes('birth') || key.includes('hospital') || key.includes('baby_name')) {
      categories.planning.push(item);
    } else {
      categories.other.push(item);
    }
  });
  
  // Build sections
  Object.entries(categories).forEach(([cat, items]) => {
    if (items.length > 0) {
      sections.push({
        title: categoryLabels[cat][language],
        items
      });
    }
  });
  
  exportGenericPDF({
    title,
    subtitle: subtitle || (language === 'ar' ? `تصدير البيانات - ${formatDateForPDF(new Date(), language)}` : `Data Export - ${formatDateForPDF(new Date(), language)}`),
    sections,
    language,
    accentColor: { r: 59, g: 130, b: 246 } // Blue for data backup
  });
}

// Birth plan PDF export (original function)
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
  
  let yPos = margin;
  
  // Add decorative header
  doc.setFillColor(249, 168, 212);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setFillColor(244, 114, 182);
  doc.rect(0, 0, pageWidth, 5, 'F');
  
  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text('Birth Plan', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(date, pageWidth / 2, 28, { align: 'center' });
  
  yPos = 45;
  
  doc.setDrawColor(244, 114, 182);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;
  
  if (preferences && Object.keys(preferences).length > 0) {
    doc.setFillColor(253, 242, 248);
    doc.roundedRect(margin, yPos, contentWidth, 25, 3, 3, 'F');
    
    doc.setFontSize(11);
    doc.setTextColor(190, 24, 93);
    doc.setFont('helvetica', 'bold');
    doc.text('Preferences Summary', margin + 5, yPos + 8);
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    const prefCount = Object.keys(preferences).length;
    doc.text(`${prefCount} preferences selected`, margin + 5, yPos + 16);
    
    yPos += 35;
  }
  
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  
  const cleanContent = markdownToText(content);
  const lines = splitTextToLines(doc, cleanContent, contentWidth);
  
  const lineHeight = 6;
  let currentSection = '';
  
  lines.forEach((line) => {
    if (yPos > pageHeight - margin - 20) {
      doc.addPage();
      yPos = margin;
      
      doc.setFillColor(253, 242, 248);
      doc.rect(0, 0, pageWidth, 15, 'F');
      doc.setFontSize(10);
      doc.setTextColor(190, 24, 93);
      doc.text('Birth Plan (continued)', pageWidth / 2, 10, { align: 'center' });
      yPos = 25;
      
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
    }
    
    if (line && !line.startsWith('•') && !line.startsWith(' ') && line.length < 50) {
      if (line !== currentSection) {
        currentSection = line;
        yPos += 3;
        
        doc.setFillColor(249, 168, 212, 0.3);
        doc.roundedRect(margin, yPos - 4, contentWidth, 8, 2, 2, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(157, 23, 77);
        doc.text(line, margin + 3, yPos);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        
        yPos += lineHeight + 2;
        return;
      }
    }
    
    if (line.startsWith('•')) {
      doc.setTextColor(244, 114, 182);
      doc.text('•', margin + 2, yPos);
      doc.setTextColor(60, 60, 60);
      doc.text(line.substring(2), margin + 7, yPos);
    } else if (line.trim() === '') {
      yPos += 2;
      return;
    } else {
      doc.text(line, margin, yPos);
    }
    
    yPos += lineHeight;
  });
  
  const footerY = pageHeight - 15;
  doc.setDrawColor(244, 114, 182);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('This birth plan is a guide for your healthcare team. Flexibility may be needed based on medical circumstances.', pageWidth / 2, footerY, { align: 'center' });
  
  doc.setDrawColor(244, 114, 182);
  doc.setLineWidth(1);
  doc.line(5, 40, 5, 50);
  doc.line(5, 40, 15, 40);
  doc.line(pageWidth - 5, 40, pageWidth - 5, 50);
  doc.line(pageWidth - 5, 40, pageWidth - 15, 40);
  doc.line(5, pageHeight - 20, 5, pageHeight - 30);
  doc.line(5, pageHeight - 20, 15, pageHeight - 20);
  doc.line(pageWidth - 5, pageHeight - 20, pageWidth - 5, pageHeight - 30);
  doc.line(pageWidth - 5, pageHeight - 20, pageWidth - 15, pageHeight - 20);
  
  const fileName = `birth-plan-${date.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
  doc.save(fileName);
}

export const MAX_SAVED_PLANS = 9;
