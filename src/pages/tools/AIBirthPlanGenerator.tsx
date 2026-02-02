import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ToolFrame } from '@/components/ToolFrame';
import { MedicalInfoBar } from '@/components/compliance';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Download, Sparkles, ChevronDown, ChevronUp, Archive, Trash2, Clock, Loader2, FileDown, AlertCircle } from 'lucide-react';
import { usePregnancyAI } from '@/hooks/usePregnancyAI';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { safeParseLocalStorage, safeSaveToLocalStorage } from '@/lib/safeStorage';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { exportBirthPlanToPDF, MAX_SAVED_PLANS } from '@/lib/pdfExport';
import { Progress } from '@/components/ui/progress';

interface BirthPlanPreference {
  id: string;
  label: string;
  options: string[];
}

interface SavedPlan {
  id: string;
  date: string;
  preferences: Record<string, string>;
  notes: string;
  generatedPlan: string;
}

const birthPlanCategories: { title: string; preferences: BirthPlanPreference[] }[] = [
  {
    title: "Labor Environment",
    preferences: [
      { id: "lighting", label: "Room Lighting", options: ["Dim/Low", "Natural", "Bright", "No preference"] },
      { id: "music", label: "Music/Sounds", options: ["Relaxing music", "Nature sounds", "Silence", "My own playlist"] },
      { id: "movement", label: "Movement During Labor", options: ["Freedom to walk", "Birth ball", "Shower/tub access", "Bed rest only"] },
    ]
  },
  {
    title: "Pain Management",
    preferences: [
      { id: "painRelief", label: "Pain Relief Preference", options: ["Natural/no medication", "Epidural when needed", "IV pain medication", "Open to all options"] },
      { id: "laborSupport", label: "Labor Support", options: ["Partner only", "Doula", "Family members", "Medical staff only"] },
      { id: "relaxation", label: "Relaxation Techniques", options: ["Breathing exercises", "Massage", "Aromatherapy", "Hypnobirthing"] },
    ]
  },
  {
    title: "Delivery Preferences",
    preferences: [
      { id: "birthPosition", label: "Birth Position", options: ["Whatever feels natural", "Squatting", "Side-lying", "Standard/supine"] },
      { id: "pushing", label: "Pushing Style", options: ["Coached pushing", "Spontaneous/instinctive", "No preference"] },
      { id: "episiotomy", label: "Episiotomy", options: ["Avoid if possible", "Only if necessary", "No preference"] },
    ]
  },
  {
    title: "After Birth",
    preferences: [
      { id: "skinToSkin", label: "Immediate Skin-to-Skin", options: ["Yes, immediately", "After initial checks", "Partner first if needed"] },
      { id: "cordClamping", label: "Cord Clamping", options: ["Delayed clamping", "Immediate", "Partner to cut cord", "No preference"] },
      { id: "feeding", label: "Feeding Plan", options: ["Breastfeeding", "Formula feeding", "Combination", "Undecided"] },
    ]
  },
  {
    title: "Special Circumstances",
    preferences: [
      { id: "cesarean", label: "If C-Section Needed", options: ["Partner present", "Clear drape to see baby", "Skin-to-skin in OR if possible"] },
      { id: "photography", label: "Photography/Video", options: ["Yes, throughout", "Photos only", "After birth only", "No photography"] },
    ]
  }
];

