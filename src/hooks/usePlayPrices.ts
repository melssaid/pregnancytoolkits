/**
 * usePlayPrices
 * Fetches real local-currency prices from Digital Goods API.
 * Falls back to hardcoded USD prices when not in TWA.
 */
import { useState, useEffect } from "react";
import { getProductDetails, PRODUCT_IDS, isDigitalGoodsAvailable } from "@/lib/googlePlayBilling";

interface PriceInfo {
  monthly: { value: string; currency: string; display: string };
  yearly: { value: string; currency: string; display: string };
  monthlyEquivalent: string; // yearly price / 12
  isLocal: boolean; // true if fetched from Play (real local currency), false if generic placeholder
}

/**
 * Generic placeholder shown ONLY when Digital Goods API is unavailable (web preview).
 * We avoid showing a hard-coded "$" price because Play Store will charge the user's
 * local currency (EUR, SAR, EGP, etc.). Showing USD on web while Play shows EUR
 * violates Google Play Subscriptions Policy ("Pricing currency mismatch").
 *
 * Solution: show a neutral "—" placeholder until real Play prices arrive.
 * Real prices ALWAYS come from Digital Goods API inside the TWA, formatted with
 * the currency code Play returns, so checkout currency matches displayed currency.
 */
const PLACEHOLDER: PriceInfo = {
  monthly: { value: "", currency: "", display: "—" },
  yearly: { value: "", currency: "", display: "—" },
  monthlyEquivalent: "—",
  isLocal: false,
};

function formatPrice(value: string, currency: string): string {
  try {
    // Use 'en' numbering (Western digits) but keep the REAL currency code returned
    // by Google Play. This guarantees the symbol/code shown to the user matches
    // what Play will charge at checkout (e.g. "€2.99", "SAR 11.99", "EGP 149").
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(parseFloat(value));
  } catch {
    return `${value} ${currency}`;
  }
}

export function usePlayPrices(): PriceInfo & { loading: boolean } {
  const [prices, setPrices] = useState<PriceInfo>(PLACEHOLDER);
  const [loading, setLoading] = useState(isDigitalGoodsAvailable());

  useEffect(() => {
    if (!isDigitalGoodsAvailable()) return;

    let cancelled = false;
    (async () => {
      try {
        const details = await getProductDetails();
        if (cancelled || !details?.length) {
          setLoading(false);
          return;
        }

        const monthlyItem = details.find(d => d.itemId === PRODUCT_IDS.monthly);
        const yearlyItem = details.find(d => d.itemId === PRODUCT_IDS.yearly);

        if (monthlyItem && yearlyItem) {
          const yearlyVal = parseFloat(yearlyItem.price.value);
          const monthlyEq = (yearlyVal / 12).toFixed(2);

          setPrices({
            monthly: {
              value: monthlyItem.price.value,
              currency: monthlyItem.price.currency,
              display: formatPrice(monthlyItem.price.value, monthlyItem.price.currency),
            },
            yearly: {
              value: yearlyItem.price.value,
              currency: yearlyItem.price.currency,
              display: formatPrice(yearlyItem.price.value, yearlyItem.price.currency),
            },
            monthlyEquivalent: formatPrice(monthlyEq, yearlyItem.price.currency),
            isLocal: true,
          });
        }
      } catch (e) {
        console.warn("[usePlayPrices] Failed to fetch:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { ...prices, loading };
}
