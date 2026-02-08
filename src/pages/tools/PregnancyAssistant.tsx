import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, Loader2, MessageCircle, Zap, Heart, Baby, Coffee, Apple, Stethoscope, Moon, Dumbbell, UtensilsCrossed, SmilePlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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

const getQuickQuestions = (t: (key: string) => string) => [
  { icon: Baby, textKey: "pregnancyAssistant.quickQuestions.symptoms", color: "from-pink-500 to-rose-500" },
  { icon: Coffee, textKey: "pregnancyAssistant.quickQuestions.coffee", color: "from-amber-500 to-orange-500" },
  { icon: Stethoscope, textKey: "pregnancyAssistant.quickQuestions.labor", color: "from-blue-500 to-indigo-500" },
  { icon: Apple, textKey: "pregnancyAssistant.quickQuestions.vitamins", color: "from-green-500 to-emerald-500" },
  { icon: Moon, textKey: "pregnancyAssistant.quickQuestions.sleep", color: "from-indigo-500 to-violet-500" },
  { icon: Dumbbell, textKey: "pregnancyAssistant.quickQuestions.exercise", color: "from-teal-500 to-cyan-500" },
  { icon: UtensilsCrossed, textKey: "pregnancyAssistant.quickQuestions.nutrition", color: "from-lime-500 to-green-500" },
  { icon: SmilePlus, textKey: "pregnancyAssistant.quickQuestions.emotions", color: "from-purple-500 to-fuchsia-500" },
];

export default function PregnancyAssistant() {
  const { t } = useTranslation();
  const { streamChat, isLoading, error } = usePregnancyAI();

  useResetOnLanguageChange(() => {
    setMessages([]);
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
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

  const quickQuestions = getQuickQuestions(t);

  return (
    <ToolFrame 
      title={t("tools.pregnancyAssistant.title")} 
      subtitle={t("pregnancyAssistant.subtitle")}
      customIcon="chat-assistant"
      mood="nurturing"
      toolId="pregnancy-assistant"
    >
      <div className="space-y-3">
        {/* Chat Container */}
        <Card className="border border-primary/10 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-320px)] min-h-[320px] max-h-[450px]" ref={scrollRef}>
              <div className="p-3">
                {messages.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center min-h-[280px] text-center space-y-4"
                  >
                    {/* Welcome Icon - Smaller */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                      className="relative"
                    >
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center shadow-lg shadow-primary/25">
                        <Bot className="w-7 h-7 text-white" />
                      </div>
                      <motion.div
                        className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center shadow ring-2 ring-white"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Zap className="w-2.5 h-2.5 text-white" />
                      </motion.div>
                    </motion.div>

                    {/* Welcome Text - Compact */}
                    <div className="space-y-1 max-w-xs">
                      <h3 className="text-base font-bold text-foreground">
                        {t("pregnancyAssistant.hello")}
                      </h3>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        {t("pregnancyAssistant.askAnything")}
                      </p>
                    </div>

                    {/* Quick Questions - 2x4 Grid */}
                    <div className="grid grid-cols-2 gap-1.5 w-full max-w-sm">
                      {quickQuestions.map((q, i) => (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + i * 0.05 }}
                          onClick={() => sendMessage(t(q.textKey))}
                          className="group flex items-center gap-1.5 p-2 rounded-lg bg-muted/50 border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 text-left overflow-hidden min-w-0"
                        >
                          <div className={`p-1.5 rounded-md bg-gradient-to-br ${q.color} shadow-sm shrink-0`}>
                            <q.icon className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-[10px] font-medium text-foreground/80 leading-tight line-clamp-2 break-words">
                            {t(q.textKey)}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {messages.map((msg, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 15, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.25 }}
                          className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                        >
                          {/* Avatar */}
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow ${
                              msg.role === "user"
                                ? "bg-gradient-to-br from-primary to-pink-500"
                                : "bg-gradient-to-br from-slate-600 to-slate-700"
                            }`}
                          >
                            {msg.role === "user" ? (
                              <User className="w-4 h-4 text-white" />
                            ) : (
                              <Bot className="w-4 h-4 text-white" />
                            )}
                          </div>

                          {/* Message Bubble */}
                          <div
                            className={`max-w-[85%] rounded-2xl px-3 py-2.5 shadow-sm ${
                              msg.role === "user"
                                ? "bg-gradient-to-br from-primary to-pink-500 text-white rounded-tr-sm"
                                : "bg-white border border-gray-100 rounded-tl-sm"
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
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-2.5"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                          <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="w-1.5 h-1.5 rounded-full bg-primary"
                                animate={{ y: [0, -6, 0] }}
                                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }}
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

            {/* Error Display */}
            {error && (
              <div className="px-3 pb-2">
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-destructive/10 border border-destructive/20">
                  <Heart className="w-3.5 h-3.5 text-destructive shrink-0" />
                  <p className="text-xs text-destructive font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Input Area - Mobile Optimized */}
            <div className="p-3 border-t border-primary/5 bg-gradient-to-t from-rose-50/30 to-transparent">
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t("pregnancyAssistant.placeholder")}
                  className="min-h-[44px] max-h-[100px] resize-none rounded-xl border border-primary/10 focus:border-primary/30 bg-white shadow-inner text-sm flex-1"
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
                  className="h-[44px] w-[44px] rounded-xl bg-gradient-to-br from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shrink-0"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trust Indicators - Compact */}
        <div className="flex flex-wrap justify-center gap-3 text-[10px] sm:text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span>{t("pregnancyAssistant.trustIndicators.available")}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>{t("pregnancyAssistant.trustIndicators.medical")}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span>{t("pregnancyAssistant.trustIndicators.secure")}</span>
          </div>
        </div>
      </div>
    </ToolFrame>
  );
}
