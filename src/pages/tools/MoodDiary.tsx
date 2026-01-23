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
import { ar } from "date-fns/locale";
import { MoodChart } from "@/components/charts/MoodChart";

interface MoodEntry {
  id: string;
  date: string;
  mood: number; // 1-5
  note?: string;
}

const MOODS = [
  { value: 1, emoji: "😢", label: "سيء جداً" },
  { value: 2, emoji: "😔", label: "سيء" },
  { value: 3, emoji: "😐", label: "عادي" },
  { value: 4, emoji: "🙂", label: "جيد" },
  { value: 5, emoji: "😊", label: "ممتاز" },
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
                اليوم
              </TabsTrigger>
              <TabsTrigger value="chart" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                الرسم البياني
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                السجل
              </TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="space-y-6">
              {/* Today's Mood */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smile className="h-5 w-5 text-primary" />
                    كيف حالك اليوم؟
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
                        placeholder="أضيفي ملاحظة (اختياري)..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={3}
                        className="mb-4"
                      />
                      <Button onClick={saveMood} className="w-full">
                        {todayEntry ? "تحديث" : "حفظ"}
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>

              {/* Week Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                    هذا الأسبوع
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
                            {format(day, "EEE", { locale: ar })}
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
                        متوسط الأسبوع
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
                                  {format(new Date(entry.date), "EEEE، d MMMM", { locale: ar })}
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
                      لم تسجلي أي مزاج بعد
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
