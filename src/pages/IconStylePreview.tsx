import { Scale, Activity, Heart, Droplets, Calendar, Ruler, Moon, Bell, TrendingUp, Pill } from "lucide-react";
import { motion } from "framer-motion";
import { BackButton } from "@/components/BackButton";

const icons = [Scale, Activity, Heart, Droplets, Calendar, Ruler, Moon, Bell, TrendingUp, Pill];
const iconNames = ["ميزان", "نشاط", "قلب", "ماء", "تقويم", "مسطرة", "قمر", "جرس", "تطور", "فيتامين"];

const styles = [
  {
    id: "soft-pink",
    title: "وردي ناعم → شفاف",
    titleEn: "Soft Pink Fade",
    desc: "تدرج من الوردي الفاتح إلى الشفاف مع ظل خفيف — مظهر أنثوي راقي",
    containerClass: "bg-gradient-to-br from-pink-200/60 to-transparent shadow-sm shadow-pink-200/30",
    iconClass: "text-pink-500",
    cardBorder: "border-pink-200/40",
    accent: "from-pink-300 to-pink-100",
  },
  {
    id: "silver",
    title: "رمادي فضي → أبيض",
    titleEn: "Silver Metallic",
    desc: "تدرج فضي معدني أنيق يعطي مظهر عصري واحترافي",
    containerClass: "bg-gradient-to-br from-gray-200 to-white border border-gray-200/50 shadow-sm shadow-gray-200/20",
    iconClass: "text-gray-600",
    cardBorder: "border-gray-200/60",
    accent: "from-gray-300 to-gray-100",
  },
  {
    id: "rose-gold",
    title: "وردي ذهبي",
    titleEn: "Rose Gold",
    desc: "تدرج من الوردي إلى الذهبي الدافئ — فاخر ومميز",
    containerClass: "bg-gradient-to-br from-pink-300/40 to-amber-200/30 shadow-sm shadow-rose-200/20",
    iconClass: "text-rose-500",
    cardBorder: "border-rose-200/50",
    accent: "from-rose-300 to-amber-200",
  },
  {
    id: "gray-pink",
    title: "رمادي + وردي مختلط",
    titleEn: "Gray & Pink Mix",
    desc: "خلفية رمادية مع لمسة وردية خفيفة — متوازن وأنيق",
    containerClass: "bg-gradient-to-br from-gray-100 to-pink-100/50 border border-pink-100/30",
    iconClass: "text-pink-600/80",
    cardBorder: "border-gray-200/40",
    accent: "from-gray-200 to-pink-200",
  },
];

export default function IconStylePreview() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/40 px-4 py-3">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-base font-bold text-foreground">معاينة تدرجات الأيقونات</h1>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-5">
        <p className="text-xs text-muted-foreground text-center">اختر النمط المفضل لأيقونات الداشبورد</p>

        {styles.map((style, si) => (
          <motion.div
            key={style.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.1 }}
            className={`rounded-2xl border ${style.cardBorder} bg-card p-4 space-y-3`}
          >
            {/* Header bar */}
            <div className="flex items-center gap-2">
              <div className={`h-1 w-8 rounded-full bg-gradient-to-r ${style.accent}`} />
              <div>
                <h2 className="text-sm font-bold text-foreground">{style.title}</h2>
                <p className="text-[10px] text-muted-foreground">{style.titleEn}</p>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">{style.desc}</p>

            {/* Icon grid */}
            <div className="grid grid-cols-5 gap-2">
              {icons.slice(0, 10).map((Icon, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: si * 0.1 + i * 0.03 }}
                  className="flex flex-col items-center gap-1"
                >
                  <div className={`w-9 h-9 rounded-xl ${style.containerClass} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${style.iconClass}`} />
                  </div>
                  <span className="text-[8px] text-muted-foreground">{iconNames[i]}</span>
                </motion.div>
              ))}
            </div>

            {/* Simulated dashboard row */}
            <div className="mt-2 p-2.5 rounded-xl bg-muted/30 border border-border/30">
              <p className="text-[9px] text-muted-foreground mb-2">معاينة داخل الداشبورد:</p>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { Icon: Scale, label: "الوزن", value: "65 kg" },
                  { Icon: Activity, label: "الركلات", value: "12" },
                  { Icon: Heart, label: "المزاج", value: "😊" },
                  { Icon: Droplets, label: "الماء", value: "5/8" },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center p-2 rounded-xl bg-card border border-border/40 text-center"
                  >
                    <div className={`w-7 h-7 rounded-lg ${style.containerClass} flex items-center justify-center mb-1`}>
                      <stat.Icon className={`w-3.5 h-3.5 ${style.iconClass}`} />
                    </div>
                    <p className="text-[10px] font-bold text-foreground">{stat.value}</p>
                    <p className="text-[8px] text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
