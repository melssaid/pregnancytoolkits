import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronRight, Sparkles, Star, Zap, Crown } from "lucide-react";
import { motion } from "framer-motion";
import PregnancyHeartIcon from "@/components/PregnancyHeartIcon";
import BabyFootprintsIcon from "@/components/BabyFootprintsIcon";
import RockingBabyIcon from "@/components/RockingBabyIcon";

// ═══════════════════════════════════════════════════════════════
// STYLE A: "Elevated Glass" — Premium glassmorphism + glow
// Inspired by: Calm, Headspace premium tiers
// ═══════════════════════════════════════════════════════════════
function StyleA() {
  const cards = [
    {
      title: "أحلم بطفل",
      desc: "٨ أدوات ذكية",
      subtitle: "تخطيط الخصوبة والإباضة",
      icon: <RockingBabyIcon className="w-7 h-7" />,
      gradient: "from-[hsl(15,70%,58%)] via-[hsl(25,65%,60%)] to-[hsl(340,50%,60%)]",
      glow: "hsl(15,70%,58%)",
      ring: "ring-[hsl(15,50%,85%)]",
    },
    {
      title: "حملي",
      desc: "١٥ أداة ذكية",
      subtitle: "متابعة الحمل أسبوعياً",
      icon: <PregnancyHeartIcon className="w-7 h-7" />,
      gradient: "from-[hsl(340,65%,52%)] via-[hsl(345,60%,56%)] to-[hsl(350,55%,58%)]",
      glow: "hsl(340,65%,52%)",
      ring: "ring-[hsl(340,40%,85%)]",
      active: true,
    },
    {
      title: "ما بعد الولادة",
      desc: "١٢ أداة ذكية",
      subtitle: "رعاية الأم والطفل",
      icon: <BabyFootprintsIcon className="w-7 h-7" />,
      gradient: "from-[hsl(310,40%,55%)] via-[hsl(300,35%,58%)] to-[hsl(280,35%,60%)]",
      glow: "hsl(310,40%,55%)",
      ring: "ring-[hsl(310,30%,85%)]",
    },
  ];

  return (
    <div className="space-y-3">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`relative rounded-[20px] overflow-hidden ${card.active ? 'ring-2 ring-primary/30' : ''}`}
          style={card.active ? { boxShadow: `0 0 30px -8px ${card.glow}` } : {}}
        >
          {/* Active badge */}
          {card.active && (
            <div className="absolute top-2 end-2 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm">
              <Sparkles className="w-2.5 h-2.5 text-primary" />
              <span className="text-[9px] font-bold text-primary">مرحلتك</span>
            </div>
          )}

          {/* Glass header */}
          <div className={`bg-gradient-to-r ${card.gradient} p-4 relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent" />
            <div className="absolute -top-8 -end-8 w-32 h-32 rounded-full bg-white/8 blur-3xl" />
            <div className="absolute bottom-0 start-0 end-0 h-px bg-white/20" />

            <div className="relative flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/20">
                {card.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-[17px] font-bold text-white tracking-tight">{card.title}</h3>
                </div>
                <p className="text-[11px] text-white/70 mt-0.5">{card.subtitle}</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm">
                  <Zap className="w-2.5 h-2.5 text-white" />
                  <span className="text-[10px] font-bold text-white">{card.desc}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-white/50" />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STYLE B: "Card Stack" — Layered depth with shadow hierarchy
// Inspired by: Apple Fitness+, Nike Training Club
// ═══════════════════════════════════════════════════════════════
function StyleB() {
  const cards = [
    {
      title: "أحلم بطفل",
      count: 8,
      subtitle: "تخطيط الخصوبة والإباضة",
      icon: <RockingBabyIcon className="w-7 h-7" />,
      accentFrom: "hsl(15,70%,58%)",
      accentTo: "hsl(340,50%,60%)",
      bg: "bg-gradient-to-br from-orange-50 to-pink-50 dark:from-orange-950/20 dark:to-pink-950/20",
    },
    {
      title: "حملي",
      count: 15,
      subtitle: "متابعة الحمل أسبوعياً",
      icon: <PregnancyHeartIcon className="w-7 h-7" />,
      accentFrom: "hsl(340,65%,52%)",
      accentTo: "hsl(350,55%,58%)",
      bg: "bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20",
      active: true,
    },
    {
      title: "ما بعد الولادة",
      count: 12,
      subtitle: "رعاية الأم والطفل",
      icon: <BabyFootprintsIcon className="w-7 h-7" />,
      accentFrom: "hsl(310,40%,55%)",
      accentTo: "hsl(280,35%,60%)",
      bg: "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20",
    },
  ];

  return (
    <div className="space-y-3">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`relative rounded-[20px] overflow-hidden ${card.bg} border border-border/30`}
          style={{
            boxShadow: card.active
              ? `0 8px 32px -8px ${card.accentFrom}40, 0 2px 8px -2px rgba(0,0,0,0.06)`
              : '0 2px 8px -2px rgba(0,0,0,0.06)',
          }}
        >
          {/* Accent top strip */}
          <div
            className="h-1 w-full"
            style={{ background: `linear-gradient(90deg, ${card.accentFrom}, ${card.accentTo})` }}
          />

          <div className="p-4 flex items-center gap-3.5">
            {/* Icon with gradient ring */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${card.accentFrom}15, ${card.accentTo}15)`,
                border: `2px solid ${card.accentFrom}25`,
              }}
            >
              {card.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-bold text-foreground">{card.title}</h3>
                {card.active && (
                  <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">مرحلتك</span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">{card.subtitle}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/60">
                  <Sparkles className="w-2.5 h-2.5 text-primary" />
                  <span className="text-[10px] font-semibold text-foreground">{card.count} أداة AI</span>
                </div>
              </div>
            </div>

            <ChevronDown className="w-4.5 h-4.5 text-muted-foreground/30 flex-shrink-0" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STYLE C: "Immersive Gradient" — Full-bleed gradients with depth
// Inspired by: Flo Premium, Clue Plus
// ═══════════════════════════════════════════════════════════════
function StyleC() {
  const cards = [
    {
      title: "أحلم بطفل",
      count: 8,
      subtitle: "خططي لرحلتك بثقة",
      icon: <RockingBabyIcon className="w-7 h-7" />,
      gradient: "from-[hsl(15,70%,58%)] via-[hsl(20,68%,55%)] to-[hsl(340,50%,55%)]",
    },
    {
      title: "حملي",
      count: 15,
      subtitle: "تابعي كل لحظة",
      icon: <PregnancyHeartIcon className="w-7 h-7" />,
      gradient: "from-[hsl(340,65%,48%)] via-[hsl(345,60%,52%)] to-[hsl(350,55%,55%)]",
      active: true,
    },
    {
      title: "ما بعد الولادة",
      count: 12,
      subtitle: "رعاية تستحقينها",
      icon: <BabyFootprintsIcon className="w-7 h-7" />,
      gradient: "from-[hsl(310,40%,50%)] via-[hsl(300,35%,53%)] to-[hsl(280,35%,56%)]",
    },
  ];

  return (
    <div className="space-y-3">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.12, type: "spring", stiffness: 200 }}
          className={`relative rounded-[22px] overflow-hidden bg-gradient-to-br ${card.gradient}`}
          style={{
            boxShadow: card.active
              ? '0 12px 40px -10px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15)'
              : '0 4px 16px -4px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
          <div className="absolute -top-10 -end-10 w-40 h-40 rounded-full bg-white/8 blur-3xl" />
          <div className="absolute bottom-0 start-0 w-32 h-32 rounded-full bg-white/5 blur-3xl" />
          
          {/* Active indicator */}
          {card.active && (
            <motion.div
              className="absolute top-0 start-0 end-0 h-[3px] bg-gradient-to-r from-white/0 via-white/60 to-white/0"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}

          <div className="relative p-5 flex items-center gap-4">
            <div className="w-[52px] h-[52px] rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg flex-shrink-0">
              {card.icon}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white tracking-tight">{card.title}</h3>
              <p className="text-[11px] text-white/65 mt-0.5">{card.subtitle}</p>
              
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm">
                  <Sparkles className="w-2.5 h-2.5 text-white/90" />
                  <span className="text-[10px] font-bold text-white/90">{card.count} أداة</span>
                </div>
                {card.active && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/25 backdrop-blur-sm">
                    <Crown className="w-2.5 h-2.5 text-white" />
                    <span className="text-[10px] font-bold text-white">مرحلتك</span>
                  </div>
                )}
              </div>
            </div>

            <ChevronDown className="w-5 h-5 text-white/40 flex-shrink-0" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STYLE D: "Minimal Luxe" — Clean white cards with accent highlights
// Inspired by: Oura Ring, Whoop
// ═══════════════════════════════════════════════════════════════
function StyleD() {
  const cards = [
    {
      title: "أحلم بطفل",
      count: 8,
      subtitle: "تخطيط الخصوبة",
      icon: <RockingBabyIcon className="w-6 h-6" />,
      accent: "hsl(15,70%,58%)",
    },
    {
      title: "حملي",
      count: 15,
      subtitle: "متابعة أسبوعية",
      icon: <PregnancyHeartIcon className="w-6 h-6" />,
      accent: "hsl(340,65%,52%)",
      active: true,
    },
    {
      title: "ما بعد الولادة",
      count: 12,
      subtitle: "رعاية شاملة",
      icon: <BabyFootprintsIcon className="w-6 h-6" />,
      accent: "hsl(310,40%,55%)",
    },
  ];

  return (
    <div className="space-y-2.5">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className="relative rounded-2xl bg-card border border-border/40 overflow-hidden"
          style={{
            boxShadow: card.active
              ? `0 4px 20px -6px ${card.accent}30, 0 1px 3px rgba(0,0,0,0.04)`
              : '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          {/* Left accent bar */}
          <div className="absolute start-0 top-3 bottom-3 w-[3px] rounded-full" style={{ background: card.accent }} />

          <div className="flex items-center gap-3 py-3.5 pe-4 ps-5">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${card.accent}12`, border: `1.5px solid ${card.accent}20` }}
            >
              {card.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">{card.title}</h3>
                {card.active && (
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 rounded-full"
                    style={{ background: card.accent }}
                  />
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-muted-foreground">{card.subtitle}</span>
                <span className="text-[10px] text-muted-foreground/50">•</span>
                <span className="text-[10px] font-semibold" style={{ color: card.accent }}>{card.count} أداة AI</span>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-muted-foreground/25 flex-shrink-0 rtl-flip" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN DEMO PAGE
// ═══════════════════════════════════════════════════════════════
const styles = [
  {
    id: "A",
    label: "Elevated Glass",
    desc: "توهج زجاجي مع شارات ذكية — مستوحى من Calm & Headspace",
    psychology: "يعطي إحساس بالفخامة والحصرية، يحفّز الشراء عبر FOMO",
    Component: StyleA,
  },
  {
    id: "B",
    label: "Card Stack",
    desc: "بطاقات مرفوعة مع أيقونات كبيرة — مستوحى من Apple Fitness+",
    psychology: "تصميم نظيف يبني الثقة، عدّاد الأدوات يُظهر القيمة",
    Component: StyleB,
  },
  {
    id: "C",
    label: "Immersive Gradient",
    desc: "تدرجات غامرة بالعرض الكامل — مستوحى من Flo Premium",
    psychology: "التدرجات الغنية تخلق إحساساً عاطفياً وارتباطاً بالعلامة",
    Component: StyleC,
  },
  {
    id: "D",
    label: "Minimal Luxe",
    desc: "بطاقات بيضاء مع لمسات لونية — مستوحى من Oura Ring",
    psychology: "البساطة الفاخرة تجذب الجمهور المستعد للدفع",
    Component: StyleD,
  },
];

export default function PremiumCardsDemo() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-50 bg-card border-b border-border/30 flex items-center gap-3 px-4 h-14">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground rtl-flip" />
        </button>
        <div>
          <h1 className="text-sm font-bold text-foreground">نماذج Premium للبطاقات</h1>
          <p className="text-[10px] text-muted-foreground">اختر النمط الأنسب لتحقيق الربح</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-10">
        {styles.map(({ id, label, desc, psychology, Component }) => (
          <section key={id} className="space-y-3">
            {/* Section header */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-black text-primary">{id}</span>
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">{label}</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
                <div className="flex items-start gap-1 mt-1.5 px-2 py-1 rounded-lg bg-accent/10">
                  <Star className="w-3 h-3 text-accent mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] text-accent font-medium">{psychology}</p>
                </div>
              </div>
            </div>

            {/* Card preview */}
            <div className="rounded-2xl border border-border/30 bg-background/50 p-4">
              <Component />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
