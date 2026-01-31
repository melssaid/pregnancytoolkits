import React, { useState, useEffect, useCallback } from 'react';
import { Baby, Play, Pause, RotateCcw, Clock, TrendingUp, Loader2, ArrowLeft, Sparkles, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { KickService, UserProfileService } from '@/services/supabaseServices';
import { AIService } from '@/services/aiService';

interface KickSession {
  id: string;
  user_id: string;
  kicks: { time: string }[];
  total_kicks: number;
  duration_minutes: number | null;
  started_at: string;
  ended_at: string | null;
  week: number | null;
  notes: string | null;
}

const SmartKickCounter: React.FC = () => {
  const [currentSession, setCurrentSession] = useState<KickSession | null>(null);
  const [kicks, setKicks] = useState<{ time: string }[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [history, setHistory] = useState<KickSession[]>([]);
  const [currentWeek, setCurrentWeek] = useState(28);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const profile = await UserProfileService.get();
      if (profile?.pregnancy_week) {
        setCurrentWeek(profile.pregnancy_week);
      }
      
      // Check for active session
      const activeSession = await KickService.getActiveSession();
      if (activeSession) {
        setCurrentSession(activeSession);
        setKicks(activeSession.kicks || []);
        setIsActive(true);
        // Calculate elapsed time
        const startTime = new Date(activeSession.started_at).getTime();
        const now = Date.now();
        setElapsedTime(Math.floor((now - startTime) / 1000));
      }
      
      // Load history
      const sessionHistory = await KickService.getHistory(10);
      setHistory(sessionHistory);
      
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast({
        title: 'خطأ في التحميل',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startSession = async () => {
    try {
      setIsSaving(true);
      const session = await KickService.startSession(currentWeek);
      setCurrentSession(session);
      setKicks([]);
      setElapsedTime(0);
      setIsActive(true);
      setNotes('');
      
      toast({
        title: 'بدأت الجلسة! 👶',
        description: 'اضغطي على الزر عند الشعور بحركة الجنين'
      });
    } catch (error: any) {
      toast({
        title: 'فشل البدء',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const recordKick = async () => {
    if (!currentSession) return;
    
    try {
      const timestamp = new Date().toISOString();
      const newKicks = await KickService.addKick(currentSession.id, kicks, timestamp);
      setKicks(newKicks);
      
      // Vibration feedback if supported
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    } catch (error: any) {
      console.error('Error recording kick:', error);
    }
  };

  const endSession = async () => {
    if (!currentSession) return;
    
    try {
      setIsSaving(true);
      const durationMinutes = Math.floor(elapsedTime / 60);
      
      await KickService.endSession(currentSession.id, durationMinutes, notes);
      
      const completedSession = {
        ...currentSession,
        kicks,
        total_kicks: kicks.length,
        duration_minutes: durationMinutes,
        ended_at: new Date().toISOString(),
        notes
      };
      
      setHistory(prev => [completedSession, ...prev]);
      setCurrentSession(null);
      setKicks([]);
      setElapsedTime(0);
      setIsActive(false);
      
      toast({
        title: 'انتهت الجلسة! ✅',
        description: `سجلتِ ${kicks.length} حركة في ${durationMinutes} دقيقة`
      });
      
    } catch (error: any) {
      toast({
        title: 'فشل الحفظ',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetSession = () => {
    if (confirm('هل تريدين إلغاء هذه الجلسة؟')) {
      setCurrentSession(null);
      setKicks([]);
      setElapsedTime(0);
      setIsActive(false);
      setNotes('');
    }
  };

  const analyzeKicks = async () => {
    if (history.length < 2) {
      toast({
        title: 'بيانات غير كافية',
        description: 'تحتاجين جلستين على الأقل للتحليل'
      });
      return;
    }
    
    try {
      setIsAnalyzing(true);
      const response = await AIService.analyzeKickPatterns(history, currentWeek);
      setAiAnalysis(response.content);
    } catch (error: any) {
      toast({
        title: 'فشل التحليل',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getAverageKicks = () => {
    if (history.length === 0) return 0;
    const total = history.reduce((sum, s) => sum + s.total_kicks, 0);
    return Math.round(total / history.length);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
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
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Baby className="w-8 h-8" />
              👶 عداد حركات الجنين
            </CardTitle>
            <p className="text-blue-100">
              الأسبوع {currentWeek} - تتبعي حركات طفلك
            </p>
          </CardHeader>
        </Card>

        {/* Main Counter */}
        <Card className="overflow-hidden">
          <CardContent className="p-8 text-center">
            {/* Timer */}
            <div className="mb-6">
              <div className="flex items-center justify-center gap-2 text-gray-500 mb-2">
                <Clock className="w-5 h-5" />
                <span>الوقت المنقضي</span>
              </div>
              <div className="text-4xl font-mono font-bold text-purple-600">
                {formatTime(elapsedTime)}
              </div>
            </div>

            {/* Kick Counter Display */}
            <div className="mb-8">
              <div className="text-8xl font-bold text-blue-600 mb-2">
                {kicks.length}
              </div>
              <div className="text-gray-500">حركة مسجلة</div>
            </div>

            {/* Main Action Button */}
            {!isActive ? (
              <Button
                size="lg"
                className="w-full h-20 text-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                onClick={startSession}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="w-6 h-6 animate-spin ml-2" />
                ) : (
                  <Play className="w-6 h-6 ml-2" />
                )}
                ابدئي جلسة جديدة
              </Button>
            ) : (
              <div className="space-y-4">
                {/* Kick Button */}
                <Button
                  size="lg"
                  className="w-full h-32 text-2xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 rounded-2xl shadow-lg active:scale-95 transition-transform"
                  onClick={recordKick}
                >
                  <Baby className="w-10 h-10 ml-3" />
                  شعرت بحركة! 👆
                </Button>

                {/* Control Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-14"
                    onClick={resetSession}
                  >
                    <RotateCcw className="w-5 h-5 ml-2" />
                    إلغاء
                  </Button>
                  <Button
                    className="h-14 bg-green-500 hover:bg-green-600"
                    onClick={endSession}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="w-5 h-5 animate-spin ml-2" />
                    ) : (
                      <Pause className="w-5 h-5 ml-2" />
                    )}
                    إنهاء وحفظ
                  </Button>
                </div>

                {/* Notes */}
                <Textarea
                  placeholder="أضيفي ملاحظات (اختياري)..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="resize-none"
                  rows={2}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Kicks Timeline (during session) */}
        {isActive && kicks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">توقيت الحركات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {kicks.map((kick, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs"
                  >
                    {new Date(kick.time).toLocaleTimeString('ar-SA', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              إحصائياتك
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-blue-600">{history.length}</div>
                <div className="text-xs text-gray-500">جلسة مسجلة</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-purple-600">{getAverageKicks()}</div>
                <div className="text-xs text-gray-500">متوسط الحركات</div>
              </div>
              <div className="bg-pink-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-pink-600">
                  {history.reduce((sum, s) => sum + s.total_kicks, 0)}
                </div>
                <div className="text-xs text-gray-500">إجمالي الحركات</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                تحليل AI
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={analyzeKicks}
                disabled={isAnalyzing || history.length < 2}
              >
                {isAnalyzing ? (
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                ) : (
                  <Sparkles className="w-4 h-4 ml-2" />
                )}
                تحليل النمط
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {aiAnalysis ? (
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed bg-purple-50 p-4 rounded-lg">
                {aiAnalysis}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>سجلي جلستين على الأقل لتحليل نمط الحركات</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* History */}
        {history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-gray-500" />
                السجل
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {history.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">
                        {session.total_kicks} حركة
                      </div>
                      <div className="text-xs text-gray-500">
                        {session.duration_minutes} دقيقة
                        {session.notes && ` • ${session.notes.substring(0, 30)}...`}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(session.started_at).toLocaleDateString('ar-SA', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <h4 className="font-bold text-blue-800 mb-2">💡 نصيحة</h4>
          <p className="text-blue-700 text-sm">
            يُنصح بتتبع حركات الجنين بعد الأسبوع 28. الهدف هو 10 حركات خلال ساعتين.
            إذا لاحظتِ انخفاضاً في الحركة، استشيري طبيبك.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SmartKickCounter;
