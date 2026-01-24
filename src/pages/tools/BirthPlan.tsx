import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ToolFrame } from "@/components/ToolFrame";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Download, Save, Baby, Heart, Sparkles, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAnalytics } from "@/hooks/useAnalytics";

interface BirthPlanData {
  laborPreferences: {
    environment: string;
    mobility: string[];
    painRelief: string;
    monitoring: string;
  };
  deliveryPreferences: {
    position: string;
    episiotomy: string;
    cordClamping: string;
    skinToSkin: boolean;
  };
  babyPreferences: {
    feeding: string;
    rooming: string;
    circumcision: string;
    vaccinations: boolean;
  };
  emergencyPreferences: {
    csection: string;
    companion: string;
  };
  additionalNotes: string;
}

const STORAGE_KEY = "birth-plan-data";

const defaultPlan: BirthPlanData = {
  laborPreferences: {
    environment: "",
    mobility: [],
    painRelief: "",
    monitoring: "",
  },
  deliveryPreferences: {
    position: "",
    episiotomy: "",
    cordClamping: "",
    skinToSkin: true,
  },
  babyPreferences: {
    feeding: "",
    rooming: "",
    circumcision: "",
    vaccinations: true,
  },
  emergencyPreferences: {
    csection: "",
    companion: "",
  },
  additionalNotes: "",
};

const mapString = (value: unknown, map: Record<string, string>): string => {
  if (typeof value !== "string") return "";
  return map[value] ?? value;
};

// Backward compatibility: migrate older Arabic values stored in localStorage.
const normalizeBirthPlan = (raw: any): BirthPlanData => {
  const environmentMap: Record<string, string> = {
    "إضاءة خافتة": "Dim lighting",
    "موسيقى هادئة": "Calm music",
    "صمت تام": "Complete silence",
    "طبيعية": "No preference",
  };

  const mobilityMap: Record<string, string> = {
    "المشي": "Walking",
    "الكرة": "Birth ball",
    "الماء الدافئ": "Warm shower/water",
    "تغيير الوضعيات": "Changing positions",
  };

  const positionMap: Record<string, string> = {
    "مستلقية": "Lying down",
    "نصف جالسة": "Semi-sitting",
    "جانبية": "Side-lying",
    "رباعية": "Hands and knees",
  };

  const safeRaw = typeof raw === "object" && raw ? raw : {};

  const mobilityRaw = safeRaw?.laborPreferences?.mobility;
  const normalizedMobility = Array.isArray(mobilityRaw)
    ? mobilityRaw.map((m) => mapString(m, mobilityMap)).filter(Boolean)
    : [];

  return {
    laborPreferences: {
      environment: mapString(safeRaw?.laborPreferences?.environment, environmentMap),
      mobility: normalizedMobility,
      painRelief: typeof safeRaw?.laborPreferences?.painRelief === "string" ? safeRaw.laborPreferences.painRelief : "",
      monitoring: typeof safeRaw?.laborPreferences?.monitoring === "string" ? safeRaw.laborPreferences.monitoring : "",
    },
    deliveryPreferences: {
      position: mapString(safeRaw?.deliveryPreferences?.position, positionMap),
      episiotomy: typeof safeRaw?.deliveryPreferences?.episiotomy === "string" ? safeRaw.deliveryPreferences.episiotomy : "",
      cordClamping: typeof safeRaw?.deliveryPreferences?.cordClamping === "string" ? safeRaw.deliveryPreferences.cordClamping : "",
      skinToSkin: typeof safeRaw?.deliveryPreferences?.skinToSkin === "boolean" ? safeRaw.deliveryPreferences.skinToSkin : true,
    },
    babyPreferences: {
      feeding: typeof safeRaw?.babyPreferences?.feeding === "string" ? safeRaw.babyPreferences.feeding : "",
      rooming: typeof safeRaw?.babyPreferences?.rooming === "string" ? safeRaw.babyPreferences.rooming : "",
      circumcision: typeof safeRaw?.babyPreferences?.circumcision === "string" ? safeRaw.babyPreferences.circumcision : "",
      vaccinations: typeof safeRaw?.babyPreferences?.vaccinations === "boolean" ? safeRaw.babyPreferences.vaccinations : true,
    },
    emergencyPreferences: {
      csection: typeof safeRaw?.emergencyPreferences?.csection === "string" ? safeRaw.emergencyPreferences.csection : "",
      companion: typeof safeRaw?.emergencyPreferences?.companion === "string" ? safeRaw.emergencyPreferences.companion : "",
    },
    additionalNotes: typeof safeRaw?.additionalNotes === "string" ? safeRaw.additionalNotes : "",
  };
};

