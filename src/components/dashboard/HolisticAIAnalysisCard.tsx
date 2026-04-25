import { memo, useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Crown, Loader2, ChevronDown, ChevronUp, Bookmark, BookmarkCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { AIErrorBanner } from "@/components/ai/AIErrorBanner";
import { UsagePulseFooter } from "@/components/ai/UsagePulseFooter";
import { MiniUsageBar } from "@/components/ai/MiniUsageBar";
import { useSmartInsight } from "@/hooks/useSmartInsight";
import { useAIUsage } from "@/contexts/AIUsageContext";
import { useHolisticDashboardSnapshot } from "@/hooks/useHolisticDashboardSnapshot";
import { HolisticTimelineChart } from "@/components/dashboard/HolisticTimelineChart";
import { useSavedResults } from "@/hooks/useSavedResults";

/**
 * Premium "Holistic AI Analysis" card — synthesises ALL tracked dashboard
 * data into one executive wellness brief via the Pro model. Cost: 7 points.
 */
export const HolisticAIAnalysisCard = memo(function HolisticAIAnalysisCard() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split("-")[0] || "en";
  const { snapshot, derivedInsights, contextSummary, dataRichness, hasMinimumData, sourcesCount } =
    useHolisticDashboardSnapshot();
  const { isLimitReached } = useAIUsage();

  const { generate, isLoading, content, error, errorType, clearError } = useSmartInsight({
    section: "pregnancy-plan",
    toolType: "holistic-dashboard",
  });
  const { save, isSaved, unsaveByContent } = useSavedResults("holistic-dashboard");

  const [hasGenerated, setHasGenerated] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [pulseKey, setPulseKey] = useState(0);
  const prevContentRef = useRef<string | null>(null);

  useEffect(() => {
    if (content && !isLoading && prevContentRef.current !== content) {
      prevContentRef.current = content;
      setPulseKey((k) => k + 1);
    }
    if (!content) prevContentRef.current = null;
  }, [content, isLoading]);

  const handleGenerate = async () => {
    if (isLoading || isLimitReached || !hasMinimumData) return;
    clearError();
    setHasGenerated(true);
    setIsExpanded(true);
    const prompt =
      `Below is a pre-computed holistic wellness brief of my dashboard tracking data. ` +
      `It already includes derived trends, averages, risk flags, and positive signals — ` +
      `please ANALYSE and synthesise it (do not just restate the numbers). ` +
      `Connect related signals where meaningful.\n\n` +
      `${contextSummary}`;
    await generate({
      prompt,
      context: {
        language: lang,
        weekNumber: snapshot.profile.pregnancyWeek,
        riskFlagsCount: derivedInsights.riskFlags.length,
        positiveSignalsCount: derivedInsights.positiveSignals.length,
        engagementScore: derivedInsights.engagementScore,
      },
      skipCache: hasGenerated,
    });
  };

  return (
    <Card
      className="overflow-hidden border-0 relative"
      style={{
        background:
          "linear-gradient(135deg, hsl(340 60% 97%) 0%, hsl(320 50% 96%) 50%, hsl(280 50% 96%) 100%)",
        boxShadow:
          "0 8px 28px -10px hsl(330 50% 50% / 0.25), 0 2px 6px -2px hsl(280 40% 40% / 0.15), inset 0 1px 0 hsl(0 0% 100% / 0.6)",
        border: "1px solid hsl(45 70% 75% / 0.4)",
      }}
    >
      {/* Decorative shimmer */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 80% 0%, hsl(45 90% 80% / 0.4), transparent 50%), radial-gradient(circle at 0% 100%, hsl(280 70% 80% / 0.3), transparent 50%)",
        }}
      />

      <CardContent className="relative pt-4 pb-4 space-y-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div
            className="shrink-0 p-2.5 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary)), hsl(330 65% 50%), hsl(280 55% 50%))",
              boxShadow: "0 4px 14px -2px hsl(var(--primary) / 0.4)",
            }}
          >
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-bold text-[15px] text-foreground leading-tight">
                {t("dashboardV2.holistic.title")}
              </h3>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shrink-0"
                style={{
                  background: "linear-gradient(135deg, hsl(45 90% 50%), hsl(35 90% 50%))",
                  boxShadow: "0 2px 6px -1px hsl(35 80% 45% / 0.4)",
                }}
              >
                <Crown className="w-2.5 h-2.5" />
                {t("dashboardV2.holistic.cost")}
              </span>
            </div>
            <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug">
              {t("dashboardV2.holistic.subtitle")}
            </p>
          </div>
        </div>

        {/* Data richness bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground font-medium">
              {t("dashboardV2.holistic.dataRichness", { value: dataRichness })}
            </span>
            <span className="text-foreground/60 tabular-nums font-semibold">{sourcesCount}/10</span>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: "hsl(0 0% 0% / 0.06)" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, hsl(var(--primary)), hsl(330 65% 55%), hsl(280 60% 55%))",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${dataRichness}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Min data warning */}
        {!hasMinimumData && (
          <p className="text-[12px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-lg px-3 py-2 leading-relaxed">
            {t("dashboardV2.holistic.minDataNeeded")}
          </p>
        )}

        {/* Preview chip — shows derived insights count BEFORE consuming points */}
        {hasMinimumData && !hasGenerated && (derivedInsights.positiveSignals.length > 0 || derivedInsights.riskFlags.length > 0) && (
          <div className="flex items-center justify-center gap-2 text-[11px] text-foreground/70 bg-white/40 rounded-lg px-2.5 py-1.5">
            {derivedInsights.positiveSignals.length > 0 && (
              <span className="flex items-center gap-1 font-medium">
                <span className="text-emerald-600">●</span>
                {t("dashboardV2.holistic.preview.positive", { count: derivedInsights.positiveSignals.length })}
              </span>
            )}
            {derivedInsights.positiveSignals.length > 0 && derivedInsights.riskFlags.length > 0 && (
              <span className="text-foreground/30">•</span>
            )}
            {derivedInsights.riskFlags.length > 0 && (
              <span className="flex items-center gap-1 font-medium">
                <span className="text-amber-600">●</span>
                {t("dashboardV2.holistic.preview.watchouts", { count: derivedInsights.riskFlags.length })}
              </span>
            )}
          </div>
        )}

        {/* CTA */}
        {!hasGenerated && (
          <motion.button
            onClick={handleGenerate}
            disabled={isLoading || !hasMinimumData || isLimitReached}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.01 }}
            className="w-full relative overflow-hidden rounded-xl disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div
              className="w-full flex items-center justify-center gap-2 px-5 h-[52px] font-semibold text-white text-[14px] rounded-xl"
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(330 65% 50%) 50%, hsl(280 55% 50%) 100%)",
                boxShadow:
                  "0 4px 18px -2px hsl(var(--primary) / 0.45), 0 1px 4px hsl(280 50% 40% / 0.25)",
              }}
            >
              {isLoading ? (
                <Loader2 className="w-[18px] h-[18px] animate-spin shrink-0" />
              ) : (
                <Sparkles className="w-[18px] h-[18px] shrink-0" />
              )}
              <span className="leading-tight">{t("dashboardV2.holistic.cta")}</span>
            </div>
            <span
              className="absolute inset-0 -translate-x-full group-hover:translate-x-full rtl:translate-x-full rtl:group-hover:-translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
              aria-hidden
            />
          </motion.button>
        )}

        <MiniUsageBar toolType="holistic-dashboard" section="pregnancy-plan" />

        {/* Error */}
        {error && (
          <AIErrorBanner
            errorType={errorType}
            message={error}
            onRetry={() => {
              setHasGenerated(false);
              handleGenerate();
            }}
            onDismiss={clearError}
          />
        )}

        {/* Result */}
        <AnimatePresence>
          {hasGenerated && (content || isLoading) && !error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="overflow-hidden"
            >
              <div className="pt-3 mt-1 border-t border-primary/15 space-y-3">
                {/* Compact 7/30-day timeline (weight, mood, hydration, symptoms) */}
                <HolisticTimelineChart />

                {content && (
                  <button
                    onClick={() => setIsExpanded((v) => !v)}
                    className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors mb-2"
                  >
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    <span>
                      {isExpanded
                        ? t("toolsInternal.aiInsights.clickToCollapse")
                        : t("toolsInternal.aiInsights.clickToExpand")}
                    </span>
                  </button>
                )}

                {isLoading && !content && (
                  <div className="flex items-center gap-2 text-primary py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">{t("toolsInternal.aiInsights.generatingInsights")}</span>
                  </div>
                )}

                {content && isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MarkdownRenderer content={content} />
                  </motion.div>
                )}

                {hasGenerated && !isLoading && content && (
                  <UsagePulseFooter
                    toolType="holistic-dashboard"
                    section="pregnancy-plan"
                    justConsumed={pulseKey > 0}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
});

export default HolisticAIAnalysisCard;
