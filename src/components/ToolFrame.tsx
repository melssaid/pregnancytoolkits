import { motion } from "framer-motion";
import { Heart, Sparkles, Baby, Shield, Star, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface ToolFrameProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  mood?: "calm" | "nurturing" | "empowering" | "joyful";
}

const moodStyles = {
  calm: {
    gradient: "from-blue-50 via-purple-50 to-pink-50",
    accent: "from-blue-400 to-purple-400",
    iconBg: "bg-gradient-to-br from-blue-100 to-purple-100",
    border: "border-blue-200/50",
  },
  nurturing: {
    gradient: "from-rose-50 via-pink-50 to-orange-50",
    accent: "from-rose-400 to-pink-400",
    iconBg: "bg-gradient-to-br from-rose-100 to-pink-100",
    border: "border-rose-200/50",
  },
  empowering: {
    gradient: "from-amber-50 via-orange-50 to-rose-50",
    accent: "from-amber-400 to-orange-400",
    iconBg: "bg-gradient-to-br from-amber-100 to-orange-100",
    border: "border-amber-200/50",
  },
  joyful: {
    gradient: "from-green-50 via-teal-50 to-cyan-50",
    accent: "from-green-400 to-teal-400",
    iconBg: "bg-gradient-to-br from-green-100 to-teal-100",
    border: "border-green-200/50",
  },
};

const floatingElements = [
  { icon: Heart, delay: 0, x: "10%", y: "20%" },
  { icon: Sparkles, delay: 0.5, x: "85%", y: "15%" },
  { icon: Baby, delay: 1, x: "90%", y: "60%" },
  { icon: Star, delay: 1.5, x: "5%", y: "70%" },
];

export function ToolFrame({ 
  children, 
  title, 
  subtitle, 
  icon: Icon,
  mood = "nurturing" 
}: ToolFrameProps) {
  const { t } = useTranslation();
  const styles = moodStyles[mood];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${styles.gradient} relative overflow-hidden`}>
      {/* Floating Decorative Elements */}
      {floatingElements.map((item, index) => (
        <motion.div
          key={index}
          className="absolute pointer-events-none opacity-20"
          style={{ left: item.x, top: item.y }}
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4,
            delay: item.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <item.icon className="h-8 w-8 text-primary" />
        </motion.div>
      ))}

      {/* Soft Gradient Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-pink-200/20 to-transparent rounded-full blur-3xl" />

      {/* Content Container */}
      <div className="relative z-10">
        {/* Header with Back Button */}
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-white/50 shadow-sm">
          <div className="container py-4">
            <div className="flex items-center gap-4">
              <Link 
                to="/"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors group"
              >
                <motion.div
                  whileHover={{ x: -3 }}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>{t('app.back')}</span>
                </motion.div>
              </Link>
            </div>
          </div>
        </div>

        {/* Tool Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container py-8"
        >
          <div className="flex items-center gap-4 mb-2">
            {Icon && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className={`p-4 rounded-2xl ${styles.iconBg} shadow-lg`}
              >
                <Icon className={`h-8 w-8 bg-gradient-to-br ${styles.accent} bg-clip-text text-transparent`} style={{ stroke: 'url(#iconGradient)' }} />
                <svg width="0" height="0">
                  <defs>
                    <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="hsl(330, 80%, 60%)" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h1>
              {subtitle && (
                <p className="text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="container pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border ${styles.border} p-6 md:p-8`}
          >
            {children}
          </motion.div>
        </div>

        {/* Encouraging Footer Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="container pb-8"
        >
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-white/50 shadow-sm">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">
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
