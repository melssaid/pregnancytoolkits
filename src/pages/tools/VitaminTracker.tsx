import React, { useState, useEffect } from 'react';
import { Pill, Plus, Check, Trash2, Clock, AlertTriangle, Info, Calendar, Brain, Sparkles, Droplets, GlassWater, Target } from 'lucide-react';
import { ToolFrame } from '@/components/ToolFrame';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { usePregnancyAI } from '@/hooks/usePregnancyAI';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { RelatedTools } from '@/components/RelatedTools';
import MedicalDisclaimer from '@/components/compliance/MedicalDisclaimer';
import { toast } from 'sonner';

interface Vitamin {
  id: string;
  name: string;
  time: 'morning' | 'noon' | 'evening';
  taken: boolean;
  notes?: string;
}

interface WaterLog {
  id: string;
  amount: number; // in ml
  timestamp: Date;
}

const STORAGE_KEY = 'vitamin_tracker_data';
const WATER_STORAGE_KEY = 'water_tracker_data';
const WATER_GOAL_KEY = 'water_goal';

const defaultVitamins: Vitamin[] = [
  { id: 'folic', name: 'Folic Acid', time: 'morning', taken: false, notes: 'Best with water' },
  { id: 'prenatal', name: 'Prenatal Vitamin', time: 'noon', taken: false, notes: 'With food to avoid nausea' },
  { id: 'iron', name: 'Iron Supplement', time: 'evening', taken: false, notes: 'Avoid with calcium/dairy' },
];

const WATER_AMOUNTS = [
  { label: 'Small', amount: 150, icon: '🥤' },
  { label: 'Medium', amount: 250, icon: '🥛' },
  { label: 'Large', amount: 500, icon: '🍶' },
  { label: 'Bottle', amount: 750, icon: '🧴' },
];

