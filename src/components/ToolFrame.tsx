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
        <div className={`absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br ${styles.glow} to-transparent rounded-full blur-3xl opacity-60`} />
        <div className={`absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr ${styles.glow} to-transparent rounded-full blur-3xl opacity-40`} />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-radial from-white/50 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Premium Header */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-white/60 shadow-lg shadow-black/[0.03]"
        >
          <div className="container py-4">
            <div className="flex items-center justify-between">
              <BackButton />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r ${styles.badge} backdrop-blur-sm`}
              >
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] font-semibold text-primary tracking-wide uppercase">Premium Tool</span>
              </motion.div>
            </div>
          </div>
        </motion.header>

        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="container py-8 md:py-12"
        >
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {Icon && (
              <motion.div 
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                className="relative shrink-0"
              >
                <div className={`p-4 rounded-2xl ${styles.iconBg} shadow-2xl shadow-primary/20 ring-4 ring-white`}>
                  <Icon className="h-8 w-8 text-white" strokeWidth={2.5} />
                </div>
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className={`absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r ${styles.accent} shadow-lg ring-2 ring-white`} 
                />
              </motion.div>
            )}
            <div className="flex-1 space-y-2">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-tight"
              >
                {title}
              </motion.h1>
              {subtitle && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed"
                >
                  {subtitle}
                </motion.p>
              )}
            </div>
          </div>
        </motion.section>

        {/* Main Content Card */}
        <section className="container pb-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
            className={`relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/[0.08] ${styles.border} border-2 overflow-hidden`}
          >
            {/* Decorative Corner Accents */}
            <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl ${styles.glow} to-transparent rounded-bl-full pointer-events-none opacity-60`} />
            <div className={`absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr ${styles.glow} to-transparent rounded-tr-full pointer-events-none opacity-40`} />
            
            {/* Content */}
            <div className="relative z-10 p-5 sm:p-6 md:p-8 lg:p-10">
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

        {/* Premium Footer Disclaimer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="container pb-12"
        >
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-lg shadow-black/[0.03]">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground font-medium">
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
