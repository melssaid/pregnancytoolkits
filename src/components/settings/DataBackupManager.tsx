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
];

const EXCLUDED_KEY_PATTERNS = [
  'session_id', 'session_expiry', 'user_id', 'install_date', 'expanded_categories',
  'encrypted', 'checked_user', 'cookie', 'cache', 'token', 'auth', '_v2', '_version',
  'selected_language', 'backup_date', 'last_visit', 'theme', 'sb-', 'supabase',
  'ai_daily_usage', 'journey-card-states', 'disclaimer', 'onboarding',
  'central_profile', 'splash_', 'insight', 'smart-plan', 'smart-pregnancy',
  'active', 'tip-of-the-day', 'motivational', 'first_visit', 'notification',
  'push_', 'cookie_consent', 'search_', 'recent_',
];

// Internal field names to hide from the report
const HIDDEN_FIELDS = new Set([
  'id', 'userId', 'user_id', 'ts', 'timestamp', 'updatedAt', 'updated_at',
  'createdAt', 'created_at', 'iv', 'encrypted', 'hash', 'salt', 'key',
  'sessionId', 'session_id', '_id', '__v', 'version', 'type', 'source',
  'category', 'categoryKey', 'toolId', 'tool_id', 'lang', 'language',
]);

// Detect junk values: encrypted strings, long hashes, raw timestamps, garbled text
function isJunkValue(v: any): boolean {
  if (typeof v === 'number' && v > 1_000_000_000_000) return true;
  if (typeof v !== 'string') return false;
  if (v.length > 20 && /^[A-Za-z0-9+/=]+$/.test(v)) return true; // base64 / encrypted
  if (v.length > 20 && /[+/]{2,}/.test(v) && /[A-Za-z0-9]{10,}/.test(v)) return true; // mixed encrypted
  if (/^[a-f0-9]{20,}$/i.test(v)) return true; // hex hash
  if (v.includes('�')) return true; // corrupted unicode
  if (v.length > 20 && /[+/=]{3,}/.test(v)) return true; // partial base64
  // Catch encrypted-looking strings with high entropy (lots of mixed case + symbols)
  if (v.length > 30 && /[A-Z]/.test(v) && /[a-z]/.test(v) && /[0-9]/.test(v) && /[+/=]/.test(v)) return true;
  return false;
}

// Format a timestamp into a readable date
function formatTimestamp(v: any, isRTL: boolean): string | null {
  const num = typeof v === 'number' ? v : (typeof v === 'string' && /^\d{13}$/.test(v) ? Number(v) : null);
  if (!num || num < 1_000_000_000_000) return null;
  try {
    return new Date(num).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return null; }
}

// Readable field labels
const FIELD_LABELS: Record<string, Record<string, string>> = {
  week: { ar: 'الأسبوع', en: 'Week' },
  weight: { ar: 'الوزن (كجم)', en: 'Weight (kg)' },
  height: { ar: 'الطول (سم)', en: 'Height (cm)' },
  age: { ar: 'العمر', en: 'Age' },
  painLevel: { ar: 'مستوى الألم', en: 'Pain Level' },
  bloodType: { ar: 'فصيلة الدم', en: 'Blood Type' },
  bloodPressureSys: { ar: 'ضغط الدم (انقباضي)', en: 'Blood Pressure (Systolic)' },
  bloodPressureDia: { ar: 'ضغط الدم (انبساطي)', en: 'Blood Pressure (Diastolic)' },
  sleepHours: { ar: 'ساعات النوم', en: 'Sleep Hours' },
  activityLevel: { ar: 'مستوى النشاط', en: 'Activity Level' },
  dueDate: { ar: 'تاريخ الولادة المتوقع', en: 'Due Date' },
  lastPeriodDate: { ar: 'آخر دورة شهرية', en: 'Last Period Date' },
  name: { ar: 'الاسم', en: 'Name' },
  title: { ar: 'العنوان', en: 'Title' },
  date: { ar: 'التاريخ', en: 'Date' },
  time: { ar: 'الوقت', en: 'Time' },
  notes: { ar: 'ملاحظات', en: 'Notes' },
  doctor: { ar: 'الطبيب', en: 'Doctor' },
  location: { ar: 'المكان', en: 'Location' },
  count: { ar: 'العدد', en: 'Count' },
  duration: { ar: 'المدة', en: 'Duration' },
  startTime: { ar: 'وقت البداية', en: 'Start Time' },
  endTime: { ar: 'وقت النهاية', en: 'End Time' },
  completed: { ar: 'مكتمل', en: 'Completed' },
  checked: { ar: 'محدد', en: 'Checked' },
  scheduledAt: { ar: 'الموعد المحدد', en: 'Scheduled At' },
  description: { ar: 'الوصف', en: 'Description' },
  content: { ar: 'المحتوى', en: 'Content' },
};

