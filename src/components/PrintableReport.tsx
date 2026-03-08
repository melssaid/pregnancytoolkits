import React, { useRef, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Printer, Download, Loader2 } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { buildPrintHTML } from '@/lib/printUtils';
import { toast } from 'sonner';

interface PrintableReportProps {
  children: React.ReactNode;
  title?: string;
  isLoading?: boolean;
}

const printLabels: Record<string, string> = {
  en: 'Print Report', ar: 'طباعة التقرير', de: 'Bericht drucken',
  fr: 'Imprimer le rapport', es: 'Imprimir informe', pt: 'Imprimir relatório', tr: 'Raporu yazdır',
};

const downloadLabels: Record<string, string> = {
  en: 'Download Report', ar: 'تحميل التقرير', de: 'Bericht herunterladen',
  fr: 'Télécharger le rapport', es: 'Descargar informe', pt: 'Baixar relatório', tr: 'Raporu indir',
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

const successMessages: Record<string, string> = {
  ar: 'تم فتح التقرير! اضغطي Ctrl+P للطباعة',
  en: 'Report opened! Press Ctrl+P to print',
  de: 'Bericht geöffnet! Drücken Sie Strg+P zum Drucken',
  fr: 'Rapport ouvert ! Appuyez sur Ctrl+P pour imprimer',
  es: '¡Informe abierto! Presiona Ctrl+P para imprimir',
  pt: 'Relatório aberto! Pressione Ctrl+P para imprimir',
  tr: 'Rapor açıldı! Ctrl+P ile yazdırın',
};

export const PrintableReport: React.FC<PrintableReportProps> = ({ children, title, isLoading: contentLoading }) => {
  const { i18n } = useTranslation();
  const { profile } = useUserProfile();
  const reportRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const lang = i18n.language?.split('-')[0] || 'en';
  const isRTL = lang === 'ar';

  /** Build clean HTML from the report content */
  const buildCleanHTML = useCallback(() => {
    if (!reportRef.current) return null;

    const clone = reportRef.current.cloneNode(true) as HTMLElement;

    // 1. Remove non-printable elements
    clone.querySelectorAll(
      '[data-no-print], .no-print, button, svg, canvas, video, audio, iframe, [role="progressbar"], [data-radix-collection-item]'
    ).forEach(el => el.remove());

    // 2. Remove stat grids, badges, decorative cards, icons, progress bars
    clone.querySelectorAll('*').forEach(el => {
      const h = el as HTMLElement;
      const cls = h.getAttribute('class') || '';
      const tag = h.tagName.toLowerCase();

      // Remove thin decorative bars
      if (/\bh-\[?[0-3]/.test(cls) || /\bh-1\b/.test(cls) || /\bh-0\.5\b/.test(cls)) {
        el.remove();
        return;
      }

      // Remove progress/badge/icon elements
      if (/progress|badge|ring|spinner|loading|skeleton/i.test(cls)) {
        el.remove();
        return;
      }

      // Remove empty divs with only gradient/bg classes (decorative wrappers)
      if (tag === 'div' && h.children.length === 0 && !h.textContent?.trim()) {
        el.remove();
        return;
      }
    });

    // 3. Try to find the actual AI response content (markdown rendered area)
    const markdownEl = clone.querySelector('.markdown-content, .prose, [class*="markdown"], [class*="Markdown"]');
    let printContent: string;

    if (markdownEl) {
      // Use only the markdown content — this is the actual report
      printContent = markdownEl.innerHTML;
    } else {
      // Fallback: use the entire clone
      printContent = clone.innerHTML;
    }

    // 4. Strip ALL inline styles and classes from the final content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = printContent;
    tempDiv.querySelectorAll('*').forEach(el => {
      const h = el as HTMLElement;
      h.removeAttribute('style');
      h.removeAttribute('class');
      h.removeAttribute('data-state');
      h.removeAttribute('data-orientation');
    });

    // 5. Remove any remaining empty elements (divs with no text)
    tempDiv.querySelectorAll('div, span').forEach(el => {
      if (!el.textContent?.trim() && el.children.length === 0) {
        el.remove();
      }
    });

    return buildPrintHTML({ content: tempDiv.innerHTML, title, lang, isRTL, profile });
  }, [lang, isRTL, title, profile]);

  /** Primary: Print via hidden iframe — no navigation, just the print dialog */
  const handlePrint = useCallback(() => {
    if (busy) return;
    setBusy(true);

    try {
      const fullHTML = buildCleanHTML();
      if (!fullHTML) { setBusy(false); return; }

      // Create a hidden iframe for printing
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.top = '-10000px';
      iframe.style.left = '-10000px';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        // Fallback to download if iframe not accessible
        downloadAsFile(fullHTML);
        setBusy(false);
        return;
      }

      iframeDoc.open();
      iframeDoc.write(fullHTML);
      iframeDoc.close();

      // Wait for content to render, then trigger print
      setTimeout(() => {
        try {
          iframe.contentWindow?.print();
        } catch {
          // If print fails (e.g. cross-origin), fallback to download
          downloadAsFile(fullHTML);
        }
        // Clean up iframe after printing
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 2000);
      }, 500);
    } catch (e) {
      console.error('[Print] Error:', e);
      const html = buildCleanHTML();
      if (html) downloadAsFile(html);
    } finally {
      setTimeout(() => setBusy(false), 1500);
    }
  }, [busy, buildCleanHTML, lang]);

  /** Fallback: Download the report as an HTML file */
  const handleDownload = useCallback(() => {
    const fullHTML = buildCleanHTML();
    if (!fullHTML) return;
    downloadAsFile(fullHTML);
  }, [buildCleanHTML]);

  return (
    <div>
      <div ref={reportRef}>
        {children}
      </div>
      <div className="mt-3 space-y-2" data-no-print>
        <Button
          variant="outline"
          onClick={handlePrint}
          disabled={busy || contentLoading}
          className="w-full gap-2"
        >
          {contentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
          {printLabels[lang] || printLabels.en}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          disabled={contentLoading}
          className="w-full gap-2 text-xs text-muted-foreground"
        >
          {contentLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
          {downloadLabels[lang] || downloadLabels.en}
        </Button>
        <p className="text-[10px] text-muted-foreground/50 text-center tracking-wide">
          {printHints[lang] || printHints.en}
        </p>
      </div>
    </div>
  );
};

/** Download HTML content as a file */
function downloadAsFile(htmlContent: string) {
  const blob = new Blob([htmlContent], { type: 'text/html; charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pregnancy-report-${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export default PrintableReport;