const BirthPlan = () => {
  const { t } = useTranslation();
  const { trackAction } = useAnalytics("birth-plan");
  
  const [plan, setPlan] = useState<BirthPlanData>(defaultPlan);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPlan(normalizeBirthPlan(parsed));
      }
    } catch {
      // ignore invalid localStorage
    }
  }, []);

  const savePlan = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    trackAction("plan_saved");
  };

  const updatePlan = (section: keyof BirthPlanData, field: string, value: any) => {
    setPlan(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value,
      }
    }));
  };

  const toggleMobility = (option: string) => {
    const current = plan.laborPreferences.mobility;
    const newMobility = current.includes(option)
      ? current.filter(m => m !== option)
      : [...current, option];
    updatePlan('laborPreferences', 'mobility', newMobility);
  };

  const exportPlan = () => {
    const content = `
Birth Plan
==========

Labor preferences:
- Room environment: ${plan.laborPreferences.environment || 'Not specified'}
- Mobility: ${plan.laborPreferences.mobility.join(', ') || 'Not specified'}
- Pain relief: ${plan.laborPreferences.painRelief || 'Not specified'}
- Monitoring: ${plan.laborPreferences.monitoring || 'Not specified'}

Delivery preferences:
- Preferred position: ${plan.deliveryPreferences.position || 'Not specified'}
- Episiotomy: ${plan.deliveryPreferences.episiotomy || 'Not specified'}
- Cord clamping: ${plan.deliveryPreferences.cordClamping || 'Not specified'}
- Skin-to-skin: ${plan.deliveryPreferences.skinToSkin ? 'Yes' : 'No'}

Baby care preferences:
- Feeding: ${plan.babyPreferences.feeding || 'Not specified'}
- Rooming: ${plan.babyPreferences.rooming || 'Not specified'}
- Circumcision: ${plan.babyPreferences.circumcision || 'Not specified'}
- Vaccinations: ${plan.babyPreferences.vaccinations ? 'Yes' : 'No'}

Emergency preferences:
- C-section: ${plan.emergencyPreferences.csection || 'Not specified'}
- Support person: ${plan.emergencyPreferences.companion || 'Not specified'}

Additional notes:
${plan.additionalNotes || 'None'}
    `;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'birth-plan.txt';
    a.click();
    trackAction("plan_exported");
  };

  return (
    <ToolFrame
      title={t('tools.birthPlan.title')}
      subtitle={t('tools.birthPlan.description')}
      icon={FileText}
      mood="calm"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={exportPlan}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={savePlan} className={saved ? 'bg-green-500' : ''}>
            {saved ? <Sparkles className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {saved ? 'Saved!' : 'Save'}
          </Button>
        </div>

        {/* Labor Preferences */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-blue-500" />
                Labor Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <Label className="font-medium">Room environment</Label>
                <RadioGroup
                  value={plan.laborPreferences.environment}
                  onValueChange={(v) => updatePlan('laborPreferences', 'environment', v)}
                  className="mt-2 grid grid-cols-2 gap-2"
                >
                  {["Dim lighting", "Calm music", "Complete silence", "No preference"].map(option => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`env-${option}`} />
                      <Label htmlFor={`env-${option}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label className="font-medium">Mobility during labor</Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {["Walking", "Birth ball", "Warm shower/water", "Changing positions"].map(option => (
                    <div key={option} className="flex items-center gap-2">
                      <Checkbox
                        checked={plan.laborPreferences.mobility.includes(option)}
                        onCheckedChange={() => toggleMobility(option)}
                      />
                      <Label>{option}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="font-medium">Pain relief</Label>
                <RadioGroup
                  value={plan.laborPreferences.painRelief}
                  onValueChange={(v) => updatePlan('laborPreferences', 'painRelief', v)}
                  className="mt-2 space-y-2"
                >
                  {[
                    { value: "natural", label: "Natural / no medication" },
                    { value: "epidural", label: "Epidural" },
                    { value: "gas", label: "Nitrous oxide" },
                    { value: "flexible", label: "Decide later" },
                  ].map(option => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`pain-${option.value}`} />
                      <Label htmlFor={`pain-${option.value}`}>{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Delivery Preferences */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50">
              <CardTitle className="flex items-center gap-2">
                <Baby className="h-5 w-5 text-pink-500" />
                Delivery Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <Label className="font-medium">Preferred birth position</Label>
                <RadioGroup
                  value={plan.deliveryPreferences.position}
                  onValueChange={(v) => updatePlan('deliveryPreferences', 'position', v)}
                  className="mt-2 grid grid-cols-2 gap-2"
                >
                  {["Lying down", "Semi-sitting", "Side-lying", "Hands and knees"].map(option => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`pos-${option}`} />
                      <Label htmlFor={`pos-${option}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label className="font-medium">Cord clamping</Label>
                <RadioGroup
                  value={plan.deliveryPreferences.cordClamping}
                  onValueChange={(v) => updatePlan('deliveryPreferences', 'cordClamping', v)}
                  className="mt-2 space-y-2"
                >
                  {[
                    { value: "delayed", label: "Delayed clamping (1–3 minutes)" },
                    { value: "immediate", label: "Immediate clamping" },
                    { value: "partner", label: "Partner cuts the cord" },
                  ].map(option => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`cord-${option.value}`} />
                      <Label htmlFor={`cord-${option.value}`}>{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={plan.deliveryPreferences.skinToSkin}
                  onCheckedChange={(v) => updatePlan('deliveryPreferences', 'skinToSkin', v)}
                />
                <Label>Skin-to-skin contact immediately after birth</Label>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Baby Preferences */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Baby Care Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <Label className="font-medium">Feeding</Label>
                <RadioGroup
                  value={plan.babyPreferences.feeding}
                  onValueChange={(v) => updatePlan('babyPreferences', 'feeding', v)}
                  className="mt-2 space-y-2"
                >
                  {[
                    { value: "breast", label: "Exclusive breastfeeding" },
                    { value: "formula", label: "Formula feeding" },
                    { value: "mixed", label: "Mixed feeding" },
                  ].map(option => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`feed-${option.value}`} />
                      <Label htmlFor={`feed-${option.value}`}>{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label className="font-medium">Rooming</Label>
                <RadioGroup
                  value={plan.babyPreferences.rooming}
                  onValueChange={(v) => updatePlan('babyPreferences', 'rooming', v)}
                  className="mt-2 space-y-2"
                >
                  {[
                    { value: "rooming-in", label: "Rooming-in (24 hours)" },
                    { value: "nursery-night", label: "Nursery at night only" },
                    { value: "nursery", label: "Nursery" },
                  ].map(option => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`room-${option.value}`} />
                      <Label htmlFor={`room-${option.value}`}>{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={plan.babyPreferences.vaccinations}
                  onCheckedChange={(v) => updatePlan('babyPreferences', 'vaccinations', v as boolean)}
                />
                <Label>Agree to routine newborn vaccinations</Label>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={plan.additionalNotes}
              onChange={(e) => setPlan(prev => ({ ...prev, additionalNotes: e.target.value }))}
              placeholder="Any extra preferences or requests..."
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="pt-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">
                <strong>Reminder:</strong> This is a draft plan and may change depending on medical circumstances. Discuss it with your healthcare provider and birthing facility.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
};

export default BirthPlan;
