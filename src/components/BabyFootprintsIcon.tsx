import { motion } from "framer-motion";

const BabyFootprintsIcon = ({ className = "w-9 h-9" }: { className?: string }) => (
  <motion.svg
    viewBox="0 0 28 28"
    fill="none"
    className={className}
    animate={{ scale: [1, 1.08, 1, 1.06, 1] }}
    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
  >
    {/* Heart outline */}
    <path
      d="M14 26 C14 26, 2 18, 2 10 C2 6, 5 3, 8.5 3 C10.5 3, 12.5 4, 14 6 C15.5 4, 17.5 3, 19.5 3 C23 3, 26 6, 26 10 C26 18, 14 26, 14 26Z"
      fill="none"
      stroke="white"
      strokeWidth="1.2"
      opacity={0.6}
    />
    {/* Small foot inside */}
    <g transform="translate(7.5, 6) scale(0.55)">
      <path d="M8 24 C6 22, 5.5 18, 7 14 C8 10.5, 7.5 8, 9.5 6 C11.5 4, 14.5 4.5, 16 7 C17.5 9.5, 17 14, 16.5 18 C16 21, 17 23, 15.5 25 C14 27, 10 27, 8 24Z" fill="white" />
      <ellipse cx="6.5" cy="5.5" rx="2" ry="1.9" fill="white" />
      <ellipse cx="9.5" cy="3.5" rx="1.85" ry="1.75" fill="white" />
      <ellipse cx="12.8" cy="3" rx="1.7" ry="1.6" fill="white" />
      <ellipse cx="15.5" cy="4" rx="1.55" ry="1.5" fill="white" />
      <ellipse cx="17.5" cy="6" rx="1.4" ry="1.35" fill="white" />
    </g>
  </motion.svg>
);

export default BabyFootprintsIcon;
