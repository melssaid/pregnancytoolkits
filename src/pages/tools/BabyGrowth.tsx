import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Baby, TrendingUp, Plus, Trash2, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { BabyGrowthChart } from "@/components/charts/BabyGrowthChart";

interface GrowthEntry {
  id: string;
  date: string;
  ageMonths: number;
  weight: number;
  height?: number;
  headCirc?: number;
  gender: "boy" | "girl";
}

const STORAGE_KEY = "baby-growth-entries";

// WHO growth standards (simplified percentiles)
const WHO_WEIGHT_BOYS = [
  { month: 0, p3: 2.5, p50: 3.3, p97: 4.3 },
  { month: 3, p3: 5.1, p50: 6.4, p97: 7.9 },
  { month: 6, p3: 6.4, p50: 7.9, p97: 9.7 },
  { month: 9, p3: 7.2, p50: 9.0, p97: 11.0 },
  { month: 12, p3: 7.8, p50: 9.6, p97: 11.8 },
  { month: 18, p3: 8.6, p50: 10.9, p97: 13.5 },
  { month: 24, p3: 9.7, p50: 12.2, p97: 15.1 },
];

const WHO_WEIGHT_GIRLS = [
  { month: 0, p3: 2.4, p50: 3.2, p97: 4.2 },
  { month: 3, p3: 4.6, p50: 5.8, p97: 7.3 },
  { month: 6, p3: 5.8, p50: 7.3, p97: 9.1 },
  { month: 9, p3: 6.6, p50: 8.2, p97: 10.2 },
  { month: 12, p3: 7.1, p50: 8.9, p97: 11.2 },
  { month: 18, p3: 8.0, p50: 10.2, p97: 12.8 },
  { month: 24, p3: 9.0, p50: 11.5, p97: 14.5 },
];

