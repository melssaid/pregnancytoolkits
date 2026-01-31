import React, { useState, useEffect } from 'react';
import { Pill, Check, Clock, Calendar, TrendingUp, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { VitaminService, UserProfileService } from '@/services/localStorageServices';

interface Vitamin {
  id: string;
  name: string;
  dosage: string;
  icon: string;
  color: string;
  importance: string;
}

const VITAMINS: Vitamin[] = [
  { id: 'folic-acid', name: 'Folic Acid', dosage: '400-800 mcg', icon: '🧬', color: 'bg-green-100 border-green-400', importance: 'Essential for neural development' },
  { id: 'iron', name: 'Iron', dosage: '27 mg', icon: '💪', color: 'bg-red-100 border-red-400', importance: 'Prevents anemia' },
  { id: 'calcium', name: 'Calcium', dosage: '1000 mg', icon: '🦴', color: 'bg-blue-100 border-blue-400', importance: 'For bone health' },
  { id: 'vitamin-d', name: 'Vitamin D', dosage: '600 IU', icon: '☀️', color: 'bg-yellow-100 border-yellow-400', importance: 'Calcium absorption' },
  { id: 'omega-3', name: 'Omega 3', dosage: '200-300 mg DHA', icon: '🐟', color: 'bg-cyan-100 border-cyan-400', importance: 'Baby brain development' },
  { id: 'prenatal', name: 'Prenatal Vitamins', dosage: 'As directed', icon: '💊', color: 'bg-purple-100 border-purple-400', importance: 'Complete & balanced' },
];

const VitaminTracker: React.FC = () => {
  const [todayLogs, setTodayLogs] = useState<any[]>([]);
  const [weekHistory, setWeekHistory] = useState<any[]>([]);
  const [currentWeek, setCurrentWeek] = useState(20);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const profile = await UserProfileService.get();
      if (profile?.pregnancy_week) {
        setCurrentWeek(profile.pregnancy_week);
      }
      
      const [today, history] = await Promise.all([
        VitaminService.getTodayLogs(),
        VitaminService.getHistory(7)
      ]);
      
      setTodayLogs(today);
      setWeekHistory(history);
      
    } catch (error: any) {
      console.error('Error loading vitamins:', error);
      toast({
        title: 'Loading Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTakeVitamin = async (vitamin: Vitamin) => {
    const alreadyTaken = todayLogs.some(log => log.vitamin_name === vitamin.name);
    if (alreadyTaken) {
      toast({
        title: 'Already Taken',
        description: `You already logged ${vitamin.name} today`,
      });
      return;
    }

    try {
      setSavingId(vitamin.id);
      
      const newLog = await VitaminService.log(vitamin.name, vitamin.dosage, currentWeek);
      
      setTodayLogs(prev => [...prev, newLog]);
      setWeekHistory(prev => [newLog, ...prev]);
      
      toast({
        title: 'Logged! ✅',
        description: `${vitamin.name} recorded successfully`
      });
      
    } catch (error: any) {
      toast({
        title: 'Failed to Log',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSavingId(null);
    }
  };

  const isVitaminTakenToday = (vitaminName: string) => {
    return todayLogs.some(log => log.vitamin_name === vitaminName);
  };

  const getWeeklyStats = () => {
    const stats: Record<string, number> = {};
    VITAMINS.forEach(v => {
      stats[v.name] = weekHistory.filter(log => log.vitamin_name === v.name).length;
    });
    return stats;
  };

  const getTodayProgress = () => {
    const taken = VITAMINS.filter(v => isVitaminTakenToday(v.name)).length;
    return Math.round((taken / VITAMINS.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your data...</p>
        </div>
      </div>
    );
  }

  const weeklyStats = getWeeklyStats();
  const todayProgress = getTodayProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Pill className="w-8 h-8" />
              💊 Vitamin Tracker
            </CardTitle>
            <p className="text-purple-100">
              Week {currentWeek} - Remember to take your vitamins daily!
            </p>
          </CardHeader>
        </Card>

        {/* Today's Progress */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                Today's Progress
              </span>
              <span className="text-2xl font-bold text-purple-600">{todayProgress}%</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${todayProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 text-center">
              {todayLogs.length} of {VITAMINS.length} vitamins taken today
            </p>
          </CardContent>
        </Card>

        {/* Vitamins Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {VITAMINS.map((vitamin) => {
            const taken = isVitaminTakenToday(vitamin.name);
            const isSaving = savingId === vitamin.id;
            const weekCount = weeklyStats[vitamin.name] || 0;
            
            return (
              <Card
                key={vitamin.id}
                className={`border-2 transition-all duration-300 hover:shadow-lg ${
                  taken
                    ? 'bg-green-50 border-green-400 shadow-green-100'
                    : vitamin.color
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{vitamin.icon}</span>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">{vitamin.name}</h3>
                        <p className="text-sm text-gray-600">{vitamin.dosage}</p>
                        <p className="text-xs text-gray-500 mt-1">{vitamin.importance}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center gap-2">
                      <Button
                        variant={taken ? 'default' : 'outline'}
                        size="sm"
                        className={taken ? 'bg-green-500 hover:bg-green-600' : 'hover:bg-purple-100'}
                        onClick={() => handleTakeVitamin(vitamin)}
                        disabled={taken || isSaving}
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : taken ? (
                          <><Check className="w-4 h-4 mr-1" /> Done</>
                        ) : (
                          'Take'
                        )}
                      </Button>
                      <span className="text-xs text-gray-500">
                        {weekCount}/7 this week
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Weekly Stats */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              Weekly Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {VITAMINS.map(vitamin => {
                const count = weeklyStats[vitamin.name] || 0;
                const percentage = Math.round((count / 7) * 100);
                
                return (
                  <div key={vitamin.id} className="text-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-2xl">{vitamin.icon}</span>
                    <p className="text-sm font-medium mt-1">{vitamin.name}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{count}/7 days</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent History */}
        {weekHistory.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-500" />
                Recent History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {weekHistory.slice(0, 10).map((log, index) => (
                  <div key={log.id || index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span>{VITAMINS.find(v => v.name === log.vitamin_name)?.icon || '💊'}</span>
                      <span className="font-medium">{log.vitamin_name}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(log.taken_at).toLocaleDateString('en-US', {
                        weekday: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-4">
            <h3 className="font-bold text-amber-800 mb-2">💡 Tip of the Day</h3>
            <p className="text-amber-700 text-sm">
              Take iron with vitamin C (orange juice) for better absorption, and avoid taking it with calcium or tea.
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default VitaminTracker;