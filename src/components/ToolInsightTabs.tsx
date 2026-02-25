import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ShieldCheck, Loader2, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { useUserProfile } from "@/hooks/useUserProfile";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { AIErrorBanner } from "@/components/ai/AIErrorBanner";

interface ToolInsightTabsProps {
  toolId: string;
}

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

function getCacheKey(toolId: string, tab: string, week: number) {
  const day = new Date().toISOString().split("T")[0];
  return `insight_${toolId}_${tab}_w${week}_${day}`;
}

function getCached(key: string): string | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { content, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return content;
  } catch {
    return null;
  }
}

function setCache(key: string, content: string) {
  try {
    localStorage.setItem(key, JSON.stringify({ content, ts: Date.now() }));
  } catch { /* quota exceeded */ }
}

export function ToolInsightTabs({ toolId }: ToolInsightTabsProps) {
  const { t, i18n } = useTranslation();
  const { profile } = useUserProfile();
  const { streamChat, isLoading, error, errorType, clearError } = usePregnancyAI();

  const [activeTab, setActiveTab] = useState("daily-tip");
  const [tipContent, setTipContent] = useState("");
  const [reassuranceContent, setReassuranceContent] = useState("");
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set());

  const week = profile.pregnancyWeek;
  const lang = i18n.language?.split("-")[0] || "en";

  const generateTabContent = useCallback(
    async (tab: string) => {
      const cacheKey = getCacheKey(toolId, tab, week);
      const cached = getCached(cacheKey);
      if (cached) {
        if (tab === "daily-tip") setTipContent(cached);
        else setReassuranceContent(cached);
        setLoadedTabs((prev) => new Set(prev).add(tab));
        return;
      }

      const setter = tab === "daily-tip" ? setTipContent : setReassuranceContent;
      setter("");

      const toolName = t(`tools.${toolId?.replace(/-/g, "")?.replace(/\b\w/g, (c: string) => c)}?.title`, toolId);

      const prompt =
        tab === "daily-tip"
          ? `You are a warm pregnancy wellness companion. The user is in week ${week} of pregnancy, using the "${toolName}" tool.
Write a short personalized daily article (4-6 sentences) that includes:
- One practical tip related to this tool's purpose (movement, nutrition, sleep, tracking, etc.)
- A brief encouraging observation about week ${week}
- One gentle actionable suggestion for today

Keep it warm, positive, non-medical, and conversational. Write in ${lang}.`
          : `You are a reassuring pregnancy companion. The user is in week ${week} of pregnancy, using the "${toolName}" tool.
Write a short reassurance article (5-7 sentences) that includes:
- One common myth or worry related to this tool's topic and debunk it gently
- One reassuring statistic or fact (e.g., "90% of pregnancies progress normally")
- A daily changing positive affirmation for week ${week}

Be gentle, warm, never scary. Avoid medical directives. Write in ${lang}.`;

      let full = "";
      await streamChat({
        type: "pregnancy-assistant",
        messages: [{ role: "user", content: prompt }],
        context: { week, language: lang },
        onDelta: (chunk) => {
          full += chunk;
          setter((prev) => prev + chunk);
        },
        onDone: () => {
          if (full) {
            setCache(cacheKey, full);
            setLoadedTabs((prev) => new Set(prev).add(tab));
          }
        },
      });
    },
    [toolId, week, lang, t, streamChat]
  );

  // Load active tab content
  useEffect(() => {
    if (!loadedTabs.has(activeTab) && !isLoading) {
      generateTabContent(activeTab);
    }
  }, [activeTab, loadedTabs, isLoading, generateTabContent]);

  const handleRefresh = () => {
    const cacheKey = getCacheKey(toolId, activeTab, week);
    localStorage.removeItem(cacheKey);
    setLoadedTabs((prev) => {
      const next = new Set(prev);
      next.delete(activeTab);
      return next;
    });
    if (activeTab === "daily-tip") setTipContent("");
    else setReassuranceContent("");
    generateTabContent(activeTab);
  };

  const currentContent = activeTab === "daily-tip" ? tipContent : reassuranceContent;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mt-4"
    >
      <Card className="border-border/40 bg-gradient-to-br from-background to-muted/30 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="px-4 pt-3 flex items-center justify-between">
            <TabsList className="grid grid-cols-2 w-full max-w-xs h-8">
              <TabsTrigger value="daily-tip" className="text-[11px] gap-1 data-[state=active]:bg-primary/10">
                <Sparkles className="w-3 h-3" />
                {t("insightTabs.dailyTip")}
              </TabsTrigger>
              <TabsTrigger value="reassurance" className="text-[11px] gap-1 data-[state=active]:bg-primary/10">
                <ShieldCheck className="w-3 h-3" />
                {t("insightTabs.reassurance")}
              </TabsTrigger>
            </TabsList>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          <CardContent className="px-4 pb-4 pt-2">
            {error && (
              <AIErrorBanner message={error} errorType={errorType} onRetry={handleRefresh} onDismiss={clearError} />
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value="daily-tip" className="mt-0">
                  {isLoading && !tipContent ? (
                    <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-xs">{t("insightTabs.loading")}</span>
                    </div>
                  ) : (
                    <div className="text-xs leading-relaxed">
                      <MarkdownRenderer content={tipContent} isLoading={isLoading} accentColor="primary" />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="reassurance" className="mt-0">
                  {isLoading && !reassuranceContent ? (
                    <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-xs">{t("insightTabs.loading")}</span>
                    </div>
                  ) : (
                    <div className="text-xs leading-relaxed">
                      <MarkdownRenderer content={reassuranceContent} isLoading={isLoading} accentColor="primary" />
                    </div>
                  )}
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Tabs>
      </Card>
    </motion.div>
  );
}

export default ToolInsightTabs;
