import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ToolFrame } from "@/components/ToolFrame";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Check, Star, Heart, Baby, Sparkles, Calendar, Trophy, Target, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAnalytics } from "@/hooks/useAnalytics";

interface MilestoneItem {
  id: string;
  week: number;
  title: string;
  description: string;
  icon: "baby" | "heart" | "star" | "sparkles";
  category: "development" | "checkup" | "preparation" | "personal";
}

const STORAGE_KEY = "pregnancy-milestones-completed";
const WEEK_KEY = "pregnancy-current-week";

const milestones: MilestoneItem[] = [
  { id: "m1", week: 4, title: "Pregnancy Discovery", description: "Confirm pregnancy with home or lab test", icon: "sparkles", category: "personal" },
  { id: "m2", week: 6, title: "First Prenatal Visit", description: "First doctor visit and initial tests", icon: "heart", category: "checkup" },
  { id: "m3", week: 8, title: "First Heartbeat", description: "Hear baby's heartbeat for the first time", icon: "heart", category: "development" },
  { id: "m4", week: 10, title: "First Ultrasound", description: "First scan and seeing your baby", icon: "baby", category: "checkup" },
  { id: "m5", week: 12, title: "End of First Trimester", description: "Morning sickness fades, energy returns", icon: "star", category: "development" },
  { id: "m6", week: 14, title: "Second Trimester Begins", description: "The golden period of pregnancy", icon: "sparkles", category: "development" },
  { id: "m7", week: 16, title: "First Baby Movements", description: "Feeling the first gentle kicks", icon: "baby", category: "development" },
  { id: "m8", week: 18, title: "Anatomy Scan", description: "Detailed ultrasound of organs", icon: "heart", category: "checkup" },
  { id: "m9", week: 20, title: "Halfway Point", description: "Find out baby's gender (optional)", icon: "star", category: "development" },
  { id: "m10", week: 24, title: "Viability Milestone", description: "Baby can survive outside the womb", icon: "baby", category: "development" },
  { id: "m11", week: 26, title: "Glucose Screening", description: "Gestational diabetes test", icon: "heart", category: "checkup" },
  { id: "m12", week: 28, title: "Third Trimester Begins", description: "Countdown to delivery begins", icon: "sparkles", category: "development" },
  { id: "m13", week: 30, title: "Prepare Nursery", description: "Set up baby's room and clothes", icon: "star", category: "preparation" },
  { id: "m14", week: 32, title: "Weekly Checkups Begin", description: "More frequent doctor visits", icon: "heart", category: "checkup" },
  { id: "m15", week: 34, title: "Pack Hospital Bag", description: "Prepare everything for delivery", icon: "star", category: "preparation" },
  { id: "m16", week: 36, title: "Baby Drops", description: "Baby moves into position for birth", icon: "baby", category: "development" },
  { id: "m17", week: 37, title: "Full Term", description: "Baby is fully developed", icon: "sparkles", category: "development" },
  { id: "m18", week: 38, title: "Ready & Waiting", description: "Ready for delivery anytime", icon: "heart", category: "preparation" },
  { id: "m19", week: 40, title: "Due Date", description: "The day you've been waiting for!", icon: "baby", category: "development" },
];

const iconComponents = {
  baby: Baby,
  heart: Heart,
  star: Star,
  sparkles: Sparkles,
};

