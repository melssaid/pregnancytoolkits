import { motion } from "framer-motion";
import { forwardRef } from "react";

const LoadingScreen = forwardRef<HTMLDivElement>((_, ref) => (
  <motion.div
    ref={ref}
    className="min-h-screen flex flex-col items-center justify-center"
    style={{ background: "#fdf2f8" }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.15 }}
  >
    <motion.img
      src="/splash-logo-v2.webp"
      alt="Loading"
      className="w-20 h-20 object-contain"
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    />
    <div className="flex items-center gap-1.5 mt-4">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="rounded-full"
          style={{ width: 7, height: 7, backgroundColor: "#d4608a" }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
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
