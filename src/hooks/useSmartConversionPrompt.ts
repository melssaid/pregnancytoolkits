/**
 * useSmartConversionPrompt
 * Shows a toast when a free/monthly user reaches 80% of their AI quota.
 * Only fires once per session.
 */
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAIUsage } from "@/contexts/AIUsageContext";
import { Crown } from "lucide-react";
import { createElement } from "react";

export function useSmartConversionPrompt() {
  const { t } = useTranslation();
  const { used, limit, tier } = useAIUsage();
  const hasFired = useRef(false);

  useEffect(() => {
    // Only for free tier, not premium
    if (tier === "premium") return;
    if (hasFired.current) return;
    if (limit <= 0) return;

    const percentage = used / limit;
    if (percentage >= 0.8) {
      hasFired.current = true;
      toast(
        t("smartPrompt.nearLimit", {
          used,
          limit,
          defaultValue: `You've used ${used} of ${limit} analyses! Subscribe for 60/month.`,
        }),
        {
          duration: 8000,
          icon: createElement(Crown, { className: "w-4 h-4 text-primary" }),
          action: {
            label: t("smartPrompt.upgradeNow", "Upgrade Now"),
            onClick: () => {
              window.location.href = "/pricing-demo";
            },
          },
        }
      );
    }
  }, [used, limit, tier, t]);
}
