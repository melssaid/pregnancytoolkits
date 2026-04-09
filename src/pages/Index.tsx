import { useMemo, memo, useState, useCallback, useEffect } from "react";
import { useAIUsage } from "@/contexts/AIUsageContext";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { ChevronRight, ChevronLeft, ChevronDown, Lock, LockOpen, ShieldCheck, Clock, Sparkles, Brain, Gift, Crown, Share2 } from "lucide-react";
import PregnancyHeartIcon from "@/components/PregnancyHeartIcon";
import BabyFootprintsIcon from "@/components/BabyFootprintsIcon";
import RockingBabyIcon from "@/components/RockingBabyIcon";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { getJourneyCategories, getToolsByCategory, JourneyKey, Tool } from "@/lib/tools-data";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SEOHead } from "@/components/SEOHead";
import WelcomeCard from "@/components/home/WelcomeCard";
import QuickActions from "@/components/home/QuickActions";



// ── Category styling lookup — brand-cohesive rose palette ────────────────
const categoryStyles: Record<string, { iconColor: string; iconBg: string; toolHover: string; hoverShadow: string; hoverBorder: string }> = {
  "categories.smartAssistant": { iconColor: "text-[hsl(340,55%,55%)] dark:text-[hsl(340,50%,65%)]", iconBg: "bg-[hsl(340,50%,95%)] dark:bg-[hsl(340,40%,18%)]", toolHover: "hover:bg-[hsl(340,40%,96%)] dark:hover:bg-[hsl(340,30%,14%)]", hoverShadow: "hover:shadow-[0_2px_12px_-2px_hsl(340,50%,55%,0.15)]", hoverBorder: "hover:border-[hsl(340,40%,85%)] dark:hover:border-[hsl(340,30%,25%)]" },
  "categories.fertility":     { iconColor: "text-[hsl(350,60%,58%)] dark:text-[hsl(350,55%,65%)]", iconBg: "bg-[hsl(350,55%,94%)] dark:bg-[hsl(350,40%,18%)]", toolHover: "hover:bg-[hsl(350,40%,96%)] dark:hover:bg-[hsl(350,30%,14%)]", hoverShadow: "hover:shadow-[0_2px_12px_-2px_hsl(350,55%,58%,0.15)]", hoverBorder: "hover:border-[hsl(350,40%,85%)] dark:hover:border-[hsl(350,30%,25%)]" },
  "categories.pregnancy":     { iconColor: "text-[hsl(340,65%,52%)] dark:text-[hsl(340,60%,62%)]", iconBg: "bg-[hsl(340,50%,94%)] dark:bg-[hsl(340,35%,18%)]", toolHover: "hover:bg-[hsl(340,35%,96%)] dark:hover:bg-[hsl(340,25%,14%)]", hoverShadow: "hover:shadow-[0_2px_12px_-2px_hsl(340,60%,52%,0.15)]", hoverBorder: "hover:border-[hsl(340,35%,85%)] dark:hover:border-[hsl(340,25%,25%)]" },
  "categories.nutrition":     { iconColor: "text-[hsl(15,65%,55%)] dark:text-[hsl(15,60%,62%)]",   iconBg: "bg-[hsl(15,55%,94%)] dark:bg-[hsl(15,35%,18%)]",   toolHover: "hover:bg-[hsl(15,40%,96%)] dark:hover:bg-[hsl(15,30%,14%)]", hoverShadow: "hover:shadow-[0_2px_12px_-2px_hsl(15,60%,55%,0.15)]", hoverBorder: "hover:border-[hsl(15,35%,85%)] dark:hover:border-[hsl(15,25%,25%)]" },
  "categories.wellness":      { iconColor: "text-[hsl(160,40%,45%)] dark:text-[hsl(160,35%,55%)]", iconBg: "bg-[hsl(160,35%,94%)] dark:bg-[hsl(160,25%,18%)]", toolHover: "hover:bg-[hsl(160,30%,96%)] dark:hover:bg-[hsl(160,20%,14%)]", hoverShadow: "hover:shadow-[0_2px_12px_-2px_hsl(160,35%,45%,0.15)]", hoverBorder: "hover:border-[hsl(160,25%,85%)] dark:hover:border-[hsl(160,18%,25%)]" },
  
  "categories.preparation":   { iconColor: "text-[hsl(170,35%,45%)] dark:text-[hsl(170,30%,55%)]", iconBg: "bg-[hsl(170,30%,94%)] dark:bg-[hsl(170,22%,18%)]", toolHover: "hover:bg-[hsl(170,25%,96%)] dark:hover:bg-[hsl(170,20%,14%)]", hoverShadow: "hover:shadow-[0_2px_12px_-2px_hsl(170,30%,45%,0.15)]", hoverBorder: "hover:border-[hsl(170,22%,85%)] dark:hover:border-[hsl(170,18%,25%)]" },
  "categories.postpartum":    { iconColor: "text-[hsl(310,35%,52%)] dark:text-[hsl(310,30%,62%)]", iconBg: "bg-[hsl(310,30%,94%)] dark:bg-[hsl(310,22%,18%)]", toolHover: "hover:bg-[hsl(310,25%,96%)] dark:hover:bg-[hsl(310,20%,14%)]", hoverShadow: "hover:shadow-[0_2px_12px_-2px_hsl(310,30%,52%,0.15)]", hoverBorder: "hover:border-[hsl(310,22%,85%)] dark:hover:border-[hsl(310,18%,25%)]" },
};

