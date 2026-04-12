import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Stethoscope, ChevronLeft, ChevronRight, Ruler, Weight, Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const HEALTH_CONDITIONS = [
  'gestationalDiabetes',
  'highBloodPressure',
  'twinPregnancy',
  'thyroidDisorder',
  'none',
] as const;

interface Props {
  weight: string;
  onWeightChange: (w: string) => void;
  height: string;
  onHeightChange: (h: string) => void;
  bloodType: string;
  onBloodTypeChange: (bt: string) => void;
  healthConditions: string[];
  onHealthConditionsChange: (conditions: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export const OnboardingStep3Health: React.FC<Props> = ({
  weight, onWeightChange, height, onHeightChange,
  bloodType, onBloodTypeChange,
  healthConditions, onHealthConditionsChange,
  onNext, onBack,
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;
  const BackIcon = isRtl ? ChevronRight : ChevronLeft;

  const toggleCondition = (c: string) => {
    if (c === 'none') {
      onHealthConditionsChange(['none']);
      return;
    }
    const without = healthConditions.filter(x => x !== 'none');
    if (without.includes(c)) {
      onHealthConditionsChange(without.filter(x => x !== c));
    } else {
      onHealthConditionsChange([...without, c]);
    }
  };

  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
      transition={{ duration: 0.2 }}
    >
      {/* Compact header */}
      <div className="px-5 pt-2 pb-1.5 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Stethoscope className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground leading-tight">
            {t('onboarding.step3.title', 'Your Health Data')}
          </h2>
          <p className="text-[10px] text-foreground/60 font-medium leading-snug">
            {t('onboarding.step3.subtitle', 'Helps us give accurate recommendations')}
          </p>
        </div>
      </div>

      <div className="px-4 pb-2.5 space-y-2">
        {/* Weight, Height & Blood Type — 3 columns */}
        <div className="grid grid-cols-3 gap-1.5">
          <div>
            <label className="text-[10px] font-semibold text-foreground/70 block mb-0.5">
              {t('onboarding.weight', 'Weight')} (kg)
            </label>
            <input
              type="number" min={30} max={200} step={0.1}
              value={weight}
              onChange={e => onWeightChange(e.target.value)}
              className="w-full h-8 rounded-lg border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
              placeholder="65"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-foreground/70 block mb-0.5">
              {t('onboarding.height', 'Height')} (cm)
            </label>
            <input
              type="number" min={100} max={220}
              value={height}
              onChange={e => onHeightChange(e.target.value)}
              className="w-full h-8 rounded-lg border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
              placeholder="165"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-foreground/70 block mb-0.5">
              {t('onboarding.step3.bloodType', 'Blood Type')}
            </label>
            <Select value={bloodType} onValueChange={onBloodTypeChange}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder={t('onboarding.step3.selectBloodType', 'Select')} />
              </SelectTrigger>
              <SelectContent className="z-[400]">
                <SelectItem value="unknown">{t('onboarding.step3.unknown', 'Unknown')}</SelectItem>
                {BLOOD_TYPES.map(bt => (
                  <SelectItem key={bt} value={bt}>{bt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Health Conditions — 2 columns */}
        <div>
          <label className="text-[10px] font-semibold text-foreground/70 block mb-1">
            {t('onboarding.step3.healthConsiderations', 'Health Considerations')}
          </label>
          <div className="grid grid-cols-2 gap-1">
            {HEALTH_CONDITIONS.map((c) => {
              const isSelected = healthConditions.includes(c);
              return (
                <button
                  key={c}
                  onClick={() => toggleCondition(c)}
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-[10px] text-start transition-colors",
                    isSelected
                      ? "bg-primary/8 border-primary/30 text-primary font-semibold"
                      : "bg-transparent border-border/40 text-foreground/70 hover:bg-muted/40"
                  )}
                >
                  <div className={cn(
                    "w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-colors",
                    isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"
                  )}>
                    {isSelected && <span className="text-primary-foreground text-[8px] font-bold">✓</span>}
                  </div>
                  <span className="leading-tight">{t(`onboarding.step3.condition.${c}`)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-4 pb-3 flex gap-2">
        <button onClick={onBack} className="flex-1 py-2.5 rounded-xl border border-border text-xs font-medium flex items-center justify-center gap-1 hover:bg-muted/40 transition-colors">
          <BackIcon className="w-3.5 h-3.5" /> {t('onboarding.back', 'Back')}
        </button>
        <button onClick={onNext} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity">
          {t('onboarding.next', 'Continue')} <NextIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};
