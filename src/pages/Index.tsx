import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Crown, CheckCircle, Shield, Brain, Baby, Heart, Activity, Dumbbell, AlertTriangle, Package, Clock, Users, MessageCircle, LayoutGrid, List } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { ToolCard } from "@/components/ToolCard";
import { getSortedTools, categoryKeys, toolsData } from "@/lib/tools-data";
import { Input } from "@/components/ui/input";
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
  const { isSubscribed } = useSubscription();

  const sortedTools = getSortedTools();

  const handleSubscribe = () => {
    console.log("Trigger Google Play In-App Billing");
  };

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
      {/* Hero Section - Modernized */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        {/* Subtle Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-primary/8 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="container relative py-12 md:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Badge - Clean & Professional */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="mb-5 md:mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs md:text-sm font-medium text-primary"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{t('app.tagline')}</span>
              </motion.div>
              
              {/* Title - Clean & Readable */}
              <h1 className="mb-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl lg:text-5xl">
                {t('app.title')}{" "}
                <span className="text-primary">{t('app.titleHighlight')}</span>{" "}
                {t('app.titleEnd')}
              </h1>
              
              {/* Description */}
              <p className="mb-8 text-sm text-muted-foreground sm:text-base md:text-lg max-w-md mx-auto">
                {t('app.description')}
              </p>
            </motion.div>

            {/* Search - Simple & Effective */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="relative mx-auto max-w-md"
            >
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('app.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 pl-11 text-sm bg-card border-border rounded-xl shadow-sm focus:border-primary transition-colors"
              />
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

      {/* Premium CTA Section - Modernized */}
      {!isSubscribed && (
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
          
          <div className="container relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl mx-auto text-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold"
              >
                <Crown className="h-4 w-4" />
                Premium Access
              </motion.div>
              
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
                Unlock All{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Premium Tools
                </span>
              </h2>

              <p className="text-lg text-muted-foreground mb-10">
                Get access to 40+ tools for your pregnancy journey
              </p>

              {/* Pricing Card - Glass Effect */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative max-w-md mx-auto"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-xl" />
                <div className="relative bg-card/90 backdrop-blur-xl rounded-3xl p-8 border border-primary/20 shadow-2xl">
                  <div className="flex items-baseline justify-center gap-2 mb-8">
                    <span className="text-5xl font-extrabold text-foreground">$1.99</span>
                    <span className="text-muted-foreground text-lg">/month</span>
                  </div>

                  <ul className="space-y-4 text-left mb-8">
                    {[
                      "Access all 40+ pregnancy tools",
                      "AI-powered insights & recommendations",
                      "Unlimited tracking & logging",
                      "Export data for your doctor",
                      "Cancel anytime",
                    ].map((feature, i) => (
                      <motion.li 
                        key={i} 
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
                        className="flex items-center gap-3 text-sm text-foreground"
                      >
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success/20">
                          <CheckCircle className="h-3.5 w-3.5 text-success" />
                        </div>
                        {feature}
                      </motion.li>
                    ))}
                  </ul>

                  <Button
                    onClick={handleSubscribe}
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-bold text-lg h-14 shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30"
                  >
                    <Crown className="h-5 w-5 mr-2" />
                    Get Premium — $1.99/mo
                  </Button>

                  <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>Secure payment via Google Play</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
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
