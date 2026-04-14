import { motion } from "framer-motion";
import { forwardRef } from "react";

const LoadingScreen = forwardRef<HTMLDivElement>((_, ref) => (
  <motion.div
    ref={ref}
    className="min-h-screen flex flex-col items-center justify-center gap-6"
    style={{ background: "linear-gradient(to top, #faf6f2, #fce8ef, #f9d4e0, #f4c1d2, #f0b0c4)" }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.15 }}
  >
    {/* Pulsing ripple rings with logo */}
    <div className="relative flex items-center justify-center w-28 h-28">
      {/* Ripple rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border-2"
          style={{ borderColor: "hsl(var(--primary) / 0.25)" }}
          initial={{ scale: 0.6, opacity: 0.7 }}
          animate={{ scale: [0.6, 1.4], opacity: [0.6, 0] }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeOut",
          }}
        />
      ))}
      {/* Center logo — clipped to circle */}
      <motion.div
        className="relative z-10 w-16 h-16 rounded-full overflow-hidden shadow-lg"
        style={{ background: "white" }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <img
          src="/splash-logo-v2.webp"
          alt="Loading"
          className="w-full h-full object-cover"
        />
      </motion.div>
    </div>

    {/* Three bouncing dots */}
    <div className="flex items-center gap-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: "hsl(var(--primary))" }}
          animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  </motion.div>
));

LoadingScreen.displayName = "LoadingScreen";

export const PageSkeleton = LoadingScreen;
export const IndexSkeleton = LoadingScreen;
export default PageSkeleton;
