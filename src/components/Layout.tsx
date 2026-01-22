import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ArrowLeft, Home } from "lucide-react";
import { useTranslation } from "react-i18next";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
}

export function Layout({ children, title, showBack = false }: LayoutProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            {showBack && (
              <Link 
                to="/"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('app.back')}
              </Link>
            )}
            
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
                <Heart className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">
                {t('app.name')}
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
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

      {/* Main Content */}
      <main className="flex-1">
        {title && (
          <div className="border-b border-border bg-card">
            <div className="container py-8">
              <motion.h1 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold text-foreground"
              >
                {title}
              </motion.h1>
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
              <Heart className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-foreground">{t('app.name')}</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {t('app.footer')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
