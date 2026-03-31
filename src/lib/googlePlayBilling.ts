/**
 * Google Play Billing — Digital Goods API (TWA Only)
 * 
 * Uses Digital Goods API + Payment Request API for purchases
 * inside a Trusted Web Activity (TWA). No WebView bridges.
 * 
 * Product IDs (Google Play Console):
 * - premium_monthly: $2.99/month
 * - yearly_premium: $19.99/year
 */

import { supabase } from '@/integrations/supabase/client';
import { ensureAuthenticated } from '@/lib/auth';

export const PRODUCT_IDS = {
  monthly: "premium_monthly",
  yearly: "yearly_premium",
} as const;

export type PlanType = keyof typeof PRODUCT_IDS;

// ─── Digital Goods API Types ───

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

const PLAY_BILLING_METHOD = 'https://play.google.com/billing';

/**
 * Check if Digital Goods API is available (TWA environment).
 */
export function isDigitalGoodsAvailable(): boolean {
  return typeof window.getDigitalGoodsService === 'function';
}

/**
 * Alias for isDigitalGoodsAvailable — returns true only in TWA.
 */
export function isNativeApp(): boolean {
  return isDigitalGoodsAvailable();
}

/**
 * Get product details from Google Play.
 */
export async function getProductDetails(): Promise<DigitalGoodsItemDetails[] | null> {
  if (!isDigitalGoodsAvailable()) return null;

  try {
    const service = await window.getDigitalGoodsService!(PLAY_BILLING_METHOD);
    return await service.getDetails([PRODUCT_IDS.monthly, PRODUCT_IDS.yearly]);
  } catch (err) {
    console.warn('[Billing] getDetails failed:', err);
    return null;
  }
}

/**
 * Purchase a subscription via Digital Goods API.
 * Returns true on success, false on cancel/error.
 */
export async function requestPurchase(
  plan: PlanType,
  onSuccess?: (productId: string) => void,
  onError?: (msg: string) => void,
): Promise<boolean> {
  const productId = PRODUCT_IDS[plan];

  if (!isDigitalGoodsAvailable()) {
    onError?.('Digital Goods API not available — open the app from Google Play');
    return false;
  }

  try {
    const service = await window.getDigitalGoodsService!(PLAY_BILLING_METHOD);
    const details = await service.getDetails([productId]);

    if (!details?.length) {
      onError?.('Product not found');
      return false;
    }

    const item = details[0];
    const request = new PaymentRequest(
      [{ supportedMethods: PLAY_BILLING_METHOD, data: { sku: item.itemId } }],
      { total: { label: item.title, amount: { currency: item.price.currency, value: item.price.value } } },
    );

    const response = await request.show();
    const { purchaseToken } = response.details as any;

    if (!purchaseToken) {
      await response.complete('fail');
      onError?.('No purchase token received');
      return false;
    }

    // Acknowledge purchase
    await service.acknowledge(purchaseToken, 'repeatable');
    await response.complete('success');

    // Activate on server
    const activated = await activateOnServer(purchaseToken, productId);
    if (activated) {
      onSuccess?.(productId);
    } else {
      onError?.('Failed to activate subscription');
    }
    return true;
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      console.log('[Billing] User cancelled');
    } else {
      console.error('[Billing] Purchase error:', err);
      onError?.(err?.message || 'Purchase failed');
    }
    return false;
  }
}

// ─── Server Activation ───

async function activateOnServer(
  purchaseToken: string,
  productId: string,
): Promise<boolean> {
  try {
    const user = await ensureAuthenticated();
    if (!user) return false;

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
      },
    });

    if (res.error) {
      console.error('[Billing] Activation failed:', res.error.message);
      return false;
    }

    console.log('[Billing] ✅ Subscription activated');
    return true;
  } catch (err) {
    console.error('[Billing] Activation error:', err);
    return false;
  }
}
