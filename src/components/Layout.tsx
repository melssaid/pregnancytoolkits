import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Heart, Settings, Gift } from "lucide-react";
const logoImage = "/logo.webp";
import { useTranslation } from "react-i18next";
import { BackButton } from "./BackButton";
import { BottomNavigation } from "./BottomNavigation";
import { EncryptionIndicator } from "./EncryptionIndicator";
import { LanguageDropdown } from "./LanguageDropdown";
import { TrialExpiryBanner } from "./TrialExpiryBanner";
import { useEffect } from "react";

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
      {/* Trial Expiry Banner */}
      <TrialExpiryBanner />
      {/* Trust Bar - Above header */}
      <motion.div 
        className="relative overflow-hidden bg-gradient-to-r from-primary/95 via-primary to-primary/95 text-primary-foreground"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Animated shimmer overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 4, ease: 'linear' }}
        />
        
        <div className="relative flex items-center justify-center gap-4 sm:gap-6 pt-2 pb-2 px-4">
          <motion.span 
            className={`${trustTextSize} font-extrabold tracking-widest uppercase drop-shadow-md text-primary-foreground`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
          >
            {t('layout.trustBar.scienceBacked', 'Science-Backed')}
          </motion.span>
          
          <motion.span 
            className="w-1 h-1 rounded-full bg-primary-foreground/50 flex-shrink-0"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
          />
          
          <motion.span 
            className={`${trustTextSize} font-extrabold tracking-widest uppercase drop-shadow-md text-primary-foreground`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5, ease: 'easeOut' }}
          >
            {t('layout.trustBar.aiTools', '23+ Smart Tools')}
          </motion.span>
          
          <motion.span 
            className="hidden sm:block w-1 h-1 rounded-full bg-primary-foreground/50 flex-shrink-0"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.65, type: 'spring', stiffness: 300 }}
          />
          
          <motion.span 
            className={`hidden sm:inline ${trustTextSize} font-extrabold tracking-widest uppercase drop-shadow-md text-primary-foreground`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5, ease: 'easeOut' }}
          >
            {t('layout.trustBar.premium')}
          </motion.span>
        </div>
        {/* Animated glowing bottom line */}
        <div className="relative h-[3px] overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary-foreground/15 via-primary-foreground/60 to-primary-foreground/15"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          />
          <motion.div
            className="absolute h-full w-1/4 bg-gradient-to-r from-transparent via-white/90 to-transparent rounded-full blur-[2px]"
            initial={{ x: '-100%' }}
            animate={{ x: '500%' }}
            transition={{ delay: 0.8, duration: 1.8, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
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
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            {showBack && <BackButton />}
            
              <Link to="/" className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: showBack ? 80 : 72, height: showBack ? 80 : 72 }}>
                {/* Rotating ring */}
                {showBack && (
                  <>
                    <motion.div
                      className="absolute rounded-full border border-primary/15"
                      style={{ width: 76, height: 76 }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    />
                    {/* Heart particles */}
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
                    {/* Aura */}
                    <motion.div
                      className="absolute rounded-full bg-primary/8 blur-lg"
                      style={{ width: 68, height: 68 }}
                      animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </>
                )}
                <div className={`rounded-full overflow-hidden shadow-lg ${showBack ? 'h-11 w-11' : 'h-[3.2rem] w-[3.2rem]'}`}>
                  <img 
                    src={logoImage} 
                    alt="Pregnancy Toolkits" 
                    width={showBack ? 64 : 52}
                    height={showBack ? 64 : 52}
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              {showBack ? (
                <span className="text-[13px] font-bold text-foreground tracking-tight leading-snug break-words">
                  {t('app.name')}
                </span>
              ) : (
                <div className="flex flex-col min-w-0">
                  <span className="text-[13.5px] font-bold text-foreground tracking-tight leading-snug break-words">
                    {t('app.name')}
                  </span>
                  <span className="text-[10.5px] text-muted-foreground font-medium mt-0.5 leading-snug break-words">
                    {t('app.tagline')}
                  </span>
                </div>
              )}
            </Link>
          </div>

          <div className="flex items-center gap-1.5">
            <LanguageDropdown variant="compact" />

            <div className="hidden md:flex">
              <EncryptionIndicator />
            </div>

            <Link 
              to="/settings"
              className="hidden md:flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              title="Settings"
            >
              <Settings className="h-4.5 w-4.5" />
            </Link>
          </div>
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
      <footer className="border-t border-border border-b-4 border-b-primary/20 bg-card py-5 pb-24 md:pb-5 rounded-t-[2rem]">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2.5">
              <img src={logoImage} alt="Logo" width={32} height={32} loading="lazy" decoding="async" className="h-8 w-8 rounded-full object-cover grayscale opacity-60" />
              <span className="text-sm font-bold text-muted-foreground/50">{t('app.name')}</span>
            </div>
            
            {/* Styled Links Container */}
            <div className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 border border-border/60 shadow-sm">
              <Link to="/privacy" className="text-[10px] text-muted-foreground hover:text-primary transition-colors duration-200 px-2.5 py-1 rounded-full hover:bg-primary/10 active:scale-95">
                {t('layout.footer.privacy', 'Privacy')}
              </Link>
              <span className="text-muted-foreground/40">•</span>
              <Link to="/terms" className="text-[10px] text-muted-foreground hover:text-primary transition-colors duration-200 px-2.5 py-1 rounded-full hover:bg-primary/10 active:scale-95">
                {t('layout.footer.terms', 'Terms')}
              </Link>
              <span className="text-muted-foreground/40">•</span>
              <Link to="/contact" className="text-[10px] text-muted-foreground hover:text-primary transition-colors duration-200 px-2.5 py-1 rounded-full hover:bg-primary/10 active:scale-95">
                {t('layout.footer.contact', 'Contact')}
              </Link>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            {t('app.footer')}
          </p>
        </div>
      </footer>
    </div>
  );
}
