import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, ChevronDown, Smile, Calendar, Sparkles } from "lucide-react";
import { ToolFrame } from "@/components/ToolFrame";

const DAY_KEYS = Array.from({ length: 14 }, (_, i) => `day${i + 1}`);

/* ── Local Design Components ─────────────────────────────────────── */

const NumberBadge = ({ n }: { n: number }) => (
  <div
    className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-sm"
    style={{ background: "linear-gradient(135deg, hsl(340,65%,55%), hsl(350,60%,65%))" }}
  >
    {n}
  </div>
);

const SectionHeader = ({ label, count }: { label: string; count: number }) => (
  <div className="flex items-center gap-2.5 mb-3">
    <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-destructive/10">
      <Calendar className="w-3.5 h-3.5 text-destructive" />
    </div>
    <span className="text-xs font-bold text-foreground flex-1">{label}</span>
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{count}</span>
  </div>
);

const ContentBlock = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-xl border border-border/40 bg-gradient-to-br from-background to-muted/30 p-3 flex gap-2.5">
    <div className="w-5 h-5 rounded-md shrink-0 mt-0.5 flex items-center justify-center bg-destructive/10">
      <Heart className="w-3 h-3 text-destructive" />
    </div>
    <p className="whitespace-pre-line text-[13px] font-semibold leading-[1.9] text-foreground flex-1">{children}</p>
  </div>
);

const TipBlock = ({ children, isRTL }: { children: React.ReactNode; isRTL: boolean }) => (
  <div
    className={`rounded-xl p-2.5 flex items-start gap-2 ${isRTL ? 'border-r-3' : 'border-l-3'} border-destructive`}
    style={{ background: "hsl(340,65%,55%,0.06)" }}
  >
    <Smile className="w-3.5 h-3.5 shrink-0 mt-0.5 text-destructive" />
    <span className="text-xs font-bold text-foreground leading-relaxed">{children}</span>
  </div>
);

export default function TWWCompanion() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const dir = isRTL ? "rtl" : "ltr";
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  return (
    <ToolFrame title={t('tools.twwCompanion.title')} subtitle={t('tools.twwCompanion.description')} mood="nurturing" toolId="tww-companion">
      <div className="space-y-2" dir={dir} style={{ textAlign: isRTL ? "right" : "left" }}>
        <SectionHeader label={t('toolsInternal.twwCompanion.subtitle')} count={14} />

        {DAY_KEYS.map((key, i) => {
          const isOpen = expandedDay === key;
          return (
            <motion.div key={key} initial={{ opacity: 0, x: isRTL ? 14 : -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02, duration: 0.22 }}>
              <div
                className={`rounded-2xl border transition-all duration-300 cursor-pointer backdrop-blur-sm ${
                  isOpen
                    ? 'border-destructive/30 bg-destructive/[0.04] shadow-md'
                    : 'border-border/50 hover:border-destructive/20 bg-card/80'
                } ${isRTL ? 'border-r-3' : 'border-l-3'}`}
                style={{ [isRTL ? 'borderRightColor' : 'borderLeftColor']: isOpen ? 'hsl(340,65%,55%)' : 'transparent' }}
                onClick={() => setExpandedDay(isOpen ? null : key)}
              >
                <div className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <NumberBadge n={i + 1} />
                      <span className="text-sm font-bold text-foreground">{t(`toolsInternal.twwCompanion.days.${key}.title`)}</span>
                    </div>
                    <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted/70">
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </motion.span>
                  </div>
                </div>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22, ease: "easeOut" }} className="overflow-hidden">
                      <div className="mx-3 mb-3 space-y-2">
                        <ContentBlock>{t(`toolsInternal.twwCompanion.days.${key}.body`)}</ContentBlock>
                        <TipBlock isRTL={isRTL}>{t(`toolsInternal.twwCompanion.days.${key}.tip`)}</TipBlock>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </ToolFrame>
  );
}
