import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplet, Circle, Trash2, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, isToday, isYesterday } from "date-fns";

type DiaperType = "wet" | "dirty" | "both";

interface DiaperEntry {
  id: string;
  time: string;
  type: DiaperType;
}

interface DiaperHistoryProps {
  entries: DiaperEntry[];
  onDelete: (id: string) => void;
}

interface GroupedEntries {
  label: string;
  entries: DiaperEntry[];
}

export const DiaperHistory = ({ entries, onDelete }: DiaperHistoryProps) => {
  const { t } = useTranslation();

  const grouped = useMemo<GroupedEntries[]>(() => {
    const groups: Record<string, DiaperEntry[]> = {};

    entries.slice(0, 30).forEach(entry => {
      const date = new Date(entry.time);
      const key = format(date, "yyyy-MM-dd");
      if (!groups[key]) groups[key] = [];
      groups[key].push(entry);
    });

    return Object.entries(groups).map(([key, items]) => {
      const date = new Date(key);
      let label = format(date, "MMM d, yyyy");
      if (isToday(date)) label = t('diaperPage.today');
      else if (isYesterday(date)) label = t('diaperPage.yesterday');
      return { label, entries: items };
    });
  }, [entries, t]);

  if (entries.length === 0) return null;

  const getTypeIcon = (type: DiaperType) => {
    switch (type) {
      case "wet":
        return <Droplet className="h-4 w-4 text-blue-500" />;
      case "dirty":
        return <Circle className="h-4 w-4 text-amber-600 fill-amber-600" />;
      case "both":
        return (
          <div className="flex gap-0.5">
            <Droplet className="h-3.5 w-3.5 text-blue-500" />
            <Circle className="h-3.5 w-3.5 text-amber-600 fill-amber-600" />
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <History className="h-4 w-4 text-primary shrink-0" />
        <h2 className="text-sm font-semibold">{t('diaperPage.recentChanges')}</h2>
        <span className="text-xs text-muted-foreground ms-auto">
          {entries.length} {t('diaperPage.total').toLowerCase()}
        </span>
      </div>

      <div className="space-y-4">
        {grouped.map((group) => (
          <div key={group.label}>
            <p className="text-xs font-medium text-muted-foreground mb-1.5 ps-1">
              {group.label}
            </p>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <AnimatePresence mode="popLayout">
                  {group.entries.map((entry, i) => (
                    <motion.div
                      key={entry.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className={`flex items-center justify-between gap-2 px-3 py-2.5 ${
                        i < group.entries.length - 1 ? 'border-b border-border/50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className={`p-1.5 rounded-lg shrink-0 ${
                          entry.type === 'wet' ? 'bg-blue-50 dark:bg-blue-950/30' :
                          entry.type === 'dirty' ? 'bg-amber-50 dark:bg-amber-950/30' :
                          'bg-purple-50 dark:bg-purple-950/30'
                        }`}>
                          {getTypeIcon(entry.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">
                            {t(`diaperPage.${entry.type}`)}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {format(new Date(entry.time), "HH:mm")}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 opacity-50 hover:opacity-100 hover:bg-destructive/10"
                        onClick={() => onDelete(entry.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
