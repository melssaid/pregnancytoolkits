import { forwardRef, useState, memo } from "react";
import { Home, LayoutDashboard, Search, Settings, Bell } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SearchDialog } from "./SearchDialog";
import { NotificationsPanel } from "./dashboard/NotificationsPanel";
import { useNotifications } from "@/hooks/useNotifications";

const navItems = [
  { id: "home", icon: Home, label: "Home", href: "/" },
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { id: "notifications", icon: Bell, label: "Alerts", href: null },
  { id: "search", icon: Search, label: "Search", href: null },
  { id: "settings", icon: Settings, label: "Settings", href: "/settings" },
];

export const BottomNavigation = memo(forwardRef<HTMLDivElement, Record<string, never>>(
  function BottomNavigation(_, ref) {
    const location = useLocation();
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
        {/* Notifications Panel - Slides up from bottom */}
        <AnimatePresence>
          {notificationsOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setNotificationsOpen(false)}
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              />
              {/* Panel */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed bottom-14 left-0 right-0 z-50 max-h-[70vh] overflow-auto rounded-t-2xl bg-card border-t border-border shadow-2xl md:hidden safe-area-bottom"
              >
                <div className="p-3">
                  <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-3" />
                  <NotificationsPanel />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Spacer to prevent content from being hidden behind nav */}
        <div className="h-14 md:h-0" />
        
        {/* Bottom Navigation - Mobile only */}
        <nav ref={ref} className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
          {/* Glass effect background */}
          <div className="absolute inset-0 bg-card/95 backdrop-blur-lg border-t border-border/40 shadow-[0_-4px_12px_-2px_rgba(0,0,0,0.08)]" />
          
          <div className="relative flex items-center justify-around px-1 py-1.5 safe-area-bottom">
            {navItems
              // Hide Home button on Settings page
              .filter((item) => !(item.id === "home" && location.pathname === "/settings"))
              .map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;

              // Notifications button
              if (item.id === "notifications") {
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setNotificationsOpen(!notificationsOpen);
                      setSearchOpen(false);
                    }}
                    className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors relative"
                  >
                    <div className={`p-1.5 rounded-lg transition-all ${
                      notificationsOpen 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground"
                    }`}>
                      <Icon className="w-4 h-4" />
                      {unreadCount > 0 && !notificationsOpen && (
                        <span className="absolute top-0 right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[8px] font-bold rounded-full flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </div>
                    <span className={`text-[9px] font-medium ${
                      notificationsOpen ? "text-primary" : "text-muted-foreground"
                    }`}>
                      {item.label}
                    </span>
                  </button>
                );
              }

              // Search button
              if (item.id === "search") {
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSearchOpen(true);
                      setNotificationsOpen(false);
                    }}
                    className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors"
                  >
                    <div className={`p-1.5 rounded-lg transition-all ${
                      searchOpen 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[9px] font-medium ${
                      searchOpen ? "text-primary" : "text-muted-foreground"
                    }`}>
                      {item.label}
                    </span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.id}
                  to={item.href!}
                  onClick={() => setNotificationsOpen(false)}
                  className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors"
                >
                  <motion.div 
                    className={`p-1.5 rounded-lg transition-all ${
                      active 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground"
                    }`}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.div>
                  <span className={`text-[9px] font-medium ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Search Dialog */}
        <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      </>
    );
  }
));

BottomNavigation.displayName = "BottomNavigation";
