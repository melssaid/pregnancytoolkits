import { motion } from "framer-motion";
import { forwardRef } from "react";

const LoadingScreen = forwardRef<HTMLDivElement>((_, ref) => (
  <motion.div
    ref={ref}
    className="min-h-screen flex flex-col items-center justify-center gap-6"
    style={{ background: "hsl(var(--primary) / 0.08)" }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.15 }}
  >
    <motion.img
      src="/splash-logo-v2.webp"
      alt="Loading"
      className="w-20 h-20 object-contain"
      animate={{ scale: [1, 1.06, 1] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    />
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