const BabyGrowth = () => {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<GrowthEntry[]>([]);
  const [gender, setGender] = useState<"boy" | "girl">("boy");
  const [ageMonths, setAgeMonths] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [headCirc, setHeadCirc] = useState("");
  const [activeTab, setActiveTab] = useState("add");
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<{
    weightPercentile: string;
    status: string;
    expectedRange: { min: number; max: number };
  } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setEntries(JSON.parse(saved));
    }
  }, []);

  const calculate = () => {
    const age = parseInt(ageMonths);
    const w = parseFloat(weight);
    
    if (!age && age !== 0 || !w) return;

    const standards = gender === "boy" ? WHO_WEIGHT_BOYS : WHO_WEIGHT_GIRLS;
    
    // Find closest age bracket
    let closest = standards[0];
    for (const s of standards) {
      if (s.month <= age) closest = s;
    }

    let percentile = "50%";
    let status = "normal";

    if (w < closest.p3) {
      percentile = "<3%";
      status = "underweight";
    } else if (w < closest.p50) {
      percentile = "3%-50%";
      status = "normal";
    } else if (w < closest.p97) {
      percentile = "50%-97%";
      status = "normal";
    } else {
      percentile = ">97%";
      status = "overweight";
    }

    setResult({
      weightPercentile: percentile,
      status,
      expectedRange: { min: closest.p3, max: closest.p97 },
    });
    setShowResult(true);
  };

  const saveEntry = () => {
    const age = parseInt(ageMonths);
    const w = parseFloat(weight);
    
    if (!age && age !== 0 || !w) return;

    const newEntry: GrowthEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ageMonths: age,
      weight: w,
      height: height ? parseFloat(height) : undefined,
      headCirc: headCirc ? parseFloat(headCirc) : undefined,
      gender,
    };

    const updated = [newEntry, ...entries].sort((a, b) => b.ageMonths - a.ageMonths);
    setEntries(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Reset form
    setAgeMonths("");
    setWeight("");
    setHeight("");
    setHeadCirc("");
    setShowResult(false);
    setResult(null);
    
    // Switch to chart tab
    setActiveTab("chart");
  };

  const deleteEntry = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const getStatusColor = (status: string) => {
    if (status === "normal") return "text-success";
    if (status === "underweight") return "text-warning";
    return "text-destructive";
  };

  const getStatusText = (status: string) => {
    if (status === "normal") return "طبيعي";
    if (status === "underweight") return "أقل من الطبيعي";
    return "أعلى من الطبيعي";
  };

  return (
    <Layout title={t('tools.babyGrowth.title')} showBack>
      <div className="container max-w-2xl py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="add" className="gap-2">
                <Plus className="h-4 w-4" />
                إضافة قياس
              </TabsTrigger>
              <TabsTrigger value="chart" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                منحنى النمو
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                السجل
              </TabsTrigger>
            </TabsList>

            <TabsContent value="add" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Baby className="h-5 w-5 text-primary" />
                    قياسات الطفل
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>الجنس</Label>
                    <Select value={gender} onValueChange={(v) => setGender(v as "boy" | "girl")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="boy">ذكر 👦</SelectItem>
                        <SelectItem value="girl">أنثى 👧</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>العمر (شهور)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="24"
                      placeholder="0-24"
                      value={ageMonths}
                      onChange={(e) => setAgeMonths(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>الوزن (كجم) *</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="كجم"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>الطول (سم)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="سم"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>محيط الرأس (سم)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="سم"
                        value={headCirc}
                        onChange={(e) => setHeadCirc(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button onClick={calculate} className="w-full">
                    حساب النتيجة
                  </Button>
                </CardContent>
              </Card>

              {showResult && result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        النتيجة
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-lg bg-secondary p-4 text-center">
                        <p className="text-sm text-muted-foreground mb-1">
                          موقع الوزن من منحنى النمو
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          {result.weightPercentile}
                        </p>
                        <p className={`text-sm mt-2 ${getStatusColor(result.status)}`}>
                          {getStatusText(result.status)}
                        </p>
                      </div>

                      <div className="rounded-lg bg-muted p-4">
                        <p className="text-sm text-muted-foreground">
                          النطاق الطبيعي لهذا العمر
                        </p>
                        <p className="font-medium">
                          {result.expectedRange.min} - {result.expectedRange.max} كجم
                        </p>
                      </div>

                      <Button onClick={saveEntry} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        حفظ في السجل
                      </Button>

                      <p className="text-sm text-muted-foreground text-center">
                        معايير منظمة الصحة العالمية WHO
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="chart">
              <BabyGrowthChart entries={entries} gender={gender} />
            </TabsContent>

            <TabsContent value="history">
              {entries.length > 0 ? (
                <div className="space-y-2">
                  {entries.map((entry) => {
                    const standards = entry.gender === "boy" ? WHO_WEIGHT_BOYS : WHO_WEIGHT_GIRLS;
                    const closest = standards.find((s) => s.month <= entry.ageMonths) || standards[0];
                    const isNormal = entry.weight >= closest.p3 && entry.weight <= closest.p97;
                    
                    return (
                      <Card key={entry.id}>
                        <CardContent className="py-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">
                                {entry.gender === "boy" ? "👦" : "👧"}
                              </div>
                              <div>
                                <p className="font-medium">
                                  الشهر {entry.ageMonths}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(entry.date), "d MMMM yyyy", { locale: ar })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className={`text-xl font-bold ${isNormal ? "text-success" : "text-warning"}`}>
                                  {entry.weight} كجم
                                </p>
                                {entry.height && (
                                  <p className="text-xs text-muted-foreground">
                                    الطول: {entry.height} سم
                                  </p>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteEntry(entry.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Baby className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      لم تضيفي أي قياسات بعد
                    </p>
                    <Button
                      variant="link"
                      onClick={() => setActiveTab("add")}
                      className="mt-2"
                    >
                      أضيفي القياس الأول
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

export default BabyGrowth;
