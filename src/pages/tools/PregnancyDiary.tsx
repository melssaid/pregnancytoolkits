import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Plus, Trash2, Heart } from "lucide-react";
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

const MOODS = ["😊", "😌", "😐", "😢", "😴", "🤢", "😰"];

const PregnancyDiary = () => {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [currentWeek, setCurrentWeek] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [note, setNote] = useState("");

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
  };

  const deleteEntry = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    localStorage.setItem("pregnancyDiary", JSON.stringify(updated));
  };

  return (
    <Layout title={t('tools.pregnancyDiary.title')} showBack>
      <div className="container max-w-2xl py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                {t('pregnancyDiaryPage.newEntry')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('pregnancyDiaryPage.week')}</Label>
                <Input
                  type="number"
                  min="1"
                  max="42"
                  placeholder="1-42"
                  value={currentWeek}
                  onChange={(e) => setCurrentWeek(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('pregnancyDiaryPage.mood')}</Label>
                <div className="flex gap-2 flex-wrap">
                  {MOODS.map((mood) => (
                    <button
                      key={mood}
                      onClick={() => setSelectedMood(mood)}
                      className={`text-2xl p-2 rounded-lg transition-all ${
                        selectedMood === mood
                          ? "bg-primary/20 scale-110"
                          : "hover:bg-secondary"
                      }`}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('pregnancyDiaryPage.symptoms')}</Label>
                <Input
                  placeholder={t('pregnancyDiaryPage.symptomsPlaceholder')}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('pregnancyDiaryPage.note')}</Label>
                <Textarea
                  placeholder={t('pregnancyDiaryPage.notePlaceholder')}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                />
              </div>

              <Button onClick={saveEntry} className="w-full">
                <Plus className="h-4 w-4 me-2" />
                {t('pregnancyDiaryPage.save')}
              </Button>
            </CardContent>
          </Card>

          {entries.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                {t('pregnancyDiaryPage.myEntries')}
              </h2>
              {entries.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{entry.mood}</span>
                          <div>
                            <p className="font-medium">
                              {t('common.week')} {entry.week}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(entry.date), "PPP")}
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
                      {entry.symptoms && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {t('pregnancyDiaryPage.symptoms')}: {entry.symptoms}
                        </p>
                      )}
                      <p className="text-foreground">{entry.note}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default PregnancyDiary;
