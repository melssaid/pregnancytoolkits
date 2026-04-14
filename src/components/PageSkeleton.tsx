import { motion } from "framer-motion";
import { forwardRef } from "react";

const LoadingScreen = forwardRef<HTMLDivElement>((_, ref) => (
  <div
    ref={ref}
    className="min-h-screen w-full flex flex-col items-center justify-center gap-5"
    role="status"
    aria-live="polite"
  >
    <img
      src="/splash-logo-v2.webp"
      alt="Loading"
      className="w-20 h-20 object-contain"
      loading="eager"
      decoding="async"
    />

    <div className="flex items-center gap-2" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2.5 h-2.5 rounded-full bg-primary"
          animate={{ y: [0, -6, 0], opacity: [0.35, 1, 0.35] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  </div>
));

LoadingScreen.displayName = "LoadingScreen";

export const PageSkeleton = LoadingScreen;
export const IndexSkeleton = LoadingScreen;
export default PageSkeleton;
