import { motion } from "framer-motion";

const BabyFootprintsIcon = ({ className = "w-9 h-9" }: { className?: string }) => (
  <motion.svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    animate={{ scale: [1, 1.06, 1], rotate: [0, -2, 2, 0] }}
    transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut" }}
  >
    {/* Baby foot sole — chubby bean shape */}
    <path
      d="M8.5 21.5c-1.2-.8-2-2.5-1.8-4.5.2-2 .1-3.5.8-5.2.8-2 2-3.3 3.8-3.5 1.8-.2 3.2.8 3.8 2.5.6 1.7.5 3.8.2 5.8-.3 2 .2 3.5-.5 4.8-.8 1.3-2.5 1.8-3.8 1.5-1.2-.3-2-.8-2.5-1.4z"
      fill="white"
    />
    {/* Five baby toes — round, bunched together */}
    <circle cx="7.8" cy="8.2" r="1.5" fill="white" />
    <circle cx="10" cy="6.8" r="1.4" fill="white" />
    <circle cx="12.4" cy="6.5" r="1.3" fill="white" />
    <circle cx="14.5" cy="7.2" r="1.2" fill="white" />
    <circle cx="16.2" cy="8.6" r="1.1" fill="white" />
  </motion.svg>
);

export default BabyFootprintsIcon;
