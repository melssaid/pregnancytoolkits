import { motion } from "framer-motion";

const BabyFootprintsIcon = ({ className = "w-9 h-9" }: { className?: string }) => {
  return (
    <div className={`${className} relative overflow-visible`}>
      {/* Left foot — steps first */}
      <motion.svg
        viewBox="0 0 50 80"
        className="absolute w-[48%] h-[80%] left-[2%] top-[10%]"
        fill="currentColor"
        animate={{
          y: [0, -4, 0, 0, 0],
          scale: [1, 1.08, 1, 1, 1],
          opacity: [0.85, 1, 0.85, 0.85, 0.85],
        }}
        transition={{
          duration: 1.6,
          repeat: Infinity,
          repeatDelay: 0.8,
          ease: "easeInOut",
          times: [0, 0.25, 0.5, 0.75, 1],
        }}
      >
        {/* Toes */}
        <ellipse cx="12" cy="6" rx="5.5" ry="6" />
        <ellipse cx="23" cy="3" rx="4.5" ry="5" />
        <ellipse cx="33" cy="4" rx="4" ry="4.5" />
        <ellipse cx="41" cy="8" rx="3.5" ry="4" />
        <ellipse cx="46" cy="15" rx="3" ry="3.5" />
        {/* Sole */}
        <path d="M8 18c2-2 8-4 14-4 6 0 12 2 16 6 4 5 6 12 5 20-1 10-6 22-14 30-3 3-6 5-8 5s-5-2-7-5C6 62 2 50 1 40 0 32 2 24 8 18z" />
      </motion.svg>

      {/* Right foot — steps second (offset timing) */}
      <motion.svg
        viewBox="0 0 50 80"
        className="absolute w-[48%] h-[80%] right-[2%] top-[10%]"
        fill="currentColor"
        style={{ scaleX: -1 }}
        animate={{
          y: [0, 0, 0, -4, 0],
          scale: [1, 1, 1, 1.08, 1],
          opacity: [0.85, 0.85, 0.85, 1, 0.85],
        }}
        transition={{
          duration: 1.6,
          repeat: Infinity,
          repeatDelay: 0.8,
          ease: "easeInOut",
          times: [0, 0.25, 0.5, 0.75, 1],
        }}
      >
        {/* Toes */}
        <ellipse cx="12" cy="6" rx="5.5" ry="6" />
        <ellipse cx="23" cy="3" rx="4.5" ry="5" />
        <ellipse cx="33" cy="4" rx="4" ry="4.5" />
        <ellipse cx="41" cy="8" rx="3.5" ry="4" />
        <ellipse cx="46" cy="15" rx="3" ry="3.5" />
        {/* Sole */}
        <path d="M8 18c2-2 8-4 14-4 6 0 12 2 16 6 4 5 6 12 5 20-1 10-6 22-14 30-3 3-6 5-8 5s-5-2-7-5C6 62 2 50 1 40 0 32 2 24 8 18z" />
      </motion.svg>
    </div>
  );
};

export default BabyFootprintsIcon;
