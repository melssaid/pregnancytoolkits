import { motion } from "framer-motion";

/**
 * Premium realistic eye icon with ultra-slow blink animation.
 * Inspired by high-end motion design — organic, cinematic feel.
 */
const DreamEyeIcon = ({ className = "w-6 h-6" }: { className?: string }) => {
  // Ultra-slow blink timing (cinematic feel)
  const blinkTransition = {
    duration: 5,
    repeat: Infinity,
    repeatDelay: 2.5,
    times: [0, 0.04, 0.08, 0.12, 1],
    ease: [0.4, 0, 0.2, 1] as const,
  };

  return (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <defs>
        {/* Iris radial gradient — warm amber/hazel */}
        <radialGradient id="irisGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C8956A" />
          <stop offset="35%" stopColor="#8B6914" />
          <stop offset="65%" stopColor="#5C4A1E" />
          <stop offset="100%" stopColor="#2A1F0E" />
        </radialGradient>

        {/* Pupil depth gradient */}
        <radialGradient id="pupilGrad" cx="45%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#1a1a2e" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>

        {/* Corneal light reflection */}
        <radialGradient id="reflectionGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.95" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>

        {/* Sclera (white of eye) subtle gradient */}
        <radialGradient id="scleraGrad" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#F5EDE6" />
          <stop offset="100%" stopColor="#E8DDD4" />
        </radialGradient>

        {/* Clip path for the eye opening shape */}
        <clipPath id="eyeClip">
          <path d="M10,50 Q30,25 50,22 Q70,25 90,50 Q70,75 50,78 Q30,75 10,50 Z" />
        </clipPath>
      </defs>

      {/* === Sclera (white of the eye) === */}
      <path
        d="M10,50 Q30,25 50,22 Q70,25 90,50 Q70,75 50,78 Q30,75 10,50 Z"
        fill="url(#scleraGrad)"
      />

      {/* === Subtle blood vessel hints === */}
      <g clipPath="url(#eyeClip)" opacity={0.08}>
        <path d="M12,48 Q20,44 30,46" stroke="#C4736A" strokeWidth="0.4" fill="none" />
        <path d="M88,48 Q80,43 72,45" stroke="#C4736A" strokeWidth="0.3" fill="none" />
        <path d="M14,53 Q22,56 28,54" stroke="#C4736A" strokeWidth="0.3" fill="none" />
      </g>

      {/* === Iris === */}
      <circle cx="50" cy="50" r="16" fill="url(#irisGrad)" />

      {/* === Iris texture rings === */}
      <circle cx="50" cy="50" r="14" fill="none" stroke="#6B5220" strokeWidth="0.3" opacity={0.3} />
      <circle cx="50" cy="50" r="11" fill="none" stroke="#8B7030" strokeWidth="0.2" opacity={0.25} />
      <circle cx="50" cy="50" r="8.5" fill="none" stroke="#4A3510" strokeWidth="0.4" opacity={0.2} />

      {/* Iris fiber lines (radial pattern) */}
      <g opacity={0.12} clipPath="url(#eyeClip)">
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * 15) * Math.PI / 180;
          const x1 = 50 + Math.cos(angle) * 6;
          const y1 = 50 + Math.sin(angle) * 6;
          const x2 = 50 + Math.cos(angle) * 15.5;
          const y2 = 50 + Math.sin(angle) * 15.5;
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#7A6020" strokeWidth="0.3" />
          );
        })}
      </g>

      {/* === Pupil === */}
      <motion.circle
        cx="50"
        cy="50"
        r="6.5"
        fill="url(#pupilGrad)"
        animate={{ r: [6.5, 5.5, 6.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* === Corneal reflections (life-like catchlights) === */}
      <ellipse cx="44" cy="43" rx="3" ry="2.5" fill="url(#reflectionGrad)" opacity={0.85} />
      <ellipse cx="55" cy="56" rx="1.2" ry="1" fill="white" opacity={0.3} />

      {/* === Eyelid outline (almond shape) === */}
      <path
        d="M10,50 Q30,25 50,22 Q70,25 90,50"
        fill="none"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity={0.9}
      />
      <path
        d="M10,50 Q30,75 50,78 Q70,75 90,50"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity={0.7}
      />

      {/* === Upper eyelash hints === */}
      <g stroke="white" strokeWidth="1" strokeLinecap="round" opacity={0.6}>
        <line x1="22" y1="36" x2="19" y2="32" />
        <line x1="35" y1="27" x2="33" y2="22" />
        <line x1="50" y1="22" x2="50" y2="17" />
        <line x1="65" y1="27" x2="67" y2="22" />
        <line x1="78" y1="36" x2="81" y2="32" />
      </g>

      {/* === BLINK: Upper eyelid closing overlay === */}
      <motion.path
        d="M8,50 Q30,25 50,22 Q70,25 92,50 L92,10 Q70,10 50,10 Q30,10 8,10 Z"
        fill="hsl(15, 70%, 62%)"
        animate={{
          y: [0, 0, 52, 52, 0, 0],
        }}
        transition={blinkTransition}
        style={{ transformOrigin: "50px 10px" }}
      />

      {/* === BLINK: Lower eyelid closing overlay === */}
      <motion.path
        d="M8,50 Q30,75 50,78 Q70,75 92,50 L92,95 Q70,95 50,95 Q30,95 8,95 Z"
        fill="hsl(15, 70%, 62%)"
        animate={{
          y: [0, 0, -44, -44, 0, 0],
        }}
        transition={blinkTransition}
        style={{ transformOrigin: "50px 95px" }}
      />

      {/* === BLINK: Eyelid crease line (appears during blink) === */}
      <motion.path
        d="M15,50 Q30,48 50,50 Q70,48 85,50"
        fill="none"
        stroke="white"
        strokeWidth="0.8"
        strokeLinecap="round"
        animate={{
          opacity: [0, 0, 0.6, 0.6, 0, 0],
        }}
        transition={blinkTransition}
      />
    </svg>
  );
};

export default DreamEyeIcon;
