import { ReactNode } from "react";
import { motion } from "framer-motion";

interface PageTransitionProps {
  children: ReactNode;
  variant?: "default" | "tool";
}

const variants = {
  default: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
  tool: {
    initial: { opacity: 0, scale: 0.97, y: 6 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.98, y: -4 },
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export const PageTransition = ({ children, variant = "default" }: PageTransitionProps) => {
  const v = variants[variant];
  return (
    <motion.div
      className="w-full min-h-screen"
      initial={v.initial}
      animate={v.animate}
      exit={v.exit}
      transition={v.transition}
    >
      {children}
    </motion.div>
  );
};
