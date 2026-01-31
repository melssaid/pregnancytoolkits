import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Bot, User, Home, MessageCircle, Heart, Utensils, Dumbbell, 
  Play, Loader2, AlertTriangle, Activity, Scale, Brain, Sparkles,
  Baby, Coffee, Stethoscope, Apple, ChevronRight
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
  { icon: Baby, text: "أعراض الشهر الأول؟", color: "from-primary to-pink-500" },
  { icon: Coffee, text: "هل القهوة آمنة؟", color: "from-amber-500 to-orange-500" },
  { icon: Stethoscope, text: "التحضير للولادة؟", color: "from-blue-500 to-indigo-500" },
  { icon: Apple, text: "الفيتامينات المهمة؟", color: "from-emerald-500 to-green-500" },
];

const nutritionPlan = [
  { meal: "الفطور", suggestion: "بيض مسلوق + خبز أسمر + عصير برتقال طازج", calories: 350, icon: "🍳" },
  { meal: "الغداء", suggestion: "دجاج مشوي + أرز + سلطة خضراء", calories: 550, icon: "🍗" },
  { meal: "العشاء", suggestion: "سمك مشوي + خضار سوتيه + زبادي", calories: 400, icon: "🐟" },
  { meal: "وجبات خفيفة", suggestion: "فواكه + مكسرات + حليب", calories: 200, icon: "🥜" },
];

const exercises = [
  { name: "المشي", duration: "30 دقيقة", icon: "🚶‍♀️", benefit: "يحسن الدورة الدموية", href: "/tools/smart-walking-coach" },
  { name: "السباحة", duration: "20 دقيقة", icon: "🏊‍♀️", benefit: "يخفف آلام الظهر", href: "/tools/exercise-guide" },
  { name: "يوغا الحمل", duration: "25 دقيقة", icon: "🧘‍♀️", benefit: "يقلل التوتر", href: "/tools/smart-stretch-reminder" },
  { name: "تمارين كيجل", duration: "10 دقائق", icon: "💪", benefit: "يقوي عضلات الحوض", href: "/tools/exercise-guide" },
];

const videos = [
  { id: 1, youtubeId: "j5qY8c7BKmg", title: "تمارين يوغا للحامل" },
  { id: 2, youtubeId: "ixPsILYT0Yc", title: "وصفات صحية للحمل" },
  { id: 3, youtubeId: "UCDkZ_NUEBI", title: "نصائح الحمل الصحي" },
];

const symptoms = ["غثيان", "صداع", "تعب", "ألم ظهر", "تورم", "حرقة معدة", "أرق"];

