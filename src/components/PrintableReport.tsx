import React, { useRef, useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Download, Loader2, RectangleVertical, RectangleHorizontal } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { buildPrintHTML, loadLogoBase64, type PrintOrientation } from '@/lib/printUtils';
import { cn } from '@/lib/utils';

interface PrintableReportProps {
  children: React.ReactNode;
  title?: string;
  isLoading?: boolean;
  downloadLabel?: string;
  downloadHint?: string;
}

const downloadLabels: Record<string, string> = {
  en: 'Download Report', ar: 'تحميل التقرير', de: 'Bericht herunterladen',
  fr: 'Télécharger le rapport', es: 'Descargar informe', pt: 'Baixar relatório', tr: 'Raporu indir',
};

const downloadHints: Record<string, string> = {
  ar: 'احفظي نسخة لمشاركتها مع طبيبتك',
  en: 'Save a copy to share with your doctor',
  fr: 'Enregistrez une copie pour votre médecin',
  de: 'Speichern Sie eine Kopie für Ihren Arzt',
  es: 'Guarda una copia para tu médico',
  pt: 'Salve uma cópia para seu médico',
  tr: 'Doktorunuzla paylaşmak için bir kopya kaydedin',
};

const orientationLabels: Record<string, { portrait: string; landscape: string; layout: string }> = {
  en: { portrait: 'Portrait', landscape: 'Landscape', layout: 'Layout' },
  ar: { portrait: 'عمودي', landscape: 'أفقي', layout: 'التخطيط' },
  de: { portrait: 'Hochformat', landscape: 'Querformat', layout: 'Layout' },
  fr: { portrait: 'Portrait', landscape: 'Paysage', layout: 'Mise en page' },
  es: { portrait: 'Vertical', landscape: 'Horizontal', layout: 'Diseño' },
  pt: { portrait: 'Retrato', landscape: 'Paisagem', layout: 'Layout' },
  tr: { portrait: 'Dikey', landscape: 'Yatay', layout: 'Düzen' },
};

export const PrintableReport: React.FC<PrintableReportProps> = ({ children, title, isLoading: contentLoading, downloadLabel, downloadHint }) => {
  const { i18n } = useTranslation();
  const { profile } = useUserProfile();
  const reportRef = useRef<HTMLDivElement>(null);
  const [logoDataUrl, setLogoDataUrl] = useState<string>('');
  const lang = i18n.language?.split('-')[0] || 'en';
  const isRTL = lang === 'ar';

  useEffect(() => {
    loadLogoBase64().then(setLogoDataUrl);
  }, []);

  const buildCleanHTML = useCallback(() => {
    if (!reportRef.current) return null;

    const clone = reportRef.current.cloneNode(true) as HTMLElement;

    clone.querySelectorAll(
      '[data-no-print], .no-print, button, svg, canvas, video, audio, iframe, [role="progressbar"], [data-radix-collection-item]'
    ).forEach(el => el.remove());

    clone.querySelectorAll('*').forEach(el => {
      const h = el as HTMLElement;
      const cls = h.getAttribute('class') || '';
      const tag = h.tagName.toLowerCase();

      if (/\bh-\[?[0-3]/.test(cls) || /\bh-1\b/.test(cls) || /\bh-0\.5\b/.test(cls)) { el.remove(); return; }
      if (/progress|badge|ring|spinner|loading|skeleton/i.test(cls)) { el.remove(); return; }
      if (tag === 'div' && h.children.length === 0 && !h.textContent?.trim()) { el.remove(); return; }
    });

    const markdownEl = clone.querySelector('.markdown-content, .prose, [class*="markdown"], [class*="Markdown"]');
    let printContent: string;

    if (markdownEl) {
      printContent = markdownEl.innerHTML;
    } else {
      printContent = clone.innerHTML;
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = printContent;
    tempDiv.querySelectorAll('*').forEach(el => {
      const h = el as HTMLElement;
      h.removeAttribute('style');
      h.removeAttribute('class');
      h.removeAttribute('data-state');
      h.removeAttribute('data-orientation');
    });

    tempDiv.querySelectorAll('div, span').forEach(el => {
      if (!el.textContent?.trim() && el.children.length === 0) {
        el.remove();
      }
    });

    return buildPrintHTML({ content: tempDiv.innerHTML, title, lang, isRTL, profile, logoDataUrl });
  }, [lang, isRTL, title, profile, logoDataUrl]);

  const handleDownload = useCallback(() => {
    const fullHTML = buildCleanHTML();
    if (!fullHTML) return;
    printViaIframe(fullHTML);
  }, [buildCleanHTML]);

  return (
    <div>
      <div ref={reportRef}>
        {children}
      </div>
      <div className="mt-3 space-y-2" data-no-print>
        <Button
          variant="outline"
          onClick={handleDownload}
          disabled={contentLoading}
          className="w-full gap-2"
        >
          {contentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {downloadLabel || downloadLabels[lang] || downloadLabels.en}
        </Button>
        <p className="text-[10px] text-muted-foreground/50 text-center tracking-wide">
          {downloadHint || downloadHints[lang] || downloadHints.en}
        </p>
      </div>
    </div>
  );
};

/**
 * Opens the browser's native Print dialog via a hidden iframe.
 * The user can then "Save as PDF" with perfect Arabic/RTL rendering
 * because the browser handles complex script shaping natively.
 */
function printViaIframe(htmlContent: string) {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.top = '-10000px';
  iframe.style.left = '-10000px';
  iframe.style.width = '210mm';
  iframe.style.height = '297mm';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    document.body.removeChild(iframe);
    return;
  }

  iframeDoc.open();
  iframeDoc.write(htmlContent);
  iframeDoc.close();

  // Wait for fonts and images to load
  iframe.onload = () => {
    setTimeout(() => {
      try {
        iframe.contentWindow?.print();
      } catch {
        // Fallback: open in new tab for manual print
        const win = window.open('', '_blank');
        if (win) {
          win.document.write(htmlContent);
          win.document.close();
          win.print();
        }
      }
      // Remove iframe after printing
      setTimeout(() => {
        try { document.body.removeChild(iframe); } catch { /* already removed */ }
      }, 2000);
    }, 500);
  };
}

export default PrintableReport;
