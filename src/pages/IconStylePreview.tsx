import { motion } from "framer-motion";
import { BackButton } from "@/components/BackButton";
import { useTranslation } from "react-i18next";

const sampleTools = [
  { icon: "/icons/pregnancy-tips.png", name: "مساعد الحمل" },
  { icon: "/icons/symptom-analyzer.png", name: "يوميات العافية" },
  { icon: "/icons/meal-suggestion.png", name: "وجبات مقترحة" },
  { icon: "/icons/kick-counter.png", name: "عداد الركلات" },
  { icon: "/icons/fetal-growth.png", name: "نمو الجنين" },
  { icon: "/icons/hospital-bag.png", name: "حقيبة المستشفى" },
];

const gradientStyles = [
  {
    id: "soft-pink",
    title: "وردي ناعم → شفاف",
    titleEn: "Soft Pink Fade",
    desc: "تدرج من الوردي الفاتح إلى الشفاف مع ظل خفيف — مظهر أنثوي راقي",
    containerClass: "bg-gradient-to-br from-[hsl(340,60%,92%)] to-[hsl(340,40%,97%)] shadow-[0_2px_8px_-2px_hsl(340,50%,70%,0.2)]",
    containerDark: "dark:from-[hsl(340,30%,18%)] dark:to-[hsl(340,20%,14%)]",
    borderClass: "border border-[hsl(340,40%,88%)] dark:border-[hsl(340,20%,22%)]",
    accent: "from-[hsl(340,60%,75%)] to-[hsl(340,40%,90%)]",
  },
  {
    id: "silver",
    title: "رمادي فضي → أبيض",
    titleEn: "Silver Metallic",
    desc: "تدرج فضي معدني أنيق يعطي مظهر عصري واحترافي",
    containerClass: "bg-gradient-to-br from-[hsl(220,10%,88%)] to-[hsl(220,5%,96%)] shadow-[0_2px_8px_-2px_hsl(220,10%,60%,0.15)]",
    containerDark: "dark:from-[hsl(220,8%,20%)] dark:to-[hsl(220,5%,15%)]",
    borderClass: "border border-[hsl(220,10%,85%)] dark:border-[hsl(220,8%,24%)]",
    accent: "from-[hsl(220,10%,75%)] to-[hsl(220,5%,90%)]",
  },
  {
    id: "rose-gold",
    title: "وردي ذهبي",
    titleEn: "Rose Gold",
    desc: "تدرج من الوردي إلى الذهبي الدافئ — فاخر ومميز",
    containerClass: "bg-gradient-to-br from-[hsl(340,50%,88%)] to-[hsl(30,50%,90%)] shadow-[0_2px_8px_-2px_hsl(340,40%,65%,0.2)]",
    containerDark: "dark:from-[hsl(340,30%,18%)] dark:to-[hsl(30,25%,16%)]",
    borderClass: "border border-[hsl(340,35%,85%)] dark:border-[hsl(340,20%,22%)]",
    accent: "from-[hsl(340,50%,72%)] to-[hsl(30,50%,78%)]",
  },
  {
    id: "gray-pink",
    title: "رمادي + وردي مختلط",
    titleEn: "Gray & Pink Mix",
    desc: "خلفية رمادية مع لمسة وردية خفيفة على الحواف — متوازن وأنيق",
    containerClass: "bg-gradient-to-br from-[hsl(240,5%,92%)] to-[hsl(340,30%,93%)] shadow-[0_2px_8px_-2px_hsl(300,15%,60%,0.12)]",
    containerDark: "dark:from-[hsl(240,5%,16%)] dark:to-[hsl(340,15%,16%)]",
    borderClass: "border border-[hsl(280,10%,87%)] dark:border-[hsl(280,8%,22%)]",
    accent: "from-[hsl(240,5%,78%)] to-[hsl(340,30%,82%)]",
  },
];

export default function IconStylePreview() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/40 px-4 py-3">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-base font-bold text-foreground">معاينة تدرجات الأيقونات</h1>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-5">
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          اختر النمط المفضل لأيقونات الأدوات في الصفحة الرئيسية
        </p>

        {gradientStyles.map((style, si) => (
          <motion.div
            key={style.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.1 }}
            className="rounded-2xl border border-border/40 bg-card p-4 space-y-3"
          >
            {/* Style title */}
            <div className="flex items-center gap-2">
              <div className={`h-1.5 w-10 rounded-full bg-gradient-to-r ${style.accent}`} />
              <div>
                <h2 className="text-sm font-bold text-foreground">{style.title}</h2>
                <p className="text-[10px] text-muted-foreground">{style.titleEn}</p>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{style.desc}</p>

            {/* Simulated tool rows — matching homepage layout */}
            <div className="space-y-2 pt-1">
              {sampleTools.map((tool, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: si * 0.1 + i * 0.04 }}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-card/60 border border-border/10 shadow-[0_1px_3px_0_hsl(0,0%,0%,0.04)]"
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${style.containerClass} ${style.containerDark} ${style.borderClass} flex items-center justify-center`}>
                    <img
                      src={tool.icon}
                      alt=""
                      className="w-6 h-6 object-contain opacity-80"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[13px] font-bold text-foreground leading-snug">{tool.name}</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">وصف الأداة التوضيحي</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
