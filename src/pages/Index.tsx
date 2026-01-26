import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, LayoutGrid, List, Sparkles, Brain, Baby, Heart, Activity, Dumbbell, AlertTriangle, Package, Clock, Users, MessageCircle, Crown, Shield, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { ToolCard } from "@/components/ToolCard";
import { getSortedTools, categoryKeys } from "@/lib/tools-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const categoryIcons: Record<string, any> = {
  "categories.all": LayoutGrid,
  "categories.ai": Brain,
  "categories.fertility": Activity,
  "categories.pregnancy": Baby,
  "categories.wellness": Dumbbell,
  "categories.mentalHealth": Heart,
  "categories.riskAssessment": AlertTriangle,
  "categories.labor": Clock,
  "categories.postpartum": Users,
};

const Index = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("categories.all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const sortedTools = getSortedTools();

  const filteredTools = useMemo(() => {
    return sortedTools.filter((tool) => {
      const title = t(tool.titleKey).toLowerCase();
      const description = t(tool.descriptionKey).toLowerCase();
      const matchesSearch = 
        title.includes(search.toLowerCase()) ||
        description.includes(search.toLowerCase());
      const matchesCategory = activeCategory === "categories.all" || tool.categoryKey === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [sortedTools, search, activeCategory, t]);

  return (
    <Layout>
      {/* 🚀 Hero Section - Lovable Style */}
      <section className="relative pt-10 pb-8 overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
                <Sparkles className="w-3 h-3" />
                <span>{t('hero.badge', 'Your Personal Pregnancy Journey')}</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground mb-2">
                {t('app.title', 'Pregnancy')} <span className="text-primary">{t('app.titleHighlight', 'Tools')}</span>
              </h1>
              {/* Decorative Line */}
              <div className="flex items-center justify-center gap-3 my-3">
                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-primary/40 to-primary/60" />
                <Heart className="w-4 h-4 text-primary/60" />
                <div className="h-[1px] w-12 bg-gradient-to-l from-transparent via-primary/40 to-primary/60" />
              </div>
              <p className="text-sm md:text-base text-muted-foreground mb-6 leading-relaxed max-w-xl mx-auto">
                {t('app.description', 'Experience the most comprehensive set of pregnancy tools, powered by AI and medical insights to support you at every stage.')}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button size="default" className="h-10 px-6 rounded-full text-sm shadow-lg shadow-primary/20">
                  {t('hero.cta', 'Start Tracking Now')}
                </Button>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> Free</span>
                  <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-primary" /> Private</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary-rgb),0.08),transparent_50%)] pointer-events-none" />
      </section>

      {/* 🔍 Search & Filters Bar */}
      <section className="sticky top-16 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container py-3">
          <div className="flex flex-col md:flex-row gap-3 items-center">
            {/* Search */}
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('app.searchPlaceholder', 'Search tools...')}
                className="pl-9 h-9 rounded-xl bg-muted/50 border-none focus-visible:ring-primary/20 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            {/* Categories Pills */}
            <div className="flex-1 flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide w-full">
              {categoryKeys.map((categoryKey) => {
                const Icon = categoryIcons[categoryKey] || LayoutGrid;
                const isActive = activeCategory === categoryKey;
                return (
                  <button
                    key={categoryKey}
                    onClick={() => setActiveCategory(categoryKey)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-md" 
                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{t(categoryKey)}</span>
                  </button>
                );
              })}
            </div>

            {/* View Toggle */}
            <div className="hidden lg:flex items-center p-0.5 bg-muted/50 rounded-lg">
              <button 
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md ${viewMode === "grid" ? "bg-background shadow text-primary" : "text-muted-foreground"}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md ${viewMode === "list" ? "bg-background shadow text-primary" : "text-muted-foreground"}`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 📦 Tools Grid */}
      <section className="py-6 bg-muted/20">
        <div className="container">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">
              {activeCategory === "categories.all" ? t('app.allTools') : t(activeCategory)}
              <span className="ml-2 text-xs font-normal text-muted-foreground">({filteredTools.length})</span>
            </h2>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeCategory}-${search}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={viewMode === "grid" 
                ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3" 
                : "space-y-3"
              }
            >
              {filteredTools.map((tool, index) => (
                <ToolCard
                  key={tool.id}
                  titleKey={tool.titleKey}
                  descriptionKey={tool.descriptionKey}
                  icon={tool.icon}
                  href={tool.href}
                  categoryKey={tool.categoryKey}
                  index={index}
                />
              ))}
              
              {filteredTools.length === 0 && (
                <div className="col-span-full py-12 text-center">
                  <div className="bg-muted w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-muted-foreground">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold mb-1">{t('app.noToolsFound')}</h3>
                  <p className="text-sm text-muted-foreground">Try a different search term or category.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* 💎 Premium Banner */}
      <section className="py-8 border-t border-border/50">
        <div className="container">
          <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl">
            <div className="relative z-10 max-w-lg">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4" />
                <span className="uppercase tracking-widest text-xs font-bold opacity-90">Premium</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold mb-2">Unlock Full Power of Pregnancy AI</h2>
              <p className="text-sm opacity-90 mb-4 leading-relaxed">
                Unlimited AI consultations, advanced analytics, and personalized roadmap.
              </p>
              <div className="flex gap-3">
                <Button size="sm" variant="secondary" className="rounded-full px-5 text-sm">Upgrade</Button>
                <Button size="sm" variant="ghost" className="rounded-full text-white border-white/20 hover:bg-white/10 text-sm">Learn More</Button>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-1/2 h-full bg-white/10 -skew-x-12 translate-x-1/2 pointer-events-none" />
          </div>
        </div>
      </section>

      {/* 🏥 Medical Disclaimer */}
      <footer className="py-6 border-t border-border bg-muted/30">
        <div className="container text-center">
          <div className="max-w-xl mx-auto space-y-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">{t('common.warning', 'IMPORTANT')}:</strong> {t('app.medicalDisclaimer', 'The information provided by these tools is for educational purposes only. Always consult your healthcare provider.')}
            </p>
            <div className="flex justify-center gap-4 text-xs font-medium text-muted-foreground">
              <a href="/privacy" className="hover:text-primary transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-primary transition-colors">Terms</a>
              <span>© 2026 Pregnancy Tools</span>
            </div>
          </div>
        </div>
      </footer>
    </Layout>
  );
};

export default Index;