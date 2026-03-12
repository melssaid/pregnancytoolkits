import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, Scale, Brain, Baby, Calendar, Heart } from "lucide-react";

interface QuickAction {
  icon: typeof Activity;
  labelKey: string;
  href: string;
  color: string;
  bg: string;
}

const actions: QuickAction[] = [
  { icon: Brain,    labelKey: "quickActions.assistant", href: "/tools/pregnancy-assistant", color: "text-[hsl(340,60%,52%)]", bg: "bg-[hsl(340,50%,95%)]  dark:bg-[hsl(340,35%,15%)]" },
  { icon: Activity, labelKey: "quickActions.kicks",     href: "/tools/kick-counter",        color: "text-[hsl(350,55%,55%)]", bg: "bg-[hsl(350,45%,95%)] dark:bg-[hsl(350,30%,15%)]" },
  { icon: Scale,    labelKey: "quickActions.weight",    href: "/tools/weight-gain",         color: "text-[hsl(15,60%,52%)]",  bg: "bg-[hsl(15,50%,95%)] dark:bg-[hsl(15,35%,15%)]" },
  { icon: Baby,     labelKey: "quickActions.growth",    href: "/tools/baby-growth",         color: "text-[hsl(280,40%,55%)]", bg: "bg-[hsl(280,30%,95%)] dark:bg-[hsl(280,20%,15%)]" },
  { icon: Calendar, labelKey: "quickActions.dueDate",   href: "/tools/due-date",            color: "text-[hsl(160,40%,45%)]", bg: "bg-[hsl(160,30%,94%)] dark:bg-[hsl(160,20%,15%)]" },
  { icon: Heart,    labelKey: "quickActions.symptoms",  href: "/tools/symptom-analyzer",    color: "text-[hsl(0,55%,55%)]",   bg: "bg-[hsl(0,40%,95%)] dark:bg-[hsl(0,30%,15%)]" },
];

const fallbackLabels: Record<string, Record<string, string>> = {
  "quickActions.assistant": { ar: "المساعد", en: "Assistant" },
  "quickActions.kicks":     { ar: "الركلات", en: "Kicks" },
  "quickActions.weight":    { ar: "الوزن", en: "Weight" },
  "quickActions.growth":    { ar: "النمو", en: "Growth" },
  "quickActions.dueDate":   { ar: "الموعد", en: "Due Date" },
  "quickActions.symptoms":  { ar: "الأعراض", en: "Symptoms" },
};

const QuickActions = memo(function QuickActions() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split("-")[0] || "en";

  const getLabel = (key: string) => {
    const translated = t(key);
    if (translated !== key) return translated;
    return fallbackLabels[key]?.[lang] || fallbackLabels[key]?.en || key;
  };

  return (
    <div className="overflow-x-auto scrollbar-hide -mx-3 px-3">
      <div className="flex gap-3 min-w-max pb-1">
        {actions.map((action, i) => (
          <motion.div
            key={action.labelKey}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <Link
              to={action.href}
              className="flex flex-col items-center gap-1.5 group w-[60px]"
            >
              <div className={`w-12 h-12 rounded-2xl ${action.bg} flex items-center justify-center border border-border/10 shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-200`}>
                <action.icon className={`w-5 h-5 ${action.color}`} strokeWidth={1.8} />
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground text-center leading-tight line-clamp-1" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                {getLabel(action.labelKey)}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
});

export default QuickActions;
