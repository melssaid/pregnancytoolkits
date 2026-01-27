import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Shield, Award, Search, Heart } from "lucide-react";
import logoImage from "@/assets/logo.png";
import { useTranslation } from "react-i18next";
import { BackButton } from "./BackButton";
import { SearchDialog } from "./SearchDialog";
import { NotificationCenter } from "./NotificationCenter";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
}

export function Layout({ children, title, showBack = false }: LayoutProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Trust Bar - Simplified for Compliance */}
      <div className="bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground py-2 px-4">
        <div className="container flex items-center justify-center gap-4 sm:gap-6 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            <span>Evidence-Based Tools</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <Heart className="h-3.5 w-3.5" />
            <span>42 Wellness Tools</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5" />
            <span>Professional Quality</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-md shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            {showBack && <BackButton />}
            
            {!showBack && (
              <Link to="/" className="flex items-center gap-2.5">
                <img 
                  src={logoImage} 
                  alt="Pregnancy Toolkits" 
                  className="h-11 w-11 rounded-full shadow-lg object-cover"
                />
                <div className="flex flex-col">
                  <span className="text-sm sm:text-base font-bold text-foreground leading-tight">
                    Pregnancy Toolkits
                  </span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground leading-tight">
                    Your complete pregnancy companion
                  </span>
                </div>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Smart Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-muted/60 hover:bg-muted px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-all duration-200 border border-transparent hover:border-border"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden md:inline-flex items-center gap-0.5 rounded bg-background/80 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground border border-border/50">
                ⌘K
              </kbd>
            </button>

            {/* Notification Center */}
            <NotificationCenter />

            {!isHome && (
              <Link 
                to="/"
                className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">{t('app.allToolsBtn')}</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Search Dialog */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Decorative Side Borders */}
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/30 via-primary/50 to-primary/30 z-40" />
      <div className="hidden lg:block fixed right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/30 via-primary/50 to-primary/30 z-40" />

      {/* Main Content */}
      <main className="flex-1">
        {title && (
          <div className="bg-gradient-to-b from-card to-background border-b border-border/50">
            <div className="container py-6">
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4"
              >
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                  {title}
                </h1>
              </motion.div>
            </div>
          </div>
        )}
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <img src={logoImage} alt="Logo" className="h-6 w-6 rounded-full object-cover" />
              <span className="text-sm font-bold text-foreground">{t('app.name')}</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center mt-4">
            {t('app.footer')}
          </p>
        </div>
      </footer>
    </div>
  );
}
