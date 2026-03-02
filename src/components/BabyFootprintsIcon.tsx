import { useState } from "react";
import { motion } from "framer-motion";
import { Footprints } from "lucide-react";

// ── Option 1: Single clean flat footprint ───────────────────────────────
const SingleFoot = ({ className = "w-9 h-9" }: { className?: string }) => (
  <motion.svg
    viewBox="0 0 24 28"
    fill="none"
    className={className}
    animate={{ scale: [1, 1.05, 1], rotate: [0, -2, 2, 0] }}
    transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut" }}
  >
    <path
      d="M8 24 C6 22, 5.5 18, 7 14 C8 10.5, 7.5 8, 9.5 6 C11.5 4, 14.5 4.5, 16 7 C17.5 9.5, 17 14, 16.5 18 C16 21, 17 23, 15.5 25 C14 27, 10 27, 8 24Z"
      fill="white"
    />
    <ellipse cx="6.5" cy="5.5" rx="2" ry="1.9" fill="white" />
    <ellipse cx="9.5" cy="3.5" rx="1.85" ry="1.75" fill="white" />
    <ellipse cx="12.8" cy="3" rx="1.7" ry="1.6" fill="white" />
    <ellipse cx="15.5" cy="4" rx="1.55" ry="1.5" fill="white" />
    <ellipse cx="17.5" cy="6" rx="1.4" ry="1.35" fill="white" />
  </motion.svg>
);

// ── Option 2: Two facing footprints ─────────────────────────────────────
const TwoFeet = ({ className = "w-9 h-9" }: { className?: string }) => (
  <svg viewBox="0 0 40 30" fill="none" className={className}>
    <motion.g
      animate={{ y: [0, -2, 0, 0], opacity: [0.8, 1, 0.8, 0.8] }}
      transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 0.6, ease: "easeInOut", times: [0, 0.25, 0.4, 1] }}
      style={{ transformOrigin: "12px 16px" }}
    >
      <g transform="rotate(-8, 10, 15)">
        <path d="M6 24 C4 22, 3.5 18, 5 14 C6 11, 5.5 8, 7.5 6 C9.5 4, 12.5 4.5, 14 7 C15.5 9.5, 15 14, 14.5 18 C14 21, 15 23, 13.5 25 C12 27, 8 27, 6 24Z" fill="white" />
        <ellipse cx="4.5" cy="5.5" rx="1.8" ry="1.7" fill="white" />
        <ellipse cx="7.3" cy="3.8" rx="1.65" ry="1.55" fill="white" />
        <ellipse cx="10.2" cy="3.2" rx="1.5" ry="1.45" fill="white" />
        <ellipse cx="12.8" cy="4" rx="1.4" ry="1.35" fill="white" />
        <ellipse cx="14.8" cy="5.8" rx="1.25" ry="1.2" fill="white" />
      </g>
    </motion.g>
    <motion.g
      animate={{ y: [0, 0, -2, 0], opacity: [0.8, 0.8, 1, 0.8] }}
      transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 0.6, ease: "easeInOut", times: [0, 0.4, 0.65, 1] }}
      style={{ transformOrigin: "28px 14px" }}
    >
      <g transform="translate(20, -2) scale(-1, 1) translate(-18, 0) rotate(8, 10, 15)">
        <path d="M6 24 C4 22, 3.5 18, 5 14 C6 11, 5.5 8, 7.5 6 C9.5 4, 12.5 4.5, 14 7 C15.5 9.5, 15 14, 14.5 18 C14 21, 15 23, 13.5 25 C12 27, 8 27, 6 24Z" fill="white" />
        <ellipse cx="4.5" cy="5.5" rx="1.8" ry="1.7" fill="white" />
        <ellipse cx="7.3" cy="3.8" rx="1.65" ry="1.55" fill="white" />
        <ellipse cx="10.2" cy="3.2" rx="1.5" ry="1.45" fill="white" />
        <ellipse cx="12.8" cy="4" rx="1.4" ry="1.35" fill="white" />
        <ellipse cx="14.8" cy="5.8" rx="1.25" ry="1.2" fill="white" />
      </g>
    </motion.g>
  </svg>
);

// ── Option 3: Footprint inside heart ────────────────────────────────────
const FootInHeart = ({ className = "w-9 h-9" }: { className?: string }) => (
  <motion.svg
    viewBox="0 0 28 28"
    fill="none"
    className={className}
    animate={{ scale: [1, 1.08, 1, 1.06, 1] }}
    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
  >
    {/* Heart outline */}
    <path
      d="M14 26 C14 26, 2 18, 2 10 C2 6, 5 3, 8.5 3 C10.5 3, 12.5 4, 14 6 C15.5 4, 17.5 3, 19.5 3 C23 3, 26 6, 26 10 C26 18, 14 26, 14 26Z"
      fill="none"
      stroke="white"
      strokeWidth="1.2"
      opacity={0.6}
    />
    {/* Small foot inside */}
    <g transform="translate(7.5, 6) scale(0.55)">
      <path d="M8 24 C6 22, 5.5 18, 7 14 C8 10.5, 7.5 8, 9.5 6 C11.5 4, 14.5 4.5, 16 7 C17.5 9.5, 17 14, 16.5 18 C16 21, 17 23, 15.5 25 C14 27, 10 27, 8 24Z" fill="white" />
      <ellipse cx="6.5" cy="5.5" rx="2" ry="1.9" fill="white" />
      <ellipse cx="9.5" cy="3.5" rx="1.85" ry="1.75" fill="white" />
      <ellipse cx="12.8" cy="3" rx="1.7" ry="1.6" fill="white" />
      <ellipse cx="15.5" cy="4" rx="1.55" ry="1.5" fill="white" />
      <ellipse cx="17.5" cy="6" rx="1.4" ry="1.35" fill="white" />
    </g>
  </motion.svg>
);

// ── Option 4: Lucide Footprints icon ────────────────────────────────────
const LucideFoot = ({ className = "w-9 h-9" }: { className?: string }) => (
  <motion.div
    className={className + " flex items-center justify-center"}
    animate={{ scale: [1, 1.06, 1], rotate: [0, -3, 3, 0] }}
    transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }}
  >
    <Footprints className="w-full h-full text-white" strokeWidth={1.75} />
  </motion.div>
);

// ── Export map for preview page ──────────────────────────────────────────
export const footprintOptions = {
  single: SingleFoot,
  twoFeet: TwoFeet,
  heartFoot: FootInHeart,
  lucide: LucideFoot,
};

export type FootprintStyle = keyof typeof footprintOptions;

// ── Default export — reads chosen style from localStorage ───────────────
const FOOTPRINT_STYLE_KEY = "footprint-icon-style";

const BabyFootprintsIcon = ({ className = "w-9 h-9" }: { className?: string }) => {
  const [style] = useState<FootprintStyle>(() => {
    try {
      const saved = localStorage.getItem(FOOTPRINT_STYLE_KEY);
      if (saved && saved in footprintOptions) return saved as FootprintStyle;
    } catch {}
    return "twoFeet";
  });

  const Component = footprintOptions[style];
  return <Component className={className} />;
};

export default BabyFootprintsIcon;
