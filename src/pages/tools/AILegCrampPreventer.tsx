import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Moon, CheckCircle, Brain, Loader2 } from 'lucide-react';
import { usePregnancyAI } from '@/hooks/usePregnancyAI';
import { useResetOnLanguageChange } from '@/hooks/useResetOnLanguageChange';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

interface PreventionTip {
  id: string;
  key: string;
  icon: string;
  checked: boolean;
}

interface CrampEpisode {
  id: string;
  date: string;
  location: string;
  severity: number;
  timeOfDay: string;
}

const tipKeys = [
  { id: '1', key: 'hydrated', icon: '💧' },
  { id: '2', key: 'stretch', icon: '🧘' },
  { id: '3', key: 'magnesium', icon: '🥜' },
  { id: '4', key: 'standing', icon: '🪑' },
  { id: '5', key: 'shoes', icon: '👟' },
  { id: '6', key: 'bath', icon: '🛁' },
  { id: '7', key: 'sleep', icon: '😴' },
  { id: '8', key: 'toes', icon: '🦶' },
];

const locationKeys = ['leftCalf', 'rightCalf', 'leftThigh', 'rightThigh'];
const reliefStepKeys = ['step1', 'step2', 'step3', 'step4', 'step5'];

export default function AILegCrampPreventer() {
  const { t } = useTranslation();
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [tips, setTips] = useState<PreventionTip[]>(
    tipKeys.map(tk => ({ ...tk, checked: false }))
  );
  const [episodes, setEpisodes] = useState<CrampEpisode[]>([]);
  const [showReliefGuide, setShowReliefGuide] = useState(false);
  const [showAIAdvice, setShowAIAdvice] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  
  const { streamChat, isLoading, error } = usePregnancyAI();

  useResetOnLanguageChange(() => {
    setAiResponse('');
    setShowAIAdvice(false);
  });

  useEffect(() => {
    const savedTips = localStorage.getItem('legCrampTips');
    const savedEpisodes = localStorage.getItem('legCrampEpisodes');
    if (savedTips) {
      try {
        const parsed = JSON.parse(savedTips);
        // Merge saved checked state with current tip keys
        setTips(tipKeys.map(tk => ({
          ...tk,
          checked: parsed.find((p: any) => p.id === tk.id)?.checked || false,
        })));
      } catch { /* use defaults */ }
    }
    if (savedEpisodes) setEpisodes(JSON.parse(savedEpisodes));
  }, []);

  useEffect(() => {
    localStorage.setItem('legCrampTips', JSON.stringify(tips));
    localStorage.setItem('legCrampEpisodes', JSON.stringify(episodes));
  }, [tips, episodes]);

  const toggleTip = (id: string) => {
    setTips(tips.map(tip => 
      tip.id === id ? { ...tip, checked: !tip.checked } : tip
    ));
  };

  const getTimeOfDayKey = (): string => {
    const hour = new Date().getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  const logCramp = (locationKey: string, severity: number) => {
    const timeOfDayKey = getTimeOfDayKey();
    
    const episode: CrampEpisode = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      location: locationKey,
      severity,
      timeOfDay: timeOfDayKey,
    };
    setEpisodes([episode, ...episodes.slice(0, 9)]);
  };

  const completedTips = tips.filter(t => t.checked).length;

  const getAICrampAdvice = async () => {
    setShowAIAdvice(true);
    setAiResponse('');
    
    const completedPreventions = tips.filter(tip => tip.checked).map(tip => t(`legCrampPreventer.preventionTips.${tip.key}.title`));
    const recentCramps = episodes.slice(0, 5).map(e => `${t(`legCrampPreventer.locations.${e.location}`)} (${t(`legCrampPreventer.timeOfDay.${e.timeOfDay}`)})`);

    await streamChat({
      type: 'leg-cramp-preventer' as any,
      messages: [
        {
          role: 'user',
          content: `I'm pregnant and dealing with leg cramps. Recent cramp locations and times: ${recentCramps.join(', ') || 'none logged'}. Prevention steps I've completed today: ${completedPreventions.join(', ') || 'none yet'}. Give me personalized advice to prevent and relieve leg cramps.`
        }
      ],
      onDelta: (text) => setAiResponse(prev => prev + text),
      onDone: () => {}
    });
  };

  if (showDisclaimer) {
    return (
      <MedicalDisclaimer
        toolName={t('legCrampPreventer.title')}
        onAccept={() => setShowDisclaimer(false)}
      />
    );
  }

  return (
    <ToolFrame
      title={t('legCrampPreventer.title')}
      subtitle={t('legCrampPreventer.subtitle')}
      icon={Zap}
      mood="empowering"
      toolId="ai-leg-cramp-preventer"
    >
      <div className="space-y-6">
        {/* Progress */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{t('legCrampPreventer.progressTitle')}</h3>
              <span className="text-primary font-bold">{completedTips}/{tips.length}</span>
            </div>
            <div className="w-full h-2 bg-primary/20 rounded-full mb-3">
              <div 
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(completedTips / tips.length) * 100}%` }}
              />
            </div>
            <Button 
              onClick={getAICrampAdvice} 
              disabled={isLoading}
              className="w-full gap-2"
              variant="outline"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Brain className="w-4 h-4" />
              )}
              {t('legCrampPreventer.getAdvice')}
            </Button>
          </CardContent>
        </Card>

        {/* AI Response */}
        {showAIAdvice && aiResponse && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">{t('legCrampPreventer.aiCoachTitle')}</h3>
              </div>
              <MarkdownRenderer content={aiResponse} />
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4 text-destructive text-sm">
              {error}
            </CardContent>
          </Card>
        )}

        {/* Quick Relief Button */}
        <Button 
          onClick={() => setShowReliefGuide(!showReliefGuide)} 
          variant="destructive"
          className="w-full"
        >
          <Zap className="w-4 h-4 mr-2" />
          {showReliefGuide ? t('legCrampPreventer.hideRelief') : t('legCrampPreventer.quickReliefBtn')}
        </Button>

        {/* Quick Relief Guide */}
        {showReliefGuide && (
          <Card className="border-2 border-destructive">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-destructive mb-4">{t('legCrampPreventer.quickReliefTitle')}</h3>
              <ol className="space-y-3">
                {reliefStepKeys.map((stepKey, index) => (
                  <li key={stepKey} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-sm font-bold">{index + 1}</span>
                    <p className="text-sm"><strong>{t(`legCrampPreventer.reliefSteps.${stepKey}.title`)}</strong> - {t(`legCrampPreventer.reliefSteps.${stepKey}.desc`)}</p>
                  </li>
                ))}
              </ol>
              
              <div className="mt-3 pt-3 border-t border-border">
                <h4 className="font-semibold mb-2 text-sm">{t('legCrampPreventer.logCramp')}</h4>
                <div className="grid grid-cols-2 gap-1.5">
                  {locationKeys.map((locKey) => (
                    <Button 
                      key={locKey}
                      variant="outline" 
                      size="sm"
                      className="text-xs overflow-hidden"
                      onClick={() => logCramp(locKey, 5)}
                    >
                      <span className="truncate">{t(`legCrampPreventer.locations.${locKey}`)}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Prevention Checklist */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Moon className="w-5 h-5 text-primary" />
              {t('legCrampPreventer.checklistTitle')}
            </h3>
            <div className="space-y-2">
              {tips.map((tip) => (
                <button
                  key={tip.id}
                  onClick={() => toggleTip(tip.id)}
                  className={`w-full p-3 rounded-lg text-left transition-all flex items-center gap-3 ${
                    tip.checked 
                      ? 'bg-success/10 border border-success/20' 
                      : 'bg-muted/50 hover:bg-muted'
                  }`}
                >
                  <span className="text-xl">{tip.icon}</span>
                  <div className="flex-1">
                    <span className={`font-medium ${tip.checked ? 'line-through text-muted-foreground' : ''}`}>
                      {t(`legCrampPreventer.preventionTips.${tip.key}.title`)}
                    </span>
                    <p className="text-xs text-muted-foreground">{t(`legCrampPreventer.preventionTips.${tip.key}.desc`)}</p>
                  </div>
                  {tip.checked && <CheckCircle className="w-5 h-5 text-success" />}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cramp History */}
        {episodes.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">{t('legCrampPreventer.recentCramps')}</h3>
              <div className="space-y-2">
                {episodes.slice(0, 5).map((ep) => (
                  <div key={ep.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <div>
                      <span className="font-medium">{t(`legCrampPreventer.locations.${ep.location}`)}</span>
                      <p className="text-xs text-muted-foreground">
                        {new Date(ep.date).toLocaleDateString()} • {t(`legCrampPreventer.timeOfDay.${ep.timeOfDay}`)}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-0.5 bg-destructive/10 text-destructive rounded-full">
                      {t(`legCrampPreventer.timeOfDay.${ep.timeOfDay}`)}
                    </span>
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