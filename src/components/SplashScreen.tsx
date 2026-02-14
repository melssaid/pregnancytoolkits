import { motion } from "framer-motion";
import logo from "@/assets/logo.png";

const SplashScreen = ({ onComplete }: { onComplete?: () => void }) => {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-cyan-600 via-teal-500 to-emerald-400 overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      onAnimationComplete={onComplete}
    >
      {/* Background animated circles */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full bg-white/5"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 3, opacity: [0, 0.15, 0] }}
        transition={{ duration: 2.5, ease: "easeOut", delay: 0.2 }}
      />
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full bg-white/8"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 4, opacity: [0, 0.1, 0] }}
        transition={{ duration: 3, ease: "easeOut", delay: 0.5 }}
      />

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-white/20"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: [0, 0.6, 0],
            y: [20, -30, -60],
          }}
          transition={{
            duration: 2.5,
            delay: 0.8 + i * 0.2,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Logo container with glow */}
      <motion.div
        className="relative"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 15,
          delay: 0.3,
        }}
      >
        {/* Glow ring */}
        <motion.div
          className="absolute inset-[-16px] rounded-full bg-white/15 blur-xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [0.8, 1.3, 1.1], opacity: [0, 0.5, 0.3] }}
          transition={{ duration: 1.8, delay: 0.6, ease: "easeOut" }}
        />

        {/* Logo */}
        <motion.img
          src={logo}
          alt="Pregnancy Toolkits"
          className="w-28 h-28 rounded-3xl shadow-2xl relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        />

        {/* Shine sweep effect */}
        <motion.div
          className="absolute inset-0 rounded-3xl overflow-hidden z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
            initial={{ x: "-150%" }}
            animate={{ x: "250%" }}
            transition={{ duration: 0.8, delay: 1.2, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>

      {/* App name */}
      <motion.h1
        className="mt-8 text-2xl font-bold text-white tracking-wide"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
      >
        Pregnancy Toolkits
      </motion.h1>

      {/* Tagline */}
      <motion.p
        className="mt-2 text-sm text-white/70 font-light"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.2 }}
      >
        Your complete pregnancy companion
      </motion.p>

      {/* Loading dots */}
      <motion.div
        className="flex gap-1.5 mt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-white/60"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;
