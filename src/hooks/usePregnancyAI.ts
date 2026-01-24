import { useState, useCallback } from "react";

type AIType = "symptom-analysis" | "meal-suggestion" | "pregnancy-assistant" | "weekly-summary";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIContext {
  week?: number;
  trimester?: number;
  symptoms?: string[];
  preferences?: string[];
}

export function usePregnancyAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pregnancy-ai-perplexity`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ type, messages, context }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (response.status === 429) {
            throw new Error("تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً");
          }
          if (response.status === 402) {
            throw new Error("الخدمة غير متاحة حالياً");
          }
          throw new Error(errorData.error || "فشل في الاتصال بالمساعد الذكي");
        }

        if (!response.body) {
          throw new Error("لا يوجد استجابة");
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

        onDone();
      } catch (err) {
        const message = err instanceof Error ? err.message : "خطأ غير معروف";
        setError(message);
        onDone();
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { streamChat, isLoading, error };
}