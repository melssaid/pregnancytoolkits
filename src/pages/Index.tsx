import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Crown, CheckCircle, Shield, Brain, Baby, Heart, Activity, Dumbbell, AlertTriangle, Package, Clock, Users, MessageCircle, LayoutGrid, List, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { ToolCard } from "@/components/ToolCard";
import { getSortedTools, categoryKeys, toolsData } from "@/lib/tools-data";
import { Button } from "@/components/ui/button";
import useSubscription from "@/hooks/useSubscription";

// Category icons mapping
const categoryIcons: Record<string, any> = {
  "categories.ai": Brain,
  "categories.fertility": Activity,
  "categories.pregnancy": Baby,
  "categories.wellness": Dumbbell,
  "categories.mentalHealth": Heart,
  "categories.riskAssessment": AlertTriangle,
  "categories.preparation": Package,
  "categories.labor": Clock,
  "categories.postpartum": Users,
  "categories.support": MessageCircle,
};

const categoryGradients: Record<string, string> = {
  "categories.ai": "from-violet-500 to-purple-600",
  "categories.fertility": "from-pink-500 to-rose-600",
  "categories.pregnancy": "from-primary to-accent",
  "categories.wellness": "from-emerald-500 to-teal-600",
  "categories.mentalHealth": "from-sky-500 to-blue-600",
  "categories.riskAssessment": "from-amber-500 to-orange-600",
  "categories.preparation": "from-indigo-500 to-violet-600",
  "categories.labor": "from-red-500 to-rose-600",
  "categories.postpartum": "from-cyan-500 to-teal-600",
  "categories.support": "from-fuchsia-500 to-pink-600",
};

const Index = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("categories.all");
  const [viewMode, setViewMode] = useState<"grid" | "grouped">("grid");
  const { isSubscribed, isTrialActive, trialDaysLeft, subscribeMonthly, subscribeYearly } = useSubscription();

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

  const groupedTools = useMemo(() => {
    const groups: Record<string, typeof toolsData> = {};
    categoryKeys.slice(1).forEach(key => {
      groups[key] = filteredTools.filter(tool => tool.categoryKey === key);
    });
    return groups;
  }, [filteredTools]);

  return (
    <Layout>
      {/* Hero Section - Compact & Clean */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        {/* Subtle Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-primary/8 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="container relative py-10 md:py-14">
          <div className="mx-auto max-w-2xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Title - Clean & Readable */}
              <h1 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl lg:text-5xl">
                {t('app.title')}{" "}
                <span className="text-primary">{t('app.titleHighlight')}</span>{" "}
                {t('app.titleEnd')}
              </h1>
              
              {/* Description */}
              <p className="text-sm text-muted-foreground sm:text-base md:text-lg max-w-md mx-auto">
                {t('app.description')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Category Filter - Modern Pills */}
      <section className="sticky top-16 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categoryKeys.map((categoryKey, index) => {
                const Icon = categoryIcons[categoryKey];
                const isActive = activeCategory === categoryKey;
                
                return (
                  <motion.button
                    key={categoryKey}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    onClick={() => setActiveCategory(categoryKey)}
                    className={`group flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {Icon && <Icon className={`h-4 w-4 ${isActive ? '' : 'group-hover:text-primary'} transition-colors`} />}
                    <span>{t(categoryKey)}</span>
                  </motion.button>
                );
              })}
            </div>
            
            {/* View Toggle */}
            <div className="hidden md:flex items-center gap-1 bg-muted/50 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("grouped")}
                className={`p-2 rounded-md transition-colors ${viewMode === "grouped" ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-12 md:py-16">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 flex items-center justify-between"
          >
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {activeCategory === "categories.all" ? t('app.allTools') : t(activeCategory)}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t('app.toolsAvailable', { count: filteredTools.length })}
              </p>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {viewMode === "grid" || activeCategory !== "categories.all" ? (
              // Grid View
              <motion.div
                key="grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {filteredTools.length > 0 ? (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredTools.map((tool, index) => (
                      <ToolCard
                        key={tool.id}
                        titleKey={tool.titleKey}
                        descriptionKey={tool.descriptionKey}
                        icon={tool.icon}
                        href={tool.href}
                        categoryKey={tool.categoryKey}
                        index={index}
                        isPremium={tool.isPremium}
                      />
                    ))}
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-20 text-center"
                  >
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-lg font-medium text-foreground mb-2">
                      {t('app.noToolsFound')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your search or filter
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              // Grouped View
              <motion.div
                key="grouped"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-12"
              >
                {Object.entries(groupedTools).map(([categoryKey, tools], catIndex) => {
                  if (tools.length === 0) return null;
                  const Icon = categoryIcons[categoryKey];
                  const gradient = categoryGradients[categoryKey] || "from-primary to-accent";
                  
                  return (
                    <motion.div
                      key={categoryKey}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: catIndex * 0.1 }}
                    >
                      <div className="flex items-center gap-4 mb-6">
                        {Icon && (
                          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
                            <Icon className="h-6 w-6" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-xl font-bold text-foreground">
                            {t(categoryKey)}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {tools.length} tools available
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {tools.map((tool, index) => (
                          <ToolCard
                            key={tool.id}
                            titleKey={tool.titleKey}
                            descriptionKey={tool.descriptionKey}
                            icon={tool.icon}
                            href={tool.href}
                            categoryKey={tool.categoryKey}
                            index={index}
                            isPremium={tool.isPremium}
                          />
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Premium Access Section - Simple & Professional */}
      {!isSubscribed && (
        <section className="py-10 border-t border-border/50">
          <div className="container">
            <div className="max-w-lg mx-auto bg-card rounded-2xl border border-border p-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Crown className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Premium Access</h3>
                  <p className="text-xs text-muted-foreground">Unlock all pregnancy tools</p>
                </div>
              </div>

              {/* Free Trial Info */}
              <div className="bg-success/10 rounded-lg px-4 py-2.5 mb-4">
                <p className="text-sm text-success font-medium">
                  {isTrialActive 
                    ? `✨ ${trialDaysLeft} days left in your free trial`
                    : "✨ Start with 3-day free trial"
                  }
                </p>
              </div>

              {/* Pricing Options */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button 
                  onClick={subscribeMonthly}
                  className="bg-muted/50 rounded-xl p-3 text-center hover:bg-muted transition-colors"
                >
                  <p className="text-2xl font-bold text-foreground">$1.99</p>
                  <p className="text-xs text-muted-foreground">per month</p>
                </button>
                <button 
                  onClick={subscribeYearly}
                  className="bg-primary/5 rounded-xl p-3 text-center border border-primary/20 hover:bg-primary/10 transition-colors"
                >
                  <p className="text-2xl font-bold text-primary">$14</p>
                  <p className="text-xs text-muted-foreground">per year <span className="text-primary font-medium">(Save 40%)</span></p>
                </button>
              </div>

              {/* Subscribe Button */}
              <Button
                onClick={subscribeMonthly}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11"
              >
                {isTrialActive ? "Subscribe Now" : "Start Free Trial"}
              </Button>

              {/* Footer */}
              <p className="text-center text-xs text-muted-foreground mt-3">
                Cancel anytime • Secure via Google Play
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Trust Banner */}
      <section className="border-t border-border bg-muted/30 py-12">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">{t('common.warning')}:</strong> {t('app.medicalDisclaimer')}
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
