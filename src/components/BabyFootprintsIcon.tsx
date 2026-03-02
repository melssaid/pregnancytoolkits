import { motion } from "framer-motion";

const BabyFootprintsIcon = ({ className = "w-9 h-9" }: { className?: string }) => {
  return (
    <div className={`${className} relative`}>
      {/* Left foot */}
      <motion.svg
        viewBox="0 0 24 40"
        className="absolute inset-0 w-[45%] h-[85%] left-[5%] top-[8%]"
        fill="currentColor"
        animate={{
          y: [0, -2, 0, 0, 0],
          rotate: [-4, -4, -4, -4, -4],
        }}
        transition={{
          duration: 1.4,
          repeat: Infinity,
          repeatDelay: 1,
          ease: "easeInOut",
          times: [0, 0.2, 0.4, 0.7, 1],
        }}
      >
        {/* Sole */}
        <path d="M12 38c-5 0-9-4-9-10 0-3 1-6 2-9 1.5-4 3-8 3-12 0-2 1.5-4 4-4s4 2 4 4c0 4 1.5 8 3 12 1 3 2 6 2 9 0 6-4 10-9 10z" />
        {/* Toes */}
        <ellipse cx="5" cy="2.5" rx="2.2" ry="2.5" />
        <ellipse cx="10" cy="1" rx="2" ry="2.2" />
        <ellipse cx="15" cy="1.5" rx="1.8" ry="2" />
        <ellipse cx="19" cy="3.5" rx="1.6" ry="1.8" />
        <ellipse cx="22" cy="6" rx="1.4" ry="1.6" />
      </motion.svg>

      {/* Right foot */}
      <motion.svg
        viewBox="0 0 24 40"
        className="absolute inset-0 w-[45%] h-[85%] right-[5%] left-auto top-[8%]"
        fill="currentColor"
        style={{ scaleX: -1 }}
        animate={{
          y: [0, 0, 0, -2, 0],
          rotate: [4, 4, 4, 4, 4],
        }}
        transition={{
          duration: 1.4,
          repeat: Infinity,
          repeatDelay: 1,
          ease: "easeInOut",
          times: [0, 0.2, 0.4, 0.6, 1],
        }}
      >
        {/* Sole */}
        <path d="M12 38c-5 0-9-4-9-10 0-3 1-6 2-9 1.5-4 3-8 3-12 0-2 1.5-4 4-4s4 2 4 4c0 4 1.5 8 3 12 1 3 2 6 2 9 0 6-4 10-9 10z" />
        {/* Toes */}
        <ellipse cx="5" cy="2.5" rx="2.2" ry="2.5" />
        <ellipse cx="10" cy="1" rx="2" ry="2.2" />
        <ellipse cx="15" cy="1.5" rx="1.8" ry="2" />
        <ellipse cx="19" cy="3.5" rx="1.6" ry="1.8" />
        <ellipse cx="22" cy="6" rx="1.4" ry="1.6" />
      </motion.svg>
    </div>
  );
};

export default BabyFootprintsIcon;
