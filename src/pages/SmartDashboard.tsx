import { useState, useRef, useEffect, useCallback } from "react";
import { SEOHead } from "@/components/SEOHead";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { useResetOnLanguageChange } from "@/hooks/useResetOnLanguageChange";
import { useUserProfile } from "@/hooks/useUserProfile";
import { 
  Send, Bot, User, Home, MessageCircle, Heart, Utensils, Dumbbell, 
  Play, Loader2, Activity, Scale, Brain, Sparkles,
  Baby, Pill, Stethoscope, Salad, ChevronRight, CalendarCheck,
  Hand, TrendingUp, Camera, Bell, Moon, Ruler, FileText,
  Database, Clock, Calendar, Briefcase, CheckCircle2
} from "lucide-react";
import { useTrackingStats } from "@/hooks/useTrackingStats";
import { VideoLibrary } from "@/components/VideoLibrary";
import { generalVideosByLang } from "@/data/videoData";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Link } from "react-router-dom";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { RecentAIResults } from "@/components/dashboard/RecentAIResults";
import { SavedFavorites } from "@/components/dashboard/SavedFavorites";
import { toast } from "sonner";
import { safeSaveToLocalStorage, safeParseLocalStorage } from "@/lib/safeStorage";


type TabType = "home" | "chat" | "health" | "nutrition" | "exercise" | "videos";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface HealthData {
  weight: string;
  bloodPressure: string;
  mood: string;
  symptoms: string[];
  weekOfPregnancy: number;
  savedAt?: string;
}

// أدوات التتبع والتخزين - مرتبة منطقياً بدون تكرار
const trackingTools = [
  { 
    categoryKey: "dailyTracking",
    icon: Clock,
    tools: [
      { id: "kick-counter",    titleKey: "kickCounter",    icon: Hand,   href: "/tools/kick-counter",    descKey: "kickCounterDesc" },
      { id: "weight-gain",     titleKey: "weightTracker",  icon: Scale,  href: "/tools/weight-gain",     descKey: "weightTrackerDesc" },
      { id: "vitamin-tracker", titleKey: "vitaminTracker", icon: Pill,   href: "/tools/vitamin-tracker", descKey: "vitaminTrackerDesc" },
    ]
  },
  { 
    categoryKey: "planning",
    icon: Calendar,
    tools: [
      { id: "smart-appointment", titleKey: "appointments", icon: Bell,     href: "/tools/smart-appointment-reminder", descKey: "appointmentsDesc" },
      { id: "birth-plan",        titleKey: "birthPlan",    icon: FileText, href: "/tools/ai-birth-plan",              descKey: "birthPlanDesc" },
      { id: "hospital-bag",      titleKey: "hospitalBag",  icon: Briefcase,href: "/tools/ai-hospital-bag",            descKey: "hospitalBagDesc" },
    ]
  },
  { 
    categoryKey: "growth",
    icon: TrendingUp,
    tools: [
      { id: "fetal-growth", titleKey: "fetalGrowth", icon: TrendingUp, href: "/tools/fetal-growth",    descKey: "fetalGrowthDesc" },
      { id: "baby-growth",  titleKey: "babyGrowth",  icon: Ruler,      href: "/tools/baby-growth",     descKey: "babyGrowthDesc" },
      { id: "bump-photos",  titleKey: "bumpPhotos",  icon: Camera,     href: "/tools/ai-bump-photos",  descKey: "bumpPhotosDesc" },
    ]
  },
  { 
    categoryKey: "postpartum",
    icon: Baby,
    tools: [
      { id: "baby-sleep",     titleKey: "babySleep",     icon: Moon,  href: "/tools/baby-sleep-tracker", descKey: "babySleepDesc" },
      { id: "diaper-tracker", titleKey: "diaperTracker", icon: Baby,  href: "/tools/diaper-tracker",     descKey: "diaperTrackerDesc" },
      { id: "baby-cry",       titleKey: "babyCry",       icon: Brain, href: "/tools/baby-cry-translator",descKey: "babyCryDesc" },
    ]
  },
];

