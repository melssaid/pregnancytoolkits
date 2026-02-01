import { Home, LayoutDashboard, Search, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { SearchDialog } from "./SearchDialog";

const navItems = [
  { id: "home", icon: Home, label: "Home", href: "/" },
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { id: "search", icon: Search, label: "Search", href: null }, // Opens dialog
  { id: "settings", icon: Settings, label: "Settings", href: "/settings" },
];

export function BottomNavigation() {
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
      <div className="h-16 md:h-0" />
      
      {/* Bottom Navigation - Mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        {/* Glass effect background */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-border/50" />
        
        <div className="relative flex items-center justify-around px-4 py-2 safe-area-bottom">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            if (item.id === "search") {
              return (
                <button
                  key={item.id}
                  onClick={() => setSearchOpen(true)}
                  className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-200"
                >
                  <div className={`p-2 rounded-xl transition-all duration-200 ${
                    searchOpen 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-medium ${
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
                className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-200"
              >
                <motion.div 
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    active 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-5 h-5" />
                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.div>
                <span className={`text-[10px] font-medium ${
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
