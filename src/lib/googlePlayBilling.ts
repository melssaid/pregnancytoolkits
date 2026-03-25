/**
 * Google Play Billing Bridge
 * 
 * Product IDs (to be created in Google Play Console):
 * - premium_monthly: $2.99/month subscription
 * - premium_yearly: $19.99/year subscription
 * 
 * Communication with the native Android wrapper (AppMySite or custom WebView)
 * is done via postMessage. The native layer listens for purchase requests
 * and handles Google Play Billing flow.
 * 
 * After a successful purchase, the native layer sends back a message:
 * { type: "PURCHASE_SUCCESS", purchaseToken: "...", productId: "..." }
 * which is handled by listenForPurchaseSuccess().
 */

import { supabase } from '@/integrations/supabase/client';
import { ensureAuthenticated } from '@/lib/auth';

export const PRODUCT_IDS = {
  monthly: "premium_monthly",
  yearly: "premium_yearly",
} as const;

export type PlanType = keyof typeof PRODUCT_IDS;

interface PurchaseMessage {
  type: "PURCHASE_REQUEST";
  productId: string;
}

interface PurchaseSuccessPayload {
  type: "PURCHASE_SUCCESS";
  purchaseToken: string;
  productId: string;
  orderId?: string;
}

/**
 * Attempt to initiate a Google Play purchase via native bridge.
 * Returns true if the message was sent, false if no bridge is available.
 */
export function requestPurchase(plan: PlanType): boolean {
  const productId = PRODUCT_IDS[plan];
  const message: PurchaseMessage = {
    type: "PURCHASE_REQUEST",
    productId,
  };

  // Try ReactNativeWebView bridge (AppMySite / React Native wrappers)
  if ((window as any).ReactNativeWebView?.postMessage) {
    (window as any).ReactNativeWebView.postMessage(JSON.stringify(message));
    return true;
  }

  // Try Android WebView JavascriptInterface
  if ((window as any).Android?.purchase) {
    (window as any).Android.purchase(productId);
    return true;
  }

  // Fallback: window.postMessage for custom bridges
  if ((window as any).webkit?.messageHandlers?.purchase) {
    (window as any).webkit.messageHandlers.purchase.postMessage(message);
    return true;
  }

  return false;
}

/**
 * Check if running inside a native app wrapper
 */
export function isNativeApp(): boolean {
  return !!(
    (window as any).ReactNativeWebView ||
    (window as any).Android ||
    (window as any).webkit?.messageHandlers?.purchase
  );
}

/**
 * Handle a successful purchase by saving the token to the subscriptions table.
 * Updates existing trial/subscription record with Google Play token and activates it.
 */
async function handlePurchaseSuccess(payload: PurchaseSuccessPayload): Promise<boolean> {
  try {
    const user = await ensureAuthenticated();
    if (!user) {
      console.error('[Billing] No authenticated user for purchase confirmation');
      return false;
    }

    const subType = payload.productId === 'premium_yearly' ? 'yearly' : 'monthly';
    const now = new Date();
    const endDate = new Date(now);
    if (subType === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Check for existing subscription record (trial or previous)
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      // Update existing record — RLS allows only service_role to update,
      // so we use an edge function for this
      const res = await supabase.functions.invoke('activate-subscription', {
        body: {
          subscriptionId: existing.id,
          purchaseToken: payload.purchaseToken,
          productId: payload.productId,
          orderId: payload.orderId || null,
        },
      });

      if (res.error) {
        console.error('[Billing] Activation failed:', res.error.message);
        return false;
      }
    } else {
      // No existing record — create a new one via edge function
      const res = await supabase.functions.invoke('activate-subscription', {
        body: {
          userId: user.id,
          purchaseToken: payload.purchaseToken,
          productId: payload.productId,
          orderId: payload.orderId || null,
        },
      });

      if (res.error) {
        console.error('[Billing] Creation failed:', res.error.message);
        return false;
      }
    }

    console.log(`[Billing] ✅ Subscription activated: ${subType}`);
    return true;
  } catch (err) {
    console.error('[Billing] Purchase handling error:', err);
    return false;
  }
}

// Track listener to avoid duplicates
let listenerActive = false;

/**
 * Listen for PURCHASE_SUCCESS messages from the native wrapper.
 * Call once on app mount. Returns a cleanup function.
 */
export function listenForPurchaseSuccess(
  onSuccess?: () => void,
  onError?: (msg: string) => void,
): () => void {
  if (listenerActive) return () => {};
  listenerActive = true;

  const handler = async (event: MessageEvent) => {
    // Validate message structure
    let data: any;
    try {
      data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
    } catch {
      return; // Not JSON — ignore
    }

    if (data?.type !== 'PURCHASE_SUCCESS') return;
    if (!data.purchaseToken || !data.productId) {
      onError?.('Invalid purchase payload');
      return;
    }

    const success = await handlePurchaseSuccess(data as PurchaseSuccessPayload);
    if (success) {
      onSuccess?.();
    } else {
      onError?.('Failed to activate subscription');
    }
  };

  window.addEventListener('message', handler);

  // Also expose a global function for Android JavascriptInterface
  (window as any).onPurchaseSuccess = (token: string, productId: string, orderId?: string) => {
    handlePurchaseSuccess({ type: 'PURCHASE_SUCCESS', purchaseToken: token, productId, orderId })
      .then(ok => ok ? onSuccess?.() : onError?.('Activation failed'));
  };

  return () => {
    window.removeEventListener('message', handler);
    delete (window as any).onPurchaseSuccess;
    listenerActive = false;
  };
}
