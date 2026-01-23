import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ToolFrame } from "@/components/ToolFrame";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { CheckSquare, Bed, Shirt, Bath, Car, ShoppingBag, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useAnalytics } from "@/hooks/useAnalytics";

interface ChecklistItem {
  id: string;
  name: string;
  priority: "essential" | "recommended" | "optional";
}

interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
  items: ChecklistItem[];
}

const STORAGE_KEY = "nursery-checklist-data";

const categories: Category[] = [
  {
    id: "sleeping",
    name: "النوم والراحة",
    icon: Bed,
    items: [
      { id: "crib", name: "سرير أطفال آمن", priority: "essential" },
      { id: "mattress", name: "مرتبة السرير", priority: "essential" },
      { id: "sheets", name: "ملاءات قطنية (3-4)", priority: "essential" },
      { id: "swaddles", name: "لفات التقميط (4-6)", priority: "essential" },
      { id: "monitor", name: "جهاز مراقبة الطفل", priority: "recommended" },
      { id: "nightlight", name: "إضاءة ليلية خافتة", priority: "recommended" },
      { id: "bassinet", name: "سرير متنقل", priority: "optional" },
      { id: "rocker", name: "كرسي هزاز", priority: "optional" },
    ],
  },
  {
    id: "clothing",
    name: "الملابس",
    icon: Shirt,
    items: [
      { id: "onesies", name: "بدلات قطنية (8-10)", priority: "essential" },
      { id: "sleepers", name: "بيجامات نوم (4-6)", priority: "essential" },
      { id: "socks", name: "جوارب (6-8 أزواج)", priority: "essential" },
      { id: "hats", name: "قبعات (2-3)", priority: "essential" },
      { id: "mittens", name: "قفازات (2-3)", priority: "recommended" },
      { id: "bibs", name: "مرايل (10+)", priority: "recommended" },
      { id: "sweaters", name: "كنزات صوفية (2-3)", priority: "recommended" },
      { id: "shoes", name: "حذاء ناعم", priority: "optional" },
    ],
  },
  {
    id: "bathing",
    name: "الاستحمام والنظافة",
    icon: Bath,
    items: [
      { id: "tub", name: "حوض استحمام صغير", priority: "essential" },
      { id: "towels", name: "مناشف بغطاء رأس (3-4)", priority: "essential" },
      { id: "washcloths", name: "منشفة استحمام ناعمة", priority: "essential" },
      { id: "soap", name: "صابون وشامبو أطفال", priority: "essential" },
      { id: "lotion", name: "كريم مرطب", priority: "essential" },
      { id: "diapers", name: "حفاضات (مخزون كبير)", priority: "essential" },
      { id: "wipes", name: "مناديل مبللة", priority: "essential" },
      { id: "diaper-cream", name: "كريم تسلخات", priority: "essential" },
      { id: "nailclippers", name: "مقص أظافر صغير", priority: "recommended" },
      { id: "brush", name: "فرشاة شعر ناعمة", priority: "optional" },
    ],
  },
  {
    id: "feeding",
    name: "الرضاعة والتغذية",
    icon: ShoppingBag,
    items: [
      { id: "bottles", name: "رضّاعات (4-6)", priority: "essential" },
      { id: "nipples", name: "حلمات بديلة", priority: "essential" },
      { id: "sterilizer", name: "جهاز تعقيم", priority: "recommended" },
      { id: "brush-bottle", name: "فرشاة تنظيف الرضاعات", priority: "essential" },
      { id: "burp-cloths", name: "مناديل التجشؤ", priority: "essential" },
      { id: "nursing-pillow", name: "وسادة رضاعة", priority: "recommended" },
      { id: "pump", name: "مضخة حليب", priority: "recommended" },
      { id: "storage-bags", name: "أكياس تخزين الحليب", priority: "optional" },
    ],
  },
  {
    id: "transport",
    name: "التنقل",
    icon: Car,
    items: [
      { id: "carseat", name: "مقعد سيارة للرضع", priority: "essential" },
      { id: "stroller", name: "عربة أطفال", priority: "essential" },
      { id: "carrier", name: "حمالة أطفال", priority: "recommended" },
      { id: "diaper-bag", name: "حقيبة حفاضات", priority: "essential" },
      { id: "travel-crib", name: "سرير سفر قابل للطي", priority: "optional" },
    ],
  },
];

