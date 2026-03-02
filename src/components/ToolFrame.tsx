import { motion } from "framer-motion";
import { Shield, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BackButton } from "./BackButton";
import { RelatedTools } from "./RelatedTools";
import { ToolIcon, hasToolIcon } from "./ToolIcon";
import { BottomNavigation } from "./BottomNavigation";
import { LanguageDropdown } from "./LanguageDropdown";
import { ToolInsightTabs } from "./ToolInsightTabs";
import { FertilityDailyTip } from "./FertilityDailyTip";

import { SEOHead } from "./SEOHead";
import logoImage from "@/assets/logo.webp";

const FERTILITY_TOOL_IDS = new Set([
  "cycle-tracker", "due-date-calculator", "fertility-academy",
  "nutrition-supplements", "preconception-checkup",
]);

interface ToolFrameProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  customIcon?: string;
  mood?: "calm" | "nurturing" | "empowering" | "joyful";
  toolId?: string;
  showRelated?: boolean;
}

const moodStyles = {
  calm: {
    gradient: "from-sky-50 via-indigo-50/60 to-violet-50",
    accent: "from-sky-500 to-indigo-600",
    iconBg: "bg-gradient-to-br from-sky-400 to-indigo-500",
    border: "border-sky-200/50",
    glow: "from-sky-400/30",
    badge: "from-sky-500/10 to-indigo-500/10",
  },
  nurturing: {
    gradient: "from-rose-50 via-pink-50/60 to-amber-50",
    accent: "from-rose-500 to-pink-600",
    iconBg: "bg-gradient-to-br from-rose-400 to-pink-500",
    border: "border-rose-200/50",
    glow: "from-rose-400/30",
    badge: "from-rose-500/10 to-pink-500/10",
  },
  empowering: {
    gradient: "from-amber-50 via-orange-50/60 to-rose-50",
    accent: "from-amber-500 to-orange-600",
    iconBg: "bg-gradient-to-br from-amber-400 to-orange-500",
    border: "border-amber-200/50",
    glow: "from-amber-400/30",
    badge: "from-amber-500/10 to-orange-500/10",
  },
  joyful: {
    gradient: "from-emerald-50 via-teal-50/60 to-cyan-50",
    accent: "from-emerald-500 to-teal-600",
    iconBg: "bg-gradient-to-br from-emerald-400 to-teal-500",
    border: "border-emerald-200/50",
    glow: "from-emerald-400/30",
    badge: "from-emerald-500/10 to-teal-500/10",
  },
};

export function ToolFrame({ 
  children, 
  title, 
  subtitle, 
  icon: Icon,
  customIcon,
  mood = "nurturing",
  toolId,
  showRelated = true,
}: ToolFrameProps) {
  const { t } = useTranslation();
  const styles = moodStyles[mood];
  
  // Check if we have a custom icon for this tool
  const hasCustomIcon = toolId && hasToolIcon(toolId);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${styles.gradient} overflow-x-hidden overflow-y-auto`}>
      <SEOHead title={title} description={subtitle} />
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-32 -right-32 w-72 md:w-96 h-72 md:h-96 bg-gradient-to-br ${styles.glow} to-transparent rounded-full blur-3xl opacity-60`} />
        <div className={`absolute -bottom-32 -left-32 w-72 md:w-96 h-72 md:h-96 bg-gradient-to-tr ${styles.glow} to-transparent rounded-full blur-3xl opacity-40`} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Minimal Header with Language & App Name */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-border/40 shadow-sm overflow-hidden"
        >
          {/* Pink glow behind header */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-[70%] h-16 bg-primary/15 rounded-full blur-2xl" />
            <div className="absolute -top-4 right-0 w-32 h-12 bg-primary/10 rounded-full blur-xl" />
          </div>
          <div className="px-4 sm:px-6 py-2 flex items-center justify-between">
            <div className="flex items-center min-w-0">
              <BackButton />
            </div>
            <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
              <div className="relative group">
                {/* Soft glow ring */}
                <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-accent/15 blur-sm opacity-80 group-hover:opacity-100 transition-opacity" />
                <img 
                  src={logoImage} 
                  alt="Pregnancy Toolkits" 
                  width={44}
                  height={44}
                  loading="eager"
                  decoding="async"
                  className="relative h-11 w-11 rounded-full shadow-md ring-2 ring-primary/15 object-cover"
                />
              </div>
            </Link>
            <div className="flex-shrink-0">
              <LanguageDropdown />
            </div>
          </div>
        </motion.header>

        {/* Hero Section - Title + Tool Benefit */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="px-4 sm:px-6 py-4"
        >
          <div className="flex-1 min-w-0">
            <motion.h1 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="text-base font-bold text-foreground tracking-tight leading-tight"
            >
              {title}
            </motion.h1>
          </div>

          {/* Tool Benefit Section — Modern glassmorphism card */}
          {toolId && t(`toolBenefits.${toolId}`, '') && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
              className="mt-3 relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.06] via-white/80 to-accent/[0.06] backdrop-blur-sm shadow-sm"
            >
              {/* Decorative gradient orbs */}
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-accent/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="relative z-10 p-3.5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-sm">
                    <Lightbulb className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                  <span className="text-[11px] font-bold text-foreground tracking-tight">
                    {t('toolBenefits.heading', 'What do I benefit from this tool?')}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed ps-8">
                  {t(`toolBenefits.${toolId}`)}
                </p>
              </div>
            </motion.div>
          )}
        </motion.section>

        {/* Main Content Card - Compact */}
        <section className="px-4 sm:px-6 pb-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25, ease: "easeOut" }}
            className={`relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/[0.04] ${styles.border} border overflow-hidden`}
          >
            {/* Content - Tighter padding with text containment */}
            <div className="relative z-10 p-4 sm:p-5 overflow-hidden [&_*]:min-w-0">
              {children}
            </div>
          </motion.div>

          {/* AI Insight - skip for fertility tools */}
          {toolId && !FERTILITY_TOOL_IDS.has(toolId) && (
            <ToolInsightTabs toolId={toolId} />
          )}

          {/* Daily Tip - fertility expert for fertility tools, tip of the day for others */}
          {toolId && (
            <div className="mt-4">
              <FertilityDailyTip titleKey={FERTILITY_TOOL_IDS.has(toolId) ? "fertilityExpert.title" : "fertilityTip.title"} />
            </div>
          )}

          {/* Related Tools */}
          {showRelated && toolId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <RelatedTools currentToolId={toolId} maxItems={3} />
            </motion.div>
          )}
        </section>


        {/* Minimal Footer Disclaimer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="px-4 sm:px-6 pb-8"
        >
          <div className="flex items-center justify-center gap-1.5 opacity-40">
            <Shield className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
            <span className="text-[9px] text-muted-foreground tracking-wide">
              {t('app.medicalDisclaimer')}
            </span>
          </div>
        </motion.footer>

        {/* Bottom Navigation for Mobile */}
        <BottomNavigation />
      </div>
    </div>
  );
}

export default ToolFrame;
