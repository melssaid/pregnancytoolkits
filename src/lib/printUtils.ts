/**
 * Utility functions for building printable HTML reports.
 * Extracted from PrintableReport to keep components small.
 */

// Cache for logo as base64 data URL
let logoBase64Cache: string | null = null;

export async function loadLogoBase64(): Promise<string> {
  if (logoBase64Cache) return logoBase64Cache;
  try {
    const response = await fetch('/logo.png');
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        logoBase64Cache = reader.result as string;
        resolve(logoBase64Cache);
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(blob);
    });
  } catch {
    return '';
  }
}

interface BuildPrintHTMLOptions {
  content: string;
  title?: string;
  lang: string;
  isRTL: boolean;
  profile: any;
  logoDataUrl?: string;
}

const brandNames: Record<string, string> = {
  ar: 'أدوات الحمل الذكية', de: 'Schwangerschafts-Toolkit', fr: 'Outils de Grossesse',
  es: 'Herramientas de Embarazo', pt: 'Ferramentas de Gravidez', tr: 'Gebelik Araçları', en: 'Pregnancy Toolkits',
};

const profileLabels: Record<string, Record<string, string>> = {
  en: { week: 'Pregnancy Week', weight: 'Weight', height: 'Height', preWeight: 'Pre-pregnancy Weight', bloodType: 'Blood Type', dueDate: 'Due Date', lmp: 'Last Period', status: 'Status', pregnant: 'Pregnant', planning: 'Planning', patientInfo: 'Patient Information', kg: 'kg', cm: 'cm' },
  ar: { week: 'أسبوع الحمل', weight: 'الوزن', height: 'الطول', preWeight: 'الوزن قبل الحمل', bloodType: 'فصيلة الدم', dueDate: 'تاريخ الولادة المتوقع', lmp: 'آخر دورة شهرية', status: 'الحالة', pregnant: 'حامل', planning: 'تخطيط', patientInfo: 'بيانات المريضة', kg: 'كغ', cm: 'سم' },
  de: { week: 'Schwangerschaftswoche', weight: 'Gewicht', height: 'Größe', preWeight: 'Gewicht vor der Schwangerschaft', bloodType: 'Blutgruppe', dueDate: 'Geburtstermin', lmp: 'Letzte Periode', status: 'Status', pregnant: 'Schwanger', planning: 'Planung', patientInfo: 'Patientendaten', kg: 'kg', cm: 'cm' },
  fr: { week: 'Semaine de grossesse', weight: 'Poids', height: 'Taille', preWeight: 'Poids avant grossesse', bloodType: 'Groupe sanguin', dueDate: "Date d'accouchement", lmp: 'Dernières règles', status: 'Statut', pregnant: 'Enceinte', planning: 'Planification', patientInfo: 'Informations patiente', kg: 'kg', cm: 'cm' },
  es: { week: 'Semana de embarazo', weight: 'Peso', height: 'Altura', preWeight: 'Peso pre-embarazo', bloodType: 'Grupo sanguíneo', dueDate: 'Fecha de parto', lmp: 'Última menstruación', status: 'Estado', pregnant: 'Embarazada', planning: 'Planificación', patientInfo: 'Datos de la paciente', kg: 'kg', cm: 'cm' },
  pt: { week: 'Semana de gestação', weight: 'Peso', height: 'Altura', preWeight: 'Peso pré-gestação', bloodType: 'Tipo sanguíneo', dueDate: 'Data prevista', lmp: 'Última menstruação', status: 'Estado', pregnant: 'Grávida', planning: 'Planejamento', patientInfo: 'Dados da paciente', kg: 'kg', cm: 'cm' },
  tr: { week: 'Gebelik Haftası', weight: 'Kilo', height: 'Boy', preWeight: 'Gebelik öncesi kilo', bloodType: 'Kan grubu', dueDate: 'Tahmini doğum', lmp: 'Son adet', status: 'Durum', pregnant: 'Hamile', planning: 'Planlama', patientInfo: 'Hasta Bilgileri', kg: 'kg', cm: 'cm' },
};

const footerMessages: Record<string, string> = {
  en: 'We wish you a safe and healthy pregnancy. For any questions, contact us at',
  ar: 'نتمنى لكِ حملاً آمناً وصحة دائمة. لأي استفسار، تواصلي معنا عبر',
  de: 'Wir wünschen Ihnen eine sichere und gesunde Schwangerschaft. Bei Fragen kontaktieren Sie uns unter',
  fr: 'Nous vous souhaitons une grossesse sûre et en bonne santé. Pour toute question, contactez-nous à',
  es: 'Le deseamos un embarazo seguro y saludable. Para cualquier consulta, contáctenos en',
  pt: 'Desejamos uma gravidez segura e saudável. Para dúvidas, entre em contato pelo',
  tr: 'Size sağlıklı ve güvenli bir gebelik diliyoruz. Sorularınız için bize ulaşın',
};

