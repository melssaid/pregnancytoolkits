import React, { useState, useEffect, useCallback } from 'react';
import { Baby, Play, Pause, RotateCcw, TrendingUp, Clock, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { KickService, UserProfileService } from '@/services/supabaseServices';
import { AIService } from '@/services/aiService';

const SmartKickCounter: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [kicks, setKicks] = useState<{ time: string }[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentWeek, setCurrentWeek] = useState(28);
  const [history, setHistory] = useState<any[]>([]);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, startTime]);

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
        setSessionId(activeSession.id);
        setKicks(activeSession.kicks || []);
        setStartTime(new Date(activeSession.started_at));
        setIsActive(true);
      }
      
      const sessionHistory = await KickService.getHistory(10);
      setHistory(sessionHistory);
      
    } catch (error: any) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startSession = async () => {
    try {
      const session = await KickService.startSession(currentWeek);
      setSessionId(session.id);
      setStartTime(new Date());
      setIsActive(true);
      setKicks([]);
      setElapsedTime(0);
      setNotes('');
      
      toast({
        title: 'بدأت الجلسة! 👶',
        description: 'اضغطي على الشاشة عند كل حركة للجنين'
      });
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const recordKick = async () => {
    if (!isActive || !sessionId) return;
    
    const timestamp = new Date().toISOString();
    const newKicks = await KickService.addKick(sessionId, kicks, timestamp);
    setKicks(newKicks);
    
    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const endSession = async () => {
    if (!sessionId) return;
    
    try {
      setIsSaving(true);
      const durationMinutes = Math.floor(elapsedTime / 60);
      
      await KickService.endSession(sessionId, durationMinutes, notes);
      
      setIsActive(false);
      setSessionId(null);
      
      toast({
        title: 'تم حفظ الجلسة! ✅',
        description: `سجلتِ ${kicks.length} حركة في ${durationMinutes} دقيقة`
      });
      
      // Reload history
      const sessionHistory = await KickService.getHistory(10);
      setHistory(sessionHistory);
      
      // Analyze if enough data
      if (sessionHistory.length >= 3) {
        analyzeKicks(sessionHistory);
      }
      
    } catch (error: any) {
      toast({
        title: 'خطأ في الحفظ',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const analyzeKicks = async (sessions: any[]) => {
    try {
      setIsAnalyzing(true);
      const response = await AIService.analyzeKickPatterns(sessions, currentWeek);
      setAiAnalysis(response.content);
    } catch (error) {
      console.error('Analysis error:', error);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <Card className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Baby className="w-8 h-8" />
              👶 عداد حركات الجنين
            </CardTitle>
            <p className="text-pink-100">
              الأسبوع {currentWeek} - تتبعي حركات طفلك
            </p>
          </CardHeader>
        </Card>

        {/* Main Counter */}
        <Card className="shadow-xl">
          <CardContent className="p-8">
            {/* Timer Display */}
            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-gray-800 mb-2">
                {formatTime(elapsedTime)}
              </div>
              <p className="text-gray-500">الوقت المنقضي</p>
            </div>

            {/* Kick Count Display */}
            <div 
              className={`relative w-48 h-48 mx-auto rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-br from-pink-400 to-purple-500 hover:scale-105 active:scale-95 shadow-2xl' 
                  : 'bg-gray-200'
              }`}
              onClick={isActive ? recordKick : undefined}
            >
              <div className="text-center text-white">
                <div className="text-6xl font-bold">{kicks.length}</div>
                <div className="text-lg">حركة</div>
              </div>
              
              {isActive && (
                <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping" />
              )}
            </div>

            {isActive && (
              <p className="text-center text-gray-500 mt-4 animate-pulse">
                👆 اضغطي على الدائرة عند كل حركة
              </p>
            )}

            {/* Control Buttons */}
            <div className="flex justify-center gap-4 mt-8">
              {!isActive ? (
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8"
                  onClick={startSession}
                >
                  <Play className="w-5 h-5 ml-2" />
                  ابدئي جلسة جديدة
                </Button>
              ) : (
                <>
                  <Button
                    size="lg"
                    variant="destructive"
                    onClick={endSession}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5 ml-2" />
                    )}
                    إنهاء وحفظ
                  </Button>
                </>
              )}
            </div>

            {/* Notes */}
            {isActive && (
              <div className="mt-6">
                <Textarea
                  placeholder="ملاحظات (اختياري)..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="resize-none"
                  rows={2}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="shadow-lg">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">{getAverageKicks()}</div>
              <p className="text-sm text-gray-500">متوسط الحركات</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg">
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-pink-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">{history.length}</div>
              <p className="text-sm text-gray-500">جلسات مسجلة</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Analysis */}
        {(aiAnalysis || isAnalyzing) && (
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                🤖 تحليل AI
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isAnalyzing ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري التحليل...
                </div>
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{aiAnalysis}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* History */}
        {history.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-500" />
                السجل السابق
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {history.map((session, index) => (
                  <div key={session.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">
                        {session.total_kicks} حركة
                      </div>
                      <div className="text-sm text-gray-500">
                        {session.duration_minutes} دقيقة • الأسبوع {session.week}
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(session.started_at).toLocaleDateString('ar-SA', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-bold text-blue-800 mb-2">ℹ️ متى تقلقين؟</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• إذا لاحظتِ انخفاضاً ملحوظاً في حركة الجنين</li>
              <li>• إذا لم تشعري بـ 10 حركات خلال ساعتين</li>
              <li>• استشيري طبيبك فوراً في هذه الحالات</li>
            </ul>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default SmartKickCounter;
