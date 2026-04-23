import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, LayoutDashboard, Heart, Utensils, Dumbbell, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getSortedTools } from "@/lib/tools-data";
import { getToolDescription, getToolTitle } from "@/lib/toolCopy";
import { cn } from "@/lib/utils";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
    const { t, i18n } = useTranslation();
    const lang = i18n.language?.split('-')[0] || 'en';
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const tools = getSortedTools();

    const quickLinks = [
      { icon: LayoutDashboard, labelKey: "nav.dashboard", href: "/dashboard" },
      { icon: Heart, labelKey: "dashboard.tabs.health", href: "/dashboard" },
      { icon: Utensils, labelKey: "dashboard.tabs.nutrition", href: "/dashboard" },
      { icon: Dumbbell, labelKey: "dashboard.tabs.exercise", href: "/dashboard" },
      { icon: Settings, labelKey: "nav.settings", href: "/settings" },
    ];

    const filteredTools = useMemo(() => {
      if (!search.trim()) return tools;
      
      return tools.filter((tool) => {
        const title = getToolTitle(tool, t, lang).toLowerCase();
        const description = getToolDescription(tool, t, lang).toLowerCase();
        return (
          title.includes(search.toLowerCase()) ||
          description.includes(search.toLowerCase())
        );
      });
    }, [tools, search, t]);

    const handleSelect = (href: string) => {
      onOpenChange(false);
      setSearch("");
      navigate(href);
    };

    // Keyboard shortcut
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "k") {
          e.preventDefault();
          onOpenChange(true);
        }
      };
      
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onOpenChange]);

    // Reset search when dialog closes
    useEffect(() => {
      if (!open) setSearch("");
    }, [open]);

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden bg-card/95 backdrop-blur-xl border-border/50">
          {/* Search Input */}
          <div className="flex items-center border-b border-border/50 px-4">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder={t('app.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 h-14 px-3 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm"
              autoFocus
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="p-1.5 rounded-md hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Quick Navigation Links */}
          {!search.trim() && (
            <div className="px-4 pt-3 pb-2 border-b border-border/30">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {t('searchDialog.quickAccess', 'Quick Access')}
              </p>
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
                {quickLinks.map((link) => (
                  <button
                    key={link.labelKey}
                    onClick={() => handleSelect(link.href)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-medium whitespace-nowrap transition-all flex-shrink-0"
                  >
                    <link.icon className="w-3 h-3" />
                    {t(link.labelKey)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          <div className="max-h-[55vh] overflow-y-auto p-2">
            {!search.trim() && (
              <div className="px-3 py-2">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  {t('searchDialog.popularTools')}
                </p>
              </div>
            )}

            <AnimatePresence mode="popLayout">
              {filteredTools.length > 0 ? (
                <div className="space-y-1">
                  {filteredTools.map((tool, index) => {
                    const isSmartTool = tool.categoryKey === "categories.ai";
                    
                    return (
                      <motion.button
                        key={tool.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15, delay: index * 0.02 }}
                        onClick={() => handleSelect(tool.href)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200",
                          "hover:bg-primary/10 group"
                        )}
                      >
                        <div className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all",
                          isSmartTool 
                            ? "bg-gradient-to-br from-primary to-accent text-white" 
                            : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                        )}>
                          <tool.icon className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-foreground text-sm truncate block">
                            {getToolTitle(tool, t, lang)}
                          </span>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {getToolDescription(tool, t, lang)}
                          </p>
                        </div>
                        
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </motion.button>
                    );
                  })}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-12 text-center"
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                    <Search className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {t('app.noToolsFound')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('searchDialog.tryDifferent')}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer with keyboard hints */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/50 bg-muted/30">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">↑↓</kbd>
                {t('searchDialog.navigate')}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">↵</kbd>
                {t('searchDialog.open')}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {t('searchDialog.toolsCount', { count: filteredTools.length })}
            </span>
          </div>
        </DialogContent>
      </Dialog>
    );
}

SearchDialog.displayName = "SearchDialog";
