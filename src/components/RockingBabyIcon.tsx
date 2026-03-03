import { motion } from "framer-motion";

/**
 * Realistic animated rocking baby icon — detailed line-art style
 * with swaddle wrapping, facial features, and gentle cradle rocking
 */
const RockingBabyIcon = ({ className = "w-8 h-8" }: { className?: string }) => {
  return (
    <motion.svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={{ rotate: [-3, 3, -3] }}
      transition={{
        duration: 2.8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{ originX: "50%", originY: "85%" }}
    >
      {/* Cradle base — curved rocker */}
      <motion.path
        d="M12 54 C12 54, 20 48, 32 48 C44 48, 52 54, 52 54"
        stroke="white"
        strokeWidth={2.2}
        strokeLinecap="round"
        fill="none"
        strokeOpacity={0.7}
      />
      {/* Cradle left side */}
      <path
        d="M16 48 L14 34 C14 32, 15 30, 17 30"
        stroke="white"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeOpacity={0.6}
      />
      {/* Cradle right side */}
      <path
        d="M48 48 L50 34 C50 32, 49 30, 47 30"
        stroke="white"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeOpacity={0.6}
      />
      {/* Cradle hood/canopy */}
      <path
        d="M17 30 C17 22, 22 18, 32 18 C42 18, 47 22, 47 30"
        stroke="white"
        strokeWidth={1.6}
        strokeLinecap="round"
        fill="none"
        strokeOpacity={0.4}
      />
      {/* Blanket body in cradle */}
      <motion.path
        d="M19 46 C19 38, 20 32, 32 31 C44 32, 45 38, 45 46 Z"
        fill="white"
        fillOpacity={0.15}
        stroke="white"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Blanket fold detail */}
      <path
        d="M22 40 C26 42, 38 42, 42 40"
        stroke="white"
        strokeWidth={1}
        strokeLinecap="round"
        strokeOpacity={0.35}
      />
      {/* Blanket fold detail 2 */}
      <path
        d="M24 44 C28 45, 36 45, 40 44"
        stroke="white"
        strokeWidth={0.8}
        strokeLinecap="round"
        strokeOpacity={0.25}
      />

      {/* Baby head */}
      <motion.circle
        cx="32"
        cy="26"
        r="8"
        fill="white"
        fillOpacity={0.2}
        stroke="white"
        strokeWidth={1.8}
      />

      {/* Hair wisps */}
      <path
        d="M26 20 C27 17, 30 16, 32 16 C34 16, 37 17, 38 20"
        stroke="white"
        strokeWidth={1.2}
        strokeLinecap="round"
        fill="none"
        strokeOpacity={0.5}
      />
      <path
        d="M28 18 C30 15.5, 34 15.5, 36 18"
        stroke="white"
        strokeWidth={0.8}
        strokeLinecap="round"
        fill="none"
        strokeOpacity={0.3}
      />

      {/* Left eye — closed, realistic arc */}
      <motion.path
        d="M28 25 C28.5 23.8, 30 23.5, 30.5 25"
        stroke="white"
        strokeWidth={1.2}
        strokeLinecap="round"
        animate={{ scaleY: [1, 0.2, 1] }}
        transition={{ duration: 4, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
        style={{ originX: "29.25px", originY: "24.5px" }}
      />

      {/* Right eye — closed, realistic arc */}
      <motion.path
        d="M33.5 25 C34 23.8, 35.5 23.5, 36 25"
        stroke="white"
        strokeWidth={1.2}
        strokeLinecap="round"
        animate={{ scaleY: [1, 0.2, 1] }}
        transition={{ duration: 4, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
        style={{ originX: "34.75px", originY: "24.5px" }}
      />

      {/* Left eyelash */}
      <path
        d="M28.2 24.5 L27.5 23.8"
        stroke="white"
        strokeWidth={0.6}
        strokeLinecap="round"
        strokeOpacity={0.4}
      />
      {/* Right eyelash */}
      <path
        d="M35.8 24.5 L36.5 23.8"
        stroke="white"
        strokeWidth={0.6}
        strokeLinecap="round"
        strokeOpacity={0.4}
      />

      {/* Nose — tiny subtle */}
      <path
        d="M31.5 27 C31.8 27.5, 32.2 27.5, 32.5 27"
        stroke="white"
        strokeWidth={0.8}
        strokeLinecap="round"
        strokeOpacity={0.5}
      />

      {/* Mouth — peaceful smile */}
      <path
        d="M30 29 C30.8 30, 33.2 30, 34 29"
        stroke="white"
        strokeWidth={0.9}
        strokeLinecap="round"
        strokeOpacity={0.6}
      />

      {/* Cheek blush left */}
      <circle cx="27.5" cy="27.5" r="1.5" fill="white" fillOpacity={0.12} />
      {/* Cheek blush right */}
      <circle cx="36.5" cy="27.5" r="1.5" fill="white" fillOpacity={0.12} />

      {/* Baby hand peeking from blanket */}
      <path
        d="M26 38 C25 37, 24.5 36, 25 35 C25.5 35.5, 26.5 36, 27 36.5"
        stroke="white"
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeOpacity={0.5}
      />

      {/* Z's for sleeping — floating up */}
      <motion.text
        x="44"
        y="20"
        fill="white"
        fillOpacity={0.5}
        fontSize="7"
        fontWeight="bold"
        fontFamily="serif"
        animate={{
          y: [20, 15, 20],
          opacity: [0.2, 0.6, 0.2],
          x: [44, 46, 44],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        z
      </motion.text>
      <motion.text
        x="48"
        y="14"
        fill="white"
        fillOpacity={0.35}
        fontSize="5"
        fontWeight="bold"
        fontFamily="serif"
        animate={{
          y: [14, 10, 14],
          opacity: [0.15, 0.4, 0.15],
          x: [48, 50, 48],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
      >
        z
      </motion.text>

      {/* Sparkle — gentle twinkle */}
      <motion.g
        animate={{ opacity: [0, 0.8, 0], scale: [0.5, 1, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
        style={{ originX: "50px", originY: "10px" }}
      >
        <line x1="50" y1="7" x2="50" y2="13" stroke="white" strokeWidth={1} strokeLinecap="round" strokeOpacity={0.6} />
        <line x1="47" y1="10" x2="53" y2="10" stroke="white" strokeWidth={1} strokeLinecap="round" strokeOpacity={0.6} />
      </motion.g>

      {/* Small star */}
      <motion.circle
        cx="14"
        cy="16"
        r="1"
        fill="white"
        fillOpacity={0.5}
        animate={{ opacity: [0.2, 0.7, 0.2], scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5, delay: 1, ease: "easeInOut" }}
      />
    </motion.svg>
  );
};

export default RockingBabyIcon;
