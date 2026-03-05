import React, { useRef, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { buildPrintHTML } from '@/lib/printUtils';
import { toast } from 'sonner';

interface PrintableReportProps {
  children: React.ReactNode;
  title?: string;
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

export const PrintableReport: React.FC<PrintableReportProps> = ({ children, title }) => {
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
    // Strip framer-motion artifacts
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

    return buildPrintHTML({ content: clone.innerHTML, title, lang, isRTL, profile });
  }, [lang, isRTL, title, profile]);

  /** Primary: Open report as a Blob URL in a new tab (works in sandboxed iframes) */
  const handlePrint = useCallback(() => {
    if (busy) return;
    setBusy(true);

    try {
      const fullHTML = buildCleanHTML();
      if (!fullHTML) { setBusy(false); return; }

      // Add auto-print script to the HTML — triggers print dialog when opened
      const htmlWithAutoPrint = fullHTML.replace(
        '</body>',
        `<script>window.onload=function(){setTimeout(function(){window.print()},600)}<\/script></body>`
      );

      const blob = new Blob([htmlWithAutoPrint], { type: 'text/html; charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);

      // Open in new tab — this works even in sandboxed iframes
      const newTab = window.open(blobUrl, '_blank');

      if (newTab) {
        // Clean up blob URL after a delay
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
        toast.success(successMessages[lang] || successMessages.en);
      } else {
        // If popup blocked, fall back to download
        downloadAsFile(fullHTML);
      }
    } catch (e) {
      console.error('[Print] Error:', e);
      // Last resort: download
      const html = buildCleanHTML();
      if (html) downloadAsFile(html);
    } finally {
      setTimeout(() => setBusy(false), 1000);
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
          disabled={busy}
          className="w-full gap-2"
        >
          <Printer className="w-4 h-4" />
          {printLabels[lang] || printLabels.en}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          className="w-full gap-2 text-xs text-muted-foreground"
        >
          <Download className="w-3 h-3" />
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
