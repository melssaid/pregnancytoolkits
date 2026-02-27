import { forwardRef, useState, memo } from "react";
import { Home, LayoutDashboard, Sparkles, Menu, Search, Bell, Settings, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { SearchDialog } from "./SearchDialog";
import { NotificationsPanel } from "./dashboard/NotificationsPanel";
import { useNotifications } from "@/hooks/useNotifications";

const NAV_ITEMS = [
  { id: "home", icon: Home, labelKey: "nav.home", href: "/" },
  { id: "dashboard", icon: LayoutDashboard, labelKey: "nav.dashboard", href: "/dashboard" },
  { id: "ai-tools", icon: Sparkles, labelKey: "nav.aiTools", href: "/#ai-tools" },
  { id: "more", icon: Menu, labelKey: "nav.more", href: null },
] as const;

export const BottomNavigation = memo(forwardRef<HTMLDivElement, Record<string, never>>(
  function BottomNavigation(_, ref) {
    const location = useLocation();
    const { t } = useTranslation();
    const [searchOpen, setSearchOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);
    const { unreadCount } = useNotifications();

    const isActive = (href: string | null) => {
      if (!href) return false;
      if (href === "/") return location.pathname === "/" && !location.hash;
      if (href.startsWith("/#")) return location.pathname === "/" && location.hash === href.slice(1);
      return location.pathname.startsWith(href);
    };

    const handleMoreAction = (action: "search" | "notifications" | "settings") => {
      setMoreOpen(false);
      if (action === "search") {
        setTimeout(() => setSearchOpen(true), 150);
      } else if (action === "notifications") {
        setTimeout(() => setNotificationsOpen(true), 150);
      }
      // settings navigates via Link
    };

    const moreItems = [
      { id: "search", icon: Search, labelKey: "nav.search", action: "search" as const },
      { id: "notifications", icon: Bell, labelKey: "nav.alerts", action: "notifications" as const, badge: unreadCount },
      { id: "settings", icon: Settings, labelKey: "nav.settings", action: "settings" as const, href: "/settings" },
    ];

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
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.6 }}
                onDragEnd={(_: any, info: PanInfo) => {
                  if (info.offset.y > 80) setNotificationsOpen(false);
                }}
                className="fixed bottom-[4.5rem] left-2 right-2 z-50 max-h-[70vh] overflow-auto rounded-2xl bg-card border border-border/40 shadow-2xl md:hidden touch-pan-x"
              >
                <div className="p-4">
                  <div className="w-10 h-1 bg-muted-foreground/20 rounded-full mx-auto mb-4 cursor-grab active:cursor-grabbing" />
                  <NotificationsPanel />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* More Menu Panel */}
        <AnimatePresence>
          {moreOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMoreOpen(false)}
                className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
              />
              <motion.div
                initial={{ y: 60, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 60, opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", damping: 28, stiffness: 350 }}
                className="fixed bottom-[4.5rem] end-2 z-50 w-52 rounded-2xl bg-card border border-border/50 shadow-2xl md:hidden overflow-hidden"
              >
                <div className="p-2 space-y-0.5">
                  {moreItems.map((item) => {
                    const Icon = item.icon;
                    
                    if (item.href) {
                      return (
                        <Link
                          key={item.id}
                          to={item.href}
                          onClick={() => setMoreOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground/80 hover:bg-muted/60 transition-colors active:scale-[0.97]"
                        >
                          <Icon className="w-4.5 h-4.5 text-muted-foreground" strokeWidth={1.8} />
                          <span>{t(item.labelKey)}</span>
                        </Link>
                      );
                    }

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleMoreAction(item.action)}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-foreground/80 hover:bg-muted/60 transition-colors active:scale-[0.97]"
                      >
                        <div className="relative">
                          <Icon className="w-4.5 h-4.5 text-muted-foreground" strokeWidth={1.8} />
                          {item.badge && item.badge > 0 ? (
                            <span className="absolute -top-1.5 -end-1.5 w-3.5 h-3.5 bg-destructive text-destructive-foreground text-[7px] font-bold rounded-full flex items-center justify-center">
                              {item.badge > 9 ? '9+' : item.badge}
                            </span>
                          ) : null}
                        </div>
                        <span>{t(item.labelKey)}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Spacer */}
        <div className="h-[4.5rem] md:h-0" />
        
        {/* Bottom Navigation */}
        <nav ref={ref} className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-area-bottom">
          <div className="relative">
            {/* Top accent line */}
            <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent z-10" />
            
            {/* Clean background */}
            <div className="absolute inset-0 bg-card/95 backdrop-blur-xl shadow-[0_-4px_30px_0px_hsl(340_65%_65%/0.3)]" />
            
            <div className="relative flex items-center justify-evenly px-2 py-2">
              {NAV_ITEMS.map((item, idx) => {
                const active = item.id === "more" ? moreOpen : isActive(item.href);
                const Icon = item.icon;
                const isLast = idx === NAV_ITEMS.length - 1;

                const separator = !isLast ? (
                  <div key={`sep-${idx}`} className="w-px h-6 bg-border/50 self-center" />
                ) : null;

                const iconContent = (
                  <div className={`relative p-2.5 rounded-xl transition-all duration-200 active:scale-[0.92] ${active ? 'bg-primary/10' : ''}`}>
                    {item.id === "more" && moreOpen ? (
                      <X className="w-5 h-5 relative z-10 text-primary transition-colors duration-200" strokeWidth={2.2} />
                    ) : (
                      <Icon 
                        className={`w-5 h-5 relative z-10 transition-colors duration-200 ${
                          active ? "text-primary" : "text-foreground/50"
                        }`} 
                        strokeWidth={active ? 2.2 : 1.8} 
                      />
                    )}
                    
                    {/* Notification badge on More button */}
                    {item.id === "more" && unreadCount > 0 && !moreOpen && (
                      <span className="absolute top-0.5 end-0.5 w-3.5 h-3.5 bg-destructive text-destructive-foreground text-[7px] font-bold rounded-full flex items-center justify-center ring-1.5 ring-card z-20">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}

                    {/* Active dot indicator */}
                    {active && (
                      <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                    )}
                  </div>
                );

                const labelClass = `text-[9px] font-medium tracking-wide transition-colors duration-200 ${
                  active ? "text-primary" : "text-foreground/50"
                }`;

                let navElement: React.ReactNode;

                if (item.id === "more") {
                  navElement = (
                    <button
                      key={item.id}
                      onClick={() => {
                        setMoreOpen(!moreOpen);
                        setNotificationsOpen(false);
                      }}
                      className="flex flex-col items-center gap-0 px-3 py-0.5 transition-all relative"
                    >
                      {iconContent}
                      <span className={labelClass}>{t(item.labelKey)}</span>
                    </button>
                  );
                } else if (item.href?.startsWith("/#")) {
                  navElement = (
                    <Link
                      key={item.id}
                      to={item.href}
                      onClick={() => {
                        setMoreOpen(false);
                        setNotificationsOpen(false);
                        // Scroll to section if already on home
                        if (location.pathname === "/") {
                          const sectionId = item.href!.slice(2);
                          const el = document.getElementById(sectionId);
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                      className="flex flex-col items-center gap-0 px-3 py-0.5 transition-all"
                    >
                      {iconContent}
                      <span className={labelClass}>{t(item.labelKey)}</span>
                    </Link>
                  );
                } else {
                  navElement = (
                    <Link
                      key={item.id}
                      to={item.href!}
                      onClick={() => {
                        setMoreOpen(false);
                        setNotificationsOpen(false);
                      }}
                      className="flex flex-col items-center gap-0 px-3 py-0.5 transition-all"
                    >
                      {iconContent}
                      <span className={labelClass}>{t(item.labelKey)}</span>
                    </Link>
                  );
                }

                return (
                  <div key={item.id} className="contents">{navElement}{separator}</div>
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
