import { supabase } from "@/integrations/supabase/client";

export type SubscriptionStatus = {
  status: string;
  subscription_type?: string;
  has_active: boolean;
  is_trial: boolean;
  trial_remaining_days: number;
  subscription_end?: string;
  google_play_order_id?: string;
};

const FUNCTION_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/manage-subscription`;

async function callSubscriptionAPI(action: string, payload: Record<string, unknown> = {}): Promise<any> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify({ action, ...payload }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Subscription API error');
  return data;
}

/**
 * Get current subscription status
 */
export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  return callSubscriptionAPI('get_status');
}

/**
 * Start a 3-day free trial
 */
export async function startFreeTrial(): Promise<{ success: boolean; trial_end: string; trial_remaining_days: number }> {
  return callSubscriptionAPI('start_trial');
}

/**
 * Activate subscription after Google Play purchase
 * Called from the Android WebView bridge
 */
export async function activateGooglePlaySubscription(
  orderId: string,
  purchaseToken: string,
  productId: string
): Promise<{ success: boolean; subscription_type: string; subscription_end: string }> {
  return callSubscriptionAPI('activate_google_play', {
    order_id: orderId,
    purchase_token: purchaseToken,
    product_id: productId,
  });
}

/**
 * Cancel active subscription
 */
export async function cancelSubscription(): Promise<{ success: boolean }> {
  return callSubscriptionAPI('cancel');
}

/**
 * Check if user has premium access (active trial or subscription)
 */
export async function hasPremiumAccess(): Promise<boolean> {
  try {
    const status = await getSubscriptionStatus();
    return status.has_active;
  } catch {
    return false;
  }
}
