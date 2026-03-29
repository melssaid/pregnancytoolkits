import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Search, Sparkles, Copy, Check, ChevronDown, RotateCcw,
  FileText, Type, AlignLeft, Hash, AlertTriangle, Loader2,
  Globe, MapPin,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { SEOHead } from "@/components/SEOHead";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useSmartInsight } from "@/hooks/useSmartInsight";

// ═══════════════════════════════════════════
// Types
// ═══════════════════════════════════════════
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

interface ASODraft {
  title: string;
  shortDesc: string;
  longDesc: string;
  supportKeywords: string[];
}

interface CountryListing {
  country: string;
  flag: string;
  language: string;
  title: string;
  shortDesc: string;
  longDesc: string;
  localTips: string[];
}

const COUNTRY_PRESETS = [
  { code: "SA", flag: "🇸🇦", name: "السعودية", lang: "ar", hints: "التقويم الهجري، متابعة الحمل، تطبيق حمل سعودي، رعاية الأم" },
  { code: "EG", flag: "🇪🇬", name: "مصر", lang: "ar", hints: "متابعة الحمل مجاناً، بدون نت، تطبيق حمل مصري، أمومة" },
  { code: "AE", flag: "🇦🇪", name: "الإمارات", lang: "ar", hints: "رعاية صحة الأم، تطبيق حمل إماراتي، متابعة الجنين" },
  { code: "DE", flag: "🇩🇪", name: "ألمانيا", lang: "de", hints: "Schwangerschaft Tracker, Geburtsterminrechner, Baby Entwicklung" },
  { code: "FR", flag: "🇫🇷", name: "فرنسا", lang: "fr", hints: "Suivi de grossesse, Calculateur de date, Bébé croissance" },
  { code: "ES", flag: "🇪🇸", name: "إسبانيا", lang: "es", hints: "Seguimiento de embarazo, Calculadora de fecha, Bebé crecimiento" },
  { code: "TR", flag: "🇹🇷", name: "تركيا", lang: "tr", hints: "Hamilelik takipçisi, Doğum tarihi hesaplama, Bebek büyüme" },
  { code: "BR", flag: "🇧🇷", name: "البرازيل", lang: "pt", hints: "Rastreador de gravidez, Calculadora de data, Bebê crescimento" },
  { code: "US", flag: "🇺🇸", name: "أمريكا", lang: "en", hints: "Pregnancy tracker, Due date calculator, Baby growth, TTC" },
  { code: "GB", flag: "🇬🇧", name: "بريطانيا", lang: "en", hints: "Pregnancy tracker NHS, Due date, Baby development tracker" },
];

// ═══════════════════════════════════════════
// Limits per Google Play policies
// ═══════════════════════════════════════════
const TITLE_LIMIT = 30;
const SHORT_DESC_LIMIT = 80;
const LONG_DESC_LIMIT = 4000;

