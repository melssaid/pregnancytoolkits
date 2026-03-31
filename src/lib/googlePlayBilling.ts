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

const PLAY_BILLING_METHODS = [
  'https://play.google.com/billing',
  'https://play.google.com/billing/v1',
];

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

// ─── Cached Service Connection ───
let cachedService: { service: DigitalGoodsService; method: string } | null = null;

/**
 * Try to connect to Digital Goods service, cycling through known method URLs.
 * Caches the result to avoid duplicate connections.
 */
async function getService(): Promise<{ service: DigitalGoodsService; method: string } | null> {
  if (cachedService) return cachedService;

  if (!isDigitalGoodsAvailable()) {
    console.warn('[Billing] Digital Goods API not available on this device');
    return null;
  }

  for (const method of PLAY_BILLING_METHODS) {
    try {
      console.log('[Billing] Attempting connection via:', method);
      const service = await window.getDigitalGoodsService!(method);
      if (service) {
        console.log('[Billing] ✅ Connected via', method);
        cachedService = { service, method };
        return cachedService;
      }
    } catch (err: any) {
      console.warn('[Billing] ❌ Failed with', method, ':', err?.name, err?.message);
    }
  }

  // Fallback: try canMakePayment to verify PaymentRequest works
  try {
    const testReq = new PaymentRequest(
      [{ supportedMethods: PLAY_BILLING_METHODS[0], data: { sku: 'test' } }],
      { total: { label: 'Test', amount: { currency: 'USD', value: '0' } } },
    );
    const canPay = await testReq.canMakePayment();
    console.log('[Billing] canMakePayment:', canPay);
  } catch (e) {
    console.warn('[Billing] canMakePayment check failed:', e);
  }

  // Log diagnostic info on failure
  console.error('[Billing] All billing methods failed. Diagnostics:', {
    userAgent: navigator.userAgent,
    isTWA: document.referrer?.includes('android-app://'),
    standalone: window.matchMedia?.('(display-mode: standalone)')?.matches,
  });

  return null;
}

/**
 * Run a full diagnostic check and log results.
 */
export async function runBillingDiagnostics(): Promise<{
  apiAvailable: boolean;
  serviceConnected: boolean;
  productsFound: string[];
  connectedMethod?: string;
  existingPurchases?: string[];
  error?: string;
}> {
  const result: any = {
    apiAvailable: isDigitalGoodsAvailable(),
    serviceConnected: false,
    productsFound: [],
  };

  if (!result.apiAvailable) {
    result.error = 'Digital Goods API not found — not running in TWA';
    console.log('[Billing Diagnostics]', result);
    return result;
  }

  try {
    const svc = await getService();
    if (!svc) {
      result.error = 'Could not connect to billing service';
      console.log('[Billing Diagnostics]', result);
      return result;
    }
    result.serviceConnected = true;
    result.connectedMethod = svc.method;

    const details = await svc.service.getDetails([PRODUCT_IDS.monthly, PRODUCT_IDS.yearly]);
    result.productsFound = details?.map(d => d.itemId) || [];
    
    // Also check existing purchases
    try {
      const purchases = await svc.service.listPurchases();
      result.existingPurchases = purchases?.map(p => p.itemId) || [];
    } catch (e) {
      console.warn('[Billing] listPurchases failed:', e);
    }
  } catch (err: any) {
    result.error = `${err?.name}: ${err?.message}`;
  }

  console.log('[Billing Diagnostics]', JSON.stringify(result, null, 2));
  return result;
}

/**
 * Get product details from Google Play.
 */
export async function getProductDetails(): Promise<DigitalGoodsItemDetails[] | null> {
  const svc = await getService();
  if (!svc) return null;

  try {
    const details = await svc.service.getDetails([PRODUCT_IDS.monthly, PRODUCT_IDS.yearly]);
    console.log('[Billing] Products:', details?.map(d => `${d.itemId} = ${d.price.value} ${d.price.currency}`));
    return details;
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
    const svc = await getService();
    if (!svc) {
      onError?.('لا يمكن الاتصال بخدمة الدفع — أعد تشغيل التطبيق');
      return false;
    }

    const details = await svc.service.getDetails([productId]);
    console.log('[Billing] Product details for', productId, ':', details);

    if (!details?.length) {
      onError?.('المنتج غير متوفر حالياً — حاول مرة أخرى لاحقاً');
      return false;
    }

    const item = details[0];
    const request = new PaymentRequest(
      [{ supportedMethods: svc.method, data: { sku: item.itemId } }],
      { total: { label: item.title, amount: { currency: item.price.currency, value: item.price.value } } },
    );

    const response = await request.show();
    const responseDetails = response.details as any;
    const purchaseToken = responseDetails?.purchaseToken || responseDetails?.token;
    const orderId = responseDetails?.orderId || responseDetails?.order_id;

    console.log('[Billing] Purchase response:', {
      hasPurchaseToken: !!purchaseToken,
      hasOrderId: !!orderId,
      detailKeys: responseDetails ? Object.keys(responseDetails) : [],
    });

    if (!purchaseToken) {
      console.error('[Billing] No purchaseToken in response. Full details:', JSON.stringify(responseDetails));
      await response.complete('fail');
      onError?.('No purchase token received');
      return false;
    }

    // Acknowledge purchase — 'onetime' for subscriptions (not 'repeatable' which is for consumables)
    try {
      await svc.service.acknowledge(purchaseToken, 'onetime');
      console.log('[Billing] ✅ Purchase acknowledged');
    } catch (ackErr: any) {
      console.warn('[Billing] Acknowledge failed (non-fatal):', ackErr?.message);
      // Continue — some implementations auto-acknowledge
    }

    // Activate on server BEFORE completing the PaymentRequest
    const activated = await activateOnServer(purchaseToken, productId, orderId);
    
    // Complete the payment response after server activation
    await response.complete(activated ? 'success' : 'fail');

    if (activated) {
      onSuccess?.(productId);
    } else {
      onError?.('Failed to activate subscription');
    }
    return activated;
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      console.log('[Billing] User cancelled');
    } else if (err?.name === 'NotAllowedError') {
      console.error('[Billing] Cross-origin frame blocked:', err);
      onError?.('يجب فتح التطبيق من Google Play وليس من المتصفح');
    } else {
      console.error('[Billing] Purchase error:', err?.name, err?.message, err);
      onError?.(err?.message || 'Purchase failed');
    }
    return false;
  }
}

// ─── Server Activation ───

async function activateOnServer(
  purchaseToken: string,
  productId: string,
  orderId?: string,
): Promise<boolean> {
  try {
    // Ensure user is authenticated — get existing session or sign in
    const { data: { user } } = await supabase.auth.getUser();
    let currentUser = user;

    if (!currentUser) {
      // Try to sign in anonymously without triggering redirects
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.error('[Billing] Auth failed:', error.message);
        // Still try to activate without auth as fallback
      } else {
        currentUser = data.user;
      }
    }

    if (!currentUser) {
      console.error('[Billing] No authenticated user — cannot activate');
      return false;
    }

    const { data: existing } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const res = await supabase.functions.invoke('activate-subscription', {
      body: {
        subscriptionId: existing?.id || undefined,
        purchaseToken,
        productId,
        orderId: orderId || undefined,
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
