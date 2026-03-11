import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserProfile } from '@/hooks/useUserProfile';
import { ToolFrame } from '@/components/ToolFrame';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, TrendingUp, AlertCircle, CheckCircle, Plus, Ruler, Weight, Trash2, Heart, ShieldCheck, Info, Baby, Lightbulb } from 'lucide-react';
import { WeekSlider } from '@/components/WeekSlider';
import { toast } from 'sonner';
import { WeightGainChart } from '@/components/weight-gain/WeightGainChart';
import { BMIScaleBar } from '@/components/weight-gain/BMIScaleBar';
import { WeightDistributionCard } from '@/components/weight-gain/WeightDistributionCard';
import { MedicalTipCard } from '@/components/weight-gain/MedicalTipCard';
import { AIInsightCard } from '@/components/ai/AIInsightCard';

interface WeightEntry {
  id: string;
  date: string;
  weight: number;
  week: number;
}

const BMI_WEIGHT_GAIN: Record<string, { min: number; max: number; categoryKey: string }> = {
  underweight: { min: 12.7, max: 18.1, categoryKey: 'underweight' },
  normal:      { min: 11.3, max: 15.9, categoryKey: 'normal' },
  overweight:  { min: 6.8,  max: 11.3, categoryKey: 'overweight' },
  obese:       { min: 5.0,  max: 9.1,  categoryKey: 'obese' },
};

