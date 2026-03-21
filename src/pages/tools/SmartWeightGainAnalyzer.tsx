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
  TrendingUp, CheckCircle, Plus, Trash2,
  Save, Calendar, Activity, Gauge, Ruler, Baby,
  ArrowUp, ArrowDown, ChevronDown, ChevronUp, X, Info, Target, Sparkles
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
import { WhenToCallDoctorCard, EvidenceInfoBlock } from '@/components/safety';

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
    const sanitized = val.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    setPrePregnancyWeightState(sanitized);
    const kg = parseFloat(sanitized);
    if (!isNaN(kg) && kg > 0) updateUserProfile({ prePregnancyWeight: kg });
  };

  const setHeight = (val: string) => {
    const sanitized = val.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    setHeightState(sanitized);
    const cm = parseFloat(sanitized);
    if (!isNaN(cm) && cm > 0) updateUserProfile({ height: cm });
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

  const statusConfig: Record<string, { icon: any; color: string; bg: string; text: string; borderColor: string }> = {
    below:  { icon: ArrowDown, color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-900 dark:text-amber-200', borderColor: 'border-amber-300 dark:border-amber-800' },
    above:  { icon: ArrowUp, color: 'text-red-700 dark:text-red-300', bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-900 dark:text-red-200', borderColor: 'border-red-300 dark:border-red-800' },
    normal: { icon: CheckCircle, color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-900 dark:text-emerald-200', borderColor: 'border-emerald-300 dark:border-emerald-800' },
  };

  const handleStartAnalysis = () => {
    if (profileComplete) {
      setShowAnalysis(true);
      setShowAddForm(true);
    }
  };

  const displayEntries = showAllEntries ? [...entries].reverse() : entries.slice(-3).reverse();

  // Computed hints
  const step1Done = !!height;
  const step2Done = !!prePregnancyWeight;
  const step3Done = entries.length > 0;

  return (
    <ToolFrame 
      title={t('toolsInternal.weightGain.title')}
      subtitle={t('toolsInternal.weightGain.subtitle')}
      customIcon="weight-scale"
      mood="calm"
      toolId="weight-gain"
    >
      <div className="space-y-3">

        {/* ═══ GUIDED FLOW: Step Indicator ═══ */}
        {!step3Done && (
          <motion.div 
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5 px-1"
          >
            {[
              { done: step1Done, label: t('toolsInternal.weightGain.step1Short', 'الطول'), icon: Ruler },
              { done: step2Done, label: t('toolsInternal.weightGain.step2Short', 'الوزن'), icon: Gauge },
              { done: step3Done, label: t('toolsInternal.weightGain.step3Short', 'التسجيل'), icon: Plus },
            ].map((step, i) => (
              <React.Fragment key={i}>
                <motion.div
                  animate={!step.done && (i === 0 ? true : [step1Done, step2Done][i-1]) ? { scale: [1, 1.08, 1] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                    step.done 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' 
                      : (!step.done && (i === 0 || [step1Done, step2Done][i-1]))
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'bg-muted/40 text-muted-foreground/50'
                  }`}
                >
                  {step.done ? <CheckCircle className="w-3 h-3" /> : <step.icon className="w-3 h-3" />}
                  {step.label}
                </motion.div>
                {i < 2 && (
                  <div className={`w-4 h-px ${step.done ? 'bg-emerald-300 dark:bg-emerald-700' : 'bg-border/30'}`} />
                )}
              </React.Fragment>
            ))}
          </motion.div>
        )}

        {/* ═══ STEP 1 & 2: Profile Setup ═══ */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-primary/15 overflow-hidden">
            <div className="h-0.5 bg-gradient-to-r from-primary/30 via-primary to-primary/30" />
            
            <CardContent className="p-3 space-y-3">
              {/* Inputs with inline hints */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Height */}
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                    <Ruler className="w-3 h-3 text-primary/60" />
                    {t('toolsInternal.weightGain.heightCm')}
                  </Label>
                  <div className="relative">
                    <Input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]*\.?[0-9]*"
                      placeholder="165"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className={`h-14 text-center font-black text-lg rounded-xl transition-all ${
                        step1Done 
                          ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/10' 
                          : 'border-primary/30 bg-primary/5 ring-2 ring-primary/10'
                      }`}
                    />
                    <span className="absolute end-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/50 font-bold">cm</span>
                    {step1Done && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -end-1">
                        <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-100" />
                      </motion.div>
                    )}
                  </div>
                  {!step1Done && (
                    <motion.p 
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-[9px] text-primary/70 text-center font-medium"
                    >
                      👆 {t('toolsInternal.weightGain.heightHint', 'أدخلي طولك هنا')}
                    </motion.p>
                  )}
                </div>

                {/* Pre-pregnancy weight */}
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                    <Gauge className="w-3 h-3 text-primary/60" />
                    {t('toolsInternal.weightGain.prePregnancyWeightKg')}
                  </Label>
                  <div className="relative">
                    <Input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]*\.?[0-9]*"
                      placeholder="60"
                      value={prePregnancyWeight}
                      onChange={(e) => setPrePregnancyWeight(e.target.value)}
                      className={`h-14 text-center font-black text-lg rounded-xl transition-all ${
                        step2Done 
                          ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/10' 
                          : step1Done 
                            ? 'border-primary/30 bg-primary/5 ring-2 ring-primary/10' 
                            : 'border-border/50 bg-muted/20'
                      }`}
                    />
                    <span className="absolute end-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/50 font-bold">kg</span>
                    {step2Done && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -end-1">
                        <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-100" />
                      </motion.div>
                    )}
                  </div>
                  {step1Done && !step2Done && (
                    <motion.p 
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-[9px] text-primary/70 text-center font-medium"
                    >
                      👆 {t('toolsInternal.weightGain.weightHint', 'الوزن قبل الحمل')}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* BMI Result — appears after both inputs */}
              <AnimatePresence>
                {profileComplete && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2.5 overflow-hidden"
                  >
                    {/* BMI Badge */}
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/10">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex flex-col items-center justify-center shrink-0 shadow-sm">
                        <span className="text-base font-black text-primary leading-none">{bmi.toFixed(1)}</span>
                        <span className="text-[7px] text-primary/50 font-bold uppercase">BMI</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-[11px] font-bold text-foreground">{t(`toolsInternal.weightGain.bmiCategories.${range.categoryKey}`)}</p>
                          <Info className="w-3 h-3 text-muted-foreground/40" />
                        </div>
                        <p className="text-[9px] text-muted-foreground mt-0.5">
                          {t('toolsInternal.weightGain.recommendedTotalGain')}: 
                          <span className="font-bold text-primary ms-1">{range.min}–{range.max} kg</span>
                        </p>
                      </div>
                    </div>

                    <BMIScaleBar bmi={bmi} t={t} />

                    {/* CTA: Start Analysis — only if not started */}
                    {!showAnalysis && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Button 
                          onClick={handleStartAnalysis}
                          className="w-full h-12 text-[13px] font-bold gap-2 rounded-xl shadow-md shadow-primary/15"
                        >
                          <Sparkles className="w-4 h-4" />
                          {t('toolsInternal.weightGain.startAnalysis')}
                        </Button>
                        <p className="text-[9px] text-muted-foreground/60 text-center mt-1.5">
                          {t('toolsInternal.weightGain.startAnalysisHint', 'سنساعدك في تتبع وزنك طوال فترة الحمل')}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* ═══ STEP 3: Analysis Dashboard ═══ */}
        <AnimatePresence>
          {showAnalysis && profileComplete && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="space-y-2.5"
            >

              {/* ─── Add Weight CTA ─── */}
              {!showAddForm && (
                <motion.button 
                  onClick={() => setShowAddForm(true)}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-3.5 rounded-xl bg-gradient-to-r from-primary via-primary/95 to-primary/85 text-primary-foreground flex items-center gap-3 shadow-lg shadow-primary/20"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary-foreground/15 flex items-center justify-center shrink-0">
                    <Plus className="w-5 h-5" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 text-start min-w-0">
                    <p className="text-[13px] font-bold truncate">
                      {entries.length === 0 
                        ? t('toolsInternal.weightGain.addFirstWeight', 'سجّلي وزنك الحالي')
                        : t('toolsInternal.weightGain.saveWeight', 'سجّلي وزنك')
                      }
                    </p>
                    {lastEntry ? (
                      <p className="text-[10px] opacity-70 truncate">
                        {t('toolsInternal.weightGain.lastRecorded')}: {lastEntry.weight}kg · {t('toolsInternal.weightGain.week')} {lastEntry.week}
                      </p>
                    ) : (
                      <p className="text-[10px] opacity-70">
                        {t('toolsInternal.weightGain.addFirstWeightHint', 'ابدئي بتسجيل أول قراءة وزن')}
                      </p>
                    )}
                  </div>
                  {entries.length === 0 && (
                    <motion.div
                      animate={{ x: [0, -4, 0] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    >
                      <ArrowDown className="w-4 h-4 opacity-60 rotate-[-90deg] rtl:rotate-90" />
                    </motion.div>
                  )}
                </motion.button>
              )}

              {/* ─── Add Weight Form ─── */}
              <AnimatePresence mode="wait">
                {showAddForm && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="border-primary/20 shadow-md overflow-hidden">
                      <div className="h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
                      <CardContent className="p-3.5 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-[13px] font-bold text-foreground flex items-center gap-1.5">
                            <Gauge className="w-4 h-4 text-primary" />
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

                        {/* Expected range hint for selected week */}
                        {currentWeek && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted/30 border border-border/15"
                          >
                            <Target className="w-3 h-3 text-primary/60 shrink-0" />
                            <p className="text-[9px] text-muted-foreground">
                              {t('toolsInternal.weightGain.expectedForWeek', 'الزيادة المتوقعة للأسبوع')} {currentWeek}:
                              <span className="font-bold text-primary ms-1">
                                {getExpectedGainForWeek(parseInt(currentWeek)).min.toFixed(1)}–{getExpectedGainForWeek(parseInt(currentWeek)).max.toFixed(1)} kg
                              </span>
                            </p>
                          </motion.div>
                        )}

                        <div>
                          <Label className="text-[10px] text-muted-foreground font-semibold mb-1 block flex items-center gap-1">
                            <Gauge className="w-3 h-3 text-primary/60" />
                            {t('toolsInternal.weightGain.currentWeightKg')}
                          </Label>
                          <div className="relative">
                            <Input
                              type="text"
                              inputMode="decimal"
                              pattern="[0-9]*\.?[0-9]*"
                              step="0.1"
                              placeholder="62.5"
                              value={currentWeight}
                              onChange={(e) => {
                                const sanitized = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                                setCurrentWeight(sanitized);
                              }}
                              className="h-14 text-center text-lg font-black rounded-xl border-primary/30 bg-primary/5 ring-2 ring-primary/10 transition-all"
                            />
                            <span className="absolute end-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/50 font-bold">kg</span>
                          </div>
                          
                          {/* Live gain preview */}
                          {currentWeight && prePregnancyWeight && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="mt-1.5 text-center"
                            >
                              {(() => {
                                const gain = parseFloat(currentWeight) - parseFloat(prePregnancyWeight);
                                const expected = getExpectedGainForWeek(parseInt(currentWeek));
                                const inRange = gain >= expected.min && gain <= expected.max;
                                return (
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    inRange 
                                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                      : gain < expected.min
                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                                        : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                                  }`}>
                                    {inRange ? '✓' : gain < expected.min ? '↓' : '↑'} {gain >= 0 ? '+' : ''}{gain.toFixed(1)} kg {t('toolsInternal.weightGain.fromStart', 'من البداية')}
                                  </span>
                                );
                              })()}
                            </motion.div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            onClick={addEntry} 
                            disabled={!currentWeight || !currentWeek}
                            className="flex-1 h-12 text-[13px] font-bold gap-1.5 rounded-xl shadow-sm"
                          >
                            <Save className="w-4 h-4" />
                            {t('toolsInternal.weightGain.saveEntry', 'حفظ')}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setShowAddForm(false)}
                            className="h-12 px-5 rounded-xl text-[12px]"
                          >
                            {t('toolsInternal.weightGain.cancel', 'إلغاء')}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ═══ Stats Dashboard ═══ */}
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

              {entries.length > 0 && lastEntry && (
                <WeeklyGoalCard
                  currentWeek={lastEntry.week}
                  currentWeight={lastEntry.weight}
                  prePregnancyWeight={parseFloat(prePregnancyWeight)}
                  getExpectedGainForWeek={getExpectedGainForWeek}
                  t={t}
                />
              )}

              {/* ─── Status Banner ─── */}
              {status && entries.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-3 rounded-xl border ${statusConfig[status].borderColor} ${statusConfig[status].bg}`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    {React.createElement(statusConfig[status].icon, { className: `w-4 h-4 ${statusConfig[status].color}` })}
                    <span className={`text-[11px] font-bold ${statusConfig[status].color}`}>
                      {t(`toolsInternal.weightGain.statusMessages.${status}.message`)}
                    </span>
                  </div>
                  <p className={`text-[10px] ${statusConfig[status].text} leading-relaxed`}>
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
                <Card className="overflow-hidden">
                  <CardContent className="p-2.5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-primary" />
                        {t('toolsInternal.weightGain.recentEntries')}
                      </h3>
                      <span className="text-[9px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full font-semibold">
                        {entries.length}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {displayEntries.map((entry, i) => {
                        const gain = entry.weight - parseFloat(prePregnancyWeight || '0');
                        const expected = getExpectedGainForWeek(entry.week);
                        const isInRange = gain >= expected.min && gain <= expected.max;
                        const isFirst = i === 0;
                        return (
                          <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${isFirst ? 'bg-primary/5 border border-primary/10' : 'bg-muted/20 border border-border/10'}`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex flex-col items-center justify-center shrink-0 text-[8px] font-bold ${
                              isFirst ? 'bg-primary/10 text-primary' : isInRange ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                            }`}>
                              <span className="text-[11px] font-black leading-none">{entry.week}</span>
                              <span className="leading-none">{t('toolsInternal.weightGain.week').slice(0, 1)}</span>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-[12px] font-black text-foreground">{entry.weight} kg</span>
                                <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${
                                  isInRange 
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200' 
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200'
                                }`}>
                                  {gain >= 0 ? '+' : ''}{gain.toFixed(1)}
                                </span>
                              </div>
                              <span className="text-[8px] text-muted-foreground/60">
                                {new Date(entry.date).toLocaleDateString()}
                              </span>
                            </div>

                            <button 
                              onClick={() => removeEntry(entry.id)}
                              className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground/30 hover:text-destructive transition-all shrink-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>

                    {entries.length > 3 && (
                      <button
                        onClick={() => setShowAllEntries(!showAllEntries)}
                        className="w-full mt-1.5 py-1.5 text-[10px] font-medium text-primary flex items-center justify-center gap-1 rounded-lg hover:bg-primary/5 transition-colors"
                      >
                        {showAllEntries ? (
                          <><ChevronUp className="w-3 h-3" /> {t('toolsInternal.weightGain.showLess', 'عرض أقل')}</>
                        ) : (
                          <><ChevronDown className="w-3 h-3" /> {t('toolsInternal.weightGain.showAll', 'عرض الكل')} ({entries.length})</>
                        )}
                      </button>
                    )}
                  </CardContent>
                </Card>
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
                  icon={<TrendingUp className="w-4 h-4" />}
                />
              )}

              {/* ─── Weight Distribution ─── */}
              <WeightDistributionCard t={t} />

              {/* ─── Medical Tip ─── */}
              <MedicalTipCard trimester={currentTrimester} t={t} />

            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ Empty State — only when no analysis started ═══ */}
        {!showAnalysis && entries.length === 0 && profileComplete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="border-dashed border border-primary/15 overflow-hidden">
              <CardContent className="p-4 text-center space-y-2">
                <Baby className="w-8 h-8 text-primary/30 mx-auto" />
                <p className="text-[11px] text-muted-foreground/60 max-w-[220px] mx-auto leading-relaxed">
                  {t('toolsInternal.weightGain.noEntriesHint')}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ═══ Empty State — not profile complete ═══ */}
        {!profileComplete && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-dashed border border-border/30 overflow-hidden">
              <CardContent className="p-4 text-center space-y-2">
                <div className="text-2xl">⚖️</div>
                <p className="text-[12px] font-bold text-foreground">{t('toolsInternal.weightGain.noEntriesYet')}</p>
                <p className="text-[10px] text-muted-foreground/60 max-w-[220px] mx-auto leading-relaxed">
                  {t('toolsInternal.weightGain.fillProfileHint', 'أدخلي طولك ووزنك قبل الحمل أعلاه للبدء')}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

      </div>
    </ToolFrame>
  );
}
