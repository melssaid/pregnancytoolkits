import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, Loader2, MessageCircle, Zap, Heart, Baby, Coffee, Apple, Stethoscope } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToolFrame } from "@/components/ToolFrame";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const quickQuestions = [
  { icon: Baby, text: "First month pregnancy symptoms?", color: "from-pink-500 to-rose-500" },
  { icon: Coffee, text: "Is coffee safe during pregnancy?", color: "from-amber-500 to-orange-500" },
  { icon: Stethoscope, text: "How to prepare for labor?", color: "from-blue-500 to-indigo-500" },
  { icon: Apple, text: "Important vitamins for pregnancy?", color: "from-green-500 to-emerald-500" },
];

export default function PregnancyAssistant() {
  const { t } = useTranslation();
  const { streamChat, isLoading, error } = usePregnancyAI();
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

  return (
    <ToolFrame 
      title={t("tools.pregnancyAssistant.title")} 
      subtitle="Your 24/7 AI-powered pregnancy companion with expert answers"
      icon={MessageCircle}
      mood="nurturing"
      toolId="pregnancy-assistant"
    >
      <div className="space-y-6">
        {/* AI Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 via-pink-500/10 to-purple-500/10 border border-primary/20">
            <div className="relative">
              <Sparkles className="w-4 h-4 text-primary" />
              <motion.div 
                className="absolute inset-0"
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 text-primary" />
              </motion.div>
            </div>
            <span className="text-sm font-semibold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Powered by Advanced AI
            </span>
          </div>
        </motion.div>

        {/* Chat Container */}
        <Card className="border-2 border-primary/10 shadow-xl shadow-primary/5 overflow-hidden bg-gradient-to-b from-white to-rose-50/30">
          <CardContent className="p-0">
            <ScrollArea className="h-[450px]" ref={scrollRef}>
              <div className="p-5">
                {messages.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center min-h-[380px] text-center space-y-6"
                  >
                    {/* Welcome Icon */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                      className="relative"
                    >
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center shadow-2xl shadow-primary/30">
                        <Bot className="w-10 h-10 text-white" />
                      </div>
                      <motion.div
                        className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center shadow-lg ring-4 ring-white"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <Zap className="w-3.5 h-3.5 text-white" />
                      </motion.div>
                    </motion.div>

                    {/* Welcome Text */}
                    <div className="space-y-2 max-w-sm">
                      <h3 className="text-xl font-bold text-foreground">
                        Hello! I'm Your Pregnancy Assistant 👋
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Ask me anything about pregnancy, nutrition, baby development, or birth preparation
                      </p>
                    </div>

                    {/* Quick Questions Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md pt-2">
                      {quickQuestions.map((q, i) => (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          onClick={() => sendMessage(q.text)}
                          className="group flex items-center gap-3 p-3 rounded-xl bg-white border-2 border-transparent hover:border-primary/30 shadow-md hover:shadow-xl transition-all duration-300 text-left"
                        >
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${q.color} shadow-lg group-hover:scale-110 transition-transform`}>
                            <q.icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-xs font-medium text-foreground/80 group-hover:text-foreground leading-tight">
                            {q.text}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-5">
                    <AnimatePresence mode="popLayout">
                      {messages.map((msg, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                        >
                          {/* Avatar */}
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                              msg.role === "user"
                                ? "bg-gradient-to-br from-primary to-pink-500"
                                : "bg-gradient-to-br from-slate-600 to-slate-700"
                            }`}
                          >
                            {msg.role === "user" ? (
                              <User className="w-5 h-5 text-white" />
                            ) : (
                              <Bot className="w-5 h-5 text-white" />
                            )}
                          </motion.div>

                          {/* Message Bubble */}
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-md ${
                              msg.role === "user"
                                ? "bg-gradient-to-br from-primary to-pink-500 text-white rounded-tr-sm"
                                : "bg-white border border-gray-100 rounded-tl-sm"
                            }`}
                          >
                            {msg.role === "assistant" ? (
                              <div className="prose prose-sm max-w-none">
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
                        className="flex gap-3"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-lg">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-5 py-4 shadow-md">
                          <div className="flex gap-1.5">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="w-2 h-2 rounded-full bg-primary"
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
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
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-5 pb-3"
              >
                <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                  <Heart className="w-4 h-4 text-destructive" />
                  <p className="text-xs text-destructive font-medium">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t-2 border-primary/5 bg-gradient-to-t from-rose-50/50 to-transparent">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your question here..."
                    className="min-h-[52px] max-h-[120px] resize-none pr-4 rounded-xl border-2 border-primary/10 focus:border-primary/30 bg-white shadow-inner text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(input);
                      }
                    }}
                  />
                </div>
                <Button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="h-[52px] w-[52px] rounded-xl bg-gradient-to-br from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground"
        >
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>24/7 Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Medical Knowledge</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span>Private & Secure</span>
          </div>
        </motion.div>
      </div>
    </ToolFrame>
  );
}
