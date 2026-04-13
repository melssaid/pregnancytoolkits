import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { useUserProfile } from "@/hooks/useUserProfile";

interface Milestone {
  week: number;
  key: string;
  emoji: string;
}

const MILESTONES: Milestone[] = [
  { week: 6, key: "heartbeat", emoji: "💓" },
  { week: 12, key: "firstTrimesterEnd", emoji: "🎉" },
  { week: 16, key: "feelMovement", emoji: "🤰" },
  { week: 20, key: "halfwayThere", emoji: "🎯" },
  { week: 24, key: "viability", emoji: "⭐" },
  { week: 28, key: "thirdTrimester", emoji: "🏃‍♀️" },
  { week: 32, key: "babyPosition", emoji: "👶" },
  { week: 36, key: "fullTerm", emoji: "🎁" },
  { week: 40, key: "dueDate", emoji: "🍼" },
];

export function MilestonesTimeline() {
  const { t } = useTranslation();
  const { profile } = useUserProfile();
  const currentWeek = profile.pregnancyWeek;

  // Show only nearby milestones (2 past + 3 future)
  const currentIdx = MILESTONES.findIndex(m => m.week > currentWeek);
  const startIdx = Math.max(0, (currentIdx === -1 ? MILESTONES.length : currentIdx) - 2);
  const visible = MILESTONES.slice(startIdx, startIdx + 5);

  return (
    <Card className="p-4 bg-card border-border/50">
      <h3 className="text-sm font-extrabold text-foreground mb-3">{t("milestones.title")}</h3>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute start-[11px] top-1 bottom-1 w-0.5 bg-border/40" />
        <div className="space-y-3">
          {visible.map((m, i) => {
            const passed = currentWeek >= m.week;
            return (
              <motion.div
                key={m.key}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 relative"
              >
                <div className="relative z-10">
                  {passed ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : (
                    <Circle className="w-6 h-6 text-muted-foreground/40" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold ${passed ? "text-foreground" : "text-muted-foreground"}`}>
                    {m.emoji} {t(`milestones.${m.key}`)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {t("milestones.week", { week: m.week })}
                    {currentWeek === m.week && ` — ${t("milestones.now")}!`}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
