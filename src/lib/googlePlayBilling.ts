/**
 * Google Play Billing — Dual Strategy
 * 
 * 1. Digital Goods API + Payment Request API (for TWA — preferred)
 * 2. postMessage / JavascriptInterface bridge (fallback for WebView wrappers)
 * 
 * Product IDs (Google Play Console):
 * - premium_monthly: $2.99/month
 * - premium_yearly: $19.99/year
 */

import { supabase } from '@/integrations/supabase/client';
import { ensureAuthenticated } from '@/lib/auth';

export const PRODUCT_IDS = {
  monthly: "premium_monthly",
  yearly: "premium_yearly",
} as const;

export type PlanType = keyof typeof PRODUCT_IDS;

// ─── Type declarations for Digital Goods API ───

interface DigitalGoodsItemDetails {
  itemId: string;
  title: string;
  description: string;
  price: { currency: string; value: string };
  type: string;
}

interface DigitalGoodsService {
  getDetails(itemIds: string[]): Promise<DigitalGoodsItemDetails[]>;
  acknowledge(purchaseToken: string, type: 'repeatable' | 'onetime'): Promise<void>;
  listPurchases(): Promise<Array<{ itemId: string; purchaseToken: string }>>;
}

declare global {
  interface Window {
    getDigitalGoodsService?: (paymentMethod: string) => Promise<DigitalGoodsService>;
  }
}

// ─── Digital Goods API (TWA) ───

const PLAY_BILLING_METHOD = 'https://play.google.com/billing';

/**
 * Check if the Digital Goods API is available (TWA environment).
 */
export function isDigitalGoodsAvailable(): boolean {
  return typeof window.getDigitalGoodsService === 'function';
}

/**
 * Get product details from Google Play via Digital Goods API.
 * Returns null if API is unavailable.
 */
export async function getProductDetails(): Promise<DigitalGoodsItemDetails[] | null> {
  if (!isDigitalGoodsAvailable()) return null;

  try {
    const service = await window.getDigitalGoodsService!(PLAY_BILLING_METHOD);
    const details = await service.getDetails([
      PRODUCT_IDS.monthly,
      PRODUCT_IDS.yearly,
    ]);
    return details;
  } catch (err) {
    console.warn('[Billing] Digital Goods API getDetails failed:', err);
    return null;
  }
}

/**
 * Purchase a subscription via Digital Goods API (Payment Request).
 * Returns the purchase token on success, or null on failure/cancel.
 */
export async function purchaseWithDigitalGoods(plan: PlanType): Promise<string | null> {
  if (!isDigitalGoodsAvailable()) return null;

  const productId = PRODUCT_IDS[plan];

  try {
    const service = await window.getDigitalGoodsService!(PLAY_BILLING_METHOD);
    const details = await service.getDetails([productId]);

    if (!details || details.length === 0) {
      console.error('[Billing] Product not found:', productId);
      return null;
    }

    const item = details[0];

    const request = new PaymentRequest(
      [{
        supportedMethods: PLAY_BILLING_METHOD,
        data: { sku: item.itemId },
      }],
      {
        total: {
          label: item.title,
          amount: { currency: item.price.currency, value: item.price.value },
        },
      }
    );

    const response = await request.show();

    // Extract purchase token from response
    const { purchaseToken } = response.details as any;

    if (!purchaseToken) {
      console.error('[Billing] No purchaseToken in response');
      await response.complete('fail');
      return null;
    }

    // Acknowledge the purchase (repeatable = subscription)
    await service.acknowledge(purchaseToken, 'repeatable');
    await response.complete('success');

    console.log('[Billing] ✅ Digital Goods purchase successful:', productId);
    return purchaseToken;
  } catch (err: any) {
    // User cancelled or error
    if (err?.name === 'AbortError') {
      console.log('[Billing] User cancelled purchase');
    } else {
      console.error('[Billing] Digital Goods purchase error:', err);
    }
    return null;
  }
}

// ─── Unified Purchase Flow ───

