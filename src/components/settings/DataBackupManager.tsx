import React, { useState } from 'react';
import { Download, Loader2, Calendar, Printer } from 'lucide-react';
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

const EXCLUDED_KEY_PATTERNS = [
  'session_id', 'session_expiry', 'user_id', 'install_date', 'expanded_categories',
  'encrypted', 'checked_user', 'cookie', 'cache', 'token', 'auth', '_v2', '_version',
  'selected_language', 'backup_date', 'last_visit', 'theme', 'sb-', 'supabase',
];

interface DataBackupManagerProps {
  compact?: boolean;
}

const printLabels: Record<string, string> = {
  en: 'Print Data Report',
  ar: 'طباعة تقرير البيانات',
  de: 'Datenbericht drucken',
  fr: 'Imprimer le rapport',
  es: 'Imprimir informe',
  pt: 'Imprimir relatório',
  tr: 'Veri raporu yazdır',
};

export const DataBackupManager: React.FC<DataBackupManagerProps> = ({ compact = false }) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const { t, i18n } = useTranslation();

  const lang = i18n.language?.split('-')[0] || 'en';
  const isRTL = lang === 'ar';

  const isExcludedKey = (key: string): boolean => {
    const lowerKey = key.toLowerCase();
    return EXCLUDED_KEY_PATTERNS.some(pattern => lowerKey.includes(pattern));
  };

  // Translate known i18n keys in data values
  const resolveTranslationKeys = (obj: any): any => {
    if (typeof obj === 'string') {
      // If it looks like an i18n key (e.g. "groceryList.items.spinach"), try translating
      if (obj.includes('.') && !obj.includes(' ') && !obj.startsWith('http')) {
        const translated = t(obj);
        return translated !== obj ? translated : obj;
      }
      return obj;
    }
    if (Array.isArray(obj)) return obj.map(resolveTranslationKeys);
    if (typeof obj === 'object' && obj !== null) {
      const result: Record<string, any> = {};
      for (const [k, v] of Object.entries(obj)) {
        // Skip internal keys, resolve values
        if (k === 'nameKey' || k === 'pregnancyBenefitKey' || k === 'descriptionKey' || k === 'tipsKey' || k === 'whenNeededKey' || k === 'labelKey') {
          // Replace key field with resolved "name"/"label" field
          const resolvedKey = k.replace('Key', '');
          result[resolvedKey] = t(v as string);
        } else {
          result[k] = resolveTranslationKeys(v);
        }
      }
      return result;
    }
    return obj;
  };

  const collectAllData = (): Record<string, any> => {
    const data: Record<string, any> = {};
    BACKUP_KEYS.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        try { data[key] = resolveTranslationKeys(JSON.parse(value)); } catch { data[key] = value; }
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
            try { data[key] = resolveTranslationKeys(JSON.parse(value)); } catch { data[key] = value; }
          }
        }
      }
    }
    return data;
  };

  const handlePrintReport = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsExporting(true);
    try {
      const data = collectAllData();
      const dataCount = Object.keys(data).length;
      if (dataCount === 0) {
        toast({ title: t('settings.backup.noData'), description: t('settings.backup.noDataDesc'), variant: 'destructive' });
        setIsExporting(false);
        return;
      }

      const brandNames: Record<string, string> = {
        ar: 'أدوات الحمل الذكية', de: 'Schwangerschafts-Toolkit', fr: 'Outils de Grossesse',
        es: 'Herramientas de Embarazo', pt: 'Ferramentas de Gravidez', tr: 'Gebelik Araçları', en: 'Pregnancy Toolkits',
      };
      const brand = brandNames[lang] || brandNames.en;
      const reportTitle = t('settings.backup.pdfTitle', 'Data Backup Report');

      // Build HTML content
      let html = '';
      Object.entries(data).forEach(([key, value]) => {
        const label = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
        html += `<div class="data-section"><h3>${label}</h3>`;
        if (Array.isArray(value)) {
          html += `<p class="count">${value.length} items</p>`;
          value.slice(0, 20).forEach((item, i) => {
            if (typeof item === 'object' && item !== null) {
              html += `<div class="item"><span class="num">${i + 1}</span>`;
              Object.entries(item).filter(([k]) => !['id', 'userId', 'user_id'].includes(k)).slice(0, 6).forEach(([k, v]) => {
                html += `<div class="field"><strong>${k}:</strong> ${typeof v === 'object' ? JSON.stringify(v).substring(0, 80) : String(v).substring(0, 100)}</div>`;
              });
              html += `</div>`;
            } else {
              html += `<div class="item">${String(item).substring(0, 150)}</div>`;
            }
          });
          if (value.length > 20) html += `<p class="more">+${value.length - 20} more</p>`;
        } else if (typeof value === 'object' && value !== null) {
          Object.entries(value).slice(0, 10).forEach(([k, v]) => {
            html += `<div class="field"><strong>${k}:</strong> ${String(v).substring(0, 100)}</div>`;
          });
        } else {
          html += `<div class="field">${String(value).substring(0, 200)}</div>`;
        }
        html += `</div>`;
      });

      const printWindow = window.open('', '_blank');
      if (!printWindow) { setIsExporting(false); return; }

      printWindow.document.write(`<!DOCTYPE html>
<html dir="${isRTL ? 'rtl' : 'ltr'}" lang="${lang}">
<head><meta charset="utf-8"><title>${reportTitle}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Cairo', sans-serif; color: #1e293b; padding: 15mm; line-height: 1.6; direction: ${isRTL ? 'rtl' : 'ltr'}; font-size: 13px; }
.header { text-align: center; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid #ec4899; }
.header h1 { font-size: 20px; color: #ec4899; } .header .brand { font-size: 11px; color: #94a3b8; } .header .date { font-size: 11px; color: #64748b; margin-top: 4px; }
.data-section { margin-bottom: 14px; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; page-break-inside: avoid; }
.data-section h3 { font-size: 14px; color: #ec4899; margin-bottom: 6px; text-transform: capitalize; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px; }
.count { font-size: 11px; color: #94a3b8; margin-bottom: 6px; }
.item { padding: 6px 8px; margin: 4px 0; background: #f8fafc; border-radius: 6px; font-size: 12px; }
.num { display: inline-block; width: 20px; height: 20px; background: #ec4899; color: white; border-radius: 50%; text-align: center; line-height: 20px; font-size: 10px; margin-${isRTL ? 'left' : 'right'}: 6px; }
.field { font-size: 12px; margin: 2px 0; } .field strong { color: #475569; }
.more { font-size: 11px; color: #94a3b8; text-align: center; margin-top: 6px; }
.footer { margin-top: 20px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
@media print { body { padding: 10mm; } @page { margin: 10mm; size: A4; } }
</style></head>
<body>
<div class="header"><h1>${reportTitle}</h1><div class="brand">${brand}</div><div class="date">${new Date().toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div><div class="count" style="margin-top:6px">${dataCount} items</div></div>
${html}
<div class="footer">${brand} &mdash; ${new Date().getFullYear()}</div>
</body></html>`);
      printWindow.document.close();
      setTimeout(() => { printWindow.print(); }, 600);
      toast({ title: t('settings.backup.exportSuccess'), description: t('settings.backup.exportSuccessDesc', { count: dataCount }) });
    } catch (error) {
      console.error('Print error:', error);
      toast({ title: t('settings.backup.exportError'), description: t('settings.backup.exportErrorDesc'), variant: 'destructive' });
    } finally {
      setIsExporting(false);
    }
  };

  if (compact) {
    return (
      <div className="space-y-2">
        <Button 
          type="button"
          disabled={isExporting} 
          size="sm" 
          className="w-full gap-1.5 h-9 text-xs"
          onClick={handlePrintReport}
        >
          {isExporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Printer className="w-3 h-3" />}
          {printLabels[lang] || printLabels.en}
        </Button>
      </div>
    );
  }

  return (
    <div className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Printer className="w-5 h-5 text-primary" />
        <span className="font-medium">{t('settings.backup.title')}</span>
      </div>
      <p className="text-sm text-muted-foreground mb-3">{t('settings.backup.description')}</p>
      <Button 
        type="button"
        disabled={isExporting} 
        className="w-full gap-2"
        onClick={handlePrintReport}
      >
        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
        {printLabels[lang] || printLabels.en}
      </Button>
    </div>
  );
};

export default DataBackupManager;
