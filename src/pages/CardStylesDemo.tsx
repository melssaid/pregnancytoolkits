import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronRight, Baby, Heart, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

// Shared mini tool rows for demo
const demoTools = [
  { name: "أداة ذكية ١", desc: "وصف مختصر للأداة" },
  { name: "أداة ذكية ٢", desc: "وصف مختصر للأداة" },
];

const MiniTools = ({ accent = "pink" }: { accent?: string }) => (
  <div className="space-y-1.5 px-3 pb-3 pt-2">
    {demoTools.map((t, i) => (
      <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-card/80 border border-border/20">
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-primary/60" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground">{t.name}</p>
          <p className="text-[11px] text-muted-foreground">{t.desc}</p>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30" />
      </div>
    ))}
  </div>
);

// ═══════════════════════════════════════════════════════════════
// STYLE 1: Flo Health Style — Minimal pill header with subtle accent
// ═══════════════════════════════════════════════════════════════
function Style1() {
  return (
    <div className="space-y-3">
      {[
        { title: "أحلم بطفل", icon: "🍼", count: 8, color: "from-rose-400 to-pink-500" },
        { title: "حملي", icon: "🤰", count: 15, color: "from-pink-500 to-rose-600" },
        { title: "ما بعد الولادة", icon: "👶", count: 12, color: "from-purple-400 to-pink-500" },
      ].map((item, i) => (
        <div key={i} className="rounded-2xl border border-border/40 bg-card overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-lg shadow-md`}>
                {item.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                <p className="text-[11px] text-muted-foreground">{item.count} أداة ذكية</p>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground/40" />
          </div>
          {i === 1 && <MiniTools />}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STYLE 2: Apple Health Style — Clean cards with left accent bar
// ═══════════════════════════════════════════════════════════════
function Style2() {
  return (
    <div className="space-y-3">
      {[
        { title: "أحلم بطفل", desc: "تخطيط الخصوبة والإباضة", count: 8, accent: "bg-rose-400" },
        { title: "حملي", desc: "متابعة الحمل أسبوعياً", count: 15, accent: "bg-pink-500" },
        { title: "ما بعد الولادة", desc: "رعاية الأم والطفل", count: 12, accent: "bg-purple-400" },
      ].map((item, i) => (
        <div key={i} className="rounded-2xl border border-border/40 bg-card overflow-hidden shadow-sm flex">
          <div className={`w-1.5 ${item.accent} flex-shrink-0 rounded-s-2xl`} />
          <div className="flex-1">
            <div className="flex items-center justify-between px-4 py-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">{item.count}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground/40" />
            </div>
            {i === 1 && <MiniTools />}
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STYLE 3: Clue App Style — Bold full-width gradient banners
// ═══════════════════════════════════════════════════════════════
function Style3() {
  return (
    <div className="space-y-3">
      {[
        { title: "أحلم بطفل", desc: "خطط لرحلتك", gradient: "from-[hsl(15,70%,55%)] to-[hsl(340,50%,58%)]" },
        { title: "حملي", desc: "تابعي حملك", gradient: "from-[hsl(340,65%,52%)] to-[hsl(320,50%,55%)]" },
        { title: "ما بعد الولادة", desc: "رعاية شاملة", gradient: "from-[hsl(310,40%,50%)] to-[hsl(280,35%,55%)]" },
      ].map((item, i) => (
        <div key={i} className="rounded-2xl overflow-hidden shadow-sm">
          <div className={`bg-gradient-to-r ${item.gradient} px-4 py-4 flex items-center justify-between`}>
            <div>
              <h3 className="text-base font-bold text-white">{item.title}</h3>
              <p className="text-[11px] text-white/75 mt-0.5">{item.desc}</p>
            </div>
            <ChevronDown className="w-5 h-5 text-white/50" />
          </div>
          {i === 1 && (
            <div className="bg-card border border-t-0 border-border/30 rounded-b-2xl">
              <MiniTools />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STYLE 4: BabyCenter Style — Image-driven horizontal cards
// ═══════════════════════════════════════════════════════════════
function Style4() {
  return (
    <div className="space-y-3">
      {[
        { title: "أحلم بطفل", desc: "٨ أدوات", emoji: "🌸", bg: "bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30" },
        { title: "حملي", desc: "١٥ أداة", emoji: "💕", bg: "bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30" },
        { title: "ما بعد الولادة", desc: "١٢ أداة", emoji: "✨", bg: "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30" },
      ].map((item, i) => (
        <div key={i} className={`rounded-2xl ${item.bg} border border-border/30 overflow-hidden shadow-sm`}>
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/80 dark:bg-white/10 border border-border/20 flex items-center justify-center text-2xl shadow-sm">
              {item.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10">
              <span className="text-[10px] font-bold text-primary">فتح</span>
              <ChevronDown className="w-3 h-3 text-primary" />
            </div>
          </div>
          {i === 1 && <MiniTools />}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STYLE 5: Ovia Style — Stacked cards with top color strip
// ═══════════════════════════════════════════════════════════════
function Style5() {
  return (
    <div className="space-y-3">
      {[
        { title: "أحلم بطفل", desc: "تخطيط الخصوبة", count: 8, strip: "bg-gradient-to-r from-rose-400 via-pink-400 to-rose-300" },
        { title: "حملي", desc: "متابعة أسبوعية", count: 15, strip: "bg-gradient-to-r from-pink-500 via-rose-500 to-pink-400" },
        { title: "ما بعد الولادة", desc: "رعاية الأم والطفل", count: 12, strip: "bg-gradient-to-r from-purple-400 via-pink-400 to-purple-300" },
      ].map((item, i) => (
        <div key={i} className="rounded-2xl bg-card border border-border/30 overflow-hidden shadow-sm">
          <div className={`h-1.5 ${item.strip}`} />
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-muted/80 flex items-center justify-center">
                <Heart className="w-4 h-4 text-primary" fill="currentColor" />
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                  <span className="text-[10px] text-muted-foreground">{item.count} أداة</span>
                </div>
                <p className="text-[11px] text-muted-foreground">{item.desc}</p>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground/40" />
          </div>
          {i === 1 && <MiniTools />}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STYLE 6: Glow/Premium — Glass morphism with glow effect
// ═══════════════════════════════════════════════════════════════
function Style6() {
  return (
    <div className="space-y-3">
      {[
        { title: "أحلم بطفل", desc: "٨ أدوات ذكية", glow: "shadow-[0_0_20px_-4px_hsl(340,60%,60%,0.3)]", border: "border-rose-200/50 dark:border-rose-800/30" },
        { title: "حملي", desc: "١٥ أداة ذكية", glow: "shadow-[0_0_20px_-4px_hsl(340,65%,52%,0.35)]", border: "border-pink-200/50 dark:border-pink-800/30" },
        { title: "ما بعد الولادة", desc: "١٢ أداة ذكية", glow: "shadow-[0_0_20px_-4px_hsl(310,40%,55%,0.3)]", border: "border-purple-200/50 dark:border-purple-800/30" },
      ].map((item, i) => (
        <div key={i} className={`rounded-2xl bg-card/80 backdrop-blur-sm border ${item.border} ${item.glow} overflow-hidden`}>
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/10 flex items-center justify-center">
                <Heart className="w-4.5 h-4.5 text-primary" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground/40" />
          </div>
          {i === 1 && <MiniTools />}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN DEMO PAGE
// ═══════════════════════════════════════════════════════════════
const styles = [
  { id: 1, label: "نمط Flo Health — بطاقة مدورة مع أيقونة ملونة", ref: "Flo Health", Component: Style1 },
  { id: 2, label: "نمط Apple Health — شريط جانبي ملون", ref: "Apple Health", Component: Style2 },
  { id: 3, label: "نمط Clue — هيدر متدرج كامل العرض", ref: "Clue App", Component: Style3 },
  { id: 4, label: "نمط BabyCenter — بطاقة أفقية مع إيموجي", ref: "BabyCenter", Component: Style4 },
  { id: 5, label: "نمط Ovia — شريط علوي ملون", ref: "Ovia Pregnancy", Component: Style5 },
  { id: 6, label: "نمط Premium — توهج زجاجي", ref: "Premium Glass", Component: Style6 },
];

export default function CardStylesDemo() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-50 bg-card border-b border-border/30 flex items-center gap-3 px-4 h-14">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground rtl-flip" />
        </button>
        <h1 className="text-sm font-bold text-foreground">نماذج تصميم البطاقات</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-8">
        {styles.map(({ id, label, ref, Component }) => (
          <section key={id}>
            <div className="mb-3 flex items-baseline gap-2">
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">{id}</span>
              <div>
                <h2 className="text-sm font-bold text-foreground">{label}</h2>
                <p className="text-[11px] text-muted-foreground">مستوحى من {ref}</p>
              </div>
            </div>
            <Component />
            <div className="mt-2 h-px bg-border/30" />
          </section>
        ))}
      </div>
    </div>
  );
}
