import { motion } from "framer-motion";

const DreamEyeIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className}>
    {/* Outer eye shape */}
    <motion.path
      d="M32 16C18 16 8 32 8 32s10 16 24 16 24-16 24-16-10-16-24-16z"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="white"
      fillOpacity={0.15}
    />
    {/* Iris */}
    <motion.circle
      cx="32"
      cy="32"
      r="8"
      fill="white"
      fillOpacity={0.9}
    />
    {/* Pupil */}
    <motion.circle
      cx="32"
      cy="32"
      r="3.5"
      fill="white"
    />
    {/* Sparkle */}
    <circle cx="28" cy="29" r="1.5" fill="white" opacity={0.8} />
    {/* Blink eyelid — animates closed and open */}
    <motion.path
      d="M8 32s10-16 24-16 24 16 24 16"
      fill="currentColor"
      stroke="none"
      initial={{ scaleY: 0 }}
      animate={{
        scaleY: [0, 0, 1, 1, 0, 0],
        opacity: [0, 0, 1, 1, 0, 0],
      }}
      transition={{
        duration: 3.5,
        repeat: Infinity,
        repeatDelay: 1,
        times: [0, 0.6, 0.65, 0.72, 0.77, 1],
        ease: "easeInOut",
      }}
      style={{ 
        transformOrigin: "32px 32px",
        fill: "hsl(15, 70%, 62%)",
      }}
    />
    {/* Top eyelid blink overlay */}
    <motion.ellipse
      cx="32"
      cy="32"
      rx="25"
      ry="16"
      fill="hsl(15, 70%, 62%)"
      initial={{ scaleY: 0 }}
      animate={{
        scaleY: [0, 0, 1, 1, 0, 0],
      }}
      transition={{
        duration: 3.5,
        repeat: Infinity,
        repeatDelay: 1,
        times: [0, 0.6, 0.65, 0.72, 0.77, 1],
        ease: "easeInOut",
      }}
      style={{ transformOrigin: "32px 32px" }}
    />
  </svg>
);

export default DreamEyeIcon;
