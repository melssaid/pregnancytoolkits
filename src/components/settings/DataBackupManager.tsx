import React, { useState } from 'react';
import { Download, Loader2, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

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

// Keys to EXCLUDE from backup (system/internal keys)
const EXCLUDED_KEY_PATTERNS = [
  'session_id', 'session_expiry', 'user_id', 'install_date', 'expanded_categories',
  'encrypted', 'checked_user', 'cookie', 'cache', 'token', 'auth', '_v2', '_version',
  'selected_language', 'backup_date', 'last_visit', 'theme', 'sb-', 'supabase',
];

interface DataBackupManagerProps {
  compact?: boolean;
}

export const DataBackupManager: React.FC<DataBackupManagerProps> = ({ compact = false }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'pdf' | 'json' | null>(null);
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(null);
  const { toast } = useToast();
  const { t, i18n } = useTranslation();

  React.useEffect(() => {
    const lastBackup = localStorage.getItem('last_backup_date');
    setLastBackupDate(lastBackup);
  }, []);

  const isExcludedKey = (key: string): boolean => {
    const lowerKey = key.toLowerCase();
    return EXCLUDED_KEY_PATTERNS.some(pattern => lowerKey.includes(pattern));
  };

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
      if (key && !data[key] && !isExcludedKey(key)) {
        if (key.includes('pregnancy') || key.includes('baby') || key.includes('health') ||
            key.includes('tracker') || key.includes('records') || key.includes('history') ||
            key.includes('_data') || key.includes('_list') || key.includes('_entries')) {
          const value = localStorage.getItem(key);
          if (value) {
            if (value.length > 500 && !value.startsWith('{') && !value.startsWith('[')) continue;
            try { data[key] = JSON.parse(value); } catch { data[key] = value; }
          }
        }
      }
    }
    return data;
  };

  const handleExportPDF = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsExporting(true);
    setExportType('pdf');
    try {
      const data = collectAllData();
      const dataCount = Object.keys(data).length;
      if (dataCount === 0) {
        toast({ title: t('settings.backup.noData'), description: t('settings.backup.noDataDesc'), variant: 'destructive' });
        setIsExporting(false);
        setExportType(null);
        return;
      }

      const { exportDataBackupPDF } = await import('@/lib/pdfExport');
      const lang = i18n.language || 'en';
      await exportDataBackupPDF({
        title: t('settings.backup.pdfTitle', 'Data Backup Report'),
        subtitle: t('settings.backup.pdfSubtitle', { count: dataCount, defaultValue: `${dataCount} items saved` }),
        data,
        language: lang as any,
      });

      const now = new Date().toISOString();
      localStorage.setItem('last_backup_date', now);
      setLastBackupDate(now);
      toast({ title: t('settings.backup.exportSuccess'), description: t('settings.backup.exportSuccessDesc', { count: dataCount }) });
    } catch (error) {
      console.error('PDF Export error:', error);
      toast({ title: t('settings.backup.exportError'), description: t('settings.backup.exportErrorDesc'), variant: 'destructive' });
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const handleExportJSON = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsExporting(true);
    setExportType('json');
    try {
      const data = collectAllData();
      const dataCount = Object.keys(data).length;
      if (dataCount === 0) {
        toast({ title: t('settings.backup.noData'), description: t('settings.backup.noDataDesc'), variant: 'destructive' });
        setIsExporting(false);
        setExportType(null);
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
      console.error('JSON Export error:', error);
      toast({ title: t('settings.backup.exportError'), description: t('settings.backup.exportErrorDesc'), variant: 'destructive' });
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const locale = i18n.language === 'ar' ? 'ar-SA' : 'en-US';
    return new Date(dateStr).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {lastBackupDate && (
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-muted/50 px-2 py-1 rounded">
            <Calendar className="w-3 h-3" />
            <span>{t('settings.backup.lastBackup')} {formatDate(lastBackupDate)}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Button 
            type="button"
            disabled={isExporting} 
            size="sm" 
            className="gap-1.5 h-9 text-xs"
            onClick={handleExportPDF}
          >
            {isExporting && exportType === 'pdf' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
            PDF
          </Button>

          <Button 
            type="button"
            variant="outline"
            disabled={isExporting} 
            size="sm" 
            className="gap-1.5 h-9 text-xs"
            onClick={handleExportJSON}
          >
            {isExporting && exportType === 'json' ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
            JSON
          </Button>
        </div>
      </div>
    );
  }

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

      <div className="grid grid-cols-2 gap-2">
        <Button 
          type="button"
          disabled={isExporting} 
          className="gap-2"
          onClick={handleExportPDF}
        >
          {isExporting && exportType === 'pdf' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {t('settings.backup.exportData')} PDF
        </Button>

        <Button 
          type="button"
          variant="outline"
          disabled={isExporting} 
          className="gap-2"
          onClick={handleExportJSON}
        >
          {isExporting && exportType === 'json' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
          {t('settings.backup.exportData')} JSON
        </Button>
      </div>
    </div>
  );
};

export default DataBackupManager;
