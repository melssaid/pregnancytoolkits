import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Smile, Trash2, TrendingUp, Calendar, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { format, eachDayOfInterval, subDays } from "date-fns";
import { MoodChart } from "@/components/charts/MoodChart";

interface MoodEntry {
  id: string;
  date: string;
  mood: number; // 1-5
  note?: string;
}

const MOODS = [
  { value: 1, emoji: "😢", label: "Very Bad" },
  { value: 2, emoji: "😔", label: "Bad" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "😊", label: "Great" },
];

const MoodDiary = () => {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [todayEntry, setTodayEntry] = useState<MoodEntry | null>(null);
  const [activeTab, setActiveTab] = useState("today");

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
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="today" className="gap-2">
                <Smile className="h-4 w-4" />
                Today
              </TabsTrigger>
              <TabsTrigger value="chart" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Chart
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="space-y-6">
              {/* Today's Mood */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Smile className="h-5 w-5 text-primary" />
                    How are you feeling today?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-5 gap-2">
                    {MOODS.map((mood) => (
                      <button
                        key={mood.value}
                        onClick={() => setSelectedMood(mood.value)}
                        className={`flex flex-col items-center p-2 sm:p-3 rounded-xl transition-all ${
                          selectedMood === mood.value
                            ? "bg-primary/15 ring-2 ring-primary scale-105"
                            : "bg-muted/30 hover:bg-muted/50 hover:scale-105"
                        }`}
                      >
                        <span className="text-2xl sm:text-3xl mb-1">{mood.emoji}</span>
                        <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">{mood.label}</span>
                      </button>
                    ))}
                  </div>

                  {selectedMood && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-3"
                    >
                      <Textarea
                        placeholder="Add a note about how you're feeling (optional)..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={3}
                        className="resize-none"
                      />
                      <Button onClick={saveMood} className="w-full">
                        {todayEntry ? "Update Mood" : "Save Mood"}
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>

              {/* Week Overview */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="h-5 w-5 text-primary" />
                    This Week
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-4">
                    {last7Days.map((day) => {
                      const mood = getMoodForDate(day);
                      const moodData = MOODS.find((m) => m.value === mood);
                      const isToday = day.toDateString() === new Date().toDateString();
                      return (
                        <div key={day.toISOString()} className="text-center">
                          <p className={`text-[10px] sm:text-xs mb-1 ${isToday ? "font-bold text-primary" : "text-muted-foreground"}`}>
                            {format(day, "EEE")}
                          </p>
                          <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center mx-auto ${
                            mood ? "bg-primary/10" : "bg-muted/50"
                          } ${isToday ? "ring-2 ring-primary" : ""}`}>
                            {moodData ? (
                              <span className="text-base sm:text-xl">{moodData.emoji}</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {avgMood > 0 && (
                    <div className="rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 p-3 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground font-medium">
                        Weekly Average
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {MOODS.find((m) => m.value === Math.round(avgMood))?.emoji}
                        </span>
                        <span className="font-bold text-foreground">{avgMood.toFixed(1)}/5</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chart">
              <MoodChart entries={entries} />
            </TabsContent>

            <TabsContent value="history">
              {entries.length > 0 ? (
                <div className="space-y-2">
                  {entries.slice(0, 20).map((entry) => {
                    const moodData = MOODS.find((m) => m.value === entry.mood);
                    return (
                      <Card key={entry.id}>
                        <CardContent className="py-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">{moodData?.emoji}</span>
                              <div>
                                <p className="font-medium">
                                  {format(new Date(entry.date), "EEEE, MMMM d")}
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
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">
                      No mood entries yet
                    </p>
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

export default MoodDiary;