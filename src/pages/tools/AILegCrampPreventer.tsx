import React, { useState, useEffect } from 'react';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Moon, AlertTriangle, CheckCircle, Brain, Loader2 } from 'lucide-react';
import { usePregnancyAI } from '@/hooks/usePregnancyAI';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

interface PreventionTip {
  id: string;
  title: string;
  description: string;
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

const preventionTips: PreventionTip[] = [
  { id: '1', title: 'Stay Hydrated', description: 'Drink at least 8-10 glasses of water daily', icon: '💧', checked: false },
  { id: '2', title: 'Stretch Before Bed', description: 'Gentle calf stretches can prevent nighttime cramps', icon: '🧘', checked: false },
  { id: '3', title: 'Magnesium-Rich Foods', description: 'Eat nuts, seeds, bananas, and leafy greens', icon: '🥜', checked: false },
  { id: '4', title: 'Avoid Standing Too Long', description: 'Take breaks and elevate your legs when possible', icon: '🪑', checked: false },
  { id: '5', title: 'Wear Supportive Shoes', description: 'Good footwear supports leg muscles', icon: '👟', checked: false },
  { id: '6', title: 'Warm Bath Before Bed', description: 'Relaxes muscles and improves circulation', icon: '🛁', checked: false },
  { id: '7', title: 'Sleep Position', description: 'Sleep on your left side with pillow between knees', icon: '😴', checked: false },
  { id: '8', title: 'Avoid Pointing Toes', description: 'Flex feet instead of pointing when stretching', icon: '🦶', checked: false },
];

export default function AILegCrampPreventer() {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [tips, setTips] = useState(preventionTips);
  const [episodes, setEpisodes] = useState<CrampEpisode[]>([]);
  const [showReliefGuide, setShowReliefGuide] = useState(false);
  const [showAIAdvice, setShowAIAdvice] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  
  const { streamChat, isLoading, error } = usePregnancyAI();

  useEffect(() => {
    const savedTips = localStorage.getItem('legCrampTips');
    const savedEpisodes = localStorage.getItem('legCrampEpisodes');
    if (savedTips) setTips(JSON.parse(savedTips));
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

  const logCramp = (location: string, severity: number) => {
    const now = new Date();
    const timeOfDay = now.getHours() < 6 ? 'Night' : 
                      now.getHours() < 12 ? 'Morning' :
                      now.getHours() < 18 ? 'Afternoon' : 'Evening';
    
    const episode: CrampEpisode = {
      id: Date.now().toString(),
      date: now.toISOString(),
      location,
      severity,
      timeOfDay,
    };
    setEpisodes([episode, ...episodes.slice(0, 9)]);
  };

  const completedTips = tips.filter(t => t.checked).length;

  const getAICrampAdvice = async () => {
    setShowAIAdvice(true);
    setAiResponse('');
    
    const completedPreventions = tips.filter(t => t.checked).map(t => t.title);
    const recentCramps = episodes.slice(0, 5).map(e => `${e.location} (${e.timeOfDay})`);

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
        toolName="AI Leg Cramp Preventer"
        onAccept={() => setShowDisclaimer(false)}
      />
    );
  }

  return (
    <ToolFrame
      title="AI Leg Cramp Preventer"
      subtitle="Prevent and manage pregnancy leg cramps with smart tips"
      icon={Zap}
      mood="empowering"
      toolId="ai-leg-cramp-preventer"
    >
      <div className="space-y-6">
        {/* Progress */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Prevention Progress</h3>
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
              Get AI Cramp Prevention Advice
            </Button>
          </CardContent>
        </Card>

        {/* AI Response */}
        {showAIAdvice && aiResponse && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">AI Cramp Prevention Coach</h3>
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
          {showReliefGuide ? 'Hide Relief Guide' : 'Having a Cramp? Quick Relief'}
        </Button>

        {/* Quick Relief Guide */}
        {showReliefGuide && (
          <Card className="border-2 border-destructive">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-destructive mb-4">Quick Relief Steps</h3>
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-sm font-bold">1</span>
                  <p className="text-sm"><strong>Flex your foot</strong> - Pull toes toward your shin</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-sm font-bold">2</span>
                  <p className="text-sm"><strong>Massage the muscle</strong> - Rub gently in the direction of the cramp</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-sm font-bold">3</span>
                  <p className="text-sm"><strong>Apply heat</strong> - Use a warm towel or heating pad</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-sm font-bold">4</span>
                  <p className="text-sm"><strong>Walk around</strong> - Gentle movement helps release the cramp</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-sm font-bold">5</span>
                  <p className="text-sm"><strong>Drink water</strong> - Hydration helps prevent recurrence</p>
                </li>
              </ol>
              
              <div className="mt-3 pt-3 border-t border-border">
                <h4 className="font-semibold mb-2 text-sm">Log this cramp:</h4>
                <div className="grid grid-cols-2 gap-1.5">
                  {['Left Calf', 'Right Calf', 'Left Thigh', 'Right Thigh'].map((loc) => (
                    <Button 
                      key={loc}
                      variant="outline" 
                      size="sm"
                      className="text-xs overflow-hidden"
                      onClick={() => logCramp(loc, 5)}
                    >
                      <span className="truncate">{loc}</span>
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
              Daily Prevention Checklist
            </h3>
            <div className="space-y-2">
              {tips.map((tip) => (
                <button
                  key={tip.id}
                  onClick={() => toggleTip(tip.id)}
                  className={`w-full p-3 rounded-lg text-left transition-all flex items-center gap-3 ${
                    tip.checked 
                      ? 'bg-green-500/10 border border-green-500/20' 
                      : 'bg-muted/50 hover:bg-muted'
                  }`}
                >
                  <span className="text-xl">{tip.icon}</span>
                  <div className="flex-1">
                    <span className={`font-medium ${tip.checked ? 'line-through text-muted-foreground' : ''}`}>
                      {tip.title}
                    </span>
                    <p className="text-xs text-muted-foreground">{tip.description}</p>
                  </div>
                  {tip.checked && <CheckCircle className="w-5 h-5 text-green-600" />}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cramp History */}
        {episodes.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">Recent Cramps</h3>
              <div className="space-y-2">
                {episodes.slice(0, 5).map((ep) => (
                  <div key={ep.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <div>
                      <span className="font-medium">{ep.location}</span>
                      <p className="text-xs text-muted-foreground">
                        {new Date(ep.date).toLocaleDateString()} • {ep.timeOfDay}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-0.5 bg-destructive/10 text-destructive rounded-full">
                      {ep.timeOfDay}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Warning */}
        <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Frequent or severe leg cramps, especially with swelling, redness, or warmth, 
                should be reported to your healthcare provider immediately.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
}