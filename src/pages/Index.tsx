import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Search, Sparkles, Crown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { ToolCard } from "@/components/ToolCard";
import { SubscriptionBanner } from "@/components/SubscriptionBanner";
import { getSortedTools, categoryKeys, toolsData } from "@/lib/tools-data";
import { Input } from "@/components/ui/input";

const Index = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("categories.all");

  const sortedTools = getSortedTools();

  const filteredTools = sortedTools.filter((tool) => {
    const title = t(tool.titleKey).toLowerCase();
    const description = t(tool.descriptionKey).toLowerCase();
    const matchesSearch = 
      title.includes(search.toLowerCase()) ||
      description.includes(search.toLowerCase());
    const matchesCategory = activeCategory === "categories.all" || tool.categoryKey === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="gradient-hero border-b border-border relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="container py-16 md:py-20 relative">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg">
                <Sparkles className="h-4 w-4" />
                {t('app.tagline')}
              </div>
              
              <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl text-balance">
                {t('app.title')}{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{t('app.titleHighlight')}</span>{" "}
                {t('app.titleEnd')}
              </h1>
              
              <p className="mb-8 text-lg text-muted-foreground md:text-xl text-balance max-w-xl mx-auto">
                {t('app.description')}
              </p>
            </motion.div>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative mx-auto max-w-md"
            >
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('app.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-14 pl-12 text-base bg-card border-2 border-border shadow-card rounded-2xl focus:border-primary transition-colors"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Subscription Banner */}
      <section className="border-b border-border bg-card">
        <div className="container py-4">
          <SubscriptionBanner />
        </div>
      </section>

      {/* Category Filter */}
      <section className="border-b border-border bg-background sticky top-16 z-40">
        <div className="container py-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categoryKeys.map((categoryKey) => (
              <button
                key={categoryKey}
                onClick={() => setActiveCategory(categoryKey)}
                className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                  activeCategory === categoryKey
                    ? "gradient-primary text-white shadow-lg"
                    : "bg-secondary text-secondary-foreground hover:bg-muted"
                }`}
              >
                {t(categoryKey)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">
              {activeCategory === "categories.all" ? t('app.allTools') : t(activeCategory)}
            </h2>
            <span className="text-sm font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">
              {t('app.toolsAvailable', { count: filteredTools.length })}
            </span>
          </div>

          {filteredTools.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
            <div className="py-16 text-center">
              <p className="text-lg text-muted-foreground">
                {t('app.noToolsFound')}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Trust Banner */}
      <section className="border-t border-border bg-card py-12">
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
