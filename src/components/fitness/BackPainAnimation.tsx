import React from 'react';

/**
 * Animated SVG illustrations for back pain relief exercises.
 * Professional line-art human figures with smooth CSS animations.
 */

interface BackPainAnimationProps {
  exerciseId: string;
  isActive?: boolean;
  className?: string;
}

const getSpeed = (active: boolean, base: number) => active ? base : base * 2.5;

const animations = `
@keyframes bp-arch {
  0%, 100% { d: path("M12 28 Q30 22 48 28"); }
  50% { d: path("M12 28 Q30 34 48 28"); }
}
@keyframes bp-tilt {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}
@keyframes bp-breathe {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.08); opacity: 1; }
}
@keyframes bp-curl {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
@keyframes bp-push {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(-8deg); }
}
@keyframes bp-sway {
  0%, 100% { transform: rotate(-6deg); }
  50% { transform: rotate(6deg); }
}
@keyframes bp-stretch {
  0%, 100% { transform: scaleX(1); }
  50% { transform: scaleX(1.08); }
}
@keyframes bp-lift {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
`;

const exerciseSVGs: Record<string, (active: boolean) => React.ReactNode> = {

  // Cat-Cow Stretch
  'cat-cow': (a) => (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="22" r="5" stroke="currentColor" strokeWidth="2" />
      {/* Arms/knees on ground */}
      <line x1="12" y1="27" x2="10" y2="42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="48" y1="30" x2="50" y2="42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Arching/rounding spine */}
      <path d="M12 28 Q30 18 48 28" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"
        style={{ animation: `bp-tilt ${getSpeed(a, 2)}s ease-in-out infinite` }} />
      {/* Ground line */}
      <line x1="4" y1="46" x2="56" y2="46" stroke="currentColor" strokeWidth="0.8" opacity="0.1" />
      {/* Motion indicators */}
      <path d="M28 14 L30 10 L32 14" stroke="currentColor" strokeWidth="0.8" opacity={a ? 0.4 : 0.15} />
      <path d="M28 36 L30 40 L32 36" stroke="currentColor" strokeWidth="0.8" opacity={a ? 0.4 : 0.15} />
    </svg>
  ),

  // Pelvic Tilt
  'pelvic-tilt': (a) => (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="4" y1="46" x2="56" y2="46" stroke="currentColor" strokeWidth="0.8" opacity="0.1" />
      {/* Lying on back */}
      <circle cx="12" cy="32" r="4.5" stroke="currentColor" strokeWidth="2" />
      <line x1="16" y1="34" x2="30" y2="38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Pelvis tilting */}
      <g style={{ transformOrigin: '30px 38px', animation: `bp-tilt ${getSpeed(a, 1.6)}s ease-in-out infinite` }}>
        <path d="M26 38 Q32 30 38 38" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
      {/* Bent legs */}
      <line x1="38" y1="38" x2="46" y2="46" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="46" y1="46" x2="50" y2="38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Arms */}
      <line x1="14" y1="34" x2="10" y2="42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      {/* Pelvic pulse */}
      <g style={{ animation: `bp-breathe ${getSpeed(a, 2)}s ease-in-out infinite`, transformOrigin: '32px 36px' }}>
        <ellipse cx="32" cy="36" rx="5" ry="2.5" stroke="currentColor" strokeWidth="0.6" opacity="0.2" fill="none" />
      </g>
    </svg>
  ),

  // Child's Pose
  'child-pose': (a) => (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="4" y1="46" x2="56" y2="46" stroke="currentColor" strokeWidth="0.8" opacity="0.1" />
      <g style={{ animation: `bp-breathe ${getSpeed(a, 3)}s ease-in-out infinite`, transformOrigin: '30px 38px' }}>
        {/* Curled body */}
        <ellipse cx="32" cy="38" rx="14" ry="7" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="18" cy="32" r="5" stroke="currentColor" strokeWidth="2" />
        {/* Extended arms forward */}
        <line x1="36" y1="34" x2="50" y2="36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="36" y1="38" x2="50" y2="42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Fingertips */}
        <circle cx="50" cy="36" r="1" fill="currentColor" opacity="0.3" />
        <circle cx="50" cy="42" r="1" fill="currentColor" opacity="0.3" />
      </g>
      {/* Breath indicator */}
      <g style={{ animation: `bp-breathe ${getSpeed(a, 3)}s ease-in-out infinite 1s`, transformOrigin: '18px 28px' }}>
        <ellipse cx="18" cy="28" rx="8" ry="4" stroke="currentColor" strokeWidth="0.5" opacity="0.1" fill="none" />
      </g>
    </svg>
  ),

  // Piriformis Stretch
  'piriformis': (a) => (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="4" y1="46" x2="56" y2="46" stroke="currentColor" strokeWidth="0.8" opacity="0.1" />
      {/* Lying on back */}
      <circle cx="10" cy="30" r="5" stroke="currentColor" strokeWidth="2" />
      <line x1="15" y1="32" x2="28" y2="36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Bottom leg straight */}
      <line x1="28" y1="36" x2="50" y2="42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Crossed leg (figure-4 style) */}
      <g style={{ transformOrigin: '28px 36px', animation: `bp-sway ${getSpeed(a, 2)}s ease-in-out infinite` }}>
        <path d="M28 36 L38 28 L44 34" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="44" cy="34" r="1.5" fill="currentColor" opacity="0.3" />
      </g>
      {/* Hands pulling knee */}
      <line x1="14" y1="30" x2="34" y2="26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" strokeDasharray="3 2" />
      {/* Hip highlight */}
      <g style={{ animation: `bp-breathe ${getSpeed(a, 2)}s ease-in-out infinite`, transformOrigin: '30px 34px' }}>
        <circle cx="30" cy="34" r="4" stroke="currentColor" strokeWidth="0.6" opacity="0.2" fill="none" />
      </g>
    </svg>
  ),

  // Wall Push-up
  'wall-push': (a) => (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Wall */}
      <rect x="4" y="4" width="4" height="52" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" />
      {/* Person leaning */}
      <g style={{ transformOrigin: '38px 50px', animation: `bp-push ${getSpeed(a, 1.3)}s ease-in-out infinite` }}>
        <circle cx="36" cy="14" r="5.5" stroke="currentColor" strokeWidth="2" />
        <line x1="34" y1="19" x2="28" y2="36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Arms to wall */}
        <line x1="32" y1="24" x2="10" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="32" y1="28" x2="10" y2="28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Legs */}
        <line x1="28" y1="36" x2="32" y2="52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="28" y1="36" x2="38" y2="52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
      {/* Motion arrows */}
      <path d="M42 24 L46 24" stroke="currentColor" strokeWidth="0.8" opacity={a ? 0.3 : 0.1} />
      <path d="M42 28 L46 28" stroke="currentColor" strokeWidth="0.8" opacity={a ? 0.3 : 0.1} />
    </svg>
  ),

  // Side Stretch
  'side-stretch': (a) => (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="10" r="6" stroke="currentColor" strokeWidth="2" />
      <line x1="30" y1="16" x2="30" y2="34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="30" y1="34" x2="24" y2="52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="30" y1="34" x2="36" y2="52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Side-bending with one arm up */}
      <g style={{ transformOrigin: '30px 20px', animation: `bp-sway ${getSpeed(a, 2)}s ease-in-out infinite` }}>
        <line x1="30" y1="20" x2="16" y2="28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="30" y1="20" x2="44" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="44" cy="6" r="1.5" fill="currentColor" opacity="0.3" />
        <circle cx="16" cy="28" r="1.5" fill="currentColor" opacity="0.3" />
      </g>
      {/* Stretch arc */}
      <path d="M38 6 Q48 2 50 10" stroke="currentColor" strokeWidth="0.7" opacity={a ? 0.25 : 0.1} strokeDasharray="2 2" />
      {/* Ground */}
      <line x1="18" y1="56" x2="42" y2="56" stroke="currentColor" strokeWidth="0.8" opacity="0.1" />
    </svg>
  ),
};

export const BackPainAnimation: React.FC<BackPainAnimationProps> = ({
  exerciseId,
  isActive = false,
  className = '',
}) => {
  const renderSVG = exerciseSVGs[exerciseId];

  if (!renderSVG) {
    return (
      <div className={`text-muted-foreground ${className}`}>
        <style>{animations}</style>
        <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g style={{ animation: 'bp-breathe 2.5s ease-in-out infinite', transformOrigin: '30px 30px' }}>
            <circle cx="30" cy="12" r="6" stroke="currentColor" strokeWidth="2" />
            <line x1="30" y1="18" x2="30" y2="36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="20" y1="28" x2="40" y2="28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="30" y1="36" x2="22" y2="52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="30" y1="36" x2="38" y2="52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

export default BackPainAnimation;