const quickQuestionKeys = [
  { icon: Baby,       key: "firstTrimester", color: "from-primary to-primary/70" },
  { icon: Pill,       key: "coffee",         color: "from-primary/80 to-primary/60" },
  { icon: Stethoscope,key: "labor",          color: "from-primary/90 to-primary/70" },
  { icon: Salad,      key: "vitamins",       color: "from-primary/70 to-primary/50" },
];

const nutritionKeys = [
  { key: "breakfast", calories: 350 },
  { key: "lunch",     calories: 550 },
  { key: "dinner",    calories: 400 },
  { key: "snacks",    calories: 200 },
];

// Exercise links - distinct tools, no overlaps
const exerciseKeys = [
  { key: "walking",  href: "/tools/ai-fitness-coach" },
  { key: "swimming", href: "/tools/ai-fitness-coach" },
  { key: "yoga",     href: "/tools/ai-fitness-coach" },
];


const symptomKeys = ["nausea", "headache", "fatigue", "backPain", "swelling", "heartburn", "insomnia"] as const;

const SmartDashboard = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { streamChat, isLoading, error } = usePregnancyAI();
  const { stats, toolSummaries, loading: statsLoading } = useTrackingStats();
  
  const { profile: userProfile, updateProfile: updateUserProfile } = useUserProfile();

  useResetOnLanguageChange(() => {
    setMessages([{ role: "assistant", content: t('dashboard.chat.welcomeMessage') }]);
    setAiHealthInsight('');
    setHealthSaved(false);
  });
  
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: t('dashboard.chat.welcomeMessage') }
  ]);
  const [userInput, setUserInput] = useState("");
  // Load health data from localStorage or profile
  const [healthData, setHealthData] = useState<HealthData>(() => {
    const saved = safeParseLocalStorage<HealthData | null>("dashboard_health_checkin_v1", null);
    if (saved) return {
      ...saved,
      weekOfPregnancy: userProfile.pregnancyWeek || saved.weekOfPregnancy || 0,
      weight: userProfile.weight ? String(userProfile.weight) : saved.weight || "",
    };
    return {
      weight: userProfile.weight ? String(userProfile.weight) : "",
      bloodPressure: "",
      mood: userProfile.mood ?? "Good",
      symptoms: [],
      weekOfPregnancy: userProfile.pregnancyWeek || 0,
    };
  });
  const [healthSaved, setHealthSaved] = useState(false);
  const [aiHealthInsight, setAiHealthInsight] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync healthData when central profile loads/changes
  useEffect(() => {
    setHealthData(prev => ({
      ...prev,
      weekOfPregnancy: userProfile.pregnancyWeek ?? prev.weekOfPregnancy,
      weight: userProfile.weight ? String(userProfile.weight) : prev.weight,
      mood: userProfile.mood ?? prev.mood,
    }));
  }, [userProfile.pregnancyWeek, userProfile.weight, userProfile.mood]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMessage]);
    setUserInput("");

    let assistantContent = "";

    await streamChat({
      type: "pregnancy-assistant",
      messages: [...messages, userMessage],
      context: { language: currentLanguage },
      onDelta: (chunk) => {
        assistantContent += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && prev.length > 1 && prev[prev.length - 2].role === "user") {
            return prev.map((m, i) =>
              i === prev.length - 1 ? { ...m, content: assistantContent } : m
            );
          }
          return [...prev, { role: "assistant", content: assistantContent }];
        });
      },
      onDone: () => {},
    });
  };

  const getHealthAnalysis = () => {
    const { weight, bloodPressure, mood, weekOfPregnancy } = healthData;
    const analysis: string[] = [];
    
    if (weight && parseFloat(weight) > 0) {
      const expectedGain = weekOfPregnancy < 13 ? 2 : weekOfPregnancy < 27 ? 6 : 12;
      analysis.push(t('dashboard.health.analysis.expectedGain', { kg: expectedGain }));
    }
    
    if (bloodPressure) {
      const [systolic] = bloodPressure.split("/").map(Number);
      if (systolic > 140) {
        analysis.push(t('dashboard.health.analysis.bpHigh'));
      } else if (systolic < 90) {
        analysis.push(t('dashboard.health.analysis.bpLow'));
      } else if (!isNaN(systolic)) {
        analysis.push(t('dashboard.health.analysis.bpNormal'));
      }
    }

    if (mood === "Bad" || mood === "Anxious") {
      analysis.push(t('dashboard.health.analysis.mentalSupport'));
    }

    if (healthData.symptoms.length > 0) {
      const translatedSymptoms = healthData.symptoms.map(s => t(`dashboard.health.symptoms.${s}`)).join(", ");
      analysis.push(t('dashboard.health.analysis.recordedSymptoms', { symptoms: translatedSymptoms }));
    }

    return analysis.length > 0 ? analysis : [t('dashboard.health.analysis.enterData')];
  };

  const tabs = [
    { id: "home" as TabType, icon: Home, label: t('dashboard.tabs.home') },
    { id: "chat" as TabType, icon: MessageCircle, label: t('dashboard.tabs.chat') },
    { id: "health" as TabType, icon: Heart, label: t('dashboard.tabs.health') },
    { id: "nutrition" as TabType, icon: Utensils, label: t('dashboard.tabs.nutrition') },
    { id: "exercise" as TabType, icon: Dumbbell, label: t('dashboard.tabs.exercise') },
    { id: "videos" as TabType, icon: Play, label: t('dashboard.tabs.videos') },
  ];

  return (
    <Layout>
      <SEOHead title={t('dashboard.title', 'Pregnancy Dashboard')} description="Your personalized pregnancy dashboard with AI assistant, health tracking, nutrition & exercise tools." />
      {/* Navigation Tabs with Notification Button */}
      <nav className="bg-background/80 backdrop-blur-md border-b border-border/30 sticky top-16 z-40">
        <div className="container px-3">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide py-2.5">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
                    isActive
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-xl shadow-md shadow-primary/20"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <tab.icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="container py-4 space-y-4">
        {/* Home Tab - Enhanced with Progress Ring */}
        {activeTab === "home" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* 1. Progress Ring - Pregnancy Week Status */}
            {healthData.weekOfPregnancy > 0 && (
              <Card className="overflow-hidden rounded-2xl bg-gradient-to-br from-card to-muted/20 card-pink-top">
                <CardContent className="p-3.5">
                  <ProgressRing 
                    currentWeek={healthData.weekOfPregnancy} 
                    totalWeeks={40}
                  />
                </CardContent>
              </Card>
            )}

            {/* 2. Quick Stats - Daily Health Overview */}
            <QuickStats
              weight={parseFloat(healthData.weight) || (stats.dailyTracking.lastWeight ? parseFloat(stats.dailyTracking.lastWeight) : 0)}
              height={userProfile.height ?? 0}
              kicks={stats.dailyTracking.todayKicks}
              mood={healthData.mood}
              waterGlasses={stats.dailyTracking.waterGlasses}
              nextAppointment={stats.planning.upcomingAppointments > 0 ? t('dashboard.checkAppointments') : undefined}
            />

            {/* 3. Smart Pregnancy Plan - Prominent CTA */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Link
                to="/tools/smart-plan"
                className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/40 hover:shadow-md transition-all group card-pink-top"
              >
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg">
                  <CalendarCheck className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-bold text-foreground block">{t('dashboard.smartPlan')}</span>
                  <span className="text-xs text-muted-foreground">{t('dashboard.smartPlanDesc')}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </Link>
            </motion.div>

            {/* 4. Recent AI Results */}
            <RecentAIResults />

            {/* 4b. Saved Favorites */}
            <SavedFavorites />

            {/* 5. Data Tracking Tools - Organized by Category */}
            <Card className="overflow-hidden rounded-3xl card-pink-top">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Database className="w-4 h-4 text-primary" />
                    {t('dashboard.myTrackingData')}
                  </h3>
                  <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {trackingTools.reduce((acc, cat) => acc + cat.tools.length, 0)} {t('dashboard.tools')}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground/60 mb-4 leading-relaxed">
                  {t('dashboard.dataHint', 'تظهر البيانات والإحصائيات تلقائياً عند استخدام الأدوات وإضافة بياناتك')}
                </p>
                
                <div className="space-y-4">
                  {trackingTools.map((category, catIndex) => {
                    const getCategorySummary = () => {
                      let hasDataFlag = false;
                      switch (category.categoryKey) {
                        case "dailyTracking":
                          const dailyItems = [];
                          if (stats.dailyTracking.todayKicks > 0) { dailyItems.push(`${stats.dailyTracking.todayKicks} ${t('dashboard.summary.kicks')}`); }
                          if (stats.dailyTracking.vitaminsTaken > 0) { dailyItems.push(`${stats.dailyTracking.vitaminsTaken} ${t('dashboard.summary.vitamins')}`); }
                          if (stats.dailyTracking.lastWeight) { dailyItems.push(stats.dailyTracking.lastWeight); }
                          hasDataFlag = dailyItems.length > 0;
                          return { text: hasDataFlag ? dailyItems.join(" • ") : t('dashboard.summary.noDataToday'), hasData: hasDataFlag };
                        case "planning":
                          const planItems = [];
                          if (stats.planning.upcomingAppointments > 0) { planItems.push(`${stats.planning.upcomingAppointments} ${t('dashboard.summary.appointments')}`); }
                          if (stats.planning.bagItemsChecked > 0) { planItems.push(`${stats.planning.bagItemsChecked} ${t('dashboard.summary.itemsPacked')}`); }
                          if (stats.planning.birthPlanProgress > 0) { planItems.push(`${stats.planning.birthPlanProgress}% ${t('dashboard.summary.plan')}`); }
                          hasDataFlag = planItems.length > 0;
                          return { text: hasDataFlag ? planItems.join(" • ") : t('dashboard.summary.startPlanning'), hasData: hasDataFlag };
                        case "growth":
                          const growthItems = [];
                          if (stats.growth.photosCount > 0) { growthItems.push(`${stats.growth.photosCount} ${t('dashboard.summary.photos')}`); }
                          if (stats.growth.lastMeasurement) { growthItems.push(stats.growth.lastMeasurement); }
                          hasDataFlag = growthItems.length > 0;
                          return { text: hasDataFlag ? growthItems.join(" • ") : t('dashboard.summary.trackGrowth'), hasData: hasDataFlag };
                        case "postpartum":
                          const postItems = [];
                          if (stats.postpartum.sleepHoursToday > 0) { postItems.push(`${stats.postpartum.sleepHoursToday}h ${t('dashboard.summary.sleep')}`); }
                          if (stats.postpartum.diapersToday > 0) { postItems.push(`${stats.postpartum.diapersToday} ${t('dashboard.summary.diapers')}`); }
                          if (stats.postpartum.groceryItems > 0) { postItems.push(`${stats.postpartum.groceryItems} ${t('dashboard.summary.items')}`); }
                          hasDataFlag = postItems.length > 0;
                          return { text: hasDataFlag ? postItems.join(" • ") : t('dashboard.summary.readyForBaby'), hasData: hasDataFlag };
                        default:
                          return { text: "", hasData: false };
                      }
                    };

                    const { text: summary, hasData } = getCategorySummary();

                    return (
                    <motion.div
                      key={category.categoryKey}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: catIndex * 0.05 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <category.icon className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                            {t(`dashboard.categories.${category.categoryKey}`)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {hasData && <CheckCircle2 className="w-2.5 h-2.5 text-primary" />}
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                            hasData 
                              ? 'bg-primary/10 text-primary' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {summary}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {category.tools.map((tool, toolIndex) => (
                          <Link
                            key={tool.id}
                            to={tool.href}
                            className="group"
                          >
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: (catIndex * 3 + toolIndex) * 0.02 }}
                              className="flex flex-col items-center p-2 rounded-lg bg-muted/30 hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20"
                            >
                              <div className="w-7 h-7 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mb-1 transition-colors">
                                <tool.icon className="w-3.5 h-3.5 text-primary" strokeWidth={1.75} />
                              </div>
                              <span className="text-[10px] font-medium text-foreground text-center leading-tight">
                                {t(`dashboard.trackingTools.${tool.titleKey}`)}
                              </span>
                              {toolSummaries[tool.id] && (
                                <span className="text-[9px] font-semibold text-primary mt-0.5 bg-primary/10 px-1.5 py-0.5 rounded-full leading-none">
                                  {toolSummaries[tool.id]}
                                </span>
                              )}
                            </motion.div>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* 5. AI Tools - Smart Links (no duplicates with other tabs/CTAs) */}
            <Card className="overflow-hidden rounded-3xl card-pink-top">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  {t('dashboard.aiTools')}
                </h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { title: t('dashboard.aiToolsList.symptoms'),    icon: Stethoscope,  href: "/tools/wellness-diary" },
                    { title: t('dashboard.aiToolsList.weekly'),      icon: Sparkles,     href: "/tools/weekly-summary" },
                    { title: t('dashboard.aiToolsList.mealPlan'),    icon: Salad,        href: "/tools/ai-meal-suggestion" },
                    { title: t('dashboard.aiToolsList.fitness'),     icon: Dumbbell,     href: "/tools/ai-fitness-coach" },
                  ].map((link, i) => (
                    <Link
                      key={i}
                      to={link.href}
                      className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30 hover:bg-primary/10 transition-colors group"
                    >
                      <div className="w-6 h-6 rounded-md bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                        <link.icon className="w-3 h-3 text-primary" strokeWidth={1.75} />
                      </div>
                      <span className="text-xs font-medium">{link.title}</span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Chat Tab */}
        {activeTab === "chat" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="overflow-hidden rounded-3xl">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 border-b border-border">
                  <h2 className="text-base font-bold flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary" />
                    {t('dashboard.chat.title')}
                  </h2>
                </div>

                <ScrollArea className="h-[350px]" ref={scrollRef}>
                  <div className="p-4 space-y-3">
                    {messages.length === 1 && (
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {quickQuestionKeys.map((q, i) => (
                          <button
                            key={i}
                            onClick={() => sendMessage(t(`dashboard.chat.quickQuestions.${q.key}`))}
                            className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                          >
                            <div className={`p-1.5 rounded-md bg-gradient-to-br ${q.color}`}>
                              <q.icon className="w-3 h-3 text-primary-foreground" />
                            </div>
                            <span className="text-xs font-medium">{t(`dashboard.chat.quickQuestions.${q.key}`)}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <AnimatePresence mode="popLayout">
                      {messages.map((msg, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            msg.role === "user"
                              ? "bg-gradient-to-br from-primary to-primary/70"
                              : "bg-muted"
                          }`}>
                            {msg.role === "user" ? (
                              <User className="w-3.5 h-3.5 text-primary-foreground" />
                            ) : (
                              <Bot className="w-3.5 h-3.5 text-foreground" />
                            )}
                          </div>
                          <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                            msg.role === "user"
                              ? "bg-gradient-to-br from-primary to-primary/70 text-primary-foreground rounded-tr-sm"
                              : "bg-muted rounded-tl-sm"
                          }`}>
                            {msg.role === "assistant" ? (
                              <MarkdownRenderer content={msg.content} accentColor="primary" />
                            ) : (
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {isLoading && messages[messages.length - 1]?.role === "user" && (
                      <div className="flex gap-2">
                        <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                        <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                          <div className="flex gap-1">
                            {[0, 1, 2].map(i => (
                              <motion.div
                                key={i}
                                className="w-1.5 h-1.5 rounded-full bg-primary"
                                animate={{ y: [0, -4, 0] }}
                                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {error && (
                  <div className="px-4 pb-2">
                    <div className="p-2 rounded-lg bg-destructive/10 text-destructive text-xs">
                      {error}
                    </div>
                  </div>
                )}

                <div className="p-3 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder={t('dashboard.chat.placeholder')}
                      className="text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage(userInput);
                        }
                      }}
                    />
                    <Button
                      onClick={() => sendMessage(userInput)}
                      disabled={!userInput.trim() || isLoading}
                      size="icon"
                      className="shrink-0"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Health Tab - Daily check-in only (week/weight managed in Settings > Profile) */}
        {activeTab === "health" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Profile Summary Strip */}
            <motion.div 
              className="flex items-center gap-2 px-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex-1 flex gap-2">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-2 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl px-3.5 py-2.5 border border-primary/15 flex-1 shadow-sm"
                >
                  <div className="p-1.5 rounded-lg bg-primary/15">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <span className="text-lg font-bold text-primary leading-none">{healthData.weekOfPregnancy || '—'}</span>
                    <span className="text-[10px] text-muted-foreground block leading-none mt-0.5">{t('dashboard.health.weekOfPregnancy')}</span>
                  </div>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-2 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl px-3.5 py-2.5 border border-primary/15 flex-1 shadow-sm"
                >
                  <div className="p-1.5 rounded-lg bg-primary/15">
                    <Scale className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <span className="text-lg font-bold text-primary leading-none">{healthData.weight || '—'}<span className="text-[10px] font-normal"> kg</span></span>
                    <span className="text-[10px] text-muted-foreground block leading-none mt-0.5">{t('dashboard.health.weightKg')}</span>
                  </div>
                </motion.div>
              </div>
              <Link to="/settings" className="p-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors shadow-sm border border-border/40">
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </motion.div>

            {/* Daily Health Check-in Card */}
            <Card className="rounded-3xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-3 border-b border-border/50">
                <h2 className="text-sm font-bold flex items-center gap-2">
                  <Heart className="w-4 h-4 text-primary" />
                  {t('dashboard.health.title')}
                </h2>
                {healthData.savedAt && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {t('dashboard.health.lastSaved', { time: new Date(healthData.savedAt).toLocaleTimeString(currentLanguage === 'ar' ? 'ar-SA' : undefined, { hour: '2-digit', minute: '2-digit' }) })}
                  </p>
                )}
              </div>
              <CardContent className="p-4 space-y-4">
                {/* Blood Pressure & Mood Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('dashboard.health.bloodPressure')}</label>
                    <Input
                      placeholder="120/80"
                      value={healthData.bloodPressure}
                      onChange={(e) => setHealthData(prev => ({ ...prev, bloodPressure: e.target.value }))}
                      className="text-sm h-10"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('dashboard.health.mood')}</label>
                    <div className="flex gap-1.5">
                      {[
                        { value: "Excellent", emoji: "😄" },
                        { value: "Good", emoji: "🙂" },
                        { value: "Normal", emoji: "😐" },
                        { value: "Anxious", emoji: "😰" },
                        { value: "Bad", emoji: "😞" },
                      ].map(m => (
                        <motion.button
                          key={m.value}
                          whileTap={{ scale: 0.9 }}
                          animate={healthData.mood === m.value ? { scale: 1.15 } : { scale: 1 }}
                          onClick={() => setHealthData(prev => ({ ...prev, mood: m.value }))}
                          className={`flex-1 h-10 rounded-xl text-lg transition-all ${
                            healthData.mood === m.value
                              ? "bg-primary/15 border-2 border-primary shadow-md shadow-primary/10"
                              : "bg-muted/40 border border-transparent hover:bg-muted/70"
                          }`}
                          title={t(`dashboard.health.moods.${m.value.toLowerCase()}`)}
                        >
                          {m.emoji}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Symptoms */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">
                    {t('dashboard.health.todaysSymptoms')}
                    {healthData.symptoms.length > 0 && (
                      <span className="ms-2 text-primary font-bold">({healthData.symptoms.length})</span>
                    )}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {symptomKeys.map(symptomKey => {
                      const isActive = healthData.symptoms.includes(symptomKey);
                      return (
                        <motion.button
                          key={symptomKey}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => {
                            setHealthData(prev => ({
                              ...prev,
                              symptoms: isActive
                                ? prev.symptoms.filter(s => s !== symptomKey)
                                : [...prev.symptoms, symptomKey]
                            }));
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            isActive
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "bg-muted/50 text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {isActive && <span className="me-1">✓</span>}
                          {t(`dashboard.health.symptoms.${symptomKey}`)}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Save Button */}
                <motion.div whileTap={{ scale: 0.98 }}>
                  <Button 
                    className="w-full h-11 text-sm font-bold" 
                    disabled={isLoading && healthSaved}
                    onClick={() => {
                      const now = new Date().toISOString();
                      const updatedHealth = { ...healthData, savedAt: now };
                      setHealthData(updatedHealth);
                      setHealthSaved(true);
                      
                      // Save to localStorage
                      safeSaveToLocalStorage("dashboard_health_checkin_v1", updatedHealth);
                      
                      // Save mood to central profile
                      updateUserProfile({ mood: healthData.mood });
                      
                      toast.success(t('dashboard.health.savedSuccess', 'تم حفظ بياناتك الصحية بنجاح'));
                      
                      // Generate AI health insight
                      setAiHealthInsight('');
                      const symptomsList = healthData.symptoms.map(s => t(`dashboard.health.symptoms.${s}`)).join(', ');
                      const prompt = t('dashboard.health.aiPrompt', {
                        week: healthData.weekOfPregnancy,
                        weight: healthData.weight || 'N/A',
                        bp: healthData.bloodPressure || 'N/A',
                        mood: t(`dashboard.health.moods.${healthData.mood.toLowerCase()}`),
                        symptoms: symptomsList || t('dashboard.health.noSymptoms')
                      });
                      streamChat({
                        type: 'pregnancy-assistant',
                        messages: [{ role: 'user', content: prompt }],
                        context: { week: healthData.weekOfPregnancy, language: currentLanguage },
                        onDelta: (text) => setAiHealthInsight(prev => prev + text),
                        onDone: () => {},
                      });
                    }}
                  >
                    {isLoading && healthSaved ? (
                      <Loader2 className="w-4 h-4 me-2 animate-spin" />
                    ) : (
                      <Activity className="w-4 h-4 me-2" />
                    )}
                    {t('dashboard.health.saveAnalyze')}
                  </Button>
                </motion.div>
              </CardContent>
            </Card>

            {/* AI Analysis - Only show after saving */}
            {(aiHealthInsight || (isLoading && healthSaved)) && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="rounded-3xl bg-gradient-to-br from-primary/5 to-transparent border-primary/15">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded-lg bg-primary/10">
                        <Sparkles className="w-4 h-4 text-primary" />
                      </div>
                      <h3 className="text-sm font-bold">{t('dashboard.health.aiAnalysisLabel')}</h3>
                    </div>
                    {isLoading && !aiHealthInsight ? (
                      <div className="flex items-center gap-2 text-muted-foreground py-4 justify-center">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-xs">{t('toolsInternal.aiInsights.analyzing')}</span>
                      </div>
                    ) : (
                      <div className="text-sm">
                        <MarkdownRenderer content={aiHealthInsight} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Static Analysis - Quick Health Summary */}
            {!healthSaved && (
              <div className="space-y-1.5">
                {getHealthAnalysis().map((item, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-muted/30 text-sm">
                    <Activity className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Links to Health Tools */}
            <div className="grid grid-cols-2 gap-2">
              <Link to="/tools/wellness-diary" className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 hover:bg-primary/10 transition-colors">
                <Stethoscope className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium">{t('dashboard.aiToolsList.symptoms')}</span>
              </Link>
              <Link to="/tools/weight-gain" className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 hover:bg-primary/10 transition-colors">
                <Scale className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium">{t('dashboard.trackingTools.weightTracker')}</span>
              </Link>
            </div>
          </motion.div>
        )}

        {/* Nutrition Tab */}
        {activeTab === "nutrition" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="rounded-3xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-3 border-b border-border/30">
                <h2 className="text-base font-bold flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-primary" />
                  {t('dashboard.nutrition.title')}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t('dashboard.nutrition.planForWeek', { week: healthData.weekOfPregnancy })}
                </p>
              </div>
              <CardContent className="p-4">
                <div className="space-y-2.5">
                  {nutritionKeys.map((meal, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-3 p-3.5 bg-gradient-to-r from-primary/5 to-transparent rounded-2xl border border-border/30 hover:border-primary/20 hover:shadow-sm transition-all"
                    >
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center shadow-sm">
                        <Salad className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-foreground">{t(`dashboard.nutrition.meals.${meal.key}`)}</h3>
                        <p className="text-xs text-muted-foreground truncate">{t(`dashboard.nutrition.meals.${meal.key}Suggestion`)}</p>
                      </div>
                      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-2.5 py-1 rounded-full text-xs font-bold shrink-0 shadow-sm">
                        {meal.calories} cal
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div 
                  className="mt-4 p-3.5 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl text-center border border-primary/15"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-sm font-bold text-foreground">
                    {t('dashboard.nutrition.totalCalories', { calories: nutritionKeys.reduce((a, b) => a + b.calories, 0) })}
                  </p>
                </motion.div>

                <Link to="/tools/ai-meal-suggestion">
                  <Button className="w-full mt-4 rounded-xl h-11" variant="outline">
                    <Sparkles className="w-4 h-4 me-2 text-primary" />
                    {t('dashboard.nutrition.moreAiSuggestions')}
                    <ChevronRight className="w-4 h-4 ms-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Exercise Tab */}
        {activeTab === "exercise" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="rounded-3xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-3 border-b border-border/30">
                <h2 className="text-base font-bold flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-primary" />
                  {t('dashboard.exercise.title')}
                </h2>
              </div>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {exerciseKeys.map((ex, i) => (
                    <Link key={i} to={ex.href}>
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-gradient-to-r from-primary/5 to-transparent border border-border/30 hover:border-primary/20 hover:shadow-md transition-all"
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-sm">
                          <Activity className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-foreground">{t(`dashboard.exercise.exercises.${ex.key}`)}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">{t(`dashboard.exercise.exercises.${ex.key}Duration`)}</p>
                          <p className="text-[10px] text-primary font-medium mt-0.5">{t(`dashboard.exercise.exercises.${ex.key}Benefit`)}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                      </motion.div>
                    </Link>
                  ))}
                </div>

                <Link to="/tools/ai-fitness-coach">
                  <Button className="w-full mt-4 rounded-xl h-11" variant="outline">
                    <Sparkles className="w-4 h-4 me-2 text-primary" />
                    {t('dashboard.exercise.moreExercises')}
                    <ChevronRight className="w-4 h-4 ms-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Videos Tab */}
        {activeTab === "videos" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <VideoLibrary
              videosByLang={generalVideosByLang}
              title={t('dashboard.videos.title')}
              subtitle={t('dashboard.videos.subtitle', 'Curated educational content')}
            />

            <Link to="/videos">
              <Button className="w-full" variant="outline">
                {t('dashboard.videos.fullLibrary')}
                <ChevronRight className="w-4 h-4 ms-2" />
              </Button>
            </Link>
          </motion.div>
        )}
        {/* Professional Animated Divider */}
        <motion.div 
          className="relative my-8 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <motion.div 
            className="absolute inset-0 flex items-center"
            aria-hidden="true"
          >
            <div className="w-full border-t border-border/40" />
          </motion.div>
          <motion.div 
            className="relative flex items-center gap-3"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5, type: "spring" }}
          >
            <motion.div 
              className="h-[2px] w-12 rounded-full bg-gradient-to-r from-transparent to-primary/60"
              initial={{ width: 0 }}
              animate={{ width: 48 }}
              transition={{ delay: 0.9, duration: 0.6, ease: "easeOut" }}
            />
            <motion.div
              className="h-2 w-2 rounded-full bg-primary/50"
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="h-1.5 w-1.5 rounded-full bg-primary/70"
              animate={{ 
                scale: [1, 1.4, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            />
            <motion.div
              className="h-3 w-3 rounded-full bg-gradient-to-br from-primary to-accent shadow-sm shadow-primary/20"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="h-1.5 w-1.5 rounded-full bg-primary/70"
              animate={{ 
                scale: [1, 1.4, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            />
            <motion.div
              className="h-2 w-2 rounded-full bg-primary/50"
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
            />
            <motion.div 
              className="h-[2px] w-12 rounded-full bg-gradient-to-l from-transparent to-primary/60"
              initial={{ width: 0 }}
              animate={{ width: 48 }}
              transition={{ delay: 0.9, duration: 0.6, ease: "easeOut" }}
            />
          </motion.div>
        </motion.div>

      </main>
    </Layout>
  );
};

export default SmartDashboard;
