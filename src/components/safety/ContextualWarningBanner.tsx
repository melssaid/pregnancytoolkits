import { memo, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Shield, AlertCircle, HeartPulse } from "lucide-react";
import { cn } from "@/lib/utils";

type Level = "info" | "warning" | "urgent";

interface ContextualWarningBannerProps {
  level: Level;
  message: string;
  icon?: ReactNode;
  className?: string;
}

const levelStyles: Record<Level, { bg: string; border: string; text: string; iconColor: string }> = {
  info: {
    bg: "bg-blue-50/60 dark:bg-blue-950/20",
    border: "border-blue-200/40 dark:border-blue-800/30",
    text: "text-blue-800 dark:text-blue-300",
    iconColor: "text-blue-500 dark:text-blue-400",
  },
  warning: {
    bg: "bg-amber-50/60 dark:bg-amber-950/20",
    border: "border-amber-200/40 dark:border-amber-800/30",
    text: "text-amber-800 dark:text-amber-300",
    iconColor: "text-amber-500 dark:text-amber-400",
  },
  urgent: {
    bg: "bg-rose-50/60 dark:bg-rose-950/20",
    border: "border-rose-200/40 dark:border-rose-800/30",
    text: "text-rose-800 dark:text-rose-300",
    iconColor: "text-rose-500 dark:text-rose-400",
  },
};

const defaultIcons: Record<Level, ReactNode> = {
  info: <Shield className="w-4 h-4" />,
  warning: <AlertCircle className="w-4 h-4" />,
  urgent: <HeartPulse className="w-4 h-4" />,
};

export const ContextualWarningBanner = memo(function ContextualWarningBanner({
  level,
  message,
  icon,
  className,
}: ContextualWarningBannerProps) {
  const s = levelStyles[level];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "rounded-xl border px-3.5 py-3 flex items-start gap-2.5",
        s.bg, s.border,
        className
      )}
    >
      <div className={cn("mt-0.5 flex-shrink-0", s.iconColor)}>
        {icon || defaultIcons[level]}
      </div>
      <p className={cn("text-xs leading-relaxed font-medium", s.text)}>
        {message}
      </p>
    </motion.div>
  );
});
