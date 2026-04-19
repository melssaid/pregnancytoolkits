import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { Bookmark, BookmarkCheck, ChevronRight, ChevronLeft, Clock, Trash2, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSavedResults, SavedAIResult } from '@/hooks/useSavedResults';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

const toolNames: Record<string, Record<string, string>> = {
  'smart-pregnancy-plan': { ar: 'الخطة الذكية', en: 'Smart Plan', de: 'Smartplan', fr: 'Plan intelligent', es: 'Plan inteligente', pt: 'Plano inteligente', tr: 'Akıllı Plan' },
  'wellness-diary': { ar: 'يوميات العافية', en: 'Wellness Diary', de: 'Wellness-Tagebuch', fr: 'Journal bien-être', es: 'Diario', pt: 'Diário', tr: 'Sağlık Günlüğü' },
  'weekly-summary': { ar: 'الملخص الأسبوعي', en: 'Weekly Summary', de: 'Wochenzusammenfassung', fr: 'Résumé hebdomadaire', es: 'Resumen semanal', pt: 'Resumo semanal', tr: 'Haftalık Özet' },
  'meal-suggestion': { ar: 'اقتراح وجبات', en: 'Meal Plan', de: 'Mahlzeitenplan', fr: 'Plan repas', es: 'Plan comidas', pt: 'Plano refeições', tr: 'Yemek Planı' },
  'birth-plan': { ar: 'خطة الولادة', en: 'Birth Plan', de: 'Geburtsplan', fr: 'Plan de naissance', es: 'Plan de parto', pt: 'Plano de parto', tr: 'Doğum Planı' },
  'mental-health': { ar: 'الصحة النفسية', en: 'Mental Health', de: 'Mentale Gesundheit', fr: 'Santé mentale', es: 'Salud mental', pt: 'Saúde mental', tr: 'Ruh Sağlığı' },
  'back-pain': { ar: 'آلام الظهر', en: 'Back Pain', de: 'Rückenschmerzen', fr: 'Mal de dos', es: 'Dolor de espalda', pt: 'Dor nas costas', tr: 'Sırt Ağrısı' },
  'nausea-relief': { ar: 'تخفيف الغثيان', en: 'Nausea Relief', de: 'Übelkeit', fr: 'Nausées', es: 'Náuseas', pt: 'Náusea', tr: 'Mide Bulantısı' },
  'skincare': { ar: 'العناية بالبشرة', en: 'Skincare', de: 'Hautpflege', fr: 'Soin peau', es: 'Cuidado piel', pt: 'Cuidado pele', tr: 'Cilt Bakımı' },
};

const labels: Record<string, Record<string, string>> = {
  title: { ar: 'المفضلات المحفوظة', en: 'Saved Favorites', de: 'Gespeicherte Favoriten', fr: 'Favoris sauvegardés', es: 'Favoritos guardados', pt: 'Favoritos salvos', tr: 'Kaydedilen Favoriler' },
  empty: { ar: 'لا توجد مفضلات بعد — احفظي نتائج AI بالضغط على 🔖', en: 'No favorites yet — save AI results with 🔖', de: 'Noch keine Favoriten — speichern Sie AI-Ergebnisse mit 🔖', fr: 'Pas encore de favoris — sauvegardez avec 🔖', es: 'Sin favoritos — guarda resultados con 🔖', pt: 'Sem favoritos — salve resultados com 🔖', tr: 'Henüz favori yok — sonuçları 🔖 ile kaydedin' },
  viewAll: { ar: 'عرض الكل', en: 'View All', de: 'Alle anzeigen', fr: 'Voir tout', es: 'Ver todo', pt: 'Ver tudo', tr: 'Tümünü gör' },
};

function formatDate(dateStr: string, lang: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffHrs < 1) return lang === 'ar' ? 'الآن' : 'Just now';
    if (diffHrs < 24) return lang === 'ar' ? `منذ ${diffHrs} ساعة` : `${diffHrs}h ago`;
    if (diffDays < 7) return lang === 'ar' ? `منذ ${diffDays} يوم` : `${diffDays}d ago`;
    return d.toLocaleDateString(lang === 'ar' ? 'ar-SA' : undefined);
  } catch { return ''; }
}

export function SavedFavorites() {
  const { i18n } = useTranslation();
  const { isRTL } = useLanguage();
  const { allResults, remove } = useSavedResults();
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const lang = i18n.language?.split('-')[0] || 'en';
  const l = (key: string) => labels[key]?.[lang] || labels[key]?.en || key;
  const getToolName = (toolId: string) => toolNames[toolId]?.[lang] || toolNames[toolId]?.en || toolId;
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  const displayed = showAll ? allResults : allResults.slice(0, 3);

  if (allResults.length === 0) return null;

  return (
    <Card className="overflow-hidden card-pink-top">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <BookmarkCheck className="w-4 h-4 text-primary" />
            {l('title')} ({allResults.length})
          </h3>
          {allResults.length > 3 && (
            <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 text-primary" onClick={() => setShowAll(!showAll)}>
              {showAll ? <X className="w-3 h-3" /> : l('viewAll')}
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {displayed.map((result, i) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div
                className="group flex items-start gap-3 p-3 rounded-xl bg-muted/30 hover:bg-primary/[0.08] border border-transparent hover:border-primary/20 transition-all cursor-pointer"
                onClick={() => setViewingId(viewingId === result.id ? null : result.id)}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mt-0.5 transition-colors">
                  <Bookmark className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md">{getToolName(result.toolId)}</span>
                  </div>
                  <p className="text-xs font-medium text-foreground leading-tight whitespace-normal break-words line-clamp-2" style={{ overflowWrap: 'anywhere' }}>{result.title}</p>
                  <div className="flex items-center gap-1 text-[9px] text-muted-foreground mt-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {formatDate(result.savedAt, lang)}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 mt-1">
                  <Button
                    size="sm" variant="ghost" className="h-6 w-6 p-0"
                    onClick={(e) => { e.stopPropagation(); remove(result.id); if (viewingId === result.id) setViewingId(null); }}
                  >
                    <Trash2 className="w-3 h-3 text-destructive/60 hover:text-destructive" />
                  </Button>
                  <ChevronIcon className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary/60 transition-colors" />
                </div>
              </div>

              <AnimatePresence>
                {viewingId === result.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-1 p-3 rounded-lg bg-muted/20 border border-border/20 max-h-[250px] overflow-y-auto">
                      <MarkdownRenderer content={result.content} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
