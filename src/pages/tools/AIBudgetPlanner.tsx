import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DollarSign, Sparkles, Calculator, ShoppingBag, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ToolFrame } from "@/components/ToolFrame";
import MedicalDisclaimer from "@/components/compliance/MedicalDisclaimer";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { useSettings } from "@/hooks/useSettings";

const expenseCategories = [
  { id: "prenatal", label: "Prenatal Care", icon: "🏥", typical: "$1,500-3,000" },
  { id: "delivery", label: "Delivery", icon: "👶", typical: "$5,000-11,000" },
  { id: "nursery", label: "Nursery Setup", icon: "🛏️", typical: "$1,000-3,000" },
  { id: "gear", label: "Baby Gear", icon: "🍼", typical: "$500-2,000" },
  { id: "clothes", label: "Baby Clothes", icon: "👕", typical: "$200-500" },
  { id: "diapers", label: "Diapers (1st year)", icon: "🧷", typical: "$800-1,200" },
  { id: "maternity", label: "Maternity Clothes", icon: "👗", typical: "$200-500" },
  { id: "classes", label: "Birthing Classes", icon: "📚", typical: "$100-400" },
];

const savingTips = [
  "Buy secondhand gear (strollers, cribs)",
  "Accept hand-me-downs from friends",
  "Use cloth diapers ($500+ savings)",
  "Breastfeed if possible (saves on formula)",
  "Register for baby shower gifts",
  "Buy gender-neutral for future babies",
];

const AIBudgetPlanner = () => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { streamChat, isLoading } = usePregnancyAI();
  
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [monthlySavings, setMonthlySavings] = useState("");
  const [insurance, setInsurance] = useState("employer");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [firstBaby, setFirstBaby] = useState(true);
  const [response, setResponse] = useState("");

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const getBudgetPlan = async () => {
    const categoryLabels = selectedCategories.map(id => 
      expenseCategories.find(c => c.id === id)?.label
    ).filter(Boolean);

    const prompt = `As a family financial planner specializing in pregnancy budgeting, create a comprehensive plan:

**Pregnancy Week:** ${settings.pregnancyWeek || 20}
**Monthly Income:** $${monthlyIncome || "Not specified"}
**Current Monthly Savings:** $${monthlySavings || "Not specified"}
**Insurance Type:** ${insurance === "employer" ? "Employer-provided" : insurance === "marketplace" ? "Marketplace" : insurance === "medicaid" ? "Medicaid" : "No insurance"}
**First Baby:** ${firstBaby ? "Yes" : "No - have other children"}
**Priority Categories:** ${categoryLabels.join(", ") || "All categories"}

Provide:
1. **Total Estimated Costs** - Breakdown by category with realistic ranges
2. **Month-by-Month Savings Plan** - How much to save before due date
3. **Smart Shopping Timeline** - When to buy what (nursery, gear, etc.)
4. **Insurance Navigation** - Maximizing coverage, understanding costs
5. **Money-Saving Strategies** - Specific actionable tips
6. **Hidden Costs to Prepare For** - Often overlooked expenses
7. **First Year Budget** - Post-birth monthly expenses
8. **Leave Planning** - Financial prep for maternity/paternity leave

Be realistic and practical. Include both budget-friendly and splurge options.`;

    setResponse("");
    await streamChat({
      type: "pregnancy-assistant",
      messages: [{ role: "user", content: prompt }],
      context: { week: Number(settings.pregnancyWeek) || 20 },
      onDelta: (text) => setResponse((prev) => prev + text),
      onDone: () => {},
    });
  };

  if (!disclaimerAccepted) {
    return (
      <MedicalDisclaimer
        onAccept={() => setDisclaimerAccepted(true)}
        toolName="AI Pregnancy Budget Planner"
      />
    );
  }

  return (
    <ToolFrame
      title="Budget Planner"
      icon={DollarSign}
      mood="empowering"
    >
      <div className="space-y-6">
        {/* Cost Overview */}
        <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-200">
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <Calculator className="w-4 h-4 text-emerald-600" />
            Average First-Year Baby Costs
          </h3>
          <div className="text-3xl font-bold text-emerald-600 mb-2">
            $12,000 - $15,000
          </div>
          <p className="text-sm text-muted-foreground">
            Includes delivery, gear, diapers, and basics (excluding childcare)
          </p>
        </Card>

        {/* Income & Savings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Monthly Income ($)</Label>
            <Input
              type="number"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              placeholder="5000"
            />
          </div>
          <div className="space-y-2">
            <Label>Current Savings ($)</Label>
            <Input
              type="number"
              value={monthlySavings}
              onChange={(e) => setMonthlySavings(e.target.value)}
              placeholder="500"
            />
          </div>
        </div>

        {/* Insurance */}
        <div className="space-y-2">
          <Label>Insurance Type</Label>
          <Select value={insurance} onValueChange={setInsurance}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employer">🏢 Employer-provided</SelectItem>
              <SelectItem value="marketplace">🛒 Marketplace/ACA</SelectItem>
              <SelectItem value="medicaid">🏥 Medicaid</SelectItem>
              <SelectItem value="none">❌ No insurance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* First Baby */}
        <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
          <Checkbox 
            id="first-baby" 
            checked={firstBaby} 
            onCheckedChange={(checked) => setFirstBaby(checked as boolean)} 
          />
          <Label htmlFor="first-baby" className="cursor-pointer">
            This is my first baby (need to buy everything new)
          </Label>
        </div>

        {/* Expense Categories */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-primary" />
            Priority Expense Categories
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {expenseCategories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedCategories.includes(cat.id)
                    ? "bg-primary/10 border-primary"
                    : "bg-card hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-sm font-medium">{cat.label}</span>
                </div>
                <div className="text-xs text-muted-foreground">{cat.typical}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Saving Tips */}
        <Card className="p-4 bg-muted/50">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" />
            💡 Money-Saving Tips
          </h4>
          <ul className="space-y-1 text-sm">
            {savingTips.map((tip, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                {tip}
              </li>
            ))}
          </ul>
        </Card>

        {/* Get Budget Plan */}
        <Button
          onClick={getBudgetPlan}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-emerald-500 to-green-600"
          size="lg"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {isLoading ? "Creating Plan..." : "Get AI Budget Plan"}
        </Button>

        {/* AI Response */}
        {response && (
          <Card className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30">
            <MarkdownRenderer content={response} isLoading={isLoading} />
          </Card>
        )}
      </div>
    </ToolFrame>
  );
};

export default AIBudgetPlanner;
