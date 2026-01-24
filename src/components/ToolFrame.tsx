import { motion } from "framer-motion";
import { Shield, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BackButton } from "./BackButton";
import { RelatedTools } from "./RelatedTools";

interface ToolFrameProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
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
  mood = "nurturing",
  toolId,
  showRelated = true 
}: ToolFrameProps) {
  const { t } = useTranslation();
  const styles = moodStyles[mood];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${styles.gradient}`}>
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-32 -right-32 w-72 md:w-96 h-72 md:h-96 bg-gradient-to-br ${styles.glow} to-transparent rounded-full blur-3xl opacity-60`} />
        <div className={`absolute -bottom-32 -left-32 w-72 md:w-96 h-72 md:h-96 bg-gradient-to-tr ${styles.glow} to-transparent rounded-full blur-3xl opacity-40`} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Premium Header - Mobile Optimized */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-white/60 shadow-lg shadow-black/[0.03]"
        >
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <BackButton />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r ${styles.badge} backdrop-blur-sm`}
              >
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-semibold text-primary tracking-wide uppercase">Premium</span>
              </motion.div>
            </div>
          </div>
        </motion.header>

        {/* Hero Section - Mobile First */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="px-4 py-5 md:py-8"
        >
          <div className="flex items-start gap-4">
            {Icon && (
              <motion.div 
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                className="relative shrink-0"
              >
                <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl ${styles.iconBg} shadow-xl shadow-primary/20 ring-2 md:ring-4 ring-white`}>
                  <Icon className="h-6 w-6 md:h-8 md:w-8 text-white" strokeWidth={2.5} />
                </div>
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className={`absolute -top-0.5 -right-0.5 w-3 h-3 md:w-4 md:h-4 rounded-full bg-gradient-to-r ${styles.accent} shadow-lg ring-2 ring-white`} 
                />
              </motion.div>
            )}
            <div className="flex-1 min-w-0 space-y-1">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground tracking-tight leading-tight"
              >
                {title}
              </motion.h1>
              {subtitle && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="text-muted-foreground text-xs sm:text-sm md:text-base leading-relaxed line-clamp-2"
                >
                  {subtitle}
                </motion.p>
              )}
            </div>
          </div>
        </motion.section>

        {/* Main Content Card - Full Width on Mobile */}
        <section className="px-3 md:px-4 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
            className={`relative bg-white/95 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-xl shadow-black/[0.06] ${styles.border} border overflow-hidden`}
          >
            {/* Decorative Corner Accents */}
            <div className={`absolute top-0 right-0 w-32 md:w-48 h-32 md:h-48 bg-gradient-to-bl ${styles.glow} to-transparent rounded-bl-full pointer-events-none opacity-50`} />
            
            {/* Content - Tighter padding on mobile */}
            <div className="relative z-10 p-4 sm:p-5 md:p-6 lg:p-8">
              {children}
            </div>
          </motion.div>

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

        {/* Premium Footer Disclaimer - Compact on Mobile */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="px-4 pb-8"
        >
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-md">
              <Shield className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-[11px] sm:text-xs text-muted-foreground font-medium leading-tight">
                {t('app.medicalDisclaimer')}
              </span>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}

export default ToolFrame;
