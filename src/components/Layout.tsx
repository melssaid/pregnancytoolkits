import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Heart, Settings, Gift, Share2 } from "lucide-react";
import { toast } from "sonner";
const logoImage = "/logo.webp";
import { useTranslation } from "react-i18next";
import { BackButton } from "./BackButton";
import { BottomNavigation } from "./BottomNavigation";
import { EncryptionIndicator } from "./EncryptionIndicator";
import { LanguageDropdown } from "./LanguageDropdown";
import { TrialExpiryBanner } from "./TrialExpiryBanner";
import { SmartAppBanner } from "./SmartAppBanner";
import { BreadcrumbSchema } from "./BreadcrumbSchema";
import { useEffect } from "react";
import { getTotalToolsCount } from "@/lib/tools-data";

interface LayoutProps {
  children: React.ReactNode;
  showBack?: boolean;
}

export function Layout({ children, showBack = false }: LayoutProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const trustTextSize = isRtl ? 'text-[9.5px]' : 'text-[8px]';

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("app:first-render"));
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      <BreadcrumbSchema />
      {/* Smart App Banner — web only, not inside TWA */}
      <SmartAppBanner />
      {/* Trial Expiry Banner */}
      <TrialExpiryBanner />
      {/* Trust Bar - Above header */}
      <motion.div 
        className="relative overflow-hidden bg-primary text-primary-foreground"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Dark edge gradient overlay — under content */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 pointer-events-none" />
        {/* Animated shimmer overlay — brighter */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: 'linear' }}
        />
        {/* Secondary subtle shimmer for extra glow */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          initial={{ x: '200%' }}
          animate={{ x: '-100%' }}
          transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 2, ease: 'linear' }}
        />
        
        <div className="relative flex items-center justify-center gap-4 sm:gap-6 pt-2 pb-2 px-4">
          <motion.span 
            className={`${trustTextSize} font-extrabold tracking-widest uppercase drop-shadow-lg text-primary-foreground`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
          >
            {t('layout.trustBar.scienceBacked', 'Science-Backed')}
          </motion.span>
          
          <motion.span 
            className="w-1.5 h-1.5 rounded-full bg-primary-foreground/70 flex-shrink-0 shadow-[0_0_6px_2px_rgba(255,255,255,0.4)]"
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ delay: 0.5, duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          
          <motion.span 
            className={`${trustTextSize} font-extrabold tracking-widest uppercase drop-shadow-lg text-primary-foreground`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5, ease: 'easeOut' }}
          >
            {t('layout.trustBar.aiTools', { count: getTotalToolsCount(), defaultValue: '{{count}}+ Smart Tools' })}
          </motion.span>
          
          <motion.span 
            className="hidden sm:block w-1.5 h-1.5 rounded-full bg-primary-foreground/70 flex-shrink-0 shadow-[0_0_6px_2px_rgba(255,255,255,0.4)]"
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ delay: 0.65, duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          
          <motion.span 
            className={`hidden sm:inline ${trustTextSize} font-extrabold tracking-widest uppercase drop-shadow-lg text-primary-foreground`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5, ease: 'easeOut' }}
          >
            {t('layout.trustBar.premium')}
          </motion.span>
        </div>
        {/* Animated glowing bottom line — brighter */}
        <div className="relative h-[3px] overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary-foreground/20 via-primary-foreground/70 to-primary-foreground/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          />
          <motion.div
            className="absolute h-full w-1/3 bg-gradient-to-r from-transparent via-white to-transparent rounded-full blur-[1px]"
            initial={{ x: '-100%' }}
            animate={{ x: '500%' }}
            transition={{ delay: 0.8, duration: 1.5, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>


      {/* Header - flush with trust bar */}
      <header className="sticky top-0 z-50 bg-card backdrop-blur-md border-b-0" style={{ boxShadow: '0 6px 30px -2px hsl(340 40% 25% / 0.25), 0 3px 12px -2px hsl(0 0% 0% / 0.15)' }}>
        {/* Curved bottom edge */}
        <div className="absolute -bottom-[14px] left-0 right-0 h-[14px] overflow-hidden pointer-events-none z-10">
          <svg viewBox="0 0 1440 90" fill="none" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,0 L0,5 C200,90 400,90 720,90 C1040,90 1240,90 1440,5 L1440,0 Z" className="fill-card" />
          </svg>
        </div>
        <div className={`flex h-16 items-center ${showBack ? 'justify-between' : 'justify-center'} px-4`}>
          {showBack ? (
            /* Sub-pages: back button + logo + name on left */
            <div className="flex items-center gap-2.5">
              <BackButton />
              <Link to="/" className="flex items-center gap-2.5">
                <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: 80, height: 80 }}>
                  {/* Rotating ring */}
                  <>
                    <motion.div
                      className="absolute rounded-full border border-primary/15"
                      style={{ width: 76, height: 76 }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    />
                    {[0, 1, 2, 3, 4, 5].map((i) => {
                      const angle = (i / 6) * 360;
                      const radius = 34;
                      const isPink = i % 2 === 1;
                      return (
                        <motion.span
                          key={i}
                          className={`absolute ${isPink ? 'text-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.6)]' : 'text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]'}`}
                          style={{ fontSize: isPink ? 11 : 10 }}
                          animate={isPink ? {
                            x: [
                              Math.cos((angle * Math.PI) / 180) * radius,
                              Math.cos(((angle + 180) * Math.PI) / 180) * (radius * 0.7),
                              Math.cos(((angle + 360) * Math.PI) / 180) * radius,
                            ],
                            y: [
                              Math.sin((angle * Math.PI) / 180) * radius,
                              Math.sin(((angle + 180) * Math.PI) / 180) * (radius * 0.7),
                              Math.sin(((angle + 360) * Math.PI) / 180) * radius,
                            ],
                            scale: [0.6, 1.5, 0.6],
                            opacity: [0.3, 0.9, 0.3],
                            rotate: [0, 20, -20, 0],
                          } : {
                            x: [
                              Math.cos((angle * Math.PI) / 180) * radius,
                              Math.cos(((angle + 360) * Math.PI) / 180) * radius,
                            ],
                            y: [
                              Math.sin((angle * Math.PI) / 180) * radius,
                              Math.sin(((angle + 360) * Math.PI) / 180) * radius,
                            ],
                            scale: [0.8, 1.3, 0.8],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={isPink ? {
                            x: { duration: 12, repeat: Infinity, ease: "easeInOut" },
                            y: { duration: 12, repeat: Infinity, ease: "easeInOut" },
                            scale: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 },
                            opacity: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 },
                            rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                          } : {
                            x: { duration: 8, repeat: Infinity, ease: "linear" },
                            y: { duration: 8, repeat: Infinity, ease: "linear" },
                            scale: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 },
                            opacity: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 },
                          }}
                        >
                          ♥
                        </motion.span>
                      );
                    })}
                    <motion.div
                      className="absolute rounded-full bg-primary/8 blur-lg"
                      style={{ width: 68, height: 68 }}
                      animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </>
                  <div className="rounded-full overflow-hidden shadow-lg h-11 w-11">
                    <img src={logoImage} alt="Pregnancy Toolkits" width={64} height={64} loading="eager" decoding="async" fetchPriority="high" className="w-full h-full object-cover" />
                  </div>
                </div>
                <span className="text-[13px] font-extrabold text-foreground tracking-tight leading-snug break-words" style={{ fontFamily: "'Tajawal', 'Plus Jakarta Sans', system-ui, sans-serif", fontWeight: 700 }}>
                  {t('app.name')}
                </span>
              </Link>
            </div>
          ) : (
            /* Homepage: centered logo only, no title */
            <>
              {/* Left spacer for centering */}
              <div className="absolute left-4 flex items-center gap-1.5">
                <LanguageDropdown variant="compact" />
              </div>
              <Link to="/" className="flex items-center justify-center">
                <div className="rounded-full overflow-hidden shadow-xl ring-2 ring-primary/10 h-11 w-11">
                  <img src={logoImage} alt="Pregnancy Toolkits" width={44} height={44} loading="eager" decoding="async" fetchPriority="high" className="w-full h-full object-cover" />
                </div>
              </Link>
              <div className="absolute right-4 flex items-center gap-1.5">
                <div className="hidden md:flex">
                  <EncryptionIndicator />
                </div>
                <Link to="/settings" className="hidden md:flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" title="Settings">
                  <Settings className="h-4.5 w-4.5" />
                </Link>
              </div>
            </>
          )}

          {showBack && (
            <div className="flex items-center gap-1.5">
              <LanguageDropdown variant="compact" />
              <div className="hidden md:flex">
                <EncryptionIndicator />
              </div>
              <Link to="/settings" className="hidden md:flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" title="Settings">
                <Settings className="h-4.5 w-4.5" />
              </Link>
            </div>
          )}
        </div>
      </header>


      {/* Decorative Side Borders */}
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/30 via-primary/50 to-primary/30 z-40" />
      <div className="hidden lg:block fixed right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/30 via-primary/50 to-primary/30 z-40" />

      {/* Main Content */}
      <main className="pt-5">
        {children}

        {/* Bottom Navigation for Mobile */}
        <BottomNavigation />
      </main>


      {/* Footer */}
      <footer className="border-t border-border/30 bg-gradient-to-b from-card to-muted/20 py-8 pb-28 md:pb-8">
        <div className="container max-w-lg mx-auto px-4">
          {/* Logo & Brand */}
          <div className="flex flex-col items-center gap-3 mb-5">
            <img src={logoImage} alt="Logo" width={36} height={36} loading="lazy" decoding="async" className="h-9 w-9 rounded-full object-cover shadow-sm" />
            <span className="text-xs font-semibold text-muted-foreground/60">{t('app.name')}</span>
          </div>



          {/* Navigation Links */}
          <div className="grid grid-cols-4 gap-2 mb-5">
            <Link to="/privacy" className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-card border border-border/20 hover:border-primary/20 hover:bg-primary/[0.04] transition-all duration-200 group">
              <div className="w-8 h-8 rounded-lg bg-muted/50 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                <Shield className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" strokeWidth={1.8} />
              </div>
              <span className="text-[9px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">
                {t('layout.footer.privacy', 'Privacy')}
              </span>
            </Link>
            <Link to="/terms" className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-card border border-border/20 hover:border-primary/20 hover:bg-primary/[0.04] transition-all duration-200 group">
              <div className="w-8 h-8 rounded-lg bg-muted/50 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                <svg className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </div>
              <span className="text-[9px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">
                {t('layout.footer.terms', 'Terms')}
              </span>
            </Link>
            <Link to="/contact" className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-card border border-border/20 hover:border-primary/20 hover:bg-primary/[0.04] transition-all duration-200 group">
              <div className="w-8 h-8 rounded-lg bg-muted/50 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                <Heart className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" strokeWidth={1.8} />
              </div>
              <span className="text-[9px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">
                {t('layout.footer.contact', 'Contact')}
              </span>
            </Link>
            <Link to="/testimonials" className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-card border border-border/20 hover:border-primary/20 hover:bg-primary/[0.04] transition-all duration-200 group">
              <div className="w-8 h-8 rounded-lg bg-muted/50 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                <svg className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              </div>
              <span className="text-[9px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">
                {t('layout.footer.testimonials', 'Reviews')}
              </span>
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-[10px] text-muted-foreground/50 text-center font-medium">
            {t('app.footer')}
          </p>
        </div>
      </footer>
    </div>
  );
}
