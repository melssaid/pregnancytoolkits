/**
 * useSmartInsight — Bridge hook between UI components and the unified Smart Engine.
 * Provides streaming AI with built-in quota, caching, and section context.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAIUsage } from "@/contexts/AIUsageContext";
import { safeParseLocalStorage, safeSaveToLocalStorage } from "@/lib/safeStorage";
import {
  executeSmartRequest,
  getQuotaState,
  canAfford,
  resolveWeight,
  type SmartSection,
  type SmartError,
  type SmartErrorType,
  type AIToolType,
} from "@/services/smartEngine";

const SAVED_KEY = "ai-saved-results";
const MAX_SAVED = 20;

interface SavedAIResult {
  id: string;
  toolId: string;
  title: string;
  content: string;
  savedAt: string;
  meta?: Record<string, any>;
}

function autoSaveResult(toolId: string, title: string, content: string, meta?: Record<string, any>) {
  const trimmed = (content || "").trim();
  if (trimmed.length < 30) return; // skip near-empty
  const all = safeParseLocalStorage<SavedAIResult[]>(SAVED_KEY, [], (d): d is SavedAIResult[] => Array.isArray(d));
  if (all.some(r => r.content === trimmed)) return; // dedupe
  const next = [
    { id: `saved-${Date.now()}`, toolId, title, content: trimmed, savedAt: new Date().toISOString(), meta },
    ...all,
  ].slice(0, MAX_SAVED);
  safeSaveToLocalStorage(SAVED_KEY, next);
  try { window.dispatchEvent(new CustomEvent("ai-results-saved")); } catch {}
}

export interface UseSmartInsightOptions {
  section: SmartSection;
  toolType?: AIToolType;
  /** Disable auto-save (default: enabled) */
  autoSave?: boolean;
  /** Title used for the auto-saved entry */
  autoSaveTitle?: string;
  /** Tool ID for the saved entry (defaults to toolType or section) */
  autoSaveToolId?: string;
}

export function useSmartInsight({ section, toolType, autoSave = true, autoSaveTitle, autoSaveToolId }: UseSmartInsightOptions) {
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

  const resolvedWeight = resolveWeight(toolType, section);
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
      let accumulated = "";

      await executeSmartRequest({
        request: {
          section,
          toolType,
          messages: [{ role: "user", content: prompt }],
          context: { ...context, language: lang },
        },
        onDelta: (chunk) => {
          accumulated += chunk;
          setContent((prev) => prev + chunk);
          onDelta?.(chunk);
        },
        onDone: (response) => {
          setIsLoading(false);
          setWasCached(response.cached);
          refreshUsage(); // Sync AIUsageContext after quota consumed by engine
          // Auto-save successful AI result (skip cached re-runs to avoid spam)
          if (autoSave && !response.cached && accumulated.trim().length >= 30) {
            const toolId = autoSaveToolId || toolType || section;
            const title = autoSaveTitle || toolType || section;
            autoSaveResult(toolId, title, accumulated, { language: lang, ...(context || {}) });
            try { toast.success(t("ai.autoSaved", "✓ تم الحفظ تلقائياً")); } catch {}
          }
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
    [section, toolType, t, quota.limit, autoSave, autoSaveToolId, autoSaveTitle, refreshUsage]
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
    canAfford: canAfford(resolvedWeight),
    quota,
  };
}
