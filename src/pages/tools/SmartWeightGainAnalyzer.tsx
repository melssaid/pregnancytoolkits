import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserProfile } from '@/hooks/useUserProfile';
import { ToolFrame } from '@/components/ToolFrame';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Scale, TrendingUp, AlertCircle, CheckCircle, Target, Plus, Ruler, Weight, Trash2 } from 'lucide-react';
import { RelatedToolLinks } from '@/components/RelatedToolLinks';
import { WeekSlider } from '@/components/WeekSlider';
import {
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  ReferenceLine,
} from 'recharts';

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

  // Load from profile + localStorage
  useEffect(() => {
    const saved = localStorage.getItem('weightGainEntries');
    if (saved) setEntries(JSON.parse(saved));
    if (userProfile.prePregnancyWeight) setPrePregnancyWeightState(String(userProfile.prePregnancyWeight));
    if (userProfile.height) setHeightState(String(userProfile.height));
    if (userProfile.pregnancyWeek) setCurrentWeek(String(userProfile.pregnancyWeek));
    if (userProfile.weight) setCurrentWeight(String(userProfile.weight));
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
    // Also add entries at odd weeks
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

  const statusConfig = {
    below:  { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', label: t('toolsInternal.weightGain.statusMessages.below.message') },
    above:  { icon: AlertCircle, color: 'text-red-500',   bg: 'bg-red-50 border-red-200',     label: t('toolsInternal.weightGain.statusMessages.above.message') },
    normal: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', label: t('toolsInternal.weightGain.statusMessages.normal.message') },
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const actual = payload.find((p: any) => p.dataKey === 'actual');
    const min = payload.find((p: any) => p.dataKey === 'min');
    const max = payload.find((p: any) => p.dataKey === 'max');
    return (
      <div className="bg-card border border-border rounded-xl p-3 shadow-lg text-xs space-y-1">
        <p className="font-bold text-foreground">{t('toolsInternal.weightGain.week')} {label}</p>
        {actual?.value != null && (
          <p className="text-primary font-semibold">⚖️ {actual.value.toFixed(1)} kg</p>
        )}
        <p className="text-muted-foreground">
          📊 {min?.value?.toFixed(1)} – {max?.value?.toFixed(1)} kg
        </p>
      </div>
    );
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

        {/* ─── Section 1: Profile Setup (compact 2-col) ─── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
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

          {/* BMI Badge */}
          {profileComplete && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="mt-3 flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Scale className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">{t('toolsInternal.weightGain.bmiCategory')}</p>
                  <p className="text-sm font-bold text-foreground">{t(`toolsInternal.weightGain.bmiCategories.${range.categoryKey}`)}</p>
                </div>
              </div>
              <div className="text-end">
                <p className="text-[11px] text-muted-foreground">{t('toolsInternal.weightGain.recommendedTotalGain')}</p>
                <p className="text-sm font-bold text-primary">{range.min}–{range.max} kg</p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* ─── Section 2: Add Weight Entry ─── */}
        {profileComplete && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-dashed border-primary/20">
              <CardContent className="p-4 space-y-3">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Plus className="w-4 h-4 text-primary" />
                  {t('toolsInternal.weightGain.addWeightEntry')}
                </h3>
                
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
                    className="h-10 px-6"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ─── Section 3: Quick Stats ─── */}
        {status && entries.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="grid grid-cols-3 gap-2">
              {/* Total Gain */}
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 text-center">
                <p className="text-[10px] text-muted-foreground">{t('toolsInternal.weightGain.totalWeightGainLabel')}</p>
                <p className="text-lg font-bold text-primary mt-0.5">{totalGain >= 0 ? '+' : ''}{totalGain.toFixed(1)}</p>
                <p className="text-[10px] text-muted-foreground">kg</p>
              </div>
              {/* Entries Count */}
              <div className="p-3 rounded-xl bg-accent/30 border border-accent/20 text-center">
                <p className="text-[10px] text-muted-foreground">{t('toolsInternal.weightGain.recentEntries')}</p>
                <p className="text-lg font-bold text-foreground mt-0.5">{entries.length}</p>
                <p className="text-[10px] text-muted-foreground">{t('toolsInternal.weightGain.week')}</p>
              </div>
              {/* Status */}
              <div className={`p-3 rounded-xl border text-center ${statusConfig[status].bg}`}>
                <p className="text-[10px] text-muted-foreground">{t('toolsInternal.weightGain.statusLabel', 'الحالة')}</p>
                {React.createElement(statusConfig[status].icon, { className: `w-5 h-5 mx-auto mt-0.5 ${statusConfig[status].color}` })}
                <p className={`text-[10px] font-semibold mt-0.5 ${statusConfig[status].color}`}>
                  {statusConfig[status].label}
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

        {/* ─── Section 4: Chart ─── */}
        {entries.length > 0 && profileComplete && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardContent className="p-4 pt-5">
                <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  {t('toolsInternal.weightGain.weightGainTrend')}
                </h3>
                <div className="h-56 -mx-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                      <defs>
                        <linearGradient id="rangeGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.12} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.03} />
                        </linearGradient>
                        <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>

                      <XAxis
                        dataKey="week"
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                        tickLine={false}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        interval={3}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                        tickLine={false}
                        axisLine={false}
                        width={35}
                        unit=" kg"
                      />
                      <Tooltip content={<CustomTooltip />} />
                      
                      <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="3 3" />

                      {/* Recommended range band */}
                      <Area
                        type="monotone"
                        dataKey="max"
                        stroke="hsl(var(--primary)/0.25)"
                        strokeWidth={1}
                        strokeDasharray="4 4"
                        fill="url(#rangeGrad)"
                        dot={false}
                        activeDot={false}
                        name={t('toolsInternal.weightGain.maxRecommended')}
                      />
                      <Area
                        type="monotone"
                        dataKey="min"
                        stroke="hsl(var(--primary)/0.25)"
                        strokeWidth={1}
                        strokeDasharray="4 4"
                        fill="hsl(var(--background))"
                        dot={false}
                        activeDot={false}
                        name={t('toolsInternal.weightGain.minRecommended')}
                      />

                      {/* Actual weight gain line */}
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2.5}
                        dot={{ fill: 'hsl(var(--primary))', r: 3.5, strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                        activeDot={{ r: 5, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                        connectNulls
                        name={t('toolsInternal.weightGain.yourWeight')}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-5 mt-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="w-6 h-[2.5px] rounded-full bg-primary inline-block" />
                    {t('toolsInternal.weightGain.yourWeight')}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-6 h-3 rounded bg-primary/10 border border-primary/20 inline-block" />
                    {t('toolsInternal.weightGain.chartNote')}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ─── Section 5: Recent Entries ─── */}
        {entries.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <h3 className="text-sm font-bold text-foreground mb-2">{t('toolsInternal.weightGain.recentEntries')}</h3>
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

        {/* Related Tools */}
        <RelatedToolLinks links={[
          { to: "/tools/fetal-growth", titleKey: "toolsInternal.weightGain.fetalDevLink", titleFallback: "Fetal Development", descKey: "toolsInternal.weightGain.fetalDevLinkDesc", descFallback: "Track your baby's growth week by week", icon: "ruler" },
          { to: "/tools/kick-counter", titleKey: "toolsInternal.weightGain.kickCounterLink", titleFallback: "Kick Counter", descKey: "toolsInternal.weightGain.kickCounterLinkDesc", descFallback: "Track your baby's movements", icon: "activity" },
          { to: "/tools/ai-bump-photos", titleKey: "toolsInternal.weightGain.bumpPhotosLink", titleFallback: "Bump Photos", descKey: "toolsInternal.weightGain.bumpPhotosLinkDesc", descFallback: "AI-powered ultrasound analysis", icon: "baby" },
        ]} />
      </div>
    </ToolFrame>
  );
}
