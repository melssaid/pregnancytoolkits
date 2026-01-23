import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Plus, Trash2, Heart, Calendar, PenLine } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface DiaryEntry {
  id: string;
  date: string;
  week: number;
  mood: string;
  symptoms: string;
  note: string;
}

const MOODS = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😌", label: "Calm" },
  { emoji: "😐", label: "Okay" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😴", label: "Tired" },
  { emoji: "🤢", label: "Nauseous" },
  { emoji: "😰", label: "Anxious" },
];

const PregnancyDiary = () => {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [currentWeek, setCurrentWeek] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [note, setNote] = useState("");
  const [activeTab, setActiveTab] = useState("new");

  useEffect(() => {
    const saved = localStorage.getItem("pregnancyDiary");
    if (saved) setEntries(JSON.parse(saved));
  }, []);

  const saveEntry = () => {
    if (!currentWeek || !note) return;

    const newEntry: DiaryEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      week: parseInt(currentWeek),
      mood: selectedMood,
      symptoms,
      note,
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    localStorage.setItem("pregnancyDiary", JSON.stringify(updated));

    setCurrentWeek("");
    setSelectedMood("");
    setSymptoms("");
    setNote("");
    setActiveTab("entries");
  };

  const deleteEntry = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    localStorage.setItem("pregnancyDiary", JSON.stringify(updated));
  };

  const getWeekStats = () => {
    const uniqueWeeks = [...new Set(entries.map((e) => e.week))];
    return {
      totalEntries: entries.length,
      weeksDocumented: uniqueWeeks.length,
      latestWeek: entries.length > 0 ? entries[0].week : null,
    };
  };

  const stats = getWeekStats();

  return (
    <Layout title={t('tools.pregnancyDiary.title')} showBack>
      <div className="container max-w-2xl py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="new" className="gap-2">
                <PenLine className="h-4 w-4" />
                New Entry
              </TabsTrigger>
              <TabsTrigger value="entries" className="gap-2">
                <BookOpen className="h-4 w-4" />
                My Entries ({entries.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="new" className="space-y-6">
              {/* Quick Stats */}
              {entries.length > 0 && (
                <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                  <CardContent className="py-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-primary">{stats.totalEntries}</p>
                        <p className="text-xs text-muted-foreground">Entries</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-primary">{stats.weeksDocumented}</p>
                        <p className="text-xs text-muted-foreground">Weeks</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-primary">{stats.latestWeek || "-"}</p>
                        <p className="text-xs text-muted-foreground">Latest Week</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* New Entry Form */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="h-5 w-5 text-primary" />
                    {t('pregnancyDiaryPage.newEntry')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{t('pregnancyDiaryPage.week')}</Label>
                    <Input
                      type="number"
                      min="1"
                      max="42"
                      placeholder="Enter week (1-42)"
                      value={currentWeek}
                      onChange={(e) => setCurrentWeek(e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">{t('pregnancyDiaryPage.mood')}</Label>
                    <div className="grid grid-cols-7 gap-1 sm:gap-2">
                      {MOODS.map((mood) => (
                        <button
                          key={mood.emoji}
                          onClick={() => setSelectedMood(mood.emoji)}
                          className={`flex flex-col items-center p-2 sm:p-3 rounded-xl transition-all ${
                            selectedMood === mood.emoji
                              ? "bg-primary/15 ring-2 ring-primary scale-105"
                              : "bg-muted/30 hover:bg-muted/50 hover:scale-105"
                          }`}
                        >
                          <span className="text-xl sm:text-2xl mb-1">{mood.emoji}</span>
                          <span className="text-[8px] sm:text-[10px] text-muted-foreground font-medium leading-tight">
                            {mood.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{t('pregnancyDiaryPage.symptoms')}</Label>
                    <Input
                      placeholder={t('pregnancyDiaryPage.symptomsPlaceholder')}
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{t('pregnancyDiaryPage.note')}</Label>
                    <Textarea
                      placeholder={t('pregnancyDiaryPage.notePlaceholder')}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={4}
                      className="resize-none text-base"
                    />
                  </div>

                  <Button 
                    onClick={saveEntry} 
                    className="w-full h-12 text-base font-medium"
                    disabled={!currentWeek || !note}
                  >
                    <Plus className="h-5 w-5 me-2" />
                    {t('pregnancyDiaryPage.save')}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="entries">
              {entries.length > 0 ? (
                <div className="space-y-3">
                  {entries.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              {entry.mood && (
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <span className="text-2xl">{entry.mood}</span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-foreground">
                                    Week {entry.week}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(entry.date), "MMM d, yyyy")}
                                  </span>
                                </div>
                                {entry.symptoms && (
                                  <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                                    <span className="text-primary">💊</span>
                                    {entry.symptoms}
                                  </p>
                                )}
                                <p className="text-sm text-foreground/90 line-clamp-3">
                                  {entry.note}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteEntry(entry.id)}
                              className="flex-shrink-0 h-9 w-9 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">No diary entries yet</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                      Start documenting your pregnancy journey
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setActiveTab("new")}
                    >
                      <Plus className="h-4 w-4 me-2" />
                      Create First Entry
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </Layout>
  );
};

export default PregnancyDiary;
