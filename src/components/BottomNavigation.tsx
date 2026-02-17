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
        <nav ref={ref} className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-area-bottom">
          {/* Full-width clean bar */}
        <div className="relative">
            {/* Top accent line */}
            <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent z-10" />
            
            {/* Clean background - no border, edge-to-edge */}
            <div className="absolute inset-0 bg-card/95 backdrop-blur-xl shadow-[0_-4px_30px_0px_hsl(340_65%_65%/0.3)]" />
            
            <div className="relative flex items-center justify-evenly px-2 py-2">
              {NAV_ITEM_IDS.map((item, idx) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                const isLast = idx === NAV_ITEM_IDS.length - 1;

                const separator = !isLast ? (
                  <div key={`sep-${idx}`} className="w-px h-6 bg-border/50 self-center" />
                ) : null;

                const isItemActive = item.id === "notifications" ? notificationsOpen : item.id === "search" ? searchOpen : active;

                const iconContent = (
                  <motion.div
                    className="relative p-2.5 rounded-xl transition-all duration-200"
                    whileTap={{ scale: 0.88 }}
                    animate={isItemActive ? { y: -2 } : { y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    {/* Active glow background */}
                    <AnimatePresence>
                      {isItemActive && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="absolute inset-0 bg-primary/10 rounded-xl"
                        />
                      )}
                    </AnimatePresence>
                    
                    <Icon 
                      className={`w-5 h-5 relative z-10 transition-colors duration-200 ${
                        isItemActive ? "text-primary" : "text-foreground/50"
                      }`} 
                      strokeWidth={isItemActive ? 2.2 : 1.8} 
                    />
                    
                    {item.id === "notifications" && unreadCount > 0 && !notificationsOpen && (
                      <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-destructive text-destructive-foreground text-[7px] font-bold rounded-full flex items-center justify-center ring-1.5 ring-card z-20">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}

                    {/* Active dot indicator */}
                    <AnimatePresence>
                      {isItemActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 25 }}
                          className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                        />
                      )}
                    </AnimatePresence>
                  </motion.div>
                );

                const labelClass = `text-[9px] font-medium tracking-wide transition-colors duration-200 ${
                  isItemActive ? "text-primary" : "text-foreground/50"
                }`;

                let navElement: React.ReactNode;

                if (item.id === "notifications") {
                  navElement = (
                    <button
                      key={item.id}
                      onClick={() => {
                        setNotificationsOpen(!notificationsOpen);
                        setSearchOpen(false);
                      }}
                      className="flex flex-col items-center gap-0 px-3 py-0.5 transition-all relative"
                    >
                      {iconContent}
                      <span className={labelClass}>{t(item.labelKey)}</span>
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
                      className="flex flex-col items-center gap-0 px-3 py-0.5 transition-all"
                    >
                      {iconContent}
                      <span className={labelClass}>{t(item.labelKey)}</span>
                    </button>
                  );
                } else {
                  navElement = (
                    <Link
                      key={item.id}
                      to={item.href!}
                      onClick={() => setNotificationsOpen(false)}
                      className="flex flex-col items-center gap-0 px-3 py-0.5 transition-all"
                    >
                      {iconContent}
                      <span className={labelClass}>{t(item.labelKey)}</span>
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
