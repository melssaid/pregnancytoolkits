import React from 'react';

/**
 * Minimalist animated SVG illustrations for each exercise type.
 * Black/white line-art stick figures with subtle CSS animations.
 */

interface ExerciseAnimationProps {
  exerciseId: string;
  isActive?: boolean;
  className?: string;
}

/** Animation durations: idle = slow & gentle, active = faster & more pronounced */
const getSpeed = (active: boolean, base: number) => active ? base : base * 2.5;

const animations = `
@keyframes ex-squat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(4px); }
}
@keyframes ex-arm-circle {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes ex-neck-roll {
  0%, 100% { transform: rotate(-8deg); }
  50% { transform: rotate(8deg); }
}
@keyframes ex-bridge {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}
@keyframes ex-leg-lift {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(25deg); }
}
@keyframes ex-march {
  0%, 100% { transform: translateY(0); }
  25% { transform: translateY(-3px); }
  75% { transform: translateY(-3px); }
}
@keyframes ex-tilt {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}
@keyframes ex-stretch {
  0%, 100% { transform: scaleX(1); }
  50% { transform: scaleX(1.08); }
}
@keyframes ex-breathe {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.15); opacity: 1; }
}
@keyframes ex-cat-cow {
  0%, 100% { d: path("M8 20 Q20 14 32 20"); }
  50% { d: path("M8 20 Q20 26 32 20"); }
}
@keyframes ex-pushup {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(-8deg); }
}
@keyframes ex-idle-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(1.5px); }
}
`;

