import React, { useState, useEffect } from 'react';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalDisclaimer } from '@/components/compliance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, AlertTriangle, Clock, Play, CheckCircle } from 'lucide-react';

interface MassageTechnique {
  id: string;
  name: string;
  area: string;
  duration: string;
  description: string;
  steps: string[];
  safetyNotes: string[];
  trimester: number[];
  icon: string;
}

const massageTechniques: MassageTechnique[] = [
  {
    id: 'shoulder-massage',
    name: 'Shoulder & Neck Relief',
    area: 'Upper Body',
    duration: '5-10 min',
    description: 'Gentle massage to relieve tension in shoulders and neck',
    steps: [
      'Sit comfortably or have partner stand behind you',
      'Apply gentle pressure to shoulder muscles',
      'Use circular motions moving from neck to shoulder edge',
      'Gently knead the trapezius muscle',
      'Finish with light strokes down the arms'
    ],
    safetyNotes: [
      'Avoid deep pressure on the spine',
      'Stop if feeling dizzy or uncomfortable'
    ],
    trimester: [1, 2, 3],
    icon: '💆'
  },
  {
    id: 'lower-back',
    name: 'Lower Back Massage',
    area: 'Back',
    duration: '5-10 min',
    description: 'Ease lower back tension and discomfort',
    steps: [
      'Lie on your side with pillow support',
      'Partner applies gentle pressure to lower back',
      'Use circular motions on either side of spine',
      'Focus on the sacrum area with light pressure',
      'Avoid direct pressure on the spine'
    ],
    safetyNotes: [
      'Never apply pressure directly on spine',
      'Use gentle pressure only',
      'Avoid if experiencing any contractions'
    ],
    trimester: [1, 2, 3],
    icon: '🙌'
  },
  {
    id: 'foot-massage',
    name: 'Foot & Ankle Relief',
    area: 'Lower Body',
    duration: '5-10 min',
    description: 'Reduce swelling and relieve tired feet',
    steps: [
      'Sit with feet elevated',
      'Apply lotion or oil to feet',
      'Use thumbs to massage the sole in circular motions',
      'Gently massage each toe',
      'Finish with ankle circles'
    ],
    safetyNotes: [
      'Avoid deep pressure on ankles',
      'Be gentle around pressure points',
      'Skip if feet are very swollen - consult doctor'
    ],
    trimester: [1, 2, 3],
    icon: '🦶'
  },
  {
    id: 'hand-massage',
    name: 'Hand & Wrist Massage',
    area: 'Upper Body',
    duration: '3-5 min',
    description: 'Relieve carpal tunnel symptoms and hand tension',
    steps: [
      'Apply lotion to hands',
      'Massage the palm with thumb in circular motions',
      'Gently pull and rotate each finger',
      'Massage between the bones on top of hand',
      'Finish with gentle wrist rotations'
    ],
    safetyNotes: [
      'Be gentle if experiencing carpal tunnel',
      'Stop if numbness increases'
    ],
    trimester: [1, 2, 3],
    icon: '🤲'
  },
  {
    id: 'leg-massage',
    name: 'Leg & Thigh Massage',
    area: 'Lower Body',
    duration: '5-10 min',
    description: 'Improve circulation and reduce leg cramps',
    steps: [
      'Lie on your side or sit comfortably',
      'Start from the thigh and work down',
      'Use long, gentle strokes toward the heart',
      'Gently knead the calf muscles',
      'Avoid deep pressure behind the knee'
    ],
    safetyNotes: [
      'Avoid deep pressure on calves',
      'Skip if legs are very swollen or painful',
      'Never massage varicose veins directly'
    ],
    trimester: [1, 2, 3],
    icon: '🦵'
  }
];

