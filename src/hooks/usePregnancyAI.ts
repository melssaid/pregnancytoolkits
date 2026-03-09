import { useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAIUsageLimit } from "./useAIUsageLimit";
import { supabase } from "@/integrations/supabase/client";

// Must match all types accepted by the edge function
type AIType =
  | "symptom-analysis" | "meal-suggestion" | "pregnancy-assistant" | "weekly-summary"
  | "posture-coach" | "walking-coach" | "stretch-reminder" | "back-pain-relief"
  | "leg-cramp-preventer" | "smoothie-generator" | "daily-tips" | "labor-tracker"
  | "appointment-prep" | "kick-analysis" | "sleep-analysis" | "vitamin-advice"
  | "bump-photos" | "baby-cry-analysis" | "postpartum-recovery"
  | "hospital-bag" | "birth-position" | "partner-guide" | "lactation-prep"
  | "nausea-relief" | "skincare-advice" | "birth-plan" | "mental-health" | "pregnancy-plan" | "baby-growth-analysis";

export type AIErrorType = "rate_limit" | "payment" | "network" | "auth" | "unknown";

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
  const { isLimitReached, remaining, incrementUsage, syncFromServer, syncLimit, limit, tier } = useAIUsageLimit();

  const languageRef = useRef(i18n.language);
  languageRef.current = i18n.language;

  const resolveError = useCallback((status?: number, rawMsg?: string): { msg: string; type: AIErrorType } => {
    if (status === 429) return { msg: t('aiErrors.rateLimitMsg'), type: 'rate_limit' };
    if (status === 402) return { msg: t('aiErrors.paymentMsg'), type: 'payment' };
    if (status === 401) return { msg: t('aiErrors.networkMsg'), type: 'auth' };
    const lower = rawMsg?.toLowerCase() || '';
    if (lower.includes('fetch') || lower.includes('network') || lower.includes('connect') || lower.includes('failed')) {
      return { msg: t('aiErrors.networkMsg'), type: 'network' };
    }
    if (lower.includes('auth')) {
      return { msg: t('aiErrors.networkMsg'), type: 'auth' };
    }
    return { msg: t('aiErrors.unknownMsg'), type: 'unknown' };
  }, [t]);

  /**
   * Get the best available authorization token.
   * Priority: session access_token > anon key (fallback)
   */
  const getAuthHeader = useCallback(async (): Promise<string> => {
    try {
      // Try existing session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) return `Bearer ${session.access_token}`;

      // Try anonymous sign-in
      const { data, error: authError } = await supabase.auth.signInAnonymously();
      if (!authError && data.session?.access_token) {
        return `Bearer ${data.session.access_token}`;
      }
    } catch {
      // Auth failed — fall through to anon key
    }

    // Fallback: use anon key (edge function has verify_jwt=false so this works)
    return `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`;
  }, []);

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
        const authHeader = await getAuthHeader();

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pregnancy-ai-perplexity`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: authHeader,
            },
            body: JSON.stringify({ type, messages, context: contextWithLanguage }),
          }
        );

        // Sync server-reported usage from headers
        const serverUsed = response.headers.get("X-Daily-Used");
        if (serverUsed) syncFromServer(parseInt(serverUsed, 10));
        const serverLimit = response.headers.get("X-Daily-Limit");
        const serverTier = response.headers.get("X-Subscription-Tier");
        if (serverLimit) syncLimit(parseInt(serverLimit, 10), serverTier === 'premium' ? 'premium' : 'free');

        if (!response.ok) {
          // Read server error for better diagnostics
          let serverMsg: string | undefined;
          let isDailyLimit = false;
          try {
            const errBody = await response.json();
            serverMsg = errBody?.error;
            isDailyLimit = serverMsg === "daily_limit_reached";
          } catch { /* ignore */ }

          // Server-enforced daily limit
          if (isDailyLimit) {
            const limitMsg = t('aiErrors.dailyLimitMsg', { limit, remaining: 0 });
            setError(limitMsg);
            setErrorType('rate_limit');
            onDone();
            return;
          }

          // On 401, try refresh + retry once
          if (response.status === 401) {
            try {
              const { data: { session } } = await supabase.auth.refreshSession();
              if (session?.access_token) {
                const retryResp = await fetch(
                  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pregnancy-ai-perplexity`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({ type, messages, context: contextWithLanguage }),
                  }
                );
                if (retryResp.ok && retryResp.body) {
                  const retryUsed = retryResp.headers.get("X-Daily-Used");
                  if (retryUsed) syncFromServer(parseInt(retryUsed, 10));
                  await processStream(retryResp.body, onDelta);
                  onDone();
                  return;
                }
              }
            } catch { /* retry failed */ }
          }

          const { msg, type: errType } = resolveError(response.status, serverMsg);
          setError(msg);
          setErrorType(errType);
          onDone();
          return;
        }

        if (!response.body) {
          setError(t('aiErrors.networkMsg'));
          setErrorType('network');
          onDone();
          return;
        }

        await processStream(response.body, onDelta);
        onDone();
      } catch (err) {
        console.error("[AI] streamChat error:", err);
        const raw = err instanceof Error ? err.message : String(err);
        const { msg, type: errType } = resolveError(undefined, raw);
        setError(msg);
        setErrorType(errType);
        onDone();
      } finally {
        setIsLoading(false);
      }
    },
    [resolveError, isLimitReached, syncFromServer, limit, t, getAuthHeader]
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

/** Parse SSE stream and emit deltas */
async function processStream(
  body: ReadableStream<Uint8Array>,
  onDelta: (text: string) => void,
) {
  const reader = body.getReader();
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
      if (jsonStr === "[DONE]") return;

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
}
