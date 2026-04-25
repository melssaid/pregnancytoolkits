import { useTranslation } from "react-i18next";
import { Radar, Database, Clock, FileText, Apple, RotateCcw, Check } from "lucide-react";
import { motion } from "framer-motion";
import {
  useSonarSettings,
  type SonarScope,
  type SonarTimelineWindow,
} from "@/lib/sonarSettings";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  compact?: boolean;
}

export function SonarIntegrationSettings({ compact }: Props) {
  const { t } = useTranslation();
  const { settings, update, reset } = useSonarSettings();

  const scopes: { id: SonarScope; label: string; desc: string }[] = [
    {
      id: "snapshot",
      label: t("settings.sonar.scope.snapshot.label"),
      desc: t("settings.sonar.scope.snapshot.desc"),
    },
    {
      id: "timeline",
      label: t("settings.sonar.scope.timeline.label"),
      desc: t("settings.sonar.scope.timeline.desc"),
    },
    {
      id: "both",
      label: t("settings.sonar.scope.both.label"),
      desc: t("settings.sonar.scope.both.desc"),
    },
  ];

  const windows: SonarTimelineWindow[] = [7, 30];

  const toggles = [
    {
      key: "includeSavedReport" as const,
      icon: FileText,
      label: t("settings.sonar.toggles.savedReport.label"),
      desc: t("settings.sonar.toggles.savedReport.desc"),
      iconColor: "text-violet-500",
      iconBg: "bg-violet-500/10",
    },
    {
      key: "includeNutritionCard" as const,
      icon: Apple,
      label: t("settings.sonar.toggles.nutrition.label"),
      desc: t("settings.sonar.toggles.nutrition.desc"),
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-500/10",
    },
  ];

  return (
    <div className={cn("space-y-5", compact && "space-y-4") }>
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/15 to-purple-500/15 flex items-center justify-center flex-shrink-0">
          <Radar className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-foreground leading-tight">
            {t("settings.sonar.title")}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
            {t("settings.sonar.subtitle")}
          </p>
        </div>
      </div>

      {/* Scope */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-1">
          <Database className="w-3.5 h-3.5 text-muted-foreground" />
          <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            {t("settings.sonar.scope.title")}
          </h4>
        </div>
        <div className="space-y-1.5">
          {scopes.map((s) => {
            const active = settings.scope === s.id;
            return (
              <motion.button
                key={s.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => update({ scope: s.id })}
                className={cn(
                  "w-full text-start rounded-2xl border px-3.5 py-3 transition-all flex items-start gap-3",
                  active
                    ? "border-primary/40 bg-primary/5"
                    : "border-border bg-card hover:bg-muted/40",
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                    active ? "border-primary bg-primary" : "border-border",
                  )}
                >
                  {active && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[13px] font-semibold text-foreground leading-tight">
                      {s.label}
                    </span>
                    {s.id === "both" && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-bold uppercase tracking-wider">
                        {t("settings.sonar.recommended")}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{s.desc}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Timeline window */}
      {(settings.scope === "timeline" || settings.scope === "both") && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              {t("settings.sonar.window.title")}
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {windows.map((w) => {
              const active = settings.timelineWindow === w;
              return (
                <motion.button
                  key={w}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => update({ timelineWindow: w })}
                  className={cn(
                    "rounded-xl border py-2.5 px-3 text-center transition-all",
                    active
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-card text-foreground hover:bg-muted/40",
                  )}
                >
                  <div className="text-base font-bold tabular-nums">{w}</div>
                  <div className="text-[10px] uppercase tracking-wider opacity-70">
                    {t("settings.sonar.window.days")}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Optional sources */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-1">
          <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            {t("settings.sonar.extras.title")}
          </h4>
        </div>
        <div className="rounded-2xl border bg-card overflow-hidden divide-y divide-border/40">
          {toggles.map((tg) => {
            const Icon = tg.icon;
            const active = settings[tg.key];
            return (
              <button
                key={tg.key}
                onClick={() => update({ [tg.key]: !active } as any)}
                className="w-full flex items-center gap-3 px-3.5 py-3 hover:bg-muted/40 transition-colors text-start"
              >
                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0", tg.iconBg)}>
                  <Icon className={cn("w-4 h-4", tg.iconColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] font-semibold text-foreground block leading-tight">{tg.label}</span>
                  <span className="text-[10px] text-muted-foreground line-clamp-2 leading-snug">{tg.desc}</span>
                </div>
                <div
                  className={cn(
                    "w-10 h-6 rounded-full relative transition-colors flex-shrink-0",
                    active ? "bg-primary" : "bg-muted",
                  )}
                >
                  <motion.div
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow"
                    animate={{ left: active ? 18 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={() => {
          reset();
          toast.success(t("settings.sonar.resetSuccess"));
        }}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted/60 text-muted-foreground text-[12px] font-semibold hover:bg-muted transition-colors active:scale-[0.98]"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        {t("settings.sonar.reset")}
      </button>

      <p className="text-[10px] text-muted-foreground/70 text-center leading-relaxed px-2">
        {t("settings.sonar.footer")}
      </p>
    </div>
  );
}

export default SonarIntegrationSettings;
