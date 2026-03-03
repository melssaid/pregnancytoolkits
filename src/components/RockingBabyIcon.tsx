import { motion } from "framer-motion";

/**
 * Animated rocking baby icon — premium line-art style
 * Gentle rocking motion symbolizing the dream of motherhood
 */
const RockingBabyIcon = ({ className = "w-8 h-8" }: { className?: string }) => {
  return (
    <motion.svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={{ rotate: [-4, 4, -4] }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{ originX: "50%", originY: "80%" }}
    >
      {/* Blanket / swaddle body */}
      <motion.path
        d="M14 22 C14 18, 16 14, 24 13 C32 14, 34 18, 34 22 L36 36 C36 38, 34 40, 30 40 L18 40 C14 40, 12 38, 12 36 Z"
        fill="white"
        fillOpacity={0.25}
        stroke="white"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Blanket fold line */}
      <path
        d="M16 26 C20 28, 28 28, 32 26"
        stroke="white"
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeOpacity={0.5}
      />

      {/* Baby head */}
      <motion.circle
        cx="24"
        cy="13"
        r="7"
        fill="white"
        fillOpacity={0.3}
        stroke="white"
        strokeWidth={1.8}
      />

      {/* Sleeping eyes — left */}
      <motion.path
        d="M20.5 13 C21 12, 22 12, 22.5 13"
        stroke="white"
        strokeWidth={1.3}
        strokeLinecap="round"
        animate={{ scaleY: [1, 0.3, 1] }}
        transition={{ duration: 4, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
        style={{ originX: "21.5px", originY: "12.5px" }}
      />

      {/* Sleeping eyes — right */}
      <motion.path
        d="M25.5 13 C26 12, 27 12, 27.5 13"
        stroke="white"
        strokeWidth={1.3}
        strokeLinecap="round"
        animate={{ scaleY: [1, 0.3, 1] }}
        transition={{ duration: 4, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
        style={{ originX: "26.5px", originY: "12.5px" }}
      />

      {/* Tiny smile */}
      <path
        d="M22.5 15.5 C23 16.2, 25 16.2, 25.5 15.5"
        stroke="white"
        strokeWidth={1}
        strokeLinecap="round"
        strokeOpacity={0.7}
      />

      {/* Rocker base */}
      <motion.path
        d="M10 42 C16 38, 32 38, 38 42"
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
        strokeOpacity={0.6}
      />

      {/* Sparkle — top right */}
      <motion.g
        animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }}
        style={{ originX: "38px", originY: "8px" }}
      >
        <line x1="38" y1="5" x2="38" y2="11" stroke="white" strokeWidth={1.2} strokeLinecap="round" strokeOpacity={0.8} />
        <line x1="35" y1="8" x2="41" y2="8" stroke="white" strokeWidth={1.2} strokeLinecap="round" strokeOpacity={0.8} />
      </motion.g>

      {/* Sparkle — top left */}
      <motion.g
        animate={{ opacity: [0, 0.8, 0], scale: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 2, delay: 1, ease: "easeInOut" }}
        style={{ originX: "10px", originY: "7px" }}
      >
        <circle cx="10" cy="7" r="1.2" fill="white" fillOpacity={0.7} />
      </motion.g>

      {/* Z's for sleeping */}
      <motion.text
        x="34"
        y="10"
        fill="white"
        fillOpacity={0.6}
        fontSize="6"
        fontWeight="bold"
        fontFamily="system-ui"
        animate={{ 
          y: [10, 6, 10],
          opacity: [0.3, 0.7, 0.3],
          x: [34, 36, 34]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        z
      </motion.text>
      <motion.text
        x="37"
        y="6"
        fill="white"
        fillOpacity={0.4}
        fontSize="4.5"
        fontWeight="bold"
        fontFamily="system-ui"
        animate={{ 
          y: [6, 3, 6],
          opacity: [0.2, 0.5, 0.2],
          x: [37, 39, 37]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        z
      </motion.text>
    </motion.svg>
  );
};

export default RockingBabyIcon;
