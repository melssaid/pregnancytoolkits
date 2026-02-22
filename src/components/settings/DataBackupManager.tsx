import React, { useState, useRef } from 'react';
import { Download, Upload, AlertTriangle, Loader2, FileJson, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { exportDataBackupPDF } from '@/lib/pdfExport';
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
  'pregnancy_profile', 'user_settings', 'pregnancy_week', 'due_date', 'last_period_date',
  'kick_sessions', 'kick_history', 'water_intake', 'water_history', 'weight_records',
  'vitamin_tracker', 'vitamin_records', 'sleep_records', 'contraction_records',
  'appointments', 'reminders', 'stretch_reminders', 'meal_history', 'grocery_lists',
  'food_diary', 'nutrition_log', 'birth_plans', 'hospital_bag', 'baby_names',
  'bump_photos_local', 'milestones', 'cycle_data', 'ovulation_data', 'period_history',
  'journal_entries', 'pregnancy_notes', 'doctor_questions', 'weekly_summaries', 'ai_insights',
  'disclaimer_accepted', 'onboarding_completed',
];

interface BackupData {
  version: string;
  createdAt: string;
  deviceInfo: string;
  data: Record<string, any>;
}

interface DataBackupManagerProps {
  compact?: boolean;
}

export const DataBackupManager: React.FC<DataBackupManagerProps> = ({ compact = false }) => {
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
    BACKUP_KEYS.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        try { data[key] = JSON.parse(value); } catch { data[key] = value; }
      }
    });
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !data[key]) {
        if (key.includes('pregnancy') || key.includes('baby') || key.includes('health') ||
            key.includes('tracker') || key.includes('records') || key.includes('history') ||
            key.includes('_data') || key.includes('_list') || key.includes('_entries')) {
          const value = localStorage.getItem(key);
          if (value) {
            try { data[key] = JSON.parse(value); } catch { data[key] = value; }
          }
        }
      }
    }
    return data;
  };

  // Export as PDF (primary method)
  const [pdfProgress, setPdfProgress] = useState(0);
  const handleExportPDF = async () => {
    setIsExporting(true);
    setPdfProgress(0);
    try {
      const data = collectAllData();
      const dataCount = Object.keys(data).length;
      if (dataCount === 0) {
        toast({ title: t('settings.backup.noData'), description: t('settings.backup.noDataDesc'), variant: 'destructive' });
        setIsExporting(false);
        return;
      }

      const lang = i18n.language || 'en';
      await exportDataBackupPDF({
        title: t('settings.backup.pdfTitle', 'Data Backup Report'),
        subtitle: t('settings.backup.pdfSubtitle', { count: dataCount, defaultValue: `${dataCount} items saved` }),
        data,
        language: lang as any,
        onProgress: setPdfProgress,
      });

      const now = new Date().toISOString();
      localStorage.setItem('last_backup_date', now);
      setLastBackupDate(now);
      toast({ title: t('settings.backup.exportSuccess'), description: t('settings.backup.exportSuccessDesc', { count: dataCount }) });
    } catch (error) {
      console.error('Export error:', error);
      toast({ title: t('settings.backup.exportError'), description: t('settings.backup.exportErrorDesc'), variant: 'destructive' });
    } finally {
      setIsExporting(false);
      setPdfProgress(0);
    }
  };

  // Export as JSON (for restore)
  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      const data = collectAllData();
      const dataCount = Object.keys(data).length;
      if (dataCount === 0) {
        toast({ title: t('settings.backup.noData'), description: t('settings.backup.noDataDesc'), variant: 'destructive' });
        setIsExporting(false);
        return;
      }

      const backup = { version: '1.0', createdAt: new Date().toISOString(), deviceInfo: navigator.userAgent, data };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const date = new Date().toISOString().split('T')[0];
      const a = document.createElement('a');
      a.href = url;
      a.download = `pregnancy-tools-backup-${date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const now = new Date().toISOString();
      localStorage.setItem('last_backup_date', now);
      setLastBackupDate(now);
      toast({ title: t('settings.backup.exportSuccess'), description: t('settings.backup.exportSuccessDesc', { count: dataCount }) });
    } catch (error) {
      console.error('Export error:', error);
      toast({ title: t('settings.backup.exportError'), description: t('settings.backup.exportErrorDesc'), variant: 'destructive' });
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
      if (!backup.version || !backup.data) throw new Error(t('settings.backup.invalidFile'));

      const dataCount = Object.keys(backup.data).length;
      Object.entries(backup.data).forEach(([key, value]) => {
        try { localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value)); } catch (e) { console.error(`Failed to restore key ${key}:`, e); }
      });

      toast({ title: t('settings.backup.importSuccess'), description: t('settings.backup.importSuccessDesc', { count: dataCount }) });
      setImportDialogOpen(false);
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error('Import error:', error);
      toast({ title: t('settings.backup.importError'), description: error instanceof Error ? error.message : t('settings.backup.exportErrorDesc'), variant: 'destructive' });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const formatDate = (dateStr: string) => {
    const locale = i18n.language === 'ar' ? 'ar-SA' : 'en-US';
    return new Date(dateStr).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {/* Last backup */}
        {lastBackupDate && (
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-muted/50 px-2 py-1 rounded">
            <Calendar className="w-3 h-3" />
            <span>{t('settings.backup.lastBackup')} {formatDate(lastBackupDate)}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {/* Export as PDF */}
          <Button 
            disabled={isExporting} 
            size="sm" 
            className="gap-1.5 h-9 text-xs"
            onClick={handleExportPDF}
          >
            {isExporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
            {t('settings.backup.exportData')}
          </Button>

          {/* Import */}
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 h-9 text-xs">
                <Upload className="w-3 h-3" />
                {t('settings.backup.importData')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base">
                  <FileJson className="w-4 h-4 text-primary" />
                  {t('settings.backup.importTitle')}
                </DialogTitle>
                <DialogDescription className="text-sm">{t('settings.backup.importDescription')}</DialogDescription>
              </DialogHeader>

              <div className="flex items-start gap-2 p-2 rounded-lg bg-destructive/10 text-xs text-destructive">
                <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                <span><strong>{t('settings.backup.importWarning')}</strong> {t('settings.backup.importWarningText')}</span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={isImporting}
                className="w-full text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer file:text-xs"
              />

              {isImporting && (
                <div className="flex items-center justify-center gap-2 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm">{t('settings.backup.importing')}</span>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => setImportDialogOpen(false)}>{t('settings.backup.cancel')}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  // Full version
  return (
    <div className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Download className="w-5 h-5 text-primary" />
        <span className="font-medium">{t('settings.backup.title')}</span>
      </div>
      <p className="text-sm text-muted-foreground mb-3">{t('settings.backup.description')}</p>

      {lastBackupDate && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg mb-3">
          <Calendar className="w-4 h-4" />
          <span>{t('settings.backup.lastBackup')} {formatDate(lastBackupDate)}</span>
        </div>
      )}

      <div className="flex items-start gap-2 p-2 rounded-lg bg-warning/10 text-xs text-warning mb-3">
        <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
        <span><strong>{t('settings.backup.important')}</strong> {t('settings.backup.importantText')}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Export as PDF */}
        <Button 
          disabled={isExporting} 
          className="gap-2"
          onClick={handleExportPDF}
        >
          {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {t('settings.backup.exportData')}
        </Button>

        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Upload className="w-4 h-4" />
              {t('settings.backup.importData')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileJson className="w-5 h-5 text-primary" />
                {t('settings.backup.importTitle')}
              </DialogTitle>
              <DialogDescription>{t('settings.backup.importDescription')}</DialogDescription>
            </DialogHeader>

            <div className="flex items-start gap-2 p-2 rounded-lg bg-destructive/10 text-sm text-destructive">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span><strong>{t('settings.backup.importWarning')}</strong> {t('settings.backup.importWarningText')}</span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={isImporting}
              className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer"
            />

            {isImporting && (
              <div className="flex items-center justify-center gap-2 py-4">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span>{t('settings.backup.importing')}</span>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setImportDialogOpen(false)}>{t('settings.backup.cancel')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DataBackupManager;
