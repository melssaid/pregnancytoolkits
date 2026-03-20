import { memo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { Bot, Hand, Scale, TrendingUp, Calendar, Stethoscope, Camera, Pill, Lock } from "lucide-react";
import { useSubscriptionStatus, isToolPremium } from "@/hooks/useSubscriptionStatus";

const actions = [
  { id: "pregnancy-assistant", icon: Bot,          href: "/tools/pregnancy-assistant",  labelKey: "assistant" },
  { id: "kick-counter",        icon: Hand,         href: "/tools/kick-counter",         labelKey: "kicks" },
  { id: "weight-gain",         icon: Scale,        href: "/tools/weight-gain",          labelKey: "weight" },
  { id: "fetal-growth",        icon: TrendingUp,   href: "/tools/fetal-growth",         labelKey: "growth" },
  { id: "smart-appointment",   icon: Calendar,     href: "/tools/smart-appointment-reminder", labelKey: "appointment" },
  { id: "ai-symptom-analyzer", icon: Stethoscope,  href: "/tools/wellness-diary",       labelKey: "symptoms" },
  { id: "vitamin-tracker",     icon: Pill,         href: "/tools/vitamin-tracker",      labelKey: "vitamins" },
  { id: "ai-bump-photos",      icon: Camera,       href: "/tools/ai-bump-photos",       labelKey: "photos" },
];

export const QuickActionsBar = memo(function QuickActionsBar() {
  const { t } = useTranslation();
  const { tier } = useSubscriptionStatus();
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
    >
      <h3 className="text-xs font-bold text-foreground mb-2">{t("dailyDashboard.quickActions.title")}</h3>
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
        {actions.map((action, i) => {
          const locked = isToolPremium(action.id, tier);
          return (
            <Link
              key={action.id}
              to={locked ? "#" : action.href}
              onClick={locked ? (e) => { e.preventDefault(); navigate("/pricing-demo"); } : undefined}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.02 * i }}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl min-w-[60px] transition-colors ${
                  locked ? "opacity-50 grayscale bg-muted/30" : "bg-muted/30 hover:bg-primary/10"
                }`}
              >
                <div className="relative w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <action.icon className="w-4 h-4 text-primary" strokeWidth={1.75} />
                  {locked && <Lock className="w-2.5 h-2.5 text-muted-foreground absolute -top-1 -end-1" />}
                </div>
                <span className="text-[9px] font-medium text-foreground text-center leading-tight whitespace-nowrap">
                  {t(`dailyDashboard.quickActions.${action.labelKey}`)}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
});
