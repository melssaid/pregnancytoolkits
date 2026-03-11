import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Brain, Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { useAIUsage } from "@/contexts/AIUsageContext";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { toolTopicMap, genericTopics } from "@/data/toolTipTopics";
import { AIErrorBanner } from "@/components/ai/AIErrorBanner";

interface ToolInsightTabsProps {
  toolId: string;
}

// Short cache so each visit feels fresh
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function getCacheKey(toolId: string) {
  return `insight_${toolId}_${Date.now().toString(36).slice(0, -3)}`; // rotates ~every 30 min
}

function getStoredKey(toolId: string) {
  return `insight_active_${toolId}`;
}

function getCached(toolId: string): string | null {
  try {
    const metaKey = getStoredKey(toolId);
    const raw = localStorage.getItem(metaKey);
    if (!raw) return null;
    const { content, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) {
      localStorage.removeItem(metaKey);
      return null;
    }
    return content;
  } catch {
    return null;
  }
}

function setCache(toolId: string, content: string) {
  try {
    localStorage.setItem(getStoredKey(toolId), JSON.stringify({ content, ts: Date.now() }));
  } catch { /* quota exceeded */ }
}

function clearCache(toolId: string) {
  localStorage.removeItem(getStoredKey(toolId));
}

export function ToolInsightTabs({ toolId }: ToolInsightTabsProps) {
  const { t, i18n } = useTranslation();
  const { streamChat, isLoading, error, errorType, clearError } = usePregnancyAI();

  const [tipContent, setTipContent] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const lang = i18n.language?.split("-")[0] || "en";

  // Only show once user scrolls to this section
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
    const cached = getCached(toolId);
    if (cached) {
      setTipContent(cached);
      setLoaded(true);
      return;
    }

    setTipContent("");

    const toolTitle = t(`toolBenefits.${toolId}`, toolId);
    const seed = Math.floor(Math.random() * 10000);

    // Gather browsing context for variety
    const recentTools: string[] = [];
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('insight_active_'));
      keys.forEach(k => {
        const id = k.replace('insight_active_', '');
        if (id !== toolId) recentTools.push(id);
      });
    } catch { /* ignore */ }

    const browsingContext = recentTools.length > 0
      ? `The user has also recently used these tools: ${recentTools.slice(0, 5).join(', ')}.`
      : '';

    const toolTopics = toolTopicMap[toolId] || genericTopics;
    const randomTopic = toolTopics[seed % toolTopics.length];

    const prompt = `You are a warm, professional wellness writer addressing a pregnant woman directly (use feminine form in Arabic and gendered languages).

The user is currently viewing the tool: "${toolId}" (${toolTitle}).
${browsingContext}

Write ONE short tip (2-3 sentences max). Focus on: ${randomTopic}.
- The tip MUST be directly relevant to the tool's specific domain — not generic pregnancy advice
- Address the reader as a woman/mother-to-be (feminine pronouns and verbs)
- Be concise, practical, and encouraging
- Do NOT mention pregnancy week numbers
- Include one surprising or lesser-known fact
- Random seed: ${seed}

Write in ${lang}. No title, no heading, just the tip.`;

    let full = "";
    await streamChat({
      type: "pregnancy-assistant",
      messages: [{ role: "user", content: prompt }],
      context: { language: lang },
      onDelta: (chunk) => {
        full += chunk;
        setTipContent((prev) => prev + chunk);
      },
      onDone: () => {
        if (full) {
          setCache(toolId, full);
          setLoaded(true);
        }
      },
    });
  }, [toolId, lang, t, streamChat]);

  useEffect(() => {
    if (isVisible && !loaded && !isLoading) {
      generateTip();
    }
  }, [isVisible, loaded, isLoading, generateTip]);

  const handleRefresh = () => {
    clearCache(toolId);
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
                  <Brain className="w-4 h-4 animate-spin" />
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
