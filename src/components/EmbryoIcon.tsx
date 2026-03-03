import { motion } from "framer-motion";

const EmbryoIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" fill="white" className={className}>
    <motion.g
      animate={{
        y: [0, -2, 0, 1, 0],
        rotate: [0, 2, -1, 1, 0],
        scale: [1, 1.03, 0.98, 1.01, 1],
      }}
      transition={{
        duration: 3.5,
        repeat: Infinity,
        repeatDelay: 1,
        ease: "easeInOut",
        times: [0, 0.25, 0.5, 0.75, 1],
      }}
      style={{ transformOrigin: "32px 32px" }}
    >
      {/* Fetal body — curled position */}
      <path d="M44.5 18c-2.5-4-7-6.5-12-6.5c-8 0-14.5 6.5-14.5 14.5c0 3.5 1.2 6.7 3.3 9.2c-1.8 2.5-3.3 5.5-3.3 9.3c0 4 2 7.5 5 9.5c1.5 1 3.2 1.5 5 1.5c2 0 3.8-0.7 5.2-1.8c1.5 1.1 3.3 1.8 5.3 1.8c5 0 9-4 9-9c0-2.5-1-4.8-2.7-6.5c1.7-2.5 2.7-5.5 2.7-8.5C47.5 26.2 46.5 21.5 44.5 18z" />
      {/* Head */}
      <circle cx="32" cy="19" r="8.5" />
      {/* Curled legs hint */}
      <path d="M25 42c0 0-2 4-1 7c0.5 1.5 2 2.5 3.5 2.5c1.5 0 2.8-1 3.2-2.5" opacity="0.8" />
      <path d="M35 40c0 0 1.5 4 0.8 7c-0.4 1.5-1.8 2.5-3.3 2.5" opacity="0.8" />
      {/* Arm curl */}
      <path d="M22 28c-2 1-3.5 3-3.5 5.5c0 2 1 3.8 2.5 4.8" opacity="0.7" strokeWidth="0" />
    </motion.g>
    {/* Umbilical cord suggestion */}
    <motion.path
      d="M32 11c0 0 2-4 6-5.5c2-0.7 4-0.3 5 0.5"
      fill="none"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.5"
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    />
  </svg>
);

export default EmbryoIcon;
