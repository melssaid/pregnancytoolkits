/**
 * PriceSkeleton — Animated shimmer placeholder shown while Google Play
 * Digital Goods API resolves real local-currency prices.
 */
import { motion } from "framer-motion";

interface Props {
  /** width in pixels (controls skeleton bar width) */
  width?: number;
  /** height in pixels (controls skeleton bar height) */
  height?: number;
  className?: string;
}

export function PriceSkeleton({ width = 64, height = 22, className = "" }: Props) {
  return (
    <motion.span
      aria-busy="true"
      aria-label="Loading price"
      className={`inline-block rounded-md bg-gradient-to-r from-muted via-muted/40 to-muted bg-[length:200%_100%] ${className}`}
      style={{ width, height }}
      animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
    />
  );
}
