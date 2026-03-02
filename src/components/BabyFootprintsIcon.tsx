import { motion } from "framer-motion";

const BabyFoot = ({ mirror = false }: { mirror?: boolean }) => (
  <g transform={mirror ? "translate(28, 0) scale(-1, 1)" : undefined}>
    {/* Sole - bean shape */}
    <path
      d="M6.5 22 C6.5 17, 4 13, 4.5 9 C5 5.5, 7.5 4, 10 4 C12.5 4, 14.5 5.5, 15 9 C15.5 13, 13 17, 13 22 C13 24.5, 11 26, 9.75 26 C8.5 26, 6.5 24.5, 6.5 22Z"
      fill="currentColor"
      opacity={0.85}
    />
    {/* Toes - five round dots */}
    <ellipse cx="7" cy="3.8" rx="1.6" ry="1.5" fill="currentColor" opacity={0.8} />
    <ellipse cx="9.2" cy="2.5" rx="1.5" ry="1.4" fill="currentColor" opacity={0.85} />
    <ellipse cx="11.5" cy="2.2" rx="1.4" ry="1.35" fill="currentColor" opacity={0.9} />
    <ellipse cx="13.6" cy="3" rx="1.3" ry="1.3" fill="currentColor" opacity={0.8} />
    <ellipse cx="15.2" cy="4.5" rx="1.15" ry="1.2" fill="currentColor" opacity={0.75} />
  </g>
);

const BabyFootprintsIcon = ({ className = "w-9 h-9" }: { className?: string }) => {
  return (
    <motion.svg
      viewBox="0 0 32 28"
      fill="none"
      className={className}
      animate={{
        scale: [1, 1.06, 1],
        rotate: [0, -3, 3, 0],
      }}
      transition={{
        duration: 2.2,
        repeat: Infinity,
        repeatDelay: 1,
        ease: "easeInOut",
      }}
    >
      {/* Left foot */}
      <g transform="translate(-2, 0)">
        <BabyFoot />
      </g>
      {/* Right foot (mirrored) */}
      <g transform="translate(6, 0)">
        <BabyFoot mirror />
      </g>
    </motion.svg>
  );
};

export default BabyFootprintsIcon;