const VitaminTracker: React.FC = () => {
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [activeTab, setActiveTab] = useState<'vitamins' | 'water'>('vitamins');
  
  // Vitamin State
  const [vitamins, setVitamins] = useState<Vitamin[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultVitamins;
  });
  const [newVitamin, setNewVitamin] = useState('');
  const [selectedTime, setSelectedTime] = useState<'morning' | 'noon' | 'evening'>('morning');
  const [showInteractionWarning, setShowInteractionWarning] = useState<string | null>(null);
  
  // Water State
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>(() => {
    const saved = localStorage.getItem(WATER_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Filter to today's logs only
      const today = new Date().toDateString();
      return parsed.filter((log: WaterLog) => new Date(log.timestamp).toDateString() === today);
    }
    return [];
  });
  const [waterGoal, setWaterGoal] = useState<number>(() => {
    const saved = localStorage.getItem(WATER_GOAL_KEY);
    return saved ? parseInt(saved) : 2500; // Default 2.5L for pregnancy
  });
  const [customAmount, setCustomAmount] = useState('');
  
  // AI Features
  const { streamChat, isLoading } = usePregnancyAI();
  const [aiAdvice, setAiAdvice] = useState('');
  const [showAI, setShowAI] = useState(false);

  // Persist vitamins
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vitamins));
    checkInteractions();
  }, [vitamins]);

  // Persist water logs
  useEffect(() => {
    localStorage.setItem(WATER_STORAGE_KEY, JSON.stringify(waterLogs));
  }, [waterLogs]);

  // Persist water goal
  useEffect(() => {
    localStorage.setItem(WATER_GOAL_KEY, waterGoal.toString());
  }, [waterGoal]);

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
      setWaterLogs([]);
    }
  };

  const getProgress = () => {
    if (vitamins.length === 0) return 0;
    const taken = vitamins.filter(v => v.taken).length;
    return Math.round((taken / vitamins.length) * 100);
  };

  // Water Functions
  const addWater = (amount: number) => {
    const newLog: WaterLog = {
      id: Date.now().toString(),
      amount,
      timestamp: new Date(),
    };
    setWaterLogs(prev => [...prev, newLog]);
    
    const newTotal = getTotalWater() + amount;
    if (newTotal >= waterGoal && getTotalWater() < waterGoal) {
      toast.success('🎉 Congratulations! You reached your daily water goal!');
    }
  };

  const addCustomWater = () => {
    const amount = parseInt(customAmount);
    if (amount > 0 && amount <= 2000) {
      addWater(amount);
      setCustomAmount('');
      toast.success(`Added ${amount}ml`);
    }
  };

  const removeLastWater = () => {
    if (waterLogs.length > 0) {
      setWaterLogs(prev => prev.slice(0, -1));
      toast.info('Removed last entry');
    }
  };

  const getTotalWater = () => {
    return waterLogs.reduce((sum, log) => sum + log.amount, 0);
  };

  const getWaterProgress = () => {
    return Math.min((getTotalWater() / waterGoal) * 100, 100);
  };

  const getWaterRemaining = () => {
    return Math.max(waterGoal - getTotalWater(), 0);
  };

  const getAIAdvice = async () => {
    setShowAI(true);
    setAiAdvice('');
    
    const vitaminList = vitamins.map(v => `${v.name} (${v.time})`).join(', ');
    const waterInfo = `Water intake today: ${getTotalWater()}ml of ${waterGoal}ml goal`;

    await streamChat({
      type: 'symptom-analysis',
      messages: [{
        role: 'user',
        content: `As a prenatal nutrition advisor, review this vitamin/supplement regimen and hydration for pregnancy:

Supplements: ${vitaminList}
${waterInfo}

Provide:
1. Assessment of the supplement combination
2. Potential interactions to watch for
3. Optimal timing recommendations
4. Hydration assessment and tips for pregnancy
5. Tips for better absorption

Keep response concise and practical. Use markdown formatting.`
      }],
      onDelta: (text) => setAiAdvice(prev => prev + text),
      onDone: () => {}
    });
  };

  if (!disclaimerAccepted) {
    return <MedicalDisclaimer toolName="Smart Nutrition Tracker" onAccept={() => setDisclaimerAccepted(true)} />;
  }

  const timeSlots = ['morning', 'noon', 'evening'] as const;
  const timeIcons = { morning: '🌅', noon: '☀️', evening: '🌙' };

  return (
    <ToolFrame
      title="Smart Nutrition Tracker"
      subtitle="Vitamins & Hydration for pregnancy"
      toolId="vitamin-tracker"
      mood="nurturing"
    >
      <div className="space-y-6">
        {/* Tab Switcher */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'vitamins' | 'water')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="vitamins" className="flex items-center gap-2">
              <Pill className="w-4 h-4" />
              Vitamins
            </TabsTrigger>
            <TabsTrigger value="water" className="flex items-center gap-2">
              <Droplets className="w-4 h-4" />
              Water
            </TabsTrigger>
          </TabsList>

          {/* VITAMINS TAB */}
          <TabsContent value="vitamins" className="space-y-4 mt-4">
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
          </TabsContent>

          {/* WATER TAB */}
          <TabsContent value="water" className="space-y-4 mt-4">
            {/* Water Progress Card */}
            <Card className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950/50 dark:to-blue-950/50 border-sky-200/50">
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <motion.div 
                    className="relative inline-block"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                  >
                    <div className="w-32 h-32 mx-auto relative">
                      {/* Background circle */}
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          className="text-sky-100 dark:text-sky-900"
                        />
                        <motion.circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          className="text-sky-500"
                          strokeLinecap="round"
                          strokeDasharray={352}
                          initial={{ strokeDashoffset: 352 }}
                          animate={{ strokeDashoffset: 352 - (352 * getWaterProgress()) / 100 }}
                          transition={{ duration: 0.5 }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Droplets className="w-6 h-6 text-sky-500 mb-1" />
                        <span className="text-2xl font-bold text-foreground">
                          {(getTotalWater() / 1000).toFixed(1)}L
                        </span>
                      </div>
                    </div>
                  </motion.div>
                  
                  <p className="text-sm text-muted-foreground mt-2">
                    of {(waterGoal / 1000).toFixed(1)}L daily goal
                  </p>
                  
                  {getWaterRemaining() > 0 ? (
                    <p className="text-xs text-sky-600 mt-1">
                      {getWaterRemaining()}ml remaining
                    </p>
                  ) : (
                    <p className="text-xs text-green-600 mt-1 font-medium">
                      ✓ Goal reached! Great job staying hydrated!
                    </p>
                  )}
                </div>

                {/* Quick Add Buttons */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {WATER_AMOUNTS.map((item) => (
                    <Button
                      key={item.amount}
                      variant="outline"
                      onClick={() => addWater(item.amount)}
                      className="flex flex-col h-auto py-3 hover:bg-sky-50 hover:border-sky-300"
                    >
                      <span className="text-xl mb-1">{item.icon}</span>
                      <span className="text-xs font-medium">{item.amount}ml</span>
                    </Button>
                  ))}
                </div>

                {/* Custom Amount */}
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Custom ml..."
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCustomWater()}
                    className="flex-1"
                    min="1"
                    max="2000"
                  />
                  <Button onClick={addCustomWater} disabled={!customAmount}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Undo Button */}
                {waterLogs.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeLastWater}
                    className="mt-3 text-muted-foreground"
                  >
                    Undo last ({waterLogs[waterLogs.length - 1]?.amount}ml)
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Daily Goal Setting */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-sky-500" />
                    <span className="font-medium">Daily Goal</span>
                  </div>
                  <select
                    value={waterGoal}
                    onChange={(e) => setWaterGoal(parseInt(e.target.value))}
                    className="bg-muted border border-input rounded-lg px-3 py-1.5 text-sm"
                  >
                    <option value="2000">2.0L (Normal)</option>
                    <option value="2500">2.5L (Pregnancy)</option>
                    <option value="3000">3.0L (Active/Hot)</option>
                    <option value="3500">3.5L (Very Active)</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Water Log History */}
            {waterLogs.length > 0 && (
              <Card>
                <CardContent className="pt-4">
                  <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                    <GlassWater className="w-4 h-4 text-sky-500" />
                    Today's Log ({waterLogs.length} drinks)
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {[...waterLogs].reverse().map((log) => (
                      <div key={log.id} className="flex justify-between items-center text-sm py-1 border-b border-muted last:border-0">
                        <span className="text-muted-foreground">
                          {new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="font-medium text-sky-600">+{log.amount}ml</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Hydration Tips */}
            <Card className="bg-sky-50/50 dark:bg-sky-950/20 border-sky-100">
              <CardContent className="pt-4">
                <h4 className="font-medium text-sm text-sky-700 dark:text-sky-300 mb-2">💡 Pregnancy Hydration Tips</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Drink 8-12 glasses (2-3L) of water daily during pregnancy</li>
                  <li>• Increase intake in hot weather or after exercise</li>
                  <li>• Staying hydrated helps prevent UTIs and constipation</li>
                  <li>• Proper hydration supports amniotic fluid levels</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* AI Advice Button */}
        <Button
          onClick={getAIAdvice}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
        >
          <Brain className="w-5 h-5 mr-2" />
          {isLoading ? 'Analyzing...' : 'Get AI Nutrition Advice'}
        </Button>

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
                    <h3 className="font-semibold text-foreground">AI Nutrition Advisor</h3>
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
