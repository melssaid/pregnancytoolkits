import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Bot, User, Home, MessageCircle, Heart, Utensils, Dumbbell, 
  Play, Loader2, AlertTriangle, Activity, Scale, Brain, Sparkles,
  Baby, Pill, Stethoscope, Salad, ChevronRight, CalendarCheck,
  Hand, TrendingUp, Camera, Bell, Moon, Ruler, FileText,
  Database, Clock, Calendar, Briefcase, ShoppingCart
} from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Link, useNavigate } from "react-router-dom";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { QuickStats } from "@/components/dashboard/QuickStats";

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
}

// أدوات التتبع والتخزين - مرتبة منطقياً
const trackingTools = [
  // قسم التتبع اليومي
  { 
    category: "Daily Tracking",
    icon: Clock,
    tools: [
      { id: "kick-counter", title: "Kick Counter", icon: Hand, href: "/tools/kick-counter", description: "Track baby movements" },
      { id: "weight-gain", title: "Weight Tracker", icon: Scale, href: "/tools/weight-gain", description: "Monitor weight gain" },
      { id: "vitamin-tracker", title: "Vitamin Tracker", icon: Pill, href: "/tools/vitamin-tracker", description: "Daily supplements" },
    ]
  },
  // قسم التخطيط
  { 
    category: "Planning",
    icon: Calendar,
    tools: [
      { id: "smart-appointment", title: "Appointments", icon: Bell, href: "/tools/smart-appointment-reminder", description: "Medical visits" },
      { id: "birth-plan", title: "Birth Plan", icon: FileText, href: "/tools/ai-birth-plan", description: "Delivery preferences" },
      { id: "hospital-bag", title: "Hospital Bag", icon: Briefcase, href: "/tools/ai-hospital-bag", description: "Packing checklist" },
    ]
  },
  // قسم التطور
  { 
    category: "Growth",
    icon: TrendingUp,
    tools: [
      { id: "fetal-growth", title: "Fetal Growth", icon: TrendingUp, href: "/tools/fetal-growth", description: "Baby development" },
      { id: "baby-growth", title: "Baby Growth", icon: Ruler, href: "/tools/baby-growth", description: "Postnatal tracking" },
      { id: "bump-photos", title: "Bump Photos", icon: Camera, href: "/tools/ai-bump-photos", description: "Weekly snapshots" },
    ]
  },
  // قسم ما بعد الولادة
  { 
    category: "Postpartum",
    icon: Baby,
    tools: [
      { id: "baby-sleep", title: "Baby Sleep", icon: Moon, href: "/tools/baby-sleep-tracker", description: "Sleep patterns" },
      { id: "diaper-tracker", title: "Diaper Tracker", icon: Baby, href: "/tools/diaper-tracker", description: "Daily changes" },
      { id: "grocery-list", title: "Grocery List", icon: ShoppingCart, href: "/tools/smart-grocery-list", description: "Shopping planner" },
    ]
  },
];

const quickQuestions = [
  { icon: Baby, text: "First trimester symptoms?", color: "from-primary to-pink-500" },
  { icon: Pill, text: "Is coffee safe?", color: "from-amber-500 to-orange-500" },
  { icon: Stethoscope, text: "Labor preparation?", color: "from-blue-500 to-indigo-500" },
  { icon: Salad, text: "Important vitamins?", color: "from-emerald-500 to-green-500" },
];

const nutritionPlan = [
  { meal: "Breakfast", suggestion: "Boiled eggs + whole wheat bread + fresh orange juice", calories: 350 },
  { meal: "Lunch", suggestion: "Grilled chicken + rice + green salad", calories: 550 },
  { meal: "Dinner", suggestion: "Grilled fish + sautéed vegetables + yogurt", calories: 400 },
  { meal: "Snacks", suggestion: "Fruits + nuts + milk", calories: 200 },
];

