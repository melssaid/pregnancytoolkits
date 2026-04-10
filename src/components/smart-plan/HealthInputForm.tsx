import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Info, Baby } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WeekSlider } from "@/components/WeekSlider";
import { Link } from "react-router-dom";

export interface HealthData {
  week: number;
  weight: number;
  height: number;
  age: number;
  lastKickCount: number;
  bloodPressureSys: number;
  bloodPressureDia: number;
  sleepHours: number;
  activityLevel: string;
  mood: string;
  conditions: string[];
}

/** Read latest kick session stats from localStorage */
function getLatestKickStats(): { totalKicks: number; lastSessionDate: string | null } {
  try {
    const userId = localStorage.getItem('pregnancy_user_id') || 'default';
    const raw = localStorage.getItem(`kick_sessions_${userId}`);
    if (!raw) return { totalKicks: 0, lastSessionDate: null };
    const sessions = JSON.parse(raw) as Array<{ total_kicks?: number; ended_at?: string; started_at?: string }>;
    const completed = sessions.filter(s => s.ended_at).sort((a, b) =>
      new Date(b.ended_at!).getTime() - new Date(a.ended_at!).getTime()
    );
    if (completed.length === 0) return { totalKicks: 0, lastSessionDate: null };
    return {
      totalKicks: completed[0].total_kicks || 0,
      lastSessionDate: completed[0].ended_at || null,
    };
  } catch {
    return { totalKicks: 0, lastSessionDate: null };
  }
}

const conditionOptions = [
  { key: 'gestational_diabetes', ar: 'سكري الحمل', en: 'Gestational Diabetes', de: 'Schwangerschaftsdiabetes', fr: 'Diabète gestationnel', es: 'Diabetes gestacional', pt: 'Diabetes gestacional', tr: 'Gebelik Diyabeti' },
  { key: 'hypertension', ar: 'ارتفاع ضغط الدم', en: 'Hypertension', de: 'Bluthochdruck', fr: 'Hypertension', es: 'Hipertensión', pt: 'Hipertensão', tr: 'Hipertansiyon' },
  { key: 'anemia', ar: 'فقر الدم', en: 'Anemia', de: 'Anämie', fr: 'Anémie', es: 'Anemia', pt: 'Anemia', tr: 'Anemi' },
  { key: 'thyroid', ar: 'مشاكل الغدة الدرقية', en: 'Thyroid Issues', de: 'Schilddrüsenprobleme', fr: 'Problèmes thyroïdiens', es: 'Problemas de tiroides', pt: 'Problemas de tireoide', tr: 'Tiroid Sorunları' },
  { key: 'preeclampsia_risk', ar: 'خطر تسمم الحمل', en: 'Preeclampsia Risk', de: 'Präeklampsie-Risiko', fr: 'Risque de prééclampsie', es: 'Riesgo de preeclampsia', pt: 'Risco de pré-eclâmpsia', tr: 'Preeklampsi Riski' },
];

const moodOptions = [
  { value: 'great', ar: 'ممتازة', en: 'Great', de: 'Ausgezeichnet', fr: 'Excellent', es: 'Excelente', pt: 'Excelente', tr: 'Harika' },
  { value: 'good', ar: 'جيدة', en: 'Good', de: 'Gut', fr: 'Bien', es: 'Bien', pt: 'Bom', tr: 'İyi' },
  { value: 'okay', ar: 'مقبولة', en: 'Okay', de: 'Okay', fr: 'Correct', es: 'Regular', pt: 'Razoável', tr: 'İdare eder' },
  { value: 'stressed', ar: 'متوترة', en: 'Stressed', de: 'Gestresst', fr: 'Stressée', es: 'Estresada', pt: 'Estressada', tr: 'Stresli' },
  { value: 'low', ar: 'منخفضة', en: 'Low', de: 'Niedrig', fr: 'Basse', es: 'Baja', pt: 'Baixo', tr: 'Düşük' },
];

const activityOptions = [
  { value: 'sedentary', ar: 'قليل الحركة', en: 'Sedentary', de: 'Sitzend', fr: 'Sédentaire', es: 'Sedentario', pt: 'Sedentário', tr: 'Hareketsiz' },
  { value: 'moderate', ar: 'متوسط', en: 'Moderate', de: 'Mäßig', fr: 'Modéré', es: 'Moderado', pt: 'Moderado', tr: 'Orta' },
  { value: 'active', ar: 'نشيط', en: 'Active', de: 'Aktiv', fr: 'Actif', es: 'Activo', pt: 'Ativo', tr: 'Aktif' },
];

interface HealthInputFormProps {
  health: HealthData;
  onUpdate: (field: keyof HealthData, value: any) => void;
  lang: string;
}

