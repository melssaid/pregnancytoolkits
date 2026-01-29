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
  { id: "m1", week: 4, titleKey: "Pregnancy Discovery", descriptionKey: "Confirm pregnancy with home or lab test", icon: "sparkles", category: "personal" },
  { id: "m2", week: 6, titleKey: "First Prenatal Visit", descriptionKey: "First doctor visit and initial tests", icon: "heart", category: "checkup" },
  { id: "m3", week: 8, titleKey: "First Heartbeat", descriptionKey: "Hear baby's heartbeat for the first time", icon: "heart", category: "development" },
  { id: "m4", week: 10, titleKey: "First Ultrasound", descriptionKey: "First scan and seeing your baby", icon: "baby", category: "checkup" },
  { id: "m5", week: 12, titleKey: "End of First Trimester", descriptionKey: "Morning sickness fades, energy returns", icon: "star", category: "development" },
  
  // Second Trimester
  { id: "m6", week: 14, titleKey: "Second Trimester Begins", descriptionKey: "The golden period of pregnancy", icon: "sparkles", category: "development" },
  { id: "m7", week: 16, titleKey: "First Baby Movements", descriptionKey: "Feeling the first gentle kicks", icon: "baby", category: "development" },
  { id: "m8", week: 18, titleKey: "Anatomy Scan", descriptionKey: "Detailed ultrasound of organs", icon: "heart", category: "checkup" },
  { id: "m9", week: 20, titleKey: "Halfway Point", descriptionKey: "Find out baby's gender (optional)", icon: "star", category: "development" },
  { id: "m10", week: 24, titleKey: "Viability Milestone", descriptionKey: "Baby can survive outside the womb", icon: "baby", category: "development" },
  { id: "m11", week: 26, titleKey: "Glucose Screening", descriptionKey: "Gestational diabetes test", icon: "heart", category: "checkup" },
  
  // Third Trimester
  { id: "m12", week: 28, titleKey: "Third Trimester Begins", descriptionKey: "Countdown to delivery begins", icon: "sparkles", category: "development" },
  { id: "m13", week: 30, titleKey: "Prepare Nursery", descriptionKey: "Set up baby's room and clothes", icon: "star", category: "preparation" },
  { id: "m14", week: 32, titleKey: "Prenatal Checkups", descriptionKey: "Weekly doctor visits begin", icon: "heart", category: "checkup" },
  { id: "m15", week: 34, titleKey: "Pack Hospital Bag", descriptionKey: "Prepare everything for delivery", icon: "star", category: "preparation" },
  { id: "m16", week: 36, titleKey: "Baby Drops", descriptionKey: "Baby moves into position for birth", icon: "baby", category: "development" },
  { id: "m17", week: 37, titleKey: "Full Term", descriptionKey: "Baby is fully developed", icon: "sparkles", category: "development" },
  { id: "m18", week: 38, titleKey: "Ready & Waiting", descriptionKey: "Ready for delivery anytime", icon: "heart", category: "preparation" },
  { id: "m19", week: 40, titleKey: "Due Date", descriptionKey: "The day you've been waiting for!", icon: "baby", category: "development" },
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
      customIcon="checklist"
      mood="empowering"
      toolId="pregnancy-milestones"
    >
      <div className="space-y-6">
        {/* Progress Overview */}
        <Card className="bg-gradient-to-r from-primary/10 to-pink-100/50 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg">Your Progress</h3>
                <p className="text-sm text-muted-foreground">
                  Completed {completedIds.length} of {milestones.length} milestones
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
          <span className="text-sm text-muted-foreground">Current week:</span>
          <select
            value={currentWeek}
            onChange={(e) => setCurrentWeek(Number(e.target.value))}
            className="rounded-lg border border-input bg-background px-4 py-2 font-medium"
          >
            {Array.from({ length: 40 }, (_, i) => i + 1).map(week => (
              <option key={week} value={week}>Week {week}</option>
            ))}
          </select>
        </div>

        {/* Upcoming Milestones */}
        {upcomingMilestones.length > 0 && (
          <div>
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Upcoming Milestones
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
                                Week {milestone.week}
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
          <h3 className="font-bold text-lg mb-3">All Milestones</h3>
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
                              <span className="text-xs text-muted-foreground">Week {milestone.week}</span>
                              {isCompleted && (
                                <span className="text-xs text-primary font-medium">✓ Done</span>
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
