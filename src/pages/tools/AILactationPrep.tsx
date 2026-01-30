import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Heart, Sparkles, Baby, Clock, ShoppingBag, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ToolFrame } from "@/components/ToolFrame";
import MedicalDisclaimer from "@/components/compliance/MedicalDisclaimer";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { useSettings } from "@/hooks/useSettings";

const feedingGoals = [
  { id: "exclusive", label: "Exclusive breastfeeding", icon: "🤱" },
  { id: "combo", label: "Combination (breast + formula)", icon: "🍼" },
  { id: "pumping", label: "Exclusive pumping", icon: "⚙️" },
  { id: "unsure", label: "Still deciding", icon: "🤔" },
];

const concerns = [
  { id: "latch", label: "Latch difficulties" },
  { id: "supply", label: "Milk supply worries" },
  { id: "pain", label: "Pain concerns" },
  { id: "returning-work", label: "Returning to work" },
  { id: "partner-feeding", label: "Partner involvement" },
  { id: "public", label: "Feeding in public" },
  { id: "medical", label: "Previous breast surgery" },
  { id: "multiples", label: "Having twins/multiples" },
];

const essentialSupplies = [
  { name: "Nursing bras (3-4)", essential: true },
  { name: "Nursing pads", essential: true },
  { name: "Nipple cream (lanolin)", essential: true },
  { name: "Breast pump", essential: false },
  { name: "Storage bags", essential: false },
  { name: "Nursing pillow", essential: false },
  { name: "Nursing cover", essential: false },
  { name: "Haakaa/manual pump", essential: false },
];

