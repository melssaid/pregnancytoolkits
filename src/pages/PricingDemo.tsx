import { useLanguage } from "@/contexts/LanguageContext";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Sparkles, Star, Zap } from "lucide-react";
import { toast } from "sonner";

const plans = {
  trial: { days: 3 },
  monthly: { price: "$2.99", period: "/mo" },
  yearly: { price: "$19.99", period: "/yr", save: "44%" },
};

const features = [
  "AI Pregnancy Assistant",
  "Smart Meal Plans",
  "Kick Counter & Tracking",
  "Weekly Summary Reports",
  "Birth Plan Generator",
  "Unlimited AI Analyses",
];

const handleSelect = (model: string, plan: string) => {
  toast.success(`Selected: Model ${model} — ${plan}`);
};

// ─── MODEL A: Elegant Compact Cards ───────────────────────────
function ModelA() {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <Badge className="bg-primary/10 text-primary border-0 text-xs">Model A</Badge>
        <h3 className="text-base font-bold text-foreground">Elegant Cards</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Monthly */}
        <Card className="border-border/50 hover:border-primary/30 transition-colors">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs text-muted-foreground">Monthly</CardTitle>
            <div className="flex items-baseline gap-0.5">
              <span className="text-xl font-bold text-foreground">{plans.monthly.price}</span>
              <span className="text-[10px] text-muted-foreground">{plans.monthly.period}</span>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <Button size="sm" variant="outline" className="w-full text-xs h-8" onClick={() => handleSelect("A", "monthly")}>
              Choose
            </Button>
          </CardContent>
        </Card>

        {/* Yearly */}
        <Card className="border-primary/40 bg-primary/[0.03] relative">
          <div className="absolute -top-2 right-2">
            <Badge className="text-[9px] px-1.5 py-0 bg-accent text-accent-foreground border-0">
              Save {plans.yearly.save}
            </Badge>
          </div>
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs text-muted-foreground">Yearly</CardTitle>
            <div className="flex items-baseline gap-0.5">
              <span className="text-xl font-bold text-primary">{plans.yearly.price}</span>
              <span className="text-[10px] text-muted-foreground">{plans.yearly.period}</span>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <Button size="sm" className="w-full text-xs h-8" onClick={() => handleSelect("A", "yearly")}>
              Best Value
            </Button>
          </CardContent>
        </Card>
      </div>

      <p className="text-center text-[10px] text-muted-foreground">
        {plans.trial.days}-day free trial • Cancel anytime
      </p>

      <ul className="space-y-1.5">
        {features.slice(0, 4).map((f) => (
          <li key={f} className="flex items-center gap-1.5 text-[11px] text-foreground">
            <Check className="w-3 h-3 text-accent shrink-0" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── MODEL B: Glassmorphism with Bold CTA ─────────────────────
function ModelB() {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <Badge className="bg-primary/10 text-primary border-0 text-xs">Model B</Badge>
        <h3 className="text-base font-bold text-foreground">Glassmorphism</h3>
      </div>

      <div className="rounded-2xl p-4 space-y-4"
        style={{
          background: "linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--accent) / 0.08))",
          backdropFilter: "blur(12px)",
          border: "1px solid hsl(var(--primary) / 0.15)",
        }}
      >
        <div className="flex items-center justify-center gap-1.5">
          <Crown className="w-4 h-4 text-primary" />
          <span className="font-bold text-sm text-foreground">Premium</span>
        </div>

        <div className="text-center">
          <div className="flex items-baseline justify-center gap-0.5">
            <span className="text-3xl font-bold text-foreground">{plans.yearly.price}</span>
            <span className="text-xs text-muted-foreground">{plans.yearly.period}</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            or {plans.monthly.price}/month
          </p>
        </div>

        <ul className="space-y-1.5">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-1.5 text-[11px] text-foreground">
              <Sparkles className="w-3 h-3 text-primary shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        <Button className="w-full h-10 text-sm font-semibold rounded-xl" onClick={() => handleSelect("B", "yearly")}>
          <Zap className="w-4 h-4" />
          Start Free Trial
        </Button>

        <p className="text-center text-[10px] text-muted-foreground">
          {plans.trial.days} days free • Then {plans.yearly.price}/year
        </p>
      </div>
    </div>
  );
}

// ─── MODEL C: Gradient Header with Toggle ─────────────────────
function ModelC() {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <Badge className="bg-primary/10 text-primary border-0 text-xs">Model C</Badge>
        <h3 className="text-base font-bold text-foreground">Gradient Header</h3>
      </div>

      <Card className="overflow-hidden border-border/50">
        {/* Gradient header */}
        <div className="p-4 text-center"
          style={{
            background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))",
          }}
        >
          <Star className="w-5 h-5 text-primary-foreground mx-auto mb-1" />
          <h4 className="text-sm font-bold text-primary-foreground">Go Premium</h4>
          <p className="text-[10px] text-primary-foreground/80 mt-0.5">
            Unlock all {features.length} tools
          </p>
        </div>

        <CardContent className="p-4 space-y-3">
          <ul className="space-y-1.5">
            {features.slice(0, 5).map((f) => (
              <li key={f} className="flex items-center gap-1.5 text-[11px] text-foreground">
                <Check className="w-3 h-3 text-accent shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <div className="space-y-2">
            <Button className="w-full h-9 text-xs" onClick={() => handleSelect("C", "yearly")}>
              Yearly — {plans.yearly.price}
              <Badge className="ms-1 text-[8px] px-1 py-0 bg-primary-foreground/20 text-primary-foreground border-0">
                -{plans.yearly.save}
              </Badge>
            </Button>
            <Button variant="outline" className="w-full h-9 text-xs" onClick={() => handleSelect("C", "monthly")}>
              Monthly — {plans.monthly.price}
            </Button>
          </div>

          <p className="text-center text-[10px] text-muted-foreground">
            {plans.trial.days}-day free trial included
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────
export default function PricingDemo() {
  const { isRTL } = useLanguage();

  return (
    <div className="min-h-screen bg-background pb-24" dir={isRTL ? "rtl" : "ltr"}>
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="text-sm font-bold text-foreground">Pricing Models</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-8 max-w-lg mx-auto">
        <p className="text-xs text-center text-muted-foreground">
          Compare 3 design models — tap a button to select your preferred style
        </p>

        <ModelA />
        <div className="border-t border-border/30" />
        <ModelB />
        <div className="border-t border-border/30" />
        <ModelC />
      </div>
    </div>
  );
}