// ── Journey card theming — emotionally resonant, brand-cohesive ─────────
interface JourneyConfig {
  key: JourneyKey;
  icon?: LucideIcon;
  customIcon?: "footprints" | "rockingBaby" | "pregnancyHeart";
  headerGradient: string;
  headerText: string;
  bg: string;
  border: string;
  iconBg: string;
}

const journeyConfigs: JourneyConfig[] = [
  {
    // Planning/Fertility — Warm Coral-Peach: hope, warmth, anticipation
    key: "planning",
    customIcon: "rockingBaby",
    headerGradient: "bg-gradient-to-r from-[hsl(15,70%,62%)] via-[hsl(25,65%,65%)] to-[hsl(340,50%,65%)] dark:from-[hsl(15,65%,50%)] dark:via-[hsl(25,60%,52%)] dark:to-[hsl(340,45%,55%)]",
    headerText: "text-white",
    iconBg: "bg-white/20",
    bg: "from-[hsl(20,40%,97%)] via-[hsl(30,30%,97%)] to-[hsl(340,25%,97%)] dark:from-[hsl(20,20%,10%)] dark:via-[hsl(30,15%,9%)] dark:to-[hsl(340,15%,10%)]",
    border: "border-[hsl(20,30%,90%)] dark:border-[hsl(20,15%,18%)]",
  },
  {
    // Pregnancy — Deep Rose-Pink: love, strength, the core journey
    key: "pregnant",
    customIcon: "pregnancyHeart",
    headerGradient: "bg-gradient-to-r from-[hsl(340,65%,52%)] via-[hsl(345,60%,56%)] to-[hsl(350,55%,60%)] dark:from-[hsl(340,60%,45%)] dark:via-[hsl(345,55%,48%)] dark:to-[hsl(350,50%,52%)]",
    headerText: "text-white",
    iconBg: "bg-white/20",
    bg: "from-[hsl(340,30%,97%)] via-[hsl(345,25%,97%)] to-[hsl(350,20%,97%)] dark:from-[hsl(340,20%,10%)] dark:via-[hsl(345,15%,9%)] dark:to-[hsl(350,12%,10%)]",
    border: "border-[hsl(340,25%,90%)] dark:border-[hsl(340,15%,18%)]",
  },
  {
    // Postpartum/Baby — Soft Mauve-Lavender: tenderness, nurturing calm
    key: "postpartum",
    customIcon: "footprints",
    headerGradient: "bg-gradient-to-r from-[hsl(320,40%,58%)] via-[hsl(300,30%,60%)] to-[hsl(280,35%,62%)] dark:from-[hsl(320,35%,48%)] dark:via-[hsl(300,25%,50%)] dark:to-[hsl(280,30%,52%)]",
    headerText: "text-white",
    iconBg: "bg-white/20",
    bg: "from-[hsl(320,25%,97%)] via-[hsl(300,20%,97%)] to-[hsl(280,20%,97%)] dark:from-[hsl(320,15%,10%)] dark:via-[hsl(300,12%,9%)] dark:to-[hsl(280,12%,10%)]",
    border: "border-[hsl(310,20%,90%)] dark:border-[hsl(310,12%,18%)]",
  },
];