const AILactationPrep = () => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { streamChat, isLoading } = usePregnancyAI();
  
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [feedingGoal, setFeedingGoal] = useState("");
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [firstTimeMom, setFirstTimeMom] = useState(true);
  const [returningToWork, setReturningToWork] = useState("");
  const [response, setResponse] = useState("");

  const toggleConcern = (id: string) => {
    setSelectedConcerns(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const getLactationPlan = async () => {
    const concernLabels = selectedConcerns.map(id => 
      concerns.find(c => c.id === id)?.label
    ).filter(Boolean);
    const goal = feedingGoals.find(g => g.id === feedingGoal);

    const prompt = `As a certified lactation consultant (IBCLC), create a breastfeeding preparation guide:

**Pregnancy Week:** ${settings.pregnancyWeek || 32}
**Feeding Goal:** ${goal?.label || "Not specified"}
**First-Time Mom:** ${firstTimeMom ? "Yes" : "No"}
**Concerns:** ${concernLabels.join(", ") || "None specified"}
**Returning to Work:** ${returningToWork || "Not specified"}

Provide comprehensive breastfeeding preparation:
1. **Before Birth Preparation** - Nipple care, what to learn now
2. **First Hour After Birth** - Skin-to-skin, first latch
3. **First Week Challenges** - What to expect, troubleshooting
4. **Proper Latch Technique** - Step-by-step guidance
5. **Feeding Positions** - Best positions with diagrams description
6. **Supply Building** - How to establish and maintain supply
7. **Common Problems & Solutions** - Engorgement, cracked nipples, etc.
8. **Pumping Guide** - When to start, how to store milk
9. **Partner Support** - How they can help
10. **When to Get Help** - Signs to see a lactation consultant

${returningToWork === "yes" ? "Include detailed back-to-work pumping plan and rights at work." : ""}

Be encouraging and realistic - breastfeeding has a learning curve!`;

    setResponse("");
    await streamChat({
      type: "pregnancy-assistant",
      messages: [{ role: "user", content: prompt }],
      context: { week: Number(settings.pregnancyWeek) || 32 },
      onDelta: (text) => setResponse((prev) => prev + text),
      onDone: () => {},
    });
  };

  if (!disclaimerAccepted) {
    return (
      <MedicalDisclaimer
        onAccept={() => setDisclaimerAccepted(true)}
        toolName="AI Lactation Preparation"
      />
    );
  }

  return (
    <ToolFrame
      title="Lactation Prep"
      customIcon="breastfeeding"
      mood="nurturing"
    >
      <div className="space-y-6">
        {/* Feeding Goal */}
        <div className="space-y-3">
          <Label>Your Feeding Goal</Label>
          <div className="grid grid-cols-2 gap-2">
            {feedingGoals.map((goal) => (
              <div
                key={goal.id}
                onClick={() => setFeedingGoal(goal.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all text-center ${
                  feedingGoal === goal.id
                    ? "bg-primary/10 border-primary"
                    : "bg-card hover:bg-muted"
                }`}
              >
                <div className="text-2xl mb-1">{goal.icon}</div>
                <div className="text-sm">{goal.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* First Time Mom */}
        <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
          <Checkbox 
            id="first-time" 
            checked={firstTimeMom} 
            onCheckedChange={(checked) => setFirstTimeMom(checked as boolean)} 
          />
          <Label htmlFor="first-time" className="cursor-pointer">
            This is my first time breastfeeding
          </Label>
        </div>

        {/* Returning to Work */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Returning to Work
          </Label>
          <Select value={returningToWork} onValueChange={setReturningToWork}>
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no">Not returning / Stay-at-home</SelectItem>
              <SelectItem value="12weeks">Within 12 weeks</SelectItem>
              <SelectItem value="6months">After 6 months</SelectItem>
              <SelectItem value="year">After 1 year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Concerns */}
        <div className="space-y-3">
          <Label>Any Concerns?</Label>
          <div className="grid grid-cols-2 gap-2">
            {concerns.map((concern) => (
              <div
                key={concern.id}
                onClick={() => toggleConcern(concern.id)}
                className={`p-2 rounded-lg border cursor-pointer transition-all flex items-center gap-2 ${
                  selectedConcerns.includes(concern.id)
                    ? "bg-primary/10 border-primary"
                    : "bg-card hover:bg-muted"
                }`}
              >
                <Checkbox checked={selectedConcerns.includes(concern.id)} />
                <span className="text-sm">{concern.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Essential Supplies */}
        <Card className="p-4 bg-muted/30">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-primary" />
            Breastfeeding Supplies Checklist
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {essentialSupplies.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className={item.essential ? "text-primary" : "text-muted-foreground"}>
                  {item.essential ? "★" : "○"}
                </span>
                {item.name}
              </div>
            ))}
          </div>
        </Card>

        {/* Get Plan */}
        <Button
          onClick={getLactationPlan}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {isLoading ? "Creating Guide..." : "Get AI Lactation Guide"}
        </Button>

        {/* AI Response */}
        {response && (
          <Card className="p-4 bg-muted/50">
            <MarkdownRenderer content={response} isLoading={isLoading} />
          </Card>
        )}

        {/* Support Note */}
        <Card className="p-4 bg-muted/30 border-primary/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary flex-shrink-0" />
            <div>
              <h4 className="font-medium">Need Support?</h4>
              <p className="text-sm text-muted-foreground mt-1">
                If you're struggling with breastfeeding, reach out to a lactation consultant (IBCLC). 
                Many hospitals offer free support. Fed is best - whatever works for you and baby!
              </p>
            </div>
          </div>
        </Card>

        {/* Educational Video - At the end */}
        <Card className="p-4 border-dashed">
          <h3 className="font-medium mb-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Baby className="w-4 h-4" />
            Breastfeeding Tips 101: Latch, Positions & More
          </h3>
          <div className="aspect-video rounded-lg overflow-hidden bg-muted">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/-Ds3QW3CWJ0"
              title="Breastfeeding Tips 101 for New Moms: Latch, Positions, Pumping"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            نصائح شاملة للأمهات الجدد: الرضاعة، الوضعيات، والشفط
          </p>
        </Card>

        {/* Second Educational Video */}
        <Card className="p-4 border-dashed">
          <h3 className="font-medium mb-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Baby className="w-4 h-4" />
            Common Breastfeeding Positions
          </h3>
          <div className="aspect-video rounded-lg overflow-hidden bg-muted">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/or4OnMxihUg"
              title="Breastfeeding Tips: Common Breastfeeding Positions"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            ⚠️ محتوى تعليمي فقط - استشيري أخصائية الرضاعة للدعم الشخصي
          </p>
        </Card>
      </div>
    </ToolFrame>
  );
};

export default AILactationPrep;
