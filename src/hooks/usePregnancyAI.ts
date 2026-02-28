import { useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAIUsageLimit } from "./useAIUsageLimit";

type AIType = "symptom-analysis" | "meal-suggestion" | "pregnancy-assistant" | "weekly-summary" | "bump-photos" | "baby-cry-analysis" | "postpartum-recovery";

export type AIErrorType = "rate_limit" | "payment" | "network" | "unknown";

type MessageContentPart = { type: string; text?: string; image_url?: { url: string } };

interface Message {
  role: "user" | "assistant";
  content: string | MessageContentPart[];
}

interface AIContext {
  week?: number;
  trimester?: number;
  symptoms?: string[];
  preferences?: string[];
  walkMinutes?: number;
  weight?: number;
  contractionData?: any;
  sleepData?: any;
  language?: string;
}

export function usePregnancyAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<AIErrorType | null>(null);
  const { i18n, t } = useTranslation();
  const { isLimitReached, remaining, incrementUsage, limit } = useAIUsageLimit();

  const languageRef = useRef(i18n.language);
  languageRef.current = i18n.language;

  const resolveError = useCallback((status?: number, rawMsg?: string): { msg: string; type: AIErrorType } => {
    if (status === 429) return { msg: t('aiErrors.rateLimitMsg'), type: 'rate_limit' };
    if (status === 402) return { msg: t('aiErrors.paymentMsg'), type: 'payment' };
    if (rawMsg?.toLowerCase().includes('fetch') || rawMsg?.toLowerCase().includes('network') || rawMsg?.toLowerCase().includes('connect')) {
      return { msg: t('aiErrors.networkMsg'), type: 'network' };
    }
    return { msg: t('aiErrors.unknownMsg'), type: 'unknown' };
  }, [t]);

  const streamChat = useCallback(
    async ({
      type,
      messages,
      context,
      onDelta,
      onDone,
    }: {
      type: AIType;
      messages: Message[];
      context?: AIContext;
      onDelta: (text: string) => void;
      onDone: () => void;
    }) => {
      // Check daily limit
      if (isLimitReached) {
        const limitMsg = t('aiErrors.dailyLimitMsg', { limit, remaining: 0 });
        setError(limitMsg);
        setErrorType('rate_limit');
        onDone();
        return;
      }

      setIsLoading(true);
      setError(null);
      setErrorType(null);

      const currentLang = languageRef.current?.split('-')[0] || 'en';
      const contextWithLanguage = {
        ...context,
        language: context?.language || currentLang,
      };

      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pregnancy-ai-perplexity`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ type, messages, context: contextWithLanguage }),
          }
        );

        if (!response.ok) {
          const { msg, type: errType } = resolveError(response.status);
          setError(msg);
          setErrorType(errType);
          onDone();
          return;
        }

        if (!response.body) {
          const { msg, type: errType } = resolveError(undefined, 'network');
          setError(msg);
          setErrorType(errType);
          onDone();
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, newlineIndex);
            buffer = buffer.slice(newlineIndex + 1);

            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) onDelta(content);
            } catch {
              buffer = line + "\n" + buffer;
              break;
            }
          }
        }

        incrementUsage();
        onDone();
      } catch (err) {
        const raw = err instanceof Error ? err.message : "";
        const { msg, type: errType } = resolveError(undefined, raw);
        setError(msg);
        setErrorType(errType);
        onDone();
      } finally {
        setIsLoading(false);
      }
    },
    [resolveError, isLimitReached, remaining, incrementUsage, limit, t]
  );

  const generateContent = useCallback(
    async (prompt: string): Promise<string | null> => {
      setIsLoading(true);
      setError(null);
      setErrorType(null);
      let result = "";

      try {
        await new Promise<void>((resolve) => {
          streamChat({
            type: "pregnancy-assistant",
            messages: [{ role: "user", content: prompt }],
            onDelta: (text) => { result += text; },
            onDone: resolve,
          });
        });
        return result || null;
      } catch (err) {
        const raw = err instanceof Error ? err.message : "";
        const { msg, type: errType } = resolveError(undefined, raw);
        setError(msg);
        setErrorType(errType);
        return null;
      }
    },
    [streamChat, resolveError]
  );

  const clearError = useCallback(() => {
    setError(null);
    setErrorType(null);
  }, []);

  return { streamChat, generateContent, isLoading, error, errorType, clearError, aiRemaining: remaining, aiLimit: limit };
}
