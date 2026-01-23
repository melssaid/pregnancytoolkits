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

const BirthPlan = () => {
  const { t } = useTranslation();
  const { trackAction } = useAnalytics("birth-plan");
  
  const [plan, setPlan] = useState<BirthPlanData>(defaultPlan);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setPlan(JSON.parse(saved));
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
خطة الولادة
============

تفضيلات المخاض:
- بيئة الغرفة: ${plan.laborPreferences.environment || 'غير محدد'}
- الحركة: ${plan.laborPreferences.mobility.join(', ') || 'غير محدد'}
- تخفيف الألم: ${plan.laborPreferences.painRelief || 'غير محدد'}
- المراقبة: ${plan.laborPreferences.monitoring || 'غير محدد'}

تفضيلات الولادة:
- وضعية الولادة: ${plan.deliveryPreferences.position || 'غير محدد'}
- شق العجان: ${plan.deliveryPreferences.episiotomy || 'غير محدد'}
- قطع الحبل السري: ${plan.deliveryPreferences.cordClamping || 'غير محدد'}
- ملامسة الجلد: ${plan.deliveryPreferences.skinToSkin ? 'نعم' : 'لا'}

تفضيلات الطفل:
- الرضاعة: ${plan.babyPreferences.feeding || 'غير محدد'}
- الإقامة: ${plan.babyPreferences.rooming || 'غير محدد'}
- الختان: ${plan.babyPreferences.circumcision || 'غير محدد'}
- التطعيمات: ${plan.babyPreferences.vaccinations ? 'نعم' : 'لا'}

حالات الطوارئ:
- القيصرية: ${plan.emergencyPreferences.csection || 'غير محدد'}
- المرافق: ${plan.emergencyPreferences.companion || 'غير محدد'}

ملاحظات إضافية:
${plan.additionalNotes || 'لا توجد'}
    `;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'خطة-الولادة.txt';
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
            تصدير
          </Button>
          <Button onClick={savePlan} className={saved ? 'bg-green-500' : ''}>
            {saved ? <Sparkles className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {saved ? 'تم الحفظ!' : 'حفظ'}
          </Button>
        </div>

        {/* Labor Preferences */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-blue-500" />
                تفضيلات المخاض
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <Label className="font-medium">بيئة غرفة الولادة</Label>
                <RadioGroup
                  value={plan.laborPreferences.environment}
                  onValueChange={(v) => updatePlan('laborPreferences', 'environment', v)}
                  className="mt-2 grid grid-cols-2 gap-2"
                >
                  {["إضاءة خافتة", "موسيقى هادئة", "صمت تام", "طبيعية"].map(option => (
                    <div key={option} className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value={option} id={`env-${option}`} />
                      <Label htmlFor={`env-${option}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label className="font-medium">الحركة أثناء المخاض</Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {["المشي", "الكرة", "الماء الدافئ", "تغيير الوضعيات"].map(option => (
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
                <Label className="font-medium">تخفيف الألم</Label>
                <RadioGroup
                  value={plan.laborPreferences.painRelief}
                  onValueChange={(v) => updatePlan('laborPreferences', 'painRelief', v)}
                  className="mt-2 space-y-2"
                >
                  {[
                    { value: "natural", label: "طبيعي بدون تدخل" },
                    { value: "epidural", label: "إبرة الظهر" },
                    { value: "gas", label: "غاز الضحك" },
                    { value: "flexible", label: "أقرر لاحقاً" },
                  ].map(option => (
                    <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
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
                تفضيلات الولادة
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <Label className="font-medium">وضعية الولادة المفضلة</Label>
                <RadioGroup
                  value={plan.deliveryPreferences.position}
                  onValueChange={(v) => updatePlan('deliveryPreferences', 'position', v)}
                  className="mt-2 grid grid-cols-2 gap-2"
                >
                  {["مستلقية", "نصف جالسة", "جانبية", "رباعية"].map(option => (
                    <div key={option} className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value={option} id={`pos-${option}`} />
                      <Label htmlFor={`pos-${option}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label className="font-medium">قطع الحبل السري</Label>
                <RadioGroup
                  value={plan.deliveryPreferences.cordClamping}
                  onValueChange={(v) => updatePlan('deliveryPreferences', 'cordClamping', v)}
                  className="mt-2 space-y-2"
                >
                  {[
                    { value: "delayed", label: "تأخير القطع (1-3 دقائق)" },
                    { value: "immediate", label: "قطع فوري" },
                    { value: "partner", label: "الزوج يقطع الحبل" },
                  ].map(option => (
                    <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
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
                <Label>ملامسة الجلد للجلد فوراً بعد الولادة</Label>
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
                تفضيلات العناية بالطفل
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <Label className="font-medium">الرضاعة</Label>
                <RadioGroup
                  value={plan.babyPreferences.feeding}
                  onValueChange={(v) => updatePlan('babyPreferences', 'feeding', v)}
                  className="mt-2 space-y-2"
                >
                  {[
                    { value: "breast", label: "رضاعة طبيعية حصرية" },
                    { value: "formula", label: "رضاعة صناعية" },
                    { value: "mixed", label: "مختلطة" },
                  ].map(option => (
                    <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value={option.value} id={`feed-${option.value}`} />
                      <Label htmlFor={`feed-${option.value}`}>{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label className="font-medium">إقامة الطفل</Label>
                <RadioGroup
                  value={plan.babyPreferences.rooming}
                  onValueChange={(v) => updatePlan('babyPreferences', 'rooming', v)}
                  className="mt-2 space-y-2"
                >
                  {[
                    { value: "rooming-in", label: "في الغرفة معي 24 ساعة" },
                    { value: "nursery-night", label: "الحضانة ليلاً فقط" },
                    { value: "nursery", label: "الحضانة" },
                  ].map(option => (
                    <div key={option.value} className="flex items-center space-x-2 space-x-reverse">
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
                <Label>الموافقة على التطعيمات الأولية</Label>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional Notes */}
        <Card>
          <CardHeader>
            <CardTitle>ملاحظات إضافية</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={plan.additionalNotes}
              onChange={(e) => setPlan(prev => ({ ...prev, additionalNotes: e.target.value }))}
              placeholder="أي تفضيلات أو طلبات إضافية..."
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
                <strong>تذكري:</strong> هذه خطة مبدئية وقد تتغير حسب الظروف الطبية. ناقشي خطتك مع طبيبك ومستشفى الولادة.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
};

export default BirthPlan;
