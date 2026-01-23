import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Search, Sparkles, Crown, CheckCircle, Shield, ChevronDown, Store } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { ToolCard } from "@/components/ToolCard";
import { getSortedTools, categoryKeys } from "@/lib/tools-data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useSubscription from "@/hooks/useSubscription";

const getCategoryId = (categoryKey: string) => {
  if (categoryKey === "categories.all") return "tools-sections";
  return `cat-${categoryKey.replace("categories.", "")}`;
};

const Index = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("categories.all");
  const { isSubscribed, isTrialActive, trialDaysLeft, startGooglePlayBilling } = useSubscription();

  const sortedTools = getSortedTools();

  const handleSubscribe = () => {
    startGooglePlayBilling("pregnancy_toolkit_premium_monthly");
  };

  const normalizedSearch = search.trim().toLowerCase();

  const filteredTools = useMemo(() => {
    return sortedTools.filter((tool) => {
      const title = t(tool.titleKey).toLowerCase();
      const description = t(tool.descriptionKey).toLowerCase();
      return title.includes(normalizedSearch) || description.includes(normalizedSearch);
    });
  }, [sortedTools, t, normalizedSearch]);

  const categoriesForSections = useMemo(
    () => categoryKeys.filter((k) => k !== "categories.all"),
    []
  );

  const groupedSections = useMemo(() => {
    return categoriesForSections
      .map((categoryKey) => {
        const tools = filteredTools.filter((tool) => tool.categoryKey === categoryKey);
        return { categoryKey, tools };
      })
      .filter((section) => section.tools.length > 0);
  }, [categoriesForSections, filteredTools]);

  const scrollToCategory = (categoryKey: string) => {
    setActiveCategory(categoryKey);

    const id = getCategoryId(categoryKey);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const totalToolsCount = filteredTools.length;
  const isSearching = normalizedSearch.length > 0;

  const activeCategoryRef = useRef(activeCategory);
  useEffect(() => {
    activeCategoryRef.current = activeCategory;
  }, [activeCategory]);

  // Scroll-spy: automatically highlight the category while scrolling
  useEffect(() => {
    if (isSearching) return;

    const sections = groupedSections
      .map((s) => ({
        id: getCategoryId(s.categoryKey),
        categoryKey: s.categoryKey,
      }))
      .filter((s) => !!document.getElementById(s.id));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));

        const top = visible[0];
        if (!top?.target?.id) return;

        const match = sections.find((s) => s.id === top.target.id);
        if (!match) return;

        if (activeCategoryRef.current !== match.categoryKey) {
          setActiveCategory(match.categoryKey);
        }
      },
      {
        root: null,
        threshold: [0.15, 0.25, 0.35],
        rootMargin: "-20% 0px -65% 0px",
      }
    );

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [groupedSections, isSearching]);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="gradient-hero border-b border-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="container py-12 md:py-16 relative">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg">
                <Sparkles className="h-4 w-4" />
                {t("app.tagline")}
              </div>

              <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl text-balance">
                {t("app.title")} {" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {t("app.titleHighlight")}
                </span>{" "}
                {t("app.titleEnd")}
              </h1>

              <p className="mb-8 text-lg text-muted-foreground md:text-xl text-balance max-w-xl mx-auto">
                {t("app.description")}
              </p>

              {isTrialActive && !isSubscribed && (
                <div className="mx-auto mb-6 max-w-md rounded-2xl border border-border bg-card/60 px-4 py-3 text-sm text-muted-foreground">
                  Trial active: <span className="font-semibold text-foreground">{trialDaysLeft}</span> day(s) left.
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative mx-auto max-w-md"
            >
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t("app.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-14 pl-12 text-base bg-card border-2 border-border shadow-card rounded-2xl focus:border-primary transition-colors"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Category Quick Nav */}
      {!isSearching && (
        <section className="border-b border-border bg-background sticky top-16 z-40">
          <div className="container py-4">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categoryKeys.map((categoryKey) => (
                <button
                  key={categoryKey}
                  onClick={() => scrollToCategory(categoryKey)}
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
      )}

      {/* Tools */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">
              {isSearching ? `Search results for \"${search.trim()}\"` : t("app.allTools")}
            </h2>
            <span className="text-sm font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">
              {t("app.toolsAvailable", { count: totalToolsCount })}
            </span>
          </div>

          <div id="tools-sections" className="scroll-mt-28" />

          {totalToolsCount === 0 ? (
            <div className="py-16 text-center">
              <p className="text-lg text-muted-foreground">{t("app.noToolsFound")}</p>
            </div>
          ) : isSearching ? (
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
            <div className="space-y-8">
              {groupedSections.map((section, sectionIndex) => {
                const sectionId = getCategoryId(section.categoryKey);

                return (
                  <details
                    key={section.categoryKey}
                    id={sectionId}
                    className="group scroll-mt-28 rounded-3xl border border-border bg-card/40"
                    defaultOpen={sectionIndex < 2}
                  >
                    <summary className="cursor-pointer select-none list-none px-6 py-5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-open:rotate-180" />
                          <h3 className="text-xl font-bold text-foreground">{t(section.categoryKey)}</h3>
                        </div>

                        <span className="text-xs font-semibold text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                          {section.tools.length}
                        </span>
                      </div>
                    </summary>

                    <div className="px-6 pb-6">
                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {section.tools.map((tool, toolIndex) => (
                          <ToolCard
                            key={tool.id}
                            titleKey={tool.titleKey}
                            descriptionKey={tool.descriptionKey}
                            icon={tool.icon}
                            href={tool.href}
                            categoryKey={tool.categoryKey}
                            index={toolIndex}
                            isPremium={tool.isPremium}
                          />
                        ))}
                      </div>
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Premium CTA Section */}
      {!isSubscribed && (
        <section id="premium-cta" className="py-16 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 scroll-mt-28">
          <div className="container">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
                Unlock All{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Premium Tools
                </span>
              </h2>

              <p className="text-lg text-muted-foreground mb-8">Get access to all tools for your pregnancy journey</p>

              <div className="bg-card rounded-3xl p-8 shadow-elevated border-2 border-primary/20 max-w-md mx-auto">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <span className="text-5xl font-extrabold text-foreground">$1.99</span>
                  <span className="text-muted-foreground text-lg">/month</span>
                </div>

                <ul className="space-y-3 text-left mb-8">
                  {[
                    "Access all tools",
                    "Unlimited tracking & logging",
                    "Personalized insights",
                    "Export data for your doctor",
                    "Cancel anytime",
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-foreground">
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button onClick={handleSubscribe} size="lg" className="w-full gradient-primary text-white font-bold text-lg h-14 shadow-lg hover:shadow-xl transition-all">
                  <Store className="h-5 w-5 mr-2" />
                  Pay with Google Play
                </Button>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Secure payment via Google Play Billing</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Trust Banner */}
      <section className="border-t border-border bg-card py-12">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">{t("common.warning")}:</strong> {t("app.medicalDisclaimer")}
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
