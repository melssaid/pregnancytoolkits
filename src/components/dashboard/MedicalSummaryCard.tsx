import { useState, useCallback } from "react";
import { Download, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useTrackingStats } from "@/hooks/useTrackingStats";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { getUserId } from "@/hooks/useSupabase";
import { buildPrintHTML, loadLogoBase64 } from "@/lib/printUtils";

// ─── Localized section labels ───
const sectionLabels: Record<string, Record<string, string>> = {
  en: {
    overview: 'Pregnancy Overview', weightHistory: 'Weight Tracking History',
    kickSummary: 'Fetal Movement Summary', symptoms: 'Symptom Log',
    vitamins: 'Vitamin & Supplement Adherence', water: 'Hydration Log',
    appointments: 'Upcoming Appointments', hospitalBag: 'Hospital Bag Checklist',
    babyGrowth: 'Baby Growth Records', sleep: 'Baby Sleep Log',
    diapers: 'Diaper Tracking', healthConditions: 'Health Considerations',
    goals: 'Health Goals', noData: 'No data recorded yet',
    week: 'Week', date: 'Date', weight: 'Weight', change: 'Change',
    kicks: 'Kicks', duration: 'Duration', min: 'min', sessions: 'sessions',
    symptom: 'Symptom', severity: 'Severity', count: 'Count',
    taken: 'Taken', day: 'Day', glasses: 'Glasses', item: 'Item',
    status: 'Status', packed: 'Packed', notPacked: 'Not Packed',
    measurement: 'Measurement', value: 'Value', time: 'Time',
    type: 'Type', bmi: 'BMI', totalGain: 'Total Weight Gain',
    avgKicks: 'Avg Kicks/Session', totalSessions: 'Total Sessions',
    adherenceRate: 'Adherence Rate', avgGlasses: 'Avg Glasses/Day',
    daysLogged: 'Days Logged', totalDiapers: 'Total Changes',
    totalSleep: 'Total Sleep Hours', entries: 'entries',
  },
  ar: {
    overview: 'نظرة عامة على الحمل', weightHistory: 'سجل تتبع الوزن',
    kickSummary: 'ملخص حركة الجنين', symptoms: 'سجل الأعراض',
    vitamins: 'الالتزام بالفيتامينات والمكملات', water: 'سجل شرب الماء',
    appointments: 'المواعيد القادمة', hospitalBag: 'قائمة حقيبة المستشفى',
    babyGrowth: 'سجلات نمو الطفل', sleep: 'سجل نوم الطفل',
    diapers: 'تتبع الحفاضات', healthConditions: 'الاعتبارات الصحية',
    goals: 'الأهداف الصحية', noData: 'لا توجد بيانات مسجلة بعد',
    week: 'الأسبوع', date: 'التاريخ', weight: 'الوزن', change: 'التغيير',
    kicks: 'ركلات', duration: 'المدة', min: 'دقيقة', sessions: 'جلسات',
    symptom: 'العَرَض', severity: 'الشدة', count: 'العدد',
    taken: 'تم تناوله', day: 'اليوم', glasses: 'أكواب', item: 'العنصر',
    status: 'الحالة', packed: 'جاهز', notPacked: 'غير جاهز',
    measurement: 'القياس', value: 'القيمة', time: 'الوقت',
    type: 'النوع', bmi: 'مؤشر كتلة الجسم', totalGain: 'إجمالي زيادة الوزن',
    avgKicks: 'متوسط الركلات/جلسة', totalSessions: 'إجمالي الجلسات',
    adherenceRate: 'نسبة الالتزام', avgGlasses: 'متوسط الأكواب/يوم',
    daysLogged: 'أيام مسجلة', totalDiapers: 'إجمالي التغييرات',
    totalSleep: 'إجمالي ساعات النوم', entries: 'سجلات',
  },
  de: {
    overview: 'Schwangerschaftsübersicht', weightHistory: 'Gewichtsverlauf',
    kickSummary: 'Kindsbewegungen', symptoms: 'Symptomprotokoll',
    vitamins: 'Vitamine & Nahrungsergänzung', water: 'Trinkprotokoll',
    appointments: 'Termine', hospitalBag: 'Kliniktasche',
    babyGrowth: 'Wachstumsdaten', sleep: 'Schlafprotokoll',
    diapers: 'Windelprotokoll', healthConditions: 'Gesundheitliche Hinweise',
    goals: 'Gesundheitsziele', noData: 'Noch keine Daten',
    week: 'Woche', date: 'Datum', weight: 'Gewicht', change: 'Änderung',
    kicks: 'Tritte', duration: 'Dauer', min: 'Min', sessions: 'Sitzungen',
    symptom: 'Symptom', severity: 'Schwere', count: 'Anzahl',
    taken: 'Eingenommen', day: 'Tag', glasses: 'Gläser', item: 'Artikel',
    status: 'Status', packed: 'Gepackt', notPacked: 'Nicht gepackt',
    measurement: 'Messung', value: 'Wert', time: 'Zeit',
    type: 'Typ', bmi: 'BMI', totalGain: 'Gesamtzunahme',
    avgKicks: 'Ø Tritte/Sitzung', totalSessions: 'Sitzungen gesamt',
    adherenceRate: 'Einhaltungsrate', avgGlasses: 'Ø Gläser/Tag',
    daysLogged: 'Protokollierte Tage', totalDiapers: 'Wechsel gesamt',
    totalSleep: 'Schlafstunden gesamt', entries: 'Einträge',
  },
  fr: {
    overview: 'Aperçu de la grossesse', weightHistory: 'Suivi du poids',
    kickSummary: 'Mouvements fœtaux', symptoms: 'Journal des symptômes',
    vitamins: 'Vitamines et suppléments', water: 'Hydratation',
    appointments: 'Rendez-vous', hospitalBag: 'Valise de maternité',
    babyGrowth: 'Croissance du bébé', sleep: 'Sommeil du bébé',
    diapers: 'Suivi des couches', healthConditions: 'Considérations de santé',
    goals: 'Objectifs santé', noData: 'Aucune donnée enregistrée',
    week: 'Semaine', date: 'Date', weight: 'Poids', change: 'Variation',
    kicks: 'Coups', duration: 'Durée', min: 'min', sessions: 'séances',
    symptom: 'Symptôme', severity: 'Sévérité', count: 'Nombre',
    taken: 'Pris', day: 'Jour', glasses: 'Verres', item: 'Article',
    status: 'Statut', packed: 'Prêt', notPacked: 'Non prêt',
    measurement: 'Mesure', value: 'Valeur', time: 'Heure',
    type: 'Type', bmi: 'IMC', totalGain: 'Prise de poids totale',
    avgKicks: 'Moy. coups/séance', totalSessions: 'Séances totales',
    adherenceRate: "Taux d'adhérence", avgGlasses: 'Moy. verres/jour',
    daysLogged: 'Jours enregistrés', totalDiapers: 'Changes totaux',
    totalSleep: 'Heures de sommeil', entries: 'entrées',
  },
  es: {
    overview: 'Resumen del embarazo', weightHistory: 'Historial de peso',
    kickSummary: 'Movimientos fetales', symptoms: 'Registro de síntomas',
    vitamins: 'Vitaminas y suplementos', water: 'Hidratación',
    appointments: 'Citas', hospitalBag: 'Bolsa del hospital',
    babyGrowth: 'Crecimiento del bebé', sleep: 'Sueño del bebé',
    diapers: 'Seguimiento de pañales', healthConditions: 'Consideraciones de salud',
    goals: 'Objetivos de salud', noData: 'Sin datos registrados',
    week: 'Semana', date: 'Fecha', weight: 'Peso', change: 'Cambio',
    kicks: 'Patadas', duration: 'Duración', min: 'min', sessions: 'sesiones',
    symptom: 'Síntoma', severity: 'Severidad', count: 'Cantidad',
    taken: 'Tomado', day: 'Día', glasses: 'Vasos', item: 'Artículo',
    status: 'Estado', packed: 'Listo', notPacked: 'No listo',
    measurement: 'Medida', value: 'Valor', time: 'Hora',
    type: 'Tipo', bmi: 'IMC', totalGain: 'Aumento total',
    avgKicks: 'Prom. patadas/sesión', totalSessions: 'Sesiones totales',
    adherenceRate: 'Tasa de adherencia', avgGlasses: 'Prom. vasos/día',
    daysLogged: 'Días registrados', totalDiapers: 'Cambios totales',
    totalSleep: 'Horas de sueño', entries: 'registros',
  },
  pt: {
    overview: 'Visão geral da gestação', weightHistory: 'Histórico de peso',
    kickSummary: 'Movimentos fetais', symptoms: 'Registro de sintomas',
    vitamins: 'Vitaminas e suplementos', water: 'Hidratação',
    appointments: 'Consultas', hospitalBag: 'Mala da maternidade',
    babyGrowth: 'Crescimento do bebê', sleep: 'Sono do bebê',
    diapers: 'Fraldas', healthConditions: 'Considerações de saúde',
    goals: 'Objetivos de saúde', noData: 'Nenhum dado registrado',
    week: 'Semana', date: 'Data', weight: 'Peso', change: 'Variação',
    kicks: 'Chutes', duration: 'Duração', min: 'min', sessions: 'sessões',
    symptom: 'Sintoma', severity: 'Severidade', count: 'Quantidade',
    taken: 'Tomado', day: 'Dia', glasses: 'Copos', item: 'Item',
    status: 'Status', packed: 'Pronto', notPacked: 'Não pronto',
    measurement: 'Medida', value: 'Valor', time: 'Hora',
    type: 'Tipo', bmi: 'IMC', totalGain: 'Ganho total',
    avgKicks: 'Méd. chutes/sessão', totalSessions: 'Sessões totais',
    adherenceRate: 'Taxa de adesão', avgGlasses: 'Méd. copos/dia',
    daysLogged: 'Dias registrados', totalDiapers: 'Trocas totais',
    totalSleep: 'Horas de sono', entries: 'registros',
  },
  tr: {
    overview: 'Gebelik Özeti', weightHistory: 'Kilo Takibi',
    kickSummary: 'Bebek Hareketleri', symptoms: 'Belirti Günlüğü',
    vitamins: 'Vitamin ve Takviyeler', water: 'Su Tüketimi',
    appointments: 'Randevular', hospitalBag: 'Hastane Çantası',
    babyGrowth: 'Bebek Büyümesi', sleep: 'Bebek Uykusu',
    diapers: 'Bez Takibi', healthConditions: 'Sağlık Durumu',
    goals: 'Sağlık Hedefleri', noData: 'Henüz veri yok',
    week: 'Hafta', date: 'Tarih', weight: 'Kilo', change: 'Değişim',
    kicks: 'Tekme', duration: 'Süre', min: 'dk', sessions: 'seans',
    symptom: 'Belirti', severity: 'Şiddet', count: 'Sayı',
    taken: 'Alındı', day: 'Gün', glasses: 'Bardak', item: 'Madde',
    status: 'Durum', packed: 'Hazır', notPacked: 'Hazır değil',
    measurement: 'Ölçüm', value: 'Değer', time: 'Zaman',
    type: 'Tür', bmi: 'VKİ', totalGain: 'Toplam Artış',
    avgKicks: 'Ort. tekme/seans', totalSessions: 'Toplam Seans',
    adherenceRate: 'Uyum Oranı', avgGlasses: 'Ort. bardak/gün',
    daysLogged: 'Kayıtlı Gün', totalDiapers: 'Toplam Değişim',
    totalSleep: 'Toplam Uyku Saati', entries: 'kayıt',
  },
};

