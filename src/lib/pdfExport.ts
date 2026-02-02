import jsPDF from 'jspdf';

interface PDFExportOptions {
  title: string;
  content: string;
  date: string;
  preferences?: Record<string, string>;
}

// Convert markdown to clean text for PDF
function markdownToText(markdown: string): string {
  return markdown
    // Remove headers and keep text
    .replace(/^### (.*$)/gm, '$1')
    .replace(/^## (.*$)/gm, '$1')
    .replace(/^# (.*$)/gm, '$1')
    // Remove bold/italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    // Remove bullet points but keep text
    .replace(/^[-*+] /gm, '• ')
    // Remove numbered list formatting
    .replace(/^\d+\. /gm, '• ')
    // Clean up extra whitespace
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

export function exportBirthPlanToPDF(options: PDFExportOptions): void {
  const { title, content, date, preferences } = options;
  
  // Create PDF with RTL support
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
  doc.setFillColor(249, 168, 212); // Pink color
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  // Add gradient overlay effect
  doc.setFillColor(244, 114, 182);
  doc.rect(0, 0, pageWidth, 5, 'F');
  
  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text('Birth Plan', pageWidth / 2, 20, { align: 'center' });
  
  // Subtitle with date
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(date, pageWidth / 2, 28, { align: 'center' });
  
  yPos = 45;
  
  // Decorative line
  doc.setDrawColor(244, 114, 182);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;
  
  // Summary section with preferences
  if (preferences && Object.keys(preferences).length > 0) {
    doc.setFillColor(253, 242, 248); // Light pink background
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
  
  // Main content
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  
  const cleanContent = markdownToText(content);
  const lines = splitTextToLines(doc, cleanContent, contentWidth);
  
  const lineHeight = 6;
  let currentSection = '';
  
  lines.forEach((line) => {
    // Check if we need a new page
    if (yPos > pageHeight - margin - 20) {
      doc.addPage();
      yPos = margin;
      
      // Add header to new page
      doc.setFillColor(253, 242, 248);
      doc.rect(0, 0, pageWidth, 15, 'F');
      doc.setFontSize(10);
      doc.setTextColor(190, 24, 93);
      doc.text('Birth Plan (continued)', pageWidth / 2, 10, { align: 'center' });
      yPos = 25;
      
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
    }
    
    // Detect section headers (lines that don't start with bullet)
    if (line && !line.startsWith('•') && !line.startsWith(' ') && line.length < 50) {
      // Check if it's a new section
      if (line !== currentSection) {
        currentSection = line;
        yPos += 3; // Extra spacing before section
        
        // Section header styling
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
    
    // Regular content or bullet points
    if (line.startsWith('•')) {
      // Bullet point with pink bullet
      doc.setTextColor(244, 114, 182);
      doc.text('•', margin + 2, yPos);
      doc.setTextColor(60, 60, 60);
      doc.text(line.substring(2), margin + 7, yPos);
    } else if (line.trim() === '') {
      // Empty line - smaller gap
      yPos += 2;
      return;
    } else {
      doc.text(line, margin, yPos);
    }
    
    yPos += lineHeight;
  });
  
  // Footer on last page
  const footerY = pageHeight - 15;
  doc.setDrawColor(244, 114, 182);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('This birth plan is a guide for your healthcare team. Flexibility may be needed based on medical circumstances.', pageWidth / 2, footerY, { align: 'center' });
  
  // Add decorative corners
  doc.setDrawColor(244, 114, 182);
  doc.setLineWidth(1);
  // Top left corner
  doc.line(5, 40, 5, 50);
  doc.line(5, 40, 15, 40);
  // Top right corner
  doc.line(pageWidth - 5, 40, pageWidth - 5, 50);
  doc.line(pageWidth - 5, 40, pageWidth - 15, 40);
  // Bottom left corner
  doc.line(5, pageHeight - 20, 5, pageHeight - 30);
  doc.line(5, pageHeight - 20, 15, pageHeight - 20);
  // Bottom right corner
  doc.line(pageWidth - 5, pageHeight - 20, pageWidth - 5, pageHeight - 30);
  doc.line(pageWidth - 5, pageHeight - 20, pageWidth - 15, pageHeight - 20);
  
  // Save the PDF
  const fileName = `birth-plan-${date.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
  doc.save(fileName);
}

export const MAX_SAVED_PLANS = 9;