export default function ASOGenerator() {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [drafts, setDrafts] = useState<ASODraft[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("select");
  const [selectedCountries, setSelectedCountries] = useState<Set<string>>(new Set());
  const [localizedListings, setLocalizedListings] = useState<CountryListing[]>([]);
  const [isGeneratingLocal, setIsGeneratingLocal] = useState(false);
  // Fetch data
  const { data: categories = [] } = useQuery({
    queryKey: ["seo-categories"],
    queryFn: async () => {
      const { data } = await supabase.from("seo_categories").select("*").order("sort_order");
      return (data || []) as SeoCategory[];
    },
    staleTime: 1000 * 60 * 30,
  });

  const { data: keywords = [] } = useQuery({
    queryKey: ["seo-keywords"],
    queryFn: async () => {
      const { data } = await supabase.from("seo_keywords").select("*");
      return (data || []) as SeoKeyword[];
    },
    staleTime: 1000 * 60 * 30,
  });

  // Smart engine for AI generation
  const { generate, isLoading: aiLoading, content: aiContent } = useSmartInsight({
    section: "nutrition", // reuse section since ASO is admin-only
    toolType: "pregnancy-assistant",
  });

  // Filter keywords
  const filtered = useMemo(() => {
    let result = keywords;
    if (selectedCategory) result = result.filter((k) => k.category_id === selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (k) => k.keyword_ar.toLowerCase().includes(q) || (k.keyword_en?.toLowerCase().includes(q))
      );
    }
    return result;
  }, [keywords, selectedCategory, searchQuery]);

  // Toggle keyword selection
  const toggleKeyword = useCallback((id: string) => {
    setSelectedKeywords((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Select all visible
  const selectAllVisible = useCallback(() => {
    setSelectedKeywords((prev) => {
      const next = new Set(prev);
      filtered.forEach((k) => next.add(k.id));
      return next;
    });
  }, [filtered]);

  // Get selected keyword objects
  const selectedKwObjects = useMemo(
    () => keywords.filter((k) => selectedKeywords.has(k.id)),
    [keywords, selectedKeywords]
  );

  // Copy to clipboard
  const copyToClipboard = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success("تم النسخ");
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error("فشل النسخ");
    }
  }, []);

  // ═══════════════════════════════════════════
  // Generate ASO Drafts using AI
  // ═══════════════════════════════════════════
  const generateDrafts = useCallback(async () => {
    if (selectedKwObjects.length === 0) {
      toast.error("اختر كلمات مفتاحية أولاً");
      return;
    }

    setIsGenerating(true);
    setDrafts([]);

    const kwListAr = selectedKwObjects.map((k) => k.keyword_ar).join("، ");
    const kwListEn = selectedKwObjects.filter((k) => k.keyword_en).map((k) => k.keyword_en).join(", ");
    const categoryNames = [...new Set(selectedKwObjects.map((k) => {
      const cat = categories.find((c) => c.id === k.category_id);
      return cat?.name_ar || "";
    }))].filter(Boolean).join("، ");

    const prompt = `أنت خبير ASO (App Store Optimization) لتطبيقات Google Play العربية.

المطلوب: أنشئ 3 نسخ مختلفة من نصوص المتجر لتطبيق حمل وخصوبة عربي، باستخدام الكلمات المفتاحية التالية:

الكلمات العربية: ${kwListAr}
${kwListEn ? `الكلمات الإنجليزية: ${kwListEn}` : ""}
الفئات: ${categoryNames}

القواعد الصارمة:
1. العنوان (title): أقل من ${TITLE_LIMIT} حرفاً، بدون إيموجي أو رموز أو حروف كبيرة مبالغة
2. الوصف القصير (shortDesc): أقل من ${SHORT_DESC_LIMIT} حرفاً، جملة واحدة واضحة
3. الوصف الطويل (longDesc): أقل من ${LONG_DESC_LIMIT} حرف، فقرات مرتبة، بدون حشو أو تكرار نفس الكلمة أكثر من 3 مرات
4. لا تقدّم ادّعاءات طبية أو وعود علاجية
5. أضف "تعليمي فقط • استشر طبيبك" في نهاية الوصف الطويل
6. النبرة: احترافية، داعمة، واضحة، بدون مبالغة
7. أضف 5-8 كلمات مساندة/مرادفات لم تُستخدم في النصوص

أجب بتنسيق JSON فقط (بدون markdown):
[
  {
    "title": "...",
    "shortDesc": "...",
    "longDesc": "...",
    "supportKeywords": ["...", "..."]
  },
  { نسخة 2 },
  { نسخة 3 }
]`;

    try {
      await generate({
        prompt,
        context: { language: "ar" },
      });
    } catch {
      toast.error("فشل التوليد");
    }
    setIsGenerating(false);
  }, [selectedKwObjects, categories, generate]);

  // Parse AI content into drafts
  useMemo(() => {
    if (!aiContent) return;
    try {
      // Extract JSON from content (may have markdown wrapping)
      let jsonStr = aiContent;
      const jsonMatch = aiContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) jsonStr = jsonMatch[0];
      const parsed = JSON.parse(jsonStr) as ASODraft[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        setDrafts(parsed);
        setActiveTab("results");
      }
    } catch {
      // Still streaming or invalid JSON — wait
    }
  }, [aiContent]);

  // ═══════════════════════════════════════════
  // ═══════════════════════════════════════════
  // Generate Localized Store Listings
  // ═══════════════════════════════════════════
  const generateLocalizedListings = useCallback(async () => {
    if (selectedCountries.size === 0) {
      toast.error("اختر دول أولاً");
      return;
    }

    setIsGeneratingLocal(true);
    setLocalizedListings([]);

    const countries = COUNTRY_PRESETS.filter((c) => selectedCountries.has(c.code));
    const countriesDesc = countries.map((c) => `${c.flag} ${c.name} (${c.lang}) — كلمات محلية: ${c.hints}`).join("\n");

    const prompt = `أنت خبير ASO متخصص في Custom Store Listings على Google Play.

المطلوب: أنشئ نسخة محلية مخصصة من نصوص المتجر لتطبيق "Pregnancy Toolkits" (تطبيق حمل وخصوبة مع 35+ أداة ذكية) لكل دولة من الدول التالية:

${countriesDesc}

لكل دولة أنشئ:
1. title: عنوان بلغة الدولة (أقل من 30 حرف)
2. shortDesc: وصف قصير بلغة الدولة (أقل من 80 حرف)
3. longDesc: وصف طويل بلغة الدولة (500-800 حرف) يتضمن الكلمات المحلية
4. localTips: 3 نصائح ASO خاصة بهذا السوق

القواعد:
- استخدم المصطلحات الشائعة في كل بلد (مثلاً "حامل" في مصر vs "حمل" في السعودية)
- لا تترجم حرفياً، بل اكتب بأسلوب طبيعي لأهل البلد
- أضف "تعليمي فقط" بلغة كل بلد
- للدول العربية: راعِ الفروقات اللهجوية في الكلمات المفتاحية

أجب بتنسيق JSON فقط (بدون markdown):
[
  {
    "country": "اسم الدولة",
    "flag": "🏳️",
    "language": "ar/en/de/...",
    "title": "...",
    "shortDesc": "...",
    "longDesc": "...",
    "localTips": ["نصيحة 1", "نصيحة 2", "نصيحة 3"]
  }
]`;

    try {
      await generate({ prompt, context: { language: "ar" } });
    } catch {
      toast.error("فشل التوليد");
    }
    setIsGeneratingLocal(false);
  }, [selectedCountries, generate]);

  // Parse localized listings from AI content
  useMemo(() => {
    if (!aiContent || activeTab !== "localized") return;
    try {
      let jsonStr = aiContent;
      const jsonMatch = aiContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) jsonStr = jsonMatch[0];
      const parsed = JSON.parse(jsonStr) as CountryListing[];
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].country) {
        setLocalizedListings(parsed);
      }
    } catch {
      // Still streaming
    }
  }, [aiContent, activeTab]);

  // Validation helpers
  // ═══════════════════════════════════════════
  const validateField = (text: string, limit: number) => {
    const len = text.length;
    if (len > limit) return { ok: false, msg: `${len}/${limit} — يتجاوز الحد!`, color: "text-red-500" };
    if (len > limit * 0.9) return { ok: true, msg: `${len}/${limit}`, color: "text-amber-500" };
    return { ok: true, msg: `${len}/${limit}`, color: "text-emerald-500" };
  };

  // Check keyword stuffing (same word > 3 times)
  const checkStuffing = (text: string): string[] => {
    const words = text.split(/[\s،,\.]+/).filter((w) => w.length > 2);
    const counts = new Map<string, number>();
    words.forEach((w) => counts.set(w, (counts.get(w) || 0) + 1));
    return [...counts.entries()].filter(([, c]) => c > 3).map(([w]) => w);
  };

  return (
    <Layout showBack>
      <SEOHead title="مولّد نصوص المتجر (ASO)" description="أداة توليد نصوص Google Play Store من الكلمات المفتاحية" noindex />

      <div className={cn("max-w-2xl mx-auto px-4 pb-24", isRtl && "text-right")} dir={isRtl ? "rtl" : "ltr"}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
          <h1 className="text-xl font-bold text-foreground mb-1 ar-heading">
            ✍️ مولّد نصوص المتجر
          </h1>
          <p className="text-xs text-muted-foreground">
            اختر كلمات مفتاحية → ولّد 3 نسخ ASO جاهزة لـ Google Play
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4 bg-muted/50">
            <TabsTrigger value="select" className="flex-1 text-xs gap-1">
              <Hash className="w-3 h-3" />
              اختر الكلمات
              {selectedKeywords.size > 0 && (
                <Badge variant="secondary" className="text-[9px] px-1 py-0 mr-1">{selectedKeywords.size}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="results" className="flex-1 text-xs gap-1">
              <FileText className="w-3 h-3" />
              النتائج
              {drafts.length > 0 && (
                <Badge variant="secondary" className="text-[9px] px-1 py-0 mr-1">{drafts.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ═══ TAB 1: Keyword Selection ═══ */}
          <TabsContent value="select" className="space-y-3">
            {/* Category filter */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap border transition-all",
                  !selectedCategory
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "bg-muted/50 text-muted-foreground border-border/50"
                )}
              >
                الكل
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id === selectedCategory ? null : c.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap border transition-all",
                    selectedCategory === c.id
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-muted/50 text-muted-foreground border-border/50"
                  )}
                >
                  {c.icon} {c.name_ar}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground", isRtl ? "right-3" : "left-3")} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن كلمة..."
                className={cn("h-9 text-xs rounded-xl bg-muted/30", isRtl ? "pr-9" : "pl-9")}
              />
            </div>

            {/* Select all button */}
            <div className="flex items-center justify-between">
              <button onClick={selectAllVisible} className="text-[10px] text-primary underline">
                تحديد الكل ({filtered.length})
              </button>
              {selectedKeywords.size > 0 && (
                <button onClick={() => setSelectedKeywords(new Set())} className="text-[10px] text-muted-foreground underline">
                  إلغاء التحديد
                </button>
              )}
            </div>

            {/* Keyword chips */}
            <div className="flex flex-wrap gap-1.5">
              {filtered.map((kw) => {
                const selected = selectedKeywords.has(kw.id);
                return (
                  <button
                    key={kw.id}
                    onClick={() => toggleKeyword(kw.id)}
                    className={cn(
                      "px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all",
                      selected
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card text-foreground border-border/50 hover:border-primary/40"
                    )}
                  >
                    {kw.keyword_ar}
                    {kw.volume_tier === "High" && <span className="mr-1 text-[9px] opacity-70">🔥</span>}
                  </button>
                );
              })}
            </div>

            {/* Generate button */}
            <motion.div layout className="pt-3">
              <Button
                onClick={generateDrafts}
                disabled={selectedKeywords.size === 0 || isGenerating || aiLoading}
                className="w-full h-12 rounded-xl text-sm font-bold gap-2 bg-gradient-to-r from-primary to-primary/80 shadow-lg"
              >
                {isGenerating || aiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جارٍ التوليد...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    ولّد 3 نسخ ASO ({selectedKeywords.size} كلمة)
                  </>
                )}
              </Button>
              <p className="text-[9px] text-center text-muted-foreground/60 mt-1.5">
                يستهلك 1 نقطة ذكاء اصطناعي
              </p>
            </motion.div>
          </TabsContent>

          {/* ═══ TAB 2: Results ═══ */}
          <TabsContent value="results" className="space-y-4">
            {drafts.length === 0 && !aiLoading && (
              <div className="text-center py-12">
                <FileText className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">لم يتم توليد نسخ بعد</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">اختر كلمات مفتاحية أولاً من التبويب الأول</p>
              </div>
            )}

            {aiLoading && drafts.length === 0 && (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 mx-auto text-primary animate-spin mb-3" />
                <p className="text-sm text-foreground font-medium">جارٍ توليد النسخ...</p>
                <p className="text-[10px] text-muted-foreground mt-1">يتم تحليل {selectedKeywords.size} كلمة مفتاحية</p>
              </div>
            )}

            {drafts.map((draft, idx) => (
              <DraftCard
                key={idx}
                draft={draft}
                index={idx}
                copiedField={copiedField}
                onCopy={copyToClipboard}
                validateField={validateField}
                checkStuffing={checkStuffing}
              />
            ))}

            {drafts.length > 0 && (
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs gap-1"
                  onClick={() => {
                    setActiveTab("select");
                  }}
                >
                  <RotateCcw className="w-3 h-3" />
                  تعديل الكلمات
                </Button>
                <Button
                  size="sm"
                  className="flex-1 text-xs gap-1"
                  onClick={generateDrafts}
                  disabled={isGenerating || aiLoading}
                >
                  <Sparkles className="w-3 h-3" />
                  إعادة التوليد
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

// ═══════════════════════════════════════════
// Draft Card Component
// ═══════════════════════════════════════════
function DraftCard({
  draft,
  index,
  copiedField,
  onCopy,
  validateField,
  checkStuffing,
}: {
  draft: ASODraft;
  index: number;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
  validateField: (text: string, limit: number) => { ok: boolean; msg: string; color: string };
  checkStuffing: (text: string) => string[];
}) {
  const titleV = validateField(draft.title, TITLE_LIMIT);
  const shortV = validateField(draft.shortDesc, SHORT_DESC_LIMIT);
  const longV = validateField(draft.longDesc, LONG_DESC_LIMIT);
  const stuffed = checkStuffing(draft.longDesc);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="rounded-xl border border-border/50 bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="px-3 py-2 bg-gradient-to-l from-primary/5 to-transparent border-b border-border/30 flex items-center justify-between">
        <span className="text-xs font-bold text-foreground">النسخة {index + 1}</span>
        <div className="flex gap-1">
          {!titleV.ok && <AlertTriangle className="w-3 h-3 text-red-500" />}
          {stuffed.length > 0 && <AlertTriangle className="w-3 h-3 text-amber-500" />}
        </div>
      </div>

      <div className="p-3 space-y-3">
        {/* Title */}
        <FieldBlock
          label="العنوان"
          icon={<Type className="w-3 h-3" />}
          value={draft.title}
          validation={titleV}
          fieldKey={`title-${index}`}
          copiedField={copiedField}
          onCopy={onCopy}
        />

        {/* Short Description */}
        <FieldBlock
          label="الوصف القصير"
          icon={<AlignLeft className="w-3 h-3" />}
          value={draft.shortDesc}
          validation={shortV}
          fieldKey={`short-${index}`}
          copiedField={copiedField}
          onCopy={onCopy}
        />

        {/* Long Description */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
              <FileText className="w-3 h-3" />
              الوصف الطويل
            </div>
            <div className="flex items-center gap-2">
              <span className={cn("text-[9px]", longV.color)}>{longV.msg}</span>
              <button
                onClick={() => onCopy(draft.longDesc, `long-${index}`)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {copiedField === `long-${index}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
          <div className="p-2 rounded-lg bg-muted/30 border border-border/30 text-[11px] leading-relaxed text-foreground max-h-40 overflow-y-auto">
            {draft.longDesc}
          </div>
          {stuffed.length > 0 && (
            <div className="flex items-center gap-1 mt-1 text-[9px] text-amber-600">
              <AlertTriangle className="w-3 h-3" />
              تكرار مفرط: {stuffed.join("، ")}
            </div>
          )}
        </div>

        {/* Support Keywords */}
        {draft.supportKeywords && draft.supportKeywords.length > 0 && (
          <div>
            <div className="text-[10px] font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <Hash className="w-3 h-3" />
              كلمات مساندة
            </div>
            <div className="flex flex-wrap gap-1">
              {draft.supportKeywords.map((kw, i) => (
                <Badge key={i} variant="outline" className="text-[9px] px-1.5 py-0 cursor-pointer hover:bg-primary/10"
                  onClick={() => onCopy(kw, `support-${index}-${i}`)}
                >
                  {copiedField === `support-${index}-${i}` ? "✓" : kw}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════
// Field Block Component
// ═══════════════════════════════════════════
function FieldBlock({
  label,
  icon,
  value,
  validation,
  fieldKey,
  copiedField,
  onCopy,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  validation: { ok: boolean; msg: string; color: string };
  fieldKey: string;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
          {icon}
          {label}
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-[9px]", validation.color)}>{validation.msg}</span>
          <button
            onClick={() => onCopy(value, fieldKey)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {copiedField === fieldKey ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </div>
      <div className={cn(
        "p-2 rounded-lg border text-xs font-medium",
        validation.ok ? "bg-muted/30 border-border/30 text-foreground" : "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-800 dark:text-red-400"
      )}>
        {value}
      </div>
    </div>
  );
}
