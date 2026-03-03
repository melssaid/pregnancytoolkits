import React, { useState, useEffect } from 'react';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Activity, Clock, AlertTriangle, Phone, TrendingUp, Timer, Baby, Brain, Loader2, Wind, Heart, Sparkles } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { usePregnancyAI } from '@/hooks/usePregnancyAI';
import { AIActionButton } from '@/components/ai/AIActionButton';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { useTranslation } from 'react-i18next';
import { useResetOnLanguageChange } from '@/hooks/useResetOnLanguageChange';
import { RelatedToolLinks } from '@/components/RelatedToolLinks';

interface Contraction {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
  intensity: 'mild' | 'moderate' | 'strong' | 'very-strong';
}

export default function AILaborProgressTracker() {
  const { t } = useTranslation();
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [contractions, setContractions] = useState<Contraction[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [currentStart, setCurrentStart] = useState<Date | null>(null);
  const [timer, setTimer] = useState(0);
  const [showHospitalAlert, setShowHospitalAlert] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  
  const { streamChat, isLoading, error } = usePregnancyAI();

  useResetOnLanguageChange(() => {
    setAiResponse('');
    setShowAIAnalysis(false);
  });

  useEffect(() => {
    const saved = localStorage.getItem('laborContractions');
    if (saved) {
      try {
        setContractions(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load contractions');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('laborContractions', JSON.stringify(contractions));
  }, [contractions]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking]);

  const startContraction = () => {
    setIsTracking(true);
    setCurrentStart(new Date());
    setTimer(0);
  };

  const endContraction = () => {
    if (!currentStart) return;

    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - currentStart.getTime()) / 1000);
    
    let intensity: 'mild' | 'moderate' | 'strong' | 'very-strong' = 'mild';
    if (duration > 90) intensity = 'very-strong';
    else if (duration > 60) intensity = 'strong';
    else if (duration > 40) intensity = 'moderate';

    const contraction: Contraction = {
      id: Date.now().toString(),
      startTime: currentStart.toISOString(),
      endTime: endTime.toISOString(),
      duration,
      intensity
    };

    const newContractions = [contraction, ...contractions];
    setContractions(newContractions);
    setIsTracking(false);
    setCurrentStart(null);
    setTimer(0);

    checkHospitalTime(newContractions);
  };

  const checkHospitalTime = (data: Contraction[]) => {
    if (data.length < 3) return;

    const recent = data.slice(0, 6);
    const avgDuration = recent.reduce((sum, c) => sum + c.duration, 0) / recent.length;
    
    let avgInterval = 0;
    for (let i = 0; i < recent.length - 1; i++) {
      const current = new Date(recent[i].startTime);
      const next = new Date(recent[i + 1].startTime);
      avgInterval += (current.getTime() - next.getTime()) / 60000;
    }
    avgInterval = avgInterval / (recent.length - 1);

    if (avgInterval <= 5 && avgDuration >= 60) {
      setShowHospitalAlert(true);
    }
  };

  const getAverageInterval = () => {
    if (contractions.length < 2) return 0;
    
    const recent = contractions.slice(0, 5);
    let totalInterval = 0;
    for (let i = 0; i < recent.length - 1; i++) {
      const current = new Date(recent[i].startTime);
      const next = new Date(recent[i + 1].startTime);
      totalInterval += (current.getTime() - next.getTime()) / 60000;
    }
    return Math.round(totalInterval / (recent.length - 1));
  };

  const getAverageDuration = () => {
    if (contractions.length === 0) return 0;
    const recent = contractions.slice(0, 5);
    return Math.round(recent.reduce((sum, c) => sum + c.duration, 0) / recent.length);
  };

  const getLaborPhase = () => {
    const avgInterval = getAverageInterval();
    if (avgInterval > 10) return { phase: t('toolsInternal.laborTracker.earlyPhase', 'Early Phase'), color: 'text-primary', desc: t('toolsInternal.laborTracker.earlyPhaseDesc', 'Rest, stay comfortable, and keep hydrating') };
    if (avgInterval > 5) return { phase: t('toolsInternal.laborTracker.activePhase', 'Active Phase'), color: 'text-accent', desc: t('toolsInternal.laborTracker.activePhaseDesc', 'Consider sharing this log with your provider') };
    return { phase: t('toolsInternal.laborTracker.intensivePhase', 'Intensive Phase'), color: 'text-primary', desc: t('toolsInternal.laborTracker.intensivePhaseDesc', 'Contact your healthcare provider with this journal') };
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getChartData = () => {
    return contractions.slice(0, 10).reverse().map((c, index) => ({
      index: index + 1,
      duration: c.duration,
    }));
  };

  const getAILaborAnalysis = async () => {
    setShowAIAnalysis(true);
    setAiResponse('');

    const recentContractions = contractions.slice(0, 10).map(c => ({
      duration: c.duration,
      intensity: c.intensity,
      time: new Date(c.startTime).toLocaleTimeString()
    }));

    const avgInterval = getAverageInterval();
    const avgDuration = getAverageDuration();
    const phase = getLaborPhase().phase;

    await streamChat({
      type: 'labor-tracker',
      messages: [
        {
          role: 'user',
          content: `Here is my contraction journal data:
- Recent entries: ${JSON.stringify(recentContractions)}
- Average interval between contractions: ${avgInterval} minutes
- Average contraction duration: ${avgDuration} seconds
- Total contractions logged: ${contractions.length}
- Current estimated phase: ${phase}
- Time since first entry: ${contractions.length > 0 ? Math.round((Date.now() - new Date(contractions[contractions.length - 1].startTime).getTime()) / 60000) : 0} minutes

Please provide a comprehensive wellness analysis with breathing techniques, comfort measures, and encouragement based on my current phase.`
        }
      ],
      context: { contractionData: recentContractions },
      onDelta: (text) => setAiResponse(prev => prev + text),
      onDone: () => {}
    });
  };

  if (showDisclaimer) {
    return (
      <MedicalDisclaimer
        toolName={t('toolsInternal.laborTracker.title', 'AI Labor Progress Tracker')}
        onAccept={() => setShowDisclaimer(false)}
      />
    );
  }

  return (
    <ToolFrame
      title={t('toolsInternal.laborTracker.title', 'Contraction Logger')}
      subtitle={t('toolsInternal.laborTracker.subtitle', 'Log and journal your contraction patterns')}
      mood="empowering"
      toolId="labor-progress"
      icon={Activity}
    >
      <div className="space-y-4">
          {/* Provider Contact Suggestion */}
          {showHospitalAlert && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="flex-1">
                    <h3 className="font-bold text-primary text-sm mb-1.5">
                      📋 {t('toolsInternal.laborTracker.providerAlert', 'Consider Contacting Your Provider')}
                    </h3>
                    <p className="text-sm text-foreground mb-4">
                      {t('toolsInternal.laborTracker.providerAlertDesc', 'Based on the 5-1-1 guideline, your logged contractions are now 5 minutes apart and lasting 1 minute or more. You may want to share this journal with your healthcare provider.')}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button 
                        variant="default"
                        onClick={() => window.open('tel:911', '_self')}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        {t('toolsInternal.laborTracker.callProvider', 'Call Provider')}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setShowHospitalAlert(false)}
                      >
                        {t('toolsInternal.laborTracker.understand', 'I Understand')}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Timer */}
          <Card>
            <CardContent className="p-4 text-center">
              <div className="mb-4">
                <div className={`text-lg font-bold ${isTracking ? 'text-destructive' : 'text-primary'}`}>
                  {formatTimer(timer)}
                </div>
                <p className="text-muted-foreground mt-2">
                  {isTracking ? t('toolsInternal.laborTracker.inProgress', 'Contraction in progress...') : t('toolsInternal.laborTracker.ready', 'Ready to track')}
                </p>
              </div>

              <Button
                onClick={isTracking ? endContraction : startContraction}
                className={`w-full h-10 text-xs rounded-xl ${
                  isTracking 
                    ? 'bg-destructive hover:bg-destructive/90' 
                    : 'bg-primary hover:bg-primary/90'
                }`}
              >
                <Timer className="w-5 h-5 me-2" />
                {isTracking ? t('toolsInternal.laborTracker.endContraction', 'End Contraction') : t('toolsInternal.laborTracker.startContraction', 'Start Contraction')}
              </Button>
            </CardContent>
          </Card>

          {/* AI Analysis Button */}
          {contractions.length >= 3 && (
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-xs">{t('toolsInternal.laborTracker.aiAnalysis', 'AI Wellness Insights')}</h3>
                </div>
                <p className="text-[10px] text-muted-foreground mb-2">
                  {t('toolsInternal.laborTracker.aiAnalysisDesc', 'Get personalized breathing techniques, comfort measures, and encouragement based on your journal entries.')}
                </p>
                <AIActionButton
                  onClick={getAILaborAnalysis}
                  isLoading={isLoading}
                  label={t('toolsInternal.laborTracker.getAIAnalysis', 'Get AI Wellness Insights')}
                  loadingLabel={t('toolsInternal.laborTracker.analyzing', 'Analyzing...')}
                />
              </CardContent>
            </Card>
          )}

          {/* AI Response */}
          {showAIAnalysis && aiResponse && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm">{t('toolsInternal.laborTracker.aiAnalysis', 'AI Journal Insights')}</h3>
                </div>
                <MarkdownRenderer content={aiResponse} />
              </CardContent>
            </Card>
          )}

          {error && (
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="p-3 text-destructive text-xs">
                {error}
              </CardContent>
            </Card>
          )}

          {/* Stats Overview */}
          {contractions.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-sm font-bold text-primary">{contractions.length}</div>
                  <div className="text-xs text-muted-foreground">{t('toolsInternal.laborTracker.contractions', 'Contractions')}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-sm font-bold text-primary">{getAverageInterval()} {t('common.min', 'min')}</div>
                  <div className="text-xs text-muted-foreground">{t('toolsInternal.laborTracker.avgInterval', 'Avg Interval')}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-sm font-bold text-primary">{getAverageDuration()} {t('common.sec', 'sec')}</div>
                  <div className="text-xs text-muted-foreground">{t('toolsInternal.laborTracker.avgDuration', 'Avg Duration')}</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Labor Phase */}
          {contractions.length >= 3 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Baby className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className={`text-sm font-bold ${getLaborPhase().color}`}>
                      {getLaborPhase().phase}
                    </h3>
                    <p className="text-xs text-muted-foreground">{getLaborPhase().desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contraction Chart */}
          {contractions.length >= 3 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  {t('toolsInternal.laborTracker.contractionPattern', 'Contraction Pattern')}
                </h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getChartData()}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="index" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="duration" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        name={t('toolsInternal.laborTracker.durationSec', 'Duration (sec)')}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Contractions */}
          {contractions.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  {t('toolsInternal.laborTracker.recentContractions', 'Recent Contractions')}
                </h3>
                <div className="space-y-2">
                  {contractions.slice(0, 5).map((c) => (
                    <div 
                      key={c.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <span className="font-medium">
                          {new Date(c.startTime).toLocaleTimeString()}
                        </span>
                        <span className={`ms-2 text-xs px-2 py-0.5 rounded-full ${
                          c.intensity === 'very-strong' ? 'bg-primary/15 text-primary' :
                          c.intensity === 'strong' ? 'bg-accent/15 text-accent' :
                          c.intensity === 'moderate' ? 'bg-secondary text-secondary-foreground' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {t(`toolsInternal.laborTracker.intensity.${c.intensity}`, c.intensity)}
                        </span>
                      </div>
                      <span className="text-muted-foreground">{c.duration}s</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Breathing Guide */}
          <Card className="border-primary/10">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Wind className="w-4 h-4 text-primary" />
                {t('toolsInternal.laborTracker.breathingGuide', 'Quick Breathing Guide')}
              </h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2 p-2 bg-muted/30 rounded-lg">
                  <span className="text-primary font-bold text-xs mt-0.5">1</span>
                  <div>
                    <p className="text-xs font-medium">{t('toolsInternal.laborTracker.breathingEarly', 'Early Phase: Slow Breathing')}</p>
                    <p className="text-[11px] text-muted-foreground">{t('toolsInternal.laborTracker.breathingEarlyDesc', 'Inhale through nose (4 counts) → Exhale through mouth (6 counts)')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 bg-muted/30 rounded-lg">
                  <span className="text-primary font-bold text-xs mt-0.5">2</span>
                  <div>
                    <p className="text-xs font-medium">{t('toolsInternal.laborTracker.breathingActive', 'Active Phase: Patterned Breathing')}</p>
                    <p className="text-[11px] text-muted-foreground">{t('toolsInternal.laborTracker.breathingActiveDesc', 'Light breathing: "Hee-hee-hoo" pattern, focus on exhale')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 bg-muted/30 rounded-lg">
                  <span className="text-primary font-bold text-xs mt-0.5">3</span>
                  <div>
                    <p className="text-xs font-medium">{t('toolsInternal.laborTracker.breathingIntensive', 'Intensive Phase: Blow Breathing')}</p>
                    <p className="text-[11px] text-muted-foreground">{t('toolsInternal.laborTracker.breathingIntensiveDesc', 'Short inhale → Long blow out, like blowing a candle slowly')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 5-1-1 Guideline Info */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">📋 {t('toolsInternal.laborTracker.rule511', 'The 5-1-1 Guideline')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('toolsInternal.laborTracker.rule511Desc', 'Many healthcare providers suggest contacting them when contractions are 5 minutes apart, last 1 minute each, and continue for 1 hour. Share your log for guidance.')}
              </p>
            </CardContent>
          </Card>

          {/* Comfort Tips */}
          <Card className="border-accent/10">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4 text-accent" />
                {t('toolsInternal.laborTracker.comfortTips', 'Comfort Tips')}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-2 bg-muted/30 rounded-lg">
                  <span className="text-lg">🚿</span>
                  <p className="text-[11px] text-muted-foreground mt-1">{t('toolsInternal.laborTracker.warmWater', 'Warm shower on back')}</p>
                </div>
                <div className="text-center p-2 bg-muted/30 rounded-lg">
                  <span className="text-lg">🏃‍♀️</span>
                  <p className="text-[11px] text-muted-foreground mt-1">{t('toolsInternal.laborTracker.walkGently', 'Walk gently between')}</p>
                </div>
                <div className="text-center p-2 bg-muted/30 rounded-lg">
                  <span className="text-lg">⚽</span>
                  <p className="text-[11px] text-muted-foreground mt-1">{t('toolsInternal.laborTracker.birthBall', 'Sway on birth ball')}</p>
                </div>
                <div className="text-center p-2 bg-muted/30 rounded-lg">
                  <span className="text-lg">💆</span>
                  <p className="text-[11px] text-muted-foreground mt-1">{t('toolsInternal.laborTracker.counterPressure', 'Counter-pressure on lower back')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <div className="bg-muted/30 rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground">
              ⚠️ {t('toolsInternal.laborTracker.disclaimer', "This tool is for informational purposes only. Always follow your healthcare provider's guidance.")}
            </p>
          </div>

          <RelatedToolLinks links={[
            { to: "/tools/ai-birth-plan", titleKey: "laborLinks.birthPlanLink", titleFallback: "Birth Plan Generator", descKey: "laborLinks.birthPlanLinkDesc", descFallback: "Create a personalized birth plan", icon: "fileText" },
            { to: "/tools/ai-birth-position", titleKey: "laborLinks.birthPositionLink", titleFallback: "Birth Positions", descKey: "laborLinks.birthPositionLinkDesc", descFallback: "Explore optimal positions for labor and delivery", icon: "personStanding" },
          ]} />
      </div>
    </ToolFrame>
  );
}