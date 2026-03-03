import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, Heart, Baby, Coffee, Apple, Stethoscope, Moon, Dumbbell, UtensilsCrossed, SmilePlus, Sparkles } from "lucide-react";
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

const quickQuestions = [
  { icon: Baby, textKey: "pregnancyAssistant.quickQuestions.symptoms", gradient: "from-pink-500 to-rose-400", bg: "bg-pink-50" },
  { icon: Coffee, textKey: "pregnancyAssistant.quickQuestions.coffee", gradient: "from-amber-500 to-orange-400", bg: "bg-amber-50" },
  { icon: Stethoscope, textKey: "pregnancyAssistant.quickQuestions.labor", gradient: "from-blue-500 to-indigo-400", bg: "bg-blue-50" },
  { icon: Apple, textKey: "pregnancyAssistant.quickQuestions.vitamins", gradient: "from-emerald-500 to-green-400", bg: "bg-emerald-50" },
  { icon: Moon, textKey: "pregnancyAssistant.quickQuestions.sleep", gradient: "from-indigo-500 to-violet-400", bg: "bg-indigo-50" },
  { icon: Dumbbell, textKey: "pregnancyAssistant.quickQuestions.exercise", gradient: "from-teal-500 to-cyan-400", bg: "bg-teal-50" },
  { icon: UtensilsCrossed, textKey: "pregnancyAssistant.quickQuestions.nutrition", gradient: "from-lime-500 to-green-400", bg: "bg-lime-50" },
  { icon: SmilePlus, textKey: "pregnancyAssistant.quickQuestions.emotions", gradient: "from-purple-500 to-fuchsia-400", bg: "bg-purple-50" },
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

  return (
    <ToolFrame 
      title={t("tools.pregnancyAssistant.title")} 
      subtitle={t("pregnancyAssistant.subtitle")}
      customIcon="chat-assistant"
      mood="nurturing"
      toolId="pregnancy-assistant"
      noCard
    >
      <div className="space-y-3">
        <div className="overflow-hidden">
          {messages.length === 0 ? (
            <WelcomeView onSend={sendMessage} />
          ) : (
            <ChatView
              messages={messages}
              isLoading={isLoading}
              scrollRef={scrollRef}
            />
          )}

          {error && (
            <div className="px-3 pb-2">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-destructive/10 border border-destructive/20">
                <Heart className="w-3.5 h-3.5 text-destructive shrink-0" />
                <p className="text-xs text-destructive font-medium">{error}</p>
              </div>
            </div>
          )}

          <InputArea
            input={input}
            setInput={setInput}
            isLoading={isLoading}
            onSend={sendMessage}
          />
        </div>

        <TrustIndicators />
      </div>
    </ToolFrame>
  );
}

/* ─── Welcome View ─── */
function WelcomeView({ onSend }: { onSend: (text: string) => void }) {
  const { t } = useTranslation();

  return (
    <div className="px-3 pt-4 pb-2">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center text-center space-y-5"
      >
        {/* Animated AI Avatar */}
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.1 }}
          className="relative"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-pink-500 to-rose-400 flex items-center justify-center shadow-lg shadow-primary/30 rotate-3">
            <Bot className="w-8 h-8 text-white drop-shadow-sm" />
          </div>
          {/* Floating sparkle */}
          <motion.div
            className="absolute -top-1.5 -right-1.5"
            animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 flex items-center justify-center shadow-md ring-2 ring-background">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </motion.div>
          {/* Pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-primary/30 rotate-3"
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Welcome Text */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-1.5 max-w-xs"
        >
          <h3 className="text-base font-bold text-foreground">
            {t("pregnancyAssistant.hello")}
          </h3>
          <p className="text-muted-foreground text-xs leading-relaxed">
            {t("pregnancyAssistant.askAnything")}
          </p>
        </motion.div>

        {/* Animated Quick Questions Grid */}
        <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
          {quickQuestions.map((q, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: 0.3 + i * 0.07,
                type: "spring",
                stiffness: 200,
                damping: 15,
              }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSend(t(q.textKey))}
              className={`group relative flex items-center gap-2 p-2.5 rounded-xl ${q.bg} border border-border/30 hover:border-primary/30 hover:shadow-md transition-shadow duration-200 text-start overflow-hidden min-w-0`}
            >
              {/* Gradient icon badge */}
              <div className={`p-1.5 rounded-lg bg-gradient-to-br ${q.gradient} shadow-sm shrink-0`}>
                <q.icon className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[11px] font-medium text-foreground/80 leading-tight line-clamp-2 break-words">
                {t(q.textKey)}
              </span>
              {/* Hover shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
              />
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Chat View ─── */
function ChatView({
  messages,
  isLoading,
  scrollRef,
}: {
  messages: Message[];
  isLoading: boolean;
  scrollRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <ScrollArea className="h-[calc(100vh-320px)] min-h-[320px] max-h-[450px]" ref={scrollRef}>
      <div className="p-3 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-primary to-pink-500"
                    : "bg-gradient-to-br from-muted-foreground/70 to-muted-foreground/50"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-primary to-pink-500 text-primary-foreground rounded-tr-sm"
                    : "bg-card border border-border/60 rounded-tl-sm"
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

        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2.5"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-muted-foreground/70 to-muted-foreground/50 flex items-center justify-center shadow-sm">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-card border border-border/60 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-primary"
                    animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </ScrollArea>
  );
}

/* ─── Input Area ─── */
function InputArea({
  input,
  setInput,
  isLoading,
  onSend,
}: {
  input: string;
  setInput: (v: string) => void;
  isLoading: boolean;
  onSend: (text: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="p-3 border-t border-border/30">
      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("pregnancyAssistant.placeholder")}
          className="min-h-[44px] max-h-[100px] resize-none rounded-xl border border-border/50 focus:border-primary/40 bg-card shadow-sm text-sm flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend(input);
            }
          }}
        />
        <Button
          onClick={() => onSend(input)}
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
  );
}

/* ─── Trust Indicators ─── */
function TrustIndicators() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap justify-center gap-3 text-[10px] sm:text-xs text-muted-foreground">
      <div className="flex items-center gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
        <span>{t("pregnancyAssistant.trustIndicators.available")}</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        <span>{t("pregnancyAssistant.trustIndicators.medical")}</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-foreground/40" />
        <span>{t("pregnancyAssistant.trustIndicators.secure")}</span>
      </div>
    </div>
  );
}
