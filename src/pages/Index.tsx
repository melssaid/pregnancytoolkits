import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Search } from "lucide-react";
import { Layout } from "@/components/Layout";
import { ToolCard } from "@/components/ToolCard";
import { toolsData, categories } from "@/lib/tools-data";
import { Input } from "@/components/ui/input";

const Index = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredTools = toolsData.filter((tool) => {
    const matchesSearch = 
      tool.title.toLowerCase().includes(search.toLowerCase()) ||
      tool.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || tool.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

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
                Trusted by thousands of mothers
              </div>
              
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl text-balance">
                Your Complete{" "}
                <span className="text-primary">Women's Health</span>{" "}
                Toolkit
              </h1>
              
              <p className="mb-8 text-lg text-muted-foreground md:text-xl text-balance">
                Professional-grade health calculators and trackers designed for every stage 
                of your journey — from fertility planning to postpartum care.
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
                placeholder="Search tools..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 pl-12 text-base bg-card border-border shadow-card"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="border-b border-border bg-card">
        <div className="container py-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-muted"
                }`}
              >
                {category}
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
              {activeCategory === "All" ? "All Tools" : activeCategory}
            </h2>
            <span className="text-sm text-muted-foreground">
              {filteredTools.length} tools available
            </span>
          </div>

          {filteredTools.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredTools.map((tool, index) => (
                <ToolCard
                  key={tool.id}
                  title={tool.title}
                  description={tool.description}
                  icon={tool.icon}
                  href={tool.href}
                  category={tool.category}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-lg text-muted-foreground">
                No tools found matching your search.
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
              <strong className="text-foreground">Medical Disclaimer:</strong> These tools are for 
              informational and educational purposes only. They do not constitute medical advice, 
              diagnosis, or treatment. Always consult with qualified healthcare professionals 
              for medical decisions.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
