import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ToolFrame } from '@/components/ToolFrame';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Download, Sparkles, ChevronDown, ChevronUp, Archive, Trash2, Clock, Loader2, FileDown, AlertCircle } from 'lucide-react';
import { usePregnancyAI } from '@/hooks/usePregnancyAI';
import { useResetOnLanguageChange } from '@/hooks/useResetOnLanguageChange';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { safeParseLocalStorage, safeSaveToLocalStorage } from '@/lib/safeStorage';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { exportBirthPlanToPDF, MAX_SAVED_PLANS } from '@/lib/pdfExport';
import { Progress } from '@/components/ui/progress';

interface BirthPlanPreference {
  id: string;
  labelKey: string;
  optionKeys: string[];
}

interface SavedPlan {
  id: string;
  date: string;
  preferences: Record<string, string>;
  notes: string;
  generatedPlan: string;
}

const birthPlanCategories: { titleKey: string; preferences: BirthPlanPreference[] }[] = [
  {
    titleKey: "toolsInternal.birthPlan.categories.laborEnvironment",
    preferences: [
      { id: "lighting", labelKey: "toolsInternal.birthPlan.prefs.lighting.label", optionKeys: ["toolsInternal.birthPlan.prefs.lighting.dim", "toolsInternal.birthPlan.prefs.lighting.natural", "toolsInternal.birthPlan.prefs.lighting.bright", "toolsInternal.birthPlan.prefs.lighting.noPreference"] },
      { id: "music", labelKey: "toolsInternal.birthPlan.prefs.music.label", optionKeys: ["toolsInternal.birthPlan.prefs.music.relaxing", "toolsInternal.birthPlan.prefs.music.nature", "toolsInternal.birthPlan.prefs.music.silence", "toolsInternal.birthPlan.prefs.music.ownPlaylist"] },
      { id: "movement", labelKey: "toolsInternal.birthPlan.prefs.movement.label", optionKeys: ["toolsInternal.birthPlan.prefs.movement.walk", "toolsInternal.birthPlan.prefs.movement.ball", "toolsInternal.birthPlan.prefs.movement.shower", "toolsInternal.birthPlan.prefs.movement.bedRest"] },
    ]
  },
  {
    titleKey: "toolsInternal.birthPlan.categories.painManagement",
    preferences: [
      { id: "painRelief", labelKey: "toolsInternal.birthPlan.prefs.painRelief.label", optionKeys: ["toolsInternal.birthPlan.prefs.painRelief.natural", "toolsInternal.birthPlan.prefs.painRelief.epidural", "toolsInternal.birthPlan.prefs.painRelief.iv", "toolsInternal.birthPlan.prefs.painRelief.openToAll"] },
      { id: "laborSupport", labelKey: "toolsInternal.birthPlan.prefs.laborSupport.label", optionKeys: ["toolsInternal.birthPlan.prefs.laborSupport.partner", "toolsInternal.birthPlan.prefs.laborSupport.doula", "toolsInternal.birthPlan.prefs.laborSupport.family", "toolsInternal.birthPlan.prefs.laborSupport.medical"] },
      { id: "relaxation", labelKey: "toolsInternal.birthPlan.prefs.relaxation.label", optionKeys: ["toolsInternal.birthPlan.prefs.relaxation.breathing", "toolsInternal.birthPlan.prefs.relaxation.massage", "toolsInternal.birthPlan.prefs.relaxation.aromatherapy", "toolsInternal.birthPlan.prefs.relaxation.hypnobirthing"] },
    ]
  },
  {
    titleKey: "toolsInternal.birthPlan.categories.deliveryPreferences",
    preferences: [
      { id: "birthPosition", labelKey: "toolsInternal.birthPlan.prefs.birthPosition.label", optionKeys: ["toolsInternal.birthPlan.prefs.birthPosition.natural", "toolsInternal.birthPlan.prefs.birthPosition.squatting", "toolsInternal.birthPlan.prefs.birthPosition.sideLying", "toolsInternal.birthPlan.prefs.birthPosition.supine"] },
      { id: "pushing", labelKey: "toolsInternal.birthPlan.prefs.pushing.label", optionKeys: ["toolsInternal.birthPlan.prefs.pushing.coached", "toolsInternal.birthPlan.prefs.pushing.spontaneous", "toolsInternal.birthPlan.prefs.pushing.noPreference"] },
      { id: "episiotomy", labelKey: "toolsInternal.birthPlan.prefs.episiotomy.label", optionKeys: ["toolsInternal.birthPlan.prefs.episiotomy.avoid", "toolsInternal.birthPlan.prefs.episiotomy.ifNecessary", "toolsInternal.birthPlan.prefs.episiotomy.noPreference"] },
    ]
  },
  {
    titleKey: "toolsInternal.birthPlan.categories.afterBirth",
    preferences: [
      { id: "firstMoments", labelKey: "toolsInternal.birthPlan.prefs.firstMoments.label", optionKeys: ["toolsInternal.birthPlan.prefs.firstMoments.immediately", "toolsInternal.birthPlan.prefs.firstMoments.afterChecks", "toolsInternal.birthPlan.prefs.firstMoments.partnerFirst"] },
      { id: "cordClamping", labelKey: "toolsInternal.birthPlan.prefs.cordClamping.label", optionKeys: ["toolsInternal.birthPlan.prefs.cordClamping.delayed", "toolsInternal.birthPlan.prefs.cordClamping.immediate", "toolsInternal.birthPlan.prefs.cordClamping.partnerCut", "toolsInternal.birthPlan.prefs.cordClamping.noPreference"] },
      { id: "feeding", labelKey: "toolsInternal.birthPlan.prefs.feeding.label", optionKeys: ["toolsInternal.birthPlan.prefs.feeding.breastfeeding", "toolsInternal.birthPlan.prefs.feeding.formula", "toolsInternal.birthPlan.prefs.feeding.combination", "toolsInternal.birthPlan.prefs.feeding.undecided"] },
    ]
  },
  {
    titleKey: "toolsInternal.birthPlan.categories.specialCircumstances",
    preferences: [
      { id: "cesarean", labelKey: "toolsInternal.birthPlan.prefs.cesarean.label", optionKeys: ["toolsInternal.birthPlan.prefs.cesarean.partnerPresent", "toolsInternal.birthPlan.prefs.cesarean.familyCentered", "toolsInternal.birthPlan.prefs.cesarean.calmEnvironment"] },
      { id: "photography", labelKey: "toolsInternal.birthPlan.prefs.photography.label", optionKeys: ["toolsInternal.birthPlan.prefs.photography.throughout", "toolsInternal.birthPlan.prefs.photography.photosOnly", "toolsInternal.birthPlan.prefs.photography.afterBirth", "toolsInternal.birthPlan.prefs.photography.none"] },
    ]
  }
];

