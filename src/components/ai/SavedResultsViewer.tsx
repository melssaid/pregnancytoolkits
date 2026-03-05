import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Bookmark, ChevronDown, ChevronUp, Trash2, Clock, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useSavedResults, SavedAIResult } from '@/hooks/useSavedResults';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { format } from 'date-fns';

interface SavedResultsViewerProps {
  toolId: string;
  onLoad?: (result: SavedAIResult) => void;
}

const labels: Record<string, Record<string, string>> = {
  saved: { en: 'Saved Results', ar: 'النتائج المحفوظة', de: 'Gespeicherte Ergebnisse', fr: 'Résultats sauvegardés', es: 'Resultados guardados', pt: 'Resultados salvos', tr: 'Kaydedilen Sonuçlar' },
  noSaved: { en: 'No saved results yet', ar: 'لا توجد نتائج محفوظة بعد', de: 'Noch keine gespeicherten Ergebnisse', fr: 'Pas encore de résultats', es: 'Sin resultados guardados', pt: 'Nenhum resultado salvo', tr: 'Henüz kaydedilen sonuç yok' },
  load: { en: 'View', ar: 'عرض', de: 'Ansehen', fr: 'Voir', es: 'Ver', pt: 'Ver', tr: 'Görüntüle' },
  storageFull: { en: 'Storage full', ar: 'التخزين ممتلئ', de: 'Speicher voll', fr: 'Stockage plein', es: 'Almacenamiento lleno', pt: 'Armazenamento cheio', tr: 'Depolama dolu' },
};

export function SavedResultsViewer({ toolId, onLoad }: SavedResultsViewerProps) {
  const { i18n } = useTranslation();
  const { results, remove, count, max } = useSavedResults(toolId);
  const [expanded, setExpanded] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const lang = i18n.language?.split('-')[0] || 'en';
  const l = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;

  if (results.length === 0 && !expanded) return null;

  return (
    <Card className="border-border/40">
      <CardContent className="p-3">
        <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">{l('saved')} ({results.length})</h3>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>

        <div className="mt-2">
          <Progress value={(count / max) * 100} className="h-1.5" />
          {count >= max && <p className="text-[10px] text-destructive mt-1">{l('storageFull')}</p>}
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 space-y-2 overflow-hidden">
              {results.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">{l('noSaved')}</p>
              ) : (
                results.map(result => (
                  <div key={result.id}>
                    <div className="flex items-center justify-between p-2.5 bg-muted/40 rounded-lg">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{result.title}</p>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Clock className="w-2.5 h-2.5" />
                            {format(new Date(result.savedAt), 'MMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button size="sm" variant="ghost" className="h-7 text-[10px] px-2" onClick={() => {
                          if (viewingId === result.id) { setViewingId(null); } else { setViewingId(result.id); onLoad?.(result); }
                        }}>
                          {l('load')}
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 px-1.5" onClick={() => { remove(result.id); if (viewingId === result.id) setViewingId(null); }}>
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <AnimatePresence>
                      {viewingId === result.id && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                          <div className="mt-1 p-3 rounded-lg bg-muted/20 border border-border/20 max-h-[300px] overflow-y-auto">
                            <MarkdownRenderer content={result.content} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