/**
 * Main purchase function — tries Digital Goods API first, falls back to bridge.
 * Returns true if purchase was initiated successfully.
 */
export async function requestPurchase(
  plan: PlanType,
  onSuccess?: (productId: string) => void,
  onError?: (msg: string) => void,
): Promise<boolean> {
  const productId = PRODUCT_IDS[plan];

  // Strategy 1: Digital Goods API (TWA)
  if (isDigitalGoodsAvailable()) {
    const token = await purchaseWithDigitalGoods(plan);
    if (token) {
      // Activate subscription on server
      const activated = await activateOnServer(token, productId);
      if (activated) {
        onSuccess?.(productId);
      } else {
        onError?.('Failed to activate subscription');
      }
      return true;
    }
    // User cancelled — don't fallback
    return false;
  }

  // Strategy 2: Native bridge (AppMySite / WebView)
  return requestPurchaseViaBridge(plan);
}

// ─── Server Activation ───

async function activateOnServer(
  purchaseToken: string,
  productId: string,
  orderId?: string,
): Promise<boolean> {
  try {
    const user = await ensureAuthenticated();
    if (!user) return false;

    // Check for existing subscription
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const res = await supabase.functions.invoke('activate-subscription', {
      body: {
        subscriptionId: existing?.id || undefined,
        purchaseToken,
        productId,
        orderId: orderId || null,
      },
    });

    if (res.error) {
      console.error('[Billing] Server activation failed:', res.error.message);
      return false;
    }

    console.log('[Billing] ✅ Server activation successful');
    return true;
  } catch (err) {
    console.error('[Billing] Server activation error:', err);
    return false;
  }
}

// ─── Native Bridge (Legacy / Fallback) ───

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

function requestPurchaseViaBridge(plan: PlanType): boolean {
  const productId = PRODUCT_IDS[plan];
  const message: PurchaseMessage = { type: "PURCHASE_REQUEST", productId };

  if ((window as any).ReactNativeWebView?.postMessage) {
    (window as any).ReactNativeWebView.postMessage(JSON.stringify(message));
    return true;
  }
  if ((window as any).Android?.purchase) {
    (window as any).Android.purchase(productId);
    return true;
  }
  if ((window as any).webkit?.messageHandlers?.purchase) {
    (window as any).webkit.messageHandlers.purchase.postMessage(message);
    return true;
  }

  return false;
}

/**
 * Check if running inside a native app wrapper (TWA or WebView).
 */
export function isNativeApp(): boolean {
  return !!(
    isDigitalGoodsAvailable() ||
    (window as any).ReactNativeWebView ||
    (window as any).Android ||
    (window as any).webkit?.messageHandlers?.purchase
  );
}

// ─── Purchase Listener (for bridge-based flow) ───

let listenerActive = false;

/**
 * Listen for PURCHASE_SUCCESS messages from native wrapper.
 * Only needed for the bridge fallback — Digital Goods API handles its own flow.
 */
export function listenForPurchaseSuccess(
  onSuccess?: (productId: string) => void,
  onError?: (msg: string) => void,
): () => void {
  if (listenerActive) return () => {};
  listenerActive = true;

  const handler = async (event: MessageEvent) => {
    let data: any;
    try {
      data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
    } catch { return; }

    if (data?.type !== 'PURCHASE_SUCCESS') return;
    if (!data.purchaseToken || !data.productId) {
      onError?.('Invalid purchase payload');
      return;
    }

    const success = await activateOnServer(
      data.purchaseToken,
      data.productId,
      data.orderId,
    );
    if (success) {
      onSuccess?.(data.productId);
    } else {
      onError?.('Failed to activate subscription');
    }
  };

  window.addEventListener('message', handler);

  (window as any).onPurchaseSuccess = (token: string, productId: string, orderId?: string) => {
    activateOnServer(token, productId, orderId)
      .then(ok => ok ? onSuccess?.(productId) : onError?.('Activation failed'));
  };

  return () => {
    window.removeEventListener('message', handler);
    delete (window as any).onPurchaseSuccess;
    listenerActive = false;
  };
}
