import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { Briefcase, Brain, Baby, User, Heart, Plus, FileDown, Share2, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ToolFrame } from "@/components/ToolFrame";
import MedicalDisclaimer from "@/components/compliance/MedicalDisclaimer";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { useResetOnLanguageChange } from '@/hooks/useResetOnLanguageChange';
import { useSettings } from "@/hooks/useSettings";
import { safeParseLocalStorage, safeSaveToLocalStorage } from "@/lib/safeStorage";
import { VideoLibrary } from "@/components/VideoLibrary";
import { exportHospitalBagPDF, generateHospitalBagShareText } from "@/lib/pdfExport";
import { toast } from "sonner";
import { hospitalBagVideosByLang } from "@/data/videoData";

interface BagItem {
  id: string;
  nameKey: string;
  category: "mom" | "baby" | "partner" | "documents";
  packed: boolean;
  priority: "essential" | "recommended" | "optional";
}

const defaultItems: BagItem[] = [
  // Documents
  { id: "1", nameKey: "toolsInternal.hospitalBag.items.hospitalID", category: "documents", packed: false, priority: "essential" },
  { id: "2", nameKey: "toolsInternal.hospitalBag.items.birthPlanCopies", category: "documents", packed: false, priority: "essential" },
  // Mom essentials
  { id: "3", nameKey: "toolsInternal.hospitalBag.items.nightgown", category: "mom", packed: false, priority: "essential" },
  { id: "4", nameKey: "toolsInternal.hospitalBag.items.supportiveBras", category: "mom", packed: false, priority: "essential" },
  { id: "5", nameKey: "toolsInternal.hospitalBag.items.toiletries", category: "mom", packed: false, priority: "essential" },
  { id: "6", nameKey: "toolsInternal.hospitalBag.items.slippersSocks", category: "mom", packed: false, priority: "recommended" },
  { id: "7", nameKey: "toolsInternal.hospitalBag.items.goingHomeOutfitMom", category: "mom", packed: false, priority: "essential" },
  { id: "8", nameKey: "toolsInternal.hospitalBag.items.moisturizer", category: "mom", packed: false, priority: "recommended" },
  { id: "9", nameKey: "toolsInternal.hospitalBag.items.hairTies", category: "mom", packed: false, priority: "optional" },
  { id: "10", nameKey: "toolsInternal.hospitalBag.items.phoneCharger", category: "mom", packed: false, priority: "essential" },
  { id: "11", nameKey: "toolsInternal.hospitalBag.items.lipBalm", category: "mom", packed: false, priority: "optional" },
  // Baby essentials
  { id: "12", nameKey: "toolsInternal.hospitalBag.items.goingHomeOutfitBaby", category: "baby", packed: false, priority: "essential" },
  { id: "13", nameKey: "toolsInternal.hospitalBag.items.carSeat", category: "baby", packed: false, priority: "essential" },
  { id: "14", nameKey: "toolsInternal.hospitalBag.items.swaddleBlankets", category: "baby", packed: false, priority: "essential" },
  { id: "15", nameKey: "toolsInternal.hospitalBag.items.newbornDiapers", category: "baby", packed: false, priority: "recommended" },
  { id: "16", nameKey: "toolsInternal.hospitalBag.items.babyHat", category: "baby", packed: false, priority: "recommended" },
  // Partner
  { id: "17", nameKey: "toolsInternal.hospitalBag.items.changeOfClothes", category: "partner", packed: false, priority: "recommended" },
  { id: "18", nameKey: "toolsInternal.hospitalBag.items.snacksDrinks", category: "partner", packed: false, priority: "recommended" },
  { id: "19", nameKey: "toolsInternal.hospitalBag.items.cameraCharger", category: "partner", packed: false, priority: "optional" },
];

