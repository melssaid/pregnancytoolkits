import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplet, Circle, Trash2, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

type DiaperType = "wet" | "dirty" | "both";

interface DiaperEntry {
  id: string;
  time: string;
  type: DiaperType;
  notes?: string;
}

const DiaperTracker = () => {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<DiaperEntry[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("diaperEntries");
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  const addEntry = (type: DiaperType) => {
    const newEntry: DiaperEntry = {
      id: Date.now().toString(),
      time: new Date().toISOString(),
      type,
    };
    const updated = [newEntry, ...entries];
    setEntries(updated);
    localStorage.setItem("diaperEntries", JSON.stringify(updated));
  };

  const deleteEntry = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    localStorage.setItem("diaperEntries", JSON.stringify(updated));
  };

  const getTodayStats = () => {
    const today = new Date().toDateString();
    const todayEntries = entries.filter(
      (e) => new Date(e.time).toDateString() === today
    );
    
    return {
      wet: todayEntries.filter((e) => e.type === "wet" || e.type === "both").length,
      dirty: todayEntries.filter((e) => e.type === "dirty" || e.type === "both").length,
      total: todayEntries.length,
    };
  };

  const stats = getTodayStats();

  const getTypeIcon = (type: DiaperType) => {
    switch (type) {
      case "wet":
        return <Droplet className="h-5 w-5 text-blue-500" />;
      case "dirty":
        return <Circle className="h-5 w-5 text-amber-600 fill-amber-600" />;
      case "both":
        return (
          <div className="flex gap-1">
            <Droplet className="h-4 w-4 text-blue-500" />
            <Circle className="h-4 w-4 text-amber-600 fill-amber-600" />
          </div>
        );
    }
  };

  return (
    <Layout title={t('tools.diaperTracker.title')} showBack>
      <div className="container max-w-2xl py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Quick Add */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-center">{t('diaperPage.quickAdd')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  onClick={() => addEntry("wet")}
                  variant="outline"
                  className="h-20 flex-col gap-2"
                >
                  <Droplet className="h-8 w-8 text-blue-500" />
                  {t('diaperPage.wet')}
                </Button>
                <Button
                  onClick={() => addEntry("dirty")}
                  variant="outline"
                  className="h-20 flex-col gap-2"
                >
                  <Circle className="h-8 w-8 text-amber-600 fill-amber-600" />
                  {t('diaperPage.dirty')}
                </Button>
                <Button
                  onClick={() => addEntry("both")}
                  variant="outline"
                  className="h-20 flex-col gap-2"
                >
                  <div className="flex gap-1">
                    <Droplet className="h-6 w-6 text-blue-500" />
                    <Circle className="h-6 w-6 text-amber-600 fill-amber-600" />
                  </div>
                  {t('diaperPage.both')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Today's Stats */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
                {t('diaperPage.todayStats')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4">
                  <Droplet className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-blue-600">{stats.wet}</p>
                  <p className="text-sm text-muted-foreground">{t('diaperPage.wet')}</p>
                </div>
                <div className="rounded-lg bg-amber-50 dark:bg-amber-950 p-4">
                  <Circle className="h-6 w-6 text-amber-600 fill-amber-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-amber-600">{stats.dirty}</p>
                  <p className="text-sm text-muted-foreground">{t('diaperPage.dirty')}</p>
                </div>
                <div className="rounded-lg bg-secondary p-4">
                  <p className="text-2xl font-bold text-primary">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">{t('diaperPage.total')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info */}
          <Card className="mb-6 bg-muted/50">
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                {t('diaperPage.info')}
              </p>
            </CardContent>
          </Card>

          {/* Recent Entries */}
          {entries.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">{t('diaperPage.recentChanges')}</h2>
              <div className="space-y-2">
                {entries.slice(0, 15).map((entry) => (
                  <Card key={entry.id}>
                    <CardContent className="py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(entry.type)}
                          <div>
                            <p className="font-medium">
                              {t(`diaperPage.${entry.type}`)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(entry.time), "MMM d, HH:mm")}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteEntry(entry.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default DiaperTracker;