const categoryConfig = {
  development: { label: "Development", color: "bg-blue-500", lightBg: "bg-blue-500/10 text-blue-700 dark:text-blue-300" },
  checkup: { label: "Checkup", color: "bg-pink-500", lightBg: "bg-pink-500/10 text-pink-700 dark:text-pink-300" },
  preparation: { label: "Preparation", color: "bg-amber-500", lightBg: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  personal: { label: "Personal", color: "bg-purple-500", lightBg: "bg-purple-500/10 text-purple-700 dark:text-purple-300" },
};

const PregnancyMilestones = () => {
  const { t } = useTranslation();
  const { trackAction } = useAnalytics("pregnancy-milestones");
  
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [currentWeek, setCurrentWeek] = useState<number>(12);
  const [showAllPast, setShowAllPast] = useState(false);

  useEffect(() => {
    const savedCompleted = localStorage.getItem(STORAGE_KEY);
    const savedWeek = localStorage.getItem(WEEK_KEY);
    if (savedCompleted) setCompletedIds(JSON.parse(savedCompleted));
    if (savedWeek) setCurrentWeek(parseInt(savedWeek));
  }, []);

  const toggleMilestone = (id: string) => {
    const newCompleted = completedIds.includes(id)
      ? completedIds.filter(c => c !== id)
      : [...completedIds, id];
    setCompletedIds(newCompleted);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newCompleted));
    trackAction("milestone_toggled", { milestoneId: id, completed: !completedIds.includes(id) });
  };

  const updateWeek = (week: number) => {
    setCurrentWeek(week);
    localStorage.setItem(WEEK_KEY, week.toString());
  };

  const progress = (completedIds.length / milestones.length) * 100;
  
  const pastMilestones = milestones.filter(m => m.week < currentWeek);
  const currentMilestones = milestones.filter(m => m.week >= currentWeek && m.week <= currentWeek + 4);
  const futureMilestones = milestones.filter(m => m.week > currentWeek + 4);

  const displayPastMilestones = showAllPast ? pastMilestones : pastMilestones.slice(-2);

  return (
    <ToolFrame
      title="Pregnancy Milestones"
      subtitle="Track your journey's special moments"
      customIcon="milestones"
      mood="empowering"
      toolId="pregnancy-milestones"
    >
      <div className="space-y-5">
        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="py-4 text-center">
              <Trophy className="w-6 h-6 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-bold text-primary">{completedIds.length}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5">
            <CardContent className="py-4 text-center">
              <Target className="w-6 h-6 mx-auto mb-1 text-amber-600 dark:text-amber-400" />
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{milestones.length - completedIds.length}</p>
              <p className="text-xs text-muted-foreground">Remaining</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
            <CardContent className="py-4 text-center">
              <Calendar className="w-6 h-6 mx-auto mb-1 text-emerald-600 dark:text-emerald-400" />
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">W{currentWeek}</p>
              <p className="text-xs text-muted-foreground">Current</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Card */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Your Progress</h3>
              <span className="text-2xl font-bold text-primary">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {completedIds.length} of {milestones.length} milestones achieved
            </p>
          </CardContent>
        </Card>

        {/* Current Week Selector */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Your Current Week</span>
              <select
                value={currentWeek}
                onChange={(e) => updateWeek(Number(e.target.value))}
                className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-medium"
              >
                {Array.from({ length: 40 }, (_, i) => i + 1).map(week => (
                  <option key={week} value={week}>Week {week}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Past Milestones */}
        {pastMilestones.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-muted-foreground flex items-center gap-2">
                <Check className="h-4 w-4" />
                Past Milestones
              </h3>
              {pastMilestones.length > 2 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowAllPast(!showAllPast)}
                  className="text-xs"
                >
                  {showAllPast ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
                  {showAllPast ? 'Show Less' : `Show All (${pastMilestones.length})`}
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <AnimatePresence>
                {displayPastMilestones.map((milestone) => {
                  const IconComp = iconComponents[milestone.icon];
                  const isCompleted = completedIds.includes(milestone.id);
                  return (
                    <motion.div
                      key={milestone.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Card 
                        className={`cursor-pointer transition-all ${isCompleted ? 'bg-muted/50 border-primary/20' : 'opacity-70'}`}
                        onClick={() => toggleMilestone(milestone.id)}
                      >
                        <CardContent className="py-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isCompleted ? 'bg-primary/20' : 'bg-muted'}`}>
                              {isCompleted ? <Check className="h-4 w-4 text-primary" /> : <IconComp className="h-4 w-4 text-muted-foreground" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Week {milestone.week}</span>
                                <span className={`text-xs px-1.5 py-0.5 rounded ${categoryConfig[milestone.category].lightBg}`}>
                                  {categoryConfig[milestone.category].label}
                                </span>
                              </div>
                              <h4 className={`font-medium text-sm ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                {milestone.title}
                              </h4>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Current & Upcoming Milestones */}
        {currentMilestones.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Current & Upcoming
            </h3>
            <div className="space-y-3">
              {currentMilestones.map((milestone, index) => {
                const IconComp = iconComponents[milestone.icon];
                const isCompleted = completedIds.includes(milestone.id);
                const isCurrent = milestone.week === currentWeek;
                return (
                  <motion.div
                    key={milestone.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all border-2 ${
                        isCurrent ? 'border-primary shadow-lg' : 
                        isCompleted ? 'border-primary/30 bg-primary/5' : 
                        'border-dashed border-muted-foreground/20 hover:border-primary/50'
                      }`}
                      onClick={() => toggleMilestone(milestone.id)}
                    >
                      <CardContent className="py-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-3 rounded-xl ${
                            isCompleted ? 'bg-primary text-primary-foreground' : 
                            `bg-gradient-to-br ${categoryConfig[milestone.category].color}/20`
                          }`}>
                            {isCompleted ? <Check className="h-5 w-5" /> : <IconComp className="h-5 w-5" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                Week {milestone.week}
                              </span>
                              {isCurrent && (
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                                  This Week!
                                </span>
                              )}
                              {isCompleted && (
                                <span className="text-xs text-primary font-medium">✓ Done</span>
                              )}
                            </div>
                            <h4 className={`font-semibold mt-1 ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                              {milestone.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-0.5">{milestone.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Future Milestones Preview */}
        {futureMilestones.length > 0 && (
          <div>
            <h3 className="font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Coming Up ({futureMilestones.length} more)
            </h3>
            <Card className="bg-muted/30">
              <CardContent className="py-3">
                <div className="flex flex-wrap gap-2">
                  {futureMilestones.slice(0, 5).map((m) => (
                    <span key={m.id} className="text-xs px-2 py-1 rounded-full bg-background border">
                      W{m.week}: {m.title}
                    </span>
                  ))}
                  {futureMilestones.length > 5 && (
                    <span className="text-xs px-2 py-1 text-muted-foreground">
                      +{futureMilestones.length - 5} more
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ToolFrame>
  );
};

export default PregnancyMilestones;
