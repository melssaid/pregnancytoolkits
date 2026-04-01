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
  canMakePayment?: boolean;
  isTWA: boolean;
  isStandalone: boolean;
  displayMode: string;
  referrer: string;
  userAgent: string;
  chromeVersion?: string;
  androidVersion?: string;
  playStoreInstall: boolean;
  windowControlsOverlay: boolean;
  serviceWorkerActive: boolean;
  authStatus?: string;
  productDetails?: Array<{ id: string; title: string; price: string; type: string }>;
  error?: string;
  errors: string[];
  appVersionName?: string;
  appVersionCode?: string;
  installSource?: string;
  catalogReady: boolean;
  readinessScore: number;
  readinessSummary: string;
}> {
  const errors: string[] = [];

  // ── Environment checks ──
  const ua = navigator.userAgent;
  const chromeMatch = ua.match(/Chrome\/(\d+)/);
  const chromeVersion = chromeMatch ? chromeMatch[1] : undefined;
  const androidMatch = ua.match(/Android\s+([\d.]+)/);
  const androidVersion = androidMatch ? androidMatch[1] : undefined;
  const isTWA = document.referrer?.includes('android-app://') || false;
  const isStandalone = window.matchMedia?.('(display-mode: standalone)')?.matches || false;
  const displayMode = ['standalone', 'fullscreen', 'minimal-ui', 'browser']
    .find(m => window.matchMedia?.(`(display-mode: ${m})`)?.matches) || 'unknown';
  const playStoreInstall = isTWA || (isStandalone && ua.includes('Android'));
  const windowControlsOverlay = 'windowControlsOverlay' in navigator;
  const serviceWorkerActive = !!(navigator.serviceWorker?.controller);

  const result: any = {
    apiAvailable: isDigitalGoodsAvailable(),
    serviceConnected: false,
    productsFound: [],
    isTWA,
    isStandalone,
    displayMode,
    referrer: document.referrer || '(empty)',
    userAgent: ua,
    chromeVersion,
    androidVersion,
    playStoreInstall,
    windowControlsOverlay,
    serviceWorkerActive,
    errors,
    catalogReady: false,
    readinessScore: 0,
    readinessSummary: '',
  };

  // ── App version & install source ──
  try {
    const manifest = await fetch('/manifest.json').then(r => r.json()).catch(() => null);
    result.appVersionName = manifest?.version || (document.querySelector('meta[name="app-version"]') as HTMLMetaElement)?.content || 'unknown';
  } catch { result.appVersionName = 'unknown'; }

  // Install source detection
  if (isTWA) {
    result.installSource = 'Google Play (TWA)';
  } else if (isStandalone) {
    result.installSource = 'Installed PWA';
  } else {
    result.installSource = 'Browser';
  }

  // ── Auth check ──
  try {
    const { data: { user } } = await supabase.auth.getUser();
    result.authStatus = user ? `authenticated (${user.id.slice(0, 8)}…)` : 'not authenticated';
  } catch {
    result.authStatus = 'auth check failed';
  }

  // ── API availability ──
  if (!result.apiAvailable) {
    errors.push('Digital Goods API not found — not running in TWA');
    
    // Check canMakePayment as fallback signal
    try {
      const testReq = new PaymentRequest(
        [{ supportedMethods: PLAY_BILLING_METHODS[0], data: { sku: 'test' } }],
        { total: { label: 'Test', amount: { currency: 'USD', value: '0' } } },
      );
      result.canMakePayment = await testReq.canMakePayment();
    } catch {
      result.canMakePayment = false;
    }

    if (!isTWA) errors.push('Not launched as TWA (referrer missing android-app://)');
    if (chromeVersion && parseInt(chromeVersion) < 101) errors.push(`Chrome ${chromeVersion} too old — need 101+`);
    
    console.log('[Billing Diagnostics]', result);
    return result;
  }

  // ── Service connection ──
  try {
    const svc = await getService();
    if (!svc) {
      errors.push('Could not connect to billing service via any method');
      console.log('[Billing Diagnostics]', result);
      return result;
    }
    result.serviceConnected = true;
    result.connectedMethod = svc.method;

    // ── Product details ──
    try {
      const details = await svc.service.getDetails([PRODUCT_IDS.monthly, PRODUCT_IDS.yearly]);
      result.productsFound = details?.map(d => d.itemId) || [];
      result.productDetails = details?.map(d => ({
        id: d.itemId,
        title: d.title,
        price: `${d.price.value} ${d.price.currency}`,
        type: d.type,
      })) || [];
      if (!details?.length) {
        errors.push('getDetails returned empty — products may not be published/approved in Play Console');
      }
    } catch (e: any) {
      errors.push(`getDetails failed: ${e?.name}: ${e?.message}`);
    }

    // ── Existing purchases ──
    try {
      const purchases = await svc.service.listPurchases();
      result.existingPurchases = purchases?.map(p => p.itemId) || [];
    } catch (e: any) {
      errors.push(`listPurchases failed: ${e?.name}: ${e?.message}`);
    }

    // ── canMakePayment ──
    try {
      const testReq = new PaymentRequest(
        [{ supportedMethods: svc.method, data: { sku: PRODUCT_IDS.monthly } }],
        { total: { label: 'Test', amount: { currency: 'USD', value: '0' } } },
      );
      result.canMakePayment = await testReq.canMakePayment();
      if (!result.canMakePayment) errors.push('canMakePayment returned false');
    } catch (e: any) {
      result.canMakePayment = false;
      errors.push(`canMakePayment error: ${e?.name}: ${e?.message}`);
    }
  } catch (err: any) {
    errors.push(`Service error: ${err?.name}: ${err?.message}`);
  }

  console.log('[Billing Diagnostics]', JSON.stringify(result, null, 2));

  // ── Calculate readiness score ──
  let score = 0;
  const checks = [
    { pass: result.apiAvailable, weight: 20 },
    { pass: result.serviceConnected, weight: 20 },
    { pass: result.isTWA, weight: 15 },
    { pass: result.playStoreInstall, weight: 10 },
    { pass: result.canMakePayment === true, weight: 10 },
    { pass: result.productsFound?.length > 0, weight: 25 },
  ];
  for (const c of checks) { if (c.pass) score += c.weight; }
  result.readinessScore = score;
  result.catalogReady = result.productsFound?.length > 0;

  if (score === 100) {
    result.readinessSummary = 'READY';
  } else if (score >= 75) {
    result.readinessSummary = 'ALMOST_READY';
  } else if (score >= 40) {
    result.readinessSummary = 'PARTIAL';
  } else {
    result.readinessSummary = 'NOT_READY';
  }

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

    // Try fetching product details - first both, then individually
    let details = await svc.service.getDetails([productId]);
    console.log('[Billing] getDetails([' + productId + ']):', JSON.stringify(details));

    // If empty, try with all product IDs
    if (!details?.length) {
      console.log('[Billing] Retrying with all product IDs...');
      details = await svc.service.getDetails([PRODUCT_IDS.monthly, PRODUCT_IDS.yearly]);
      console.log('[Billing] getDetails(all):', JSON.stringify(details));
      // Filter to the one we want
      if (details?.length) {
        details = details.filter(d => d.itemId === productId);
      }
    }

    // If still empty, try listing existing purchases (product might already be owned)
    if (!details?.length) {
      console.log('[Billing] No products found. Checking listPurchases...');
      try {
        const purchases = await svc.service.listPurchases();
        console.log('[Billing] Existing purchases:', JSON.stringify(purchases));
        if (purchases?.some(p => p.itemId === productId)) {
          onError?.('لديك اشتراك نشط بالفعل في هذه الخطة');
          return false;
        }
      } catch (e) {
        console.warn('[Billing] listPurchases failed:', e);
      }

      // Try PaymentRequest directly without getDetails as last resort
      console.log('[Billing] Attempting direct PaymentRequest without getDetails...');
      try {
        const directRequest = new PaymentRequest(
          [{ supportedMethods: svc.method, data: { sku: productId } }],
          { total: { label: 'Premium Subscription', amount: { currency: 'USD', value: plan === 'monthly' ? '2.99' : '19.99' } } },
        );
        const canPay = await directRequest.canMakePayment();
        console.log('[Billing] Direct canMakePayment:', canPay);
        if (canPay) {
          const response = await directRequest.show();
          const responseDetails = response.details as any;
          const purchaseToken = responseDetails?.purchaseToken || responseDetails?.token;
          const orderId = responseDetails?.orderId || responseDetails?.order_id;
          console.log('[Billing] Direct purchase response:', { hasPurchaseToken: !!purchaseToken, hasOrderId: !!orderId });
          if (purchaseToken) {
            try { await svc.service.acknowledge(purchaseToken, 'onetime'); } catch {}
            const activated = await activateOnServer(purchaseToken, productId, orderId);
            await response.complete(activated ? 'success' : 'fail');
            if (activated) onSuccess?.(productId);
            else onError?.('Failed to activate subscription');
            return activated;
          }
          await response.complete('fail');
        }
      } catch (directErr: any) {
        console.warn('[Billing] Direct PaymentRequest failed:', directErr?.name, directErr?.message);
      }

      onError?.('المنتج غير متوفر حالياً — تأكد من تثبيت التطبيق من Google Play وأن الاشتراكات مفعّلة في المتجر');
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
