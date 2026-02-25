import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserProfile } from '@/hooks/useUserProfile';
import { ToolFrame } from '@/components/ToolFrame';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scale, TrendingUp, AlertCircle, CheckCircle, Target } from 'lucide-react';
import { RelatedToolLinks } from '@/components/RelatedToolLinks';
import { WeekSlider } from '@/components/WeekSlider';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from 'recharts';

interface WeightEntry {
  id: string;
  date: string;
  weight: number;
  week: number;
}

interface WeightRange {
  min: number;
  max: number;
  categoryKey: string;
}

const BMI_WEIGHT_GAIN: Record<string, WeightRange> = {
  underweight: { min: 12.7, max: 18.1, categoryKey: 'underweight' },
  normal: { min: 11.3, max: 15.9, categoryKey: 'normal' },
  overweight: { min: 6.8, max: 11.3, categoryKey: 'overweight' },
  obese: { min: 5.0, max: 9.1, categoryKey: 'obese' },
};

export default function SmartWeightGainAnalyzer() {
  const { t } = useTranslation();
  const { profile: userProfile, updateProfile: updateUserProfile } = useUserProfile();
  const [prePregnancyWeight, setPrePregnancyWeightState] = useState<string>('');
  const [height, setHeightState] = useState<string>('');
  const [currentWeight, setCurrentWeight] = useState<string>('');
  const [currentWeek, setCurrentWeek] = useState<string>('');
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [bmiCategory, setBmiCategory] = useState<string>('normal');

  // Load from central profile + legacy entries
  useEffect(() => {
    const saved = localStorage.getItem('weightGainEntries');
    if (saved) setEntries(JSON.parse(saved));

    if (userProfile.prePregnancyWeight) {
      setPrePregnancyWeightState(String(userProfile.prePregnancyWeight));
    }
    if (userProfile.height) {
      setHeightState(String(userProfile.height));
    }
    if (userProfile.pregnancyWeek) {
      setCurrentWeek(String(userProfile.pregnancyWeek));
    }
    if (userProfile.weight) {
      setCurrentWeight(String(userProfile.weight));
    }
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
      const weightKg = parseFloat(prePregnancyWeight);
      const heightM = parseFloat(height) / 100;
      const bmi = weightKg / (heightM * heightM);
      
      if (bmi < 18.5) setBmiCategory('underweight');
      else if (bmi < 25) setBmiCategory('normal');
      else if (bmi < 30) setBmiCategory('overweight');
      else setBmiCategory('obese');
    }
  }, [prePregnancyWeight, height]);

  const addEntry = () => {
    if (!currentWeight || !currentWeek) return;
    
    const entry: WeightEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      weight: parseFloat(currentWeight),
      week: parseInt(currentWeek),
    };
    
    // Save current weight to central profile
    const kg = parseFloat(currentWeight);
    if (!isNaN(kg)) updateUserProfile({ weight: kg, pregnancyWeek: parseInt(currentWeek) });

    setEntries([...entries, entry].sort((a, b) => a.week - b.week));
    setCurrentWeight('');
  };

  const getRecommendedRange = () => {
    return BMI_WEIGHT_GAIN[bmiCategory];
  };

  const getTotalGain = () => {
    if (entries.length === 0 || !prePregnancyWeight) return 0;
    const latestWeight = entries[entries.length - 1].weight;
    return latestWeight - parseFloat(prePregnancyWeight);
  };

  const getExpectedGainForWeek = (week: number) => {
    const range = getRecommendedRange();
    if (week <= 13) {
      return {
        min: (range.min / 40) * week * 0.5,
        max: (range.max / 40) * week * 0.8,
      };
    }
    const firstTrimesterMin = range.min * 0.1;
    const firstTrimesterMax = range.max * 0.15;
    const weeklyRateMin = (range.min - firstTrimesterMin) / 27;
    const weeklyRateMax = (range.max - firstTrimesterMax) / 27;
    
    return {
      min: firstTrimesterMin + weeklyRateMin * (week - 13),
      max: firstTrimesterMax + weeklyRateMax * (week - 13),
    };
  };

  const getChartData = () => {
    const data = [];
    for (let week = 1; week <= 40; week++) {
      const expected = getExpectedGainForWeek(week);
      const entry = entries.find(e => e.week === week);
      data.push({
        week,
        expectedMin: expected.min,
        expectedMax: expected.max,
        actual: entry ? entry.weight - parseFloat(prePregnancyWeight || '0') : null,
      });
    }
    return data;
  };

  const getStatus = () => {
    if (entries.length === 0 || !prePregnancyWeight) return null;
    
    const latestEntry = entries[entries.length - 1];
    const totalGain = getTotalGain();
    const expected = getExpectedGainForWeek(latestEntry.week);
    
    if (totalGain < expected.min) {
      return {
        status: 'below',
        message: t('toolsInternal.weightGain.statusMessages.below.message'),
        recommendation: t('toolsInternal.weightGain.statusMessages.below.recommendation'),
        color: 'text-warning',
        bgColor: 'bg-warning/10 border-warning/20',
      };
    } else if (totalGain > expected.max) {
      return {
        status: 'above',
        message: t('toolsInternal.weightGain.statusMessages.above.message'),
        recommendation: t('toolsInternal.weightGain.statusMessages.above.recommendation'),
        color: 'text-destructive',
        bgColor: 'bg-destructive/10 border-destructive/20',
      };
    }
    return {
      status: 'normal',
      message: t('toolsInternal.weightGain.statusMessages.normal.message'),
      recommendation: t('toolsInternal.weightGain.statusMessages.normal.recommendation'),
      color: 'text-success',
      bgColor: 'bg-success/10 border-success/20',
    };
  };

  const range = getRecommendedRange();
  const status = getStatus();

  return (
    <ToolFrame 
      title={t('toolsInternal.weightGain.title')}
      subtitle={t('toolsInternal.weightGain.subtitle')}
      customIcon="weight-scale"
      mood="calm"
      toolId="weight-gain"
    >
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Target className="w-4 h-4 text-primary shrink-0" />
              <span className="leading-snug">{t('toolsInternal.weightGain.yourProfile')}</span>
            </h3>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="height" className="text-xs">{t('toolsInternal.weightGain.heightCm')}</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="165"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="preWeight" className="text-xs">{t('toolsInternal.weightGain.prePregnancyWeightKg')}</Label>
                <Input
                  id="preWeight"
                  type="number"
                  placeholder="60"
                  value={prePregnancyWeight}
                  onChange={(e) => setPrePregnancyWeight(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            
            {prePregnancyWeight && height && (
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm text-foreground">
                  <span className="font-medium">{t('toolsInternal.weightGain.bmiCategory')}:</span> {t(`toolsInternal.weightGain.bmiCategories.${range.categoryKey}`)}
                </p>
                <p className="text-sm text-foreground mt-1">
                  <span className="font-medium">{t('toolsInternal.weightGain.recommendedTotalGain')}:</span> {range.min} - {range.max} kg
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">{t('toolsInternal.weightGain.addWeightEntry')}</h3>
            
            <div className="space-y-4">
              <WeekSlider
                week={parseInt(currentWeek) || 20}
                onChange={(week) => setCurrentWeek(week.toString())}
                showCard={false}
                showTrimester={false}
                label={t('toolsInternal.weightGain.pregnancyWeek')}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 mt-4">
              <div>
                <Label htmlFor="weight">{t('toolsInternal.weightGain.currentWeightKg')}</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="62.5"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            
            <Button onClick={addEntry} className="w-full" disabled={!currentWeight || !currentWeek}>
              {t('toolsInternal.weightGain.addEntry')}
            </Button>
          </CardContent>
        </Card>

        {status && (
          <Card>
            <CardContent className={`p-6 ${status.bgColor} border rounded-lg`}>
              <div className="flex items-start gap-3">
                {status.status === 'normal' ? (
                  <CheckCircle className={`w-6 h-6 ${status.color}`} />
                ) : (
                  <AlertCircle className={`w-6 h-6 ${status.color}`} />
                )}
                <div>
                  <p className={`font-semibold ${status.color}`}>{status.message}</p>
                  <p className="text-sm text-muted-foreground mt-1">{status.recommendation}</p>
                  <p className="text-sm font-medium mt-2">
                    {t('toolsInternal.weightGain.totalWeightGainLabel')}: {getTotalGain().toFixed(1)} kg
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {entries.length > 0 && prePregnancyWeight && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                {t('toolsInternal.weightGain.weightGainTrend')}
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="week" 
                      tick={{ fontSize: 11 }}
                      label={{ value: t('toolsInternal.weightGain.weekAxis'), position: 'insideBottom', offset: -5, fontSize: 12 }}
                    />
                    <YAxis 
                      tick={{ fontSize: 11 }}
                      label={{ value: t('toolsInternal.weightGain.weightGainKg'), angle: -90, position: 'insideLeft', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number | null) => value !== null ? `${value.toFixed(1)} kg` : 'N/A'}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="expectedMax" 
                      stroke="none"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.1}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="expectedMin" 
                      stroke="none"
                      fill="hsl(var(--background))"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expectedMin" 
                      stroke="hsl(var(--primary))" 
                      strokeDasharray="5 5"
                      strokeWidth={1}
                      dot={false}
                      name={t('toolsInternal.weightGain.minRecommended')}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expectedMax" 
                      stroke="hsl(var(--primary))" 
                      strokeDasharray="5 5"
                      strokeWidth={1}
                      dot={false}
                      name={t('toolsInternal.weightGain.maxRecommended')}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                      connectNulls
                      name={t('toolsInternal.weightGain.yourWeight')}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                {t('toolsInternal.weightGain.chartNote')}
              </p>
            </CardContent>
          </Card>
        )}

        {entries.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">{t('toolsInternal.weightGain.recentEntries')}</h3>
              <div className="space-y-2">
                {entries.slice(-5).reverse().map((entry) => (
                  <div key={entry.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div>
                      <span className="font-medium">{t('toolsInternal.weightGain.week')} {entry.week}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold">{entry.weight} kg</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        (+{(entry.weight - parseFloat(prePregnancyWeight || '0')).toFixed(1)} kg)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Related Tools */}
        <RelatedToolLinks links={[
          { to: "/tools/fetal-growth", titleKey: "toolsInternal.weightGain.fetalDevLink", titleFallback: "Fetal Development", descKey: "toolsInternal.weightGain.fetalDevLinkDesc", descFallback: "Track your baby's growth week by week", icon: "ruler" },
          { to: "/tools/kick-counter", titleKey: "toolsInternal.weightGain.kickCounterLink", titleFallback: "Kick Counter", descKey: "toolsInternal.weightGain.kickCounterLinkDesc", descFallback: "Track your baby's movements", icon: "activity" },
          { to: "/tools/ai-meal-suggestion", titleKey: "toolsInternal.weightGain.mealSuggestionLink", titleFallback: "Meal Suggestions", descKey: "toolsInternal.weightGain.mealSuggestionLinkDesc", descFallback: "Get healthy meal ideas", icon: "utensils" },
        ]} />
      </div>
    </ToolFrame>
  );
}