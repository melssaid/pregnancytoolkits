/**
 * usePlayPrices
 *
 * Fetches localized prices from Google Play Billing (Digital Goods API)
 * so users see the price in their local currency (EGP, SAR, EUR, etc.).
 *
 * Falls back to USD defaults if:
 * - Not running inside the TWA / Play Billing not available
 * - Digital Goods API unavailable (browser, desktop)
 * - getDetails() fails or times out
 */

import { useEffect, useState } from "react";
import { getProductDetails, isDigitalGoodsAvailable } from "@/lib/googlePlayBilling";

interface PriceInfo {
  monthly: { value: string; currency: string; display: string };
  yearly: { value: string; currency: string; display: string };
  monthlyEquivalent: string;
  isLocal: boolean;
}

const FALLBACK: PriceInfo = {
  monthly: { value: "2.99", currency: "USD", display: "$2.99" },
  yearly: { value: "19.99", currency: "USD", display: "$19.99" },
  monthlyEquivalent: "$1.67",
  isLocal: false,
};

// Format number with currency symbol based on locale
function formatPrice(value: string, currency: string): string {
  const num = parseFloat(value);
  if (isNaN(num)) return `${currency} ${value}`;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(num);
  } catch {
    return `${currency} ${num.toFixed(2)}`;
  }
}

// Compute monthly equivalent of yearly price (yearly / 12)
function computeMonthlyEquivalent(yearlyValue: string, currency: string): string {
  const num = parseFloat(yearlyValue);
  if (isNaN(num)) return formatPrice("1.67", currency);
  return formatPrice((num / 12).toFixed(2), currency);
}

// Cache key (per session) to avoid re-querying on every render
const CACHE_KEY = "pt:play-prices:v1";

function readCache(): PriceInfo | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(p: PriceInfo) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(p));
  } catch {
    /* quota or disabled — ignore */
  }
}

export function usePlayPrices(): PriceInfo & { loading: boolean } {
  const cached = readCache();
  const [prices, setPrices] = useState<PriceInfo>(cached || FALLBACK);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    if (cached) return; // already have local prices for this session
    if (!isDigitalGoodsAvailable()) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    // Hard timeout — never block the UI longer than 3.5s
    const timeoutId = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 3500);

    (async () => {
      try {
        const details = await getProductDetails();

        if (cancelled) return;

        if (!details || details.length === 0) {
          setLoading(false);
          return;
        }

        const monthly = details.find((d) => d.itemId === "premium_monthly");
        const yearly = details.find((d) => d.itemId === "premium_yearly");

        if (!monthly || !yearly) {
          setLoading(false);
          return;
        }

        const monthlyValue = String(monthly.price?.value ?? "2.99");
        const monthlyCurrency = String(monthly.price?.currency ?? "USD");
        const yearlyValue = String(yearly.price?.value ?? "19.99");
        const yearlyCurrency = String(yearly.price?.currency ?? "USD");

        const next: PriceInfo = {
          monthly: {
            value: monthlyValue,
            currency: monthlyCurrency,
            display: formatPrice(monthlyValue, monthlyCurrency),
          },
          yearly: {
            value: yearlyValue,
            currency: yearlyCurrency,
            display: formatPrice(yearlyValue, yearlyCurrency),
          },
          monthlyEquivalent: computeMonthlyEquivalent(yearlyValue, yearlyCurrency),
          isLocal: true,
        };

        setPrices(next);
        writeCache(next);
      } catch {
        // silent fallback to FALLBACK already set
      } finally {
        if (!cancelled) setLoading(false);
        clearTimeout(timeoutId);
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [cached]);

  return { ...prices, loading };
}
