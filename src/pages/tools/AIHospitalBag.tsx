import { useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { Briefcase, Sparkles, Baby, User, Heart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ToolFrame } from "@/components/ToolFrame";
import MedicalDisclaimer from "@/components/compliance/MedicalDisclaimer";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { useSettings } from "@/hooks/useSettings";
import { safeParseLocalStorage, safeSaveToLocalStorage } from "@/lib/safeStorage";
import { VideoLibrary, Video } from "@/components/VideoLibrary";

const hospitalBagVideos: Video[] = [
  { id: "1", title: "Hospital Bag Checklist", description: "Midwife advice on what to pack", youtubeId: "NTulfAOzbp8", duration: "8:00", category: "Essentials" },
  { id: "2", title: "Essential Hospital Bag Items", description: "Must-have items for labor and delivery", youtubeId: "oUxVPhwFuMM", duration: "12:30", category: "Essentials" },
  { id: "3", title: "Hospital Bag Tips", description: "Nurse-approved essentials you'll actually use", youtubeId: "6YdwII4BO0g", duration: "10:00", category: "Tips" },
  { id: "4", title: "What to Pack for Baby", description: "Newborn essentials for hospital stay", youtubeId: "hpgjwK_oQe0", duration: "18:00", category: "Baby" },
];

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
  
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [items, setItems] = useState<BagItem[]>(() => {
    return safeParseLocalStorage<BagItem[]>("hospital-bag-items", defaultItems);
  });
  const [newItem, setNewItem] = useState("");
  const [response, setResponse] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "mom" | "baby" | "partner" | "documents">("all");

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
      <div className="space-y-6">
        {/* Progress Card */}
        <Card className="p-4 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border-teal-200">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">{t('toolsInternal.hospitalBag.progress')}</span>
            <span className="text-2xl font-bold text-primary">{progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-teal-500 to-cyan-500 h-3 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {t('toolsInternal.hospitalBag.itemsPacked', { packed: packedCount, total: items.length })}
          </p>
        </Card>

        {/* Hospital Bag Image */}
        <img
          src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=300&fit=crop"
          alt="Hospital bag essentials"
          className="w-full rounded-xl"
        />

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(["all", "mom", "baby", "partner", "documents"] as const).map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className="whitespace-nowrap"
            >
              {cat !== "all" && categoryIcons[cat]}
              <span className="ms-1">{categoryLabels[cat]}</span>
            </Button>
          ))}
        </div>

        {/* Items List */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => togglePacked(item.id)}
              className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 ${
                item.packed 
                  ? "bg-primary/10 border-primary/30" 
                  : "bg-card hover:bg-muted"
              }`}
            >
              <Checkbox checked={item.packed} />
              <span className={item.packed ? "line-through text-muted-foreground" : ""}>
                {item.nameKey.startsWith('toolsInternal.') ? t(item.nameKey) : item.nameKey}
              </span>
              {item.priority === "essential" && (
                <span className="ms-auto text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded shrink-0">
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

        {/* AI Suggestions */}
        <Button
          onClick={getPersonalizedList}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-teal-500 to-cyan-600"
          size="lg"
        >
          <Sparkles className="w-4 h-4 me-2" />
          {isLoading ? t('toolsInternal.hospitalBag.generating') : t('toolsInternal.hospitalBag.getAIList')}
        </Button>

        {response && (
          <Card className="p-4 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30">
            <MarkdownRenderer content={response} isLoading={isLoading} />
          </Card>
        )}

        {/* Educational Videos */}
        <VideoLibrary
          videos={hospitalBagVideos}
          title={t('toolsInternal.hospitalBag.hospitalBagVideos')}
          subtitle={t('toolsInternal.hospitalBag.hospitalBagVideosSubtitle')}
          accentColor="blue"
        />
      </div>
    </ToolFrame>
  );
};

export default AIHospitalBag;
