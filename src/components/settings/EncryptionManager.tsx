import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Shield, AlertTriangle, Loader2, CheckCircle, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
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

export const EncryptionManager: React.FC = () => {
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
        // Enable encryption and encrypt existing data
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
        // Decrypt all data first, then disable
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
      <Card className="border-2 border-dashed">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-2 transition-colors ${
      isEnabled 
        ? 'border-green-500/30 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20' 
        : 'border-dashed border-muted-foreground/30'
    }`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {isEnabled ? (
            <Lock className="w-5 h-5 text-green-600" />
          ) : (
            <Unlock className="w-5 h-5 text-muted-foreground" />
          )}
          {t('settings.encryption.title')}
        </CardTitle>
        <CardDescription>
          {t('settings.encryption.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Status indicator */}
        <div className={`flex items-center justify-between p-3 rounded-lg ${
          isEnabled ? 'bg-green-100 dark:bg-green-900/30' : 'bg-muted/50'
        }`}>
          <div className="flex items-center gap-2">
            <Shield className={`w-5 h-5 ${isEnabled ? 'text-green-600' : 'text-muted-foreground'}`} />
            <span className="font-medium">
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

        {/* Info about encryption */}
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

        {/* What gets encrypted */}
        <div className="text-sm space-y-2">
          <p className="font-medium flex items-center gap-2">
            <Key className="w-4 h-4 text-primary" />
            {t('settings.encryption.encryptedData')}
          </p>
          <div className="grid grid-cols-2 gap-1 text-muted-foreground text-xs">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-primary" />
              <span>{t('settings.encryption.personalPregnancyData')}</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-primary" />
              <span>{t('settings.encryption.healthWeightRecords')}</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-primary" />
              <span>{t('settings.encryption.medicalAppointments')}</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-primary" />
              <span>{t('settings.encryption.birthPlans')}</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-primary" />
              <span>{t('settings.encryption.journalNotes')}</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-primary" />
              <span>{t('settings.encryption.cycleData')}</span>
            </div>
          </div>
        </div>

        {/* Security note */}
        <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg">
          <strong>{t('settings.encryption.securityNote')}</strong> {t('settings.encryption.securityNoteText')}
        </div>

      </CardContent>
    </Card>
  );
};

export default EncryptionManager;