function buildSection(title: string, content: string): string {
  return `<div style="margin-bottom:20px"><h2 style="font-size:16px;color:#ec4899;border-bottom:2px solid #fce7f3;padding-bottom:6px;margin-bottom:10px">${title}</h2>${content}</div>`;
}

function buildTable(headers: string[], rows: string[][]): string {
  const ths = headers.map(h => `<th style="padding:8px 12px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:600;font-size:12px;color:#64748b">${h}</th>`).join('');
  const trs = rows.map(row =>
    `<tr>${row.map(cell => `<td style="padding:6px 12px;border:1px solid #e2e8f0;font-size:12px">${cell}</td>`).join('')}</tr>`
  ).join('');
  return `<table style="width:100%;border-collapse:collapse;margin:8px 0"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
}

function buildStatGrid(items: { label: string; value: string }[]): string {
  return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0">${items.map(i =>
    `<div style="padding:10px 14px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0">
      <div style="font-size:11px;color:#64748b;margin-bottom:2px">${i.label}</div>
      <div style="font-size:16px;font-weight:700;color:#1e293b">${i.value}</div>
    </div>`
  ).join('')}</div>`;
}

export function MedicalSummaryCard() {
  const { t, i18n } = useTranslation();
  const { profile } = useUserProfile();
  const { stats } = useTrackingStats();
  const [exporting, setExporting] = useState(false);

  const userId = getUserId();
  const lang = i18n.language?.split('-')[0] || 'en';
  const l = sectionLabels[lang] || sectionLabels.en;

  // Read all data sources
  const weightEntries = JSON.parse(localStorage.getItem("weight_gain_entries") || "[]");
  const symptomLogs = JSON.parse(localStorage.getItem("symptom_logs") || "[]");
  const kickSessions = JSON.parse(localStorage.getItem(`kick_sessions_${userId}`) || "[]");
  const vitaminLogsRaw = localStorage.getItem("vitamin-tracker-logs");
  const waterLogs = JSON.parse(localStorage.getItem(`water_logs_${userId}`) || "[]");
  const appointments = JSON.parse(localStorage.getItem("appointments") || "[]").filter((a: any) => a.user_id === userId);
  const hospitalBagItems = JSON.parse(localStorage.getItem("hospital-bag-items") || "[]");
  const babyGrowth = JSON.parse(localStorage.getItem("baby-growth-entries") || "[]");
  const sleepLogs = JSON.parse(localStorage.getItem("baby-sleep-tracker-data") || "[]");
  const diaperEntries = JSON.parse(localStorage.getItem("diaperEntries") || "[]");

  // Parse vitamin logs
  let vitaminDays = 0;
  let vitaminTotal = 0;
  if (vitaminLogsRaw) {
    try {
      const obj = JSON.parse(vitaminLogsRaw);
      vitaminDays = Object.keys(obj).length;
      vitaminTotal = Object.values(obj).reduce((sum: number, day: any) => sum + Object.keys(day).length, 0);
    } catch { /* ignore */ }
  }

  // Dashboard summary items (shown in card)
  const summaryItems = [
    { label: t("medicalSummary.currentWeek"), value: profile.pregnancyWeek ? `${profile.pregnancyWeek}` : "—" },
    { label: t("medicalSummary.weight"), value: stats.dailyTracking.lastWeight || "—" },
    { label: t("medicalSummary.weightEntries"), value: `${weightEntries.length}` },
    { label: t("medicalSummary.totalKickSessions"), value: `${kickSessions.length}` },
    { label: t("medicalSummary.bloodType"), value: profile.bloodType || "—" },
    { label: t("medicalSummary.symptomEntries"), value: `${symptomLogs.length}` },
  ];

  const buildFullReportContent = useCallback(() => {
    const sections: string[] = [];

    // ── 1. Overview Stats Grid ──
    const bmi = (profile.weight && profile.height)
      ? (profile.weight / ((profile.height / 100) ** 2)).toFixed(1)
      : '—';
    const firstWeight = weightEntries.length > 0 ? weightEntries[0]?.weight : profile.prePregnancyWeight || profile.weight;
    const lastWeight = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1]?.weight : profile.weight;
    const totalGain = (firstWeight && lastWeight) ? (lastWeight - firstWeight).toFixed(1) : '—';

    sections.push(buildSection(l.overview, buildStatGrid([
      { label: l.week, value: profile.pregnancyWeek ? `${profile.pregnancyWeek}` : '—' },
      { label: l.bmi, value: bmi },
      { label: l.totalGain, value: totalGain !== '—' ? `${totalGain} kg` : '—' },
      { label: l.totalSessions, value: `${kickSessions.length}` },
    ])));

    // ── 2. Health Conditions & Goals ──
    if (profile.healthConditions?.length > 0 && !profile.healthConditions.includes('none')) {
      const conditionsList = profile.healthConditions.map((c: string) => {
        const key = `onboarding.step3.condition.${c}`;
        const translated = t(key);
        return translated !== key ? translated : c;
      }).join('، ');
      sections.push(buildSection(l.healthConditions,
        `<p style="font-size:13px;color:#334155;padding:8px 12px;background:#fff7ed;border-radius:8px;border:1px solid #fed7aa">⚠️ ${conditionsList}</p>`
      ));
    }

    if (profile.goals?.length > 0) {
      const goalsList = profile.goals.map((g: string) => {
        const key = `onboarding.step4.goal.${g}`;
        const translated = t(key);
        return translated !== key ? translated : g;
      }).join(' • ');
      sections.push(buildSection(l.goals,
        `<p style="font-size:13px;color:#334155;padding:8px 12px;background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0">🎯 ${goalsList}</p>`
      ));
    }

    // ── 3. Weight History ──
    if (weightEntries.length > 0) {
      const sorted = [...weightEntries].sort((a: any, b: any) => (a.week || 0) - (b.week || 0));
      const rows = sorted.slice(-15).map((e: any, i: number) => {
        const prev = i > 0 ? sorted[Math.max(0, sorted.indexOf(e) - 1)]?.weight : null;
        const diff = prev ? (e.weight - prev).toFixed(1) : '—';
        const diffColor = diff !== '—' ? (parseFloat(diff) > 0 ? '↑' : parseFloat(diff) < 0 ? '↓' : '→') : '';
        return [
          e.week ? `${l.week} ${e.week}` : (e.date || '—'),
          `${e.weight} kg`,
          diff !== '—' ? `${diffColor} ${diff} kg` : '—',
        ];
      });
      sections.push(buildSection(
        `${l.weightHistory} (${weightEntries.length} ${l.entries})`,
        buildTable([l.week, l.weight, l.change], rows)
      ));
    }

    // ── 4. Kick Sessions ──
    if (kickSessions.length > 0) {
      const totalKicks = kickSessions.reduce((s: number, k: any) => s + (k.total_kicks || 0), 0);
      const avgKicks = Math.round(totalKicks / kickSessions.length);
      const recent = [...kickSessions].sort((a: any, b: any) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()).slice(0, 10);
      const rows = recent.map((s: any) => {
        const date = s.started_at ? new Date(s.started_at).toLocaleDateString() : '—';
        const dur = s.duration_seconds ? Math.round(s.duration_seconds / 60) : '—';
        return [date, `${s.total_kicks || 0}`, dur !== '—' ? `${dur} ${l.min}` : '—'];
      });

      sections.push(buildSection(l.kickSummary,
        buildStatGrid([
          { label: l.totalSessions, value: `${kickSessions.length}` },
          { label: l.avgKicks, value: `${avgKicks}` },
        ]) + buildTable([l.date, l.kicks, l.duration], rows)
      ));
    }

    // ── 5. Symptom Log ──
    if (symptomLogs.length > 0) {
      // Group by symptom name and count
      const symptomMap: Record<string, { count: number; lastDate: string }> = {};
      symptomLogs.forEach((s: any) => {
        const name = s.symptom || s.name || 'Unknown';
        if (!symptomMap[name]) symptomMap[name] = { count: 0, lastDate: '' };
        symptomMap[name].count++;
        if (s.date > (symptomMap[name].lastDate || '')) symptomMap[name].lastDate = s.date;
      });
      const rows = Object.entries(symptomMap)
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 15)
        .map(([name, data]) => [name, `${data.count}`, data.lastDate || '—']);
      sections.push(buildSection(
        `${l.symptoms} (${symptomLogs.length} ${l.entries})`,
        buildTable([l.symptom, l.count, l.date], rows)
      ));
    }

    // ── 6. Vitamins ──
    if (vitaminDays > 0) {
      sections.push(buildSection(l.vitamins, buildStatGrid([
        { label: l.daysLogged, value: `${vitaminDays}` },
        { label: l.taken, value: `${vitaminTotal}` },
      ])));
    }

    // ── 7. Water ──
    if (waterLogs.length > 0) {
      const totalGlasses = waterLogs.reduce((s: number, w: any) => s + (w.glasses || 1), 0);
      const uniqueDays = new Set(waterLogs.map((w: any) => w.date?.split('T')[0])).size;
      const avg = uniqueDays > 0 ? (totalGlasses / uniqueDays).toFixed(1) : '—';
      sections.push(buildSection(l.water, buildStatGrid([
        { label: l.daysLogged, value: `${uniqueDays}` },
        { label: l.avgGlasses, value: `${avg}` },
      ])));
    }

    // ── 8. Appointments ──
    const upcoming = appointments.filter((a: any) => new Date(a.appointment_date || a.date) >= new Date());
    if (upcoming.length > 0) {
      const rows = upcoming.slice(0, 10).map((a: any) => [
        a.title || a.type || '—',
        new Date(a.appointment_date || a.date).toLocaleDateString(),
        a.notes || '—',
      ]);
      sections.push(buildSection(l.appointments, buildTable([l.type, l.date, ''], rows)));
    }

    // ── 9. Hospital Bag ──
    if (hospitalBagItems.length > 0) {
      const packed = hospitalBagItems.filter((i: any) => i.packed).length;
      const rows = hospitalBagItems.slice(0, 20).map((i: any) => [
        i.name || i.label || '—',
        i.packed ? `✅ ${l.packed}` : `⬜ ${l.notPacked}`,
      ]);
      sections.push(buildSection(
        `${l.hospitalBag} (${packed}/${hospitalBagItems.length})`,
        buildTable([l.item, l.status], rows)
      ));
    }

    // ── 10. Baby Growth ──
    if (babyGrowth.length > 0) {
      const rows = babyGrowth.slice(-10).map((e: any) => [
        e.date ? new Date(e.date).toLocaleDateString() : '—',
        e.weight ? `${e.weight} kg` : '—',
        e.height ? `${e.height} cm` : '—',
        e.headCircumference ? `${e.headCircumference} cm` : '—',
      ]);
      sections.push(buildSection(l.babyGrowth,
        buildTable([l.date, l.weight, `${l.measurement}`, ''], rows)
      ));
    }

    // ── 11. Baby Sleep ──
    if (sleepLogs.length > 0) {
      const totalHours = sleepLogs.reduce((s: number, sl: any) => s + (sl.duration || 0), 0) / 60;
      sections.push(buildSection(l.sleep, buildStatGrid([
        { label: l.entries, value: `${sleepLogs.length}` },
        { label: l.totalSleep, value: `${Math.round(totalHours * 10) / 10}h` },
      ])));
    }

    // ── 12. Diapers ──
    if (diaperEntries.length > 0) {
      const uniqueDays = new Set(diaperEntries.map((d: any) => d.timestamp?.split('T')[0])).size;
      sections.push(buildSection(l.diapers, buildStatGrid([
        { label: l.totalDiapers, value: `${diaperEntries.length}` },
        { label: l.daysLogged, value: `${uniqueDays}` },
      ])));
    }

    // If everything is empty
    if (sections.length <= 1) {
      sections.push(`<p style="text-align:center;color:#94a3b8;padding:40px 0;font-size:14px">${l.noData}</p>`);
    }

    return sections.join('');
  }, [profile, weightEntries, kickSessions, symptomLogs, vitaminDays, vitaminTotal, waterLogs, appointments, hospitalBagItems, babyGrowth, sleepLogs, diaperEntries, l, t]);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const isRTL = lang === "ar";
      const logoDataUrl = await loadLogoBase64();
      const content = buildFullReportContent();

      const htmlContent = buildPrintHTML({
        content,
        title: t("medicalSummary.reportTitle", t("medicalSummary.title")),
        lang,
        isRTL,
        profile,
        logoDataUrl,
      });

      const iframe = document.createElement("iframe");
      iframe.style.cssText = "position:fixed;top:-10000px;left:-10000px;width:210mm;height:297mm;border:none";
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        document.body.removeChild(iframe);
        throw new Error("Cannot access iframe document");
      }

      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();

      iframe.onload = () => {
        setTimeout(() => {
          try {
            iframe.contentWindow?.print();
          } catch {
            const win = window.open("", "_blank");
            if (win) {
              win.document.write(htmlContent);
              win.document.close();
              win.print();
            }
          }
          setTimeout(() => {
            try { document.body.removeChild(iframe); } catch { /* already removed */ }
          }, 2000);
        }, 500);
      };

      toast.success(t("medicalSummary.exportSuccess", "Report exported successfully"));
    } catch (err) {
      console.error("PDF export error:", err);
      toast.error(t("medicalSummary.exportError", "Failed to export report"));
    } finally {
      setExporting(false);
    }
  }, [lang, buildFullReportContent, profile, t]);

  return (
    <Card className="p-4 bg-card border-border/50">
      <div className="mb-3">
        <h3 className="text-base font-bold text-foreground">{t("medicalSummary.title")}</h3>
      </div>
      <div className="space-y-1.5 mb-3">
        {summaryItems.map((item) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between"
          >
            <span className="text-[11px] text-muted-foreground">{item.label}</span>
            <span className="text-[11px] font-bold text-foreground">{item.value}</span>
          </motion.div>
        ))}
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={handleExport}
        disabled={exporting}
        className="w-full text-xs h-8 gap-1"
      >
        {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
        {exporting ? t("medicalSummary.exporting", "Exporting...") : t("medicalSummary.export")}
      </Button>
    </Card>
  );
}
