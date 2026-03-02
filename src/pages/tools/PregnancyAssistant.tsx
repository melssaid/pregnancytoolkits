import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, Heart, Baby, Coffee, Apple, Stethoscope, Moon, Dumbbell, UtensilsCrossed, SmilePlus, Sparkles, Droplets, Scale, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToolFrame } from "@/components/ToolFrame";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { useResetOnLanguageChange } from '@/hooks/useResetOnLanguageChange';
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const questionCategories = [
  { id: "popular", labelKey: "pregnancyAssistant.quickCategories.popular" },
  { id: "body", labelKey: "pregnancyAssistant.quickCategories.body" },
  { id: "baby", labelKey: "pregnancyAssistant.quickCategories.baby" },
  { id: "lifestyle", labelKey: "pregnancyAssistant.quickCategories.lifestyle" },
];

const questionsByCategory: Record<string, { icon: any; textKey: string }[]> = {
  popular: [
    { icon: Baby, textKey: "pregnancyAssistant.quickQuestions.symptoms" },
    { icon: Coffee, textKey: "pregnancyAssistant.quickQuestions.coffee" },
    { icon: Stethoscope, textKey: "pregnancyAssistant.quickQuestions.labor" },
  ],
  body: [
    { icon: Scale, textKey: "pregnancyAssistant.quickQuestions.weight" },
    { icon: Activity, textKey: "pregnancyAssistant.quickQuestions.backPain" },
    { icon: Droplets, textKey: "pregnancyAssistant.quickQuestions.skincare" },
  ],
  baby: [
    { icon: Apple, textKey: "pregnancyAssistant.quickQuestions.vitamins" },
    { icon: Baby, textKey: "pregnancyAssistant.quickQuestions.babyMovement" },
    { icon: UtensilsCrossed, textKey: "pregnancyAssistant.quickQuestions.nutrition" },
  ],
  lifestyle: [
    { icon: Moon, textKey: "pregnancyAssistant.quickQuestions.sleep" },
    { icon: Dumbbell, textKey: "pregnancyAssistant.quickQuestions.exercise" },
    { icon: SmilePlus, textKey: "pregnancyAssistant.quickQuestions.emotions" },
  ],
};

export default function PregnancyAssistant() {
  const { t } = useTranslation();
  const { streamChat, isLoading, error } = usePregnancyAI();

  useResetOnLanguageChange(() => {
    setMessages([]);
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [activeCategory, setActiveCategory] = useState("popular");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    let assistantContent = "";

    await streamChat({
      type: "pregnancy-assistant",
      messages: [...messages, userMessage],
      onDelta: (chunk) => {
        assistantContent += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
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

  const currentQuestions = questionsByCategory[activeCategory] || [];

  return (
    <ToolFrame
      title={t("tools.pregnancyAssistant.title")}
      subtitle={t("pregnancyAssistant.subtitle")}
      customIcon="chat-assistant"
      mood="nurturing"
      toolId="pregnancy-assistant"
    >
      <div className="space-y-3">
        <div className="overflow-hidden rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm">
          <ScrollArea className="h-[calc(100vh-340px)] min-h-[300px] max-h-[420px]" ref={scrollRef}>
            <div className="p-4">
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center min-h-[280px] space-y-5"
                >
                  {/* Animated Brain Icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 180, delay: 0.1 }}
                    className="relative"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-accent flex items-center justify-center shadow-xl shadow-primary/20">
                      <Sparkles className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <motion.div
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-accent flex items-center justify-center shadow-md ring-2 ring-background"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: "spring" }}
                    >
                      <Bot className="w-3 h-3 text-accent-foreground" />
                    </motion.div>
                  </motion.div>

                  {/* Welcome Text */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="text-center space-y-1.5 max-w-xs"
                  >
                    <h3 className="text-lg font-bold text-foreground">
                      {t("pregnancyAssistant.hello")}
                    </h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {t("pregnancyAssistant.askAnything")}
                    </p>
                  </motion.div>

                  {/* Category Tabs */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="flex gap-1.5 p-1 rounded-xl bg-muted/60 w-full max-w-sm"
                  >
                    {questionCategories.map((cat, i) => (
                      <motion.button
                        key={cat.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + i * 0.05 }}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-semibold transition-all duration-300 ${
                          activeCategory === cat.id
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        {t(cat.labelKey)}
                      </motion.button>
                    ))}
                  </motion.div>

                  {/* Questions with animation */}
                  <div className="w-full max-w-sm space-y-2">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeCategory}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-2"
                      >
                        {currentQuestions.map((q, i) => (
                          <motion.button
                            key={q.textKey}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08, duration: 0.25 }}
                            onClick={() => sendMessage(t(q.textKey))}
                            className="w-full group flex items-center gap-3 p-3 rounded-xl bg-background border border-border/50 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 text-start"
                          >
                            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors shrink-0">
                              <q.icon className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-xs font-medium text-foreground/80 group-hover:text-foreground leading-snug transition-colors">
                              {t(q.textKey)}
                            </span>
                            <Send className="w-3 h-3 text-muted-foreground/0 group-hover:text-primary/60 transition-all ms-auto shrink-0" />
                          </motion.button>
                        ))}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {messages.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 12, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.25 }}
                        className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
                            msg.role === "user"
                              ? "bg-gradient-to-br from-primary to-primary/70"
                              : "bg-muted"
                          }`}
                        >
                          {msg.role === "user" ? (
                            <User className="w-3.5 h-3.5 text-primary-foreground" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5 text-primary" />
                          )}
                        </div>

                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground rounded-tr-sm"
                              : "bg-muted/60 border border-border/30 rounded-tl-sm"
                          }`}
                        >
                          {msg.role === "assistant" ? (
                            <div className="prose prose-sm max-w-none text-sm">
                              <MarkdownRenderer content={msg.content} accentColor="primary" />
                            </div>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">
                              {msg.content}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Typing Indicator */}
                  {isLoading && messages[messages.length - 1]?.role === "user" && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-2.5"
                    >
                      <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shadow-sm">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="bg-muted/60 border border-border/30 rounded-2xl rounded-tl-sm px-4 py-3">
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-1.5 h-1.5 rounded-full bg-primary/60"
                              animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.12 }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Error */}
          {error && (
            <div className="px-3 pb-2">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-destructive/10 border border-destructive/20">
                <Heart className="w-3.5 h-3.5 text-destructive shrink-0" />
                <p className="text-xs text-destructive font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 border-t border-border/30 bg-muted/20">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("pregnancyAssistant.placeholder")}
                className="min-h-[44px] max-h-[100px] resize-none rounded-xl border-border/40 focus:border-primary/40 bg-background text-sm flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
              />
              <Button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-[44px] w-[44px] rounded-xl bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/15 transition-all duration-200 shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-4 text-[10px] text-muted-foreground">
          {[
            { key: "available", color: "bg-accent" },
            { key: "medical", color: "bg-primary" },
            { key: "secure", color: "bg-foreground/30" },
          ].map((ind) => (
            <div key={ind.key} className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${ind.color}`} />
              <span>{t(`pregnancyAssistant.trustIndicators.${ind.key}`)}</span>
            </div>
          ))}
        </div>
      </div>
    </ToolFrame>
  );
}
