import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Search } from "lucide-react";
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

  // Find tool data to get isPremium flag
  const getToolById = (id: string) => toolsData.find(t => t.id === id);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="gradient-hero border-b border-border">
        <div className="container py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground">
                <Heart className="h-4 w-4 text-primary" />
                {t('app.tagline')}
              </div>
              
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl text-balance">
                {t('app.title')}{" "}
                <span className="text-primary">{t('app.titleHighlight')}</span>{" "}
                {t('app.titleEnd')}
              </h1>
              
              <p className="mb-8 text-lg text-muted-foreground md:text-xl text-balance">
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
              <Search className="absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('app.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 ps-12 text-base bg-card border-border shadow-card"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Subscription Banner */}
      <section className="border-b border-border">
        <div className="container py-4">
          <SubscriptionBanner />
        </div>
      </section>

      {/* Category Filter */}
      <section className="border-b border-border bg-card">
        <div className="container py-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categoryKeys.map((categoryKey) => (
              <button
                key={categoryKey}
                onClick={() => setActiveCategory(categoryKey)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === categoryKey
                    ? "bg-primary text-primary-foreground"
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
            <h2 className="text-2xl font-semibold text-foreground">
              {activeCategory === "categories.all" ? t('app.allTools') : t(activeCategory)}
            </h2>
            <span className="text-sm text-muted-foreground">
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
