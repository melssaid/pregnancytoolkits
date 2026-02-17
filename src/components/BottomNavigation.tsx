import { forwardRef, useState, memo } from "react";
import { LayoutDashboard, Search, Settings, Bell } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { SearchDialog } from "./SearchDialog";
import { NotificationsPanel } from "./dashboard/NotificationsPanel";
import { useNotifications } from "@/hooks/useNotifications";

const NAV_ITEM_IDS = [
  { id: "dashboard", icon: LayoutDashboard, labelKey: "nav.dashboard", href: "/dashboard" },
  { id: "notifications", icon: Bell, labelKey: "nav.alerts", href: null },
  { id: "search", icon: Search, labelKey: "nav.search", href: null },
  { id: "settings", icon: Settings, labelKey: "nav.settings", href: "/settings" },
] as const;

export const BottomNavigation = memo(forwardRef<HTMLDivElement, Record<string, never>>(
  function BottomNavigation(_, ref) {
    const location = useLocation();
    const { t } = useTranslation();
    const [searchOpen, setSearchOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const { unreadCount } = useNotifications();

    const isActive = (href: string | null) => {
      if (!href) return false;
      if (href === "/") return location.pathname === "/";
      return location.pathname.startsWith(href);
    };

    return (
      <>
        {/* Notifications Panel */}
        <AnimatePresence>
          {notificationsOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setNotificationsOpen(false)}
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed bottom-[4.5rem] left-2 right-2 z-50 max-h-[70vh] overflow-auto rounded-2xl bg-card border border-border/40 shadow-2xl md:hidden"
              >
                <div className="p-3">
                  <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-3" />
                  <NotificationsPanel />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Spacer */}
        <div className="h-[4.5rem] md:h-0" />
        
        {/* Bottom Navigation */}
        <nav ref={ref} className="fixed bottom-0 left-0 right-0 z-50 md:hidden px-3 pb-1 safe-area-bottom">
          {/* Decorative frame */}
          <div className="relative rounded-2xl overflow-hidden">
            {/* Top glow line */}
            <div className="absolute top-0 left-4 right-4 h-[3px] bg-gradient-to-r from-transparent via-primary/60 to-transparent z-10" />
            
            {/* Glass background */}
            <div className="absolute inset-0 bg-card/90 backdrop-blur-xl border border-border/30 rounded-2xl shadow-[0_-6px_40px_0px_hsl(340_65%_65%/0.45),0_-2px_15px_0px_hsl(340_65%_65%/0.3)]" />
            
            <div className="relative flex items-center justify-evenly px-1 py-2.5">
              {NAV_ITEM_IDS.map((item, idx) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                const isLast = idx === NAV_ITEM_IDS.length - 1;

                const separator = !isLast ? (
                  <div key={`sep-${idx}`} className="w-[1.5px] h-8 rounded-full bg-border self-center mx-0.5" />
                ) : null;

                let navElement: React.ReactNode;

                if (item.id === "notifications") {
                  navElement = (
                    <button
                      key={item.id}
                      onClick={() => {
                        setNotificationsOpen(!notificationsOpen);
                        setSearchOpen(false);
                      }}
                      className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all relative"
                    >
                      <motion.div
                        className={`p-2 rounded-xl transition-all ${
                          notificationsOpen 
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Icon className="w-[18px] h-[18px]" />
                        {unreadCount > 0 && !notificationsOpen && (
                          <span className="absolute -top-0.5 right-0 w-4 h-4 bg-destructive text-destructive-foreground text-[8px] font-bold rounded-full flex items-center justify-center ring-2 ring-card">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </motion.div>
                      <span className={`text-[9px] font-medium ${
                        notificationsOpen ? "text-primary" : "text-muted-foreground"
                      }`}>
                        {t(item.labelKey)}
                      </span>
                    </button>
                  );
                } else if (item.id === "search") {
                  navElement = (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSearchOpen(true);
                        setNotificationsOpen(false);
                      }}
                      className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all"
                    >
                      <motion.div
                        className={`p-2 rounded-xl transition-all ${
                          searchOpen 
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Icon className="w-[18px] h-[18px]" />
                      </motion.div>
                      <span className={`text-[9px] font-medium ${
                        searchOpen ? "text-primary" : "text-muted-foreground"
                      }`}>
                        {t(item.labelKey)}
                      </span>
                    </button>
                  );
                } else {
                  navElement = (
                    <Link
                      key={item.id}
                      to={item.href!}
                      onClick={() => setNotificationsOpen(false)}
                      className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all"
                    >
                      <motion.div 
                        className={`p-2 rounded-xl transition-all ${
                          active 
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Icon className="w-[18px] h-[18px]" />
                      </motion.div>
                      <span className={`text-[9px] font-medium ${
                        active ? "text-primary" : "text-muted-foreground"
                      }`}>
                        {t(item.labelKey)}
                      </span>
                    </Link>
                  );
                }

                return (
                  <>{navElement}{separator}</>
                );
              })}
            </div>
          </div>
        </nav>

        <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      </>
    );
  }
));

BottomNavigation.displayName = "BottomNavigation";