export default function PregnancyMassageGuide() {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [selectedTechnique, setSelectedTechnique] = useState<MassageTechnique | null>(null);
  const [currentTrimester, setCurrentTrimester] = useState(2);
  const [completedTechniques, setCompletedTechniques] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('massageCompletedToday');
    const savedDate = localStorage.getItem('massageLastDate');
    const today = new Date().toDateString();
    
    if (savedDate === today && saved) {
      setCompletedTechniques(JSON.parse(saved));
    } else {
      localStorage.setItem('massageLastDate', today);
      localStorage.setItem('massageCompletedToday', '[]');
    }
  }, []);

  const markComplete = (id: string) => {
    if (!completedTechniques.includes(id)) {
      const updated = [...completedTechniques, id];
      setCompletedTechniques(updated);
      localStorage.setItem('massageCompletedToday', JSON.stringify(updated));
    }
  };

  const filteredTechniques = massageTechniques.filter(t => t.trimester.includes(currentTrimester));

  if (showDisclaimer) {
    return (
      <MedicalDisclaimer
        toolName="Pregnancy Massage Guide"
        onAccept={() => setShowDisclaimer(false)}
      />
    );
  }

  return (
    <ToolFrame
      title="Pregnancy Massage Guide"
      subtitle="Safe massage techniques for pregnancy comfort"
      icon={Heart}
      mood="calm"
      toolId="pregnancy-massage-guide"
    >
      <div className="space-y-6">
        {/* Trimester Selector */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Your Trimester</h3>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((t) => (
                <button
                  key={t}
                  onClick={() => setCurrentTrimester(t)}
                  className={`py-3 rounded-lg font-semibold transition-all ${
                    currentTrimester === t
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  Trimester {t}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Safety Notice */}
        <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-amber-800 dark:text-amber-200">General Safety</h4>
                <ul className="text-sm text-amber-700 dark:text-amber-300 mt-1 space-y-1">
                  <li>• Avoid massaging the abdomen directly</li>
                  <li>• Use gentle pressure only</li>
                  <li>• Stop if you feel any discomfort</li>
                  <li>• Consult your doctor before starting</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Technique Detail */}
        {selectedTechnique && (
          <Card className="border-primary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selectedTechnique.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold">{selectedTechnique.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedTechnique.area} • {selectedTechnique.duration}</p>
                  </div>
                </div>
                <Button variant="ghost" onClick={() => setSelectedTechnique(null)}>✕</Button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">How to do it:</h4>
                  {selectedTechnique.steps.map((step, i) => (
                    <p key={i} className="text-sm text-muted-foreground mb-1">
                      {i + 1}. {step}
                    </p>
                  ))}
                </div>
                
                <div className="bg-destructive/5 p-4 rounded-lg border border-destructive/10">
                  <h4 className="font-semibold text-destructive mb-2">Safety Notes:</h4>
                  {selectedTechnique.safetyNotes.map((note, i) => (
                    <p key={i} className="text-sm text-muted-foreground">• {note}</p>
                  ))}
                </div>
                
                <Button 
                  onClick={() => {
                    markComplete(selectedTechnique.id);
                    setSelectedTechnique(null);
                  }}
                  className="w-full"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Complete
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Techniques List */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4">Massage Techniques</h3>
            <div className="space-y-3">
              {filteredTechniques.map((technique) => {
                const isCompleted = completedTechniques.includes(technique.id);
                return (
                  <button
                    key={technique.id}
                    onClick={() => setSelectedTechnique(technique)}
                    className={`w-full p-4 rounded-lg text-left transition-all flex items-center gap-4 ${
                      isCompleted 
                        ? 'bg-green-500/10 border border-green-500/20' 
                        : 'bg-muted/50 hover:bg-muted'
                    }`}
                  >
                    <span className="text-3xl">{technique.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{technique.name}</span>
                        {isCompleted && <CheckCircle className="w-4 h-4 text-green-600" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{technique.description}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-3 h-3" /> {technique.duration}
                        </span>
                      </div>
                    </div>
                    <Play className="w-5 h-5 text-primary" />
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
}
