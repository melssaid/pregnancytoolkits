/**
 * usePregnancyAI — Legacy-compatible wrapper
 * NOW routes ALL calls through the unified Smart Engine.
 * This gives all ~29 tool pages automatic quota, caching, and consistency.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAIUsage } from "@/contexts/AIUsageContext";
import {
  executeSmartRequest,
  type SmartSection,
  type AIToolType,
  type SmartError,
} from "@/services/smartEngine";

// Must match all types accepted by the edge function
type AIType =
  | "symptom-analysis" | "meal-suggestion" | "pregnancy-assistant" | "weekly-summary"
  | "posture-coach" | "walking-coach" | "stretch-reminder" | "back-pain-relief"
  | "leg-cramp-preventer" | "smoothie-generator" | "daily-tips" | "labor-tracker"
  | "appointment-prep" | "kick-analysis" | "sleep-analysis" | "vitamin-advice"
  | "bump-photos" | "baby-cry-analysis" | "postpartum-recovery"
  | "hospital-bag" | "birth-position" | "partner-guide" | "lactation-prep"
  | "nausea-relief" | "skincare-advice" | "birth-plan" | "mental-health" | "pregnancy-plan" | "baby-growth-analysis"
  | "weight-analysis" | "contraction-analysis";

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
  contractionData?: unknown;
  sleepData?: unknown;
  language?: string;
  [key: string]: unknown;
}

// ── AIType → SmartSection mapping ──
const AITYPE_TO_SECTION: Record<string, SmartSection> = {
  'symptom-analysis': 'symptoms',
  'meal-suggestion': 'nutrition',
  'pregnancy-assistant': 'pregnancy-plan',
  'weekly-summary': 'pregnancy-plan',
  'kick-analysis': 'kick-analysis',
  'weight-analysis': 'weight',
  'contraction-analysis': 'safety',
  'sleep-analysis': 'sleep',
  'vitamin-advice': 'medications',
  'postpartum-recovery': 'postpartum',
  'mental-health': 'mental-wellbeing',
  'back-pain-relief': 'movement',
  'appointment-prep': 'appointments',
  'bump-photos': 'ultrasound',
  'baby-cry-analysis': 'postpartum',
  'birth-plan': 'pregnancy-plan',
  'baby-growth-analysis': 'pregnancy-plan',
  'pregnancy-plan': 'pregnancy-plan',
  'posture-coach': 'movement',
  'walking-coach': 'movement',
  'stretch-reminder': 'movement',
  'leg-cramp-preventer': 'movement',
  'smoothie-generator': 'nutrition',
  'daily-tips': 'pregnancy-plan',
  'labor-tracker': 'safety',
  'hospital-bag': 'pregnancy-plan',
  'birth-position': 'pregnancy-plan',
  'partner-guide': 'pregnancy-plan',
  'lactation-prep': 'postpartum',
  'nausea-relief': 'symptoms',
  'skincare-advice': 'symptoms',
};

function mapErrorType(smartErr: SmartError['type']): AIErrorType {
  switch (smartErr) {
    case 'quota_exhausted': return 'rate_limit';
    case 'rate_limit': return 'rate_limit';
    case 'payment': return 'payment';
    case 'network': return 'network';
    case 'auth': return 'auth';
    default: return 'unknown';
  }
}

export function usePregnancyAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<AIErrorType | null>(null);
  const { i18n, t } = useTranslation();
  const { remaining, limit, tier, refresh } = useAIUsage();

  const languageRef = useRef(i18n.language);
  languageRef.current = i18n.language;

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
      setErrorType(null);

      const section: SmartSection = AITYPE_TO_SECTION[type] || 'pregnancy-plan';
      const lang = languageRef.current?.split('-')[0] || 'en';

      await executeSmartRequest({
        request: {
          section,
          toolType: type as AIToolType,
          weight: 1,
          messages: messages.map(m => ({
            role: m.role,
            content: m.content as string | { type: "text" | "image_url"; text?: string; image_url?: { url: string } }[],
          })),
          context: { ...context, language: lang },
        },
        onDelta,
        onDone: () => {
          setIsLoading(false);
          // Refresh AIUsageContext to pick up quota consumed by smartEngine
          refresh();
          onDone();
        },
        onError: (err: SmartError) => {
          setIsLoading(false);
          const mappedType = mapErrorType(err.type);
          setErrorType(mappedType);

          if (err.type === 'quota_exhausted') {
            setError(t('aiErrors.monthlyLimitMsg', { limit, remaining: 0 }));
          } else if (err.type === 'rate_limit') {
            setError(t('aiErrors.rateLimitMsg'));
          } else if (err.type === 'payment') {
            setError(t('aiErrors.paymentMsg'));
          } else if (err.type === 'network' || err.type === 'auth') {
            setError(t('aiErrors.networkMsg'));
          } else {
            setError(t('aiErrors.unknownMsg'));
          }

          // Refresh context in case server sync happened inside engine
          refresh();
          onDone();
        },
      });
    },
    [t, limit, refresh]
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
        const msg = err instanceof Error ? err.message : "";
        setError(msg || t('aiErrors.unknownMsg'));
        setErrorType('unknown');
        return null;
      }
    },
    [streamChat, t]
  );

  const clearError = useCallback(() => {
    setError(null);
    setErrorType(null);
  }, []);

  return { streamChat, generateContent, isLoading, error, errorType, clearError, aiRemaining: remaining, aiLimit: limit, aiTier: tier };
}
