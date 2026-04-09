import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ToolCard } from "./ToolCard";
import { Tool } from "@/lib/tools-data";
import { useSubscriptionStatus, isToolPremium } from "@/hooks/useSubscriptionStatus";

interface CategorySectionProps {
  categoryKey: string;
  tools: Tool[];
  icon?: LucideIcon;
  gradient?: string;
  isExpanded?: boolean;
  onToggle?: () => void;
  isSubscriptionActive?: boolean;
}

export function CategorySection({ 
  categoryKey, 
  tools, 
  icon: Icon,
  gradient = "from-primary to-accent",
  isExpanded = true,
  onToggle,
  isSubscriptionActive = false
}: CategorySectionProps) {
  const { t } = useTranslation();
  const { tier } = useSubscriptionStatus();
  
  if (tools.length === 0) return null;
  
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-12"
    >
      <div 
        className="flex items-center gap-3 mb-6 cursor-pointer group"
        onClick={onToggle}
      >
        {Icon && (
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r ${gradient} text-white shadow-lg`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-2xl font-extrabold text-foreground group-hover:text-primary transition-colors">
            {t(categoryKey)}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('searchDialog.toolsCount', { count: tools.length })}
          </p>
        </div>
        {onToggle && (
          <ChevronRight 
            className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} 
          />
        )}
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {tools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 18, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.06,
                  ease: "easeOut",
                }}
              >
                <ToolCard
                  titleKey={tool.titleKey}
                  descriptionKey={tool.descriptionKey}
                  icon={tool.icon}
                  href={tool.href}
                  categoryKey={tool.categoryKey}
                  index={index}
                  isLocked={isToolPremium(tool.id, tier)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

export default CategorySection;
