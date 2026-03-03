import { motion } from "framer-motion";

/**
 * Premium rocking baby in cradle — clean, natural look without harsh lines
 */
const RockingBabyIcon = ({ className = "w-10 h-10" }: { className?: string }) => {
  return (
    <motion.svg
      viewBox="0 0 56 56"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={{ rotate: [-3.5, 3.5, -3.5] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      style={{ originX: "50%", originY: "90%" }}
    >
      {/* Cradle rocker base */}
      <motion.path
        d="M8 49 Q28 42, 48 49"
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
        opacity={0.75}
      />

      {/* Cradle body — soft filled shape */}
      <path
        d="M14 44 L12 30 Q12 27, 15 27 L41 27 Q44 27, 44 30 L42 44 Z"
        fill="white"
        fillOpacity={0.12}
        stroke="white"
        strokeWidth={1.4}
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0.6}
      />

      {/* Cradle hood — subtle arc */}
      <path
        d="M15 27 Q15 17, 28 15 Q41 17, 41 27"
        stroke="white"
        strokeWidth={1.2}
        strokeLinecap="round"
        fill="white"
        fillOpacity={0.06}
        opacity={0.4}
      />

      {/* Blanket / swaddle — soft shape */}
      <path
        d="M17 42 Q17 35, 28 33 Q39 35, 39 42"
        fill="white"
        fillOpacity={0.2}
        stroke="white"
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.7}
      />

      {/* Baby head — soft circle */}
      <circle
        cx="28"
        cy="27"
        r="7.5"
        fill="white"
        fillOpacity={0.25}
        stroke="white"
        strokeWidth={1.4}
        opacity={0.9}
      />

      {/* Hair — soft wisps */}
      <path
        d="M22.5 22 Q24 18, 28 17.5 Q32 18, 33.5 22"
        stroke="white"
        strokeWidth={1.2}
        strokeLinecap="round"
        fill="none"
        opacity={0.5}
      />

      {/* Closed eyes — gentle arcs */}
      <motion.g
        animate={{ scaleY: [1, 0.15, 1] }}
        transition={{ duration: 4.5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
        style={{ originX: "28px", originY: "26px" }}
      >
        <path d="M24 26.5 Q25.5 24.5, 27 26.5" stroke="white" strokeWidth={1.3} strokeLinecap="round" fill="none" opacity={0.85} />
        <path d="M29 26.5 Q30.5 24.5, 32 26.5" stroke="white" strokeWidth={1.3} strokeLinecap="round" fill="none" opacity={0.85} />
      </motion.g>

      {/* Nose */}
      <path d="M27.5 28.5 Q28 29, 28.5 28.5" stroke="white" strokeWidth={0.9} strokeLinecap="round" opacity={0.4} />

      {/* Smile */}
      <path d="M26.5 30 Q28 31.2, 29.5 30" stroke="white" strokeWidth={1} strokeLinecap="round" opacity={0.55} />

      {/* Cheek glow */}
      <circle cx="24" cy="28.5" r="2" fill="white" fillOpacity={0.08} />
      <circle cx="32" cy="28.5" r="2" fill="white" fillOpacity={0.08} />

      {/* Floating Z's */}
      <motion.text
        x="40" y="18" fill="white" fontSize="8" fontWeight="bold" fontFamily="serif"
        animate={{ y: [18, 13, 18], opacity: [0.15, 0.5, 0.15], x: [40, 42, 40] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >z</motion.text>
      <motion.text
        x="44" y="12" fill="white" fontSize="6" fontWeight="bold" fontFamily="serif"
        animate={{ y: [12, 8, 12], opacity: [0.1, 0.35, 0.1], x: [44, 46, 44] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >z</motion.text>

      {/* Sparkle */}
      <motion.g
        animate={{ opacity: [0, 0.6, 0], scale: [0.6, 1, 0.6] }}
        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut" }}
        style={{ originX: "10px", originY: "14px" }}
      >
        <line x1="10" y1="11" x2="10" y2="17" stroke="white" strokeWidth={1} strokeLinecap="round" opacity={0.6} />
        <line x1="7" y1="14" x2="13" y2="14" stroke="white" strokeWidth={1} strokeLinecap="round" opacity={0.6} />
      </motion.g>

      {/* Dot star */}
      <motion.circle
        cx="46" cy="8" r="1.2" fill="white"
        animate={{ opacity: [0.1, 0.5, 0.1], scale: [0.7, 1.1, 0.7] }}
        transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.8, delay: 1.2, ease: "easeInOut" }}
      />
    </motion.svg>
  );
};

export default RockingBabyIcon;
