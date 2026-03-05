import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Heart, Settings } from "lucide-react";
import logoImage from "@/assets/logo.webp";
import { useTranslation } from "react-i18next";
import { BackButton } from "./BackButton";
import { BottomNavigation } from "./BottomNavigation";
import { EncryptionIndicator } from "./EncryptionIndicator";
import { LanguageDropdown } from "./LanguageDropdown";



interface LayoutProps {
  children: React.ReactNode;
  showBack?: boolean;
}

export function Layout({ children, showBack = false }: LayoutProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
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
        
        <div className="relative flex items-center justify-center gap-4 sm:gap-6 py-1.5 px-4">
          <motion.span 
            className="text-[9.5px] font-extrabold tracking-widest uppercase drop-shadow-md text-primary-foreground"
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
            className="text-[9.5px] font-extrabold tracking-widest uppercase drop-shadow-md text-primary-foreground"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5, ease: 'easeOut' }}
          >
            {t('layout.trustBar.aiTools', '42+ AI Tools')}
          </motion.span>
          
          <motion.span 
            className="hidden sm:block w-1 h-1 rounded-full bg-primary-foreground/50 flex-shrink-0"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.65, type: 'spring', stiffness: 300 }}
          />
          
          <motion.span 
            className="hidden sm:inline text-[9.5px] font-extrabold tracking-widest uppercase drop-shadow-md text-primary-foreground"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5, ease: 'easeOut' }}
          >
            {t('layout.trustBar.premium')}
          </motion.span>
        </div>
        {/* Animated gradient bottom line */}
        <motion.div
          className="h-[2px] bg-gradient-to-r from-transparent via-primary-foreground/40 to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.7, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </motion.div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md shadow-sm border-b border-border/30">
        <div className="flex h-[4.5rem] items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            {showBack && <BackButton />}
            
              <Link to="/" className="flex items-center gap-2.5">
              <div className="rounded-full overflow-hidden flex-shrink-0 h-11 w-11">
                <img 
                  src={logoImage} 
                  alt="Pregnancy Toolkits" 
                  width={44}
                  height={44}
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover scale-[1.3]"
                />
              </div>
              {showBack ? (
                <span className="text-[14px] font-bold text-foreground tracking-tight truncate max-w-[120px] sm:max-w-none">
                  {t('app.name')}
                </span>
              ) : (
                <div className="flex flex-col min-w-0">
                  <span className="text-[14.5px] font-bold text-foreground tracking-tight whitespace-nowrap truncate max-w-[180px] sm:max-w-[240px] md:max-w-none">
                    {t('app.name')}
                  </span>
                  <span className="text-[10.5px] text-muted-foreground font-medium mt-0.5 whitespace-nowrap truncate max-w-[180px] sm:max-w-[240px] md:max-w-none">
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
      <main>
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
