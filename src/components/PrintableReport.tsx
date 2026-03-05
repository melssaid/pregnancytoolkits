import React, { useRef, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Printer, Check } from 'lucide-react';
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
  const [printing, setPrinting] = useState(false);
  const lang = i18n.language?.split('-')[0] || 'en';
  const isRTL = lang === 'ar';

  const handlePrint = useCallback(() => {
    if (!reportRef.current || printing) return;
    setPrinting(true);

    try {
      // Clone and clean content (strip framer-motion artifacts)
      const clone = reportRef.current.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('*').forEach(el => {
        const h = el as HTMLElement;
        h.style.removeProperty('opacity');
        h.style.removeProperty('transform');
        h.style.removeProperty('will-change');
        h.style.removeProperty('translate');
        h.style.removeProperty('scale');
        h.style.removeProperty('rotate');
        if (h.getAttribute('style')?.trim() === '') h.removeAttribute('style');
      });
      clone.querySelectorAll('[data-no-print], .no-print, button').forEach(el => el.remove());

      const content = clone.innerHTML;
      const fullHTML = buildPrintHTML({ content, title, lang, isRTL, profile });

      // === Strategy: Inject a hidden iframe, write content, and print from it ===
      // This works in sandboxed environments where window.open is blocked
      const printFrame = document.createElement('iframe');
      printFrame.id = '__print-frame';
      printFrame.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;border:none;z-index:999999;opacity:0;pointer-events:none;';
      
      // Remove any previous print frame
      document.getElementById('__print-frame')?.remove();
      document.body.appendChild(printFrame);

      const frameDoc = printFrame.contentDocument || printFrame.contentWindow?.document;
      if (!frameDoc) {
        // Absolute fallback: inject into current page
        fallbackPrint(fullHTML);
        setPrinting(false);
        return;
      }

      frameDoc.open();
      frameDoc.write(fullHTML);
      frameDoc.close();

      // Wait for content to render, then print
      const triggerPrint = () => {
        try {
          printFrame.contentWindow?.focus();
          printFrame.contentWindow?.print();
        } catch {
          // If iframe print fails, use fallback
          fallbackPrint(fullHTML);
        }
        // Clean up after printing
        setTimeout(() => {
          printFrame.remove();
          setPrinting(false);
        }, 1000);
      };

      // Use load event with timeout fallback
      if (printFrame.contentWindow) {
        printFrame.contentWindow.onafterprint = () => {
          printFrame.remove();
          setPrinting(false);
        };
      }

      // Give fonts/images time to load
      setTimeout(triggerPrint, 800);

    } catch (e) {
      console.error('[Print] Error:', e);
      setPrinting(false);
    }
  }, [lang, isRTL, title, profile, printing]);

  return (
    <div>
      <div ref={reportRef}>
        {children}
      </div>
      <div className="mt-3 space-y-1.5" data-no-print>
        <Button 
          variant="outline" 
          onClick={handlePrint} 
          disabled={printing}
          className="w-full gap-2"
        >
          {printing ? <Check className="w-4 h-4 animate-pulse" /> : <Printer className="w-4 h-4" />}
          {printLabels[lang] || printLabels.en}
        </Button>
        <p className="text-[10px] text-muted-foreground/50 text-center tracking-wide">
          {printHints[lang] || printHints.en}
        </p>
      </div>
    </div>
  );
};

/** Last-resort fallback: inject into current page and use window.print() */
function fallbackPrint(htmlContent: string) {
  const styleId = '__print-style-override';
  const containerId = '__print-container';

  document.getElementById(styleId)?.remove();
  document.getElementById(containerId)?.remove();

  // Create a container with the full HTML content
  const container = document.createElement('div');
  container.id = containerId;
  container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:999998;background:white;overflow:auto;';
  
  // Extract body content from the full HTML
  const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const styleMatch = htmlContent.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  
  if (styleMatch) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = styleMatch[1] + `
      @media print {
        body > *:not(#${containerId}) { display: none !important; }
        #${containerId} { display: block !important; position: static !important; }
      }
    `;
    document.head.appendChild(style);
  }

  container.innerHTML = bodyMatch ? bodyMatch[1] : htmlContent;
  document.body.appendChild(container);

  setTimeout(() => {
    window.print();
    setTimeout(() => {
      container.remove();
      document.getElementById(styleId)?.remove();
    }, 1000);
  }, 500);
}

export default PrintableReport;
