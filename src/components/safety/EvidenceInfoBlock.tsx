import { memo } from "react";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface EvidenceInfoBlockProps {
  title: string;
  content: string;
  source?: string;
  className?: string;
}

export const EvidenceInfoBlock = memo(function EvidenceInfoBlock({
  title,
  content,
  source,
  className,
}: EvidenceInfoBlockProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "rounded-xl bg-blue-50/50 dark:bg-blue-950/15 border border-blue-200/30 dark:border-blue-800/25 p-3.5 space-y-2",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0" />
        <h4 className="text-xs font-bold text-blue-800 dark:text-blue-300">{title}</h4>
      </div>
      <p className="text-xs text-blue-700/80 dark:text-blue-300/70 leading-relaxed ps-6">
        {content}
      </p>
      {source && (
        <p className="text-[10px] text-blue-500/60 dark:text-blue-400/50 ps-6">
          {source}
        </p>
      )}
    </motion.div>
  );
});
