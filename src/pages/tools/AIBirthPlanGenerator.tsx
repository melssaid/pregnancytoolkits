import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ToolFrame } from '@/components/ToolFrame';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Brain, ChevronDown, ChevronUp, Archive, Trash2, Clock, Loader2, AlertCircle } from 'lucide-react';
import { usePregnancyAI } from '@/hooks/usePregnancyAI';
import { AIActionButton } from '@/components/ai/AIActionButton';
import { useResetOnLanguageChange } from '@/hooks/useResetOnLanguageChange';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { AIResponseFrame } from '@/components/ai/AIResponseFrame';
import { safeParseLocalStorage, safeSaveToLocalStorage } from '@/lib/safeStorage';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { PrintableReport } from '@/components/PrintableReport';

import { Progress } from '@/components/ui/progress';

import { ToolHubNav, BIRTH_HUB_TABS } from '@/components/ToolHubNav';

const MAX_SAVED_PLANS = 9;

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
];

export default function AIBirthPlanGenerator() {
  const { t, i18n } = useTranslation();
  const [preferences, setPreferences] = useState<Record<string, string>>({});
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [generatedPlan, setGeneratedPlan] = useState('');
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set([birthPlanCategories[0].titleKey]));
  const [showArchive, setShowArchive] = useState(false);
  const { streamChat, isLoading, error } = usePregnancyAI();

  useResetOnLanguageChange(() => {
    setGeneratedPlan('');
  });
  const isInitialized = useRef(false);

  useEffect(() => {
    const saved = safeParseLocalStorage<SavedPlan[]>('birthPlans', [], (data): data is SavedPlan[] => Array.isArray(data));
    setSavedPlans(saved);
    isInitialized.current = true;
  }, []);

  useEffect(() => {
    if (isInitialized.current && savedPlans.length > 0) {
      safeSaveToLocalStorage('birthPlans', savedPlans);
    }
  }, [savedPlans]);

  const toggleSection = (title: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(title)) newSet.delete(title); else newSet.add(title);
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

    if (!selectedPrefs) { toast.error(t('toolsInternal.birthPlan.selectPreference')); return; }
    setGeneratedPlan('');
    const langCode = i18n.language?.split('-')[0] || 'en';
    const langNames: Record<string, string> = { en: 'English', ar: 'Arabic', de: 'German', tr: 'Turkish', fr: 'French', es: 'Spanish', pt: 'Portuguese' };

    await streamChat({
      type: 'birth-plan',
      messages: [{ role: 'user', content: `IMPORTANT: Write ENTIRE response in ${langNames[langCode] || 'English'}.\nCreate a comprehensive birth plan:\n${selectedPrefs}\n${additionalNotes ? `Notes: ${additionalNotes}` : ''}\nInclude introduction, organized sections, backup plans, and a flexibility note.` }],
      context: { language: langCode },
      onDelta: (text) => setGeneratedPlan(prev => prev + text),
      onDone: () => { toast.success(t('toolsInternal.birthPlan.planGenerated')); }
    });
  }, [preferences, additionalNotes, streamChat, t, i18n.language]);

  const savePlan = useCallback(() => {
    if (!generatedPlan) { toast.error(t('toolsInternal.birthPlan.selectPreference')); return; }
    if (savedPlans.length >= MAX_SAVED_PLANS) { toast.error(t('toolsInternal.birthPlan.storageFull')); return; }
    const newPlan: SavedPlan = { id: `plan-${Date.now()}`, date: new Date().toISOString(), preferences, notes: additionalNotes, generatedPlan };
    setSavedPlans(prev => [newPlan, ...prev]);
    toast.success(t('toolsInternal.birthPlan.planSaved'));
  }, [generatedPlan, preferences, additionalNotes, savedPlans.length, t]);

  const deletePlan = useCallback((id: string) => {
    setSavedPlans(prev => prev.filter(p => p.id !== id));
    toast.success(t('toolsInternal.birthPlan.planDeleted'));
  }, [t]);

  const loadPlan = useCallback((plan: SavedPlan) => {
    setPreferences(plan.preferences);
    setAdditionalNotes(plan.notes);
    setGeneratedPlan(plan.generatedPlan);
    setShowArchive(false);
    toast.success(t('toolsInternal.birthPlan.planLoaded'));
  }, [t]);

  return (
    <ToolFrame title={t('toolsInternal.birthPlan.title')} subtitle={t('toolsInternal.birthPlan.subtitle')} icon={FileText} mood="nurturing" toolId="ai-birth-plan">
      <ToolHubNav tabs={BIRTH_HUB_TABS} />
      <div className="space-y-4">
        {birthPlanCategories.map((category) => (
          <Card key={category.titleKey}>
            <CardContent className="p-0">
              <button onClick={() => toggleSection(category.titleKey)} className="w-full p-3 flex items-center justify-between text-left">
                <h3 className="font-semibold text-sm">{t(category.titleKey)}</h3>
                {expandedSections.has(category.titleKey) ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>
              {expandedSections.has(category.titleKey) && (
                <div className="px-3 pb-3 space-y-3">
                  {category.preferences.map((pref) => (
                    <div key={pref.id}>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">{t(pref.labelKey)}</label>
                      <div className="flex flex-wrap gap-2">
                        {pref.optionKeys.map((optionKey) => {
                          const optionValue = t(optionKey);
                          return (
                            <button key={optionKey} onClick={() => handlePreferenceChange(pref.id, optionValue)}
                              className={`px-3 py-1.5 text-xs rounded-full transition-all ${preferences[pref.id] === optionValue ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}`}>
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

        <Card>
          <CardContent className="p-3">
            <label className="text-xs font-medium mb-2 block">{t('toolsInternal.birthPlan.additionalNotes')}</label>
            <Textarea placeholder={t('toolsInternal.birthPlan.notesPlaceholder')} value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)} rows={3} />
          </CardContent>
        </Card>

        <AIActionButton
          onClick={generatePlan}
          isLoading={isLoading}
          label={t('toolsInternal.birthPlan.generateButton')}
          loadingLabel={t('toolsInternal.birthPlan.generating')}
        />

        {error && <Card className="border-destructive/30 bg-destructive/5"><CardContent className="p-3 text-destructive text-xs">{error}</CardContent></Card>}

        {generatedPlan && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Button size="sm" variant="outline" onClick={savePlan} disabled={savedPlans.length >= MAX_SAVED_PLANS}>
                {t('common.save')}
              </Button>
            </div>
            <PrintableReport title={t('toolsInternal.birthPlan.title')} isLoading={isLoading}>
              <AIResponseFrame
                content={generatedPlan}
                title={t('toolsInternal.birthPlan.yourBirthPlan')}
                icon={FileText}
                toolId="ai-birth-plan"
              />
            </PrintableReport>
          </div>
        )}

        <Card>
          <CardContent className="p-3">
            <button onClick={() => setShowArchive(!showArchive)} className="w-full flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Archive className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm">{t('toolsInternal.birthPlan.savedPlans', { count: savedPlans.length, max: MAX_SAVED_PLANS })}</h3>
              </div>
              {showArchive ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            <div className="mt-3">
              <Progress value={(savedPlans.length / MAX_SAVED_PLANS) * 100} className="h-2" />
              {savedPlans.length >= MAX_SAVED_PLANS && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{t('toolsInternal.birthPlan.storageFull')}</p>
              )}
            </div>
            {showArchive && (
              <div className="mt-4 space-y-2">
                {savedPlans.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">{t('toolsInternal.birthPlan.noSavedPlans')}</p>
                ) : (
                  savedPlans.map((plan) => (
                    <div key={plan.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{t('toolsInternal.birthPlan.planTitle')} - {format(new Date(plan.date), 'MMM d, yyyy')}</p>
                          <p className="text-xs text-muted-foreground">{t('toolsInternal.birthPlan.preferencesSet', { count: Object.keys(plan.preferences).length })}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => loadPlan(plan)}>{t('toolsInternal.birthPlan.load')}</Button>
                        <Button size="sm" variant="ghost" onClick={() => deletePlan(plan.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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
