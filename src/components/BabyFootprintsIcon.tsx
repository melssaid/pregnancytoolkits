import { motion } from "framer-motion";

const BabyFootprintsIcon = ({ className = "w-9 h-9" }: { className?: string }) => {
  return (
    <svg viewBox="0 0 36 36" fill="none" className={className}>
      {/* Main foot - white with subtle shadow */}
      <motion.g
        animate={{
          y: [0, -2, 0, 0, 0],
          rotate: [0, -2, 0, 0, 0],
          scale: [1, 0.95, 1.03, 1, 1],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          repeatDelay: 1,
          ease: "easeInOut",
          times: [0, 0.2, 0.35, 0.5, 1],
        }}
        style={{ transformOrigin: "20px 22px" }}
      >
        {/* Sole - bean shape */}
        <path
          d="M15 32 C12 30, 11 26, 12 21 C12.5 17, 12 13, 14.5 10 C17 7.5, 21 7, 23.5 9.5 C26 12, 26 16, 25.5 21 C25 25, 26 28, 24 31 C22 34, 17 34, 15 32Z"
          fill="white"
          stroke="hsl(340, 30%, 85%)"
          strokeWidth="0.3"
        />
        {/* Toes - 5 circles in arc */}
        <ellipse cx="13" cy="10" rx="2.2" ry="2.1" fill="white" stroke="hsl(340, 30%, 85%)" strokeWidth="0.3" />
        <ellipse cx="16.5" cy="7.5" rx="2" ry="1.9" fill="white" stroke="hsl(340, 30%, 85%)" strokeWidth="0.3" />
        <ellipse cx="20.5" cy="6.8" rx="1.8" ry="1.7" fill="white" stroke="hsl(340, 30%, 85%)" strokeWidth="0.3" />
        <ellipse cx="24" cy="7.8" rx="1.6" ry="1.5" fill="white" stroke="hsl(340, 30%, 85%)" strokeWidth="0.3" />
        <ellipse cx="26.5" cy="10" rx="1.4" ry="1.35" fill="white" stroke="hsl(340, 30%, 85%)" strokeWidth="0.3" />
      </motion.g>

      {/* Hearts pulsing out from the foot */}
      <motion.g
        animate={{
          scale: [0.6, 1.15, 0.85, 1.1, 0.6],
          opacity: [0.4, 1, 0.7, 1, 0.4],
          y: [2, -1, 0, -1, 2],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ transformOrigin: "7px 10px" }}
      >
        <path
          d="M7 11.5 C7 10, 8.2 9, 9.2 9.8 C9.7 10.2, 9.7 10.8, 9.2 11.5 L7 14 L4.8 11.5 C4.3 10.8, 4.3 10.2, 4.8 9.8 C5.8 9, 7 10, 7 11.5Z"
          fill="hsl(340, 65%, 55%)"
        />
      </motion.g>

      <motion.g
        animate={{
          scale: [0.5, 1, 0.7, 1.05, 0.5],
          opacity: [0.3, 0.9, 0.5, 0.9, 0.3],
          y: [1, -0.5, 0, -0.5, 1],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.4,
        }}
        style={{ transformOrigin: "10px 16px" }}
      >
        <path
          d="M10 17.2 C10 16.3, 10.8 15.7, 11.3 16.2 C11.6 16.4, 11.6 16.8, 11.3 17.2 L10 18.8 L8.7 17.2 C8.4 16.8, 8.4 16.4, 8.7 16.2 C9.2 15.7, 10 16.3, 10 17.2Z"
          fill="hsl(345, 60%, 60%)"
        />
      </motion.g>
    </svg>
  );
};

export default BabyFootprintsIcon;
