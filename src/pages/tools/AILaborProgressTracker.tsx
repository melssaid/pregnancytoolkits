import React, { useState, useEffect } from 'react';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Clock, AlertTriangle, Phone, TrendingUp, Timer, Baby, Brain, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { usePregnancyAI } from '@/hooks/usePregnancyAI';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';

interface Contraction {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
  intensity: 'mild' | 'moderate' | 'strong' | 'very-strong';
}

export default function AILaborProgressTracker() {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [contractions, setContractions] = useState<Contraction[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [currentStart, setCurrentStart] = useState<Date | null>(null);
  const [timer, setTimer] = useState(0);
  const [showHospitalAlert, setShowHospitalAlert] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  
  const { streamChat, isLoading, error } = usePregnancyAI();

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
    if (avgInterval > 10) return { phase: 'Early Labor', color: 'text-emerald-600', desc: 'Stay home, rest, and hydrate' };
    if (avgInterval > 5) return { phase: 'Active Labor', color: 'text-amber-600', desc: 'Consider heading to the hospital' };
    return { phase: 'Transition', color: 'text-destructive', desc: 'Go to the hospital now' };
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

    await streamChat({
      type: 'labor-tracker' as any,
      messages: [
        {
          role: 'user',
          content: `I'm tracking my labor contractions. Here's my recent data: ${JSON.stringify(recentContractions)}. Average interval: ${getAverageInterval()} minutes. Average duration: ${getAverageDuration()} seconds. Total contractions: ${contractions.length}. Please analyze my labor progress and give me personalized guidance.`
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
        toolName="AI Labor Progress Tracker"
        onAccept={() => setShowDisclaimer(false)}
      />
    );
  }

  return (
    <ToolFrame
      title="AI Labor Progress Tracker"
      subtitle="Track contractions and monitor labor progress"
      mood="empowering"
      toolId="labor-progress"
      icon={Activity}
    >
      <div className="space-y-6">
          {/* Hospital Alert */}
          {showHospitalAlert && (
            <Card className="border-destructive bg-destructive/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-8 h-8 text-destructive flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-bold text-destructive text-lg mb-2">
                      🏥 Time to Go to the Hospital!
                    </h3>
                    <p className="text-sm text-foreground mb-4">
                      Based on the 5-1-1 rule, your contractions are now 5 minutes apart 
                      and lasting 1 minute or more. This indicates active labor.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button 
                        variant="destructive"
                        onClick={() => window.open('tel:911', '_self')}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call Emergency
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setShowHospitalAlert(false)}
                      >
                        I Understand
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Timer */}
          <Card>
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className={`text-6xl font-bold ${isTracking ? 'text-destructive' : 'text-primary'}`}>
                  {formatTimer(timer)}
                </div>
                <p className="text-muted-foreground mt-2">
                  {isTracking ? 'Contraction in progress...' : 'Ready to track'}
                </p>
              </div>

              <Button
                size="lg"
                onClick={isTracking ? endContraction : startContraction}
                className={`w-full h-16 text-lg rounded-2xl ${
                  isTracking 
                    ? 'bg-destructive hover:bg-destructive/90' 
                    : 'bg-primary hover:bg-primary/90'
                }`}
              >
                <Timer className="w-6 h-6 mr-2" />
                {isTracking ? 'End Contraction' : 'Start Contraction'}
              </Button>
            </CardContent>
          </Card>

          {/* AI Analysis Button */}
          {contractions.length >= 3 && (
            <Button 
              onClick={getAILaborAnalysis} 
              disabled={isLoading}
              className="w-full gap-2"
              variant="outline"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Brain className="w-4 h-4" />
              )}
              Get AI Labor Analysis
            </Button>
          )}

          {/* AI Response */}
          {showAIAnalysis && aiResponse && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">AI Labor Analysis</h3>
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

          {/* Stats Overview */}
          {contractions.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{contractions.length}</div>
                  <div className="text-xs text-muted-foreground">Contractions</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{getAverageInterval()} min</div>
                  <div className="text-xs text-muted-foreground">Avg Interval</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{getAverageDuration()} sec</div>
                  <div className="text-xs text-muted-foreground">Avg Duration</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Labor Phase */}
          {contractions.length >= 3 && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Baby className="w-10 h-10 text-primary" />
                  <div>
                    <h3 className={`text-lg font-bold ${getLaborPhase().color}`}>
                      {getLaborPhase().phase}
                    </h3>
                    <p className="text-sm text-muted-foreground">{getLaborPhase().desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contraction Chart */}
          {contractions.length >= 3 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Contraction Pattern
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
                        name="Duration (sec)"
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
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Recent Contractions
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
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                          c.intensity === 'very-strong' ? 'bg-destructive/10 text-destructive' :
                          c.intensity === 'strong' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                          c.intensity === 'moderate' ? 'bg-primary/10 text-primary' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {c.intensity}
                        </span>
                      </div>
                      <span className="text-muted-foreground">{c.duration}s</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 5-1-1 Rule Info */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">📋 The 5-1-1 Rule</h4>
              <p className="text-sm text-muted-foreground">
                Go to the hospital when contractions are <strong>5 minutes</strong> apart, 
                last <strong>1 minute</strong> each, and continue for <strong>1 hour</strong>.
              </p>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <div className="bg-muted/30 rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground">
              ⚠️ This tool is for informational purposes only. Always follow your healthcare 
              provider's guidance about when to go to the hospital.
            </p>
          </div>
      </div>
    </ToolFrame>
  );
}