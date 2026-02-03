import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Shield, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  initializeEncryption,
  isEncryptionEnabled,
  setEncryptionEnabled,
  encryptExistingData,
  decryptAllData,
} from '@/lib/encryption';

// Keys to encrypt (sensitive health data)
const SENSITIVE_KEYS = [
  'pregnancy_profile',
  'kick_sessions',
  'kick_history',
  'weight_records',
  'vitamin_tracker',
  'vitamin_records',
  'sleep_records',
  'contraction_records',
  'appointments',
  'meal_history',
  'food_diary',
  'nutrition_log',
  'birth_plans',
  'baby_names',
  'cycle_data',
  'ovulation_data',
  'period_history',
  'journal_entries',
  'pregnancy_notes',
  'doctor_questions',
  'bump_photos_local',
];

interface EncryptionManagerProps {
  compact?: boolean;
}

export const EncryptionManager: React.FC<EncryptionManagerProps> = ({ compact = false }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    const init = async () => {
      await initializeEncryption();
      setIsEnabled(isEncryptionEnabled());
      setIsInitialized(true);
    };
    init();
  }, []);

  const handleToggleEncryption = async (enabled: boolean) => {
    setIsProcessing(true);

    try {
      if (enabled) {
        setEncryptionEnabled(true);
        setIsEnabled(true);
        const count = await encryptExistingData(SENSITIVE_KEYS);
        toast({
          title: t('settings.encryption.enabledToast'),
          description: count > 0 
            ? t('settings.encryption.enabledToastDesc', { count })
            : t('settings.encryption.enabledToastDescNew'),
        });
      } else {
        const count = await decryptAllData(SENSITIVE_KEYS);
        setEncryptionEnabled(false);
        setIsEnabled(false);
        toast({
          title: t('settings.encryption.disabledToast'),
          description: count > 0 
            ? t('settings.encryption.disabledToastDesc', { count })
            : t('settings.encryption.disabledToastDescNone'),
        });
      }
    } catch (error) {
      console.error('Encryption toggle failed:', error);
      toast({
        title: t('settings.encryption.errorToast'),
        description: t('settings.encryption.errorToastDesc'),
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-3">
        {/* Toggle Row */}
        <div className={cn(
          "flex items-center justify-between p-2.5 rounded-lg border",
          isEnabled 
            ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800" 
            : "bg-muted/30 border-border"
        )}>
          <div className="flex items-center gap-2">
            {isEnabled ? (
              <Lock className="w-4 h-4 text-green-600" />
            ) : (
              <Unlock className="w-4 h-4 text-muted-foreground" />
            )}
            <span className="text-sm font-medium">
              {isEnabled ? t('settings.encryption.enabled') : t('settings.encryption.disabled')}
            </span>
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={handleToggleEncryption}
            disabled={isProcessing}
          />
        </div>

        {isProcessing && (
          <div className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>{t('settings.encryption.processing')}</span>
          </div>
        )}

        {/* Status Alert */}
        {isEnabled ? (
          <div className="flex items-start gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-950/20 text-xs text-green-700 dark:text-green-300">
            <CheckCircle className="w-3 h-3 mt-0.5 shrink-0" />
            <span>{t('settings.encryption.enabledAlert')}</span>
          </div>
        ) : (
          <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-xs text-amber-700 dark:text-amber-300">
            <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
            <span>{t('settings.encryption.disabledAlert')}</span>
          </div>
        )}

        {/* Encrypted Data */}
        <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground">
          <span>✓ {t('settings.encryption.personalPregnancyData')}</span>
          <span>✓ {t('settings.encryption.healthWeightRecords')}</span>
          <span>✓ {t('settings.encryption.medicalAppointments')}</span>
          <span>✓ {t('settings.encryption.birthPlans')}</span>
        </div>
      </div>
    );
  }

  // Full version (fallback)
  return (
    <div className={cn(
      "border-2 rounded-xl transition-colors p-4",
      isEnabled 
        ? "border-green-500/30 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20" 
        : "border-dashed border-muted-foreground/30"
    )}>
      <div className="flex items-center gap-2 mb-3">
        {isEnabled ? (
          <Lock className="w-5 h-5 text-green-600" />
        ) : (
          <Unlock className="w-5 h-5 text-muted-foreground" />
        )}
        <span className="font-medium">{t('settings.encryption.title')}</span>
      </div>

      <div className={cn(
        "flex items-center justify-between p-3 rounded-lg mb-3",
        isEnabled ? "bg-green-100 dark:bg-green-900/30" : "bg-muted/50"
      )}>
        <div className="flex items-center gap-2">
          <Shield className={cn("w-5 h-5", isEnabled ? "text-green-600" : "text-muted-foreground")} />
          <span className="font-medium text-sm">
            {isEnabled ? t('settings.encryption.enabled') : t('settings.encryption.disabled')}
          </span>
        </div>
        <Switch
          checked={isEnabled}
          onCheckedChange={handleToggleEncryption}
          disabled={isProcessing}
        />
      </div>

      {isProcessing && (
        <div className="flex items-center justify-center gap-2 py-3 bg-muted/50 rounded-lg">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm">{t('settings.encryption.processing')}</span>
        </div>
      )}

      {isEnabled ? (
        <Alert className="bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200 text-sm">
            {t('settings.encryption.enabledAlert')}
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm">
            {t('settings.encryption.disabledAlert')}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default EncryptionManager;
