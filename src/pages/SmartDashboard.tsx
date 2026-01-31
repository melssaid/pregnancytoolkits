import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Bot, User, Home, MessageCircle, Heart, Utensils, Dumbbell, 
  Play, Loader2, AlertTriangle, Activity, Scale, Brain, Sparkles,
  Baby, Pill, Stethoscope, Salad, ChevronRight, Waves
} from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Link } from "react-router-dom";

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

        {/* Home Tab */}
        {activeTab === "home" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Creative Hero Icon */}
            <div className="flex flex-col items-center py-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="relative"
              >
                {/* Outer glow ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-xl scale-150" />
                
                {/* Animated rings */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary/30"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  style={{ originX: 0.5, originY: 0.5 }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-accent/30"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  style={{ originX: 0.5, originY: 0.5 }}
                />
                
                {/* Main icon container */}
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-2xl shadow-primary/30">
                  <div className="absolute inset-1 rounded-full bg-background/10 backdrop-blur-sm" />
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Baby className="w-12 h-12 text-primary-foreground relative z-10" />
                  </motion.div>
                </div>

                {/* Floating decorative elements */}
                <motion.div
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-lg"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Heart className="w-3 h-3 text-white" />
                </motion.div>
                <motion.div
                  className="absolute -bottom-1 -left-2 w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg"
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                >
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-5 text-center"
              >
                <h1 className="text-xl font-bold text-foreground">Smart Pregnancy Dashboard</h1>
                <p className="text-sm text-muted-foreground mt-1">AI-Powered Companion</p>
              </motion.div>
            </div>

            <Card className="overflow-hidden">
              <CardContent className="p-5">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Bot, title: "AI Assistant", desc: "Ask any pregnancy question", tab: "chat" as TabType },
                    { icon: Activity, title: "Health Analysis", desc: "Track your health data", tab: "health" as TabType },
                    { icon: Utensils, title: "Meal Plans", desc: "Customized nutrition", tab: "nutrition" as TabType },
                    { icon: Dumbbell, title: "Safe Exercises", desc: "Pregnancy-safe workouts", tab: "exercise" as TabType },
                  ].map((feature, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i }}
                      onClick={() => setActiveTab(feature.tab)}
                      className="bg-primary/5 hover:bg-primary/10 p-4 rounded-xl text-center transition-all group"
                    >
                      <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <feature.icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
                      <p className="text-[10px] text-muted-foreground mt-1">{feature.desc}</p>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  AI-Powered Tools
                </h3>
                <div className="space-y-2">
                  {[
                    { title: "AI Assistant", href: "/tools/pregnancy-assistant" },
                    { title: "Symptom Analyzer", href: "/tools/symptom-analyzer" },
                    { title: "Meal Suggestions", href: "/tools/ai-meal-suggestion" },
                    { title: "Weekly Summary", href: "/tools/weekly-summary" },
                  ].map((link, i) => (
                    <Link
                      key={i}
                      to={link.href}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm font-medium">{link.title}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
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
