import { motion } from "framer-motion";
import { Shield } from "lucide-react";
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
    gradient: "from-sky-50/80 via-indigo-50/50 to-violet-50/80",
    accent: "from-sky-500 to-indigo-500",
    iconBg: "bg-gradient-to-br from-sky-100 to-indigo-100",
    border: "border-sky-200/30",
    glow: "from-sky-400/20",
  },
  nurturing: {
    gradient: "from-rose-50/80 via-pink-50/50 to-amber-50/80",
    accent: "from-rose-500 to-pink-500",
    iconBg: "bg-gradient-to-br from-rose-100 to-pink-100",
    border: "border-rose-200/30",
    glow: "from-rose-400/20",
  },
  empowering: {
    gradient: "from-amber-50/80 via-orange-50/50 to-rose-50/80",
    accent: "from-amber-500 to-orange-500",
    iconBg: "bg-gradient-to-br from-amber-100 to-orange-100",
    border: "border-amber-200/30",
    glow: "from-amber-400/20",
  },
  joyful: {
    gradient: "from-emerald-50/80 via-teal-50/50 to-cyan-50/80",
    accent: "from-emerald-500 to-teal-500",
    iconBg: "bg-gradient-to-br from-emerald-100 to-teal-100",
    border: "border-emerald-200/30",
    glow: "from-emerald-400/20",
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
    <div className={`min-h-screen bg-gradient-to-br ${styles.gradient} relative overflow-hidden`}>
      {/* Animated Background Elements */}
      <div className={`absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br ${styles.glow} to-transparent rounded-full blur-3xl pointer-events-none animate-pulse`} style={{ animationDuration: '4s' }} />
      <div className={`absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr ${styles.glow} to-transparent rounded-full blur-3xl pointer-events-none`} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-white/40 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10">
        {/* Header with Back Button - Glassmorphism */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-sm"
        >
          <div className="container py-3">
            <BackButton />
          </div>
        </motion.div>

        {/* Tool Header - Enhanced */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="container py-8 md:py-10"
        >
          <div className="flex items-start gap-5">
            {Icon && (
              <motion.div 
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="relative"
              >
                <div className={`p-4 rounded-2xl ${styles.iconBg} shadow-xl ring-4 ring-white/50`}>
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                {/* Decorative dot */}
                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full bg-gradient-to-r ${styles.accent}`} />
              </motion.div>
            )}
            <div className="flex-1">
              <motion.h1 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="text-2xl md:text-3xl font-bold text-foreground tracking-tight"
              >
                {title}
              </motion.h1>
              {subtitle && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="text-muted-foreground mt-1.5 text-sm md:text-base"
                >
                  {subtitle}
                </motion.p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Main Content - Card with enhanced styling */}
        <div className="container pb-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl ${styles.border} border p-6 md:p-8 overflow-hidden`}
          >
            {/* Subtle inner glow */}
            <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${styles.glow} to-transparent rounded-full blur-3xl pointer-events-none opacity-50`} />
            
            <div className="relative z-10">
              {children}
            </div>
          </motion.div>

          {/* Related Tools Section */}
          {showRelated && toolId && (
            <RelatedTools currentToolId={toolId} maxItems={3} />
          )}
        </div>

        {/* Footer Disclaimer - Refined */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="container pb-10"
        >
          <div className="text-center">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50 shadow-sm">
              <Shield className="h-4 w-4 text-primary/70" />
              <span className="text-xs md:text-sm text-muted-foreground">
                {t('app.medicalDisclaimer')}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default ToolFrame;
