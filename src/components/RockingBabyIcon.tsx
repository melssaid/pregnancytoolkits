import { motion } from "framer-motion";

/**
 * Large, clear rocking baby in cradle — bold visible features
 */
const RockingBabyIcon = ({ className = "w-14 h-14" }: { className?: string }) => {
  return (
    <motion.svg
      viewBox="0 0 80 80"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={{ rotate: [-3, 3, -3] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      style={{ originX: "50%", originY: "88%" }}
    >
      {/* ── Rocker base ── */}
      <path
        d="M12 70 Q40 60, 68 70"
        stroke="white"
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
        opacity={0.85}
      />

      {/* ── Cradle body ── */}
      <path
        d="M20 62 L17 40 Q17 36, 22 36 L58 36 Q63 36, 63 40 L60 62 Z"
        fill="white"
        fillOpacity={0.15}
        stroke="white"
        strokeWidth={2.2}
        strokeLinejoin="round"
        opacity={0.85}
      />

      {/* ── Cradle hood ── */}
      <path
        d="M22 36 Q22 22, 40 19 Q58 22, 58 36"
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
        fill="white"
        fillOpacity={0.08}
        opacity={0.55}
      />

      {/* ── Blanket ── */}
      <path
        d="M24 60 Q24 48, 40 45 Q56 48, 56 60"
        fill="white"
        fillOpacity={0.22}
        stroke="white"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.8}
      />
      {/* Blanket fold */}
      <path
        d="M28 54 Q40 57, 52 54"
        stroke="white"
        strokeWidth={1.2}
        strokeLinecap="round"
        opacity={0.3}
      />

      {/* ── Baby head ── */}
      <circle
        cx="40"
        cy="35"
        r="11"
        fill="white"
        fillOpacity={0.28}
        stroke="white"
        strokeWidth={2.2}
        opacity={0.95}
      />

      {/* ── Hair ── */}
      <path
        d="M32 28 Q35 22, 40 21 Q45 22, 48 28"
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
        opacity={0.6}
      />
      <path
        d="M34 25 Q40 20, 46 25"
        stroke="white"
        strokeWidth={1.2}
        strokeLinecap="round"
        fill="none"
        opacity={0.3}
      />

      {/* ── Closed eyes ── */}
      <motion.g
        animate={{ scaleY: [1, 0.1, 1] }}
        transition={{ duration: 5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
        style={{ originX: "40px", originY: "34px" }}
      >
        {/* Left eye */}
        <path
          d="M33 34 Q35.5 31, 38 34"
          stroke="white"
          strokeWidth={2}
          strokeLinecap="round"
          fill="none"
          opacity={0.9}
        />
        {/* Right eye */}
        <path
          d="M42 34 Q44.5 31, 47 34"
          stroke="white"
          strokeWidth={2}
          strokeLinecap="round"
          fill="none"
          opacity={0.9}
        />
      </motion.g>

      {/* ── Eyelashes ── */}
      <line x1="32.5" y1="33.5" x2="31.5" y2="32" stroke="white" strokeWidth={1.2} strokeLinecap="round" opacity={0.45} />
      <line x1="47.5" y1="33.5" x2="48.5" y2="32" stroke="white" strokeWidth={1.2} strokeLinecap="round" opacity={0.45} />

      {/* ── Nose ── */}
      <path
        d="M39 37.5 Q40 38.5, 41 37.5"
        stroke="white"
        strokeWidth={1.3}
        strokeLinecap="round"
        opacity={0.5}
      />

      {/* ── Smile ── */}
      <path
        d="M37 40 Q40 42, 43 40"
        stroke="white"
        strokeWidth={1.5}
        strokeLinecap="round"
        opacity={0.7}
      />

      {/* ── Cheeks ── */}
      <circle cx="33" cy="37.5" r="2.5" fill="white" fillOpacity={0.1} />
      <circle cx="47" cy="37.5" r="2.5" fill="white" fillOpacity={0.1} />

      {/* ── Tiny hand ── */}
      <path
        d="M32 49 Q30.5 47.5, 31.5 46 Q32.5 47, 34 47.5"
        stroke="white"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity={0.5}
      />

      {/* ── Z's ── */}
      <motion.text
        x="56" y="24" fill="white" fontSize="10" fontWeight="bold" fontFamily="serif"
        animate={{ y: [24, 18, 24], opacity: [0.1, 0.5, 0.1], x: [56, 58, 56] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >z</motion.text>
      <motion.text
        x="61" y="16" fill="white" fontSize="7.5" fontWeight="bold" fontFamily="serif"
        animate={{ y: [16, 11, 16], opacity: [0.08, 0.35, 0.08], x: [61, 63, 61] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >z</motion.text>

      {/* ── Sparkle ── */}
      <motion.g
        animate={{ opacity: [0, 0.65, 0], scale: [0.5, 1, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut" }}
        style={{ originX: "14px", originY: "20px" }}
      >
        <line x1="14" y1="16" x2="14" y2="24" stroke="white" strokeWidth={1.3} strokeLinecap="round" opacity={0.65} />
        <line x1="10" y1="20" x2="18" y2="20" stroke="white" strokeWidth={1.3} strokeLinecap="round" opacity={0.65} />
      </motion.g>

      <motion.circle
        cx="64" cy="12" r="1.5" fill="white"
        animate={{ opacity: [0.1, 0.55, 0.1], scale: [0.7, 1.2, 0.7] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 2, delay: 1, ease: "easeInOut" }}
      />
    </motion.svg>
  );
};

export default RockingBabyIcon;
