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

const footerMessages: Record<string, string> = {
  en: 'We wish you a safe and healthy pregnancy 💕 For any questions, contact us at',
  ar: 'نتمنى لكِ حملاً آمناً وصحة دائمة 💕 لأي استفسار، تواصلي معنا عبر',
  de: 'Wir wünschen Ihnen eine sichere und gesunde Schwangerschaft 💕 Bei Fragen kontaktieren Sie uns unter',
  fr: 'Nous vous souhaitons une grossesse sûre et en bonne santé 💕 Pour toute question, contactez-nous à',
  es: 'Le deseamos un embarazo seguro y saludable 💕 Para cualquier consulta, contáctenos en',
  pt: 'Desejamos uma gravidez segura e saudável 💕 Para dúvidas, entre em contato pelo',
  tr: 'Size sağlıklı ve güvenli bir gebelik diliyoruz 💕 Sorularınız için bize ulaşın',
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

  const cleanHTMLForPrint = useCallback((html: string): string => {
    // Create a temporary container to manipulate the DOM
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Remove all inline styles that framer-motion adds (opacity, transform, etc.)
    const allElements = temp.querySelectorAll('*');
    allElements.forEach(el => {
      const htmlEl = el as HTMLElement;
      // Remove framer-motion inline styles that hide content
      htmlEl.style.removeProperty('opacity');
      htmlEl.style.removeProperty('transform');
      htmlEl.style.removeProperty('will-change');
      htmlEl.style.removeProperty('translate');
      htmlEl.style.removeProperty('scale');
      htmlEl.style.removeProperty('rotate');
      // If style attribute is now empty, remove it entirely
      if (htmlEl.getAttribute('style')?.trim() === '') {
        htmlEl.removeAttribute('style');
      }
    });
    
    // Remove elements marked as no-print
    temp.querySelectorAll('[data-no-print], .no-print, button').forEach(el => el.remove());
    
    return temp.innerHTML;
  }, []);

  const handlePrint = useCallback(() => {
    if (!reportRef.current) return;

    const brandNames: Record<string, string> = {
      ar: 'أدوات الحمل الذكية', de: 'Schwangerschafts-Toolkit', fr: 'Outils de Grossesse',
      es: 'Herramientas de Embarazo', pt: 'Ferramentas de Gravidez', tr: 'Gebelik Araçları', en: 'Pregnancy Toolkits',
    };

    const content = cleanHTMLForPrint(reportRef.current.innerHTML);
    const brand = brandNames[lang] || brandNames.en;
    const patientHTML = buildPatientInfoHTML(profile, lang, isRTL);

    const htmlContent = `<!DOCTYPE html>
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
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 2px solid #ec4899;
    }
    .print-header img.logo {
      width: 80px;
      height: 80px;
      object-fit: contain;
      margin: 0 auto 8px;
      display: block;
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
      margin-top: 30px; padding-top: 15px; border-top: 2px solid #ec4899;
      text-align: center; color: #64748b;
    }
    .print-footer .footer-message {
      font-size: 13px; margin-bottom: 6px; line-height: 1.6;
    }
    .print-footer .footer-email {
      font-size: 13px; color: #ec4899; font-weight: 600; text-decoration: none;
    }
    .print-footer .footer-brand {
      font-size: 10px; color: #94a3b8; margin-top: 10px;
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
    <img class="logo" src="${window.location.origin}/logo.png" alt="Logo" crossorigin="anonymous" />
    <h1>${title || brand}</h1>
    <div class="brand">${brand}</div>
    <div class="date">${new Date().toLocaleDateString(isRTL ? 'ar-SA' : lang === 'de' ? 'de-DE' : lang === 'fr' ? 'fr-FR' : lang === 'es' ? 'es-ES' : lang === 'pt' ? 'pt-BR' : lang === 'tr' ? 'tr-TR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
  </div>
  ${patientHTML}
  <div class="print-content">${content}</div>
  <div class="print-footer">
    <div class="footer-message">${footerMessages[lang] || footerMessages.en}</div>
    <a class="footer-email" href="mailto:Melssaid@gmail.com">Melssaid@gmail.com</a>
    <div class="footer-brand">${brand} &mdash; ${new Date().getFullYear()}</div>
  </div>
  <script>
    // Auto-print when the page loads, then close
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
    window.onafterprint = function() {
      window.close();
    };
  </script>
</body>
</html>`;

    // Create a Blob URL - this bypasses popup blockers and sandbox restrictions
    const blob = new Blob([htmlContent], { type: 'text/html; charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    
    const printTab = window.open(blobUrl, '_blank');
    
    if (!printTab) {
      // Fallback: use current window print with injected styles
      const printStyleId = '__print-style-override';
      const existingStyle = document.getElementById(printStyleId);
      if (existingStyle) existingStyle.remove();

      const style = document.createElement('style');
      style.id = printStyleId;
      style.textContent = `
        @media print {
          body > *:not(#__print-container) { display: none !important; }
          #__print-container { display: block !important; }
        }
      `;
      document.head.appendChild(style);

      const container = document.createElement('div');
      container.id = '__print-container';
      container.style.display = 'none';
      container.innerHTML = `<div style="font-family: Cairo, Tajawal, sans-serif; direction: ${isRTL ? 'rtl' : 'ltr'}; padding: 20px;">
        <h1 style="color: #ec4899; text-align: center; margin-bottom: 16px;">${title || brand}</h1>
        ${patientHTML}
        <div>${content}</div>
      </div>`;
      document.body.appendChild(container);

      window.print();

      setTimeout(() => {
        container.remove();
        style.remove();
      }, 1000);
    }

    // Clean up blob URL after a delay
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  }, [lang, isRTL, title, profile, cleanHTMLForPrint]);

  const printHints: Record<string, string> = {
    ar: '📄 احفظي نسخة لمشاركتها مع طبيبتك',
    en: '📄 Save a copy to share with your doctor',
    fr: '📄 Enregistrez une copie pour votre médecin',
    de: '📄 Speichern Sie eine Kopie für Ihren Arzt',
    es: '📄 Guarda una copia para tu médico',
    pt: '📄 Salve uma cópia para seu médico',
    tr: '📄 Doktorunuzla paylaşmak için bir kopya kaydedin',
  };

  return (
    <div>
      <div ref={reportRef}>
        {children}
      </div>
      <div className="mt-3 space-y-1.5" data-no-print>
        <Button
          variant="outline"
          onClick={handlePrint}
          className="w-full gap-2"
        >
          <Printer className="w-4 h-4" />
          {printLabels[lang] || printLabels.en}
        </Button>
        <p className="text-[10px] text-muted-foreground/50 text-center tracking-wide">
          {printHints[lang] || printHints.en}
        </p>
      </div>
    </div>
  );
};

export default PrintableReport;
