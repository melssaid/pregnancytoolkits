import React, { useRef, useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Loader2, RectangleVertical, RectangleHorizontal, History, Trash2, FileText, Eye, X } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { buildPrintHTML, loadLogoBase64, type PrintOrientation } from '@/lib/printUtils';
import { usePdfHistory } from '@/hooks/usePdfHistory';
import { cn } from '@/lib/utils';

interface PrintableReportProps {
  children: React.ReactNode;
  title?: string;
  isLoading?: boolean;
  downloadLabel?: string;
  downloadHint?: string;
  /** Enables local PDF history. Pass a stable bucket name (e.g. "sonar"). */
  historyBucket?: string;
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

const emptyLabels: Record<string, { btn: string; hint: string }> = {
  ar: { btn: 'لا يوجد تقرير بعد', hint: 'انتظري اكتمال التحليل لتفعيل التحميل' },
  en: { btn: 'No report yet', hint: 'Wait for the analysis to finish to enable download' },
  de: { btn: 'Noch kein Bericht', hint: 'Warten Sie, bis die Analyse abgeschlossen ist' },
  fr: { btn: 'Aucun rapport pour le moment', hint: 'Attendez la fin de l’analyse' },
  es: { btn: 'Aún no hay informe', hint: 'Espera a que termine el análisis' },
  pt: { btn: 'Nenhum relatório ainda', hint: 'Aguarde a análise terminar' },
  tr: { btn: 'Henüz rapor yok', hint: 'Analizin bitmesini bekleyin' },
};

const previewLabels: Record<string, { open: string; title: string; print: string; close: string }> = {
  ar: { open: 'معاينة', title: 'معاينة التقرير قبل التحميل', print: 'تحميل PDF', close: 'إغلاق' },
  en: { open: 'Preview', title: 'Preview report before download', print: 'Download PDF', close: 'Close' },
  de: { open: 'Vorschau', title: 'Vorschau vor dem Download', print: 'PDF herunterladen', close: 'Schließen' },
  fr: { open: 'Aperçu', title: 'Aperçu avant téléchargement', print: 'Télécharger le PDF', close: 'Fermer' },
  es: { open: 'Vista previa', title: 'Vista previa antes de descargar', print: 'Descargar PDF', close: 'Cerrar' },
  pt: { open: 'Pré-visualizar', title: 'Pré-visualização antes do download', print: 'Baixar PDF', close: 'Fechar' },
  tr: { open: 'Önizleme', title: 'İndirmeden önce önizleme', print: 'PDF indir', close: 'Kapat' },
};

const historyLabels: Record<string, { title: string; empty: string; week: string; reopen: string; remove: string; clear: string; show: string; hide: string }> = {
  en: { title: 'Saved Reports', empty: 'No saved reports yet.', week: 'Week', reopen: 'Re-download', remove: 'Remove', clear: 'Clear all', show: 'History', hide: 'Hide history' },
  ar: { title: 'التقارير المحفوظة', empty: 'لا توجد تقارير محفوظة بعد.', week: 'الأسبوع', reopen: 'إعادة التحميل', remove: 'حذف', clear: 'مسح الكل', show: 'السجل', hide: 'إخفاء السجل' },
  de: { title: 'Gespeicherte Berichte', empty: 'Noch keine Berichte gespeichert.', week: 'Woche', reopen: 'Erneut laden', remove: 'Entfernen', clear: 'Alle löschen', show: 'Verlauf', hide: 'Verlauf ausblenden' },
  fr: { title: 'Rapports enregistrés', empty: 'Aucun rapport enregistré.', week: 'Semaine', reopen: 'Re-télécharger', remove: 'Supprimer', clear: 'Tout effacer', show: 'Historique', hide: 'Masquer' },
  es: { title: 'Informes guardados', empty: 'Aún no hay informes guardados.', week: 'Semana', reopen: 'Re-descargar', remove: 'Eliminar', clear: 'Borrar todo', show: 'Historial', hide: 'Ocultar' },
  pt: { title: 'Relatórios salvos', empty: 'Nenhum relatório salvo ainda.', week: 'Semana', reopen: 'Baixar novamente', remove: 'Remover', clear: 'Limpar tudo', show: 'Histórico', hide: 'Ocultar' },
  tr: { title: 'Kayıtlı raporlar', empty: 'Henüz kayıtlı rapor yok.', week: 'Hafta', reopen: 'Tekrar indir', remove: 'Sil', clear: 'Tümünü temizle', show: 'Geçmiş', hide: 'Gizle' },
};

export const PrintableReport: React.FC<PrintableReportProps> = ({ children, title, isLoading: contentLoading, downloadLabel, downloadHint, historyBucket }) => {
  const { i18n } = useTranslation();
  const { profile } = useUserProfile();
  const reportRef = useRef<HTMLDivElement>(null);
  const [logoDataUrl, setLogoDataUrl] = useState<string>('');
  const [orientation, setOrientation] = useState<PrintOrientation>('portrait');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const previewIframeRef = useRef<HTMLIFrameElement>(null);
  const pLabels = previewLabels[lang] || previewLabels.en;
  const history = usePdfHistory(historyBucket || '__none__');
  const lang = i18n.language?.split('-')[0] || 'en';
  const isRTL = lang === 'ar';
  const oLabels = orientationLabels[lang] || orientationLabels.en;
  const eLabels = emptyLabels[lang] || emptyLabels.en;

  useEffect(() => {
    loadLogoBase64().then(setLogoDataUrl);
  }, []);

  // Track whether the report area has meaningful text yet
  useEffect(() => {
    const node = reportRef.current;
    if (!node) return;
    const check = () => {
      const text = (node.textContent || '').trim();
      setHasContent(text.length >= 30);
    };
    check();
    const obs = new MutationObserver(check);
    obs.observe(node, { childList: true, subtree: true, characterData: true });
    return () => obs.disconnect();
  }, [children]);

  const buildCleanHTML = useCallback(() => {
    if (!reportRef.current) return null;

    const clone = reportRef.current.cloneNode(true) as HTMLElement;

    // 1) Remove non-printable interactive/decorative elements ONLY
    //    (previous heuristic deleted any element with classes like h-3 / h-32, which destroyed real content)
    clone.querySelectorAll(
      '[data-no-print], .no-print, button, svg, canvas, video, audio, iframe, [role="progressbar"]'
    ).forEach(el => el.remove());

    // 2) Pick the richest content container. We probe many selectors used
    //    across tools (meals, plan, symptoms, etc.) and pick the one whose
    //    text is longest. This is resilient to class renames or wrapper changes.
    const CONTENT_SELECTORS = [
      '[data-print-content]',
      '[data-ai-content]',
      '[data-report-content]',
      '.markdown-content',
      '.prose',
      '[class*="markdown"]',
      '[class*="Markdown"]',
      '[class*="prose"]',
      '[class*="ai-result"]',
      '[class*="AIResult"]',
      '[class*="report-body"]',
      '[class*="ReportBody"]',
      '[class*="result-content"]',
      '[class*="meal"]',
      'article',
    ];
    let bestEl: Element | null = null;
    let bestLen = 0;
    for (const sel of CONTENT_SELECTORS) {
      clone.querySelectorAll(sel).forEach(el => {
        const len = (el.textContent || '').trim().length;
        if (len > bestLen) {
          bestLen = len;
          bestEl = el;
        }
      });
    }

    let printContent: string;
    if (bestEl && bestLen >= 20) {
      printContent = (bestEl as HTMLElement).innerHTML;
    } else {
      // Fallback: use whole clone (filtered above)
      printContent = clone.innerHTML;
    }

    // 3) Strip styling/data attrs but KEEP all text & structure
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = printContent;
    tempDiv.querySelectorAll('*').forEach(el => {
      const h = el as HTMLElement;
      h.removeAttribute('style');
      h.removeAttribute('class');
      h.removeAttribute('data-state');
      h.removeAttribute('data-orientation');
    });

    // 4) Remove only truly empty wrappers
    tempDiv.querySelectorAll('div, span').forEach(el => {
      if (!el.textContent?.trim() && el.children.length === 0) {
        el.remove();
      }
    });

    // 5) Guard: abort if there's no real content to print
    const cleanedText = (tempDiv.textContent || '').trim();
    if (cleanedText.length < 5) return null;

    return buildPrintHTML({ content: tempDiv.innerHTML, title, lang, isRTL, profile, logoDataUrl, orientation });
  }, [lang, isRTL, title, profile, logoDataUrl, orientation]);

  const handleDownload = useCallback(async () => {
    const fullHTML = buildCleanHTML();
    if (!fullHTML) {
      const msgs: Record<string, string> = {
        ar: 'لا يوجد محتوى للتحميل بعد. انتظري اكتمال التحليل.',
        en: 'No content to download yet. Please wait for the analysis to finish.',
        de: 'Noch kein Inhalt zum Herunterladen.',
        fr: 'Aucun contenu à télécharger pour le moment.',
        es: 'Aún no hay contenido para descargar.',
        pt: 'Ainda não há conteúdo para baixar.',
        tr: 'Henüz indirilecek içerik yok.',
      };
      try {
        const { toast } = await import('sonner');
        toast.warning(msgs[lang] || msgs.en);
      } catch { /* noop */ }
      return;
    }
    printViaIframe(fullHTML);
    if (historyBucket) {
      history.add({
        title: title || downloadLabels[lang] || downloadLabels.en,
        week: profile?.pregnancyWeek ?? null,
        orientation,
        bucket: historyBucket,
        html: fullHTML,
      });
    }
  }, [buildCleanHTML, historyBucket, history, title, lang, profile, orientation]);

  const hLabels = historyLabels[lang] || historyLabels.en;
  const dateLocale = lang === 'ar' ? 'ar-SA' : ({ de: 'de-DE', fr: 'fr-FR', es: 'es-ES', pt: 'pt-BR', tr: 'tr-TR' } as Record<string, string>)[lang] || 'en-US';

  return (
    <div>
      <div ref={reportRef}>
        {children}
      </div>
      <div className="mt-3 space-y-2" data-no-print>
        {/* Orientation toggle */}
        <div
          role="radiogroup"
          aria-label={oLabels.layout}
          className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-muted/40 border border-border/40"
        >
          {(['portrait', 'landscape'] as const).map(opt => {
            const active = orientation === opt;
            const Icon = opt === 'portrait' ? RectangleVertical : RectangleHorizontal;
            return (
              <button
                key={opt}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setOrientation(opt)}
                className={cn(
                  'flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all',
                  active
                    ? 'bg-background text-foreground shadow-sm border border-border/60'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {oLabels[opt]}
              </button>
            );
          })}
        </div>

        {(() => {
          const isEmpty = !contentLoading && !hasContent;
          return (
            <>
              <Button
                variant="outline"
                onClick={handleDownload}
                disabled={contentLoading || isEmpty}
                aria-disabled={contentLoading || isEmpty}
                className={cn('w-full gap-2', isEmpty && 'opacity-60 cursor-not-allowed')}
              >
                {contentLoading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Download className="w-4 h-4" />}
                {isEmpty
                  ? eLabels.btn
                  : (downloadLabel || downloadLabels[lang] || downloadLabels.en)}
              </Button>
              <p className={cn(
                'text-[10px] text-center tracking-wide',
                isEmpty ? 'text-destructive/80 font-medium' : 'text-muted-foreground/50'
              )}>
                {isEmpty
                  ? eLabels.hint
                  : (downloadHint || downloadHints[lang] || downloadHints.en)}
              </p>
            </>
          );
        })()}

        {/* Local PDF history */}
        {historyBucket && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setHistoryOpen(o => !o)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-muted/30 hover:bg-muted/50 border border-border/40 text-xs font-semibold text-foreground transition-colors"
              aria-expanded={historyOpen}
            >
              <span className="flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-muted-foreground" />
                {historyOpen ? hLabels.hide : hLabels.show}
              </span>
              {history.entries.length > 0 && (
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                  {history.entries.length}
                </span>
              )}
            </button>

            {historyOpen && (
              <div className="mt-2 space-y-1.5">
                {history.entries.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground/70 text-center py-3">
                    {hLabels.empty}
                  </p>
                ) : (
                  <>
                    {history.entries.map(e => (
                      <div
                        key={e.id}
                        className="flex items-center gap-2 p-2 rounded-lg bg-background border border-border/40"
                      >
                        <FileText className="w-4 h-4 text-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-foreground truncate">
                            {e.title}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {new Date(e.createdAt).toLocaleDateString(dateLocale, { year: 'numeric', month: 'short', day: 'numeric' })}
                            {e.week ? ` • ${hLabels.week} ${e.week}` : ''}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => printViaIframe(e.html)}
                          className="text-[10px] font-bold text-primary px-2 py-1 rounded-md hover:bg-primary/10 transition-colors"
                        >
                          {hLabels.reopen}
                        </button>
                        <button
                          type="button"
                          onClick={() => history.remove(e.id)}
                          aria-label={hLabels.remove}
                          className="text-muted-foreground hover:text-destructive p-1 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={history.clear}
                      className="w-full text-[10px] font-semibold text-muted-foreground hover:text-destructive py-1 transition-colors"
                    >
                      {hLabels.clear}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
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