const SmartDashboard = () => {
  const { streamChat, isLoading, error } = usePregnancyAI();
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "مرحباً! أنا مساعدتك الذكية للحمل. كيف يمكنني مساعدتك اليوم؟ 🤰" }
  ]);
  const [userInput, setUserInput] = useState("");
  const [healthData, setHealthData] = useState<HealthData>({
    weight: "",
    bloodPressure: "",
    mood: "جيد",
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
      analysis.push(`📊 الوزن المتوقع زيادته حتى الآن: ~${expectedGain} كجم`);
    }
    
    if (bloodPressure) {
      const [systolic] = bloodPressure.split("/").map(Number);
      if (systolic > 140) {
        analysis.push("⚠️ ضغط الدم مرتفع - يُنصح بمراجعة الطبيب");
      } else if (systolic < 90) {
        analysis.push("💡 ضغط الدم منخفض - أكثري من السوائل والراحة");
      } else if (!isNaN(systolic)) {
        analysis.push("✅ ضغط الدم طبيعي");
      }
    }

    if (mood === "سيء" || mood === "قلقة") {
      analysis.push("💜 الدعم النفسي مهم - تحدثي مع شخص تثقين به أو متخصص");
    }

    if (healthData.symptoms.length > 0) {
      analysis.push(`🩺 الأعراض المسجلة: ${healthData.symptoms.join("، ")}`);
    }

    return analysis.length > 0 ? analysis : ["أدخلي بياناتك للحصول على تحليل ذكي"];
  };

  const tabs = [
    { id: "home" as TabType, icon: Home, label: "الرئيسية" },
    { id: "chat" as TabType, icon: MessageCircle, label: "المساعد الذكي" },
    { id: "health" as TabType, icon: Heart, label: "تتبع الصحة" },
    { id: "nutrition" as TabType, icon: Utensils, label: "التغذية" },
    { id: "exercise" as TabType, icon: Dumbbell, label: "التمارين" },
    { id: "videos" as TabType, icon: Play, label: "الفيديوهات" },
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
          هذا التطبيق تعليمي فقط ولا يُغني عن استشارة الطبيب المختص
        </div>

        {/* Home Tab */}
        {activeTab === "home" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">مرحباً بكِ في تطبيق الحمل الذكي</h2>
                    <p className="text-xs text-muted-foreground">مدعوم بالذكاء الاصطناعي</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Bot, title: "مساعد ذكي", desc: "اسألي أي سؤال عن الحمل", tab: "chat" as TabType },
                    { icon: Activity, title: "تحليل صحي", desc: "تتبع وتحليل بياناتك", tab: "health" as TabType },
                    { icon: Utensils, title: "خطة تغذية", desc: "وجبات مخصصة لكل مرحلة", tab: "nutrition" as TabType },
                    { icon: Dumbbell, title: "تمارين آمنة", desc: "رياضة مناسبة للحمل", tab: "exercise" as TabType },
                  ].map((feature, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveTab(feature.tab)}
                      className="bg-primary/5 hover:bg-primary/10 p-4 rounded-xl text-center transition-all group"
                    >
                      <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <feature.icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
                      <p className="text-[10px] text-muted-foreground mt-1">{feature.desc}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  أدوات الذكاء الاصطناعي
                </h3>
                <div className="space-y-2">
                  {[
                    { title: "المساعد الذكي", href: "/tools/pregnancy-assistant" },
                    { title: "تحليل الأعراض", href: "/tools/symptom-analyzer" },
                    { title: "اقتراح الوجبات", href: "/tools/ai-meal-suggestion" },
                    { title: "الملخص الأسبوعي", href: "/tools/weekly-summary" },
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
                    المساعد الذكي للحمل
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
                            className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-right"
                          >
                            <div className={`p-1.5 rounded-md bg-gradient-to-br ${q.color}`}>
                              <q.icon className="w-3 h-3 text-white" />
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
                      placeholder="اكتبي سؤالك هنا..."
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
                  <Heart className="w-5 h-5 text-destructive" />
                  تتبع الصحة بالذكاء الاصطناعي
                </h2>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">📅 أسبوع الحمل</label>
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
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">⚖️ الوزن (كجم)</label>
                    <Input
                      type="number"
                      placeholder="65"
                      value={healthData.weight}
                      onChange={(e) => setHealthData({ ...healthData, weight: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">💓 ضغط الدم</label>
                    <Input
                      placeholder="120/80"
                      value={healthData.bloodPressure}
                      onChange={(e) => setHealthData({ ...healthData, bloodPressure: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">😊 المزاج</label>
                    <select
                      value={healthData.mood}
                      onChange={(e) => setHealthData({ ...healthData, mood: e.target.value })}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option>ممتاز</option>
                      <option>جيد</option>
                      <option>عادي</option>
                      <option>قلقة</option>
                      <option>سيء</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">🩺 الأعراض اليوم</label>
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
                  حفظ وتحليل
                </Button>
              </CardContent>
            </Card>

            {/* AI Analysis */}
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="p-4">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  التحليل الذكي
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
                  <Utensils className="w-5 h-5 text-green-500" />
                  خطة التغذية الذكية
                </h2>
                <p className="text-xs text-muted-foreground mb-4">
                  خطة مخصصة للأسبوع {healthData.weekOfPregnancy} من الحمل
                </p>

                <div className="space-y-3">
                  {nutritionPlan.map((meal, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-xl">
                      <div className="text-3xl">{meal.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-green-700 dark:text-green-400">{meal.meal}</h3>
                        <p className="text-xs text-muted-foreground truncate">{meal.suggestion}</p>
                      </div>
                      <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold shrink-0">
                        {meal.calories}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-xl text-center">
                  <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                    📊 إجمالي السعرات: {nutritionPlan.reduce((a, b) => a + b.calories, 0)} سعرة
                  </p>
                </div>

                <Link to="/tools/ai-meal-suggestion">
                  <Button className="w-full mt-4" variant="outline">
                    اقتراحات أكثر بالذكاء الاصطناعي
                    <ChevronRight className="w-4 h-4 mr-2" />
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
                  <Dumbbell className="w-5 h-5 text-amber-500" />
                  تمارين آمنة للحمل
                </h2>

                <div className="grid grid-cols-2 gap-3">
                  {exercises.map((ex, i) => (
                    <Link key={i} to={ex.href}>
                      <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl text-center hover:shadow-md transition-shadow">
                        <div className="text-4xl mb-2">{ex.icon}</div>
                        <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-400">{ex.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">⏱️ {ex.duration}</p>
                        <p className="text-[10px] text-amber-600 dark:text-amber-500 mt-1">✨ {ex.benefit}</p>
                      </div>
                    </Link>
                  ))}
                </div>

                <Link to="/tools/exercise-guide">
                  <Button className="w-full mt-4" variant="outline">
                    المزيد من التمارين
                    <ChevronRight className="w-4 h-4 mr-2" />
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
                  فيديوهات تعليمية
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
                              <p className="text-primary-foreground text-sm font-medium text-right">{video.title}</p>
                            </div>
                          </AspectRatio>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <Link to="/videos">
                  <Button className="w-full mt-4" variant="outline">
                    المكتبة الكاملة
                    <ChevronRight className="w-4 h-4 mr-2" />
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