export default function SmartWeightGainAnalyzer() {
  const { t } = useTranslation();
  const { profile: userProfile, updateProfile: updateUserProfile } = useUserProfile();
  const [prePregnancyWeight, setPrePregnancyWeightState] = useState('');
  const [height, setHeightState] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [currentWeek, setCurrentWeek] = useState('20');
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [bmiCategory, setBmiCategory] = useState('normal');
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('weightGainEntries');
    if (saved) setEntries(JSON.parse(saved));
    if (userProfile.prePregnancyWeight) setPrePregnancyWeightState(String(userProfile.prePregnancyWeight));
    if (userProfile.height) setHeightState(String(userProfile.height));
    if (userProfile.pregnancyWeek) setCurrentWeek(String(userProfile.pregnancyWeek));
    if (userProfile.weight) setCurrentWeight(String(userProfile.weight));
    // Auto-show analysis if profile is already set
    if (userProfile.prePregnancyWeight && userProfile.height) setShowAnalysis(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem('weightGainEntries', JSON.stringify(entries));
  }, [entries]);

  const setPrePregnancyWeight = (val: string) => {
    setPrePregnancyWeightState(val);
    const kg = parseFloat(val);
    if (!isNaN(kg)) updateUserProfile({ prePregnancyWeight: kg });
  };

  const setHeight = (val: string) => {
    setHeightState(val);
    const cm = parseFloat(val);
    if (!isNaN(cm)) updateUserProfile({ height: cm });
  };

  useEffect(() => {
    if (prePregnancyWeight && height) {
      const bmi = parseFloat(prePregnancyWeight) / Math.pow(parseFloat(height) / 100, 2);
      if (bmi < 18.5) setBmiCategory('underweight');
      else if (bmi < 25) setBmiCategory('normal');
      else if (bmi < 30) setBmiCategory('overweight');
      else setBmiCategory('obese');
      // Auto-show analysis when profile is complete
      setShowAnalysis(true);
    }
  }, [prePregnancyWeight, height]);

  const range = BMI_WEIGHT_GAIN[bmiCategory];
  const profileComplete = !!(prePregnancyWeight && height);

  const bmi = useMemo(() => {
    if (!prePregnancyWeight || !height) return 0;
    return parseFloat(prePregnancyWeight) / Math.pow(parseFloat(height) / 100, 2);
  }, [prePregnancyWeight, height]);

  const getExpectedGainForWeek = (week: number) => {
    if (week <= 13) {
      return { min: (range.min / 40) * week * 0.5, max: (range.max / 40) * week * 0.8 };
    }
    const ftMin = range.min * 0.1;
    const ftMax = range.max * 0.15;
    return {
      min: ftMin + ((range.min - ftMin) / 27) * (week - 13),
      max: ftMax + ((range.max - ftMax) / 27) * (week - 13),
    };
  };

  const addEntry = () => {
    if (!currentWeight || !currentWeek) return;
    const entry: WeightEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      weight: parseFloat(currentWeight),
      week: parseInt(currentWeek),
    };
    const kg = parseFloat(currentWeight);
    if (!isNaN(kg)) updateUserProfile({ weight: kg, pregnancyWeek: parseInt(currentWeek) });
    setEntries(prev => [...prev, entry].sort((a, b) => a.week - b.week));
    setCurrentWeight('');
    toast.success(t('toolsInternal.weightGain.entryAdded'));
  };

  const removeEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const totalGain = useMemo(() => {
    if (!entries.length || !prePregnancyWeight) return 0;
    return entries[entries.length - 1].weight - parseFloat(prePregnancyWeight);
  }, [entries, prePregnancyWeight]);

  const status = useMemo(() => {
    if (!entries.length || !prePregnancyWeight) return null;
    const latestWeek = entries[entries.length - 1].week;
    const expected = getExpectedGainForWeek(latestWeek);
    if (totalGain < expected.min) return 'below';
    if (totalGain > expected.max) return 'above';
    return 'normal';
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, prePregnancyWeight, totalGain, bmiCategory]);

  const chartData = useMemo(() => {
    if (!prePregnancyWeight) return [];
    const ppw = parseFloat(prePregnancyWeight);
    const data = [];
    for (let w = 0; w <= 40; w += 2) {
      const exp = getExpectedGainForWeek(w);
      const entry = entries.find(e => e.week === w);
      data.push({
        week: w,
        min: Math.round(exp.min * 10) / 10,
        max: Math.round(exp.max * 10) / 10,
        actual: entry ? Math.round((entry.weight - ppw) * 10) / 10 : null,
      });
    }
    entries.forEach(e => {
      if (e.week % 2 !== 0) {
        const exp = getExpectedGainForWeek(e.week);
        data.push({
          week: e.week,
          min: Math.round(exp.min * 10) / 10,
          max: Math.round(exp.max * 10) / 10,
          actual: Math.round((e.weight - parseFloat(prePregnancyWeight)) * 10) / 10,
        });
      }
    });
    return data.sort((a, b) => a.week - b.week);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, prePregnancyWeight, bmiCategory]);

  const progressPercent = useMemo(() => {
    if (!totalGain || !range) return 0;
    const midTarget = (range.min + range.max) / 2;
    return Math.min(Math.round((totalGain / midTarget) * 100), 100);
  }, [totalGain, range]);

  const currentTrimester = useMemo(() => {
    const w = entries.length ? entries[entries.length - 1].week : parseInt(currentWeek);
    if (w <= 13) return 'first';
    if (w <= 26) return 'second';
    return 'third';
  }, [entries, currentWeek]);

  const lastEntry = entries.length ? entries[entries.length - 1] : null;

  const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
    below:  { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800' },
    above:  { icon: AlertCircle, color: 'text-destructive', bg: 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800' },
    normal: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800' },
  };

  const handleStartAnalysis = () => {
    if (profileComplete) setShowAnalysis(true);
  };

  return (
    <ToolFrame 
      title={t('toolsInternal.weightGain.title')}
      subtitle={t('toolsInternal.weightGain.subtitle')}
      customIcon="weight-scale"
      mood="calm"
      toolId="weight-gain"
    >
      <div className="space-y-4">

        {/* ─── Hero Card ─── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-primary/5 via-card to-accent/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Scale className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-bold text-foreground leading-tight">
                    {t('toolsInternal.weightGain.heroTitle')}
                  </h2>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                    {t('toolsInternal.weightGain.heroDesc')}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/50 w-fit">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                  {t('toolsInternal.weightGain.iomBadge')}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Profile Setup ─── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Heart className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">{t('toolsInternal.weightGain.profileSetup')}</h3>
                  <p className="text-[10px] text-muted-foreground">{t('toolsInternal.weightGain.profileSetupDesc')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="height" className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Ruler className="w-3 h-3" />
                    {t('toolsInternal.weightGain.heightCm')}
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="165"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="mt-1 h-10 text-center font-semibold"
                  />
                </div>
                <div>
                  <Label htmlFor="preWeight" className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Weight className="w-3 h-3" />
                    {t('toolsInternal.weightGain.prePregnancyWeightKg')}
                  </Label>
                  <Input
                    id="preWeight"
                    type="number"
                    placeholder="60"
                    value={prePregnancyWeight}
                    onChange={(e) => setPrePregnancyWeight(e.target.value)}
                    className="mt-1 h-10 text-center font-semibold"
                  />
                </div>
              </div>

              {/* BMI Result */}
              <AnimatePresence>
                {profileComplete && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    {/* BMI Value + Category */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border/50">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">{bmi.toFixed(1)}</span>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">{t('toolsInternal.weightGain.bmiValue')}</p>
                          <p className="text-sm font-bold text-foreground">{t(`toolsInternal.weightGain.bmiCategories.${range.categoryKey}`)}</p>
                        </div>
                      </div>
                      <div className="text-end">
                        <p className="text-[10px] text-muted-foreground">{t('toolsInternal.weightGain.recommendedTotalGain')}</p>
                        <p className="text-sm font-bold text-primary">{range.min}–{range.max} kg</p>
                      </div>
                    </div>

                    {/* BMI Scale Bar */}
                    <BMIScaleBar bmi={bmi} t={t} />

                    {/* Start Analysis Button */}
                    {!showAnalysis && (
                      <Button onClick={handleStartAnalysis} className="w-full h-11 text-sm font-bold gap-2" size="lg">
                        <TrendingUp className="w-4 h-4" />
                        {t('toolsInternal.weightGain.startAnalysis')}
                      </Button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Analysis Sections (shown after Start) ─── */}
        <AnimatePresence>
          {showAnalysis && profileComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              {/* Add Weight Entry */}
              <Card className="border-primary/15">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <Plus className="w-4 h-4 text-primary" />
                      {t('toolsInternal.weightGain.addWeightEntry')}
                    </h3>
                    {lastEntry && (
                      <span className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                        {t('toolsInternal.weightGain.lastRecorded')}: {lastEntry.weight} kg
                      </span>
                    )}
                  </div>
                  
                  <WeekSlider
                    week={parseInt(currentWeek) || 20}
                    onChange={(week) => setCurrentWeek(week.toString())}
                    showCard={false}
                    showTrimester={false}
                    label={t('toolsInternal.weightGain.pregnancyWeek')}
                  />

                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Label htmlFor="weight" className="text-[11px] text-muted-foreground">
                        {t('toolsInternal.weightGain.currentWeightKg')}
                      </Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        placeholder="62.5"
                        value={currentWeight}
                        onChange={(e) => setCurrentWeight(e.target.value)}
                        className="mt-1 h-10 text-center font-semibold"
                      />
                    </div>
                    <Button 
                      onClick={addEntry} 
                      disabled={!currentWeight || !currentWeek}
                      className="h-10 px-5 gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      {t('toolsInternal.weightGain.addEntryFull')}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats Dashboard */}
              {status && entries.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Total Gain */}
                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 text-center">
                      <p className="text-[10px] text-muted-foreground">{t('toolsInternal.weightGain.totalWeightGainLabel')}</p>
                      <p className="text-lg font-bold text-primary mt-0.5">{totalGain >= 0 ? '+' : ''}{totalGain.toFixed(1)}</p>
                      <p className="text-[10px] text-muted-foreground">kg</p>
                    </div>
                    {/* Progress to Goal */}
                    <div className="p-3 rounded-xl bg-accent/30 border border-accent/20 text-center">
                      <p className="text-[10px] text-muted-foreground">{t('toolsInternal.weightGain.progressToGoal')}</p>
                      <p className="text-lg font-bold text-foreground mt-0.5">{progressPercent}%</p>
                      <Progress value={progressPercent} className="h-1.5 mt-1" />
                    </div>
                    {/* Status */}
                    <div className={`p-3 rounded-xl border text-center ${statusConfig[status].bg}`}>
                      <p className="text-[10px] text-muted-foreground">{t('toolsInternal.weightGain.statusLabel')}</p>
                      {React.createElement(statusConfig[status].icon, { className: `w-5 h-5 mx-auto mt-0.5 ${statusConfig[status].color}` })}
                      <p className={`text-[10px] font-semibold mt-0.5 ${statusConfig[status].color}`}>
                        {t(`toolsInternal.weightGain.statusMessages.${status}.message`)}
                      </p>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className={`mt-2 p-3 rounded-xl border ${statusConfig[status].bg}`}>
                    <p className="text-xs text-foreground/80 leading-relaxed">
                      {t(`toolsInternal.weightGain.statusMessages.${status}.recommendation`)}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Medical Tip */}
              <MedicalTipCard trimester={currentTrimester} t={t} />

              {/* Chart */}
              {entries.length > 0 && (
                <WeightGainChart chartData={chartData} t={t} />
              )}

              {/* Empty state */}
              {entries.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Card className="border-dashed">
                    <CardContent className="p-6 text-center space-y-2">
                      <Scale className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                      <p className="text-sm font-medium text-muted-foreground">{t('toolsInternal.weightGain.noEntriesYet')}</p>
                      <p className="text-[11px] text-muted-foreground/60">{t('toolsInternal.weightGain.noEntriesHint')}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Recent Entries */}
              {entries.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-foreground">{t('toolsInternal.weightGain.recentEntries')}</h3>
                    <span className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                      {entries.length} {t('toolsInternal.weightGain.reading')}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {entries.slice(-5).reverse().map((entry) => {
                      const gain = entry.weight - parseFloat(prePregnancyWeight || '0');
                      const expected = getExpectedGainForWeek(entry.week);
                      const isInRange = gain >= expected.min && gain <= expected.max;
                      return (
                        <div key={entry.id} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/50 border border-border/50">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-2 h-2 rounded-full ${isInRange ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <div>
                              <span className="text-xs font-bold">{t('toolsInternal.weightGain.week')} {entry.week}</span>
                              <span className="text-[10px] text-muted-foreground mx-1.5">•</span>
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(entry.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-end">
                              <span className="text-xs font-bold">{entry.weight} kg</span>
                              <span className={`text-[10px] font-medium mx-1 ${gain > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                                {gain >= 0 ? '+' : ''}{gain.toFixed(1)}
                              </span>
                            </div>
                            <button 
                              onClick={() => removeEntry(entry.id)}
                              className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* AI Weight Analysis */}
              {entries.length > 0 && (
                <AIInsightCard
                  title={t('toolsInternal.weightGain.aiAnalysisTitle')}
                  aiType="weight-analysis"
                  prompt={`Analyze my pregnancy weight data:
- Pre-pregnancy weight: ${prePregnancyWeight} kg
- Height: ${height} cm
- BMI: ${bmi.toFixed(1)} (${bmiCategory})
- Current pregnancy week: ${lastEntry?.week || currentWeek}
- Total weight gain so far: ${totalGain.toFixed(1)} kg
- Recommended range: ${range.min}-${range.max} kg total
- Current status: ${status || 'not enough data'}
- Number of entries: ${entries.length}
- Latest weight: ${lastEntry?.weight || 'N/A'} kg
- Weight entries: ${entries.slice(-5).map(e => `Week ${e.week}: ${e.weight}kg`).join(', ')}

Provide personalized weight management advice based on this data.`}
                  context={{ week: lastEntry?.week || parseInt(currentWeek), trimester: currentTrimester === 'first' ? 1 : currentTrimester === 'second' ? 2 : 3 }}
                  buttonText={t('toolsInternal.weightGain.aiAnalysisButton')}
                  icon={<Scale className="w-4 h-4" />}
                />
              )}

              {/* Weight Distribution */}
              <WeightDistributionCard t={t} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToolFrame>
  );
}
