import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, LayoutGrid, List, Sparkles, Brain, Baby, Heart, Activity, Dumbbell, AlertTriangle, Clock, Users, Crown, Shield, CheckCircle, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { ToolCard } from "@/components/ToolCard";
import { getSortedTools, categoryKeys, getAITools } from "@/lib/tools-data";
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
  "categories.preparation": CheckCircle,
  "categories.postpartum": Users,
};

const Index = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("categories.all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const sortedTools = getSortedTools();
  const aiToolsCount = getAITools().length;

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
      {/* 🚀 Hero Section */}
      <section className="relative pt-8 pb-6 overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
                <Sparkles className="w-3 h-3" />
                <span>{aiToolsCount} AI-Powered Tools</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-foreground mb-1.5">
                {t('app.title', 'Pregnancy')} <span className="text-primary">{t('app.titleHighlight', 'Tools')}</span>
              </h1>
              {/* Decorative Line */}
              <div className="flex items-center justify-center gap-2 my-2">
                <div className="h-px w-10 bg-gradient-to-r from-transparent to-primary/50" />
                <Heart className="w-3 h-3 text-primary/60" />
                <div className="h-px w-10 bg-gradient-to-l from-transparent to-primary/50" />
              </div>
              <p className="text-xs md:text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                {t('app.description', 'Comprehensive AI-powered pregnancy tools for every stage of your journey.')}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"><CheckCircle className="w-3 h-3" /> Free</span>
                  <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary"><Shield className="w-3 h-3" /> Private</span>
                  <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400"><Zap className="w-3 h-3" /> AI Smart</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary-rgb),0.08),transparent_50%)] pointer-events-none" />
      </section>

      {/* 🔍 Search & Filters */}
      <section className="sticky top-16 z-30 bg-background/90 backdrop-blur-xl border-b border-border/50">
        <div className="container py-2">
          <div className="flex flex-col md:flex-row gap-2 items-center">
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
            
            {/* Categories */}
            <div className="flex-1 flex gap-1 overflow-x-auto pb-1 scrollbar-hide w-full">
              {categoryKeys.map((categoryKey) => {
                const Icon = categoryIcons[categoryKey] || LayoutGrid;
                const isActive = activeCategory === categoryKey;
                return (
                  <button
                    key={categoryKey}
                    onClick={() => setActiveCategory(categoryKey)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-semibold whitespace-nowrap transition-all ${
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
                <LayoutGrid className="w-3 h-3" />
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md ${viewMode === "list" ? "bg-background shadow text-primary" : "text-muted-foreground"}`}
              >
                <List className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 📦 Tools Grid */}
      <section className="py-4 bg-muted/20">
        <div className="container">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold flex items-center gap-2">
              {activeCategory === "categories.all" ? (
                <>
                  <LayoutGrid className="w-4 h-4 text-primary" />
                  {t('app.allTools', 'All Tools')}
                </>
              ) : (
                <>
                  {(() => {
                    const Icon = categoryIcons[activeCategory] || LayoutGrid;
                    return <Icon className="w-4 h-4 text-primary" />;
                  })()}
                  {t(activeCategory)}
                </>
              )}
              <span className="text-[10px] font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{filteredTools.length}</span>
            </h2>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeCategory}-${search}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={viewMode === "grid" 
                ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5" 
                : "space-y-2"
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
                  hasAI={tool.hasAI}
                />
              ))}
              
              {filteredTools.length === 0 && (
                <div className="col-span-full py-12 text-center">
                  <div className="bg-muted w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-muted-foreground">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold mb-1">{t('app.noToolsFound', 'No tools found')}</h3>
                  <p className="text-sm text-muted-foreground">Try a different search term or category.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* 💎 Premium Banner */}
      <section className="py-6 border-t border-border/50">
        <div className="container">
          <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-5 md:p-6 text-white relative overflow-hidden shadow-xl">
            <div className="relative z-10 max-w-md">
              <div className="flex items-center gap-2 mb-1.5">
                <Crown className="w-4 h-4" />
                <span className="uppercase tracking-widest text-[10px] font-bold opacity-90">Premium</span>
              </div>
              <h2 className="text-lg md:text-xl font-bold mb-1.5">Unlock Full AI Power</h2>
              <p className="text-xs opacity-90 mb-3 leading-relaxed">
                Unlimited AI consultations, advanced analytics, and personalized guidance.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" className="rounded-full px-4 text-xs h-8">Upgrade</Button>
                <Button size="sm" variant="ghost" className="rounded-full text-white border-white/20 hover:bg-white/10 text-xs h-8">Learn More</Button>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-1/2 h-full bg-white/10 -skew-x-12 translate-x-1/2 pointer-events-none" />
          </div>
        </div>
      </section>

      {/* 🏥 Footer */}
      <footer className="py-4 border-t border-border bg-muted/30">
        <div className="container text-center">
          <div className="max-w-lg mx-auto space-y-2">
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              <strong className="text-foreground">{t('common.warning', 'IMPORTANT')}:</strong> {t('app.medicalDisclaimer', 'The information provided is for educational purposes only. Always consult your healthcare provider.')}
            </p>
            <div className="flex justify-center gap-4 text-[10px] font-medium text-muted-foreground">
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
