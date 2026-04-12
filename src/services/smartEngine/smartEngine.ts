/**
 * Unified Smart Engine
 * Single AI service for all 14 section contexts.
 * Handles: quota checks → cache lookup → AI call → cache store → quota consume
 */

import { supabase } from "@/integrations/supabase/client";
import { getCouponRequestHeaders } from "@/lib/couponRequestHeaders";
import {
  type SmartRequest,
  type SmartResponse,
  type SmartError,
  type SmartErrorType,
  type InsightWeight,
  SECTION_TOOL_MAP,
  resolveWeight,
} from "./types";
import { canAfford, consumeQuota, getQuotaState, syncFromServer, setTier } from "./quotaManager";
import { buildCacheKey, getCached, setCache, contentHash } from "./cacheManager";

// ── Auth helper ──
async function getAuthHeader(): Promise<string> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) return `Bearer ${session.access_token}`;
    const { data, error } = await supabase.auth.signInAnonymously();
    if (!error && data.session?.access_token) return `Bearer ${data.session.access_token}`;
  } catch { /* fallback */ }
  return `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`;
}

function isAdminBypass(): boolean {
  try { return localStorage.getItem("smart_admin_bypass") === "true"; } catch { return false; }
}

// ── Error classification ──
export function classifyError(status?: number, message?: string): SmartError {
  if (status === 429) return { type: "rate_limit", message: message || "Rate limit exceeded", retryable: true };
  if (status === 402) return { type: "payment", message: message || "Payment required", retryable: false };
  if (status === 401) return { type: "auth", message: message || "Authentication failed", retryable: true };
  const lower = message?.toLowerCase() || "";
  if (lower.includes("fetch") || lower.includes("network") || lower.includes("failed")) {
    return { type: "network", message: message || "Network error", retryable: true };
  }
  return { type: "unknown", message: message || "Unknown error", retryable: false };
}

function syncQuotaFromResponseHeaders(headers: Headers): void {
  const serverUsed = headers.get("X-Daily-Used");
  const serverTier = headers.get("X-Subscription-Tier");
  const serverLimit = headers.get("X-Daily-Limit");
  const parsedUsed = serverUsed ? parseFloat(serverUsed) : NaN;
  const parsedLimit = serverLimit ? parseFloat(serverLimit) : NaN;

  if (!Number.isNaN(parsedUsed)) {
    syncFromServer(
      parsedUsed,
      serverTier === "premium" ? "premium" : serverTier === "free" ? "free" : undefined,
      Number.isNaN(parsedLimit) ? undefined : parsedLimit,
    );
    return;
  }

  if (serverTier === "premium") setTier("premium");
}

// ── SSE Stream processor ──
async function processStream(
  body: ReadableStream<Uint8Array>,
  onDelta: (text: string) => void,
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
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

// ── Main engine interface ──
export interface StreamOptions {
  request: SmartRequest;
  onDelta: (text: string) => void;
  onDone: (response: SmartResponse) => void;
  onError: (error: SmartError) => void;
  skipCache?: boolean;
}

/**
 * Execute a smart AI request with full pipeline:
 * 1. Check quota
 * 2. Check cache (unless skipCache)
 * 3. Call edge function with streaming
 * 4. Cache result
 * 5. Consume quota
 */
export async function executeSmartRequest({
  request,
  onDelta,
  onDone,
  onError,
  skipCache = false,
}: StreamOptions): Promise<void> {
  const toolType = request.toolType || SECTION_TOOL_MAP[request.section];
  // Weight is ALWAYS resolved from the centralized registry — never from request
  const weight: InsightWeight = resolveWeight(toolType, request.section);

  // 1. Quota check
  if (!canAfford(weight)) {
    const state = getQuotaState();
    onError({
      type: "quota_exhausted",
      message: `Monthly limit reached (${state.used}/${state.limit})`,
      retryable: false,
    });
    return;
  }

  // 2. Cache check
  if (!skipCache) {
    const contextFp = JSON.stringify({
      messages: request.messages.map(m => typeof m.content === "string" ? m.content : "media"),
      context: request.context,
    });
    const cacheKey = buildCacheKey(request.section, contextFp);
    const cached = getCached(cacheKey);
    if (cached) {
      onDelta(cached.content);
      onDone({
        content: cached.content,
        section: request.section,
        timestamp: cached.timestamp,
        cached: true,
        cost: 0 as InsightWeight, // no cost for cached
      });
      return;
    }
  }

  // 3. Call edge function
  try {
    const authHeader = await getAuthHeader();
    const couponHeaders = await getCouponRequestHeaders();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: authHeader,
      ...couponHeaders,
    };
    if (isAdminBypass()) headers["X-Admin-Bypass"] = "true";

    const lang = request.context?.language || "en";

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pregnancy-ai-perplexity`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          type: toolType,
          messages: request.messages,
          context: { ...request.context, language: lang },
        }),
      }
    );

    // Sync server-reported usage
    syncQuotaFromResponseHeaders(response.headers);

    if (!response.ok) {
      let serverMsg: string | undefined;
      try {
        const errBody = await response.json();
        serverMsg = errBody?.error;
      } catch { /* ignore */ }

      if (serverMsg === "daily_limit_reached") {
        onError({ type: "quota_exhausted", message: "Monthly limit reached", retryable: false });
        return;
      }

      // Retry on 401
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
                  ...couponHeaders,
                  ...(isAdminBypass() ? { "X-Admin-Bypass": "true" } : {}),
                },
                body: JSON.stringify({
                  type: toolType,
                  messages: request.messages,
                  context: { ...request.context, language: lang },
                }),
              }
            );
            if (retryResp.ok && retryResp.body) {
              syncQuotaFromResponseHeaders(retryResp.headers);
              let full = "";
              await processStream(retryResp.body, (chunk) => {
                full += chunk;
                onDelta(chunk);
              });
              consumeQuota(weight);
              cacheResult(request, full);
              onDone({ content: full, section: request.section, timestamp: Date.now(), cached: false, cost: weight });
              return;
            }
          }
        } catch { /* retry failed */ }
      }

      onError(classifyError(response.status, serverMsg));
      return;
    }

    if (!response.body) {
      onError({ type: "network", message: "No response body", retryable: true });
      return;
    }

    // 4. Stream and collect
    let full = "";
    await processStream(response.body, (chunk) => {
      full += chunk;
      onDelta(chunk);
    });

    // 5. Consume quota + cache
    consumeQuota(weight);
    cacheResult(request, full);

    onDone({
      content: full,
      section: request.section,
      timestamp: Date.now(),
      cached: false,
      cost: weight,
    });
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    onError(classifyError(undefined, raw));
  }
}

function cacheResult(request: SmartRequest, content: string): void {
  if (!content) return;
  const contextFp = JSON.stringify({
    messages: request.messages.map(m => typeof m.content === "string" ? m.content : "media"),
    context: request.context,
  });
  const cacheKey = buildCacheKey(request.section, contextFp);
  setCache(cacheKey, content, request.section, contextFp);
}
