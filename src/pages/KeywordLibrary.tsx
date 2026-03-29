import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Search, Filter, TrendingUp, Target, BarChart3, Globe, ChevronDown } from "lucide-react";
import { Layout } from "@/components/Layout";
import { SEOHead } from "@/components/SEOHead";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SeoCategory {
  id: string;
  name_ar: string;
  name_en: string | null;
  icon: string | null;
  sort_order: number;
}

interface SeoKeyword {
  id: string;
  keyword_ar: string;
  keyword_en: string | null;
  category_id: string;
  intent: string;
  volume_tier: string;
  competition_tier: string;
}

const INTENT_COLORS: Record<string, string> = {
  informational: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  commercial: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  transactional: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  navigational: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
};

const VOLUME_COLORS: Record<string, string> = {
  High: "text-red-600 dark:text-red-400",
  Medium: "text-amber-600 dark:text-amber-400",
  Low: "text-emerald-600 dark:text-emerald-400",
  VeryLow: "text-muted-foreground",
};

const VOLUME_DOTS: Record<string, number> = { High: 3, Medium: 2, Low: 1, VeryLow: 0 };

export default function KeywordLibrary() {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [intentFilter, setIntentFilter] = useState<string | null>(null);
  const [volumeFilter, setVolumeFilter] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["seo-categories"],
    queryFn: async () => {
      const { data } = await supabase
        .from("seo_categories")
        .select("*")
        .order("sort_order");
      return (data || []) as SeoCategory[];
    },
    staleTime: 1000 * 60 * 30,
  });

  // Fetch keywords
  const { data: keywords = [], isLoading } = useQuery({
    queryKey: ["seo-keywords"],
    queryFn: async () => {
      const { data } = await supabase
        .from("seo_keywords")
        .select("*");
      return (data || []) as SeoKeyword[];
    },
    staleTime: 1000 * 60 * 30,
  });

  // Filter keywords
  const filtered = useMemo(() => {
    let result = keywords;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (k) =>
          k.keyword_ar.toLowerCase().includes(q) ||
          (k.keyword_en && k.keyword_en.toLowerCase().includes(q))
      );
    }
    if (selectedCategory) result = result.filter((k) => k.category_id === selectedCategory);
    if (intentFilter) result = result.filter((k) => k.intent === intentFilter);
    if (volumeFilter) result = result.filter((k) => k.volume_tier === volumeFilter);
    return result;
  }, [keywords, searchQuery, selectedCategory, intentFilter, volumeFilter]);

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<string, SeoKeyword[]>();
    for (const kw of filtered) {
      const arr = map.get(kw.category_id) || [];
      arr.push(kw);
      map.set(kw.category_id, arr);
    }
    return map;
  }, [filtered]);

  // Stats
  const stats = useMemo(() => {
    const high = filtered.filter((k) => k.volume_tier === "High").length;
    const medium = filtered.filter((k) => k.volume_tier === "Medium").length;
    const low = filtered.filter((k) => k.volume_tier === "Low" || k.volume_tier === "VeryLow").length;
    return { total: filtered.length, high, medium, low };
  }, [filtered]);

  const intents = ["informational", "commercial", "transactional", "navigational"];
  const volumes = ["High", "Medium", "Low"];

  const clearFilters = () => {
    setSelectedCategory(null);
    setIntentFilter(null);
    setVolumeFilter(null);
    setSearchQuery("");
  };

  const hasActiveFilters = selectedCategory || intentFilter || volumeFilter || searchQuery;

  return (
    <Layout showBack>
      <SEOHead title="مكتبة الكلمات المفتاحية" description="مكتبة شاملة للكلمات المفتاحية العربية عن الحمل والولادة والخصوبة" noindex />

      <div className={cn("max-w-2xl mx-auto px-4 pb-24", isRtl && "text-right")} dir={isRtl ? "rtl" : "ltr"}>
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5"
        >
          <h1 className="text-xl font-bold text-foreground mb-1 ar-heading">
            📊 مكتبة الكلمات المفتاحية
          </h1>
          <p className="text-xs text-muted-foreground">
            {keywords.length} كلمة مفتاحية • {categories.length} فئة
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="rounded-xl bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/10 p-3 text-center border border-red-200/30">
            <TrendingUp className="w-4 h-4 mx-auto mb-1 text-red-500" />
            <div className="text-lg font-bold text-red-600 dark:text-red-400">{stats.high}</div>
            <div className="text-[10px] text-red-500/80">بحث عالي</div>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10 p-3 text-center border border-amber-200/30">
            <BarChart3 className="w-4 h-4 mx-auto mb-1 text-amber-500" />
            <div className="text-lg font-bold text-amber-600 dark:text-amber-400">{stats.medium}</div>
            <div className="text-[10px] text-amber-500/80">بحث متوسط</div>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/10 p-3 text-center border border-emerald-200/30">
            <Target className="w-4 h-4 mx-auto mb-1 text-emerald-500" />
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{stats.low}</div>
            <div className="text-[10px] text-emerald-500/80">منافسة منخفضة</div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground", isRtl ? "right-3" : "left-3")} />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالعربية أو الإنجليزية..."
            className={cn("h-10 text-sm rounded-xl border-border/50 bg-muted/30", isRtl ? "pr-9 pl-3" : "pl-9 pr-3")}
          />
        </div>

        {/* Filters Row */}
        <div className="flex gap-2 mb-2 overflow-x-auto pb-1 scrollbar-hide">
          <FilterChip
            label="الفئة"
            icon={<Filter className="w-3 h-3" />}
            active={!!selectedCategory}
            items={categories.map((c) => ({ id: c.id, label: `${c.icon || ""} ${c.name_ar}` }))}
            selected={selectedCategory}
            onSelect={(id) => setSelectedCategory(id === selectedCategory ? null : id)}
          />
          <FilterChip
            label="النية"
            icon={<Globe className="w-3 h-3" />}
            active={!!intentFilter}
            items={intents.map((i) => ({ id: i, label: i }))}
            selected={intentFilter}
            onSelect={(id) => setIntentFilter(id === intentFilter ? null : id)}
          />
          <FilterChip
            label="الحجم"
            icon={<TrendingUp className="w-3 h-3" />}
            active={!!volumeFilter}
            items={volumes.map((v) => ({ id: v, label: v }))}
            selected={volumeFilter}
            onSelect={(id) => setVolumeFilter(id === volumeFilter ? null : id)}
          />
        </div>

        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-[10px] text-primary underline mb-3 block">
            مسح الفلاتر ({stats.total} نتيجة)
          </button>
        )}

        {/* Keyword List by Category */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-muted/50 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {categories
              .filter((c) => grouped.has(c.id))
              .map((cat) => (
                <CategoryGroup
                  key={cat.id}
                  category={cat}
                  keywords={grouped.get(cat.id) || []}
                  expanded={expandedCategory === cat.id || !!searchQuery || !!intentFilter || !!volumeFilter}
                  onToggle={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
                />
              ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">لا توجد نتائج</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

// ═══════════════════════════════════════════
// Category Group Component
// ═══════════════════════════════════════════
function CategoryGroup({
  category,
  keywords,
  expanded,
  onToggle,
}: {
  category: SeoCategory;
  keywords: SeoKeyword[];
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      layout
      className="rounded-xl border border-border/50 bg-card overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{category.icon}</span>
          <span className="text-sm font-semibold text-foreground">{category.name_ar}</span>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {keywords.length}
          </Badge>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", expanded && "rotate-180")} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-1.5">
              {keywords.map((kw) => (
                <KeywordRow key={kw.id} keyword={kw} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ═══════════════════════════════════════════
// Keyword Row Component
// ═══════════════════════════════════════════
function KeywordRow({ keyword }: { keyword: SeoKeyword }) {
  const dots = VOLUME_DOTS[keyword.volume_tier] || 0;

  return (
    <div className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-lg hover:bg-muted/40 transition-colors group">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground truncate">{keyword.keyword_ar}</p>
        {keyword.keyword_en && (
          <p className="text-[10px] text-muted-foreground/70 truncate" dir="ltr">
            {keyword.keyword_en}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {/* Volume dots */}
        <div className="flex gap-0.5" title={`Volume: ${keyword.volume_tier}`}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                i <= dots ? VOLUME_COLORS[keyword.volume_tier]?.replace("text-", "bg-") || "bg-muted" : "bg-muted-foreground/20"
              )}
            />
          ))}
        </div>

        {/* Competition badge */}
        <span className={cn(
          "text-[9px] px-1.5 py-0.5 rounded-full font-medium",
          keyword.competition_tier === "High" ? "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400" :
          keyword.competition_tier === "Medium" ? "bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" :
          "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
        )}>
          {keyword.competition_tier === "High" ? "صعب" : keyword.competition_tier === "Medium" ? "متوسط" : "سهل"}
        </span>

        {/* Intent badge */}
        <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-medium", INTENT_COLORS[keyword.intent] || "bg-muted text-muted-foreground")}>
          {keyword.intent === "informational" ? "معلوماتي" :
           keyword.intent === "commercial" ? "تجاري" :
           keyword.intent === "transactional" ? "تحويلي" : "ملاحي"}
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Filter Chip Component
// ═══════════════════════════════════════════
function FilterChip({
  label,
  icon,
  active,
  items,
  selected,
  onSelect,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  items: { id: string; label: string }[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all border",
          active
            ? "bg-primary/10 text-primary border-primary/30"
            : "bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted"
        )}
      >
        {icon}
        {label}
        <ChevronDown className="w-3 h-3" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute top-full mt-1 z-50 bg-card border border-border rounded-xl shadow-lg p-1.5 min-w-[160px] max-h-[300px] overflow-y-auto"
            >
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelect(item.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full text-right px-2.5 py-1.5 rounded-lg text-xs transition-colors",
                    selected === item.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-muted/60 text-foreground"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
