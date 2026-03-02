import { motion } from "framer-motion";

const BabyFoot = ({ mirror = false }: { mirror?: boolean }) => (
  <g transform={mirror ? "translate(28, 0) scale(-1, 1)" : undefined}>
    <path
      d="M6.5 22 C6.5 17, 4 13, 4.5 9 C5 5.5, 7.5 4, 10 4 C12.5 4, 14.5 5.5, 15 9 C15.5 13, 13 17, 13 22 C13 24.5, 11 26, 9.75 26 C8.5 26, 6.5 24.5, 6.5 22Z"
      fill="url(#footGrad)"
      opacity={0.9}
    />
    <ellipse cx="7" cy="3.8" rx="1.6" ry="1.5" fill="url(#footGrad)" opacity={0.85} />
    <ellipse cx="9.2" cy="2.5" rx="1.5" ry="1.4" fill="url(#footGrad)" opacity={0.9} />
    <ellipse cx="11.5" cy="2.2" rx="1.4" ry="1.35" fill="url(#footGrad)" opacity={0.95} />
    <ellipse cx="13.6" cy="3" rx="1.3" ry="1.3" fill="url(#footGrad)" opacity={0.85} />
    <ellipse cx="15.2" cy="4.5" rx="1.15" ry="1.2" fill="url(#footGrad)" opacity={0.8} />
  </g>
);

const BabyFootprintsIcon = ({ className = "w-9 h-9" }: { className?: string }) => {
  return (
    <svg viewBox="0 0 32 28" fill="none" className={className}>
      <defs>
        <linearGradient id="footGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(340, 65%, 72%)" />
          <stop offset="50%" stopColor="hsl(345, 60%, 62%)" />
          <stop offset="100%" stopColor="hsl(350, 55%, 55%)" />
        </linearGradient>
      </defs>
      {/* Left foot - steps first */}
      <motion.g
        transform="translate(-2, 0)"
        animate={{
          y: [0, -3, 0, 0, 0],
          rotate: [0, -4, 0, 0, 0],
          scale: [1, 0.92, 1.05, 1, 1],
          opacity: [0.7, 1, 0.85, 0.7, 0.7],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 0.8,
          ease: "easeInOut",
          times: [0, 0.15, 0.3, 0.5, 1],
        }}
      >
        <BabyFoot />
      </motion.g>
      {/* Right foot - steps second (offset) */}
      <motion.g
        transform="translate(6, 0)"
        animate={{
          y: [0, 0, 0, -3, 0],
          rotate: [0, 0, 0, 4, 0],
          scale: [1, 1, 1, 0.92, 1.05],
          opacity: [0.7, 0.7, 0.7, 1, 0.85],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 0.8,
          ease: "easeInOut",
          times: [0, 0.3, 0.5, 0.65, 0.8],
        }}
      >
        <BabyFoot mirror />
      </motion.g>
    </svg>
  );
};

export default BabyFootprintsIcon;
