/**
 * usePlayPrices
 * Temporary rollback to the old fixed-price logic.
 * No local currency fetch, no Digital Goods API reads.
 */

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

export function usePlayPrices(): PriceInfo & { loading: boolean } {
  return {
    ...FALLBACK,
    loading: false,
  };
}
