import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Sparkles, Heart, Clock, Utensils, Wind, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { ToolFrame } from "@/components/ToolFrame";
import MedicalDisclaimer from "@/components/compliance/MedicalDisclaimer";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { useSettings } from "@/hooks/useSettings";

const nauseaTriggers = [
  { id: "morning", label: "Worst in morning", icon: "🌅" },
  { id: "evening", label: "Worst in evening", icon: "🌆" },
  { id: "all-day", label: "All day", icon: "☀️" },
  { id: "smells", label: "Strong smells", icon: "👃" },
  { id: "empty-stomach", label: "Empty stomach", icon: "🥣" },
  { id: "after-eating", label: "After eating", icon: "🍽️" },
  { id: "motion", label: "Motion/car rides", icon: "🚗" },
  { id: "cooking", label: "Cooking smells", icon: "🍳" },
];

const quickRemedies = [
  { icon: "🍋", name: "Lemon water", tip: "Sip slowly on waking" },
  { icon: "🫚", name: "Ginger", tip: "Tea, candies, or fresh" },
  { icon: "🧊", name: "Ice chips", tip: "Suck on ice when queasy" },
  { icon: "🍪", name: "Dry crackers", tip: "Keep by bedside" },
  { icon: "🌿", name: "Peppermint", tip: "Inhale or tea" },
  { icon: "🍌", name: "Banana", tip: "Easy on stomach" },
];

const AINauseaRelief = () => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { streamChat, isLoading } = usePregnancyAI();
  
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [severity, setSeverity] = useState([5]);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [vomiting, setVomiting] = useState(false);
  const [response, setResponse] = useState("");

  const toggleTrigger = (id: string) => {
    setTriggers(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const getReliefPlan = async () => {
    const triggerLabels = triggers.map(id => 
      nauseaTriggers.find(t => t.id === id)?.label
    ).filter(Boolean);

    const prompt = `As a pregnancy nausea specialist, provide relief strategies:

**Pregnancy Week:** ${settings.pregnancyWeek || 8}
**Severity (1-10):** ${severity[0]}
**Triggers:** ${triggerLabels.join(", ") || "Not specified"}
**Vomiting:** ${vomiting ? "Yes, experiencing vomiting" : "No vomiting, just nausea"}

Provide comprehensive nausea relief guidance:
1. **Immediate Relief** - What to do right now when feeling sick
2. **Dietary Changes** - Foods that help, foods to avoid
3. **Eating Schedule** - When and how to eat
4. **Natural Remedies** - Ginger, B6, acupressure points (P6)
5. **Lifestyle Adjustments** - Rest, triggers to avoid
6. **When to Call Doctor** - Warning signs of hyperemesis
7. **Weekly Outlook** - When nausea typically improves

${severity[0] >= 8 ? "⚠️ Note: Severity is high - include information about medical interventions and when hospitalization may be needed." : ""}

Be compassionate - morning sickness is exhausting!`;

    setResponse("");
    await streamChat({
      type: "pregnancy-assistant",
      messages: [{ role: "user", content: prompt }],
      context: { week: Number(settings.pregnancyWeek) || 8 },
      onDelta: (text) => setResponse((prev) => prev + text),
      onDone: () => {},
    });
  };

  if (!disclaimerAccepted) {
    return (
      <MedicalDisclaimer
        onAccept={() => setDisclaimerAccepted(true)}
        toolName="AI Nausea Relief Coach"
      />
    );
  }

  return (
    <ToolFrame
      title="Nausea Relief"
      icon={Heart}
      mood="calm"
    >
      <div className="space-y-6">
        {/* Quick Relief Card */}
        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200">
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <Wind className="w-4 h-4 text-green-600" />
            Quick Relief Remedies
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {quickRemedies.map((remedy) => (
              <div key={remedy.name} className="text-center p-2 bg-background/50 rounded-lg">
                <div className="text-2xl mb-1">{remedy.icon}</div>
                <div className="text-xs font-medium">{remedy.name}</div>
                <div className="text-[10px] text-muted-foreground">{remedy.tip}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Acupressure Video */}
        <Card className="p-4">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            P6 Acupressure Point for Nausea
          </h3>
          <div className="aspect-video rounded-lg overflow-hidden">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/lh6FdzbbS20"
              title="Stop Nausea Fast With Acupressure"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Press the P6 point (3 finger-widths below wrist) for 2-3 minutes
          </p>
        </Card>

        {/* Severity Slider */}
        <div className="space-y-3">
          <Label className="flex items-center justify-between">
            <span>Nausea Severity</span>
            <span className={`font-bold ${
              severity[0] <= 3 ? "text-green-600" : 
              severity[0] <= 6 ? "text-amber-600" : "text-red-600"
            }`}>
              {severity[0]}/10
            </span>
          </Label>
          <Slider
            value={severity}
            onValueChange={setSeverity}
            max={10}
            min={1}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Mild</span>
            <span>Moderate</span>
            <span>Severe</span>
          </div>
        </div>

        {/* Vomiting Checkbox */}
        <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
          <Checkbox 
            id="vomiting" 
            checked={vomiting} 
            onCheckedChange={(checked) => setVomiting(checked as boolean)} 
          />
          <Label htmlFor="vomiting" className="cursor-pointer">
            I'm experiencing vomiting, not just nausea
          </Label>
        </div>

        {/* Triggers */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-primary" />
            What triggers your nausea?
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {nauseaTriggers.map((trigger) => (
              <div
                key={trigger.id}
                onClick={() => toggleTrigger(trigger.id)}
                className={`p-2 rounded-lg border cursor-pointer transition-all flex items-center gap-2 ${
                  triggers.includes(trigger.id)
                    ? "bg-primary/10 border-primary"
                    : "bg-card hover:bg-muted"
                }`}
              >
                <Checkbox checked={triggers.includes(trigger.id)} />
                <span>{trigger.icon}</span>
                <span className="text-sm">{trigger.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Warning for severe cases */}
        {severity[0] >= 8 && (
          <Card className="p-4 bg-destructive/10 border-destructive/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-destructive">Severe Nausea Warning</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  If you can't keep any food/water down for 24 hours, see blood in vomit, 
                  or feel dizzy/faint, contact your healthcare provider immediately.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Get Relief Plan */}
        <Button
          onClick={getReliefPlan}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600"
          size="lg"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {isLoading ? "Creating Plan..." : "Get AI Relief Plan"}
        </Button>

        {/* AI Response */}
        {response && (
          <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
            <MarkdownRenderer content={response} isLoading={isLoading} />
          </Card>
        )}

        {/* Encouraging Note */}
        <Card className="p-4 bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground">
            💚 Remember: Morning sickness usually peaks around weeks 8-10 and 
            improves significantly by week 12-14. You've got this!
          </p>
        </Card>
      </div>
    </ToolFrame>
  );
};

export default AINauseaRelief;
