import { motion } from "framer-motion";
import { BackButton } from "@/components/BackButton";
import { 
  Scale, Activity, Heart, Droplets, Hand, TrendingUp, 
  Pill, Bell, Moon, Baby, Camera, FileText, Briefcase, Brain, Ruler, Database
} from "lucide-react";

// QuickStats icons
const quickStatIcons = [
  { Icon: Scale, label: "الوزن", value: "65 kg" },
  { Icon: Activity, label: "الركلات", value: "12" },
  { Icon: Heart, label: "المزاج", value: "😊" },
  { Icon: Droplets, label: "الماء", value: "5/8" },
];

// Tracking tool icons
const trackingIcons = [
  { Icon: Hand, label: "عداد الركلات" },
  { Icon: Scale, label: "تتبع الوزن" },
  { Icon: Pill, label: "الفيتامينات" },
  { Icon: Bell, label: "المواعيد" },
  { Icon: FileText, label: "خطة الولادة" },
  { Icon: Briefcase, label: "حقيبة المستشفى" },
  { Icon: TrendingUp, label: "نمو الجنين" },
  { Icon: Ruler, label: "نمو الطفل" },
  { Icon: Camera, label: "صور البطن" },
  { Icon: Moon, label: "نوم الطفل" },
  { Icon: Baby, label: "الحفاضات" },
  { Icon: Brain, label: "بكاء الطفل" },
];

const gradientStyles = [
  {
    id: "soft-pink",
    title: "وردي ناعم → شفاف",
    titleEn: "Soft Pink Fade",
    desc: "تدرج من الوردي الفاتح إلى الشفاف مع ظل خفيف — مظهر أنثوي راقي",
    iconBg: "bg-gradient-to-br from-[hsl(340,60%,92%)] to-[hsl(340,30%,97%)] shadow-[0_2px_6px_-2px_hsl(340,50%,70%,0.2)]",
    iconColor: "text-[hsl(340,55%,55%)]",
    accent: "from-[hsl(340,60%,75%)] to-[hsl(340,40%,90%)]",
  },
  {
    id: "silver",
    title: "رمادي فضي → أبيض",
    titleEn: "Silver Metallic",
    desc: "تدرج فضي معدني أنيق — مظهر عصري واحترافي",
    iconBg: "bg-gradient-to-br from-[hsl(220,12%,87%)] to-[hsl(220,5%,96%)] shadow-[0_2px_6px_-2px_hsl(220,10%,55%,0.15)]",
    iconColor: "text-[hsl(220,15%,45%)]",
    accent: "from-[hsl(220,12%,72%)] to-[hsl(220,5%,88%)]",
  },
  {
    id: "rose-gold",
    title: "وردي ذهبي",
    titleEn: "Rose Gold",
    desc: "تدرج من الوردي إلى الذهبي الدافئ — فاخر ومميز",
    iconBg: "bg-gradient-to-br from-[hsl(340,50%,88%)] to-[hsl(30,45%,90%)] shadow-[0_2px_6px_-2px_hsl(340,40%,60%,0.18)]",
    iconColor: "text-[hsl(340,50%,48%)]",
    accent: "from-[hsl(340,50%,72%)] to-[hsl(30,45%,78%)]",
  },
  {
    id: "gray-pink",
    title: "رمادي + وردي مختلط",
    titleEn: "Gray & Pink Mix",
    desc: "خلفية رمادية مع لمسة وردية خفيفة — متوازن وأنيق",
    iconBg: "bg-gradient-to-br from-[hsl(240,5%,91%)] to-[hsl(340,25%,92%)] shadow-[0_2px_6px_-2px_hsl(300,12%,55%,0.12)]",
    iconColor: "text-[hsl(330,30%,45%)]",
    accent: "from-[hsl(240,5%,78%)] to-[hsl(340,25%,82%)]",
  },
];

export default function IconStylePreview() {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/40 px-4 py-3">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-base font-bold text-foreground">معاينة تدرجات أيقونات الداشبورد</h1>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-6">
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          اختر النمط المفضل لأيقونات الداشبورد
        </p>

        {gradientStyles.map((style, si) => (
          <motion.div
            key={style.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.12 }}
            className="rounded-2xl border border-border/40 bg-card overflow-hidden"
          >
            {/* Style header */}
            <div className="px-4 pt-4 pb-2">
              <div className="flex items-center gap-2 mb-1">
                <div className={`h-1.5 w-10 rounded-full bg-gradient-to-r ${style.accent}`} />
                <h2 className="text-sm font-bold text-foreground">{style.title}</h2>
              </div>
              <p className="text-[10px] text-muted-foreground">{style.titleEn} — {style.desc}</p>
            </div>

            {/* ── Section 1: QuickStats preview ── */}
            <div className="px-4 py-3">
              <p className="text-[9px] font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-primary" />
                الإحصائيات السريعة
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {quickStatIcons.map((stat, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center p-2.5 rounded-xl bg-card border border-border/40 text-center"
                  >
                    <div className={`w-7 h-7 rounded-lg ${style.iconBg} flex items-center justify-center mb-1.5`}>
                      <stat.Icon className={`w-3.5 h-3.5 ${style.iconColor}`} />
                    </div>
                    <p className="text-[10px] font-bold text-foreground leading-none">{stat.value}</p>
                    <p className="text-[8px] text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Section 2: Tracking tools preview ── */}
            <div className="px-4 pb-4">
              <p className="text-[9px] font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-primary" />
                <Database className="w-3 h-3" />
                أدوات التتبع
              </p>
              <div className="grid grid-cols-4 gap-2">
                {trackingIcons.map((tool, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: si * 0.1 + i * 0.025 }}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className={`w-9 h-9 rounded-xl ${style.iconBg} flex items-center justify-center`}>
                      <tool.Icon className={`w-4 h-4 ${style.iconColor}`} strokeWidth={1.8} />
                    </div>
                    <span className="text-[8px] text-muted-foreground text-center leading-tight">{tool.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