const disclaimerMessages: Record<string, string> = {
  en: 'This report is for educational and informational purposes only. It is not a substitute for professional medical advice.',
  ar: 'هذا التقرير لأغراض تعليمية وتثقيفية فقط، ولا يُغني عن استشارة الطبيب المختص.',
  de: 'Dieser Bericht dient nur zu Bildungs- und Informationszwecken und ersetzt keine ärztliche Beratung.',
  fr: 'Ce rapport est à titre éducatif et informatif uniquement. Il ne remplace pas un avis médical professionnel.',
  es: 'Este informe es solo con fines educativos e informativos. No sustituye el consejo médico profesional.',
  pt: 'Este relatório é apenas para fins educacionais e informativos. Não substitui o aconselhamento médico profissional.',
  tr: 'Bu rapor yalnızca eğitim ve bilgilendirme amaçlıdır. Profesyonel tıbbi tavsiyenin yerini tutmaz.',
};

const websiteLabel: Record<string, string> = {
  en: 'Website', ar: 'الموقع', de: 'Webseite', fr: 'Site web', es: 'Sitio web', pt: 'Site', tr: 'Web sitesi',
};

const generatedByLabel: Record<string, string> = {
  en: 'Generated by', ar: 'تم إنشاؤه بواسطة', de: 'Erstellt von', fr: 'Généré par', es: 'Generado por', pt: 'Gerado por', tr: 'Oluşturan',
};

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

function getLocaleString(lang: string, isRTL: boolean): string {
  if (isRTL) return 'ar-SA';
  const map: Record<string, string> = { de: 'de-DE', fr: 'fr-FR', es: 'es-ES', pt: 'pt-BR', tr: 'tr-TR' };
  return map[lang] || 'en-US';
}

function buildPatientInfoHTML(profile: any, lang: string, isRTL: boolean): string {
  const l = profileLabels[lang] || profileLabels.en;
  const rows: string[] = [];

  const hasRealData = profile?.weight || profile?.height || profile?.bloodType || profile?.dueDate || profile?.lastPeriodDate || profile?.prePregnancyWeight;
  if (!hasRealData) return '';

  rows.push(`<strong>${escapeHtml(l.status)}:</strong> ${escapeHtml(profile.isPregnant ? l.pregnant : l.planning)}`);
  if (profile.isPregnant && profile.lastPeriodDate) rows.push(`<strong>${escapeHtml(l.week)}:</strong> ${escapeHtml(String(profile.pregnancyWeek))}`);
  if (profile.weight) rows.push(`<strong>${escapeHtml(l.weight)}:</strong> ${escapeHtml(String(profile.weight))} ${escapeHtml(l.kg)}`);
  if (profile.prePregnancyWeight) rows.push(`<strong>${escapeHtml(l.preWeight)}:</strong> ${escapeHtml(String(profile.prePregnancyWeight))} ${escapeHtml(l.kg)}`);
  if (profile.height) rows.push(`<strong>${escapeHtml(l.height)}:</strong> ${escapeHtml(String(profile.height))} ${escapeHtml(l.cm)}`);
  if (profile.bloodType) rows.push(`<strong>${escapeHtml(l.bloodType)}:</strong> ${escapeHtml(String(profile.bloodType))}`);
  if (profile.dueDate) rows.push(`<strong>${escapeHtml(l.dueDate)}:</strong> ${escapeHtml(new Date(profile.dueDate).toLocaleDateString(getLocaleString(lang, isRTL)))}`);
  if (profile.lastPeriodDate) rows.push(`<strong>${escapeHtml(l.lmp)}:</strong> ${escapeHtml(new Date(profile.lastPeriodDate).toLocaleDateString(getLocaleString(lang, isRTL)))}`);

  if (rows.length <= 1) return '';

  return `<div class="patient-card">
    <h3 class="patient-title">${escapeHtml(l.patientInfo)}</h3>
    <div class="patient-grid">${rows.map(r => `<span class="patient-field">${r}</span>`).join('')}</div>
  </div>`;
}

