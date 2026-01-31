import React, { useState, useEffect } from 'react';
import { Pill, Check, Clock, Calendar, TrendingUp, Loader2, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { VitaminService, UserProfileService } from '@/services/supabaseServices';

interface VitaminLog {
  id: string;
  user_id: string;
  vitamin_name: string;
  dosage: string | null;
  taken_at: string;
  week: number | null;
  created_at: string;
}

interface Vitamin {
  id: string;
  name: string;
  dosage: string;
  icon: string;
  color: string;
  importance: string;
}

const VITAMINS: Vitamin[] = [
  { id: 'folic-acid', name: 'حمض الفوليك', dosage: '400-800 ميكروغرام', icon: '🧬', color: 'bg-green-100 border-green-400', importance: 'أساسي لنمو الجهاز العصبي' },
  { id: 'iron', name: 'الحديد', dosage: '27 ملغ', icon: '💪', color: 'bg-red-100 border-red-400', importance: 'يمنع فقر الدم' },
  { id: 'calcium', name: 'الكالسيوم', dosage: '1000 ملغ', icon: '🦴', color: 'bg-blue-100 border-blue-400', importance: 'لصحة العظام' },
  { id: 'vitamin-d', name: 'فيتامين د', dosage: '600 وحدة', icon: '☀️', color: 'bg-yellow-100 border-yellow-400', importance: 'امتصاص الكالسيوم' },
  { id: 'omega-3', name: 'أوميغا 3', dosage: '200-300 ملغ DHA', icon: '🐟', color: 'bg-cyan-100 border-cyan-400', importance: 'تطور دماغ الجنين' },
  { id: 'prenatal', name: 'فيتامينات الحمل', dosage: 'حسب المنتج', icon: '💊', color: 'bg-purple-100 border-purple-400', importance: 'شاملة ومتوازنة' },
  { id: 'vitamin-c', name: 'فيتامين سي', dosage: '85 ملغ', icon: '🍊', color: 'bg-orange-100 border-orange-400', importance: 'تقوية المناعة' },
  { id: 'zinc', name: 'الزنك', dosage: '11 ملغ', icon: '⚡', color: 'bg-gray-100 border-gray-400', importance: 'نمو الخلايا' },
];

const VitaminTracker: React.FC = () => {
  const [todayLogs, setTodayLogs] = useState<VitaminLog[]>([]);
  const [weekHistory, setWeekHistory] = useState<VitaminLog[]>([]);
  const [currentWeek, setCurrentWeek] = useState(20);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

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
        title: 'خطأ في التحميل',
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
        title: 'تم تناولها مسبقاً',
        description: `لقد سجلتِ ${vitamin.name} اليوم`,
      });
      return;
    }

    try {
      setSavingId(vitamin.id);
      
      const newLog = await VitaminService.log(vitamin.name, vitamin.dosage, currentWeek);
      
      setTodayLogs(prev => [...prev, newLog]);
      setWeekHistory(prev => [newLog, ...prev]);
      
      toast({
        title: 'تم التسجيل! ✅',
        description: `سجلتِ ${vitamin.name} بنجاح`
      });
      
    } catch (error: any) {
      toast({
        title: 'فشل التسجيل',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    try {
      await VitaminService.deleteLog(logId);
      setTodayLogs(prev => prev.filter(l => l.id !== logId));
      setWeekHistory(prev => prev.filter(l => l.id !== logId));
      toast({
        title: 'تم الحذف',
        description: 'تم حذف السجل بنجاح'
      });
    } catch (error: any) {
      toast({
        title: 'فشل الحذف',
        description: error.message,
        variant: 'destructive'
      });
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
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  const weeklyStats = getWeeklyStats();
  const todayProgress = getTodayProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 ml-2" />
          رجوع
        </Button>

        {/* Header */}
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Pill className="w-8 h-8" />
              💊 متتبع الفيتامينات
            </CardTitle>
            <p className="text-purple-100">
              الأسبوع {currentWeek} - تذكري تناول فيتاميناتك يومياً!
            </p>
          </CardHeader>
        </Card>

        {/* Today's Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                تقدم اليوم
              </span>
              <span className="text-2xl font-bold text-purple-600">{todayProgress}%</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${todayProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 text-center">
              {todayLogs.length} من {VITAMINS.length} فيتامينات
            </p>
          </CardContent>
        </Card>

        {/* Vitamins Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {VITAMINS.map((vitamin) => {
            const taken = isVitaminTakenToday(vitamin.name);
            const isSaving = savingId === vitamin.id;
            
            return (
              <Card
                key={vitamin.id}
                className={`border-2 transition-all ${
                  taken
                    ? 'bg-green-50 border-green-400'
                    : vitamin.color
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{vitamin.icon}</span>
                      <div>
                        <h3 className="font-bold text-gray-800">{vitamin.name}</h3>
                        <p className="text-sm text-gray-600">{vitamin.dosage}</p>
                        <p className="text-xs text-gray-500 mt-1">{vitamin.importance}</p>
                      </div>
                    </div>
                    
                    <Button
                      variant={taken ? 'default' : 'outline'}
                      size="sm"
                      className={taken ? 'bg-green-500 hover:bg-green-600' : ''}
                      onClick={() => handleTakeVitamin(vitamin)}
                      disabled={taken || isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : taken ? (
                        <>
                          <Check className="w-4 h-4 ml-1" />
                          تم
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 ml-1" />
                          تناولت
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Weekly Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              إحصائيات الأسبوع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {VITAMINS.map((vitamin) => {
                const count = weeklyStats[vitamin.name] || 0;
                const percentage = Math.round((count / 7) * 100);
                
                return (
                  <div key={vitamin.id} className="flex items-center gap-3">
                    <span className="text-xl w-8">{vitamin.icon}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{vitamin.name}</span>
                        <span className="text-gray-500">{count}/7 أيام</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            percentage >= 80 ? 'bg-green-500' :
                            percentage >= 50 ? 'bg-yellow-500' : 'bg-red-400'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        {weekHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-500" />
                آخر التسجيلات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {weekHistory.slice(0, 15).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <span className="font-medium">{log.vitamin_name}</span>
                      {log.dosage && (
                        <span className="text-xs text-gray-500 mr-2">({log.dosage})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {new Date(log.taken_at).toLocaleString('ar-SA', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-400 hover:text-red-600"
                        onClick={() => handleDeleteLog(log.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Disclaimer */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 text-center">
          <p className="text-amber-800 text-sm">
            ⚠️ استشيري طبيبك قبل تناول أي مكملات غذائية
          </p>
        </div>
      </div>
    </div>
  );
};

export default VitaminTracker;
