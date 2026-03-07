/**
 * Google Play Billing Bridge
 * 
 * Product IDs (to be created in Google Play Console):
 * - premium_monthly: $2.99/month subscription
 * - premium_yearly: $19.99/year subscription
 * 
 * Both include a 3-day free trial.
 * 
 * Communication with the native Android wrapper (AppMySite or custom WebView)
 * is done via postMessage. The native layer listens for purchase requests
 * and handles Google Play Billing flow.
 */

export const PRODUCT_IDS = {
  monthly: "premium_monthly",
  yearly: "premium_yearly",
} as const;

export type PlanType = keyof typeof PRODUCT_IDS;

interface PurchaseMessage {
  type: "PURCHASE_REQUEST";
  productId: string;
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
