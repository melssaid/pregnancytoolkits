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

    // Clone and clean content
    const clone = reportRef.current.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('*').forEach(el => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.removeProperty('opacity');
      htmlEl.style.removeProperty('transform');
      htmlEl.style.removeProperty('will-change');
      htmlEl.style.removeProperty('translate');
      htmlEl.style.removeProperty('scale');
      htmlEl.style.removeProperty('rotate');
      if (htmlEl.getAttribute('style')?.trim() === '') htmlEl.removeAttribute('style');
    });
    clone.querySelectorAll('[data-no-print], .no-print, button').forEach(el => el.remove());

    const content = clone.innerHTML;
    const fullHTML = buildPrintHTML({ content, title, lang, isRTL, profile });

    // Use a new window (not iframe) - most reliable cross-environment
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(fullHTML);
      printWindow.document.close();
      // Wait for fonts/images then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          printWindow.close();
        }, 500);
      };
      // Fallback if onload doesn't fire
      setTimeout(() => {
        try {
          printWindow.focus();
          printWindow.print();
        } catch { /* ignore */ }
      }, 2000);
    } else {
      // Fallback: inject into current page with print media query
      injectAndPrint(fullHTML);
    }
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

/** Fallback: hide everything else via print CSS, inject content, print, clean up */
function injectAndPrint(htmlContent: string) {
  const styleId = '__print-style-override';
  const containerId = '__print-container';
  
  // Clean previous
  document.getElementById(styleId)?.remove();
  document.getElementById(containerId)?.remove();

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @media print {
      body > *:not(#${containerId}) { display: none !important; }
      #${containerId} { display: block !important; position: static !important; }
    }
  `;
  document.head.appendChild(style);

  const container = document.createElement('div');
  container.id = containerId;
  container.style.cssText = 'position:fixed;top:-9999px;left:-9999px;';
  container.innerHTML = htmlContent;
  document.body.appendChild(container);

  setTimeout(() => {
    window.print();
    setTimeout(() => {
      container.remove();
      style.remove();
    }, 1000);
  }, 300);
}

export default PrintableReport;