export function buildPrintHTML({ content, title, lang, isRTL, profile, logoDataUrl }: BuildPrintHTMLOptions): string {
  const brand = brandNames[lang] || brandNames.en;
  const patientHTML = buildPatientInfoHTML(profile, lang, isRTL);
  const locale = getLocaleString(lang, isRTL);
  const dateStr = new Date().toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
  const pad = isRTL ? 'right' : 'left';

  return `<!DOCTYPE html>
<html dir="${isRTL ? 'rtl' : 'ltr'}" lang="${lang}">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title || brand)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Cairo', 'Tajawal', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #1e293b; background: #fff; padding: 20mm 15mm; line-height: 1.7;
      direction: ${isRTL ? 'rtl' : 'ltr'}; font-size: 14px;
    }
    
    .print-header {
      text-align: center; margin-bottom: 20px; padding-bottom: 16px;
      border-bottom: 2px solid #ec4899;
    }
    .print-header img.logo { width: 80px; height: 80px; object-fit: contain; margin: 0 auto 8px; display: block; border-radius: 50%; }
    .print-header h1 { font-size: 22px; font-weight: 700; color: #ec4899; margin-bottom: 4px; }
    .print-header .brand { font-size: 11px; color: #94a3b8; }
    .print-header .date { font-size: 11px; color: #64748b; margin-top: 4px; }

    .patient-card {
      margin-bottom: 16px; border: 1px solid #e2e8f0; border-radius: 10px;
      padding: 12px 16px; background: #f8fafc;
    }
    .patient-title { font-size: 13px; font-weight: 700; color: #ec4899; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid #f1f5f9; }
    .patient-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 20px; }
    .patient-field { font-size: 12px; color: #334155; padding: 2px 0; }
    .patient-field strong { color: #64748b; font-weight: 600; }
    
    .print-content h1, .print-content h2, .print-content h3, .print-content h4 { color: #1e293b; margin-top: 16px; margin-bottom: 8px; font-weight: 700; }
    .print-content h1 { font-size: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
    .print-content h2 { font-size: 17px; color: #ec4899; }
    .print-content h3 { font-size: 15px; color: #8b5cf6; }
    .print-content h4 { font-size: 14px; }
    .print-content p { margin-bottom: 8px; }
    .print-content ul, .print-content ol { margin-bottom: 10px; padding-${pad}: 24px; }
    .print-content li { margin-bottom: 4px; }
    .print-content strong { font-weight: 700; color: #334155; }
    .print-content table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    .print-content th, .print-content td { border: 1px solid #e2e8f0; padding: 6px 10px; text-align: ${isRTL ? 'right' : 'left'}; font-size: 13px; }
    .print-content th { background: #f8fafc; font-weight: 600; }
    
    .print-footer { margin-top: 40px; padding-top: 20px; border-top: 1.5px solid #e2e8f0; }
    .footer-signature {
      display: flex; align-items: center; gap: 14px; margin-bottom: 16px;
      padding: 14px 18px; background: #faf8f6; border-radius: 10px; border: 1px solid #f1eded;
    }
    .footer-signature img { width: 48px; height: 48px; object-fit: contain; border-radius: 50%; border: 2px solid #fce7f3; }
    .footer-sig-info { flex: 1; }
    .footer-sig-brand { font-size: 14px; font-weight: 700; color: #be185d; margin-bottom: 2px; }
    .footer-sig-contact { font-size: 11px; color: #64748b; line-height: 1.6; }
    .footer-sig-contact a { color: #be185d; text-decoration: none; font-weight: 600; }
    .footer-sig-contact span { display: inline-block; margin: 0 4px; color: #cbd5e1; }
    .footer-message { font-size: 12px; color: #64748b; text-align: center; line-height: 1.6; margin-bottom: 10px; }
    .footer-disclaimer { font-size: 10px; color: #94a3b8; text-align: center; line-height: 1.5; padding: 8px 12px; background: #f8fafc; border-radius: 6px; margin-bottom: 10px; }
    .footer-copyright { font-size: 9px; color: #cbd5e1; text-align: center; letter-spacing: 0.5px; }

    /* Hide interactive elements */
    button, .no-print, [data-no-print] { display: none !important; }
    
    /* Style cards and badges generically */
    [class*="card"], [class*="Card"] { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 10px; }
    [class*="badge"], [class*="Badge"] { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }

    /* Force all elements visible (override framer-motion, hidden states, etc.) */
    .print-content * { opacity: 1 !important; transform: none !important; visibility: visible !important; }

    @media print {
      body { padding: 10mm; }
      @page { margin: 10mm; size: A4; }
    }
  </style>
</head>
<body>
  <div class="print-header">
    <img class="logo" src="${logoDataUrl || `${window.location.origin}/logo.png`}" alt="Logo" onerror="this.style.display='none'" />
    <h1>${escapeHtml(title || brand)}</h1>
    <div class="brand">${escapeHtml(brand)}</div>
    <div class="date">${dateStr}</div>
  </div>
  ${patientHTML}
  <div class="print-content">${content}</div>
  <div class="print-footer">
    <div class="footer-signature">
      <img src="${logoDataUrl || `${window.location.origin}/logo.png`}" alt="" onerror="this.style.display='none'" />
      <div class="footer-sig-info">
        <div class="footer-sig-brand">${escapeHtml(brand)}</div>
        <div class="footer-sig-contact">
          <a href="mailto:pregnancytoolkits@gmail.com">pregnancytoolkits@gmail.com</a>
          <span>|</span>
          ${websiteLabel[lang] || websiteLabel.en}: <a href="https://pregnancytoolkits.lovable.app">pregnancytoolkits.lovable.app</a>
        </div>
      </div>
    </div>
    <div class="footer-message">${footerMessages[lang] || footerMessages.en}</div>
    <div class="footer-disclaimer">${disclaimerMessages[lang] || disclaimerMessages.en}</div>
    <div class="footer-copyright">${generatedByLabel[lang] || generatedByLabel.en} ${escapeHtml(brand)} &mdash; ${dateStr}</div>
  </div>
</body>
</html>`;
}
