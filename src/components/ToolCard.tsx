import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ToolCardProps {
  titleKey: string;
  descriptionKey: string;
  icon: LucideIcon;
  href: string;
  categoryKey: string;
  index: number;
}

export function ToolCard({ titleKey, descriptionKey, icon: Icon, href, categoryKey, index }: ToolCardProps) {
  const { t } = useTranslation();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link to={href} className="block h-full">
        <div className="group relative h-full rounded-lg border border-border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:border-primary/20">
          <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-primary/0 to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          
          <div className="relative z-10">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="h-6 w-6" />
            </div>
            
            <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t(categoryKey)}
            </span>
            
            <h3 className="mb-2 text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors duration-300">
              {t(titleKey)}
            </h3>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t(descriptionKey)}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
