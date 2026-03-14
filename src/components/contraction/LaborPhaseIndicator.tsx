import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Baby, AlertTriangle, Heart, Zap } from "lucide-react";

interface LaborPhaseProps {
  avgDuration: number; // seconds
  avgInterval: number; // seconds
  count: number;
}

type Phase = "none" | "early" | "active" | "transition";

export function LaborPhaseIndicator({ avgDuration, avgInterval, count }: LaborPhaseProps) {
  const { t } = useTranslation();

  const phase: Phase = useMemo(() => {
    if (count < 3) return "none";
    // Transition: contractions every 2-3 min, lasting 60-90s
    if (avgInterval <= 180 && avgDuration >= 60) return "transition";
    // Active: every 3-5 min, lasting 45-60s
    if (avgInterval <= 300 && avgDuration >= 45) return "active";
    // Early: every 5-30 min, lasting 30-45s
    if (avgInterval <= 1800 && avgDuration >= 20) return "early";
    return "none";
  }, [avgDuration, avgInterval, count]);

  if (phase === "none") return null;

  const phaseConfig = {
    early: {
      label: t("toolsInternal.contractionTimer.phaseEarly", "المرحلة المبكرة"),
      desc: t("toolsInternal.contractionTimer.phaseEarlyDesc", "الانقباضات خفيفة ومتباعدة. ابقي مرتاحة في المنزل وراقبي التطور."),
      icon: Heart,
      color: "text-amber-500",
      bg: "bg-amber-500/10 border-amber-500/20",
      progress: 33,
      barColor: "bg-amber-500",
    },
    active: {
      label: t("toolsInternal.contractionTimer.phaseActive", "المرحلة النشطة"),
      desc: t("toolsInternal.contractionTimer.phaseActiveDesc", "الانقباضات منتظمة وأقوى. استعدي للذهاب إلى المستشفى."),
      icon: Zap,
      color: "text-orange-500",
      bg: "bg-orange-500/10 border-orange-500/20",
      progress: 66,
      barColor: "bg-orange-500",
    },
    transition: {
      label: t("toolsInternal.contractionTimer.phaseTransition", "مرحلة الانتقال"),
      desc: t("toolsInternal.contractionTimer.phaseTransitionDesc", "الانقباضات قوية ومتقاربة جداً. توجهي إلى المستشفى فوراً!"),
      icon: AlertTriangle,
      color: "text-destructive",
      bg: "bg-destructive/10 border-destructive/20",
      progress: 100,
      barColor: "bg-destructive",
    },
  };

  const config = phaseConfig[phase];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-3.5 rounded-xl border ${config.bg}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4.5 h-4.5 ${config.color}`} />
        <span className={`text-xs font-bold ${config.color}`}>{config.label}</span>
      </div>

      {/* Progress bar showing labor phase */}
      <div className="w-full h-1.5 bg-muted rounded-full mb-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${config.progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${config.barColor}`}
        />
      </div>

      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[9px] text-muted-foreground">
          {t("toolsInternal.contractionTimer.phaseEarly", "مبكرة")}
        </span>
        <span className="text-[9px] text-muted-foreground">
          {t("toolsInternal.contractionTimer.phaseActive", "نشطة")}
        </span>
        <span className="text-[9px] text-muted-foreground">
          {t("toolsInternal.contractionTimer.phaseTransition", "انتقال")}
        </span>
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed">{config.desc}</p>
    </motion.div>
  );
}
