import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Smile, Trash2, TrendingUp, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { format, startOfWeek, eachDayOfInterval, subDays } from "date-fns";

interface MoodEntry {
  id: string;
  date: string;
  mood: number; // 1-5
  note?: string;
}

const MOODS = [
  { value: 1, emoji: "😢", label: "veryBad" },
  { value: 2, emoji: "😔", label: "bad" },
  { value: 3, emoji: "😐", label: "okay" },
  { value: 4, emoji: "🙂", label: "good" },
  { value: 5, emoji: "😊", label: "great" },
];

const MoodDiary = () => {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [todayEntry, setTodayEntry] = useState<MoodEntry | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("moodDiary");
    if (saved) {
      const parsed = JSON.parse(saved);
      setEntries(parsed);
      
      const today = new Date().toDateString();
      const existing = parsed.find((e: MoodEntry) => 
        new Date(e.date).toDateString() === today
      );
      if (existing) {
        setTodayEntry(existing);
        setSelectedMood(existing.mood);
      }
    }
  }, []);

  const saveMood = () => {
    if (!selectedMood) return;

    const today = new Date().toDateString();
    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      mood: selectedMood,
      note: note || undefined,
    };

    // Remove existing entry for today if any
    const filtered = entries.filter(
      (e) => new Date(e.date).toDateString() !== today
    );
    const updated = [newEntry, ...filtered];
    
    setEntries(updated);
    setTodayEntry(newEntry);
    localStorage.setItem("moodDiary", JSON.stringify(updated));
    setNote("");
  };

  const deleteEntry = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    localStorage.setItem("moodDiary", JSON.stringify(updated));
    
    if (todayEntry?.id === id) {
      setTodayEntry(null);
      setSelectedMood(null);
    }
  };

  // Get last 7 days for the chart
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date(),
  });

  const getMoodForDate = (date: Date) => {
    const entry = entries.find(
      (e) => new Date(e.date).toDateString() === date.toDateString()
    );
    return entry?.mood;
  };

  const getAverageMood = () => {
    if (entries.length === 0) return 0;
    const weekEntries = entries.filter(
      (e) => new Date(e.date) >= subDays(new Date(), 7)
    );
    if (weekEntries.length === 0) return 0;
    return weekEntries.reduce((sum, e) => sum + e.mood, 0) / weekEntries.length;
  };

  const avgMood = getAverageMood();

  return (
    <Layout title={t('tools.moodDiary.title')} showBack>
      <div className="container max-w-2xl py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Today's Mood */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smile className="h-5 w-5 text-primary" />
                {t('moodDiaryPage.howAreYou')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center gap-4">
                {MOODS.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => setSelectedMood(mood.value)}
                    className={`text-3xl p-3 rounded-full transition-all ${
                      selectedMood === mood.value
                        ? "bg-primary/20 scale-125 ring-2 ring-primary"
                        : "hover:bg-secondary hover:scale-110"
                    }`}
                  >
                    {mood.emoji}
                  </button>
                ))}
              </div>

              {selectedMood && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                >
                  <Textarea
                    placeholder={t('moodDiaryPage.addNote')}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    className="mb-4"
                  />
                  <Button onClick={saveMood} className="w-full">
                    {todayEntry ? t('moodDiaryPage.update') : t('common.save')}
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Week Overview */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-primary" />
                {t('moodDiaryPage.thisWeek')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4">
                {last7Days.map((day) => {
                  const mood = getMoodForDate(day);
                  const moodData = MOODS.find((m) => m.value === mood);
                  return (
                    <div key={day.toISOString()} className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">
                        {format(day, "EEE")}
                      </p>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        mood ? "bg-secondary" : "bg-muted"
                      }`}>
                        {moodData ? (
                          <span className="text-lg">{moodData.emoji}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {avgMood > 0 && (
                <div className="rounded-lg bg-secondary p-3 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t('moodDiaryPage.weeklyAverage')}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {MOODS.find((m) => m.value === Math.round(avgMood))?.emoji}
                    </span>
                    <span className="font-medium">{avgMood.toFixed(1)}/5</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Entries */}
          {entries.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                {t('moodDiaryPage.recentEntries')}
              </h2>
              <div className="space-y-2">
                {entries.slice(0, 10).map((entry) => {
                  const moodData = MOODS.find((m) => m.value === entry.mood);
                  return (
                    <Card key={entry.id}>
                      <CardContent className="py-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{moodData?.emoji}</span>
                            <div>
                              <p className="font-medium">
                                {format(new Date(entry.date), "EEEE, MMM d")}
                              </p>
                              {entry.note && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {entry.note}
                                </p>
                              )}
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
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default MoodDiary;