const exercises = [
  { name: "Walking", duration: "30 min", benefit: "Improves circulation", href: "/tools/smart-walking-coach" },
  { name: "Swimming", duration: "20 min", benefit: "Relieves back pain", href: "/tools/exercise-guide" },
  { name: "Prenatal Yoga", duration: "25 min", benefit: "Reduces stress", href: "/tools/smart-stretch-reminder" },
  { name: "Kegel Exercises", duration: "10 min", benefit: "Strengthens pelvic floor", href: "/tools/exercise-guide" },
];

const videos = [
  { id: 1, youtubeId: "j5qY8c7BKmg", title: "Prenatal Yoga Exercises" },
  { id: 2, youtubeId: "ixPsILYT0Yc", title: "Healthy Pregnancy Recipes" },
  { id: 3, youtubeId: "UCDkZ_NUEBI", title: "Pregnancy Health Tips" },
];

const symptoms = ["Nausea", "Headache", "Fatigue", "Back pain", "Swelling", "Heartburn", "Insomnia"];

const SmartDashboard = () => {
  const { streamChat, isLoading, error } = usePregnancyAI();
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your smart pregnancy assistant. How can I help you today?" }
  ]);
  const [userInput, setUserInput] = useState("");
  const [healthData, setHealthData] = useState<HealthData>({
    weight: "",
    bloodPressure: "",
    mood: "Good",
    symptoms: [],
    weekOfPregnancy: 20
  });
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
      analysis.push(`Expected weight gain so far: ~${expectedGain} kg`);
    }
    
    if (bloodPressure) {
      const [systolic] = bloodPressure.split("/").map(Number);
      if (systolic > 140) {
        analysis.push("Blood pressure is high - consult your doctor");
      } else if (systolic < 90) {
        analysis.push("Blood pressure is low - increase fluids and rest");
      } else if (!isNaN(systolic)) {
        analysis.push("Blood pressure is normal");
      }
    }

    if (mood === "Bad" || mood === "Anxious") {
      analysis.push("Mental support is important - talk to someone you trust");
    }

    if (healthData.symptoms.length > 0) {
      analysis.push(`Recorded symptoms: ${healthData.symptoms.join(", ")}`);
    }

    return analysis.length > 0 ? analysis : ["Enter your data for smart analysis"];
  };

  const tabs = [
    { id: "home" as TabType, icon: Home, label: "Home" },
    { id: "chat" as TabType, icon: MessageCircle, label: "AI Chat" },
    { id: "health" as TabType, icon: Heart, label: "Health" },
    { id: "nutrition" as TabType, icon: Utensils, label: "Nutrition" },
    { id: "exercise" as TabType, icon: Dumbbell, label: "Exercise" },
    { id: "videos" as TabType, icon: Play, label: "Videos" },
  ];

  return (
    <Layout>
      {/* Navigation Tabs */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container">
          <div className="flex gap-1 py-2 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="container py-4 space-y-4">
        {/* Disclaimer */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 p-3 rounded-xl text-center text-xs font-medium flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          This app is for educational purposes only and does not replace medical advice
        </div>

        {/* Home Tab - Enhanced with Progress Ring */}
        {activeTab === "home" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Progress Ring Section */}
            <Card className="overflow-hidden bg-gradient-to-br from-card to-muted/20">
              <CardContent className="p-6 flex flex-col items-center">
                <ProgressRing 
                  currentWeek={healthData.weekOfPregnancy} 
                  totalWeeks={40}
                />
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <QuickStats 
              weight={parseFloat(healthData.weight) || 0}
              kicks={0}
              mood={healthData.mood}
              waterGlasses={0}
              nextAppointment="Check appointments"
            />

            {/* Quick Actions */}
            <Card className="overflow-hidden">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => navigate("/tools/smart-plan")}
                    className="col-span-2 flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-purple-500/10 hover:from-primary/20 hover:to-purple-500/20 transition-all group border border-primary/20"
                  >
                    <div className="p-2 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
                      <CalendarCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-bold text-foreground block">Smart Plan</span>
                      <span className="text-xs text-muted-foreground">My Daily Plan & PDF Report</span>
                    </div>
                  </motion.button>

                  {[
                    { icon: Bot, title: "AI Chat", tab: "chat" as TabType },
                    { icon: Activity, title: "Health", tab: "health" as TabType },
                    { icon: Utensils, title: "Nutrition", tab: "nutrition" as TabType },
                    { icon: Dumbbell, title: "Exercise", tab: "exercise" as TabType },
                  ].map((feature, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * i }}
                      onClick={() => setActiveTab(feature.tab)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-primary/10 transition-all group"
                    >
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <feature.icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{feature.title}</span>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Data Tracking Tools - Advanced Section */}
            <Card className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Database className="w-4 h-4 text-primary" />
                    My Tracking Data
                  </h3>
                  <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {trackingTools.reduce((acc, cat) => acc + cat.tools.length, 0)} tools
                  </span>
                </div>
                
                <div className="space-y-4">
                  {trackingTools.map((category, catIndex) => (
                    <motion.div
                      key={category.category}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: catIndex * 0.05 }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <category.icon className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                          {category.category}
                        </span>
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
                                {tool.title}
                              </span>
                            </motion.div>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Tools Links */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  AI-Powered Tools
                </h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { title: "Smart Plan", icon: CalendarCheck, href: "/tools/smart-plan" },
                    { title: "AI Assistant", icon: Bot, href: "/tools/pregnancy-assistant" },
                    { title: "Symptoms", icon: Stethoscope, href: "/tools/symptom-analyzer" },
                    { title: "Weekly", icon: Sparkles, href: "/tools/weekly-summary" },
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
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 border-b border-border">
                  <h2 className="text-base font-bold flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary" />
                    AI Pregnancy Assistant
                  </h2>
                </div>

                <ScrollArea className="h-[350px]" ref={scrollRef}>
                  <div className="p-4 space-y-3">
                    {messages.length === 1 && (
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {quickQuestions.map((q, i) => (
                          <button
                            key={i}
                            onClick={() => sendMessage(q.text)}
                            className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                          >
                            <div className={`p-1.5 rounded-md bg-gradient-to-br ${q.color}`}>
                              <q.icon className="w-3 h-3 text-primary-foreground" />
                            </div>
                            <span className="text-xs font-medium">{q.text}</span>
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
                              ? "bg-gradient-to-br from-primary to-accent"
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
                              ? "bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-tr-sm"
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
                      placeholder="Type your question..."
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

        {/* Health Tab */}
        {activeTab === "health" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card>
              <CardContent className="p-4">
                <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  AI Health Tracking
                </h2>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Week of Pregnancy</label>
                    <Input
                      type="number"
                      min="1"
                      max="42"
                      value={healthData.weekOfPregnancy}
                      onChange={(e) => setHealthData({ ...healthData, weekOfPregnancy: parseInt(e.target.value) || 1 })}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Weight (kg)</label>
                    <Input
                      type="number"
                      placeholder="65"
                      value={healthData.weight}
                      onChange={(e) => setHealthData({ ...healthData, weight: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Blood Pressure</label>
                    <Input
                      placeholder="120/80"
                      value={healthData.bloodPressure}
                      onChange={(e) => setHealthData({ ...healthData, bloodPressure: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Mood</label>
                    <select
                      value={healthData.mood}
                      onChange={(e) => setHealthData({ ...healthData, mood: e.target.value })}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option>Excellent</option>
                      <option>Good</option>
                      <option>Normal</option>
                      <option>Anxious</option>
                      <option>Bad</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Today's Symptoms</label>
                  <div className="flex flex-wrap gap-2">
                    {symptoms.map(symptom => (
                      <button
                        key={symptom}
                        onClick={() => {
                          if (healthData.symptoms.includes(symptom)) {
                            setHealthData({ ...healthData, symptoms: healthData.symptoms.filter(s => s !== symptom) });
                          } else {
                            setHealthData({ ...healthData, symptoms: [...healthData.symptoms, symptom] });
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          healthData.symptoms.includes(symptom)
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {symptom}
                      </button>
                    ))}
                  </div>
                </div>

                <Button className="w-full" onClick={() => {}}>
                  <Scale className="w-4 h-4 mr-2" />
                  Save & Analyze
                </Button>
              </CardContent>
            </Card>

            {/* AI Analysis */}
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="p-4">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  Smart Analysis
                </h3>
                <div className="space-y-2">
                  {getHealthAnalysis().map((item, i) => (
                    <div key={i} className="bg-background p-3 rounded-lg text-sm">
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Nutrition Tab */}
        {activeTab === "nutrition" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="p-4">
                <h2 className="text-base font-bold mb-1 flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-primary" />
                  Smart Nutrition Plan
                </h2>
                <p className="text-xs text-muted-foreground mb-4">
                  Customized plan for week {healthData.weekOfPregnancy} of pregnancy
                </p>

                <div className="space-y-3">
                  {nutritionPlan.map((meal, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Salad className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-foreground">{meal.meal}</h3>
                        <p className="text-xs text-muted-foreground truncate">{meal.suggestion}</p>
                      </div>
                      <div className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-bold shrink-0">
                        {meal.calories} cal
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-primary/10 rounded-xl text-center">
                  <p className="text-sm font-semibold text-foreground">
                    Total Daily Calories: {nutritionPlan.reduce((a, b) => a + b.calories, 0)} cal
                  </p>
                </div>

                <Link to="/tools/ai-meal-suggestion">
                  <Button className="w-full mt-4" variant="outline">
                    More AI Suggestions
                    <ChevronRight className="w-4 h-4 ml-2" />
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
            <Card>
              <CardContent className="p-4">
                <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-primary" />
                  Safe Pregnancy Exercises
                </h2>

                <div className="grid grid-cols-2 gap-3">
                  {exercises.map((ex, i) => (
                    <Link key={i} to={ex.href}>
                      <div className="bg-primary/5 hover:bg-primary/10 p-4 rounded-xl text-center transition-all">
                        <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                          <Activity className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">{ex.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{ex.duration}</p>
                        <p className="text-[10px] text-primary mt-1">{ex.benefit}</p>
                      </div>
                    </Link>
                  ))}
                </div>

                <Link to="/tools/exercise-guide">
                  <Button className="w-full mt-4" variant="outline">
                    More Exercises
                    <ChevronRight className="w-4 h-4 ml-2" />
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
          >
            <Card>
              <CardContent className="p-4">
                <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                  <Play className="w-5 h-5 text-primary" />
                  Educational Videos
                </h2>

                <div className="space-y-4">
                  {videos.map((video) => (
                    <div key={video.id} className="rounded-xl overflow-hidden bg-muted/30">
                      {playingVideo === video.youtubeId ? (
                        <AspectRatio ratio={16 / 9}>
                          <iframe
                            src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
                            title={video.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full rounded-xl"
                          />
                        </AspectRatio>
                      ) : (
                        <button
                          onClick={() => setPlayingVideo(video.youtubeId)}
                          className="w-full relative group"
                        >
                          <AspectRatio ratio={16 / 9}>
                            <img
                              src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                              alt={video.title}
                              className="w-full h-full object-cover rounded-xl"
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors rounded-xl">
                              <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Play className="w-8 h-8 text-primary-foreground fill-primary-foreground" />
                              </div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent rounded-b-xl">
                              <p className="text-primary-foreground text-sm font-medium">{video.title}</p>
                            </div>
                          </AspectRatio>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <Link to="/videos">
                  <Button className="w-full mt-4" variant="outline">
                    Full Library
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </Layout>
  );
};

export default SmartDashboard;
