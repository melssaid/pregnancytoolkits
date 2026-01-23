import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scale, TrendingUp, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { WeightChart } from "@/components/charts/WeightChart";
import { format } from "date-fns";

interface WeightEntry {
  id: string;
  date: string;
  week: number;
  weight: number;
}

interface UserSettings {
  prePregnancyWeight: number;
  height: number;
  bmi: number;
  recommendedGain: { min: number; max: number };
}

const STORAGE_KEY = "weight-gain-data";
const SETTINGS_KEY = "weight-gain-settings";

const WeightGain = () => {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  
  // Setup form
  const [prePregnancyWeight, setPrePregnancyWeight] = useState("");
  const [height, setHeight] = useState("");
  
  // New entry form
  const [currentWeight, setCurrentWeight] = useState("");
  const [week, setWeek] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Load data
  useEffect(() => {
    const savedEntries = localStorage.getItem(STORAGE_KEY);
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const calculateBMI = (weight: number, h: number) => {
    return weight / ((h / 100) * (h / 100));
  };

  const getRecommendedGain = (bmi: number) => {
    if (bmi < 18.5) return { min: 12.5, max: 18 };
    if (bmi < 25) return { min: 11.5, max: 16 };
    if (bmi < 30) return { min: 7, max: 11.5 };
    return { min: 5, max: 9 };
  };

  const setupProfile = () => {
    const preWeight = parseFloat(prePregnancyWeight);
    const h = parseFloat(height);
    
    if (!preWeight || !h) return;
    
    const bmi = calculateBMI(preWeight, h);
    const recommendedGain = getRecommendedGain(bmi);
    
    const newSettings: UserSettings = {
      prePregnancyWeight: preWeight,
      height: h,
      bmi,
      recommendedGain,
    };
    
    setSettings(newSettings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
  };

  const addEntry = () => {
    const w = parseFloat(currentWeight);
    const wk = parseInt(week);
    
    if (!w || !wk || !settings) return;
    
    const newEntry: WeightEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      week: wk,
      weight: w,
    };
    
    const updated = [newEntry, ...entries].sort((a, b) => b.week - a.week);
    setEntries(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    setCurrentWeight("");
    setWeek("");
    setShowAddForm(false);
  };

  const deleteEntry = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const resetProfile = () => {
    setSettings(null);
    setEntries([]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SETTINGS_KEY);
    setPrePregnancyWeight("");
    setHeight("");
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return t('weightGainPage.underweight');
    if (bmi < 25) return t('weightGainPage.normal');
    if (bmi < 30) return t('weightGainPage.overweight');
    return t('weightGainPage.obese');
  };

  const getStatusColor = (entry: WeightEntry) => {
    if (!settings) return "text-foreground";
    const gain = entry.weight - settings.prePregnancyWeight;
    const expectedGain = (entry.week / 40) * ((settings.recommendedGain.min + settings.recommendedGain.max) / 2);
    
    if (gain < expectedGain * 0.8) return "text-warning";
    if (gain > expectedGain * 1.2) return "text-destructive";
    return "text-success";
  };

  return (
    <Layout title={t('tools.weightGain.title')} showBack>
      <div className="container max-w-2xl py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Initial Setup */}
          {!settings ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-primary" />
                  إعداد ملف الوزن
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  أدخلي وزنك قبل الحمل وطولك لحساب نطاق الزيادة الموصى به
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('weightGainPage.prePregnancyWeight')}</Label>
                    <Input
                      type="number"
                      placeholder="كجم"
                      value={prePregnancyWeight}
                      onChange={(e) => setPrePregnancyWeight(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('weightGainPage.height')}</Label>
                    <Input
                      type="number"
                      placeholder="سم"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                    />
                  </div>
                </div>

                <Button onClick={setupProfile} className="w-full">
                  بدء التتبع
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Profile Summary */}
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="grid grid-cols-3 gap-4 flex-1">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">وزن ما قبل الحمل</p>
                        <p className="text-lg font-bold text-foreground">
                          {settings.prePregnancyWeight} كجم
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">BMI</p>
                        <p className="text-lg font-bold text-primary">
                          {settings.bmi.toFixed(1)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getBMICategory(settings.bmi)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">الزيادة الموصى بها</p>
                        <p className="text-lg font-bold text-success">
                          {settings.recommendedGain.min}-{settings.recommendedGain.max}
                        </p>
                        <p className="text-xs text-muted-foreground">كجم</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={resetProfile}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Chart */}
              <WeightChart
                entries={entries}
                recommendedMin={settings.recommendedGain.min}
                recommendedMax={settings.recommendedGain.max}
                prePregnancyWeight={settings.prePregnancyWeight}
              />

              {/* Add Entry */}
              {showAddForm ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">إضافة قياس جديد</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>الأسبوع الحالي</Label>
                        <Input
                          type="number"
                          placeholder="1-40"
                          min="1"
                          max="40"
                          value={week}
                          onChange={(e) => setWeek(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>الوزن الحالي (كجم)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="كجم"
                          value={currentWeight}
                          onChange={(e) => setCurrentWeight(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={addEntry} className="flex-1">
                        حفظ
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowAddForm(false)}
                      >
                        إلغاء
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="w-full"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة قياس جديد
                </Button>
              )}

              {/* Entries List */}
              {entries.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      سجل القياسات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {entries.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between rounded-lg bg-muted p-3"
                        >
                          <div>
                            <p className="font-medium text-foreground">
                              الأسبوع {entry.week}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(entry.date), "d MMM yyyy")}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className={`text-xl font-bold ${getStatusColor(entry)}`}>
                                {entry.weight} كجم
                              </p>
                              <p className="text-xs text-muted-foreground">
                                +{(entry.weight - settings.prePregnancyWeight).toFixed(1)} كجم
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteEntry(entry.id)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default WeightGain;
