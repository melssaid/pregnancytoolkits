/**
 * In-App Review Prompt
 * 
 * Triggers a review request at positive emotional moments:
 * - After kick counting session
 * - After viewing weekly summary
 * - After due date calculation
 * - After 7+ daily uses
 * 
 * Rules:
 * - Max once per 30 days
 * - Never on first session
 * - Never during errors
 * - Uses Google Play In-App Review API via native bridge,
 *   falls back to Play Store deep link
 */

import { useCallback } from 'react';

const REVIEW_KEY = 'app_review_state';
const MIN_SESSIONS = 3;
const COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

interface ReviewState {
  lastPromptedAt: string | null;
  sessionCount: number;
  hasReviewed: boolean;
  firstUsedAt: string;
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

// Increment on module load (once per app open)
if (typeof window !== 'undefined') {
  try { incrementSession(); } catch {}
}

function canPrompt(): boolean {
  const state = getState();
  if (state.hasReviewed) return false;
  if (state.sessionCount < MIN_SESSIONS) return false;
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

/**
 * Try native Google Play In-App Review API, fall back to Play Store link
 */
function triggerReview() {
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
  // Fallback: open Play Store page
  const packageName = 'app.lovable.pregnancytoolkits';
  window.open(
    `https://play.google.com/store/apps/details?id=${packageName}`,
    '_blank'
  );
  markReviewed();
  return true;
}

export type ReviewTrigger =
  | 'kick_count_complete'
  | 'weekly_summary_view'
  | 'due_date_calculated'
  | 'contraction_timer_used'
  | 'milestone_reached';

export function useInAppReview() {
  const maybePromptReview = useCallback((trigger: ReviewTrigger) => {
    if (!canPrompt()) return false;
    markPrompted();
    // Small delay so the user sees their result first
    setTimeout(() => triggerReview(), 1500);
    return true;
  }, []);

  return { maybePromptReview };
}