// Activity level translations
const ACTIVITY_LABELS: Record<string, Record<string, string>> = {
  sedentary: { ar: 'قليل الحركة', en: 'Sedentary' },
  light: { ar: 'نشاط خفيف', en: 'Light' },
  moderate: { ar: 'نشاط متوسط', en: 'Moderate' },
  active: { ar: 'نشط', en: 'Active' },
};

// Readable section labels
const SECTION_LABELS: Record<string, Record<string, string>> = {
  pregnancy_profile: { ar: 'الملف الصحي', en: 'Health Profile' },
  user_settings: { ar: 'الإعدادات', en: 'Settings' },
  kick_sessions: { ar: 'جلسات حركات الطفل', en: 'Kick Sessions' },
  kick_history: { ar: 'سجل الحركات', en: 'Kick History' },
  weight_records: { ar: 'سجل الوزن', en: 'Weight Records' },
  vitamin_tracker: { ar: 'متابعة الفيتامينات', en: 'Vitamin Tracker' },
  vitamin_records: { ar: 'سجل الفيتامينات', en: 'Vitamin Records' },
  sleep_records: { ar: 'سجل النوم', en: 'Sleep Records' },
  contraction_records: { ar: 'سجل الانقباضات', en: 'Contraction Records' },
  appointments: { ar: 'المواعيد', en: 'Appointments' },
  reminders: { ar: 'التذكيرات', en: 'Reminders' },
  meal_history: { ar: 'سجل الوجبات', en: 'Meal History' },
  grocery_lists: { ar: 'قوائم البقالة', en: 'Grocery Lists' },
  birth_plans: { ar: 'خطط الولادة', en: 'Birth Plans' },
  hospital_bag: { ar: 'حقيبة المستشفى', en: 'Hospital Bag' },
  baby_names: { ar: 'أسماء الأطفال', en: 'Baby Names' },
  cycle_data: { ar: 'بيانات الدورة', en: 'Cycle Data' },
  period_history: { ar: 'سجل الدورات', en: 'Period History' },
  weekly_summaries: { ar: 'الملخصات الأسبوعية', en: 'Weekly Summaries' },
  ai_insights: { ar: 'نتائج الذكاء الاصطناعي', en: 'AI Insights' },
  water_intake: { ar: 'شرب الماء', en: 'Water Intake' },
  water_history: { ar: 'سجل شرب الماء', en: 'Water History' },
  pregnancy_notes: { ar: 'ملاحظات الحمل', en: 'Pregnancy Notes' },
  doctor_questions: { ar: 'أسئلة الطبيب', en: 'Doctor Questions' },
  journal_entries: { ar: 'يوميات', en: 'Journal Entries' },
  pregnancy_week: { ar: 'أسبوع الحمل', en: 'Pregnancy Week' },
  due_date: { ar: 'تاريخ الولادة المتوقع', en: 'Due Date' },
  last_period_date: { ar: 'آخر دورة شهرية', en: 'Last Period Date' },
  food_diary: { ar: 'يوميات الطعام', en: 'Food Diary' },
  nutrition_log: { ar: 'سجل التغذية', en: 'Nutrition Log' },
  milestones: { ar: 'المعالم', en: 'Milestones' },
  ovulation_data: { ar: 'بيانات الإباضة', en: 'Ovulation Data' },
  bump_photos_local: { ar: 'صور البطن', en: 'Bump Photos' },
  stretch_reminders: { ar: 'تذكيرات التمدد', en: 'Stretch Reminders' },
};

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
        const label = SECTION_LABELS[key]?.[lang] || SECTION_LABELS[key]?.en || key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
        html += `<div class="data-section"><h3>${label}</h3>`;
        
        const renderField = (k: string, v: any): string => {
          if (HIDDEN_FIELDS.has(k)) return '';
          if (isJunkValue(v)) return '';
          
          // Get readable field label
          const fieldLabel = FIELD_LABELS[k]?.[lang] || FIELD_LABELS[k]?.en || k;
          
          // Try to format timestamps in known date fields
          if (['date', 'time', 'scheduledAt', 'completedAt', 'startTime', 'endTime', 'dueDate', 'lastPeriodDate'].includes(k)) {
            const formatted = formatTimestamp(v, isRTL);
            if (formatted) return `<div class="field"><strong>${fieldLabel}:</strong> ${formatted}</div>`;
          }
          
          // Translate known enum values
          if (k === 'activityLevel' && typeof v === 'string' && ACTIVITY_LABELS[v]) {
            return `<div class="field"><strong>${fieldLabel}:</strong> ${ACTIVITY_LABELS[v][lang] || ACTIVITY_LABELS[v].en}</div>`;
          }
          
          // Boolean values
          if (typeof v === 'boolean') {
            const boolLabel = v ? (lang === 'ar' ? 'نعم' : 'Yes') : (lang === 'ar' ? 'لا' : 'No');
            return `<div class="field"><strong>${fieldLabel}:</strong> ${boolLabel}</div>`;
          }
          
          const strVal = typeof v === 'object' ? JSON.stringify(v).substring(0, 80) : String(v).substring(0, 100);
          if (isJunkValue(strVal)) return '';
          return `<div class="field"><strong>${fieldLabel}:</strong> ${strVal}</div>`;
        };

        if (Array.isArray(value)) {
          const cleanItems = value.filter(item => {
            if (typeof item === 'string' && isJunkValue(item)) return false;
            if (typeof item === 'object' && item !== null) {
              // Skip items where all values are junk
              const usableFields = Object.entries(item).filter(([k, v]) => !HIDDEN_FIELDS.has(k) && !isJunkValue(v));
              if (usableFields.length === 0) return false;
            }
            return true;
          });
          if (cleanItems.length === 0) { html += `</div>`; return; }
          html += `<p class="count">${cleanItems.length} ${lang === 'ar' ? 'عنصر' : 'items'}</p>`;
          cleanItems.slice(0, 20).forEach((item, i) => {
            if (typeof item === 'object' && item !== null) {
              const fields = Object.entries(item)
                .filter(([k]) => !HIDDEN_FIELDS.has(k))
                .filter(([, v]) => !isJunkValue(v))
                .slice(0, 6)
                .map(([k, v]) => renderField(k, v))
                .filter(Boolean)
                .join('');
              if (fields) html += `<div class="item"><span class="num">${i + 1}</span>${fields}</div>`;
            } else if (!isJunkValue(item)) {
              html += `<div class="item">${String(item).substring(0, 150)}</div>`;
            }
          });
          if (cleanItems.length > 20) html += `<p class="more">+${cleanItems.length - 20} ${lang === 'ar' ? 'عنصر إضافي' : 'more'}</p>`;
        } else if (typeof value === 'object' && value !== null) {
          Object.entries(value)
            .filter(([k]) => !HIDDEN_FIELDS.has(k))
            .filter(([, v]) => !isJunkValue(v))
            .slice(0, 10)
            .forEach(([k, v]) => { html += renderField(k, v); });
        } else if (!isJunkValue(value)) {
          html += `<div class="field">${String(value).substring(0, 200)}</div>`;
        }
        html += `</div>`;
      });


      // Print directly using an iframe instead of a new window
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) { document.body.removeChild(iframe); setIsExporting(false); return; }

      iframeDoc.open();
      iframeDoc.write(`<!DOCTYPE html>
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
<div class="header"><h1>${reportTitle}</h1><div class="brand">${brand}</div><div class="date">${new Date().toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div><div class="count" style="margin-top:6px">${dataCount} ${lang === 'ar' ? 'عنصر' : 'items'}</div></div>
${html}
<div class="footer">${brand} &mdash; ${new Date().getFullYear()}</div>
</body></html>`);
      iframeDoc.close();
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => { document.body.removeChild(iframe); }, 1000);
      }, 500);
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