const priorityLabels = {
  essential: { label: "ضروري", color: "bg-red-100 text-red-700" },
  recommended: { label: "موصى به", color: "bg-amber-100 text-amber-700" },
  optional: { label: "اختياري", color: "bg-green-100 text-green-700" },
};

const NurseryChecklist = () => {
  const { t } = useTranslation();
  const { trackAction } = useAnalytics("nursery-checklist");
  
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setCheckedItems(JSON.parse(saved));
    }
  }, []);

  const toggleItem = (itemId: string) => {
    const newChecked = checkedItems.includes(itemId)
      ? checkedItems.filter(id => id !== itemId)
      : [...checkedItems, itemId];
    setCheckedItems(newChecked);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newChecked));
    trackAction("item_toggled", { itemId, checked: !checkedItems.includes(itemId) });
  };

  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  const checkedCount = checkedItems.length;
  const progress = (checkedCount / totalItems) * 100;

  const essentialItems = categories.flatMap(cat => cat.items.filter(i => i.priority === "essential"));
  const essentialChecked = essentialItems.filter(i => checkedItems.includes(i.id)).length;
  const essentialProgress = (essentialChecked / essentialItems.length) * 100;

  return (
    <ToolFrame
      title={t('tools.nurseryChecklist.title')}
      subtitle={t('tools.nurseryChecklist.description')}
      icon={CheckSquare}
      mood="joyful"
    >
      <div className="space-y-6">
        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-pink-100/50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">التقدم الإجمالي</span>
                <span className="text-lg font-bold text-primary">{checkedCount}/{totalItems}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-100/50 to-rose-100/50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">الأساسيات</span>
                <span className="text-lg font-bold text-red-600">{essentialChecked}/{essentialItems.length}</span>
              </div>
              <Progress value={essentialProgress} className="h-2 bg-red-100" />
            </CardContent>
          </Card>
        </div>

        {/* Categories */}
        {categories.map((category, catIndex) => {
          const IconComp = category.icon;
          const catChecked = category.items.filter(i => checkedItems.includes(i.id)).length;
          
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIndex * 0.05 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconComp className="h-5 w-5 text-primary" />
                      {category.name}
                    </div>
                    <span className="text-sm font-normal text-muted-foreground">
                      {catChecked}/{category.items.length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {category.items.map((item) => {
                      const isChecked = checkedItems.includes(item.id);
                      const priorityInfo = priorityLabels[item.priority];
                      
                      return (
                        <div
                          key={item.id}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                            isChecked ? 'bg-green-50 border border-green-200' : 'bg-muted/30 hover:bg-muted/50'
                          }`}
                          onClick={() => toggleItem(item.id)}
                        >
                          <Checkbox checked={isChecked} />
                          <span className={`flex-1 ${isChecked ? 'line-through text-muted-foreground' : ''}`}>
                            {item.name}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${priorityInfo.color}`}>
                            {priorityInfo.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {/* Completion Message */}
        {progress === 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="bg-gradient-to-r from-green-100 to-emerald-100 border-green-300">
              <CardContent className="py-6 text-center">
                <Sparkles className="h-12 w-12 mx-auto text-green-500 mb-3" />
                <h3 className="text-xl font-bold text-green-700">مبروك! 🎉</h3>
                <p className="text-green-600">غرفة الطفل جاهزة تماماً!</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tips */}
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex gap-3">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">نصائح للتجهيز</p>
                <ul className="text-sm text-blue-700 mt-1 space-y-1 list-disc list-inside">
                  <li>ابدئي بالأساسيات أولاً</li>
                  <li>اشتري ملابس بمقاسات مختلفة</li>
                  <li>تأكدي من معايير السلامة للسرير والمقعد</li>
                  <li>لا تشتري كل شيء مرة واحدة - بعض الأشياء يمكن شراؤها لاحقاً</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
};

export default NurseryChecklist;
