import { motion } from "framer-motion";

const BabyFootprintsIcon = ({ className = "w-9 h-9" }: { className?: string }) => {
  return (
    <div className={`${className} relative`}>
      {/* Left foot */}
      <motion.svg
        viewBox="0 0 120 160"
        className="absolute w-[46%] h-[88%] left-[3%] top-[6%]"
        fill="currentColor"
        animate={{
          y: [0, -3, 0, 0, 0],
          opacity: [0.9, 1, 0.9, 0.9, 0.9],
        }}
        transition={{
          duration: 1.6,
          repeat: Infinity,
          repeatDelay: 1.2,
          ease: "easeInOut",
          times: [0, 0.2, 0.4, 0.7, 1],
        }}
      >
        {/* Big toe */}
        <ellipse cx="38" cy="16" rx="16" ry="16" />
        {/* Second toe */}
        <ellipse cx="60" cy="8" rx="12" ry="13" />
        {/* Third toe */}
        <ellipse cx="78" cy="12" rx="10" ry="11" />
        {/* Fourth toe */}
        <ellipse cx="93" cy="20" rx="9" ry="10" />
        {/* Pinky toe */}
        <ellipse cx="104" cy="32" rx="8" ry="9" />
        {/* Ball of foot */}
        <ellipse cx="62" cy="58" rx="38" ry="22" />
        {/* Arch bridge - thinner connection */}
        <ellipse cx="50" cy="90" rx="18" ry="18" />
        {/* Heel */}
        <ellipse cx="48" cy="128" rx="28" ry="28" />
      </motion.svg>

      {/* Right foot */}
      <motion.svg
        viewBox="0 0 120 160"
        className="absolute w-[46%] h-[88%] right-[3%] top-[6%]"
        fill="currentColor"
        style={{ scaleX: -1 }}
        animate={{
          y: [0, 0, 0, -3, 0],
          opacity: [0.9, 0.9, 0.9, 1, 0.9],
        }}
        transition={{
          duration: 1.6,
          repeat: Infinity,
          repeatDelay: 1.2,
          ease: "easeInOut",
          times: [0, 0.2, 0.5, 0.7, 1],
        }}
      >
        {/* Big toe */}
        <ellipse cx="38" cy="16" rx="16" ry="16" />
        {/* Second toe */}
        <ellipse cx="60" cy="8" rx="12" ry="13" />
        {/* Third toe */}
        <ellipse cx="78" cy="12" rx="10" ry="11" />
        {/* Fourth toe */}
        <ellipse cx="93" cy="20" rx="9" ry="10" />
        {/* Pinky toe */}
        <ellipse cx="104" cy="32" rx="8" ry="9" />
        {/* Ball of foot */}
        <ellipse cx="62" cy="58" rx="38" ry="22" />
        {/* Arch bridge */}
        <ellipse cx="50" cy="90" rx="18" ry="18" />
        {/* Heel */}
        <ellipse cx="48" cy="128" rx="28" ry="28" />
      </motion.svg>
    </div>
  );
};

export default BabyFootprintsIcon;
