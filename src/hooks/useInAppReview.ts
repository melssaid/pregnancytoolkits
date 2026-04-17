/**
 * Smart In-App Review System
 * 
 * Triggers review at optimal emotional moments:
 * - After using 3+ different tools (engagement threshold)
 * - After 7+ days since first use (retention signal)
 * - After positive moments: kick count, weekly summary, due date calc
 * 
 * Rules:
 * - Max once per 45 days
 * - Never on first session
 * - Never during errors
 * - Track tool usage for smarter timing
 */

import { useCallback } from 'react';

const REVIEW_KEY = 'app_review_state';
const TOOL_USAGE_KEY = 'app_tools_used';
const MIN_SESSIONS = 1;
const MIN_TOOLS_USED = 1;
const MIN_DAYS_INSTALLED = 0;
const COOLDOWN_MS = 21 * 24 * 60 * 60 * 1000; // 21 days

interface ReviewState {
  lastPromptedAt: string | null;
  sessionCount: number;
  hasReviewed: boolean;
  firstUsedAt: string;
  dismissCount: number;
}

function getState(): ReviewState {
  try {
    const raw = localStorage.getItem(REVIEW_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const initial: ReviewState = {
    lastPromptedAt: null,
    sessionCount: 0,
    hasReviewed: false,
    firstUsedAt: new Date().toISOString(),
    dismissCount: 0,
  };
  localStorage.setItem(REVIEW_KEY, JSON.stringify(initial));
  return initial;
}

function saveState(state: ReviewState) {
  localStorage.setItem(REVIEW_KEY, JSON.stringify(state));
}

function incrementSession() {
  const state = getState();
  state.sessionCount += 1;
  saveState(state);
}

// Track which tools the user has actually used
export function trackToolUsage(toolId: string) {
  try {
    const raw = localStorage.getItem(TOOL_USAGE_KEY);
    const used: string[] = raw ? JSON.parse(raw) : [];
    if (!used.includes(toolId)) {
      used.push(toolId);
      localStorage.setItem(TOOL_USAGE_KEY, JSON.stringify(used));
    }
  } catch {}
}

function getToolsUsedCount(): number {
  try {
    const raw = localStorage.getItem(TOOL_USAGE_KEY);
    return raw ? JSON.parse(raw).length : 0;
  } catch { return 0; }
}

function getDaysInstalled(): number {
  const state = getState();
  const first = new Date(state.firstUsedAt).getTime();
  return Math.floor((Date.now() - first) / (24 * 60 * 60 * 1000));
}

// Increment on module load (once per app open)
if (typeof window !== 'undefined') {
  try { incrementSession(); } catch {}
}

function canPrompt(): boolean {
  const state = getState();
  if (state.hasReviewed) return false;
  if (state.sessionCount < MIN_SESSIONS) return false;
  if (state.dismissCount >= 3) return false; // Stop after 3 dismissals
  
  // Must have used at least 3 different tools
  if (getToolsUsedCount() < MIN_TOOLS_USED) return false;
  
  // Must be installed for at least 7 days
  if (getDaysInstalled() < MIN_DAYS_INSTALLED) return false;
  
  if (state.lastPromptedAt) {
    const elapsed = Date.now() - new Date(state.lastPromptedAt).getTime();
    if (elapsed < COOLDOWN_MS) return false;
  }
  return true;
}

function markPrompted() {
  const state = getState();
  state.lastPromptedAt = new Date().toISOString();
  saveState(state);
}

function markReviewed() {
  const state = getState();
  state.hasReviewed = true;
  saveState(state);
}

function markDismissed() {
  const state = getState();
  state.dismissCount = (state.dismissCount || 0) + 1;
  state.lastPromptedAt = new Date().toISOString();
  saveState(state);
}

/**
 * Try native Google Play In-App Review API only.
 * Returns true if a native bridge handled the request, false otherwise.
 * NEVER opens the Play Store as a fallback (poor UX inside TWA).
 */
function triggerReview(): boolean {
  // Native bridge (Android WebView wrapper)
  if ((window as any).Android?.requestReview) {
    (window as any).Android.requestReview();
    markReviewed();
    return true;
  }
  // ReactNativeWebView bridge
  if ((window as any).ReactNativeWebView?.postMessage) {
    (window as any).ReactNativeWebView.postMessage(
      JSON.stringify({ type: 'REQUEST_REVIEW' })
    );
    markReviewed();
    return true;
  }
  // No native bridge available — do nothing (caller shows in-app thank-you)
  return false;
}

export type ReviewTrigger =
  | 'kick_count_complete'
  | 'weekly_summary_view'
  | 'due_date_calculated'
  | 'contraction_timer_used'
  | 'milestone_reached'
  | 'ai_result_positive'
  | 'tool_usage_threshold';

// Weight triggers by positivity (higher = more likely to prompt)
const TRIGGER_WEIGHTS: Record<ReviewTrigger, number> = {
  kick_count_complete: 0.9,
  weekly_summary_view: 0.8,
  due_date_calculated: 0.85,
  contraction_timer_used: 0.7,
  milestone_reached: 0.95,
  ai_result_positive: 0.75,
  tool_usage_threshold: 0.6,
};

export function useInAppReview() {
  const maybePromptReview = useCallback((trigger: ReviewTrigger) => {
    if (!canPrompt()) return false;
    
    // Use weight to add randomness — don't always prompt
    const weight = TRIGGER_WEIGHTS[trigger] || 0.5;
    if (Math.random() > weight) return false;
    
    markPrompted();
    // Delay so user sees their result first
    setTimeout(() => triggerReview(), 2000);
    return true;
  }, []);

  return { maybePromptReview, trackToolUsage };
}
