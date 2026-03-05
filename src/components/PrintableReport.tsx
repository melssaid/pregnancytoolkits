import React, { useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { buildPrintHTML } from '@/lib/printUtils';

interface PrintableReportProps {
  children: React.ReactNode;
  title?: string;
}

const printLabels: Record<string, string> = {
  en: 'Print Report', ar: 'طباعة التقرير', de: 'Bericht drucken',
  fr: 'Imprimer le rapport', es: 'Imprimir informe', pt: 'Imprimir relatório', tr: 'Raporu yazdır',
};

const printHints: Record<string, string> = {
  ar: '📄 احفظي نسخة لمشاركتها مع طبيبتك',
  en: '📄 Save a copy to share with your doctor',
  fr: '📄 Enregistrez une copie pour votre médecin',
  de: '📄 Speichern Sie eine Kopie für Ihren Arzt',
  es: '📄 Guarda una copia para tu médico',
  pt: '📄 Salve uma cópia para seu médico',
  tr: '📄 Doktorunuzla paylaşmak için bir kopya kaydedin',
};

export const PrintableReport: React.FC<PrintableReportProps> = ({ children, title }) => {
  const { i18n } = useTranslation();
  const { profile } = useUserProfile();
  const reportRef = useRef<HTMLDivElement>(null);
  const lang = i18n.language?.split('-')[0] || 'en';
  const isRTL = lang === 'ar';

  const handlePrint = useCallback(() => {
    if (!reportRef.current) return;

    // Clone the content and clean it
    const clone = reportRef.current.cloneNode(true) as HTMLElement;
    
    // Remove framer-motion inline styles
    clone.querySelectorAll('*').forEach(el => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.removeProperty('opacity');
      htmlEl.style.removeProperty('transform');
      htmlEl.style.removeProperty('will-change');
      htmlEl.style.removeProperty('translate');
      htmlEl.style.removeProperty('scale');
      htmlEl.style.removeProperty('rotate');
      if (htmlEl.getAttribute('style')?.trim() === '') {
        htmlEl.removeAttribute('style');
      }
    });
    
    // Remove non-printable elements
    clone.querySelectorAll('[data-no-print], .no-print, button').forEach(el => el.remove());

    const content = clone.innerHTML;
    const htmlContent = buildPrintHTML({ content, title, lang, isRTL, profile });

    // Strategy: Use a hidden iframe for reliable printing
    const existingFrame = document.getElementById('__print-iframe') as HTMLIFrameElement;
    if (existingFrame) existingFrame.remove();

    const iframe = document.createElement('iframe');
    iframe.id = '__print-iframe';
    iframe.style.cssText = 'position:fixed;top:-10000px;left:-10000px;width:210mm;height:297mm;border:none;';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      // Fallback: direct window print
      directPrint(htmlContent);
      return;
    }

    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    // Wait for content + fonts to load then print
    const triggerPrint = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {
        // If iframe print fails, fallback
        directPrint(htmlContent);
      }
      // Clean up after a delay
      setTimeout(() => iframe.remove(), 5000);
    };

    // Wait for images and fonts
    if (iframe.contentWindow) {
      iframe.contentWindow.onload = triggerPrint;
    }
    // Safety timeout in case onload doesn't fire
    setTimeout(triggerPrint, 2000);
  }, [lang, isRTL, title, profile]);

  return (
    <div>
      <div ref={reportRef}>
        {children}
      </div>
      <div className="mt-3 space-y-1.5" data-no-print>
        <Button variant="outline" onClick={handlePrint} className="w-full gap-2">
          <Printer className="w-4 h-4" />
          {printLabels[lang] || printLabels.en}
        </Button>
        <p className="text-[10px] text-muted-foreground/50 text-center tracking-wide">
          {printHints[lang] || printHints.en}
        </p>
      </div>
    </div>
  );
};

/** Fallback: inject print styles into current page */
function directPrint(htmlContent: string) {
  const printStyleId = '__print-style-override';
  const existingStyle = document.getElementById(printStyleId);
  if (existingStyle) existingStyle.remove();
  const existingContainer = document.getElementById('__print-container');
  if (existingContainer) existingContainer.remove();

  const style = document.createElement('style');
  style.id = printStyleId;
  style.textContent = `@media print { body > *:not(#__print-container) { display: none !important; } #__print-container { display: block !important; } }`;
  document.head.appendChild(style);

  const container = document.createElement('div');
  container.id = '__print-container';
  container.style.display = 'none';
  container.innerHTML = htmlContent;
  document.body.appendChild(container);

  window.print();

  setTimeout(() => {
    container.remove();
    style.remove();
  }, 1000);
}

export default PrintableReport;
