import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
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

function getCacheKey(toolId: string, week: number) {
  const day = new Date().toISOString().split("T")[0];
  return `insight_${toolId}_tip_w${week}_${day}`;
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

  const [tipContent, setTipContent] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const week = profile.pregnancyWeek;
  const lang = i18n.language?.split("-")[0] || "en";

  // Only show once user scrolls to this section (IntersectionObserver)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const generateTip = useCallback(async () => {
    const cacheKey = getCacheKey(toolId, week);
    const cached = getCached(cacheKey);
    if (cached) {
      setTipContent(cached);
      setLoaded(true);
      return;
    }

    setTipContent("");
    const toolName = t(`tools.${toolId?.replace(/-/g, "")?.replace(/\b\w/g, (c: string) => c)}?.title`, toolId);

    const prompt = `You are a warm pregnancy wellness companion. The user is in week ${week} of pregnancy, using the "${toolName}" tool.
Write a short personalized daily article (4-6 sentences) that includes:
- One practical tip related to this tool's purpose (movement, nutrition, sleep, tracking, etc.)
- A brief encouraging observation about week ${week}
- One gentle actionable suggestion for today

Keep it warm, positive, non-medical, and conversational. Write in ${lang}.`;

    let full = "";
    await streamChat({
      type: "pregnancy-assistant",
      messages: [{ role: "user", content: prompt }],
      context: { week, language: lang },
      onDelta: (chunk) => {
        full += chunk;
        setTipContent((prev) => prev + chunk);
      },
      onDone: () => {
        if (full) {
          setCache(getCacheKey(toolId, week), full);
          setLoaded(true);
        }
      },
    });
  }, [toolId, week, lang, t, streamChat]);

  // Only generate when visible and not already loaded
  useEffect(() => {
    if (isVisible && !loaded && !isLoading) {
      generateTip();
    }
  }, [isVisible, loaded, isLoading, generateTip]);

  const handleRefresh = () => {
    localStorage.removeItem(getCacheKey(toolId, week));
    setLoaded(false);
    setTipContent("");
    generateTip();
  };

  return (
    <div ref={containerRef}>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4"
        >
          <Card className="border-border/40 bg-gradient-to-br from-background to-muted/30 overflow-hidden">
            <div className="px-4 pt-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-foreground">{t("insightTabs.dailyTip")}</span>
              </div>
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
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

export default ToolInsightTabs;