// Each SVG is a 40x40 viewBox minimalist line drawing
const exerciseSVGs: Record<string, (active: boolean) => React.ReactNode> = {

  // ─── Warmup ────────────────────────────────────────────
  'neck-rolls': (a) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" />
      <line x1="20" y1="17" x2="20" y2="30" stroke="currentColor" strokeWidth="1.5" />
      <line x1="12" y1="22" x2="28" y2="22" stroke="currentColor" strokeWidth="1.5" />
      <g style={{ transformOrigin: '20px 12px', animation: `ex-neck-roll ${getSpeed(a, 1.5)}s ease-in-out infinite` }}>
        <circle cx="20" cy="10" r="1.5" fill="currentColor" opacity={a ? 0.6 : 0.3} />
      </g>
      <path d="M12 8 Q16 4 20 6" stroke="currentColor" strokeWidth="0.8" opacity="0.2" strokeDasharray="2 2" />
      <path d="M28 8 Q24 4 20 6" stroke="currentColor" strokeWidth="0.8" opacity="0.2" strokeDasharray="2 2" />
    </svg>
  ),

  'arm-circles': (a) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="10" r="4" stroke="currentColor" strokeWidth="1.5" />
      <line x1="20" y1="14" x2="20" y2="28" stroke="currentColor" strokeWidth="1.5" />
      <line x1="14" y1="34" x2="20" y2="28" stroke="currentColor" strokeWidth="1.5" />
      <line x1="26" y1="34" x2="20" y2="28" stroke="currentColor" strokeWidth="1.5" />
      <g style={{ transformOrigin: '20px 18px', animation: `ex-arm-circle ${getSpeed(a, 2)}s linear infinite` }}>
        <line x1="20" y1="18" x2="12" y2="14" stroke="currentColor" strokeWidth="1.5" />
      </g>
      <line x1="20" y1="18" x2="28" y2="22" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="14" r="5" stroke="currentColor" strokeWidth="0.6" opacity="0.15" strokeDasharray="2 2" />
    </svg>
  ),

  // ─── Strength ──────────────────────────────────────────
  'squat': (a) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g style={{ animation: `ex-squat ${getSpeed(a, 1.2)}s ease-in-out infinite` }}>
        <circle cx="20" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
        <line x1="20" y1="12" x2="20" y2="22" stroke="currentColor" strokeWidth="1.5" />
        <line x1="12" y1="20" x2="28" y2="20" stroke="currentColor" strokeWidth="1.5" />
        <line x1="20" y1="22" x2="14" y2="30" stroke="currentColor" strokeWidth="1.5" />
        <line x1="20" y1="22" x2="26" y2="30" stroke="currentColor" strokeWidth="1.5" />
        <line x1="14" y1="30" x2="12" y2="36" stroke="currentColor" strokeWidth="1.5" />
        <line x1="26" y1="30" x2="28" y2="36" stroke="currentColor" strokeWidth="1.5" />
      </g>
      <line x1="10" y1="36" x2="16" y2="36" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      <line x1="24" y1="36" x2="30" y2="36" stroke="currentColor" strokeWidth="1" opacity="0.2" />
    </svg>
  ),

  'bird-dog': (a) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="16" r="3" stroke="currentColor" strokeWidth="1.5" />
      <line x1="15" y1="18" x2="30" y2="18" stroke="currentColor" strokeWidth="1.5" />
      <line x1="14" y1="18" x2="10" y2="28" stroke="currentColor" strokeWidth="1.5" />
      <line x1="28" y1="18" x2="24" y2="28" stroke="currentColor" strokeWidth="1.5" />
      <g style={{ transformOrigin: '30px 18px', animation: `ex-leg-lift ${getSpeed(a, 1.4)}s ease-in-out infinite` }}>
        <line x1="30" y1="18" x2="36" y2="12" stroke="currentColor" strokeWidth="1.5" />
      </g>
      <g style={{ transformOrigin: '14px 18px', animation: `ex-leg-lift ${getSpeed(a, 1.4)}s ease-in-out infinite reverse` }}>
        <line x1="12" y1="16" x2="6" y2="10" stroke="currentColor" strokeWidth="1.5" />
      </g>
    </svg>
  ),

  'wall-pushup': (a) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="3" height="32" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.4" />
      <g style={{ transformOrigin: '28px 32px', animation: `ex-pushup ${getSpeed(a, 1.3)}s ease-in-out infinite` }}>
        <circle cx="26" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.5" />
        <line x1="24" y1="15" x2="20" y2="26" stroke="currentColor" strokeWidth="1.5" />
        <line x1="24" y1="18" x2="8" y2="16" stroke="currentColor" strokeWidth="1.5" />
        <line x1="20" y1="26" x2="24" y2="36" stroke="currentColor" strokeWidth="1.5" />
        <line x1="20" y1="26" x2="30" y2="36" stroke="currentColor" strokeWidth="1.5" />
      </g>
    </svg>
  ),

  'glute-bridge': (a) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="4" y1="32" x2="36" y2="32" stroke="currentColor" strokeWidth="0.8" opacity="0.15" />
      <circle cx="8" cy="24" r="3" stroke="currentColor" strokeWidth="1.5" />
      <line x1="11" y1="26" x2="22" y2="28" stroke="currentColor" strokeWidth="1.5" />
      <g style={{ transformOrigin: '22px 28px', animation: `ex-bridge ${getSpeed(a, 1.2)}s ease-in-out infinite` }}>
        <path d="M14 28 Q18 20 22 28" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </g>
      <line x1="22" y1="28" x2="28" y2="32" stroke="currentColor" strokeWidth="1.5" />
      <line x1="28" y1="32" x2="32" y2="28" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),

  'side-lying-leg': (a) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="4" y1="32" x2="36" y2="32" stroke="currentColor" strokeWidth="0.8" opacity="0.15" />
      <circle cx="10" cy="24" r="3" stroke="currentColor" strokeWidth="1.5" />
      <line x1="13" y1="26" x2="24" y2="28" stroke="currentColor" strokeWidth="1.5" />
      <line x1="24" y1="28" x2="34" y2="32" stroke="currentColor" strokeWidth="1.5" />
      <g style={{ transformOrigin: '24px 28px', animation: `ex-leg-lift ${getSpeed(a, 1.5)}s ease-in-out infinite` }}>
        <line x1="24" y1="28" x2="34" y2="24" stroke="currentColor" strokeWidth="1.5" />
      </g>
    </svg>
  ),

  // ─── Cardio ────────────────────────────────────────────
  'marching': (a) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
      <line x1="20" y1="12" x2="20" y2="22" stroke="currentColor" strokeWidth="1.5" />
      <line x1="13" y1="18" x2="27" y2="18" stroke="currentColor" strokeWidth="1.5" />
      <g style={{ animation: `ex-march ${getSpeed(a, 0.8)}s ease-in-out infinite` }}>
        <line x1="20" y1="22" x2="15" y2="32" stroke="currentColor" strokeWidth="1.5" />
      </g>
      <g style={{ animation: `ex-march ${getSpeed(a, 0.8)}s ease-in-out infinite 0.4s` }}>
        <line x1="20" y1="22" x2="25" y2="32" stroke="currentColor" strokeWidth="1.5" />
      </g>
      <line x1="15" y1="32" x2="13" y2="36" stroke="currentColor" strokeWidth="1.5" />
      <line x1="25" y1="32" x2="27" y2="36" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),

  'step-touch': (a) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
      <line x1="20" y1="12" x2="20" y2="22" stroke="currentColor" strokeWidth="1.5" />
      <g style={{ animation: `ex-stretch ${getSpeed(a, 1)}s ease-in-out infinite`, transformOrigin: '20px 22px' }}>
        <line x1="12" y1="18" x2="28" y2="18" stroke="currentColor" strokeWidth="1.5" />
        <line x1="20" y1="22" x2="12" y2="34" stroke="currentColor" strokeWidth="1.5" />
        <line x1="20" y1="22" x2="28" y2="34" stroke="currentColor" strokeWidth="1.5" />
      </g>
      <circle cx="10" cy="36" r="1" fill="currentColor" opacity="0.2" />
      <circle cx="30" cy="36" r="1" fill="currentColor" opacity="0.2" />
    </svg>
  ),

  // ─── Flexibility ───────────────────────────────────────
  'pelvic-tilt': (a) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="4" y1="32" x2="36" y2="32" stroke="currentColor" strokeWidth="0.8" opacity="0.15" />
      <circle cx="10" cy="22" r="3" stroke="currentColor" strokeWidth="1.5" />
      <line x1="13" y1="24" x2="22" y2="26" stroke="currentColor" strokeWidth="1.5" />
      <g style={{ transformOrigin: '20px 26px', animation: `ex-tilt ${getSpeed(a, 1.6)}s ease-in-out infinite` }}>
        <path d="M18 26 Q22 22 26 26" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </g>
      <line x1="26" y1="26" x2="32" y2="32" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),

  'butterfly': (a) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="10" r="4" stroke="currentColor" strokeWidth="1.5" />
      <line x1="20" y1="14" x2="20" y2="24" stroke="currentColor" strokeWidth="1.5" />
      <g style={{ transformOrigin: '20px 24px', animation: `ex-leg-lift ${getSpeed(a, 1.2)}s ease-in-out infinite` }}>
        <path d="M10 30 Q14 24 20 28" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </g>
      <g style={{ transformOrigin: '20px 24px', animation: `ex-leg-lift ${getSpeed(a, 1.2)}s ease-in-out infinite reverse` }}>
        <path d="M30 30 Q26 24 20 28" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </g>
      <circle cx="10" cy="30" r="1.5" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <circle cx="30" cy="30" r="1.5" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    </svg>
  ),

  'cat-cow': (a) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="16" r="3" stroke="currentColor" strokeWidth="1.5" />
      <line x1="8" y1="19" x2="6" y2="30" stroke="currentColor" strokeWidth="1.5" />
      <line x1="32" y1="22" x2="34" y2="30" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 20 Q20 14 32 20" stroke="currentColor" strokeWidth="1.5" fill="none"
        style={{ animation: `ex-tilt ${getSpeed(a, 2)}s ease-in-out infinite` }} />
    </svg>
  ),

  'side-stretch': (a) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
      <line x1="20" y1="12" x2="20" y2="24" stroke="currentColor" strokeWidth="1.5" />
      <line x1="20" y1="24" x2="14" y2="36" stroke="currentColor" strokeWidth="1.5" />
      <line x1="20" y1="24" x2="26" y2="36" stroke="currentColor" strokeWidth="1.5" />
      <g style={{ transformOrigin: '20px 14px', animation: `ex-tilt ${getSpeed(a, 1.8)}s ease-in-out infinite` }}>
        <line x1="20" y1="14" x2="10" y2="8" stroke="currentColor" strokeWidth="1.5" />
        <line x1="20" y1="14" x2="30" y2="8" stroke="currentColor" strokeWidth="1.5" />
      </g>
    </svg>
  ),

  // ─── Cooldown ──────────────────────────────────────────
  'child-pose': (a) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="4" y1="32" x2="36" y2="32" stroke="currentColor" strokeWidth="0.8" opacity="0.15" />
      <g style={{ animation: `ex-breathe ${getSpeed(a, 3)}s ease-in-out infinite`, transformOrigin: '20px 26px' }}>
        <ellipse cx="20" cy="26" rx="10" ry="5" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <circle cx="12" cy="22" r="3" stroke="currentColor" strokeWidth="1.5" />
        <line x1="22" y1="22" x2="32" y2="26" stroke="currentColor" strokeWidth="1.5" />
      </g>
    </svg>
  ),

  'deep-breathing': (a) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="10" r="4" stroke="currentColor" strokeWidth="1.5" />
      <line x1="20" y1="14" x2="20" y2="24" stroke="currentColor" strokeWidth="1.5" />
      <line x1="14" y1="20" x2="26" y2="20" stroke="currentColor" strokeWidth="1.5" />
      <line x1="20" y1="24" x2="16" y2="34" stroke="currentColor" strokeWidth="1.5" />
      <line x1="20" y1="24" x2="24" y2="34" stroke="currentColor" strokeWidth="1.5" />
      <g style={{ animation: `ex-breathe ${getSpeed(a, 3)}s ease-in-out infinite`, transformOrigin: '20px 18px' }}>
        <ellipse cx="20" cy="18" rx="6" ry="3" stroke="currentColor" strokeWidth="0.8" opacity="0.3" fill="none" />
      </g>
      <g style={{ animation: `ex-breathe ${getSpeed(a, 3)}s ease-in-out infinite 1.5s`, transformOrigin: '20px 18px' }}>
        <ellipse cx="20" cy="18" rx="9" ry="5" stroke="currentColor" strokeWidth="0.5" opacity="0.12" fill="none" />
      </g>
    </svg>
  ),
};

export const ExerciseAnimation: React.FC<ExerciseAnimationProps> = ({
  exerciseId,
  isActive = false,
  className = '',
}) => {
  const renderSVG = exerciseSVGs[exerciseId];

  if (!renderSVG) {
    // Fallback: gentle bobbing stick figure
    return (
      <div className={`text-muted-foreground ${className}`}>
        <style>{animations}</style>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g style={{ animation: 'ex-idle-bob 2.5s ease-in-out infinite' }}>
            <circle cx="20" cy="10" r="4" stroke="currentColor" strokeWidth="1.5" />
            <line x1="20" y1="14" x2="20" y2="26" stroke="currentColor" strokeWidth="1.5" />
            <line x1="13" y1="20" x2="27" y2="20" stroke="currentColor" strokeWidth="1.5" />
            <line x1="20" y1="26" x2="14" y2="36" stroke="currentColor" strokeWidth="1.5" />
            <line x1="20" y1="26" x2="26" y2="36" stroke="currentColor" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    );
  }

  return (
    <div className={`text-foreground ${className}`}>
      <style>{animations}</style>
      {renderSVG(isActive)}
    </div>
  );
};

export default ExerciseAnimation;