const AIHospitalBag = () => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { streamChat, isLoading } = usePregnancyAI();

  useResetOnLanguageChange(() => {
    setResponse('');
  });
  
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [items, setItems] = useState<BagItem[]>(() => {
    const stored = safeParseLocalStorage<unknown>("hospital-bag-items", null);

    if (!Array.isArray(stored) || stored.length === 0) return defaultItems;

    const legacyEnglishToKey: Record<string, string> = {
      "Hospital ID & Insurance cards": "toolsInternal.hospitalBag.items.hospitalID",
      "Birth plan copies": "toolsInternal.hospitalBag.items.birthPlanCopies",
      "Comfortable nightgown/robe": "toolsInternal.hospitalBag.items.nightgown",
      "Nightgown": "toolsInternal.hospitalBag.items.nightgown",
      "Comfortable supportive bras (2-3)": "toolsInternal.hospitalBag.items.supportiveBras",
      "Supportive bras (2-3)": "toolsInternal.hospitalBag.items.supportiveBras",
      "Supportive bras": "toolsInternal.hospitalBag.items.supportiveBras",
      "Toiletries bag": "toolsInternal.hospitalBag.items.toiletries",
      "Slippers & socks": "toolsInternal.hospitalBag.items.slippersSocks",
      "Going home outfit (Mom)": "toolsInternal.hospitalBag.items.goingHomeOutfitMom",
      "Moisturizing cream": "toolsInternal.hospitalBag.items.moisturizer",
      "Hair ties & headband": "toolsInternal.hospitalBag.items.hairTies",
      "Phone charger (long cord)": "toolsInternal.hospitalBag.items.phoneCharger",
      "Phone charger": "toolsInternal.hospitalBag.items.phoneCharger",
      "Lip balm": "toolsInternal.hospitalBag.items.lipBalm",
      "Going home outfit (Baby)": "toolsInternal.hospitalBag.items.goingHomeOutfitBaby",
      "Car seat (installed)": "toolsInternal.hospitalBag.items.carSeat",
      "Swaddle blankets (2)": "toolsInternal.hospitalBag.items.swaddleBlankets",
      "Newborn diapers": "toolsInternal.hospitalBag.items.newbornDiapers",
      "Baby hat": "toolsInternal.hospitalBag.items.babyHat",
      "Change of clothes": "toolsInternal.hospitalBag.items.changeOfClothes",
      "Snacks & drinks": "toolsInternal.hospitalBag.items.snacksDrinks",
      "Camera/phone charger": "toolsInternal.hospitalBag.items.cameraCharger",
    };

    const normalizeLegacyLabel = (value: string) =>
      value
        .trim()
        .toLowerCase()
        .replace(/[–—−]/g, "-")
        .replace(/[’‘]/g, "'")
        .replace(/\s+/g, " ");

    const legacyNormalizedToKey = new Map(
      Object.entries(legacyEnglishToKey).map(([k, v]) => [normalizeLegacyLabel(k), v] as const)
    );

    // Also migrate when older versions stored the *translated labels* (e.g., Arabic/German/etc.)
    // instead of stable translation keys.
    const supportedLangs = ["en", "ar", "de", "tr", "fr", "es", "pt"] as const;
    const localizedNormalizedToKey = new Map<string, string>();
    for (const key of defaultItems.map((i) => i.nameKey)) {
      for (const lng of supportedLangs) {
        const label = i18n.t(key, { lng, defaultValue: "" }) as string;
        if (!label) continue;
        // If missing in that language, i18n can return the key itself.
        if (label === key) continue;
        localizedNormalizedToKey.set(normalizeLegacyLabel(label), key);
      }
    }

    const defaultKeySet = new Set(defaultItems.map((i) => i.nameKey));
    const defaultIdToKey = new Map(defaultItems.map((i) => [i.id, i.nameKey] as const));


    const packedByKey = new Map<string, boolean>();
    const customItems: BagItem[] = [];

    const usedIds = new Set(defaultItems.map((i) => i.id));
    const makeUniqueId = (preferredId: string) => {
      const base = preferredId || Date.now().toString();
      if (!usedIds.has(base)) {
        usedIds.add(base);
        return base;
      }

      let i = 1;
      while (usedIds.has(`${base}-c${i}`)) i += 1;
      const next = `${base}-c${i}`;
      usedIds.add(next);
      return next;
    };

    for (const raw of stored) {
      const item = raw && typeof raw === "object" ? (raw as any) : {};

      const legacyLabel = typeof raw === "string" ? raw : "";
      const rawId = typeof item?.id === "string" ? item.id : "";
      const rawNameKey = typeof item?.nameKey === "string" ? item.nameKey : "";
      const packed = !!item?.packed;

      const sourceLabel =
        rawNameKey || (typeof item?.name === "string" ? item.name : "") || legacyLabel;

      // 1) If legacy storage preserved default IDs, treat as default item.
      if (rawId && defaultIdToKey.has(rawId)) {
        packedByKey.set(defaultIdToKey.get(rawId)!, packed);
        continue;
      }

      // 2) If stored value is a translation key or legacy key/English label.
      const legacyLookup =
        legacyEnglishToKey[sourceLabel] ||
        legacyNormalizedToKey.get(normalizeLegacyLabel(sourceLabel)) ||
        "";

      const localizedLookup =
        localizedNormalizedToKey.get(normalizeLegacyLabel(sourceLabel)) || "";

      const resolvedKey = sourceLabel.startsWith("toolsInternal.")
        ? sourceLabel
        : sourceLabel.startsWith("hospitalBag.")
          ? `toolsInternal.${sourceLabel}`
          : legacyLookup || localizedLookup;

      if (resolvedKey && defaultKeySet.has(resolvedKey)) {
        packedByKey.set(resolvedKey, packed);
        continue;
      }

      // 3) Otherwise keep it as a custom item (raw user input)
      const customName = sourceLabel;
      if (!customName.trim()) continue;

      const category: BagItem["category"] =
        item?.category === "mom" ||
        item?.category === "baby" ||
        item?.category === "partner" ||
        item?.category === "documents"
          ? item.category
          : "mom";

      const priority: BagItem["priority"] =
        item?.priority === "essential" ||
        item?.priority === "recommended" ||
        item?.priority === "optional"
          ? item.priority
          : "optional";

      customItems.push({
        id: makeUniqueId(rawId),
        nameKey: customName,
        category,
        packed,
        priority,
      });
    }

    return [
      ...defaultItems.map((d) => ({
        ...d,
        packed: packedByKey.get(d.nameKey) ?? d.packed,
      })),
      ...customItems,
    ];
  });
  const [newItem, setNewItem] = useState("");
  const [response, setResponse] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "mom" | "baby" | "partner" | "documents">("all");

  // Persist migrated list once on mount (so legacy English labels don't reappear)
  useEffect(() => {
    safeSaveToLocalStorage("hospital-bag-items", items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const togglePacked = (itemId: string) => {
    const updated = items.map(item =>
      item.id === itemId ? { ...item, packed: !item.packed } : item
    );
    setItems(updated);
    safeSaveToLocalStorage("hospital-bag-items", updated);
  };

  const addItem = () => {
    if (!newItem.trim()) return;
    const updated: BagItem[] = [...items, {
      id: Date.now().toString(),
      nameKey: newItem, // Custom items use the raw name as the key (will be displayed as-is)
      category: "mom" as const,
      packed: false,
      priority: "optional" as const
    }];
    setItems(updated);
    safeSaveToLocalStorage("hospital-bag-items", updated);
    setNewItem("");
  };

  const resetList = () => {
    if (window.confirm(t('toolsInternal.hospitalBag.resetConfirm'))) {
      localStorage.removeItem("hospital-bag-items");
      setItems(defaultItems);
      toast.success(t('toolsInternal.hospitalBag.resetSuccess'));
    }
  };

  // Helper to get item display name
  const getItemDisplayName = (item: BagItem): string => {
    const key = item.nameKey || "";
    if (!key) return "";
    if (key.startsWith("toolsInternal.")) return t(key);
    if (key.startsWith("hospitalBag.")) return t(`toolsInternal.${key}`);
    return key; // Custom items use raw name
  };

  // Export to PDF
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      const pdfItems = items.map(item => ({
        id: item.id,
        name: getItemDisplayName(item),
        category: item.category,
        packed: item.packed,
        priority: item.priority,
      }));

      await exportHospitalBagPDF({
        title: t('toolsInternal.hospitalBag.title'),
        subtitle: t('toolsInternal.hospitalBag.subtitle'),
        items: pdfItems,
        language: i18n.language as any,
        labels: {
          mom: t('toolsInternal.hospitalBag.mom'),
          baby: t('toolsInternal.hospitalBag.baby'),
          partner: t('toolsInternal.hospitalBag.partner'),
          documents: t('toolsInternal.hospitalBag.documents'),
          packed: t('toolsInternal.hospitalBag.packed'),
          notPacked: t('toolsInternal.hospitalBag.notPacked'),
          essential: t('toolsInternal.hospitalBag.essential'),
          recommended: t('toolsInternal.hospitalBag.recommended'),
          optional: t('toolsInternal.hospitalBag.optional'),
          progress: t('toolsInternal.hospitalBag.progress'),
          totalItems: t('toolsInternal.hospitalBag.items.totalItems'),
        },
      });

      toast.success(t('toolsInternal.hospitalBag.exportSuccess'));
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error(t('toolsInternal.hospitalBag.exportError'));
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Share via WhatsApp
  const handleShareWhatsApp = () => {
    const shareItems = items.map(item => ({
      id: item.id,
      name: getItemDisplayName(item),
      category: item.category,
      packed: item.packed,
      priority: item.priority,
    }));

    const shareText = generateHospitalBagShareText(shareItems, {
      title: t('toolsInternal.hospitalBag.title'),
      mom: t('toolsInternal.hospitalBag.mom'),
      baby: t('toolsInternal.hospitalBag.baby'),
      partner: t('toolsInternal.hospitalBag.partner'),
      documents: t('toolsInternal.hospitalBag.documents'),
      packed: t('toolsInternal.hospitalBag.packed'),
      notPacked: t('toolsInternal.hospitalBag.notPacked'),
      progress: t('toolsInternal.hospitalBag.progress'),
    });

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
  };

  const getPersonalizedList = async () => {
    const currentLang = i18n.language;
    const langNames: Record<string, string> = {
      en: 'English', ar: 'Arabic', de: 'German', tr: 'Turkish',
      fr: 'French', es: 'Spanish', pt: 'Portuguese'
    };
    const currentLangName = langNames[currentLang] || 'English';
    const langInstruction = currentLang !== 'en' 
      ? `IMPORTANT: Respond ENTIRELY in ${currentLangName}. All text, headers, and recommendations must be in ${currentLangName}.`
      : '';

    const prompt = `${langInstruction}

As a hospital bag expert for expectant mothers, create a personalized packing list:

**Pregnancy Week:** ${settings.pregnancyWeek || 36}
**Due Date:** ${settings.dueDate || "Not set"}
**Birth Plan:** ${settings.birthPlan || "Not specified"}

Provide a comprehensive, personalized hospital bag checklist organized by:
1. **For Mom** - Clothing, comfort items, toiletries
2. **For Baby** - Clothing, essentials
3. **For Partner** - Support items
4. **Documents** - Must-have paperwork
5. **Pro Tips** - Things most people forget
6. **By Trimester** - When to start packing what

Include seasonal considerations and hospital-specific recommendations.`;

    setResponse("");
    await streamChat({
      type: "pregnancy-assistant",
      messages: [{ role: "user", content: prompt }],
      context: { week: Number(settings.pregnancyWeek) || 36 },
      onDelta: (text) => setResponse((prev) => prev + text),
      onDone: () => {},
    });
  };

  const packedCount = items.filter(i => i.packed).length;
  const progress = Math.round((packedCount / items.length) * 100);

  const filteredItems = selectedCategory === "all" 
    ? items 
    : items.filter(i => i.category === selectedCategory);

  const categoryIcons = {
    mom: <User className="w-4 h-4" />,
    baby: <Baby className="w-4 h-4" />,
    partner: <Heart className="w-4 h-4" />,
    documents: <Briefcase className="w-4 h-4" />,
  };

  const categoryLabels: Record<string, string> = {
    all: t('toolsInternal.hospitalBag.all'),
    mom: t('toolsInternal.hospitalBag.mom'),
    baby: t('toolsInternal.hospitalBag.baby'),
    partner: t('toolsInternal.hospitalBag.partner'),
    documents: t('toolsInternal.hospitalBag.documents'),
  };

  if (!disclaimerAccepted) {
    return (
      <MedicalDisclaimer
        onAccept={() => setDisclaimerAccepted(true)}
        toolName={t('toolsInternal.hospitalBag.title')}
      />
    );
  }

  return (
    <ToolFrame
      title={t('toolsInternal.hospitalBag.title')}
      subtitle={t('toolsInternal.hospitalBag.subtitle')}
      customIcon="checklist"
      mood="empowering"
      toolId="ai-hospital-bag"
    >
      <div className="space-y-4">
        {/* Progress Card */}
        <Card className="p-3 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border-teal-200">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-sm">{t('toolsInternal.hospitalBag.progress')}</span>
            <span className="text-sm font-bold text-primary">{progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-teal-500 to-cyan-500 h-3 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {t('toolsInternal.hospitalBag.itemsPacked', { packed: packedCount, total: items.length })}
          </p>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: User, label: t('toolsInternal.hospitalBag.mom'), count: items.filter(i => i.category === 'mom').length, color: 'from-pink-500/20 to-rose-500/20' },
            { icon: Baby, label: t('toolsInternal.hospitalBag.baby'), count: items.filter(i => i.category === 'baby').length, color: 'from-blue-500/20 to-cyan-500/20' },
            { icon: Heart, label: t('toolsInternal.hospitalBag.partner'), count: items.filter(i => i.category === 'partner').length, color: 'from-purple-500/20 to-violet-500/20' },
            { icon: Briefcase, label: t('toolsInternal.hospitalBag.documents'), count: items.filter(i => i.category === 'documents').length, color: 'from-amber-500/20 to-orange-500/20' },
          ].map(({ icon: Icon, label, count, color }) => (
            <Card key={label} className={`p-2.5 bg-gradient-to-br ${color} border-border/30 text-center overflow-hidden`}>
              <Icon className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-base font-bold">{count}</p>
              <p className="text-[10px] text-muted-foreground truncate leading-tight">{label}</p>
            </Card>
          ))}
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {(["all", "mom", "baby", "partner", "documents"] as const).map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className="whitespace-nowrap text-xs h-8 px-2.5 shrink-0"
            >
              {cat !== "all" && categoryIcons[cat]}
              <span className="ms-1">{categoryLabels[cat]}</span>
            </Button>
          ))}
        </div>

        {/* Items List */}
        <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => togglePacked(item.id)}
              className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center gap-2.5 ${
                item.packed 
                  ? "bg-primary/10 border-primary/30" 
                  : "bg-card hover:bg-muted"
              }`}
            >
              <Checkbox checked={item.packed} className="shrink-0" />
              <span className={`text-sm leading-snug break-words min-w-0 ${item.packed ? "line-through text-muted-foreground" : ""}`}>
                {(() => {
                  const key = item.nameKey || "";
                  if (!key) return "";
                  if (key.startsWith("toolsInternal.")) return t(key);
                  if (key.startsWith("hospitalBag.")) return t(`toolsInternal.${key}`);
                  return key;
                })()}
              </span>
              {item.priority === "essential" && (
                <span className="ms-auto text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded shrink-0 leading-none">
                  {t('toolsInternal.hospitalBag.essential')}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Add Custom Item */}
        <div className="flex gap-2">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder={t('toolsInternal.hospitalBag.addCustomItem')}
            onKeyPress={(e) => e.key === "Enter" && addItem()}
          />
          <Button onClick={addItem} size="icon">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={getPersonalizedList}
            disabled={isLoading}
            className="bg-gradient-to-r from-teal-500 to-cyan-600 text-[12px] sm:text-[13px] h-9 px-2"
          >
            <Brain className="w-3.5 h-3.5 me-1.5 shrink-0" />
            <span className="truncate">{isLoading ? t('toolsInternal.hospitalBag.generating') : t('toolsInternal.hospitalBag.getAIList')}</span>
          </Button>

          <Button
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            variant="outline"
            className="border-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/30 text-[12px] sm:text-[13px] h-9 px-2"
          >
            {isExportingPDF ? <Loader2 className="w-3.5 h-3.5 me-1.5 shrink-0 animate-spin" /> : <FileDown className="w-3.5 h-3.5 me-1.5 shrink-0" />}
            <span className="truncate">{t('toolsInternal.hospitalBag.exportPDF')}</span>
          </Button>
        </div>

        {/* Share & Reset Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleShareWhatsApp}
            variant="outline"
            className="border-green-300 hover:bg-green-50 dark:hover:bg-green-950/30 text-green-700 dark:text-green-400 text-[12px] sm:text-[13px] h-9 px-2"
          >
            <Share2 className="w-3.5 h-3.5 me-1.5 shrink-0" />
            <span className="truncate">{t('toolsInternal.hospitalBag.shareWhatsApp')}</span>
          </Button>

          <Button
            onClick={resetList}
            variant="outline"
            className="border-destructive/50 hover:bg-destructive/10 text-destructive text-[12px] sm:text-[13px] h-9 px-2"
          >
            <RotateCcw className="w-3.5 h-3.5 me-1.5 shrink-0" />
            <span className="truncate">{t('toolsInternal.hospitalBag.resetList')}</span>
          </Button>
        </div>

        {response && (
          <Card className="p-4 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30">
            <MarkdownRenderer content={response} isLoading={isLoading} />
          </Card>
        )}

        {/* Educational Videos */}
        <VideoLibrary
          videosByLang={hospitalBagVideosByLang(t)}
          title={t('toolsInternal.hospitalBag.hospitalBagVideos')}
          subtitle={t('toolsInternal.hospitalBag.hospitalBagVideosSubtitle')}
          accentColor="blue"
        />
      </div>
    </ToolFrame>
  );
};

export default AIHospitalBag;
