import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Scale, Plus, Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToolFrame } from '@/components/ToolFrame';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';

interface WeightEntry {
  id: string;
  date: string;
  weightKg: number;
  week: number;
}

const STORAGE_KEY = 'weight_gain_entries';

function loadEntries(): WeightEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: WeightEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function getGuidance(weeklyGain: number, t: (key: string) => string): { message: string; color: string; icon: React.ReactNode } {
  if (weeklyGain < 0.2) return {
    message: t('toolsInternal.weightGain.belowRange'),
    color: 'text-amber-600',
    icon: <TrendingDown className="w-4 h-4" />
  };
  if (weeklyGain <= 0.5) return {
    message: t('toolsInternal.weightGain.healthyRange'),
    color: 'text-emerald-600',
    icon: <TrendingUp className="w-4 h-4" />
  };
  return {
    message: t('toolsInternal.weightGain.aboveRange'),
    color: 'text-amber-600',
    icon: <TrendingUp className="w-4 h-4" />
  };
}

const SmartWeightGainAnalyzer: React.FC = () => {
  const { t } = useTranslation();
  const { currentWeek } = useUserProfile();
  const { toast } = useToast();
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [newWeight, setNewWeight] = useState('');

  useEffect(() => {
    setEntries(loadEntries());
  }, []);

  const addEntry = useCallback(() => {
    const weight = parseFloat(newWeight);
    if (isNaN(weight) || weight <= 0 || weight > 300) {
      toast({ title: t('common.error'), description: t('toolsInternal.weightGain.invalidWeight'), variant: 'destructive' });
      return;
    }
    const entry: WeightEntry = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      date: new Date().toISOString(),
      weightKg: weight,
      week: currentWeek || 1,
    };
    const updated = [...entries, entry];
    setEntries(updated);
    saveEntries(updated);
    setNewWeight('');
    toast({ title: t('toolsInternal.weightGain.added') });
  }, [newWeight, entries, currentWeek, toast, t]);

  const deleteEntry = useCallback((id: string) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    saveEntries(updated);
  }, [entries]);

  const analysis = useMemo(() => {
    if (entries.length < 2) return null;
    const sorted = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const totalGain = last.weightKg - first.weightKg;
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const weeks = Math.max((new Date(last.date).getTime() - new Date(first.date).getTime()) / msPerWeek, 0.1);
    const weeklyGain = totalGain / weeks;
    return { totalGain, weeklyGain, weeks, first, last };
  }, [entries]);

  const guidance = analysis ? getGuidance(analysis.weeklyGain, t) : null;

  return (
    <ToolFrame
      toolId="weight-gain"
      title={t('tools.weightGain.title', 'Weight Gain Analyzer')}
      subtitle={t('tools.weightGain.subtitle', 'Track and analyze your pregnancy weight gain')}
      icon={<Scale className="w-5 h-5" />}
    >
      <div className="space-y-4">
        {/* Add Weight Entry */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {t('toolsInternal.weightGain.addEntry', 'Add Weight')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                type="number"
                step="0.1"
                min="30"
                max="300"
                placeholder={t('toolsInternal.weightGain.weightPlaceholder', 'Weight in kg')}
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addEntry()}
              />
              <Button onClick={addEntry} size="sm">
                <Plus className="w-4 h-4 me-1" />
                {t('common.add', 'Add')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analysis */}
        {analysis && guidance && (
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {t('toolsInternal.weightGain.analysis', 'Analysis')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-foreground">{analysis.totalGain.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">{t('toolsInternal.weightGain.totalKg', 'Total kg')}</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-foreground">{analysis.weeklyGain.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">{t('toolsInternal.weightGain.kgPerWeek', 'kg/week')}</div>
                </div>
              </div>
              <div className={`flex items-center gap-2 text-sm ${guidance.color}`}>
                {guidance.icon}
                <span>{guidance.message}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* History */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {t('toolsInternal.weightGain.history', 'History')}
              {entries.length > 0 && <span className="text-muted-foreground font-normal ms-2">({entries.length})</span>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {entries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('toolsInternal.weightGain.noEntries', 'No weight entries yet. Add your first one above.')}
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {[...entries].reverse().map(entry => (
                  <div key={entry.id} className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-lg">
                    <div>
                      <span className="font-medium text-foreground">{entry.weightKg} kg</span>
                      <span className="text-xs text-muted-foreground ms-2">
                        {t('toolsInternal.weightGain.week', 'Week')} {entry.week}
                      </span>
                      <div className="text-xs text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString()}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteEntry(entry.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
};

export default SmartWeightGainAnalyzer;
