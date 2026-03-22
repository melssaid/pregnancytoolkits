/**
 * useSmartInsight — Bridge hook between UI components and the unified Smart Engine.
 * Provides streaming AI with built-in quota, caching, and section context.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAIUsage } from "@/contexts/AIUsageContext";
import {
  executeSmartRequest,
  getQuotaState,
  canAfford,
  type SmartSection,
  type SmartError,
  type SmartErrorType,
  type InsightWeight,
  type AIToolType,
} from "@/services/smartEngine";

export interface UseSmartInsightOptions {
  section: SmartSection;
  toolType?: AIToolType;
  weight?: InsightWeight;
}

export function useSmartInsight({ section, toolType, weight = 1 }: UseSmartInsightOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<SmartErrorType | null>(null);
  const [wasCached, setWasCached] = useState(false);
  const { i18n, t } = useTranslation();
  const { refresh: refreshUsage } = useAIUsage();
  const langRef = useRef(i18n.language);
  langRef.current = i18n.language;

  // Reset on language change
  const prevLangRef = useRef(i18n.language);
  useEffect(() => {
    const lang = i18n.language?.split("-")[0] || "en";
    const prev = prevLangRef.current?.split("-")[0] || "en";
    if (prev !== lang && content) {
      setContent("");
      setError(null);
      setErrorType(null);
    }
    prevLangRef.current = i18n.language;
  }, [i18n.language, content]);

  const quota = getQuotaState();

  const generate = useCallback(
    async ({
      prompt,
      context,
      skipCache,
      onDelta,
    }: {
      prompt: string;
      context?: Record<string, unknown>;
      skipCache?: boolean;
      onDelta?: (chunk: string) => void;
    }) => {
      setIsLoading(true);
      setError(null);
      setErrorType(null);
      setContent("");
      setWasCached(false);

      const lang = langRef.current?.split("-")[0] || "en";

      await executeSmartRequest({
        request: {
          section,
          toolType,
          weight,
          messages: [{ role: "user", content: prompt }],
          context: { ...context, language: lang },
        },
        onDelta: (chunk) => {
          setContent((prev) => prev + chunk);
          onDelta?.(chunk);
        },
        onDone: (response) => {
          setIsLoading(false);
          setWasCached(response.cached);
          refreshUsage(); // Sync AIUsageContext after quota consumed by engine
        },
        onError: (err: SmartError) => {
          setIsLoading(false);
          setErrorType(err.type);
          if (err.type === "quota_exhausted") {
            setError(t("aiErrors.monthlyLimitMsg", { limit: quota.limit, remaining: 0 }));
          } else if (err.type === "rate_limit") {
            setError(t("aiErrors.rateLimitMsg"));
          } else if (err.type === "payment") {
            setError(t("aiErrors.paymentMsg"));
          } else {
            setError(t("aiErrors.unknownMsg"));
          }
        },
        skipCache,
      });
    },
    [section, toolType, weight, t, quota.limit]
  );

  const clearError = useCallback(() => {
    setError(null);
    setErrorType(null);
  }, []);

  const reset = useCallback(() => {
    setContent("");
    setError(null);
    setErrorType(null);
    setWasCached(false);
  }, []);

  return {
    generate,
    isLoading,
    content,
    error,
    errorType,
    clearError,
    reset,
    wasCached,
    canAfford: canAfford(weight),
    quota,
  };
}