// ── Tool row component ──────────────────────────────────────────────────
const ToolRow = memo(function ToolRow({ tool, isRTL, isLocked = false }: { tool: Tool; isRTL: boolean; isLocked?: boolean }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const ToolIcon = tool.icon;
  const hasPng = !!tool.pngIcon;
  const style = categoryStyles[tool.categoryKey] || { iconColor: "text-muted-foreground", iconBg: "bg-muted/30", toolHover: "hover:bg-muted/50", hoverShadow: "hover:shadow-sm", hoverBorder: "hover:border-border/30" };
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  const handleClick = (e: React.MouseEvent) => {
    if (isLocked) {
      e.preventDefault();
      navigate("/pricing-demo");
    }
  };

  return (
    <Link to={isLocked ? "#" : tool.href} onClick={handleClick} className="block">
      <div className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-card/60 backdrop-blur-sm shadow-[0_1px_3px_0_hsl(0,0%,0%,0.04)] ${style.toolHover} ${style.hoverShadow} ${style.hoverBorder} border border-border/10 transition-all duration-250 hover:-translate-y-[1px] ${isLocked ? "opacity-50" : ""}`}>
        <div className={`flex-shrink-0 w-9 h-9 rounded-lg ${style.iconBg} border border-border/15 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-250 group-hover:scale-105 ${isLocked ? "grayscale-[30%]" : ""}`}>
          {hasPng ? (
            <img
              src={tool.pngIcon}
              alt=""
              className="w-5 h-5 object-contain opacity-80"
              loading="lazy"
            />
          ) : (
            <ToolIcon className={`w-[18px] h-[18px] ${style.iconColor} group-hover:opacity-100 transition-opacity duration-250`} strokeWidth={1.8} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[12px] font-semibold text-foreground leading-snug line-clamp-2" style={{ fontFamily: "'Tajawal', sans-serif", overflowWrap: 'anywhere' }}>{t(tool.titleKey)}</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug line-clamp-2" style={{ overflowWrap: 'anywhere' }}>{t(tool.descriptionKey)}</p>
        </div>
        {isLocked ? (
          <Lock className="flex-shrink-0 w-3.5 h-3.5 text-muted-foreground/40" />
        ) : (
          <ChevronIcon className="flex-shrink-0 w-3.5 h-3.5 text-muted-foreground/20 group-hover:text-muted-foreground/60 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all duration-250" />
        )}
      </div>
    </Link>
  );
});




// ── Journey card ────────────────────────────────────────────────────────


const JourneyCard = memo(function JourneyCard({ config, index, isSubscriptionActive, tier }: { config: JourneyConfig; index: number; isSubscriptionActive: boolean; tier?: import('@/hooks/useSubscriptionStatus').SubscriptionTier }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const Icon = config.icon;

  const [isOpen, setIsOpen] = useState(() => {
    try {
      const saved = localStorage.getItem("journey-states");
      if (saved) {
        const states = JSON.parse(saved);
        return !!states[config.key];
      }
    } catch {}
    return false;
  });

  const toggle = useCallback(() => {
    setIsOpen(prev => {
      const next = !prev;
      try {
        const saved = localStorage.getItem("journey-states");
        const states = saved ? JSON.parse(saved) : {};
        states[config.key] = next;
        localStorage.setItem("journey-states", JSON.stringify(states));
      } catch {}
      return next;
    });
  }, [config.key]);

  const categories = useMemo(() => getJourneyCategories(config.key), [config.key]);
  const toolsByCategory = useMemo(() => {
    return categories.map(catKey => ({
      catKey,
      tools: getToolsByCategory(catKey),
    })).filter(g => g.tools.length > 0);
  }, [categories]);

  const totalTools = useMemo(() => toolsByCategory.reduce((sum, g) => sum + g.tools.length, 0), [toolsByCategory]);
  if (totalTools === 0) return null;

  

  return (
    <div
      className={`rounded-2xl bg-gradient-to-br ${config.bg} border ${config.border} overflow-hidden shadow-sm animate-fade-in journey-card-glow relative journey-card-shimmer`}
      style={{ animationDelay: `${index * 120}ms` }}
    >
      {/* Gradient Header — clickable to toggle */}
      <button
        onClick={toggle}
        className={`${config.headerGradient} px-3.5 py-3 relative overflow-hidden w-full text-start min-h-[60px] flex items-center`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
        <div className="absolute -top-6 -end-6 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
        
        <div className="relative flex items-center gap-2.5 w-full">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className={`text-lg sm:text-xl font-extrabold ${config.headerText} tracking-tight leading-snug break-words ar-heading`} style={{ overflowWrap: 'anywhere' }}>
                {t(`journeys.${config.key}`)}
              </h2>
              <span className={`text-[9px] font-bold ${config.headerText} bg-white/20 backdrop-blur-sm px-1.5 py-0.5 rounded-full`}>
                {totalTools}
              </span>
            </div>
            <p className={`text-[11px] ${config.headerText} opacity-75 mt-0.5 leading-snug break-words`}>
              {t(`journeys.${config.key}Desc`)}
            </p>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="flex-shrink-0"
          >
            <ChevronDown className={`w-5 h-5 ${config.headerText} opacity-60`} strokeWidth={2} />
          </motion.div>
        </div>
      </button>

      {/* Collapsible Tools */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ 
              height: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
              opacity: { duration: 0.3, delay: 0.05, ease: "easeOut" }
            }}
            className="overflow-hidden"
          >
            <div className="px-2.5 pb-3 pt-1.5 space-y-1.5">
              {toolsByCategory.map(({ catKey, tools }) => (
                <div key={catKey}>
                  <div className="space-y-2">
                    {tools.map((tool, toolIdx) => (
                      <motion.div
                        key={tool.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: toolIdx * 0.04, ease: [0.25, 0.1, 0.25, 1] }}
                      >
                        <ToolRow tool={tool} isRTL={isRTL} isLocked={false} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// ── Footer Card — Premium CTA: elegant, adaptive ───────────────────────
const FooterCard = memo(function FooterCard() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language?.split('-')[0] || 'en';
  const { remaining, limit, isLimitReached, tier, refresh } = useAIUsage();

  // Refresh quota state when returning from pricing page
  useEffect(() => { refresh(); }, [refresh]);
  const isAr = lang === 'ar';
  const isFree = tier === 'free';
  const usagePercent = limit > 0 ? (remaining / limit) * 100 : 0;

  const isPremium = tier === 'premium';

  const labels: Record<string, { title: string; desc: string; exhaustedTitle: string; exhaustedDesc: string; cta: string; premiumTitle: string; premiumDesc: string }> = {
    en: { title: 'Premium Access', desc: '60 monthly analyses · All tools unlocked', exhaustedTitle: 'Insights Used Up', exhaustedDesc: 'Unlock more personalized insights with Premium', cta: 'View Plans', premiumTitle: 'Premium Member ✨', premiumDesc: 'You have 60 monthly AI analyses' },
    ar: { title: 'الوصول المميز', desc: '60 تحليل شهرياً · جميع الأدوات مفتوحة', exhaustedTitle: 'نفدت التحليلات', exhaustedDesc: 'افتحي المزيد من التحليلات المخصصة مع Premium', cta: 'عرض الخطط', premiumTitle: 'عضوة مميزة ✨', premiumDesc: 'لديكِ 60 تحليل ذكاء اصطناعي شهرياً' },
    de: { title: 'Premium-Zugang', desc: '60 monatliche Analysen · Alle Tools freigeschaltet', exhaustedTitle: 'Analysen aufgebraucht', exhaustedDesc: 'Schalten Sie mehr personalisierte Einblicke frei', cta: 'Pläne ansehen', premiumTitle: 'Premium-Mitglied ✨', premiumDesc: 'Sie haben 60 monatliche KI-Analysen' },
    fr: { title: 'Accès Premium', desc: '60 analyses mensuelles · Tous les outils débloqués', exhaustedTitle: 'Analyses épuisées', exhaustedDesc: 'Débloquez plus d\'analyses personnalisées avec Premium', cta: 'Voir les plans', premiumTitle: 'Membre Premium ✨', premiumDesc: 'Vous avez 60 analyses IA mensuelles' },
    es: { title: 'Acceso Premium', desc: '60 análisis mensuales · Todas las herramientas', exhaustedTitle: 'Análisis agotados', exhaustedDesc: 'Desbloquea más análisis personalizados con Premium', cta: 'Ver planes', premiumTitle: 'Miembro Premium ✨', premiumDesc: 'Tienes 60 análisis IA mensuales' },
    pt: { title: 'Acesso Premium', desc: '60 análises mensais · Todas as ferramentas', exhaustedTitle: 'Análises esgotadas', exhaustedDesc: 'Desbloqueie mais análises personalizadas com Premium', cta: 'Ver planos', premiumTitle: 'Membro Premium ✨', premiumDesc: 'Você tem 60 análises IA mensais' },
    tr: { title: 'Premium Erişim', desc: '60 aylık analiz · Tüm araçlar açık', exhaustedTitle: 'Analizler tükendi', exhaustedDesc: 'Premium ile daha fazla kişiselleştirilmiş analiz açın', cta: 'Planları gör', premiumTitle: 'Premium Üye ✨', premiumDesc: 'Aylık 60 AI analiziniz var' },
  };
  const l = labels[lang] || labels.en;

  const showExhausted = isLimitReached && isFree;

  // Premium member card
  if (isPremium) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="mt-3"
      >
        <div className="w-full text-start rounded-xl overflow-hidden bg-gradient-to-br from-amber-500/[0.08] via-card to-primary/[0.04] border border-amber-500/20 shadow-sm">
          <div className="h-[2px] bg-gradient-to-r from-amber-500/30 via-amber-500 to-amber-500/30" />
          <div className="px-3 py-3 flex items-center gap-2.5">
            <div className="relative flex-shrink-0">
              <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-500/10 flex items-center justify-center border border-amber-500/25">
                <Crown className="w-4 h-4 text-amber-500" strokeWidth={1.8} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[12px] font-bold text-foreground leading-tight" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                {l.premiumTitle}
              </h4>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                {l.premiumDesc}
              </p>
            </div>
            <span className="text-[13px] font-extrabold text-primary tabular-nums" style={{ fontFamily: "'Cairo', sans-serif" }}>
              {remaining}<span className="text-[9px] opacity-40 font-normal">/{limit}</span>
            </span>
          </div>
          <div className="px-3 pb-2.5">
            <div className="h-[4px] rounded-full bg-muted/50 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-primary"
                initial={{ width: 0 }}
                animate={{ width: `${usagePercent}%` }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="mt-3"
    >
      <button
        onClick={() => navigate('/pricing-demo')}
        className="w-full text-start rounded-xl overflow-hidden bg-gradient-to-br from-primary/[0.06] via-card to-accent/[0.04] border border-primary/15 shadow-sm hover:shadow-md hover:border-primary/25 transition-all duration-300 group"
      >
        {/* Accent bar */}
        <div className={`h-[2px] relative overflow-hidden ${showExhausted ? 'bg-gradient-to-r from-primary/50 via-primary to-primary/50' : 'bg-gradient-to-r from-primary/20 via-primary/60 to-primary/20'}`}>
          <motion.div
            className="absolute h-full w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            animate={{ x: ['-100%', '400%'] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 5, ease: 'linear' }}
          />
        </div>

        <div className="px-3 py-3 flex items-center gap-2.5">
          {/* Icon */}
          <div className="relative flex-shrink-0">
            {showExhausted && (
              <motion.div
                className="absolute inset-0 rounded-lg bg-primary/20 blur-md"
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center border border-primary/20">
              <Crown className="w-4 h-4 text-primary" strokeWidth={1.8} />
            </div>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <h4 className="text-[12px] font-bold text-foreground leading-tight" style={{ fontFamily: "'Tajawal', sans-serif" }}>
              {showExhausted ? l.exhaustedTitle : l.title}
            </h4>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
              {showExhausted ? l.exhaustedDesc : l.desc}
            </p>
          </div>

          {/* CTA chip */}
          <div className="flex-shrink-0">
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[9px] font-bold group-hover:bg-primary/15 transition-colors">
              {l.cta}
              {isAr ? <ChevronLeft className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />}
            </span>
          </div>
        </div>

        {/* Usage bar — only show for free users */}
        {isFree && (
          <div className="px-3 pb-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                <Brain className="w-2.5 h-2.5 text-primary/40" strokeWidth={1.8} />
                {isAr ? 'التحليلات المتبقية' : 'Remaining analyses'}
              </span>
              <span className="text-[11px] font-bold text-primary tabular-nums" style={{ fontFamily: "'Cairo', sans-serif" }}>
                {remaining}<span className="text-[9px] opacity-40 font-normal">/{limit}</span>
              </span>
            </div>
            <div className="h-[4px] rounded-full bg-muted/50 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${isLimitReached ? 'bg-destructive' : 'bg-gradient-to-r from-primary to-primary/60'}`}
                initial={{ width: 0 }}
                animate={{ width: `${usagePercent}%` }}
                transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        )}
      </button>
    </motion.div>
  );
});

