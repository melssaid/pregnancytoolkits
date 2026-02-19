import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarIcon, Save, Baby, Scale, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useUserProfile, computeWeekFromLMP } from '@/hooks/useUserProfile';
import { formatLocalized } from '@/lib/dateLocale';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ProfileEditorProps {
  compact?: boolean;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ compact = false }) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { profile, updateProfile, setLastPeriodDate } = useUserProfile();

  const [weekInput, setWeekInput] = useState(String(profile.pregnancyWeek));
  const [weightInput, setWeightInput] = useState(profile.weight !== null ? String(profile.weight) : '');
  const [selectedLMP, setSelectedLMP] = useState<Date | undefined>(
    profile.lastPeriodDate ? new Date(profile.lastPeriodDate) : undefined
  );
  const [lmpOpen, setLmpOpen] = useState(false);

  const handleSave = () => {
    const week = parseInt(weekInput);
    if (!isNaN(week) && week >= 1 && week <= 42) {
      updateProfile({ pregnancyWeek: week });
    }

    const weight = parseFloat(weightInput);
    if (!isNaN(weight) && weight > 0) {
      updateProfile({ weight });
    } else if (weightInput === '') {
      updateProfile({ weight: null });
    }

    if (selectedLMP) {
      const lmpStr = selectedLMP.toISOString().split('T')[0];
      setLastPeriodDate(lmpStr);
      // auto-update week from LMP
      const computed = computeWeekFromLMP(lmpStr);
      setWeekInput(String(computed));
    } else if (!selectedLMP && profile.lastPeriodDate) {
      setLastPeriodDate(null);
    }

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
      {/* Pregnancy Week */}
      <div className="space-y-1.5">
        <Label className="flex items-center gap-1.5 text-xs font-medium">
          <Baby className="w-3.5 h-3.5 text-primary" />
          {t('onboarding.pregnancyWeekLabel', 'Pregnancy Week')}
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
          {t('onboarding.lastPeriodLabel', 'Last Menstrual Period')}
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

      {/* Weight */}
      <div className="space-y-1.5">
        <Label className="flex items-center gap-1.5 text-xs font-medium">
          <Scale className="w-3.5 h-3.5 text-primary" />
          {t('onboarding.weightLabel', 'Current Weight')}
        </Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={30}
            max={200}
            step={0.1}
            value={weightInput}
            onChange={e => setWeightInput(e.target.value)}
            className="h-9 text-sm"
            placeholder="e.g. 65"
          />
          <span className="text-xs text-muted-foreground shrink-0">kg</span>
        </div>
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
