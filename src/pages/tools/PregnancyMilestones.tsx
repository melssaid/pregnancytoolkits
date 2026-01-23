import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ToolFrame } from "@/components/ToolFrame";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Milestone, Check, Star, Heart, Baby, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useAnalytics } from "@/hooks/useAnalytics";

interface MilestoneItem {
  id: string;
  week: number;
  titleKey: string;
  descriptionKey: string;
  icon: "baby" | "heart" | "star" | "sparkles";
  category: "development" | "checkup" | "preparation" | "personal";
}

const STORAGE_KEY = "pregnancy-milestones-completed";

const milestones: MilestoneItem[] = [
  // First Trimester
  { id: "m1", week: 4, titleKey: "اكتشاف الحمل", descriptionKey: "تأكيد الحمل باختبار منزلي أو مخبري", icon: "sparkles", category: "personal" },
  { id: "m2", week: 6, titleKey: "أول موعد طبي", descriptionKey: "زيارة الطبيب الأولى والفحوصات المبدئية", icon: "heart", category: "checkup" },
  { id: "m3", week: 8, titleKey: "سماع نبض القلب", descriptionKey: "أول مرة تسمعين فيها نبض قلب طفلك", icon: "heart", category: "development" },
  { id: "m4", week: 10, titleKey: "فحص الموجات الأولى", descriptionKey: "السونار الأول ورؤية الجنين", icon: "baby", category: "checkup" },
  { id: "m5", week: 12, titleKey: "نهاية الثلث الأول", descriptionKey: "انتهاء مرحلة الغثيان وبداية الطاقة", icon: "star", category: "development" },
  
  // Second Trimester
  { id: "m6", week: 14, titleKey: "بداية الثلث الثاني", descriptionKey: "الفترة الذهبية للحمل", icon: "sparkles", category: "development" },
  { id: "m7", week: 16, titleKey: "أول حركة للجنين", descriptionKey: "الشعور بأول ركلات خفيفة", icon: "baby", category: "development" },
  { id: "m8", week: 18, titleKey: "فحص التشوهات", descriptionKey: "السونار المفصل للأعضاء", icon: "heart", category: "checkup" },
  { id: "m9", week: 20, titleKey: "منتصف الحمل", descriptionKey: "معرفة جنس الجنين (اختياري)", icon: "star", category: "development" },
  { id: "m10", week: 24, titleKey: "قابلية الحياة", descriptionKey: "الجنين قادر على الحياة خارج الرحم", icon: "baby", category: "development" },
  { id: "m11", week: 26, titleKey: "فحص سكر الحمل", descriptionKey: "اختبار تحمل الجلوكوز", icon: "heart", category: "checkup" },
  
  // Third Trimester
  { id: "m12", week: 28, titleKey: "بداية الثلث الأخير", descriptionKey: "بدء العد التنازلي للولادة", icon: "sparkles", category: "development" },
  { id: "m13", week: 30, titleKey: "تجهيز غرفة الطفل", descriptionKey: "إعداد الحضانة والملابس", icon: "star", category: "preparation" },
  { id: "m14", week: 32, titleKey: "فحوصات ما قبل الولادة", descriptionKey: "زيارات أسبوعية للطبيب", icon: "heart", category: "checkup" },
  { id: "m15", week: 34, titleKey: "تحضير حقيبة المستشفى", descriptionKey: "جهزي كل ما تحتاجينه للولادة", icon: "star", category: "preparation" },
  { id: "m16", week: 36, titleKey: "وضعية الرأس للأسفل", descriptionKey: "الجنين يستعد للولادة", icon: "baby", category: "development" },
  { id: "m17", week: 37, titleKey: "اكتمال النمو", descriptionKey: "الجنين مكتمل النمو", icon: "sparkles", category: "development" },
  { id: "m18", week: 38, titleKey: "الانتظار", descriptionKey: "جاهزة للولادة في أي وقت", icon: "heart", category: "preparation" },
  { id: "m19", week: 40, titleKey: "موعد الولادة المتوقع", descriptionKey: "اليوم الذي تنتظرينه!", icon: "baby", category: "development" },
];

const iconComponents = {
  baby: Baby,
  heart: Heart,
  star: Star,
  sparkles: Sparkles,
};

const categoryColors = {
  development: "from-blue-500 to-cyan-500",
  checkup: "from-pink-500 to-rose-500",
  preparation: "from-amber-500 to-orange-500",
  personal: "from-purple-500 to-violet-500",
};