export function HealthInputForm({ health, onUpdate, lang }: HealthInputFormProps) {
  const { t } = useTranslation();
  const [showMore, setShowMore] = useState(false);
  const kickStats = useMemo(() => getLatestKickStats(), []);

  // Sync kick count into health data for AI prompt
  useState(() => {
    if (kickStats.totalKicks > 0 && health.lastKickCount !== kickStats.totalKicks) {
      onUpdate('lastKickCount', kickStats.totalKicks);
    }
  });

  const getLabel = (option: Record<string, string>) => option[lang] || option.en;

  const kickLabels: Record<string, { title: string; noData: string; kicks: string; lastSession: string; goTrack: string }> = {
    ar: { title: 'حركات الطفل', noData: 'لا توجد بيانات — سجّلي حركات طفلك', kicks: 'ركلة', lastSession: 'آخر جلسة', goTrack: 'تتبع الحركات' },
    en: { title: 'Baby Movements', noData: 'No data — track your baby\'s kicks', kicks: 'kicks', lastSession: 'Last session', goTrack: 'Track Kicks' },
    de: { title: 'Babybewegungen', noData: 'Keine Daten — erfasse die Tritte', kicks: 'Tritte', lastSession: 'Letzte Sitzung', goTrack: 'Tritte erfassen' },
    fr: { title: 'Mouvements du bébé', noData: 'Aucune donnée — suivez les coups', kicks: 'coups', lastSession: 'Dernière session', goTrack: 'Suivre les coups' },
    es: { title: 'Movimientos del bebé', noData: 'Sin datos — registra las patadas', kicks: 'patadas', lastSession: 'Última sesión', goTrack: 'Registrar patadas' },
    pt: { title: 'Movimentos do bebê', noData: 'Sem dados — registre os chutes', kicks: 'chutes', lastSession: 'Última sessão', goTrack: 'Registrar chutes' },
    tr: { title: 'Bebek Hareketleri', noData: 'Veri yok — bebek tekmelerini kaydet', kicks: 'tekme', lastSession: 'Son oturum', goTrack: 'Tekmeleri kaydet' },
  };
  const kl = kickLabels[lang] || kickLabels.en;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-xs font-semibold">{t("smartPlan.pregnancyWeek", "Pregnancy Week")}</Label>
        <WeekSlider week={health.week} onChange={(v) => onUpdate('week', v)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">{t("smartPlan.weight", "Weight (kg)")}</Label>
          <Input type="number" value={health.weight} onChange={e => onUpdate('weight', +e.target.value)} className="h-8 text-xs" />
        </div>
        <div>
          <Label className="text-xs">{t("smartPlan.height", "Height (cm)")}</Label>
          <Input type="number" value={health.height} onChange={e => onUpdate('height', +e.target.value)} className="h-8 text-xs" />
        </div>
      </div>

      {/* Baby Kick Stats — linked from Kick Counter */}
      <div className="rounded-xl border border-primary/15 bg-primary/[0.03] p-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Baby className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-foreground">{kl.title}</p>
            {kickStats.totalKicks > 0 ? (
              <p className="text-[10px] text-muted-foreground">
                {kickStats.totalKicks} {kl.kicks} · {kl.lastSession}
              </p>
            ) : (
              <p className="text-[10px] text-muted-foreground">{kl.noData}</p>
            )}
          </div>
          <Link
            to="/tools/kick-counter"
            className="text-[9px] font-bold text-primary px-2 py-1 rounded-md bg-primary/10 hover:bg-primary/15 transition-colors shrink-0"
          >
            {kl.goTrack}
          </Link>
        </div>
      </div>

      <button onClick={() => setShowMore(!showMore)} className="text-xs text-primary flex items-center gap-1">
        {showMore ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {t("smartPlan.moreOptions", "More details")}
      </button>

      {showMore && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">{t("smartPlan.age", "Age")}</Label>
              <Input type="number" value={health.age} onChange={e => onUpdate('age', +e.target.value)} className="h-8 text-xs" />
            </div>
            <div>
              <Label className="text-xs">{t("smartPlan.sleepHours", "Sleep (hrs)")}</Label>
              <Input type="number" value={health.sleepHours} onChange={e => onUpdate('sleepHours', +e.target.value)} className="h-8 text-xs" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">{t("smartPlan.systolic", "Systolic")}</Label>
              <Input type="number" value={health.bloodPressureSys} onChange={e => onUpdate('bloodPressureSys', +e.target.value)} className="h-8 text-xs" />
            </div>
            <div>
              <Label className="text-xs">{t("smartPlan.diastolic", "Diastolic")}</Label>
              <Input type="number" value={health.bloodPressureDia} onChange={e => onUpdate('bloodPressureDia', +e.target.value)} className="h-8 text-xs" />
            </div>
          </div>

          <div>
            <Label className="text-xs">{t("smartPlan.mood", "Mood")}</Label>
            <Select value={health.mood} onValueChange={v => onUpdate('mood', v)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {moodOptions.map(o => <SelectItem key={o.value} value={o.value}>{getLabel(o)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">{t("smartPlan.activityLevel", "Activity Level")}</Label>
            <Select value={health.activityLevel} onValueChange={v => onUpdate('activityLevel', v)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {activityOptions.map(o => <SelectItem key={o.value} value={o.value}>{getLabel(o)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs mb-1 block">{t("smartPlan.conditions", "Health Conditions")}</Label>
            <div className="grid grid-cols-1 gap-1.5">
              {conditionOptions.map(c => (
                <label key={c.key} className="flex items-center gap-2 text-xs">
                  <Checkbox
                    checked={health.conditions.includes(c.key)}
                    onCheckedChange={checked => {
                      onUpdate('conditions', checked
                        ? [...health.conditions, c.key]
                        : health.conditions.filter((k: string) => k !== c.key)
                      );
                    }}
                  />
                  {getLabel(c)}
                </label>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
