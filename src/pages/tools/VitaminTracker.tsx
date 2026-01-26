import React, { useState, useEffect } from 'react';
import { Pill, Plus, Check, Trash2, Clock, AlertTriangle, Info, Calendar, Brain, Sparkles } from 'lucide-react';
import { ToolFrame } from '@/components/ToolFrame';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { usePregnancyAI } from '@/hooks/usePregnancyAI';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { RelatedTools } from '@/components/RelatedTools';
import MedicalDisclaimer from '@/components/compliance/MedicalDisclaimer';

interface Vitamin {
  id: string;
  name: string;
  time: 'morning' | 'noon' | 'evening';
  taken: boolean;
  notes?: string;
}

const STORAGE_KEY = 'vitamin_tracker_data';

const defaultVitamins: Vitamin[] = [
  { id: 'folic', name: 'Folic Acid', time: 'morning', taken: false, notes: 'Best with water' },
  { id: 'prenatal', name: 'Prenatal Vitamin', time: 'noon', taken: false, notes: 'With food to avoid nausea' },
  { id: 'iron', name: 'Iron Supplement', time: 'evening', taken: false, notes: 'Avoid with calcium/dairy' },
];

const VitaminTracker: React.FC = () => {
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [vitamins, setVitamins] = useState<Vitamin[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultVitamins;
  });
  const [newVitamin, setNewVitamin] = useState('');
  const [selectedTime, setSelectedTime] = useState<'morning' | 'noon' | 'evening'>('morning');
  const [showInteractionWarning, setShowInteractionWarning] = useState<string | null>(null);
  
  // AI Features
  const { streamChat, isLoading } = usePregnancyAI();
  const [aiAdvice, setAiAdvice] = useState('');
  const [showAI, setShowAI] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vitamins));
    checkInteractions();
  }, [vitamins]);

  const toggleVitamin = (id: string) => {
    setVitamins(vitamins.map(v => 
      v.id === id ? { ...v, taken: !v.taken } : v
    ));
  };

  const addVitamin = () => {
    if (!newVitamin.trim()) return;
    const newItem: Vitamin = {
      id: Date.now().toString(),
      name: newVitamin,
      time: selectedTime,
      taken: false
    };
    setVitamins([...vitamins, newItem]);
    setNewVitamin('');
  };

  const deleteVitamin = (id: string) => {
    setVitamins(vitamins.filter(v => v.id !== id));
  };

  const checkInteractions = () => {
    const names = vitamins.map(v => v.name.toLowerCase());
    const hasIron = names.some(n => n.includes('iron'));
    const hasCalcium = names.some(n => n.includes('calcium') || n.includes('dairy'));
    
    if (hasIron && hasCalcium) {
      setShowInteractionWarning("Calcium can inhibit Iron absorption. Take them at different times (Iron in morning, Calcium at night).");
    } else {
      setShowInteractionWarning(null);
    }
  };

  const resetDaily = () => {
    if (confirm("Reset all checkboxes for a new day?")) {
      setVitamins(vitamins.map(v => ({ ...v, taken: false })));
    }
  };

  const getProgress = () => {
    if (vitamins.length === 0) return 0;
    const taken = vitamins.filter(v => v.taken).length;
    return Math.round((taken / vitamins.length) * 100);
  };

  const getAIAdvice = async () => {
    setShowAI(true);
    setAiAdvice('');
    
    const vitaminList = vitamins.map(v => `${v.name} (${v.time})`).join(', ');

    await streamChat({
      type: 'symptom-analysis',
      messages: [{
        role: 'user',
        content: `As a prenatal nutrition advisor, review this vitamin/supplement regimen for pregnancy:

Supplements: ${vitaminList}

Provide:
1. Assessment of the supplement combination
2. Potential interactions to watch for
3. Optimal timing recommendations
4. Any missing essential supplements for pregnancy
5. Tips for better absorption

Keep response concise and practical. Use markdown formatting.`
      }],
      onDelta: (text) => setAiAdvice(prev => prev + text),
      onDone: () => {}
    });
  };

  if (!disclaimerAccepted) {
    return <MedicalDisclaimer toolName="Smart Vitamin Tracker" onAccept={() => setDisclaimerAccepted(true)} />;
  }

  const timeSlots = ['morning', 'noon', 'evening'] as const;
  const timeIcons = { morning: '🌅', noon: '☀️', evening: '🌙' };

  return (
    <ToolFrame
      title="Smart Vitamin Tracker"
      subtitle="AI-powered supplement management"
      icon={Pill}
      mood="nurturing"
    >
      <div className="space-y-6">
        {/* Progress Card */}
        <Card className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/50 dark:to-emerald-950/50 border-teal-200/50">
          <CardContent className="pt-6">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Daily Progress</h2>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <span className="text-3xl font-bold text-teal-600">{getProgress()}%</span>
            </div>
            <Progress value={getProgress()} className="h-3" />
            
            <Button 
              onClick={resetDaily}
              variant="ghost"
              size="sm"
              className="mt-4 text-teal-600 hover:text-teal-700"
            >
              <Calendar className="w-4 h-4 mr-1" /> Start New Day
            </Button>
          </CardContent>
        </Card>

        {/* Interaction Warning */}
        <AnimatePresence>
          {showInteractionWarning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-800 dark:text-amber-200">{showInteractionWarning}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vitamin List by Time */}
        <div className="space-y-4">
          {timeSlots.map((timeSlot) => {
            const timeVitamins = vitamins.filter(v => v.time === timeSlot);
            if (timeVitamins.length === 0) return null;

            return (
              <Card key={timeSlot}>
                <CardContent className="pt-4">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span>{timeIcons[timeSlot]}</span>
                    <Clock className="w-4 h-4" />
                    {timeSlot}
                  </h3>
                  <div className="space-y-3">
                    {timeVitamins.map((vitamin) => (
                      <motion.div 
                        key={vitamin.id}
                        layout
                        className="flex items-start gap-3 group"
                      >
                        <button
                          onClick={() => toggleVitamin(vitamin.id)}
                          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all mt-0.5 ${
                            vitamin.taken
                              ? 'bg-teal-500 border-teal-500'
                              : 'border-muted-foreground/30 hover:border-teal-400'
                          }`}
                        >
                          {vitamin.taken && <Check className="w-4 h-4 text-white" />}
                        </button>
                        <div className="flex-1">
                          <p className={`font-medium transition-all ${vitamin.taken ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                            {vitamin.name}
                          </p>
                          {vitamin.notes && (
                            <p className="text-xs text-muted-foreground">{vitamin.notes}</p>
                          )}
                        </div>
                        <button 
                          onClick={() => deleteVitamin(vitamin.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded text-destructive transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Add New */}
        <Card>
          <CardContent className="pt-4">
            <h3 className="font-medium text-foreground mb-3">Add Supplement</h3>
            <div className="flex flex-col gap-3">
              <Input
                type="text"
                placeholder="Vitamin name (e.g. Magnesium)"
                value={newVitamin}
                onChange={(e) => setNewVitamin(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addVitamin()}
              />
              <div className="flex gap-2">
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value as 'morning' | 'noon' | 'evening')}
                  className="bg-muted border border-input rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="morning">🌅 Morning</option>
                  <option value="noon">☀️ Noon</option>
                  <option value="evening">🌙 Evening</option>
                </select>
                <Button onClick={addVitamin} className="flex-1">
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Advice Button */}
        {vitamins.length > 0 && (
          <Button
            onClick={getAIAdvice}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
          >
            <Brain className="w-5 h-5 mr-2" />
            {isLoading ? 'Analyzing...' : 'Get AI Supplement Advice'}
          </Button>
        )}

        {/* AI Advice Result */}
        <AnimatePresence>
          {showAI && aiAdvice && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200/50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-foreground">AI Supplement Advisor</h3>
                  </div>
                  <MarkdownRenderer content={aiAdvice} />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Footer */}
        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>Always consult your doctor before starting any new supplement regimen during pregnancy.</p>
        </div>

        {/* Related Tools */}
        <RelatedTools currentToolId="vitamin-tracker" />
      </div>
    </ToolFrame>
  );
};

export default VitaminTracker;
