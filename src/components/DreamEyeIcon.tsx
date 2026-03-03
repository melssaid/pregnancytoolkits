import { motion } from "framer-motion";

/**
 * Realistic eye icon with ultra-slow cinematic blink.
 * Eyelid color matches the warm coral header gradient.
 */
const DreamEyeIcon = ({ className = "w-8 h-8" }: { className?: string }) => {
  const blinkTimes = [0, 0.7, 0.75, 0.82, 0.87, 1];
  const blinkTransition = {
    duration: 6,
    repeat: Infinity,
    repeatDelay: 1.5,
    times: blinkTimes,
    ease: "easeInOut" as const,
  };
  const lidColor = "#c4644e"; // matches header gradient tone

  return (
    <svg viewBox="0 0 100 60" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="de-iris" cx="50%" cy="48%" r="50%">
          <stop offset="0%" stopColor="#D4A76A" />
          <stop offset="30%" stopColor="#9B7530" />
          <stop offset="60%" stopColor="#5C4A1E" />
          <stop offset="100%" stopColor="#2A1F0E" />
        </radialGradient>
        <radialGradient id="de-pupil" cx="42%" cy="38%" r="55%">
          <stop offset="0%" stopColor="#111" />
          <stop offset="100%" stopColor="#000" />
        </radialGradient>
        <radialGradient id="de-sclera" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="80%" stopColor="#F0E8E0" />
          <stop offset="100%" stopColor="#E0D5CC" />
        </radialGradient>
        <clipPath id="de-eye-clip">
          <path d="M5,30 Q25,6 50,4 Q75,6 95,30 Q75,54 50,56 Q25,54 5,30Z" />
        </clipPath>
      </defs>

      {/* Sclera */}
      <path d="M5,30 Q25,6 50,4 Q75,6 95,30 Q75,54 50,56 Q25,54 5,30Z" fill="url(#de-sclera)" />

      {/* Subtle veins */}
      <g clipPath="url(#de-eye-clip)" opacity={0.06}>
        <path d="M8,28 Q18,24 26,27" stroke="#B06060" strokeWidth="0.5" />
        <path d="M92,28 Q82,24 74,26" stroke="#B06060" strokeWidth="0.4" />
      </g>

      {/* Iris */}
      <circle cx="50" cy="30" r="14" fill="url(#de-iris)" />

      {/* Iris rings */}
      <circle cx="50" cy="30" r="12" fill="none" stroke="#7A6020" strokeWidth="0.3" opacity={0.25} />
      <circle cx="50" cy="30" r="9" fill="none" stroke="#5A4515" strokeWidth="0.25" opacity={0.2} />

      {/* Iris fibers */}
      <g opacity={0.1} clipPath="url(#de-eye-clip)">
        {Array.from({ length: 20 }).map((_, i) => {
          const a = (i * 18) * Math.PI / 180;
          return (
            <line
              key={i}
              x1={50 + Math.cos(a) * 5}
              y1={30 + Math.sin(a) * 5}
              x2={50 + Math.cos(a) * 13.5}
              y2={30 + Math.sin(a) * 13.5}
              stroke="#8A7030"
              strokeWidth="0.35"
            />
          );
        })}
      </g>

      {/* Pupil with subtle pulse */}
      <motion.circle
        cx="50" cy="30"
        fill="url(#de-pupil)"
        animate={{ r: [5.5, 4.8, 5.5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Catchlights */}
      <ellipse cx="44" cy="25" rx="2.8" ry="2.2" fill="white" opacity={0.85} />
      <ellipse cx="56" cy="34" rx="1" ry="0.8" fill="white" opacity={0.35} />

      {/* Eye outline */}
      <path d="M5,30 Q25,6 50,4 Q75,6 95,30" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity={0.85} />
      <path d="M5,30 Q25,54 50,56 Q75,54 95,30" fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity={0.6} />

      {/* Lashes */}
      <g stroke="white" strokeWidth="0.9" strokeLinecap="round" opacity={0.55}>
        <line x1="18" y1="16" x2="15" y2="10" />
        <line x1="30" y1="8" x2="28" y2="2" />
        <line x1="42" y1="5" x2="41" y2="-1" />
        <line x1="50" y1="4" x2="50" y2="-2" />
        <line x1="58" y1="5" x2="59" y2="-1" />
        <line x1="70" y1="8" x2="72" y2="2" />
        <line x1="82" y1="16" x2="85" y2="10" />
      </g>

      {/* === BLINK upper lid === */}
      <motion.rect
        x="-2" y="-32"
        width="104" height="32"
        fill={lidColor}
        animate={{ y: [-32, -32, 0, 0, -32, -32] }}
        transition={blinkTransition}
      />
      <motion.path
        d="M3,30 Q25,6 50,4 Q75,6 97,30 L97,0 L3,0 Z"
        fill={lidColor}
        animate={{ 
          y: [0, 0, 26, 26, 0, 0],
        }}
        transition={blinkTransition}
      />

      {/* === BLINK lower lid === */}
      <motion.rect
        x="-2" y="60"
        width="104" height="32"
        fill={lidColor}
        animate={{ y: [60, 60, 30, 30, 60, 60] }}
        transition={blinkTransition}
      />
      <motion.path
        d="M3,30 Q25,54 50,56 Q75,54 97,30 L97,60 L3,60 Z"
        fill={lidColor}
        animate={{
          y: [0, 0, -26, -26, 0, 0],
        }}
        transition={blinkTransition}
      />

      {/* Crease line during blink */}
      <motion.path
        d="M12,30 Q30,28 50,30 Q70,28 88,30"
        fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.6" strokeLinecap="round"
        animate={{ opacity: [0, 0, 0.5, 0.5, 0, 0] }}
        transition={blinkTransition}
      />
    </svg>
  );
};

export default DreamEyeIcon;
