/**
 * Unified Smart Engine — Shared Types
 * Single source of truth for all AI interactions across the app.
 */

// ── Section Contexts (14 domains the engine supports) ──
export type SmartSection =
  | "pregnancy-plan"
  | "symptoms"
  | "nutrition"
  | "movement"
  | "appointments"
  | "sleep"
  | "mental-wellbeing"
  | "medications"
  | "weight"
  | "postpartum"
  | "lab-checks"
  | "safety"
  | "bump-photos"
  | "kick-analysis";

// ── AI Tool Types (maps to edge function types) ──
export type AIToolType =
  | "symptom-analysis" | "meal-suggestion" | "pregnancy-assistant" | "weekly-summary"
  | "posture-coach" | "walking-coach" | "stretch-reminder" | "back-pain-relief"
  | "leg-cramp-preventer" | "smoothie-generator" | "daily-tips" | "labor-tracker"
  | "appointment-prep" | "kick-analysis" | "sleep-analysis" | "sleep-meditation" | "sleep-routine" | "vitamin-advice"
  | "bump-photos" | "baby-cry-analysis" | "postpartum-recovery"
  | "hospital-bag" | "birth-position" | "partner-guide" | "lactation-prep"
  | "nausea-relief" | "skincare-advice" | "birth-plan" | "mental-health"
  | "pregnancy-plan" | "baby-growth-analysis"
  | "weight-analysis" | "contraction-analysis"
  | "craving-alternatives" | "grocery-list"
  | "live-search" // Perplexity Sonar — real-time web search with citations
  | "holistic-dashboard"; // Holistic dashboard-wide AI analysis (premium 7-point tool)

// ── Section → AI Tool Type mapping ──
export const SECTION_TOOL_MAP: Record<SmartSection, AIToolType> = {
  "pregnancy-plan": "pregnancy-plan",
  "symptoms": "symptom-analysis",
  "nutrition": "meal-suggestion",
  "movement": "back-pain-relief",
  "appointments": "appointment-prep",
  "sleep": "sleep-analysis",
  "mental-wellbeing": "mental-health",
  "medications": "vitamin-advice",
  "weight": "weight-analysis",
  "postpartum": "postpartum-recovery",
  "lab-checks": "pregnancy-assistant",
  "safety": "symptom-analysis",
  "bump-photos": "bump-photos",
  "kick-analysis": "kick-analysis",
};

// ── Quota cost weights ──
export type InsightWeight = 0 | 0.5 | 1 | 2 | 5;

/**
 * TOOL_WEIGHT_REGISTRY — THE SINGLE SOURCE OF TRUTH for AI request costs.
 * Keyed by AIToolType. Every tool defaults to weight 1.
 * Only high-cost tools (image analysis) are explicitly listed as weight 2.
 *
 * THIS MUST NEVER BE BYPASSED. All weight resolution goes through resolveWeight().
 */
export const TOOL_WEIGHT_REGISTRY: Record<AIToolType, InsightWeight> = {
  "symptom-analysis": 1,
  "meal-suggestion": 0.5,        // quick single meal suggestion
  "pregnancy-assistant": 1,
  "weekly-summary": 1,
  "posture-coach": 1,
  "walking-coach": 1,
  "stretch-reminder": 1,
  "back-pain-relief": 1,
  "leg-cramp-preventer": 1,
  "smoothie-generator": 1,
  "daily-tips": 0,              // free — encourages daily engagement
  "labor-tracker": 1,
  "appointment-prep": 1,
  "kick-analysis": 1,
  "sleep-analysis": 0.5,      // sub-action of Pregnancy Comfort
  "sleep-meditation": 0.5,    // sub-action of Pregnancy Comfort
  "sleep-routine": 0.5,       // sub-action of Pregnancy Comfort
  "vitamin-advice": 0.5,        // quick vitamin tips
  "bump-photos": 5,           // ultrasound photo analysis — multimodal vision + deep clinical context
  "baby-cry-analysis": 0.5,     // quick cry classification
  "postpartum-recovery": 1,
  "hospital-bag": 1,
  "birth-position": 0.5,         // lightweight position suggestions
  "partner-guide": 0.5,          // lightweight partner support tips
  "lactation-prep": 1,
  "nausea-relief": 0.5,         // lightweight relief tips
  "skincare-advice": 0.5,       // quick skincare routine
  "birth-plan": 1,
  "mental-health": 1,
  "pregnancy-plan": 1,
  "baby-growth-analysis": 1,
  "weight-analysis": 1,
  "contraction-analysis": 1,
  "craving-alternatives": 0.5,  // lightweight craving swap suggestions
  "grocery-list": 0.5,          // quick grocery nutrition tips
  "live-search": 5,             // Perplexity Sonar — real-time web search with citations
};

/**
 * Resolve the weight for a given tool/section.
 * Uses TOOL_WEIGHT_REGISTRY as the ONLY source.
 * Components MUST NOT pass weight manually — this function is the authority.
 */
export function resolveWeight(toolType?: AIToolType, section?: SmartSection): InsightWeight {
  if (toolType && TOOL_WEIGHT_REGISTRY[toolType] !== undefined) {
    return TOOL_WEIGHT_REGISTRY[toolType];
  }
  // Fallback: resolve toolType from section, then look up registry
  if (section) {
    const mapped = SECTION_TOOL_MAP[section];
    if (mapped && TOOL_WEIGHT_REGISTRY[mapped] !== undefined) {
      return TOOL_WEIGHT_REGISTRY[mapped];
    }
  }
  return 1; // safe default
}

// ── Quota tiers ──
export interface QuotaTier {
  monthly: number;
  label: string;
}

export const QUOTA_TIERS: Record<string, QuotaTier> = {
  free: { monthly: 10, label: "Free" },
  premium: { monthly: 60, label: "Premium" },
};

// ── Quota state ──
export interface QuotaState {
  used: number;
  limit: number;
  remaining: number;
  tier: "free" | "premium";
  monthKey: string; // "2026-03"
  isExhausted: boolean;
  isNearLimit: boolean;
  adminBypass: boolean;
}

// ── Unified AI Request ──
export interface SmartRequest {
  section: SmartSection;
  toolType?: AIToolType; // override the default section→tool mapping
  messages: SmartMessage[];
  context?: SmartContext;
  // weight is resolved centrally by resolveWeight() — do NOT pass manually
}

export interface SmartMessage {
  role: "user" | "assistant";
  content: string | SmartContentPart[];
}

export interface SmartContentPart {
  type: "text" | "image_url";
  text?: string;
  image_url?: { url: string };
}

export interface SmartContext {
  week?: number;
  trimester?: number;
  symptoms?: string[];
  preferences?: string[];
  weight?: number;
  contractionData?: unknown;
  sleepData?: unknown;
  language?: string;
  [key: string]: unknown; // extensible for section-specific data
}

// ── Unified AI Response ──
export interface SmartResponse {
  content: string;
  section: SmartSection;
  timestamp: number;
  cached: boolean;
  cost: InsightWeight;
}

// ── Cache entry ──
export interface CacheEntry {
  content: string;
  section: SmartSection;
  timestamp: number;
  expiresAt: number;
  contentHash: string;
}

// ── Error types ──
export type SmartErrorType = "quota_exhausted" | "rate_limit" | "payment" | "network" | "auth" | "unknown";

export interface SmartError {
  type: SmartErrorType;
  message: string;
  retryable: boolean;
}