export default function AIBirthPlanGenerator() {
  const [preferences, setPreferences] = useState<Record<string, string>>({});
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState('');
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [showArchive, setShowArchive] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Labor Environment']));
  
  const { streamChat, isLoading, error } = usePregnancyAI();
  const isInitialized = useRef(false);

  // Load saved plans
  useEffect(() => {
    const saved = safeParseLocalStorage<SavedPlan[]>('birthPlans', [], (data): data is SavedPlan[] => {
      return Array.isArray(data);
    });
    setSavedPlans(saved);
    isInitialized.current = true;
  }, []);

  // Save plans when changed
  useEffect(() => {
    if (isInitialized.current && savedPlans.length > 0) {
      safeSaveToLocalStorage('birthPlans', savedPlans);
    }
  }, [savedPlans]);

  const toggleSection = (title: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(title)) {
        newSet.delete(title);
      } else {
        newSet.add(title);
      }
      return newSet;
    });
  };

  const handlePreferenceChange = (id: string, value: string) => {
    setPreferences(prev => ({ ...prev, [id]: value }));
  };

  const generatePlan = useCallback(async () => {
    const selectedPrefs = Object.entries(preferences)
      .filter(([_, value]) => value)
      .map(([key, value]) => {
        const allPrefs = birthPlanCategories.flatMap(c => c.preferences);
        const pref = allPrefs.find(p => p.id === key);
        return `${pref?.label || key}: ${value}`;
      })
      .join('\n');

    if (!selectedPrefs) {
      toast.error('Please select at least one preference');
      return;
    }

    setGeneratedPlan('');

    await streamChat({
      type: 'pregnancy-assistant',
      messages: [
        {
          role: 'user',
          content: `Please create a comprehensive, professional birth plan based on these preferences:

${selectedPrefs}

${additionalNotes ? `Additional notes from the mother: ${additionalNotes}` : ''}

Create a detailed, well-organized birth plan document that:
1. Includes a warm introduction
2. Organizes preferences into clear sections
3. Uses professional but compassionate language
4. Includes backup plans for unexpected situations
5. Is formatted beautifully with headers and bullet points
6. Ends with a note about flexibility and trust in the medical team

Make it comprehensive and ready to share with healthcare providers.`
        }
      ],
      onDelta: (text) => setGeneratedPlan(prev => prev + text),
      onDone: () => {
        toast.success('Birth plan generated successfully!');
      }
    });
  }, [preferences, additionalNotes, streamChat]);

  const savePlan = useCallback(() => {
    if (!generatedPlan) {
      toast.error('Generate a plan first');
      return;
    }

    if (savedPlans.length >= MAX_SAVED_PLANS) {
      toast.error(`Maximum ${MAX_SAVED_PLANS} plans allowed. Please delete an old plan first.`);
      return;
    }

    const newPlan: SavedPlan = {
      id: `plan-${Date.now()}`,
      date: new Date().toISOString(),
      preferences,
      notes: additionalNotes,
      generatedPlan,
    };

    setSavedPlans(prev => [newPlan, ...prev]);
    toast.success('Birth plan saved to archive!');
  }, [generatedPlan, preferences, additionalNotes, savedPlans.length]);

  const deletePlan = useCallback((id: string) => {
    setSavedPlans(prev => prev.filter(p => p.id !== id));
    toast.success('Plan deleted');
  }, []);

  const exportPlanAsPDF = useCallback(() => {
    if (!generatedPlan) return;
    
    try {
      exportBirthPlanToPDF({
        title: 'Birth Plan',
        content: generatedPlan,
        date: format(new Date(), 'MMMM d, yyyy'),
        preferences
      });
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export PDF');
    }
  }, [generatedPlan, preferences]);

  const loadPlan = useCallback((plan: SavedPlan) => {
    setPreferences(plan.preferences);
    setAdditionalNotes(plan.notes);
    setGeneratedPlan(plan.generatedPlan);
    setShowArchive(false);
    toast.success('Plan loaded');
  }, []);

  return (
    <ToolFrame
      title="AI Birth Plan Generator"
      subtitle="Create your personalized birth plan with AI guidance"
      icon={FileText}
      mood="nurturing"
      toolId="ai-birth-plan"
    >
      <div className="space-y-6">
        <MedicalInfoBar compact />

        {/* Preference Sections */}
        {birthPlanCategories.map((category) => (
          <Card key={category.title}>
            <CardContent className="p-0">
              <button
                onClick={() => toggleSection(category.title)}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <h3 className="font-semibold text-sm">{category.title}</h3>
                {expandedSections.has(category.title) ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              
              {expandedSections.has(category.title) && (
                <div className="px-4 pb-4 space-y-4">
                  {category.preferences.map((pref) => (
                    <div key={pref.id}>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">
                        {pref.label}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {pref.options.map((option) => (
                          <button
                            key={option}
                            onClick={() => handlePreferenceChange(pref.id, option)}
                            className={`px-3 py-1.5 text-xs rounded-full transition-all ${
                              preferences[pref.id] === option
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Additional Notes */}
        <Card>
          <CardContent className="p-4">
            <label className="text-sm font-medium mb-2 block">Additional Notes or Requests</label>
            <Textarea
              placeholder="Any specific concerns, cultural considerations, or special requests..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Generate Button */}
        <Button
          onClick={generatePlan}
          disabled={isLoading}
          className="w-full gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate My Birth Plan
            </>
          )}
        </Button>

        {error && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4 text-destructive text-sm">{error}</CardContent>
          </Card>
        )}

        {/* Generated Plan */}
        {generatedPlan && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Your Birth Plan
                </h3>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={savePlan}
                    disabled={savedPlans.length >= MAX_SAVED_PLANS}
                  >
                    Save
                  </Button>
                  <Button 
                    size="sm" 
                    variant="default" 
                    onClick={exportPlanAsPDF}
                    className="gap-1"
                  >
                    <FileDown className="w-4 h-4" />
                    PDF
                  </Button>
                </div>
              </div>
              <MarkdownRenderer content={generatedPlan} />
            </CardContent>
          </Card>
        )}

        {/* Archive Section */}
        <Card>
          <CardContent className="p-4">
            <button
              onClick={() => setShowArchive(!showArchive)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Archive className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold">
                  Saved Plans ({savedPlans.length}/{MAX_SAVED_PLANS})
                </h3>
              </div>
              {showArchive ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            {/* Storage usage indicator */}
            <div className="mt-3">
              <Progress 
                value={(savedPlans.length / MAX_SAVED_PLANS) * 100} 
                className="h-2"
              />
              {savedPlans.length >= MAX_SAVED_PLANS && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Storage full - delete a plan to save new ones
                </p>
              )}
            </div>

            {showArchive && (
              <div className="mt-4 space-y-2">
                {savedPlans.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No saved plans yet. Generate and save your first birth plan!
                  </p>
                ) : (
                  savedPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            Birth Plan - {format(new Date(plan.date), 'MMM d, yyyy')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {Object.keys(plan.preferences).length} preferences set
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => loadPlan(plan)}>
                          Load
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            exportBirthPlanToPDF({
                              title: 'Birth Plan',
                              content: plan.generatedPlan,
                              date: format(new Date(plan.date), 'MMMM d, yyyy'),
                              preferences: plan.preferences
                            });
                          }}
                        >
                          <FileDown className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deletePlan(plan.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
}
