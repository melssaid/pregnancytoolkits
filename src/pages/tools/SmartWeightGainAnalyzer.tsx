import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserProfile } from '@/hooks/useUserProfile';
import { ToolFrame } from '@/components/ToolFrame';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scale, TrendingUp, CheckCircle, Plus, Trash2,
  Heart, ShieldCheck, Save, Calendar, Activity,
  ArrowUp, ArrowDown, ChevronDown, ChevronUp, X
} from 'lucide-react';
import { WeekSlider } from '@/components/WeekSlider';
import { toast } from 'sonner';
import { WeightGainChart } from '@/components/weight-gain/WeightGainChart';
import { BMIScaleBar } from '@/components/weight-gain/BMIScaleBar';
import { WeightDistributionCard } from '@/components/weight-gain/WeightDistributionCard';
import { MedicalTipCard } from '@/components/weight-gain/MedicalTipCard';
import { WeeklySummaryHero } from '@/components/weight-gain/WeeklySummaryHero';
import { WeeklyGoalCard } from '@/components/weight-gain/WeeklyGoalCard';
import { TrimesterComparison } from '@/components/weight-gain/TrimesterComparison';
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
  const [showAllEntries, setShowAllEntries] = useState(false);

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
    toast.success(t('toolsInternal.weightGain.entryRemoved', 'Entry removed'));
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

  const remainingGain = useMemo(() => {
    if (!range || !totalGain) return null;
    const midTarget = (range.min + range.max) / 2;
    return Math.max(0, midTarget - totalGain);
  }, [range, totalGain]);

  const statusConfig: Record<string, { icon: any; color: string; bg: string; badge: string; borderColor: string }> = {
    below:  { icon: ArrowDown, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300', borderColor: 'border-amber-200 dark:border-amber-800' },
    above:  { icon: ArrowUp, color: 'text-destructive', bg: 'bg-red-50 dark:bg-red-950/30', badge: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300', borderColor: 'border-red-200 dark:border-red-800' },
    normal: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300', borderColor: 'border-emerald-200 dark:border-emerald-800' },
  };

  const handleStartAnalysis = () => {
    if (profileComplete) setShowAnalysis(true);
  };

  const displayEntries = showAllEntries ? [...entries].reverse() : entries.slice(-3).reverse();

  return (
    <ToolFrame 
      title={t('toolsInternal.weightGain.title')}
      subtitle={t('toolsInternal.weightGain.subtitle')}
      customIcon="weight-scale"
      mood="calm"
      toolId="weight-gain"
    >
      <div className="space-y-3">

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* STEP 1: Profile Setup — Clear 2-field form                     */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-primary/15 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-primary/30 via-primary to-primary/30" />
            
            <CardContent className="p-4 space-y-4">
              {/* Compact header */}
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" />
                <h3 className="text-[12px] font-bold text-foreground">{t('toolsInternal.weightGain.profileSetup')}</h3>
                {profileComplete && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  </motion.div>
                )}
              </div>

              {/* Equal-sized input fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-muted-foreground font-medium truncate">
                    {t('toolsInternal.weightGain.heightCm')}
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      inputMode="numeric"
                      placeholder="165"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="h-14 text-center font-black text-lg rounded-xl border-border focus:border-primary"
                    />
                    <span className="absolute end-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/40 font-semibold">cm</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-muted-foreground font-medium truncate">
                    {t('toolsInternal.weightGain.prePregnancyWeightKg')}
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      inputMode="decimal"
                      placeholder="60"
                      value={prePregnancyWeight}
                      onChange={(e) => setPrePregnancyWeight(e.target.value)}
                      className="h-14 text-center font-black text-lg rounded-xl border-border focus:border-primary"
                    />
                    <span className="absolute end-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/40 font-semibold">kg</span>
                  </div>
                </div>
              </div>

              {/* BMI Result — inline compact */}
              {profileComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 border border-border/30">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[15px] font-black text-primary leading-none">{bmi.toFixed(1)}</span>
                      <span className="text-[7px] text-primary/50 font-bold">BMI</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold">{t(`toolsInternal.weightGain.bmiCategories.${range.categoryKey}`)}</p>
                      <p className="text-[10px] text-muted-foreground">{t('toolsInternal.weightGain.recommendedTotalGain')}: <span className="font-bold text-primary">{range.min}–{range.max} kg</span></p>
                    </div>
                    <div className="px-1.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200/40 dark:border-emerald-800/40 shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                  </div>

                  <BMIScaleBar bmi={bmi} t={t} />

                  {/* Start Analysis Button */}
                  {!showAnalysis && (
                    <Button 
                      onClick={handleStartAnalysis}
                      className="w-full h-12 text-[13px] font-bold gap-2 rounded-xl shadow-lg shadow-primary/20"
                    >
                      <Activity className="w-4 h-4" />
                      {t('toolsInternal.weightGain.startAnalysis')}
                    </Button>
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* STEP 2: Analysis Dashboard                                     */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {showAnalysis && profileComplete && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="space-y-3"
            >

              {/* ─── Add Weight CTA ─── */}
              {!showAddForm && (
                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
                  <button 
                    onClick={() => setShowAddForm(true)}
                    className="w-full p-4 rounded-2xl bg-gradient-to-r from-primary via-primary/95 to-primary/85 text-primary-foreground flex items-center gap-3 shadow-xl shadow-primary/25 active:scale-[0.98] transition-transform border border-primary-foreground/10"
                  >
                    <motion.div 
                      className="w-11 h-11 rounded-2xl bg-primary-foreground/15 flex items-center justify-center backdrop-blur-sm"
                      animate={{ rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Plus className="w-5 h-5" strokeWidth={2.5} />
                    </motion.div>
                    <div className="flex-1 text-start">
                      <p className="text-[13px] font-bold">{t('toolsInternal.weightGain.saveWeight', 'Record your weight')}</p>
                      {lastEntry && (
                        <p className="text-[10px] opacity-75 mt-0.5">
                          {t('toolsInternal.weightGain.lastRecorded')}: {lastEntry.weight} kg · {t('toolsInternal.weightGain.week')} {lastEntry.week}
                        </p>
                      )}
                    </div>
                    <Scale className="w-5 h-5 opacity-40" />
                  </button>
                </motion.div>
              )}

              {/* ─── Add Weight Form ─── */}
              <AnimatePresence mode="wait">
                {showAddForm && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="border-primary/20 shadow-lg shadow-primary/10 overflow-hidden">
                      <div className="h-1.5 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-[13px] font-bold flex items-center gap-2">
                            <Scale className="w-4 h-4 text-primary" />
                            {t('toolsInternal.weightGain.addWeightEntry')}
                          </h3>
                          <button 
                            onClick={() => setShowAddForm(false)} 
                            className="w-7 h-7 rounded-full bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <X className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                        </div>
                        
                        <WeekSlider
                          week={parseInt(currentWeek) || 20}
                          onChange={(week) => setCurrentWeek(week.toString())}
                          showCard={false}
                          showTrimester={false}
                          label={t('toolsInternal.weightGain.pregnancyWeek')}
                        />

                        <div className="space-y-1.5">
                          <Label className="text-[10px] text-muted-foreground font-medium">
                            {t('toolsInternal.weightGain.currentWeightKg')}
                          </Label>
                          <div className="relative">
                            <Input
                              type="number"
                              inputMode="decimal"
                              step="0.1"
                              placeholder="62.5"
                              value={currentWeight}
                              onChange={(e) => setCurrentWeight(e.target.value)}
                              className="h-14 text-center text-lg font-black rounded-xl border-border focus:border-primary"
                            />
                            <span className="absolute end-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/40 font-semibold">kg</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            onClick={addEntry} 
                            disabled={!currentWeight || !currentWeek}
                            className="flex-1 h-12 text-[13px] font-bold gap-2 rounded-xl shadow-md"
                          >
                            <Save className="w-4 h-4" />
                            {t('toolsInternal.weightGain.saveEntry', 'Save')}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setShowAddForm(false)}
                            className="h-12 px-5 rounded-xl"
                          >
                            {t('toolsInternal.weightGain.cancel', 'Cancel')}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ═══ Stats Dashboard ═══ */}
              {/* ─── Weekly Summary Hero ─── */}
              {status && entries.length > 0 && (
                <WeeklySummaryHero
                  currentWeek={lastEntry?.week || parseInt(currentWeek)}
                  latestWeight={lastEntry?.weight ?? null}
                  previousWeight={entries.length >= 2 ? entries[entries.length - 2].weight : null}
                  totalGain={totalGain}
                  targetMin={range.min}
                  targetMax={range.max}
                  status={status}
                  t={t}
                />
              )}

              {/* ─── Weekly Goal Card ─── */}
              {entries.length > 0 && lastEntry && (
                <WeeklyGoalCard
                  currentWeek={lastEntry.week}
                  currentWeight={lastEntry.weight}
                  prePregnancyWeight={parseFloat(prePregnancyWeight)}
                  getExpectedGainForWeek={getExpectedGainForWeek}
                  t={t}
                />
              )}

              {/* ─── Status Recommendation ─── */}
              {status && entries.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className={`p-3 rounded-2xl border ${statusConfig[status].borderColor} ${statusConfig[status].bg}`}
                >
                  <p className="text-[10px] text-foreground/70 leading-relaxed">
                    {t(`toolsInternal.weightGain.statusMessages.${status}.recommendation`)}
                  </p>
                </motion.div>
              )}


              {/* ─── Chart ─── */}
              {entries.length > 0 && (
                <WeightGainChart chartData={chartData} t={t} />
              )}

              {/* ─── Timeline Entries ─── */}
              {entries.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="overflow-hidden">
                    <CardContent className="p-3.5">
                      <div className="flex items-center justify-between mb-2.5">
                        <h3 className="text-[12px] font-bold text-foreground flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          {t('toolsInternal.weightGain.recentEntries')}
                        </h3>
                        <span className="text-[10px] text-muted-foreground bg-muted/50 px-2.5 py-0.5 rounded-full font-semibold">
                          {entries.length} {t('toolsInternal.weightGain.reading')}
                        </span>
                      </div>
                      {/* Vertical Timeline */}
                      <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute start-[11px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-primary/40 via-primary/20 to-transparent rounded-full" />
                        
                        <div className="space-y-0.5">
                          {displayEntries.map((entry, i) => {
                            const gain = entry.weight - parseFloat(prePregnancyWeight || '0');
                            const expected = getExpectedGainForWeek(entry.week);
                            const isInRange = gain >= expected.min && gain <= expected.max;
                            const isFirst = i === 0;
                            return (
                              <motion.div
                                key={entry.id}
                                layout
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.06 }}
                                className="flex items-start gap-3 group relative"
                              >
                                {/* Timeline dot */}
                                <div className="relative z-10 mt-3 shrink-0">
                                  <motion.div 
                                    className={`w-6 h-6 rounded-full border-[2.5px] flex items-center justify-center ${
                                      isFirst 
                                        ? 'border-primary bg-primary/10 shadow-sm shadow-primary/20' 
                                        : isInRange 
                                          ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30' 
                                          : 'border-amber-400 bg-amber-50 dark:bg-amber-950/30'
                                    }`}
                                    initial={isFirst ? { scale: 0 } : {}}
                                    animate={isFirst ? { scale: [1, 1.15, 1] } : {}}
                                    transition={isFirst ? { duration: 2, repeat: Infinity } : {}}
                                  >
                                    <div className={`w-2 h-2 rounded-full ${isFirst ? 'bg-primary' : isInRange ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                  </motion.div>
                                </div>

                                {/* Content card */}
                                <div className={`flex-1 p-2.5 rounded-xl mb-1 transition-colors ${isFirst ? 'bg-primary/5 border border-primary/15' : 'bg-muted/30 border border-border/20 hover:bg-muted/50'}`}>
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <span className={`text-[11px] font-bold ${isFirst ? 'text-primary' : 'text-foreground'}`}>
                                        {t('toolsInternal.weightGain.week')} {entry.week}
                                      </span>
                                      <span className="text-[9px] text-muted-foreground ms-1.5">
                                        {new Date(entry.date).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[12px] font-black text-foreground">{entry.weight} kg</span>
                                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                        isInRange 
                                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' 
                                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                                      }`}>
                                        {gain >= 0 ? '+' : ''}{gain.toFixed(1)}
                                      </span>
                                      <button 
                                        onClick={() => removeEntry(entry.id)}
                                        className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground/40 hover:text-destructive transition-all"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                      {entries.length > 3 && (
                        <button
                          onClick={() => setShowAllEntries(!showAllEntries)}
                          className="w-full mt-2 py-2 text-[11px] font-medium text-primary hover:text-primary/80 flex items-center justify-center gap-1 transition-colors rounded-lg hover:bg-primary/5"
                        >
                          {showAllEntries ? (
                            <><ChevronUp className="w-3.5 h-3.5" /> {t('toolsInternal.weightGain.showLess', 'Show less')}</>
                          ) : (
                            <><ChevronDown className="w-3.5 h-3.5" /> {t('toolsInternal.weightGain.showAll', 'Show all')} ({entries.length})</>
                          )}
                        </button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* ─── Trimester Comparison ─── */}
              {entries.length >= 2 && (
                <TrimesterComparison
                  entries={entries}
                  prePregnancyWeight={parseFloat(prePregnancyWeight)}
                  currentTrimester={currentTrimester}
                  t={t}
                />
              )}

              {/* ─── AI Weight Analysis ─── */}
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

              {/* ─── Weight Distribution ─── */}
              <WeightDistributionCard t={t} />

              {/* ─── Medical Tip ─── */}
              <MedicalTipCard trimester={currentTrimester} t={t} />

            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* Always-visible sections (even before profile completion)       */}
        {/* ═══════════════════════════════════════════════════════════════ */}

        {/* ─── Enhanced Empty State ─── */}
        {entries.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="border-dashed border-2 border-primary/15 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <CardContent className="p-6 text-center space-y-4">
                <motion.div
                  animate={{ y: [0, -8, 0], rotate: [0, -3, 3, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Scale className="w-14 h-14 text-primary/25 mx-auto" />
                </motion.div>
                <div>
                  <p className="text-[14px] font-bold text-foreground">{t('toolsInternal.weightGain.noEntriesYet')}</p>
                  <p className="text-[11px] text-muted-foreground/60 max-w-[240px] mx-auto leading-relaxed mt-1">{t('toolsInternal.weightGain.noEntriesHint')}</p>
                </div>
                
                {/* Steps */}
                <div className="space-y-2 max-w-[250px] mx-auto">
                   {[
                     { num: 1, text: t('toolsInternal.weightGain.step1', 'Enter your height'), done: !!height },
                     { num: 2, text: t('toolsInternal.weightGain.step2', 'Enter your pre-pregnancy weight'), done: !!prePregnancyWeight },
                     { num: 3, text: t('toolsInternal.weightGain.step3', 'Log your first weight'), done: false },
                  ].map((step, i) => (
                    <motion.div 
                      key={step.num}
                      className={`flex items-center gap-3 p-2.5 rounded-xl text-start ${step.done ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/50' : 'bg-muted/30 border border-border/30'}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold ${step.done ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                        {step.done ? <CheckCircle className="w-4 h-4" /> : step.num}
                      </div>
                      <span className={`text-[11px] ${step.done ? 'text-emerald-700 dark:text-emerald-400 font-semibold line-through' : 'text-foreground/70 font-medium'}`}>
                        {step.text}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {profileComplete && (
                  <Button 
                    size="sm" 
                    className="mt-2 gap-2 rounded-xl shadow-md"
                    onClick={() => setShowAddForm(true)}
                  >
                    <Plus className="w-4 h-4" />
                    {t('toolsInternal.weightGain.addFirstEntry', 'Add first entry')}
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ─── Medical Tip (always visible) ─── */}
        <MedicalTipCard trimester={currentTrimester} t={t} />

        {/* ─── Weight Distribution (always visible) ─── */}
        <WeightDistributionCard t={t} />
      </div>
    </ToolFrame>
  );
}
