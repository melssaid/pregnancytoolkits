import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Award, Heart, Settings } from "lucide-react";
import logoImage from "@/assets/logo.png";
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
      {/* Top Trust Bar - Compact & Professional */}
      <div className="bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground py-1 px-3">
        <div className="container flex items-center justify-center gap-3 sm:gap-5 text-[10px] font-medium tracking-wide">
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            <span>{t('layout.trustBar.scienceBacked', 'Science-Backed')}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1">
            <Heart className="h-3 w-3" />
            <span>{t('layout.trustBar.aiTools', '42+ AI Tools')}</span>
          </div>
          <div className="flex items-center gap-1">
            <Award className="h-3 w-3" />
            <span>{t('layout.trustBar.freeAccess', 'Free Access')}</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-md shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            {showBack && <BackButton />}
            
            <Link to="/" className="flex items-center gap-2.5">
              <img 
                src={logoImage} 
                alt="Pregnancy Toolkits" 
                width={showBack ? 36 : 44}
                height={showBack ? 36 : 44}
                loading="eager"
                decoding="async"
                className={`rounded-full shadow-lg object-cover ${showBack ? 'h-9 w-9' : 'h-11 w-11'}`}
              />
              {showBack ? (
                <span className="text-sm font-bold text-foreground tracking-tight truncate max-w-[120px] sm:max-w-none">
                  {t('app.name')}
                </span>
              ) : (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-foreground tracking-tight whitespace-nowrap truncate max-w-[180px] sm:max-w-[240px] md:max-w-none">
                    {t('app.name')}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground font-medium mt-0.5 whitespace-nowrap truncate max-w-[180px] sm:max-w-[240px] md:max-w-none">
                    {t('app.tagline')}
                  </span>
                </div>
              )}
            </Link>
          </div>

          <div className="flex items-center gap-1">
            <LanguageDropdown variant="compact" />

            <div className="hidden md:flex">
              <EncryptionIndicator />
            </div>

            <Link 
              to="/settings"
              className="hidden md:flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>


      {/* Decorative Side Borders */}
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/30 via-primary/50 to-primary/30 z-40" />
      <div className="hidden lg:block fixed right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/30 via-primary/50 to-primary/30 z-40" />

      {/* Main Content */}
      <main className="flex-1">
        {children}

        {/* Bottom Navigation for Mobile */}
        <BottomNavigation />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <img src={logoImage} alt="Logo" width={24} height={24} loading="lazy" decoding="async" className="h-6 w-6 rounded-full object-cover" />
              <span className="text-sm font-bold text-foreground">{t('app.name')}</span>
            </div>
            
            {/* Styled Links Container */}
            <motion.div 
              className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 border border-border/60 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link to="/privacy" className="group relative text-[10px] text-muted-foreground hover:text-primary transition-all duration-300 px-2.5 py-1 rounded-full hover:bg-primary/10 active:scale-95">
                <span className="relative z-10">{t('layout.footer.privacy', 'Privacy')}</span>
                <motion.span 
                  className="absolute inset-0 bg-primary/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  layoutId="footer-hover"
                />
              </Link>
              <span className="text-muted-foreground/40">•</span>
              <Link to="/terms" className="group relative text-[10px] text-muted-foreground hover:text-primary transition-all duration-300 px-2.5 py-1 rounded-full hover:bg-primary/10 active:scale-95">
                <span className="relative z-10">{t('layout.footer.terms', 'Terms')}</span>
                <motion.span 
                  className="absolute inset-0 bg-primary/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  layoutId="footer-hover"
                />
              </Link>
              <span className="text-muted-foreground/40">•</span>
              <Link to="/contact" className="group relative text-[10px] text-muted-foreground hover:text-primary transition-all duration-300 px-2.5 py-1 rounded-full hover:bg-primary/10 active:scale-95">
                <span className="relative z-10">{t('layout.footer.contact', 'Contact')}</span>
                <motion.span 
                  className="absolute inset-0 bg-primary/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  layoutId="footer-hover"
                />
              </Link>
            </motion.div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            {t('app.footer')}
          </p>
          
          {/* Medical Disclaimer */}
          <div className="mt-6 pt-4 border-t border-border/50">
            <p className="text-[10px] text-muted-foreground/70 text-center leading-relaxed max-w-3xl mx-auto">
              <span className="font-medium">{t('layout.footer.disclaimerTitle', 'Medical Disclaimer')}:</span> {t('layout.footer.disclaimerText', 'This app is for educational and informational purposes only and does not provide medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for any health concerns.')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
