import { motion } from "framer-motion";
import logoImage from "@/assets/logo.webp";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/* ───── 1. Morphing Glow ───── */
function MorphingGlow({ size }: { size: number }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size * 1.8, height: size * 1.8 }}>
      {/* Morphing blob */}
      <motion.div
        className="absolute rounded-full bg-primary/20 blur-xl"
        style={{ width: size * 1.4, height: size * 1.4 }}
        animate={{
          borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 50%", "70% 30% 40% 60% / 50% 60% 30% 70%", "40% 60% 70% 30% / 40% 50% 60% 50%"],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full bg-primary/10 blur-lg"
        style={{ width: size * 1.6, height: size * 1.6 }}
        animate={{
          borderRadius: ["60% 40% 30% 70% / 60% 50% 40% 50%", "30% 70% 60% 40% / 50% 40% 70% 30%", "60% 40% 30% 70% / 60% 50% 40% 50%"],
          scale: [1.05, 0.95, 1.05],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative rounded-full overflow-hidden shadow-lg" style={{ width: size, height: size }}>
        <img src={logoImage} alt="Logo" className="w-full h-full object-cover scale-[1.35]" />
      </div>
    </div>
  );
}

/* ───── 2. 3D Flip Entrance ───── */
function FlipEntrance({ size }: { size: number }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size * 1.5, height: size * 1.5, perspective: 600 }}>
      <motion.div
        className="absolute rounded-full bg-primary/15 blur-md"
        style={{ width: size * 1.2, height: size * 1.2 }}
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="rounded-full overflow-hidden shadow-xl"
        style={{ width: size, height: size }}
        initial={{ rotateY: 180, opacity: 0, scale: 0.5 }}
        animate={{ rotateY: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <motion.div
          className="w-full h-full"
          animate={{ rotateY: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        >
          <img src={logoImage} alt="Logo" className="w-full h-full object-cover scale-[1.35]" />
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ───── 3. Liquid Ripple ───── */
function LiquidRipple({ size }: { size: number }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size * 2, height: size * 2 }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border-2 border-primary/30"
          style={{ width: size, height: size }}
          animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.8, ease: "easeOut" }}
        />
      ))}
      <div className="relative rounded-full overflow-hidden shadow-lg ring-2 ring-primary/20" style={{ width: size, height: size }}>
        <img src={logoImage} alt="Logo" className="w-full h-full object-cover scale-[1.35]" />
      </div>
    </div>
  );
}

/* ───── 4. Floating Particles ───── */
function FloatingParticles({ size }: { size: number }) {
  const particles = Array.from({ length: 6 }, (_, i) => i);
  return (
    <div className="relative flex items-center justify-center" style={{ width: size * 2, height: size * 2 }}>
      {/* Rotating ring */}
      <motion.div
        className="absolute rounded-full border border-primary/15"
        style={{ width: size * 1.5, height: size * 1.5 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      {/* Particles */}
      {particles.map((i) => {
        const angle = (i / 6) * 360;
        const radius = size * 0.85;
        return (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/60 shadow-[0_0_8px_2px_hsl(var(--primary)/0.4)]"
            animate={{
              x: [
                Math.cos((angle * Math.PI) / 180) * radius,
                Math.cos(((angle + 360) * Math.PI) / 180) * radius,
              ],
              y: [
                Math.sin((angle * Math.PI) / 180) * radius,
                Math.sin(((angle + 360) * Math.PI) / 180) * radius,
              ],
              scale: [0.8, 1.3, 0.8],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              x: { duration: 8, repeat: Infinity, ease: "linear" },
              y: { duration: 8, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 },
              opacity: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 },
            }}
          />
        );
      })}
      {/* Aura */}
      <motion.div
        className="absolute rounded-full bg-primary/8 blur-lg"
        style={{ width: size * 1.3, height: size * 1.3 }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative rounded-full overflow-hidden shadow-lg" style={{ width: size, height: size }}>
        <img src={logoImage} alt="Logo" className="w-full h-full object-cover scale-[1.35]" />
      </div>
    </div>
  );
}

/* ───── 5. Breathing Pulse ───── */
function BreathingPulse({ size }: { size: number }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size * 1.8, height: size * 1.8 }}>
      <motion.div
        className="absolute rounded-full bg-primary/12"
        style={{ width: size * 1.4, height: size * 1.4 }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="rounded-full overflow-hidden shadow-xl ring-2 ring-primary/25"
        style={{ width: size, height: size }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <img src={logoImage} alt="Logo" className="w-full h-full object-cover scale-[1.35]" />
      </motion.div>
    </div>
  );
}

const effects = [
  { name: "Morphing Glow", nameAr: "توهج متحول", component: MorphingGlow, desc: "هالة متغيرة الشكل بتدرجات وردية ناعمة" },
  { name: "3D Flip Entrance", nameAr: "دوران ثلاثي الأبعاد", component: FlipEntrance, desc: "تأثير دوران عند الدخول مع اهتزاز خفيف" },
  { name: "Liquid Ripple", nameAr: "موجات سائلة", component: LiquidRipple, desc: "موجات دائرية تنبض من المركز" },
  { name: "Floating Particles", nameAr: "جسيمات عائمة", component: FloatingParticles, desc: "نقاط متوهجة تدور حول اللوجو (الحالي)" },
  { name: "Breathing Pulse", nameAr: "نبض هادئ", component: BreathingPulse, desc: "تأثير تنفس بسيط وأنيق" },
];

const sizes = [
  { label: "h-14 (3.5rem)", px: 56 },
  { label: "h-16 (4rem)", px: 64 },
  { label: "h-20 (5rem)", px: 80 },
];

export default function LogoMotionPreview() {
  return (
    <div className="min-h-screen bg-background p-4 pb-24" dir="rtl">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center space-y-2 pt-4">
          <h1 className="text-xl font-extrabold text-foreground">معاينة تأثيرات اللوجو</h1>
          <p className="text-sm text-muted-foreground">اختر التأثير والحجم المناسب</p>
        </div>

        <Link to="/" className="flex items-center justify-center gap-2 text-sm text-primary font-medium">
          <ArrowRight className="w-4 h-4" />
          العودة للرئيسية
        </Link>

        {effects.map((effect) => (
          <motion.div
            key={effect.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-border bg-card p-5 space-y-4"
          >
            <div className="text-center">
              <h2 className="text-base font-bold text-foreground">{effect.nameAr}</h2>
              <p className="text-xs text-muted-foreground mt-1">{effect.desc}</p>
              <p className="text-[10px] text-primary/60 font-mono mt-0.5">{effect.name}</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {sizes.map((s) => (
                <div key={s.label} className="flex flex-col items-center gap-2">
                  <p className="text-[10px] text-muted-foreground font-medium">{s.label}</p>
                  <div className="flex items-center justify-center min-h-[120px]">
                    <effect.component size={s.px} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
