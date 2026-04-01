import { motion } from "framer-motion";
import { forwardRef } from "react";

const LoadingScreen = forwardRef<HTMLDivElement>((_, ref) => (
  <motion.div
    ref={ref}
    className="min-h-screen flex flex-col items-center justify-center"
    style={{ background: "hsl(var(--background))" }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.15 }}
  >
    <div className="relative flex items-center justify-center">
      {/* Ripple rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border-2"
          style={{ borderColor: "hsl(var(--primary) / 0.25)", width: 80, height: 80 }}
          animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            delay: i * 0.6,
            ease: "easeOut",
          }}
        />
      ))}
      <motion.img
        src="/splash-logo-v2.webp"
        alt="Loading"
        className="w-16 h-16 object-contain relative z-10"
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  </motion.div>
));

LoadingScreen.displayName = "LoadingScreen";

export const PageSkeleton = LoadingScreen;
export const IndexSkeleton = LoadingScreen;
export default PageSkeleton;