export default function AIBirthPlanGenerator() {
  const { t, i18n } = useTranslation();
  const [preferences, setPreferences] = useState<Record<string, string>>({});
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState('');
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [showArchive, setShowArchive] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['toolsInternal.birthPlan.categories.laborEnvironment']));
  
  const { streamChat, isLoading, error } = usePregnancyAI();

  useResetOnLanguageChange(() => {
    setGeneratedPlan('');
  });
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
        return `${pref ? t(pref.labelKey) : key}: ${value}`;
      })
      .join('\n');

    if (!selectedPrefs) {
      toast.error(t('toolsInternal.birthPlan.selectPreference'));
      return;
    }

    setGeneratedPlan('');

    const langCode = i18n.language?.split('-')[0] || 'en';
    const langNames: Record<string, string> = {
      en: 'English', ar: 'Arabic', de: 'German', tr: 'Turkish',
      fr: 'French', es: 'Spanish', pt: 'Portuguese'
    };
    const langName = langNames[langCode] || 'English';

    await streamChat({
      type: 'pregnancy-assistant',
      messages: [
        {
          role: 'user',
          content: `IMPORTANT: You MUST write the ENTIRE response in ${langName} language ONLY. Every word, title, section header, and bullet point must be in ${langName}.

Create a comprehensive, professional birth plan based on these preferences:

${selectedPrefs}

${additionalNotes ? `Additional notes from the mother: ${additionalNotes}` : ''}

Create a detailed, well-organized birth plan document that:
1. Includes a warm introduction
2. Organizes preferences into clear sections
3. Uses professional but compassionate language
4. Includes backup plans for unexpected situations
5. Is formatted beautifully with headers and bullet points
6. Ends with a note about flexibility and trust in the medical team

Make it comprehensive and ready to share with healthcare providers.
REMINDER: The ENTIRE response must be in ${langName}. Do NOT use any other language.`
        }
      ],
      context: { language: langCode },
      onDelta: (text) => setGeneratedPlan(prev => prev + text),
      onDone: () => {
        toast.success(t('toolsInternal.birthPlan.planGenerated'));
      }
    });
  }, [preferences, additionalNotes, streamChat, t, i18n.language]);

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

  const planContentRef = useRef<HTMLDivElement>(null);

  const exportPlanAsPDF = useCallback(async () => {
    if (!generatedPlan || !planContentRef.current) return;
    
    try {
      await exportBirthPlanToPDF({
        title: t('toolsInternal.birthPlan.title'),
        content: generatedPlan,
        date: format(new Date(), 'MMMM d, yyyy'),
        preferences,
        language: i18n.language?.split('-')[0] || 'en',
        contentElement: planContentRef.current,
      });
      toast.success(t('toolsInternal.birthPlan.pdfSuccess'));
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error(t('toolsInternal.birthPlan.pdfError'));
    }
  }, [generatedPlan, preferences, t, i18n.language]);

  const loadPlan = useCallback((plan: SavedPlan) => {
    setPreferences(plan.preferences);
    setAdditionalNotes(plan.notes);
    setGeneratedPlan(plan.generatedPlan);
    setShowArchive(false);
    toast.success('Plan loaded');
  }, []);

  return (
    <ToolFrame
      title={t('toolsInternal.birthPlan.title')}
      subtitle={t('toolsInternal.birthPlan.subtitle')}
      icon={FileText}
      mood="nurturing"
      toolId="ai-birth-plan"
    >
      <div className="space-y-6">

        {/* Preference Sections */}
        {birthPlanCategories.map((category) => (
          <Card key={category.titleKey}>
            <CardContent className="p-0">
              <button
                onClick={() => toggleSection(category.titleKey)}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <h3 className="font-semibold text-sm">{t(category.titleKey)}</h3>
                {expandedSections.has(category.titleKey) ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              
              {expandedSections.has(category.titleKey) && (
                <div className="px-4 pb-4 space-y-4">
                  {category.preferences.map((pref) => (
                    <div key={pref.id}>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">
                        {t(pref.labelKey)}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {pref.optionKeys.map((optionKey) => {
                          const optionValue = t(optionKey);
                          return (
                            <button
                              key={optionKey}
                              onClick={() => handlePreferenceChange(pref.id, optionValue)}
                              className={`px-3 py-1.5 text-xs rounded-full transition-all ${
                                preferences[pref.id] === optionValue
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                              }`}
                            >
                              {optionValue}
                            </button>
                          );
                        })}
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
            <label className="text-sm font-medium mb-2 block">{t('toolsInternal.birthPlan.additionalNotes')}</label>
            <Textarea
              placeholder={t('toolsInternal.birthPlan.notesPlaceholder')}
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
              {t('toolsInternal.birthPlan.generating')}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {t('toolsInternal.birthPlan.generateButton')}
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
              <div className="flex flex-col gap-2 mb-4">
                <h3 className="font-semibold flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-primary shrink-0" />
                  {t('toolsInternal.birthPlan.yourBirthPlan')}
                </h3>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={savePlan}
                    disabled={savedPlans.length >= MAX_SAVED_PLANS}
                    className="flex-1"
                  >
                    {t('common.save')}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="default" 
                    onClick={exportPlanAsPDF}
                    className="gap-1 flex-1"
                  >
                    <FileDown className="w-4 h-4 shrink-0" />
                    PDF
                  </Button>
                </div>
              </div>
              <div ref={planContentRef}>
                <MarkdownRenderer content={generatedPlan} />
              </div>
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
                  {t('toolsInternal.birthPlan.savedPlans', { count: savedPlans.length, max: MAX_SAVED_PLANS })}
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
                  {t('toolsInternal.birthPlan.storageFull')}
                </p>
              )}
            </div>

            {showArchive && (
              <div className="mt-4 space-y-2">
                {savedPlans.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {t('toolsInternal.birthPlan.noSavedPlans')}
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
                            {t('toolsInternal.birthPlan.planTitle')} - {format(new Date(plan.date), 'MMM d, yyyy')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t('toolsInternal.birthPlan.preferencesSet', { count: Object.keys(plan.preferences).length })}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => loadPlan(plan)}>
                          {t('toolsInternal.birthPlan.load')}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={async () => {
                            await exportBirthPlanToPDF({
                              title: t('toolsInternal.birthPlan.title'),
                              content: plan.generatedPlan,
                              date: format(new Date(plan.date), 'MMMM d, yyyy'),
                              preferences: plan.preferences,
                              language: i18n.language?.split('-')[0] || 'en',
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
