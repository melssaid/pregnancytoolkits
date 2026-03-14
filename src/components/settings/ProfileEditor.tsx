import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarIcon, Save, Baby, Gauge, Calendar, Ruler, Droplets, TrendingDown, TrendingUp, Minus, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUserProfile, computeWeekFromLMP } from '@/hooks/useUserProfile';
import { formatLocalized } from '@/lib/dateLocale';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

interface ProfileEditorProps {
  compact?: boolean;
}

/** حساب BMI ووصفه للحامل */
function calcBMI(weightKg: number, heightCm: number) {
  if (!weightKg || !heightCm || heightCm < 100) return null;
  const hm = heightCm / 100;
  const bmi = weightKg / (hm * hm);
  return Math.round(bmi * 10) / 10;
}

function getBMICategory(bmi: number) {
  if (bmi < 18.5) return { key: 'underweight', variant: 'warn' as const };
  if (bmi < 25)   return { key: 'normal',      variant: 'good' as const };
  if (bmi < 30)   return { key: 'overweight',  variant: 'warn' as const };
  return           { key: 'obese',             variant: 'bad'  as const };
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ compact = false }) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { profile, updateProfile, setLastPeriodDate } = useUserProfile();

  const [isPregnant, setIsPregnant] = useState(profile.isPregnant ?? true);
  const [weekInput, setWeekInput] = useState(String(profile.pregnancyWeek));
  const [weightInput, setWeightInput] = useState(profile.weight !== null ? String(profile.weight) : '');
  const [heightInput, setHeightInput] = useState(profile.height !== null ? String(profile.height) : '');
  const [bloodType, setBloodType] = useState<string>(profile.bloodType ?? '');
  const [selectedLMP, setSelectedLMP] = useState<Date | undefined>(
    profile.lastPeriodDate ? new Date(profile.lastPeriodDate) : undefined
  );
  const [lmpOpen, setLmpOpen] = useState(false);

  const bmi = calcBMI(parseFloat(weightInput), parseFloat(heightInput));
  const bmiCategory = bmi ? getBMICategory(bmi) : null;

  const handleSave = () => {
    updateProfile({ isPregnant });

    if (isPregnant) {
      const week = parseInt(weekInput);
      if (!isNaN(week) && week >= 1 && week <= 42) {
        updateProfile({ pregnancyWeek: week });
      }

      if (selectedLMP) {
        const lmpStr = selectedLMP.toISOString().split('T')[0];
        setLastPeriodDate(lmpStr);
        const computed = computeWeekFromLMP(lmpStr);
        setWeekInput(String(computed));
      } else if (!selectedLMP && profile.lastPeriodDate) {
        setLastPeriodDate(null);
      }
    }

    const weight = parseFloat(weightInput);
    if (!isNaN(weight) && weight > 0) {
      updateProfile({ weight });
    } else if (weightInput === '') {
      updateProfile({ weight: null });
    }

    const height = parseFloat(heightInput);
    if (!isNaN(height) && height > 0) {
      updateProfile({ height });
    } else if (heightInput === '') {
      updateProfile({ height: null });
    }

    updateProfile({ bloodType: (bloodType && bloodType !== 'unknown') ? bloodType : null });

    toast.success(t('settings.profile.saved', 'Profile updated successfully'));
  };

  const handleLMPSelect = (date: Date | undefined) => {
    setSelectedLMP(date);
    setLmpOpen(false);
    if (date) {
      const lmpStr = date.toISOString().split('T')[0];
      const computed = computeWeekFromLMP(lmpStr);
      setWeekInput(String(computed));
    }
  };

  return (
    <div className="space-y-4">
      {/* Pregnancy Status Toggle */}
      <div className="space-y-1.5">
        <Label className="flex items-center gap-1.5 text-xs font-medium">
          <Baby className="w-3.5 h-3.5 text-primary" />
          {t('onboarding.pregnancyStatus', 'Pregnancy Status')}
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setIsPregnant(true)}
            className={cn(
              "py-2 rounded-lg border text-xs font-medium transition-all flex items-center justify-center gap-1.5",
              isPregnant
                ? "bg-primary/10 border-primary/40 text-primary"
                : "bg-background/60 border-border text-muted-foreground hover:bg-muted/50"
            )}
          >
            <Baby className="w-3.5 h-3.5" />
            {t('onboarding.pregnant', 'Pregnant')}
          </button>
          <button
            type="button"
            onClick={() => setIsPregnant(false)}
            className={cn(
              "py-2 rounded-lg border text-xs font-medium transition-all flex items-center justify-center gap-1.5",
              !isPregnant
                ? "bg-primary/10 border-primary/40 text-primary"
                : "bg-background/60 border-border text-muted-foreground hover:bg-muted/50"
            )}
          >
            <Heart className="w-3.5 h-3.5" />
            {t('onboarding.notPregnant', 'Not Pregnant')}
          </button>
        </div>
      </div>

      {/* Pregnancy-specific fields - only when pregnant */}
      {isPregnant && (
        <>
      {/* Pregnancy Week */}
      <div className="space-y-1.5">
        <Label className="flex items-center gap-1.5 text-xs font-medium">
          <Baby className="w-3.5 h-3.5 text-primary" />
          {t('onboarding.pregnancyWeek', 'Pregnancy Week')}
        </Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            max={42}
            value={weekInput}
            onChange={e => setWeekInput(e.target.value)}
            className="h-9 text-sm"
            placeholder="1–42"
          />
          <span className="text-xs text-muted-foreground shrink-0">
            {t('onboarding.weeksUnit', 'weeks')}
          </span>
        </div>
      </div>

      {/* Last Period Date */}
      <div className="space-y-1.5">
        <Label className="flex items-center gap-1.5 text-xs font-medium">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          {t('onboarding.lastPeriod', 'Last Menstrual Period')}
        </Label>
        <Popover open={lmpOpen} onOpenChange={setLmpOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full h-9 justify-start text-left font-normal text-sm',
                !selectedLMP && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
              {selectedLMP
                ? formatLocalized(selectedLMP, 'PPP', currentLanguage)
                : t('onboarding.selectDate', 'Select date')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={selectedLMP}
              onSelect={handleLMPSelect}
              disabled={date => date > new Date()}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
        {selectedLMP && (
          <p className="text-[10px] text-muted-foreground">
            {t('onboarding.autoWeekNote', 'Week auto-calculated from this date')}
          </p>
        )}
      </div>
        </>
      )}

      {/* Weight + Height - side by side */}
      <div className="grid grid-cols-2 gap-3">
        {/* Weight */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-medium">
            <Gauge className="w-3.5 h-3.5 text-primary" />
            {t('onboarding.weight', 'Current Weight')}
          </Label>
          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              min={30}
              max={200}
              step={0.1}
              value={weightInput}
              onChange={e => setWeightInput(e.target.value)}
              className="h-9 text-sm"
              placeholder="65"
            />
            <span className="text-xs text-muted-foreground shrink-0">kg</span>
          </div>
        </div>

        {/* Height */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-medium">
            <Ruler className="w-3.5 h-3.5 text-primary" />
            {t('settings.profile.heightLabel', 'Height')}
          </Label>
          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              min={100}
              max={220}
              value={heightInput}
              onChange={e => setHeightInput(e.target.value)}
              className="h-9 text-sm"
              placeholder={t('settings.profile.heightPlaceholder', '165')}
            />
            <span className="text-xs text-muted-foreground shrink-0">
              {t('settings.profile.heightUnit', 'cm')}
            </span>
          </div>
        </div>
      </div>

      {/* BMI Card - live calculation */}
      {bmi !== null && bmiCategory && (
        <div className={`rounded-xl border px-4 py-3 flex items-center justify-between ${
          bmiCategory.variant === 'good'
            ? 'bg-accent/10 border-accent/30'
            : bmiCategory.variant === 'warn'
            ? 'bg-primary/8 border-primary/20'
            : 'bg-destructive/8 border-destructive/20'
        }`}>
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-[11px] text-muted-foreground">
                {t('settings.profile.bmiLabel', 'Body Mass Index (BMI)')}
              </p>
              <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                {t(`settings.profile.bmi.${bmiCategory.key}`, bmiCategory.key)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {bmiCategory.variant === 'good'
              ? <Minus className="w-3.5 h-3.5 text-accent-foreground" />
              : bmiCategory.variant === 'warn' && bmi < 18.5
              ? <TrendingDown className="w-3.5 h-3.5 text-primary" />
              : <TrendingUp className="w-3.5 h-3.5 text-destructive" />
            }
            <span className={`text-xl font-bold ${
              bmiCategory.variant === 'good'
                ? 'text-accent-foreground'
                : bmiCategory.variant === 'warn'
                ? 'text-primary'
                : 'text-destructive'
            }`}>
              {bmi}
            </span>
          </div>
        </div>
      )}

      {/* Blood Type */}
      <div className="space-y-1.5">
        <Label className="flex items-center gap-1.5 text-xs font-medium">
          <Droplets className="w-3.5 h-3.5 text-primary" />
          {t('settings.profile.bloodTypeLabel', 'Blood Type')}
        </Label>
        <Select value={bloodType} onValueChange={setBloodType}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder={t('settings.profile.bloodTypePlaceholder', 'Select blood type')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unknown">
              {t('settings.profile.bloodTypeUnknown', 'Unknown / Not tested')}
            </SelectItem>
            {BLOOD_TYPES.map(bt => (
              <SelectItem key={bt} value={bt}>{bt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Due date display */}
      {profile.dueDate && (
        <div className="rounded-lg bg-primary/8 border border-primary/20 px-3 py-2">
          <p className="text-xs text-muted-foreground">
            {t('onboarding.dueDateLabel', 'Expected Due Date')}
          </p>
          <p className="text-sm font-semibold text-primary mt-0.5">
            {formatLocalized(new Date(profile.dueDate), 'PPP', currentLanguage)}
          </p>
        </div>
      )}

      <Button onClick={handleSave} className="w-full h-9 text-sm gap-2">
        <Save className="w-4 h-4" />
        {t('settings.profile.save', 'Save Profile')}
      </Button>
    </div>
  );
};
