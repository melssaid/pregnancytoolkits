import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface HubTab {
  path: string;
  labelKey: string;
  labelFallback: string;
}

interface ToolHubNavProps {
  tabs: HubTab[];
}

export function ToolHubNav({ tabs }: ToolHubNavProps) {
  const { t } = useTranslation();
  const location = useLocation();

  if (tabs.length < 2) return null;

  return (
    <div className="flex gap-1 p-1 rounded-xl bg-muted/50 border border-border/50 mb-4">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <Link
            key={tab.path}
            to={tab.path}
            replace
            className={cn(
              "flex-1 text-center py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
            )}
          >
            {t(tab.labelKey, tab.labelFallback)}
          </Link>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PRE-CONFIGURED HUB TABS
// ═══════════════════════════════════════════════════════════════

export const NUTRITION_HUB_TABS: HubTab[] = [
  { path: "/tools/ai-meal-suggestion", labelKey: "hubNav.meals", labelFallback: "Meals" },
  { path: "/tools/ai-craving-alternatives", labelKey: "hubNav.cravings", labelFallback: "Alternatives" },
  { path: "/tools/smart-grocery-list", labelKey: "hubNav.shopping", labelFallback: "Shopping" },
];

export const WELLNESS_HUB_TABS: HubTab[] = [
  { path: "/tools/wellness-diary", labelKey: "hubNav.diary", labelFallback: "Diary" },
  { path: "/tools/ai-fitness-coach", labelKey: "hubNav.exercises", labelFallback: "Exercises" },
  { path: "/tools/ai-back-pain-relief", labelKey: "hubNav.backPain", labelFallback: "Back Pain" },
];

export const FITNESS_HUB_TABS = WELLNESS_HUB_TABS;

export const BIRTH_HUB_TABS: HubTab[] = [
  { path: "/tools/ai-birth-plan", labelKey: "hubNav.birthPlan", labelFallback: "Birth Plan" },
  { path: "/tools/ai-birth-position", labelKey: "hubNav.positions", labelFallback: "Positions" },
];