// ── Share App Button ────────────────────────────────────────────────────
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=app.pregnancytoolkits.android";

const ShareAppButton = memo(function ShareAppButton() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'en';

  const shareLabels: Record<string, { text: string; shareTitle: string; shareText: string }> = {
    en: { text: 'Share with a friend', shareTitle: 'Pregnancy Toolkits', shareText: 'Check out this free pregnancy app with 33+ smart tools!' },
    ar: { text: 'شاركي التطبيق مع صديقة', shareTitle: 'أدوات الحمل الذكية', shareText: 'جربي هذا التطبيق المجاني لمتابعة الحمل مع 33+ أداة ذكية!' },
    de: { text: 'Mit einer Freundin teilen', shareTitle: 'Pregnancy Toolkits', shareText: 'Schau dir diese kostenlose Schwangerschafts-App mit 33+ Tools an!' },
    fr: { text: 'Partager avec une amie', shareTitle: 'Pregnancy Toolkits', shareText: 'Découvre cette app de grossesse gratuite avec 33+ outils!' },
    es: { text: 'Compartir con una amiga', shareTitle: 'Pregnancy Toolkits', shareText: '¡Mira esta app de embarazo gratis con 33+ herramientas!' },
    pt: { text: 'Compartilhar com uma amiga', shareTitle: 'Pregnancy Toolkits', shareText: 'Confira este app de gravidez grátis com 33+ ferramentas!' },
    tr: { text: 'Bir arkadaşınla paylaş', shareTitle: 'Pregnancy Toolkits', shareText: '33+ akıllı araçla bu ücretsiz hamilelik uygulamasına göz at!' },
  };
  const l = shareLabels[lang] || shareLabels.en;

  const handleShare = async () => {
    const shareData = { title: l.shareTitle, text: l.shareText, url: PLAY_STORE_URL };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${l.shareText}\n${PLAY_STORE_URL}`);
        toast.success(lang === 'ar' ? 'تم نسخ الرابط ✓' : 'Link copied ✓');
      }
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        // Fallback: copy to clipboard
        try {
          await navigator.clipboard.writeText(`${l.shareText}\n${PLAY_STORE_URL}`);
          toast.success(lang === 'ar' ? 'تم نسخ الرابط — شاركيه في أي تطبيق ✓' : 'Link copied — share it anywhere ✓');
        } catch {
          toast.error(lang === 'ar' ? 'لم نتمكن من المشاركة' : 'Could not share');
        }
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="mt-1.5"
    >
      <button
        onClick={handleShare}
        className="w-full text-start rounded-xl overflow-hidden bg-card border border-border/30 hover:border-border/50 shadow-sm hover:shadow-md transition-all duration-300 group"
      >
        <div className="px-3 py-2.5 flex items-center gap-2.5">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/15">
            <Share2 className="w-3.5 h-3.5 text-emerald-500" strokeWidth={1.8} />
          </div>
          <span className="flex-1 text-[11px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors" style={{ fontFamily: "'Tajawal', sans-serif" }}>
            {l.text}
          </span>
          {lang === 'ar' ? (
            <ChevronLeft className="w-3 h-3 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors" />
          ) : (
            <ChevronRight className="w-3 h-3 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors" />
          )}
        </div>
      </button>
    </motion.div>
  );
});


// ── Main page ───────────────────────────────────────────────────────────
const Index = () => {
  const { t, i18n } = useTranslation();
  const { tier, isUnlocked, isLoading: subLoading } = useSubscriptionStatus();

  return (
    <Layout>
      <SEOHead />
      <div className="pointer-events-none fixed inset-x-0 bottom-0 h-[30vh] bg-gradient-to-t from-primary/10 via-primary/5 to-transparent z-30" />

      <section className="pt-4 pb-0 relative z-10">
        <div className="px-2.5 sm:px-4 md:px-6 lg:px-8 max-w-4xl mx-auto space-y-3 pb-6">

          {journeyConfigs.map((config, index) => (
            <JourneyCard key={config.key} config={config} index={index} isSubscriptionActive={subLoading || isUnlocked} tier={subLoading ? undefined : tier} />
          ))}
          
          <ShareAppButton />
          <FooterCard />
        </div>
      </section>
    </Layout>
  );
};

export default Index;