const PregnancyMilestones = () => {
  const { t } = useTranslation();
  const { trackAction } = useAnalytics("pregnancy-milestones");
  
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [currentWeek, setCurrentWeek] = useState<number>(12);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setCompletedIds(JSON.parse(saved));
    }
  }, []);

  const toggleMilestone = (id: string) => {
    const newCompleted = completedIds.includes(id)
      ? completedIds.filter(c => c !== id)
      : [...completedIds, id];
    setCompletedIds(newCompleted);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newCompleted));
    trackAction("milestone_toggled", { milestoneId: id, completed: !completedIds.includes(id) });
  };

  const progress = (completedIds.length / milestones.length) * 100;
  
  const upcomingMilestones = milestones.filter(m => m.week >= currentWeek && !completedIds.includes(m.id)).slice(0, 3);
  const completedMilestones = milestones.filter(m => completedIds.includes(m.id));

  return (
    <ToolFrame
      title={t('tools.pregnancyMilestones.title')}
      subtitle={t('tools.pregnancyMilestones.description')}
      icon={Milestone}
      mood="empowering"
    >
      <div className="space-y-6">
        {/* Progress Overview */}
        <Card className="bg-gradient-to-r from-primary/10 to-pink-100/50 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg">تقدم رحلتك</h3>
                <p className="text-sm text-muted-foreground">
                  أنجزتِ {completedIds.length} من {milestones.length} إنجاز
                </p>
              </div>
              <div className="text-3xl font-bold text-primary">
                {Math.round(progress)}%
              </div>
            </div>
            <Progress value={progress} className="h-3" />
          </CardContent>
        </Card>

        {/* Current Week Selector */}
        <div className="flex items-center gap-3 justify-center">
          <span className="text-sm text-muted-foreground">أسبوعك الحالي:</span>
          <select
            value={currentWeek}
            onChange={(e) => setCurrentWeek(Number(e.target.value))}
            className="rounded-lg border border-input bg-background px-4 py-2 font-medium"
          >
            {Array.from({ length: 40 }, (_, i) => i + 1).map(week => (
              <option key={week} value={week}>الأسبوع {week}</option>
            ))}
          </select>
        </div>

        {/* Upcoming Milestones */}
        {upcomingMilestones.length > 0 && (
          <div>
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              الإنجازات القادمة
            </h3>
            <div className="space-y-3">
              {upcomingMilestones.map((milestone, index) => {
                const IconComp = iconComponents[milestone.icon];
                return (
                  <motion.div
                    key={milestone.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors">
                      <CardContent className="py-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${categoryColors[milestone.category]} text-white`}>
                            <IconComp className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                                الأسبوع {milestone.week}
                              </span>
                            </div>
                            <h4 className="font-semibold mt-1">{milestone.titleKey}</h4>
                            <p className="text-sm text-muted-foreground">{milestone.descriptionKey}</p>
                          </div>
                          <Checkbox
                            checked={completedIds.includes(milestone.id)}
                            onCheckedChange={() => toggleMilestone(milestone.id)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* All Milestones Timeline */}
        <div>
          <h3 className="font-bold text-lg mb-3">جميع الإنجازات</h3>
          <div className="relative">
            <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-pink-400 to-purple-400" />
            <div className="space-y-4">
              {milestones.map((milestone, index) => {
                const IconComp = iconComponents[milestone.icon];
                const isCompleted = completedIds.includes(milestone.id);
                const isPast = milestone.week < currentWeek;
                
                return (
                  <motion.div
                    key={milestone.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="relative pr-10"
                  >
                    <div className={`absolute right-2 top-4 w-5 h-5 rounded-full border-2 flex items-center justify-center z-10 ${
                      isCompleted 
                        ? 'bg-primary border-primary text-white' 
                        : isPast 
                          ? 'bg-muted border-muted-foreground/30' 
                          : 'bg-white border-primary/30'
                    }`}>
                      {isCompleted && <Check className="h-3 w-3" />}
                    </div>
                    
                    <Card 
                      className={`cursor-pointer transition-all ${
                        isCompleted 
                          ? 'bg-primary/5 border-primary/20' 
                          : isPast 
                            ? 'opacity-60' 
                            : 'hover:shadow-md'
                      }`}
                      onClick={() => toggleMilestone(milestone.id)}
                    >
                      <CardContent className="py-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isCompleted ? 'bg-primary/20' : 'bg-muted'}`}>
                            <IconComp className={`h-4 w-4 ${isCompleted ? 'text-primary' : 'text-muted-foreground'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">الأسبوع {milestone.week}</span>
                              {isCompleted && (
                                <span className="text-xs text-primary font-medium">✓ مكتمل</span>
                              )}
                            </div>
                            <h4 className={`font-medium truncate ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                              {milestone.titleKey}
                            </h4>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </ToolFrame>
  );
};

export default PregnancyMilestones;
