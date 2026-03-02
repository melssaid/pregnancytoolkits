import { motion } from "framer-motion";

const BabyFootprintsIcon = ({ className = "w-9 h-9" }: { className?: string }) => (
  <motion.svg
    viewBox="0 0 24 28"
    fill="none"
    className={className}
    animate={{ scale: [1, 1.05, 1], rotate: [0, -2, 2, 0] }}
    transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut" }}
  >
    <path
      d="M8 24 C6 22, 5.5 18, 7 14 C8 10.5, 7.5 8, 9.5 6 C11.5 4, 14.5 4.5, 16 7 C17.5 9.5, 17 14, 16.5 18 C16 21, 17 23, 15.5 25 C14 27, 10 27, 8 24Z"
      fill="white"
    />
    <ellipse cx="6.5" cy="5.5" rx="2" ry="1.9" fill="white" />
    <ellipse cx="9.5" cy="3.5" rx="1.85" ry="1.75" fill="white" />
    <ellipse cx="12.8" cy="3" rx="1.7" ry="1.6" fill="white" />
    <ellipse cx="15.5" cy="4" rx="1.55" ry="1.5" fill="white" />
    <ellipse cx="17.5" cy="6" rx="1.4" ry="1.35" fill="white" />
  </motion.svg>
);

export default BabyFootprintsIcon;
