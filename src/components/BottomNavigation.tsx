import { forwardRef, useState, memo } from "react";
import { Home, LayoutDashboard, Search, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { SearchDialog } from "./SearchDialog";

const navItems = [
  { id: "home", icon: Home, label: "Home", href: "/" },
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { id: "search", icon: Search, label: "Search", href: null },
  { id: "settings", icon: Settings, label: "Settings", href: "/settings" },
];

export const BottomNavigation = memo(forwardRef<HTMLDivElement, Record<string, never>>(
  function BottomNavigation(_, ref) {
    const location = useLocation();
    const [searchOpen, setSearchOpen] = useState(false);

    const isActive = (href: string | null) => {
      if (!href) return false;
      if (href === "/") return location.pathname === "/";
      return location.pathname.startsWith(href);
    };

    return (
      <>
        {/* Spacer to prevent content from being hidden behind nav */}
        <div className="h-14 md:h-0" />
        
        {/* Bottom Navigation - Mobile only */}
        <nav ref={ref} className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
          {/* Glass effect background */}
          <div className="absolute inset-0 bg-card/95 backdrop-blur-lg border-t border-border/40 shadow-lg" />
          
          <div className="relative flex items-center justify-around px-2 py-1.5 safe-area-bottom">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;

              if (item.id === "search") {
                return (
                  <button
                    key={item.id}
                    onClick={() => setSearchOpen(true)}
                    className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors"
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
                  className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors"
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
