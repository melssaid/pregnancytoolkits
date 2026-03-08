import { memo } from "react";
import { Clock, Zap, Timer, Flame, Sparkles, ShieldCheck, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { BackButton } from "@/components/BackButton";

const daysLeft = 3;

const BadgeVariant = memo(function BadgeVariant({ 
  label, 
  children 
}: { 
  label: string; 
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
      {/* Mini PremiumBanner mockup */}
      <div className="w-full rounded-2xl bg-card border border-primary/15 shadow-sm overflow-hidden">
        <div className="px-4 py-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-primary" strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="inline-flex items-center px-1.5 py-px rounded-md bg-primary/10 text-[9px] font-bold text-primary uppercase tracking-wider">
                PRO
              </span>
            </div>
            <p className="text-[13px] font-bold text-foreground tracking-tight leading-snug" style={{ fontFamily: "'Tajawal', sans-serif" }}>
              افتحي جميع الأدوات المميزة
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
              اشتراك سنوي بسعر مخفض
            </p>
          </div>
          {/* Badge on the left (end in LTR) */}
          <div className="shrink-0">
            {children}
          </div>
          <ChevronRight className="w-4 h-4 text-primary/40 rtl:rotate-180 shrink-0" />
        </div>
      </div>
    </div>
  );
});

const BadgeDemo = () => {
  return (
    <Layout>
      <div className="pt-4 pb-20 px-3 sm:px-4 max-w-2xl mx-auto space-y-6">
        <BackButton />
        <h1 className="text-xl font-bold text-foreground ar-heading">أنماط الشارة — اختر التصميم المفضل</h1>

        {/* Style 1: Gradient Red→Orange with pulse dot + clock */}
        <BadgeVariant label="1 — تدرج أحمر + نقطة نبض + ساعة">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gradient-to-r from-[hsl(0,72%,45%)] to-[hsl(25,90%,52%)] text-white text-[10px] font-extrabold tracking-wide shadow-[0_2px_8px_-2px_hsl(0,70%,45%,0.4)]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/60" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
            </span>
            <Clock className="w-2.5 h-2.5" strokeWidth={2.5} />
            {daysLeft} Days Free
          </span>
        </BadgeVariant>

        {/* Style 2: Minimal pill — primary color, no icon */}
        <BadgeVariant label="2 — حبة مينيمال بلون رئيسي">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold tracking-wide">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/50" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
            </span>
            {daysLeft} Days
          </span>
        </BadgeVariant>

        {/* Style 3: Dark chip — like Spotify/YouTube */}
        <BadgeVariant label="3 — شريحة داكنة (Spotify style)">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-foreground text-background text-[10px] font-bold tracking-wide">
            <Timer className="w-3 h-3" strokeWidth={2} />
            {daysLeft}d left
          </span>
        </BadgeVariant>

        {/* Style 4: Outline badge with urgency color */}
        <BadgeVariant label="4 — إطار مفرغ مع لون إلحاح">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border-2 border-[hsl(0,70%,50%)] text-[hsl(0,70%,50%)] dark:text-[hsl(0,65%,60%)] text-[10px] font-bold tracking-wide">
            <Flame className="w-3 h-3" strokeWidth={2} />
            {daysLeft} Days
          </span>
        </BadgeVariant>

        {/* Style 5: Soft glass badge */}
        <BadgeVariant label="5 — زجاجية شفافة (Glass)">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/20 dark:bg-white/10 backdrop-blur-md border border-primary/20 text-foreground text-[10px] font-bold tracking-wide shadow-sm">
            <Sparkles className="w-3 h-3 text-primary" strokeWidth={2} />
            {daysLeft} Days Free
          </span>
        </BadgeVariant>

        {/* Style 6: Compact number badge — like notification count */}
        <BadgeVariant label="6 — رقم مضغوط (Notification style)">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground font-medium">Free</span>
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[hsl(0,72%,48%)] text-white text-[11px] font-black shadow-[0_2px_6px_-1px_hsl(0,70%,48%,0.4)]">
              {daysLeft}
            </span>
          </div>
        </BadgeVariant>

        {/* Style 7: Gradient badge with Zap icon */}
        <BadgeVariant label="7 — تدرج ذهبي + برق">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gradient-to-r from-[hsl(40,90%,50%)] to-[hsl(25,95%,55%)] text-white text-[10px] font-extrabold tracking-wide shadow-[0_2px_8px_-2px_hsl(40,80%,50%,0.4)]">
            <Zap className="w-3 h-3" strokeWidth={2.5} fill="currentColor" />
            {daysLeft}d Free
          </span>
        </BadgeVariant>
      </div>
    </Layout>
  );
};

export default BadgeDemo;
