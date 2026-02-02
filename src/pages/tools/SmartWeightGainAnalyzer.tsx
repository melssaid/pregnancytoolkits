import React, { useState, useEffect, useCallback } from 'react';
import { ToolFrame } from '@/components/ToolFrame';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scale, TrendingUp, AlertCircle, CheckCircle, Target } from 'lucide-react';
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
  category: string;
}

const BMI_WEIGHT_GAIN: Record<string, WeightRange> = {
  underweight: { min: 12.7, max: 18.1, category: 'Underweight (BMI < 18.5)' },
  normal: { min: 11.3, max: 15.9, category: 'Normal (BMI 18.5-24.9)' },
  overweight: { min: 6.8, max: 11.3, category: 'Overweight (BMI 25-29.9)' },
  obese: { min: 5.0, max: 9.1, category: 'Obese (BMI ≥ 30)' },
};

export default function SmartWeightGainAnalyzer() {
  const [prePregnancyWeight, setPrePregnancyWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [currentWeight, setCurrentWeight] = useState<string>('');
  const [currentWeek, setCurrentWeek] = useState<string>('');
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [bmiCategory, setBmiCategory] = useState<string>('normal');

  useEffect(() => {
    const saved = localStorage.getItem('weightGainEntries');
    if (saved) setEntries(JSON.parse(saved));
    
    const savedProfile = localStorage.getItem('weightGainProfile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setPrePregnancyWeight(profile.prePregnancyWeight || '');
      setHeight(profile.height || '');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('weightGainEntries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    if (prePregnancyWeight && height) {
      const weightKg = parseFloat(prePregnancyWeight);
      const heightM = parseFloat(height) / 100;
      const bmi = weightKg / (heightM * heightM);
      
      if (bmi < 18.5) setBmiCategory('underweight');
      else if (bmi < 25) setBmiCategory('normal');
      else if (bmi < 30) setBmiCategory('overweight');
      else setBmiCategory('obese');
      
      localStorage.setItem('weightGainProfile', JSON.stringify({
        prePregnancyWeight,
        height,
      }));
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
        message: 'Your weight gain is below the recommended range.',
        recommendation: 'Consider consulting your healthcare provider about nutrition.',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50 border-yellow-200',
      };
    } else if (totalGain > expected.max) {
      return {
        status: 'above',
        message: 'Your weight gain is above the recommended range.',
        recommendation: 'Discuss with your doctor about healthy eating habits.',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 border-orange-200',
      };
    }
    return {
      status: 'normal',
      message: 'Your weight gain is within the healthy range!',
      recommendation: 'Keep up the good work with balanced nutrition.',
      color: 'text-green-600',
      bgColor: 'bg-green-50 border-green-200',
    };
  };

  const range = getRecommendedRange();
  const status = getStatus();

  return (
    <ToolFrame 
      title="Smart Weight Gain Analyzer" 
      subtitle="Track and analyze your pregnancy weight gain"
      customIcon="weight-scale"
      mood="calm"
      toolId="weight-gain"
    >
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              Your Profile
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="height">Height (cm)</Label>
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
                <Label htmlFor="preWeight">Pre-Pregnancy Weight (kg)</Label>
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
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-900">BMI Category:</span> {range.category}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium text-gray-900">Recommended Total Gain:</span> {range.min} - {range.max} kg
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">Add Weight Entry</h3>
            
            <div className="space-y-4">
              <WeekSlider
                week={parseInt(currentWeek) || 20}
                onChange={(week) => setCurrentWeek(week.toString())}
                showCard={false}
                showTrimester={false}
                label="Pregnancy Week"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 mt-4">
              <div>
                <Label htmlFor="weight">Current Weight (kg)</Label>
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
              Add Entry
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
                  <p className="text-sm text-gray-600 mt-1">{status.recommendation}</p>
                  <p className="text-sm font-medium mt-2">
                    Total Weight Gain: {getTotalGain().toFixed(1)} kg
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
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Weight Gain Trend
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                    <XAxis 
                      dataKey="week" 
                      tick={{ fontSize: 11 }}
                      label={{ value: 'Week', position: 'insideBottom', offset: -5, fontSize: 12 }}
                    />
                    <YAxis 
                      tick={{ fontSize: 11 }}
                      label={{ value: 'Weight Gain (kg)', angle: -90, position: 'insideLeft', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number | null) => value !== null ? `${value.toFixed(1)} kg` : 'N/A'}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="expectedMax" 
                      stroke="none"
                      fill="#a855f7"
                      fillOpacity={0.1}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="expectedMin" 
                      stroke="none"
                      fill="#ffffff"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expectedMin" 
                      stroke="#a855f7" 
                      strokeDasharray="5 5"
                      strokeWidth={1}
                      dot={false}
                      name="Min Recommended"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expectedMax" 
                      stroke="#a855f7" 
                      strokeDasharray="5 5"
                      strokeWidth={1}
                      dot={false}
                      name="Max Recommended"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="#9333ea" 
                      strokeWidth={2}
                      dot={{ fill: '#9333ea', strokeWidth: 2, r: 4 }}
                      connectNulls
                      name="Your Weight"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">
                Shaded area shows the recommended weight gain range
              </p>
            </CardContent>
          </Card>
        )}

        {entries.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Entries</h3>
              <div className="space-y-2">
                {entries.slice(-5).reverse().map((entry) => (
                  <div key={entry.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">Week {entry.week}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold">{entry.weight} kg</span>
                      <span className="text-sm text-gray-500 ml-2">
                        (+{(entry.weight - parseFloat(prePregnancyWeight || '0')).toFixed(1)} kg)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolFrame>
  );
}
