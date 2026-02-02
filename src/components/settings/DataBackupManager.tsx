import React, { useState, useRef } from 'react';
import { Download, Upload, Shield, AlertTriangle, Check, Loader2, FileJson, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

// Keys to backup from localStorage
const BACKUP_KEYS = [
  // User profile and settings
  'pregnancy_profile',
  'user_settings',
  'pregnancy_week',
  'due_date',
  'last_period_date',
  
  // Health tracking
  'kick_sessions',
  'kick_history',
  'water_intake',
  'water_history',
  'weight_records',
  'vitamin_tracker',
  'vitamin_records',
  'sleep_records',
  'contraction_records',
  
  // Appointments and reminders
  'appointments',
  'reminders',
  'stretch_reminders',
  
  // Nutrition and meals
  'meal_history',
  'grocery_lists',
  'food_diary',
  'nutrition_log',
  
  // Birth planning
  'birth_plans',
  'hospital_bag',
  'baby_names',
  
  // Photos and memories
  'bump_photos_local',
  'milestones',
  
  // Cycle tracking
  'cycle_data',
  'ovulation_data',
  'period_history',
  
  // Journal and notes
  'journal_entries',
  'pregnancy_notes',
  'doctor_questions',
  
  // AI generated content
  'weekly_summaries',
  'ai_insights',
  
  // Misc
  'disclaimer_accepted',
  'onboarding_completed',
];

interface BackupData {
  version: string;
  createdAt: string;
  deviceInfo: string;
  data: Record<string, any>;
}

export const DataBackupManager: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { t, i18n } = useTranslation();

  React.useEffect(() => {
    const lastBackup = localStorage.getItem('last_backup_date');
    setLastBackupDate(lastBackup);
  }, []);

  const collectAllData = (): Record<string, any> => {
    const data: Record<string, any> = {};
    
    // Collect known keys
    BACKUP_KEYS.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          data[key] = JSON.parse(value);
        } catch {
          data[key] = value;
        }
      }
    });

    // Also collect any keys that match common patterns
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !data[key]) {
        // Include keys that look like app data
        if (
          key.includes('pregnancy') ||
          key.includes('baby') ||
          key.includes('health') ||
          key.includes('tracker') ||
          key.includes('records') ||
          key.includes('history') ||
          key.includes('_data') ||
          key.includes('_list') ||
          key.includes('_entries')
        ) {
          const value = localStorage.getItem(key);
          if (value) {
            try {
              data[key] = JSON.parse(value);
            } catch {
              data[key] = value;
            }
          }
        }
      }
    }

    return data;
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const data = collectAllData();
      const dataCount = Object.keys(data).length;
      
      if (dataCount === 0) {
        toast({
          title: t('settings.backup.noData'),
          description: t('settings.backup.noDataDesc'),
          variant: 'destructive'
        });
        return;
      }

      const backup: BackupData = {
        version: '1.0',
        createdAt: new Date().toISOString(),
        deviceInfo: navigator.userAgent,
        data
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const date = new Date().toISOString().split('T')[0];
      const filename = `pregnancy-tools-backup-${date}.json`;
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Save last backup date
      const now = new Date().toISOString();
      localStorage.setItem('last_backup_date', now);
      setLastBackupDate(now);

      toast({
        title: t('settings.backup.exportSuccess'),
        description: t('settings.backup.exportSuccessDesc', { count: dataCount }),
      });

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: t('settings.backup.exportError'),
        description: t('settings.backup.exportErrorDesc'),
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    try {
      const text = await file.text();
      const backup: BackupData = JSON.parse(text);

      // Validate backup structure
      if (!backup.version || !backup.data) {
        throw new Error(t('settings.backup.invalidFile'));
      }

      const dataCount = Object.keys(backup.data).length;
      
      // Restore all data
      Object.entries(backup.data).forEach(([key, value]) => {
        try {
          localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        } catch (e) {
          console.error(`Failed to restore key ${key}:`, e);
        }
      });

      toast({
        title: t('settings.backup.importSuccess'),
        description: t('settings.backup.importSuccessDesc', { count: dataCount }),
      });

      setImportDialogOpen(false);

      // Reload to apply restored data
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: t('settings.backup.importError'),
        description: error instanceof Error ? error.message : t('settings.backup.exportErrorDesc'),
        variant: 'destructive'
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatDate = (dateStr: string) => {
    const locale = i18n.language === 'ar' ? 'ar-SA' : 'en-US';
    return new Date(dateStr).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="w-5 h-5 text-primary" />
          {t('settings.backup.title')}
        </CardTitle>
        <CardDescription>
          {t('settings.backup.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Last backup info */}
        {lastBackupDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded-lg">
            <Calendar className="w-4 h-4" />
            <span>{t('settings.backup.lastBackup')} {formatDate(lastBackupDate)}</span>
          </div>
        )}

        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 text-sm">
            <strong>{t('settings.backup.important')}</strong> {t('settings.backup.importantText')}
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Export Button */}
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {t('settings.backup.exportData')}
          </Button>

          {/* Import Button */}
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full gap-2">
                <Upload className="w-4 h-4" />
                {t('settings.backup.importData')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileJson className="w-5 h-5 text-primary" />
                  {t('settings.backup.importTitle')}
                </DialogTitle>
                <DialogDescription>
                  {t('settings.backup.importDescription')}
                </DialogDescription>
              </DialogHeader>

              <Alert variant="destructive" className="mt-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{t('settings.backup.importWarning')}</strong> {t('settings.backup.importWarningText')}
                </AlertDescription>
              </Alert>

              <div className="mt-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  disabled={isImporting}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer"
                />
              </div>

              {isImporting && (
                <div className="flex items-center justify-center gap-2 py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span>{t('settings.backup.importing')}</span>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                  {t('settings.backup.cancel')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Check className="w-3 h-3 text-green-500" />
            <span>{t('settings.backup.features.pregnancyData')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Check className="w-3 h-3 text-green-500" />
            <span>{t('settings.backup.features.appointments')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Check className="w-3 h-3 text-green-500" />
            <span>{t('settings.backup.features.healthRecords')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Check className="w-3 h-3 text-green-500" />
            <span>{t('settings.backup.features.birthPlans')}</span>
          </div>
        </div>

      </CardContent>
    </Card>
  );
};

export default DataBackupManager;
