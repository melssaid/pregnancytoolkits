import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getRelatedTools, getContextualTools } from "@/lib/tools-data";
import { useUserProfile } from "@/hooks/useUserProfile";

interface RelatedToolsProps {
  currentToolId: string;
  maxItems?: number;
}

export const RelatedTools = forwardRef<HTMLDivElement, RelatedToolsProps>(
  ({ currentToolId, maxItems = 3 }, ref) => {
    const { t, i18n } = useTranslation();
    const { profile } = useUserProfile();
    const isRTL = i18n.language === "ar";
    const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

    // Use smart contextual tools when week is available, fallback to related
    const week = profile?.currentWeek;
    const relatedTools = week
      ? getContextualTools(currentToolId, week, maxItems)
      : getRelatedTools(currentToolId, maxItems);

    if (relatedTools.length === 0) return null;

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-8"
      >
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="h-1 w-8 rounded-full bg-gradient-to-r from-primary to-pink-500" />
          {t('relatedTools.title', 'Continue Your Journey')}
        </h3>

        <div className="grid gap-3 sm:grid-cols-3">
          {relatedTools.map((tool, index) => {
            const Icon = tool.icon;

            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link
                  to={tool.href}
                  className="group flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                  aria-label={t(tool.titleKey)}
                >
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-pink-500 group-hover:text-white transition-all duration-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
                      {t(tool.titleKey)}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {t(tool.categoryKey)}
                    </p>
                  </div>
                  <ArrowIcon className={`h-4 w-4 text-muted-foreground group-hover:text-primary transition-all ${isRTL ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    );
  }
);

RelatedTools.displayName = "RelatedTools";

export default RelatedTools;
