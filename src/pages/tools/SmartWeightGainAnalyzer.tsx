import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserProfile } from '@/hooks/useUserProfile';
import { ToolFrame } from '@/components/ToolFrame';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, TrendingUp, AlertCircle, CheckCircle, Plus, Ruler, Weight, Trash2, Heart, ShieldCheck, Info, Lightbulb, Save, Calendar, Target, Activity, ArrowUp, ArrowDown, Minus } from 'lucide-react';
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
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('weightGainEntries');
    if (saved) setEntries(JSON.parse(saved));
    if (userProfile.prePregnancyWeight) setPrePregnancyWeightState(String(userProfile.prePregnancyWeight));
    if (userProfile.height) setHeightState(String(userProfile.height));
    if (userProfile.pregnancyWeek) setCurrentWeek(String(userProfile.pregnancyWeek));
    if (userProfile.weight) setCurrentWeight(String(userProfile.weight));
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
    }
  }, [prePregnancyWeight, height]);

  const range = BMI_WEIGHT_GAIN[bmiCategory];
  const profileComplete = !!(prePregnancyWeight && height);

  const bmi = useMemo(() => {
    if (!prePregnancyWeight || !height) return 0;
    return parseFloat(prePregnancyWeight) / Math.pow(parseFloat(height) / 100, 2);
  }, [prePregnancyWeight, height]);

  const getExpectedGainForWeek = useCallback((week: number) => {
    if (week <= 13) {
      return { min: (range.min / 40) * week * 0.5, max: (range.max / 40) * week * 0.8 };
    }
    const ftMin = range.min * 0.1;
    const ftMax = range.max * 0.15;
    return {
      min: ftMin + ((range.min - ftMin) / 27) * (week - 13),
      max: ftMax + ((range.max - ftMax) / 27) * (week - 13),
    };
  }, [range]);

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
    setShowAddForm(false);
    toast.success(t('toolsInternal.weightGain.entryAdded'));
  };

  const removeEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    toast.success(t('toolsInternal.weightGain.entryRemoved', 'تم حذف القراءة'));
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
  }, [entries, prePregnancyWeight, totalGain, getExpectedGainForWeek]);

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
  }, [entries, prePregnancyWeight, getExpectedGainForWeek]);

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

  const weeklyGainRate = useMemo(() => {
    if (entries.length < 2) return null;
    const last = entries[entries.length - 1];
    const prev = entries[entries.length - 2];
    const weeksDiff = last.week - prev.week;
    if (weeksDiff <= 0) return null;
    return (last.weight - prev.weight) / weeksDiff;
  }, [entries]);

  const statusConfig: Record<string, { icon: any; color: string; bg: string; badge: string }> = {
    below:  { icon: ArrowDown, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' },
    above:  { icon: ArrowUp, color: 'text-destructive', bg: 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800', badge: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' },
    normal: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' },
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
                <motion.div 
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 border border-primary/10"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Scale className="w-6 h-6 text-primary" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-bold text-foreground leading-tight">
                    {t('toolsInternal.weightGain.heroTitle')}
                  </h2>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                    {t('toolsInternal.weightGain.heroDesc')}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/50">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                    {t('toolsInternal.weightGain.iomBadge')}
                  </span>
                </div>
                {entries.length > 0 && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
                    <Activity className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-medium text-primary">
                      {entries.length} {t('toolsInternal.weightGain.reading')}
                    </span>
                  </div>
                )}
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
                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border/50">
                      <div className="flex items-center gap-2.5">
                        <motion.div 
                          className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          <span className="text-sm font-bold text-primary">{bmi.toFixed(1)}</span>
                        </motion.div>
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

                    <BMIScaleBar bmi={bmi} t={t} />

                    {!showAnalysis && (
                      <Button onClick={handleStartAnalysis} className="w-full h-12 text-sm font-bold gap-2 rounded-xl" size="lg" disabled={!profileComplete}>
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

        {/* ─── Analysis Sections ─── */}
        <AnimatePresence>
          {showAnalysis && profileComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >

              {/* ═══ Prominent Save Weight Button ═══ */}
              {!showAddForm && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  <Button 
                    onClick={() => setShowAddForm(true)}
                    className="w-full h-14 text-[14px] font-bold gap-3 rounded-2xl shadow-lg shadow-primary/15 relative overflow-hidden group"
                    size="lg"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary-foreground/10 to-primary/0"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    />
                    <div className="relative flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                        <Save className="w-4 h-4" />
                      </div>
                      <span>{t('toolsInternal.weightGain.saveWeight', 'سجّلي وزنك الآن')}</span>
                    </div>
                  </Button>
                </motion.div>
              )}

              {/* ═══ Add Weight Entry Form ═══ */}
              <AnimatePresence>
                {showAddForm && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  >
                    <Card className="border-primary/20 bg-gradient-to-br from-primary/[0.03] to-card shadow-md shadow-primary/5">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Scale className="w-3.5 h-3.5 text-primary" />
                            </div>
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

                        <div>
                          <Label htmlFor="weight" className="text-[11px] text-muted-foreground mb-1.5 block">
                            {t('toolsInternal.weightGain.currentWeightKg')}
                          </Label>
                          <Input
                            id="weight"
                            type="number"
                            step="0.1"
                            placeholder="62.5"
                            value={currentWeight}
                            onChange={(e) => setCurrentWeight(e.target.value)}
                            className="h-12 text-center text-lg font-bold"
                            autoFocus
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            onClick={addEntry} 
                            disabled={!currentWeight || !currentWeek}
                            className="flex-1 h-12 text-sm font-bold gap-2 rounded-xl"
                          >
                            <Save className="w-4 h-4" />
                            {t('toolsInternal.weightGain.saveEntry', 'حفظ الوزن')}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setShowAddForm(false)}
                            className="h-12 px-4 rounded-xl"
                          >
                            {t('toolsInternal.weightGain.cancel', 'إلغاء')}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ═══ Quick Stats Dashboard ═══ */}
              {status && entries.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  {/* Main stat cards */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {/* Total Gain */}
                    <Card className="border-primary/10 overflow-hidden">
                      <CardContent className="p-3 text-center relative">
                        <motion.div 
                          className="absolute -top-4 -end-4 w-16 h-16 rounded-full bg-primary/5 blur-xl"
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 4, repeat: Infinity }}
                        />
                        <p className="text-[10px] text-muted-foreground relative">{t('toolsInternal.weightGain.totalWeightGainLabel')}</p>
                        <motion.p 
                          className="text-2xl font-extrabold text-primary mt-1 relative"
                          key={totalGain}
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          {totalGain >= 0 ? '+' : ''}{totalGain.toFixed(1)}
                        </motion.p>
                        <p className="text-[10px] text-muted-foreground relative">kg</p>
                      </CardContent>
                    </Card>

                    {/* Status */}
                    <Card className={`border overflow-hidden ${statusConfig[status].bg}`}>
                      <CardContent className="p-3 text-center">
                        <p className="text-[10px] text-muted-foreground">{t('toolsInternal.weightGain.statusLabel')}</p>
                        <div className="flex items-center justify-center gap-1.5 mt-1">
                          {React.createElement(statusConfig[status].icon, { className: `w-5 h-5 ${statusConfig[status].color}` })}
                        </div>
                        <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${statusConfig[status].badge}`}>
                          {t(`toolsInternal.weightGain.statusMessages.${status}.message`)}
                        </span>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Progress Ring */}
                    <Card className="border-accent/20">
                      <CardContent className="p-3 text-center">
                        <p className="text-[10px] text-muted-foreground">{t('toolsInternal.weightGain.progressToGoal')}</p>
                        <div className="relative w-14 h-14 mx-auto mt-1.5 mb-1">
                          <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
                            <circle cx="28" cy="28" r="24" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
                            <motion.circle 
                              cx="28" cy="28" r="24" fill="none" 
                              stroke="hsl(var(--primary))" strokeWidth="4" strokeLinecap="round"
                              strokeDasharray={`${2 * Math.PI * 24}`}
                              initial={{ strokeDashoffset: 2 * Math.PI * 24 }}
                              animate={{ strokeDashoffset: 2 * Math.PI * 24 * (1 - progressPercent / 100) }}
                              transition={{ duration: 1, ease: 'easeOut' }}
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-foreground">
                            {progressPercent}%
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Weekly Rate */}
                    <Card className="border-border/50">
                      <CardContent className="p-3 text-center">
                        <p className="text-[10px] text-muted-foreground">{t('toolsInternal.weightGain.weeklyRate', 'معدل أسبوعي')}</p>
                        <p className="text-xl font-extrabold text-foreground mt-2">
                          {weeklyGainRate !== null 
                            ? `${weeklyGainRate >= 0 ? '+' : ''}${weeklyGainRate.toFixed(2)}`
                            : '—'}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {t('toolsInternal.weightGain.kgPerWeek', 'كغ/أسبوع')}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recommendation Banner */}
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`mt-2 p-3.5 rounded-xl border ${statusConfig[status].bg}`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${statusConfig[status].badge}`}>
                        {React.createElement(statusConfig[status].icon, { className: `w-3.5 h-3.5 ${statusConfig[status].color}` })}
                      </div>
                      <p className="text-xs text-foreground/80 leading-relaxed">
                        {t(`toolsInternal.weightGain.statusMessages.${status}.recommendation`)}
                      </p>
                    </div>
                  </motion.div>
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
                  <Card className="border-dashed border-2 border-primary/15">
                    <CardContent className="p-8 text-center space-y-3">
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <Scale className="w-10 h-10 text-primary/30 mx-auto" />
                      </motion.div>
                      <p className="text-sm font-semibold text-muted-foreground">{t('toolsInternal.weightGain.noEntriesYet')}</p>
                      <p className="text-[11px] text-muted-foreground/60 max-w-[200px] mx-auto">{t('toolsInternal.weightGain.noEntriesHint')}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 gap-1.5 rounded-xl"
                        onClick={() => setShowAddForm(true)}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {t('toolsInternal.weightGain.addFirstEntry', 'أضيفي أول قراءة')}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Recent Entries */}
              {entries.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          {t('toolsInternal.weightGain.recentEntries')}
                        </h3>
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
                            <motion.div
                              key={entry.id}
                              layout
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/40 hover:bg-muted/60 transition-colors"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className={`w-2.5 h-2.5 rounded-full ring-2 ring-offset-1 ring-offset-background ${isInRange ? 'bg-emerald-500 ring-emerald-200' : 'bg-amber-500 ring-amber-200'}`} />
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
                                  <span className={`text-[10px] font-semibold mx-1 ${gain > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                                    {gain >= 0 ? '+' : ''}{gain.toFixed(1)}
                                  </span>
                                </div>
                                <button 
                                  onClick={() => removeEntry(entry.id)}
                                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground/50 hover:text-destructive transition-all"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
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
- Weekly gain rate: ${weeklyGainRate?.toFixed(2) || 'N/A'} kg/week
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
