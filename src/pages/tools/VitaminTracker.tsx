import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ToolFrame } from "@/components/ToolFrame";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Pill, Check, Clock, AlertCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { useAnalytics } from "@/hooks/useAnalytics";

interface Vitamin {
  id: string;
  name: string;
  dosage: string;
  importance: string;
  timing: "morning" | "afternoon" | "evening" | "anytime";
  notes?: string;
}

interface DailyLog {
  date: string;
  taken: string[];
}

const STORAGE_KEY = "vitamin-tracker-data";

const vitamins: Vitamin[] = [
  { id: "folic", name: "Folic Acid", dosage: "400-800 mcg", importance: "Essential for neural tube development", timing: "morning", notes: "Take before and during pregnancy" },
  { id: "iron", name: "Iron", dosage: "27 mg", importance: "Prevents anemia and supports fetal growth", timing: "morning", notes: "Take with Vitamin C for better absorption" },
  { id: "calcium", name: "Calcium", dosage: "1000 mg", importance: "For baby's bone and teeth development", timing: "evening", notes: "Don't take with iron" },
  { id: "vitd", name: "Vitamin D", dosage: "600 IU", importance: "Helps calcium absorption", timing: "morning" },
  { id: "omega3", name: "Omega-3 (DHA)", dosage: "200-300 mg", importance: "For baby's brain and eye development", timing: "afternoon" },
  { id: "prenatal", name: "Prenatal Vitamin", dosage: "As directed", importance: "Complete pregnancy vitamins", timing: "morning" },
  { id: "b12", name: "Vitamin B12", dosage: "2.6 mcg", importance: "For nervous system development", timing: "anytime" },
  { id: "zinc", name: "Zinc", dosage: "11 mg", importance: "For cell growth and immunity", timing: "evening" },
];

const timingLabels = {
  morning: { label: "Morning", icon: "🌅" },
  afternoon: { label: "Afternoon", icon: "☀️" },
  evening: { label: "Evening", icon: "🌙" },
  anytime: { label: "Anytime", icon: "⏰" },
};

const VitaminTracker = () => {
  const { t } = useTranslation();
  const { trackAction } = useAnalytics("vitamin-tracker");
  
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [selectedVitamins, setSelectedVitamins] = useState<string[]>(vitamins.map(v => v.id));

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      setLogs(data.logs || []);
      setSelectedVitamins(data.selected || vitamins.map(v => v.id));
    }
  }, []);

  const today = format(new Date(), "yyyy-MM-dd");
  const todayLog = logs.find(l => l.date === today);
  const takenToday = todayLog?.taken || [];

  const saveData = (newLogs: DailyLog[], newSelected: string[]) => {
    setLogs(newLogs);
    setSelectedVitamins(newSelected);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ logs: newLogs, selected: newSelected }));
  };

  const toggleTaken = (vitaminId: string) => {
    const newTaken = takenToday.includes(vitaminId)
      ? takenToday.filter(id => id !== vitaminId)
      : [...takenToday, vitaminId];
    
    const newLogs = logs.filter(l => l.date !== today);
    newLogs.push({ date: today, taken: newTaken });
    
    saveData(newLogs.slice(-30), selectedVitamins);
    trackAction("vitamin_logged", { vitaminId, taken: !takenToday.includes(vitaminId) });
  };

  const toggleSelected = (vitaminId: string) => {
    const newSelected = selectedVitamins.includes(vitaminId)
      ? selectedVitamins.filter(id => id !== vitaminId)
      : [...selectedVitamins, vitaminId];
    saveData(logs, newSelected);
  };

  const activeVitamins = vitamins.filter(v => selectedVitamins.includes(v.id));
  const progress = activeVitamins.length > 0 
    ? (takenToday.filter(id => selectedVitamins.includes(id)).length / activeVitamins.length) * 100 
    : 0;

  const getStreak = () => {
    let streak = 0;
    const sortedLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date));
    
    for (const log of sortedLogs) {
      const allTaken = activeVitamins.every(v => log.taken.includes(v.id));
      if (allTaken) streak++;
      else break;
    }
    return streak;
  };

  const groupByTiming = (vits: Vitamin[]) => {
    const groups: Record<string, Vitamin[]> = { morning: [], afternoon: [], evening: [], anytime: [] };
    vits.forEach(v => groups[v.timing].push(v));
    return groups;
  };

  const groupedVitamins = groupByTiming(activeVitamins);

  return (
    <ToolFrame
      title={t('tools.vitaminTracker.title')}
      subtitle={t('tools.vitaminTracker.description')}
      icon={Pill}
      mood="calm"
    >
      <div className="space-y-6">
        {/* Today's Progress */}
        <Card className="bg-gradient-to-r from-primary/10 to-purple-100/50 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg">Today's Progress</h3>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(), "EEEE, MMMM d")}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">
                  {Math.round(progress)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {takenToday.filter(id => selectedVitamins.includes(id)).length}/{activeVitamins.length}
                </p>
              </div>
            </div>
            <Progress value={progress} className="h-3" />
            
            {getStreak() > 0 && (
              <div className="mt-4 flex items-center gap-2 text-amber-600">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">🔥 {getStreak()} day streak!</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vitamins by Time */}
        {Object.entries(groupedVitamins).map(([timing, vits]) => {
          if (vits.length === 0) return null;
          const timingInfo = timingLabels[timing as keyof typeof timingLabels];
          
          return (
            <motion.div
              key={timing}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <span className="text-xl">{timingInfo.icon}</span>
                    {timingInfo.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <AnimatePresence>
                    {vits.map((vitamin) => {
                      const isTaken = takenToday.includes(vitamin.id);
                      
                      return (
                        <motion.div
                          key={vitamin.id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            isTaken 
                              ? 'border-green-500 bg-green-50' 
                              : 'border-muted hover:border-primary/50 bg-muted/20'
                          }`}
                          onClick={() => toggleTaken(vitamin.id)}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isTaken ? 'bg-green-500 text-white' : 'bg-muted'
                            }`}>
                              {isTaken ? <Check className="h-5 w-5" /> : <Pill className="h-4 w-4 text-muted-foreground" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className={`font-semibold ${isTaken ? 'line-through text-muted-foreground' : ''}`}>
                                  {vitamin.name}
                                </h4>
                                <span className="text-sm font-medium text-primary">{vitamin.dosage}</span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{vitamin.importance}</p>
                              {vitamin.notes && (
                                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  {vitamin.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {/* Customize List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Customize Vitamin List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {vitamins.map((vitamin) => (
                <div
                  key={vitamin.id}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50"
                >
                  <Checkbox
                    checked={selectedVitamins.includes(vitamin.id)}
                    onCheckedChange={() => toggleSelected(vitamin.id)}
                  />
                  <span className="text-sm">{vitamin.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex gap-3">
              <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Vitamin Tips</p>
                <ul className="text-sm text-blue-700 mt-1 space-y-1 list-disc list-inside">
                  <li>Take iron on an empty stomach with orange juice</li>
                  <li>Separate calcium and iron by at least 2 hours</li>
                  <li>Consult your doctor before adding new supplements</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
};

export default VitaminTracker;