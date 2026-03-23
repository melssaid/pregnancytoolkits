/**
 * useSmartChat — Extended smart hook for multi-turn, multimodal conversations.
 * Built on top of the unified Smart Engine for tools like PregnancyAssistant & AIBumpPhotos.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAIUsage } from "@/contexts/AIUsageContext";
import {
  executeSmartRequest,
  getQuotaState,
  canAfford,
  resolveWeight,
  type SmartSection,
  type SmartError,
  type SmartErrorType,
  type SmartMessage,
  type SmartContentPart,
  type AIToolType,
} from "@/services/smartEngine";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string | SmartContentPart[];
}

export interface UseSmartChatOptions {
  section: SmartSection;
  toolType?: AIToolType;
}

export function useSmartChat({ section, toolType }: UseSmartChatOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<SmartErrorType | null>(null);
  const { i18n, t } = useTranslation();
  const { refresh: refreshUsage } = useAIUsage();
  const langRef = useRef(i18n.language);
  langRef.current = i18n.language;
  const resolvedWeight = resolveWeight(toolType, section);
  const quota = getQuotaState();
  /**
   * Send a multi-turn chat with streaming.
   * Accepts full conversation history for context continuity.
   */
  const sendChat = useCallback(
    async ({
      messages,
      context,
      onDelta,
      onDone,
    }: {
      messages: ChatMessage[];
      context?: Record<string, unknown>;
      onDelta: (chunk: string) => void;
      onDone?: () => void;
    }) => {
      setIsLoading(true);
      setError(null);
      setErrorType(null);

      const lang = langRef.current?.split("-")[0] || "en";

      await executeSmartRequest({
        request: {
          section,
          toolType,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content as string | SmartContentPart[],
          })),
          context: { ...context, language: lang },
        },
        onDelta,
        onDone: () => {
          setIsLoading(false);
          refreshUsage();
          onDone?.();
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
          onDone?.();
        },
        skipCache: true, // Multi-turn chats should not cache
      });
    },
    [section, toolType, t, quota.limit, refreshUsage]
  );

  const clearError = useCallback(() => {
    setError(null);
    setErrorType(null);
  }, []);

  return {
    sendChat,
    isLoading,
    error,
    errorType,
    clearError,
    canAfford: canAfford(resolvedWeight),
    quota,
  };
}
