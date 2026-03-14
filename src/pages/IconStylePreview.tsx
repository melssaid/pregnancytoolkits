import { motion } from "framer-motion";
import { BackButton } from "@/components/BackButton";
import { Home, LayoutDashboard, Sparkles, Menu } from "lucide-react";

const navItems = [
  { id: "home", icon: Home, label: "الرئيسية", active: false },
  { id: "dashboard", icon: LayoutDashboard, label: "الداشبورد", active: true },
  { id: "ai-tools", icon: Sparkles, label: "أدوات AI", active: false },
  { id: "more", icon: Menu, label: "المزيد", active: false },
];

const gradientStyles = [
  {
    id: "pink-glow",
    title: "توهج وردي من الأسفل",
    titleEn: "Pink Bottom Glow",
    desc: "تدرج وردي متوهج من الأسفل للأعلى مع ظل ناعم — مظهر أنثوي دافئ",
    navBg: "bg-gradient-to-t from-[hsl(340,60%,94%)] via-card/95 to-card/95",
    activeBg: "bg-gradient-to-t from-[hsl(340,65%,85%)] to-[hsl(340,40%,93%)]",
    activeIcon: "text-[hsl(340,65%,48%)]",
    activeLabel: "text-[hsl(340,65%,48%)]",
    topLine: "bg-gradient-to-r from-transparent via-[hsl(340,60%,65%)] to-transparent",
    shadow: "shadow-[0_-6px_30px_-5px_hsl(340,60%,60%,0.25)]",
    dot: "bg-[hsl(340,65%,52%)]",
  },
  {
    id: "silver-frost",
    title: "فضي مجمد من الأسفل",
    titleEn: "Silver Frost",
    desc: "تدرج فضي بارد من الأسفل — مظهر عصري معدني أنيق",
    navBg: "bg-gradient-to-t from-[hsl(220,15%,90%)] via-card/95 to-card/95",
    activeBg: "bg-gradient-to-t from-[hsl(220,15%,82%)] to-[hsl(220,8%,92%)]",
    activeIcon: "text-[hsl(220,20%,40%)]",
    activeLabel: "text-[hsl(220,20%,40%)]",
    topLine: "bg-gradient-to-r from-transparent via-[hsl(220,15%,65%)] to-transparent",
    shadow: "shadow-[0_-6px_30px_-5px_hsl(220,15%,50%,0.2)]",
    dot: "bg-[hsl(220,20%,45%)]",
  },
  {
    id: "rose-gold-glow",
    title: "توهج وردي ذهبي",
    titleEn: "Rose Gold Glow",
    desc: "تدرج من الوردي إلى الذهبي من الأسفل — فاخر ودافئ",
    navBg: "bg-gradient-to-t from-[hsl(20,50%,92%)] via-[hsl(340,30%,95%)] to-card/95",
    activeBg: "bg-gradient-to-t from-[hsl(25,55%,85%)] to-[hsl(340,45%,90%)]",
    activeIcon: "text-[hsl(340,50%,45%)]",
    activeLabel: "text-[hsl(340,50%,45%)]",
    topLine: "bg-gradient-to-r from-transparent via-[hsl(340,45%,62%)] to-transparent",
    shadow: "shadow-[0_-6px_30px_-5px_hsl(340,45%,55%,0.22)]",
    dot: "bg-[hsl(340,50%,48%)]",
  },
  {
    id: "lavender-mist",
    title: "ضباب لافندر من الأسفل",
    titleEn: "Lavender Mist",
    desc: "تدرج بنفسجي ناعم من الأسفل — هادئ ورومانسي",
    navBg: "bg-gradient-to-t from-[hsl(280,30%,92%)] via-[hsl(300,15%,95%)] to-card/95",
    activeBg: "bg-gradient-to-t from-[hsl(280,35%,84%)] to-[hsl(300,20%,92%)]",
    activeIcon: "text-[hsl(280,40%,45%)]",
    activeLabel: "text-[hsl(280,40%,45%)]",
    topLine: "bg-gradient-to-r from-transparent via-[hsl(280,35%,62%)] to-transparent",
    shadow: "shadow-[0_-6px_30px_-5px_hsl(280,35%,55%,0.22)]",
    dot: "bg-[hsl(280,40%,50%)]",
  },
];

export default function IconStylePreview() {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/40 px-4 py-3">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-base font-bold text-foreground">معاينة تأثيرات شريط التنقل</h1>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-8">
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          اختر التأثير المفضل لشريط التنقل السفلي — التدرج من الأسفل للأعلى
        </p>

        {gradientStyles.map((style, si) => (
          <motion.div
            key={style.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.12 }}
            className="space-y-2"
          >
            {/* Style info */}
            <div className="px-1">
              <h2 className="text-sm font-bold text-foreground">{style.title}</h2>
              <p className="text-[10px] text-muted-foreground">{style.titleEn} — {style.desc}</p>
            </div>

            {/* Simulated bottom nav */}
            <div className="rounded-2xl border border-border/40 overflow-hidden bg-muted/20">
              {/* Fake page content above */}
              <div className="px-4 py-6 space-y-2">
                <div className="h-3 w-24 rounded-full bg-muted/50" />
                <div className="h-2.5 w-full rounded-full bg-muted/30" />
                <div className="h-2.5 w-3/4 rounded-full bg-muted/30" />
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="h-12 rounded-xl bg-muted/30" />
                  ))}
                </div>
              </div>

              {/* Bottom nav preview */}
              <div className="relative">
                {/* Top accent line */}
                <div className={`absolute top-0 left-6 right-6 h-[2px] ${style.topLine} z-10`} />
                
                {/* Nav background */}
                <div className={`relative ${style.navBg} ${style.shadow} backdrop-blur-xl`}>
                  <div className="flex items-center justify-evenly px-2 py-2">
                    {navItems.map((item, idx) => {
                      const Icon = item.icon;
                      const isActive = item.active;
                      
                      return (
                        <div key={item.id} className="flex flex-col items-center gap-0 px-3 py-0.5">
                          <div className={`relative p-2.5 rounded-xl transition-all ${isActive ? style.activeBg : ''}`}>
                            <Icon 
                              className={`w-5 h-5 ${isActive ? style.activeIcon : 'text-foreground/40'}`}
                              strokeWidth={isActive ? 2.2 : 1.8}
                            />
                            {isActive && (
                              <div className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 ${style.dot} rounded-full`} />
                            )}
                          </div>
                          <span className={`text-[9px] font-medium ${isActive ? style.activeLabel : 'text-foreground/40'}`}>
                            {item.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
