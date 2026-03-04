import { motion } from "framer-motion";
import logoImage from "@/assets/logo.webp";
import { Layout } from "@/components/Layout";

const LogoContainer = ({ children, label }: { children: React.ReactNode; label: string }) => (
  <div className="flex flex-col items-center gap-4">
    <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
      {children}
    </div>
    <p className="text-sm font-bold text-foreground">{label}</p>
  </div>
);

const LogoImage = () => (
  <div className="relative h-14 w-14 rounded-full overflow-hidden shadow-lg ring-[2.5px] ring-white/90 bg-white z-10">
    <img src={logoImage} alt="Logo" className="h-full w-full object-cover scale-[1.35]" />
  </div>
);

// ═══════════════════════════════════════════════════════
// Pattern 1: Real Heartbeat (EKG rhythm)
// ═══════════════════════════════════════════════════════
const HeartbeatPulse = () => (
  <LogoContainer label="1. نبض قلب حقيقي">
    {/* Double-beat like a real heart: lub-dub */}
    <motion.div
      className="absolute inset-0 m-auto h-14 w-14 rounded-full border-2 border-rose-400/40"
      animate={{
        scale: [1, 1.25, 1.1, 1.35, 1],
        opacity: [0.5, 0.3, 0.4, 0.15, 0.5],
      }}
      transition={{
        duration: 1.6,
        repeat: Infinity,
        ease: "easeInOut",
        times: [0, 0.2, 0.35, 0.55, 1],
      }}
    />
    <motion.div
      className="absolute inset-0 m-auto h-14 w-14 rounded-full bg-rose-400/10"
      animate={{
        scale: [1, 1.15, 1.05, 1.2, 1],
        opacity: [0.3, 0.5, 0.3, 0.4, 0.3],
      }}
      transition={{
        duration: 1.6,
        repeat: Infinity,
        ease: "easeInOut",
        times: [0, 0.2, 0.35, 0.55, 1],
      }}
    />
    <LogoImage />
  </LogoContainer>
);

// ═══════════════════════════════════════════════════════
// Pattern 2: Breathing Glow (no rings)
// ═══════════════════════════════════════════════════════
const BreathingGlow = () => (
  <LogoContainer label="2. هالة متوهجة متنفسة">
    <motion.div
      className="absolute inset-0 m-auto h-20 w-20 rounded-full bg-gradient-to-br from-rose-400/30 via-pink-300/20 to-rose-300/10 blur-xl"
      animate={{
        scale: [0.9, 1.15, 0.9],
        opacity: [0.4, 0.8, 0.4],
      }}
      transition={{
        duration: 3.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
    <motion.div
      className="absolute inset-0 m-auto h-16 w-16 rounded-full bg-rose-300/15 blur-md"
      animate={{
        scale: [1, 1.1, 1],
        opacity: [0.5, 0.7, 0.5],
      }}
      transition={{
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 0.5,
      }}
    />
    <LogoImage />
  </LogoContainer>
);

// ═══════════════════════════════════════════════════════
// Pattern 3: Orbital Particles
// ═══════════════════════════════════════════════════════
const OrbitalParticles = () => {
  const particles = [0, 1, 2, 3, 4, 5];
  return (
    <LogoContainer label="3. جزيئات دوّارة">
      {/* Orbit ring */}
      <motion.div
        className="absolute inset-0 m-auto h-[80px] w-[80px] rounded-full border border-rose-300/15"
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      />
      {/* Particles */}
      {particles.map((i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            top: "50%",
            left: "50%",
          }}
          animate={{
            x: [
              Math.cos((i / particles.length) * Math.PI * 2) * 40,
              Math.cos(((i + 1) / particles.length) * Math.PI * 2) * 40,
              Math.cos(((i + 2) / particles.length) * Math.PI * 2) * 40,
            ],
            y: [
              Math.sin((i / particles.length) * Math.PI * 2) * 40,
              Math.sin(((i + 1) / particles.length) * Math.PI * 2) * 40,
              Math.sin(((i + 2) / particles.length) * Math.PI * 2) * 40,
            ],
            opacity: [0.3, 0.8, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            delay: (i / particles.length) * 6,
            ease: "easeInOut",
          }}
        >
          <div className="w-[5px] h-[5px] rounded-full bg-gradient-to-br from-rose-400 to-pink-400 shadow-sm shadow-rose-400/50" />
        </motion.div>
      ))}
      <LogoImage />
    </LogoContainer>
  );
};

// ═══════════════════════════════════════════════════════
// Pattern 4: Water Ripples
// ═══════════════════════════════════════════════════════
const WaterRipples = () => (
  <LogoContainer label="4. موجات مائية">
    {[0, 1, 2, 3].map((i) => (
      <motion.div
        key={i}
        className="absolute inset-0 m-auto h-14 w-14 rounded-full border border-rose-300/30"
        initial={{ scale: 1, opacity: 0 }}
        animate={{
          scale: [1, 1.8, 2.5],
          opacity: [0.5, 0.25, 0],
          borderWidth: ["1.5px", "1px", "0.5px"],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          delay: i * 0.85,
          ease: [0.25, 0.1, 0.25, 1],
        }}
      />
    ))}
    {/* Subtle center glow */}
    <motion.div
      className="absolute inset-0 m-auto h-16 w-16 rounded-full bg-rose-300/10 blur-md"
      animate={{ opacity: [0.3, 0.5, 0.3] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    />
    <LogoImage />
  </LogoContainer>
);

export default function LogoPulseDemo() {
  return (
    <Layout showBack>
      <div className="container py-8 pb-24">
        <h1 className="text-xl font-bold text-center text-foreground mb-2">أنماط النبضات</h1>
        <p className="text-sm text-muted-foreground text-center mb-10">اختر النمط المفضل لشعار التطبيق</p>
        
        <div className="grid grid-cols-2 gap-8 max-w-md mx-auto">
          <HeartbeatPulse />
          <BreathingGlow />
          <OrbitalParticles />
          <WaterRipples />
        </div>
      </div>
    </Layout>
  );
}