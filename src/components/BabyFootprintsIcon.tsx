import { motion } from "framer-motion";

const BabyFootprintsIcon = ({ className = "w-9 h-9" }: { className?: string }) => {
  return (
    <svg viewBox="0 0 44 40" fill="none" className={className}>
      <defs>
        <linearGradient id="pinkFoot" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(330, 70%, 82%)" />
          <stop offset="100%" stopColor="hsl(340, 60%, 75%)" />
        </linearGradient>
        <linearGradient id="blueFoot" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(210, 60%, 76%)" />
          <stop offset="100%" stopColor="hsl(210, 55%, 68%)" />
        </linearGradient>
      </defs>

      {/* Left foot (pink) - angled slightly left */}
      <motion.g
        animate={{
          y: [0, -2.5, 0, 0, 0],
          rotate: [0, -3, 0, 0, 0],
          scale: [1, 0.93, 1.04, 1, 1],
          opacity: [0.75, 1, 0.9, 0.75, 0.75],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 0.8,
          ease: "easeInOut",
          times: [0, 0.15, 0.3, 0.5, 1],
        }}
        style={{ transformOrigin: "10px 24px" }}
      >
        <g transform="rotate(-12, 10, 20)">
          {/* Sole */}
          <path
            d="M5 30 C3 26, 2.5 22, 4 17 C5 13, 5.5 10, 8.5 8 C11 6.5, 14 7.5, 15.5 10 C17 13, 17 17, 16.5 21 C16.5 24, 17.5 27, 16 30 C14.5 33, 11 34, 9 33 C7 32, 5.5 31.5, 5 30Z"
            fill="url(#pinkFoot)"
          />
          {/* Toes - 5 round dots in arc */}
          <ellipse cx="4.5" cy="7.5" rx="1.8" ry="1.7" fill="url(#pinkFoot)" />
          <ellipse cx="7.2" cy="5.5" rx="1.7" ry="1.6" fill="url(#pinkFoot)" />
          <ellipse cx="10.2" cy="4.5" rx="1.6" ry="1.5" fill="url(#pinkFoot)" />
          <ellipse cx="13" cy="5" rx="1.45" ry="1.4" fill="url(#pinkFoot)" />
          <ellipse cx="15.3" cy="6.8" rx="1.3" ry="1.3" fill="url(#pinkFoot)" />
        </g>
      </motion.g>

      {/* Right foot (blue) - angled slightly right, offset up-right */}
      <motion.g
        animate={{
          y: [0, 0, 0, -2.5, 0],
          rotate: [0, 0, 0, 3, 0],
          scale: [1, 1, 1, 0.93, 1.04],
          opacity: [0.75, 0.75, 0.75, 1, 0.9],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 0.8,
          ease: "easeInOut",
          times: [0, 0.3, 0.5, 0.65, 0.8],
        }}
        style={{ transformOrigin: "32px 18px" }}
      >
        <g transform="translate(20, -4) rotate(12, 12, 18)">
          {/* Sole */}
          <path
            d="M5 28 C3 24, 2.5 20, 4 15 C5 11, 5.5 8, 8.5 6 C11 4.5, 14 5.5, 15.5 8 C17 11, 17 15, 16.5 19 C16.5 22, 17.5 25, 16 28 C14.5 31, 11 32, 9 31 C7 30, 5.5 29.5, 5 28Z"
            fill="url(#blueFoot)"
          />
          {/* Toes */}
          <ellipse cx="4.5" cy="5.5" rx="1.8" ry="1.7" fill="url(#blueFoot)" />
          <ellipse cx="7.2" cy="3.5" rx="1.7" ry="1.6" fill="url(#blueFoot)" />
          <ellipse cx="10.2" cy="2.5" rx="1.6" ry="1.5" fill="url(#blueFoot)" />
          <ellipse cx="13" cy="3" rx="1.45" ry="1.4" fill="url(#blueFoot)" />
          <ellipse cx="15.3" cy="4.8" rx="1.3" ry="1.3" fill="url(#blueFoot)" />
        </g>
      </motion.g>
    </svg>
  );
};

export default BabyFootprintsIcon;
