import React, { useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';

interface PrintableReportProps {
  children: React.ReactNode;
  title?: string;
}

const printLabels: Record<string, string> = {
  en: 'Print Report',
  ar: 'طباعة التقرير',
  de: 'Bericht drucken',
  fr: 'Imprimer le rapport',
  es: 'Imprimir informe',
  pt: 'Imprimir relatório',
  tr: 'Raporu yazdır',
};

const profileLabels: Record<string, Record<string, string>> = {
  en: { week: 'Pregnancy Week', weight: 'Weight', height: 'Height', preWeight: 'Pre-pregnancy Weight', bloodType: 'Blood Type', dueDate: 'Due Date', lmp: 'Last Period', mood: 'Mood', status: 'Status', pregnant: 'Pregnant', planning: 'Planning', patientInfo: 'Patient Information', kg: 'kg', cm: 'cm' },
  ar: { week: 'أسبوع الحمل', weight: 'الوزن', height: 'الطول', preWeight: 'الوزن قبل الحمل', bloodType: 'فصيلة الدم', dueDate: 'تاريخ الولادة المتوقع', lmp: 'آخر دورة شهرية', mood: 'المزاج', status: 'الحالة', pregnant: 'حامل', planning: 'تخطيط', patientInfo: 'بيانات المريضة', kg: 'كغ', cm: 'سم' },
  de: { week: 'Schwangerschaftswoche', weight: 'Gewicht', height: 'Größe', preWeight: 'Gewicht vor der Schwangerschaft', bloodType: 'Blutgruppe', dueDate: 'Geburtstermin', lmp: 'Letzte Periode', mood: 'Stimmung', status: 'Status', pregnant: 'Schwanger', planning: 'Planung', patientInfo: 'Patientendaten', kg: 'kg', cm: 'cm' },
  fr: { week: 'Semaine de grossesse', weight: 'Poids', height: 'Taille', preWeight: 'Poids avant grossesse', bloodType: 'Groupe sanguin', dueDate: "Date d'accouchement", lmp: 'Dernières règles', mood: 'Humeur', status: 'Statut', pregnant: 'Enceinte', planning: 'Planification', patientInfo: 'Informations patiente', kg: 'kg', cm: 'cm' },
  es: { week: 'Semana de embarazo', weight: 'Peso', height: 'Altura', preWeight: 'Peso pre-embarazo', bloodType: 'Grupo sanguíneo', dueDate: 'Fecha de parto', lmp: 'Última menstruación', mood: 'Ánimo', status: 'Estado', pregnant: 'Embarazada', planning: 'Planificación', patientInfo: 'Datos de la paciente', kg: 'kg', cm: 'cm' },
  pt: { week: 'Semana de gestação', weight: 'Peso', height: 'Altura', preWeight: 'Peso pré-gestação', bloodType: 'Tipo sanguíneo', dueDate: 'Data prevista', lmp: 'Última menstruação', mood: 'Humor', status: 'Estado', pregnant: 'Grávida', planning: 'Planejamento', patientInfo: 'Dados da paciente', kg: 'kg', cm: 'cm' },
  tr: { week: 'Gebelik Haftası', weight: 'Kilo', height: 'Boy', preWeight: 'Gebelik öncesi kilo', bloodType: 'Kan grubu', dueDate: 'Tahmini doğum', lmp: 'Son adet', mood: 'Ruh hali', status: 'Durum', pregnant: 'Hamile', planning: 'Planlama', patientInfo: 'Hasta Bilgileri', kg: 'kg', cm: 'cm' },
};

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

function buildPatientInfoHTML(profile: any, lang: string, isRTL: boolean): string {
  const l = profileLabels[lang] || profileLabels.en;
  const rows: string[] = [];

  // Only show fields the user actually entered (non-null, non-default)
  const hasRealData = profile.weight || profile.height || profile.bloodType || profile.dueDate || profile.lastPeriodDate || profile.prePregnancyWeight;
  if (!hasRealData) return ''; // No user-entered data, skip patient card entirely

  rows.push(`<strong>${escapeHtml(l.status)}:</strong> ${escapeHtml(profile.isPregnant ? l.pregnant : l.planning)}`);
  if (profile.isPregnant && profile.lastPeriodDate) rows.push(`<strong>${escapeHtml(l.week)}:</strong> ${escapeHtml(String(profile.pregnancyWeek))}`);
  if (profile.weight) rows.push(`<strong>${escapeHtml(l.weight)}:</strong> ${escapeHtml(String(profile.weight))} ${escapeHtml(l.kg)}`);
  if (profile.prePregnancyWeight) rows.push(`<strong>${escapeHtml(l.preWeight)}:</strong> ${escapeHtml(String(profile.prePregnancyWeight))} ${escapeHtml(l.kg)}`);
  if (profile.height) rows.push(`<strong>${escapeHtml(l.height)}:</strong> ${escapeHtml(String(profile.height))} ${escapeHtml(l.cm)}`);
  if (profile.bloodType) rows.push(`<strong>${escapeHtml(l.bloodType)}:</strong> ${escapeHtml(String(profile.bloodType))}`);
  if (profile.dueDate) rows.push(`<strong>${escapeHtml(l.dueDate)}:</strong> ${escapeHtml(new Date(profile.dueDate).toLocaleDateString(isRTL ? 'ar-SA' : lang === 'de' ? 'de-DE' : lang === 'fr' ? 'fr-FR' : lang === 'es' ? 'es-ES' : lang === 'pt' ? 'pt-BR' : lang === 'tr' ? 'tr-TR' : 'en-US'))}`);
  if (profile.lastPeriodDate) rows.push(`<strong>${escapeHtml(l.lmp)}:</strong> ${escapeHtml(new Date(profile.lastPeriodDate).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US'))}`);

  if (rows.length <= 1) return ''; // Only status, not enough info

  return `<div class="patient-card">
    <h3 class="patient-title">${escapeHtml(l.patientInfo)}</h3>
    <div class="patient-grid">${rows.map(r => `<span class="patient-field">${r}</span>`).join('')}</div>
  </div>`;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({ children, title }) => {
  const { i18n } = useTranslation();
  const { profile } = useUserProfile();
  const reportRef = useRef<HTMLDivElement>(null);
  const lang = i18n.language?.split('-')[0] || 'en';
  const isRTL = lang === 'ar';

  const handlePrint = useCallback(() => {
    if (!reportRef.current) return;

    const brandNames: Record<string, string> = {
      ar: 'أدوات الحمل الذكية', de: 'Schwangerschafts-Toolkit', fr: 'Outils de Grossesse',
      es: 'Herramientas de Embarazo', pt: 'Ferramentas de Gravidez', tr: 'Gebelik Araçları', en: 'Pregnancy Toolkits',
    };

    const content = reportRef.current.innerHTML;
    const brand = brandNames[lang] || brandNames.en;
    const patientHTML = buildPatientInfoHTML(profile, lang, isRTL);

    // Remove any previous hidden iframe
    const existingFrame = document.getElementById('__print-frame');
    if (existingFrame) existingFrame.remove();

    const iframe = document.createElement('iframe');
    iframe.id = '__print-frame';
    iframe.style.cssText = 'position:fixed;width:0;height:0;border:none;left:-9999px;top:-9999px;';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`<!DOCTYPE html>
<html dir="${isRTL ? 'rtl' : 'ltr'}" lang="${lang}">
<head>
  <meta charset="utf-8" />
  <title>${title || brand}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Cairo', 'Tajawal', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #1e293b;
      background: #fff;
      padding: 20mm 15mm;
      line-height: 1.7;
      direction: ${isRTL ? 'rtl' : 'ltr'};
      font-size: 14px;
    }
    
    .print-header {
      text-align: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 2px solid #ec4899;
    }
    .print-header h1 { font-size: 22px; font-weight: 700; color: #ec4899; margin-bottom: 4px; }
    .print-header .brand { font-size: 11px; color: #94a3b8; }
    .print-header .date { font-size: 11px; color: #64748b; margin-top: 4px; }

    .patient-card {
      margin-bottom: 16px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px 16px;
      background: #f8fafc;
    }
    .patient-title {
      font-size: 13px;
      font-weight: 700;
      color: #ec4899;
      margin-bottom: 8px;
      padding-bottom: 6px;
      border-bottom: 1px solid #f1f5f9;
    }
    .patient-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px 20px;
    }
    .patient-field {
      font-size: 12px;
      color: #334155;
      padding: 2px 0;
    }
    .patient-field strong { color: #64748b; font-weight: 600; }
    
    .print-content h1, .print-content h2, .print-content h3, .print-content h4 {
      color: #1e293b; margin-top: 16px; margin-bottom: 8px; font-weight: 700;
    }
    .print-content h1 { font-size: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
    .print-content h2 { font-size: 17px; color: #ec4899; }
    .print-content h3 { font-size: 15px; color: #8b5cf6; }
    .print-content h4 { font-size: 14px; }
    
    .print-content p { margin-bottom: 8px; }
    .print-content ul, .print-content ol { margin-bottom: 10px; padding-${isRTL ? 'right' : 'left'}: 24px; }
    .print-content li { margin-bottom: 4px; }
    .print-content strong { font-weight: 700; color: #334155; }
    
    .print-content table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    .print-content th, .print-content td {
      border: 1px solid #e2e8f0; padding: 6px 10px;
      text-align: ${isRTL ? 'right' : 'left'}; font-size: 13px;
    }
    .print-content th { background: #f8fafc; font-weight: 600; }
    
    .print-footer {
      margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0;
      text-align: center; font-size: 10px; color: #94a3b8;
    }

    button, .no-print, [data-no-print] { display: none !important; }
    
    [class*="card"], [class*="Card"] { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 10px; }
    [class*="badge"], [class*="Badge"] { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
    [role="progressbar"] { height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }

    @media print {
      body { padding: 10mm; }
      @page { margin: 10mm; size: A4; }
    }
  </style>
</head>
<body>
  <div class="print-header">
    <h1>${title || brand}</h1>
    <div class="brand">${brand}</div>
    <div class="date">${new Date().toLocaleDateString(isRTL ? 'ar-SA' : lang === 'de' ? 'de-DE' : lang === 'fr' ? 'fr-FR' : lang === 'es' ? 'es-ES' : lang === 'pt' ? 'pt-BR' : lang === 'tr' ? 'tr-TR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
  </div>
  ${patientHTML}
  <div class="print-content">${content}</div>
  <div class="print-footer">${brand} &mdash; ${new Date().getFullYear()}</div>
</body>
</html>`);
    doc.close();

    // Use setTimeout instead of onload — onload is unreliable with doc.write()
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        console.error('Print failed:', e);
      }
      setTimeout(() => iframe.remove(), 2000);
    }, 800);
  }, [lang, isRTL, title, profile]);

  return (
    <div>
      <div ref={reportRef}>
        {children}
      </div>
      <Button
        variant="outline"
        onClick={handlePrint}
        className="w-full mt-3 gap-2"
        data-no-print
      >
        <Printer className="w-4 h-4" />
        {printLabels[lang] || printLabels.en}
      </Button>
    </div>
  );
};

export default PrintableReport;
