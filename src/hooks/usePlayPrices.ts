/**
 * usePlayPrices
 * Fetches real local-currency prices from Digital Goods API.
 * Falls back to hardcoded USD prices when not in TWA.
 */
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getProductDetails, PRODUCT_IDS, isDigitalGoodsAvailable } from "@/lib/googlePlayBilling";

interface PriceInfo {
  monthly: { value: string; currency: string; display: string };
  yearly: { value: string; currency: string; display: string };
  monthlyEquivalent: string; // yearly price / 12
  isLocal: boolean; // true if fetched from Play (real local currency), false if generic placeholder
}

/**
 * Default USD fallback shown when Digital Goods API is unavailable (web preview).
 * Inside the Android TWA, real local-currency prices from Play override these.
 */
const FALLBACK: PriceInfo = {
  monthly: { value: "2.99", currency: "USD", display: "$2.99" },
  yearly: { value: "19.99", currency: "USD", display: "$19.99" },
  monthlyEquivalent: "$1.67",
  isLocal: false,
};

function formatPrice(value: string, currency: string, locale: string): string {
  try {
    // Use the user's UI locale so that the currency symbol/format matches
    // their language (e.g. "11.25 ر.س" in Arabic, "SAR 11.25" in English,
    // "11,25 €" in French). The currency code itself always comes from
    // Google Play, guaranteeing it matches what Play will charge at checkout.
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      // Force Western digits even for Arabic locale (matches our pricing standard)
      numberingSystem: "latn",
    } as Intl.NumberFormatOptions).format(parseFloat(value));
  } catch {
    return `${value} ${currency}`;
  }
}

export function usePlayPrices(): PriceInfo & { loading: boolean } {
  const { i18n } = useTranslation();
  const [prices, setPrices] = useState<PriceInfo>(FALLBACK);
  const [loading, setLoading] = useState(isDigitalGoodsAvailable());
  const locale = i18n.language || "en";

  useEffect(() => {
    if (!isDigitalGoodsAvailable()) return;

    let cancelled = false;

    // Safety timeout: if Play prices don't arrive within 5s, stop loading
    // and keep showing the USD fallback so the UI never gets stuck.
    const timeoutId = setTimeout(() => {
      if (!cancelled) {
        console.warn("[usePlayPrices] Timeout (5s) — falling back to default USD prices");
        cancelled = true;
        setLoading(false);
      }
    }, 5000);

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
              display: formatPrice(monthlyItem.price.value, monthlyItem.price.currency, locale),
            },
            yearly: {
              value: yearlyItem.price.value,
              currency: yearlyItem.price.currency,
              display: formatPrice(yearlyItem.price.value, yearlyItem.price.currency, locale),
            },
            monthlyEquivalent: formatPrice(monthlyEq, yearlyItem.price.currency, locale),
            isLocal: true,
          });
        }
      } catch (e) {
        console.warn("[usePlayPrices] Failed to fetch:", e);
      } finally {
        if (!cancelled) setLoading(false);
        clearTimeout(timeoutId);
      }
    })();
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [locale]);

  return { ...prices, loading };
}
