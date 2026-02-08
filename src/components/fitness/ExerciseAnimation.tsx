import React from 'react';

/**
 * Animated SVG exercise illustrations — B&W line-art human figures
 * showing realistic exercise poses with smooth CSS animations.
 * ViewBox: 60x60 for better detail at larger display sizes.
 */

interface ExerciseAnimationProps {
  exerciseId: string;
  isActive?: boolean;
  className?: string;
}

const getSpeed = (active: boolean, base: number) => active ? base : base * 2.5;

const animations = `
@keyframes ex-squat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(6px); }
}
@keyframes ex-arm-circle {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes ex-neck-roll {
  0%, 100% { transform: rotate(-10deg); }
  50% { transform: rotate(10deg); }
}
@keyframes ex-bridge {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
@keyframes ex-leg-lift {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(25deg); }
}
@keyframes ex-march {
  0%, 100% { transform: translateY(0); }
  25% { transform: translateY(-5px); }
  75% { transform: translateY(-5px); }
}
@keyframes ex-tilt {
  0%, 100% { transform: rotate(-6deg); }
  50% { transform: rotate(6deg); }
}
@keyframes ex-stretch {
  0%, 100% { transform: scaleX(1); }
  50% { transform: scaleX(1.1); }
}
@keyframes ex-breathe {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.12); opacity: 1; }
}
@keyframes ex-pushup {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(-10deg); }
}
@keyframes ex-idle-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(2px); }
}
@keyframes ex-shrug {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}
@keyframes ex-twist {
  0%, 100% { transform: rotate(-8deg); }
  50% { transform: rotate(8deg); }
}
@keyframes ex-kegel {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(0.88); }
}
@keyframes ex-pulse {
  0%, 100% { opacity: 0.2; transform: scale(0.9); }
  50% { opacity: 0.6; transform: scale(1.1); }
}
@keyframes ex-calf {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
@keyframes ex-bend {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(-15deg); }
}
`;

// 60x60 viewBox for detailed human figure illustrations
const exerciseSVGs: Record<string, (active: boolean) => React.ReactNode> = {

  // ─── Warmup ────────────────────────────────────────────
  'neck-rolls': (a) => (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Standing figure */}
      <line x1="30" y1="26" x2="30" y2="40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="22" y1="32" x2="38" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="30" y1="40" x2="24" y2="54" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="30" y1="40" x2="36" y2="54" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Head with neck roll animation */}
      <g style={{ transformOrigin: '30px 22px', animation: `ex-neck-roll ${getSpeed(a, 1.5)}s ease-in-out infinite` }}>
        <circle cx="30" cy="16" r="7" stroke="currentColor" strokeWidth="2" />
        <circle cx="28" cy="14" r="1" fill="currentColor" opacity="0.5" />
        <circle cx="33" cy="14" r="1" fill="currentColor" opacity="0.5" />
      </g>
      {/* Motion arc */}
      <path d="M20 10 Q30 4 40 10" stroke="currentColor" strokeWidth="0.8" opacity="0.15" strokeDasharray="3 3" />
    </svg>
  ),

  'arm-circles': (a) => (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="14" r="6" stroke="currentColor" strokeWidth="2" />
      <line x1="30" y1="20" x2="30" y2="38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="30" y1="38" x2="24" y2="52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="30" y1="38" x2="36" y2="52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Right arm static */}
      <line x1="30" y1="26" x2="42" y2="34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Left arm circling */}
      <g style={{ transformOrigin: '30px 26px', animation: `ex-arm-circle ${getSpeed(a, 2)}s linear infinite` }}>
        <line x1="30" y1="26" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="18" cy="18" r="1.5" fill="currentColor" opacity="0.4" />
      </g>
      <circle cx="30" cy="26" r="10" stroke="currentColor" strokeWidth="0.6" opacity="0.1" strokeDasharray="3 3" />
    </svg>
  ),

  'ankle-circles': (a) => (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
      <line x1="30" y1="17" x2="30" y2="34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="22" y1="24" x2="38" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="30" y1="34" x2="24" y2="46" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="24" y1="46" x2="22" y2="54" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Raised foot with circle motion */}
      <line x1="30" y1="34" x2="38" y2="44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <g style={{ transformOrigin: '38px 48px', animation: `ex-arm-circle ${getSpeed(a, 2.5)}s linear infinite` }}>
        <circle cx="40" cy="46" r="1.5" fill="currentColor" opacity={a ? 0.5 : 0.25} />
      </g>
      <circle cx="38" cy="48" r="4" stroke="currentColor" strokeWidth="0.7" opacity="0.15" strokeDasharray="2 2" />
    </svg>
  ),

  'hip-circles': (a) => (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="12" r="6" stroke="currentColor" strokeWidth="2" />
      <line x1="30" y1="18" x2="30" y2="34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="22" y1="26" x2="38" y2="26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Hips with circular motion */}
      <g style={{ transformOrigin: '30px 34px', animation: `ex-arm-circle ${getSpeed(a, 3)}s linear infinite` }}>
        <circle cx="30" cy="30" r="2" fill="currentColor" opacity={a ? 0.4 : 0.15} />
      </g>
      <ellipse cx="30" cy="34" rx="7" ry="4" stroke="currentColor" strokeWidth="0.7" opacity="0.15" strokeDasharray="3 3" />
      <line x1="30" y1="34" x2="22" y2="52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="30" y1="34" x2="38" y2="52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),

  'shoulder-shrugs': (a) => (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="14" r="6" stroke="currentColor" strokeWidth="2" />
      <line x1="30" y1="20" x2="30" y2="38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="30" y1="38" x2="24" y2="52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="30" y1="38" x2="36" y2="52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Shoulders with shrug motion */}
      <g style={{ animation: `ex-shrug ${getSpeed(a, 1)}s ease-in-out infinite` }}>
        <line x1="18" y1="30" x2="30" y2="26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="42" y1="30" x2="30" y2="26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="18" y1="30" x2="16" y2="38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="42" y1="30" x2="44" y2="38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
      {/* Up arrows */}
      <path d="M16 22 L18 19 L20 22" stroke="currentColor" strokeWidth="0.8" opacity={a ? 0.3 : 0.1} />
      <path d="M40 22 L42 19 L44 22" stroke="currentColor" strokeWidth="0.8" opacity={a ? 0.3 : 0.1} />
    </svg>
  ),

  // ─── Strength ──────────────────────────────────────────
  'squat': (a) => (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g style={{ animation: `ex-squat ${getSpeed(a, 1.2)}s ease-in-out infinite` }}>
        <circle cx="30" cy="10" r="6" stroke="currentColor" strokeWidth="2" />
        <line x1="30" y1="16" x2="30" y2="30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="20" y1="24" x2="40" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Squat legs - bent */}
        <line x1="30" y1="30" x2="22" y2="40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="30" y1="30" x2="38" y2="40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="22" y1="40" x2="18" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="38" y1="40" x2="42" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Feet */}
        <line x1="16" y1="50" x2="22" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="40" y1="50" x2="46" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
      <line x1="14" y1="54" x2="46" y2="54" stroke="currentColor" strokeWidth="0.8" opacity="0.1" />
    </svg>
  ),

  'bird-dog': (a) => (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* All fours position */}
      <circle cx="16" cy="22" r="5" stroke="currentColor" strokeWidth="2" />
      <line x1="20" y1="25" x2="44" y2="25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Supporting limbs */}
      <line x1="20" y1="25" x2="16" y2="40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="40" y1="25" x2="36" y2="40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Extended leg */}
      <g style={{ transformOrigin: '44px 25px', animation: `ex-leg-lift ${getSpeed(a, 1.4)}s ease-in-out infinite` }}>
        <line x1="44" y1="25" x2="54" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="54" cy="18" r="1.5" fill="currentColor" opacity="0.3" />
      </g>
      {/* Extended arm */}
      <g style={{ transformOrigin: '20px 25px', animation: `ex-leg-lift ${getSpeed(a, 1.4)}s ease-in-out infinite reverse` }}>
        <line x1="16" y1="22" x2="6" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="6" cy="14" r="1.5" fill="currentColor" opacity="0.3" />
      </g>
      <line x1="4" y1="44" x2="56" y2="44" stroke="currentColor" strokeWidth="0.8" opacity="0.1" />
    </svg>
  ),

  'wall-pushup': (a) => (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Wall */}
      <rect x="4" y="4" width="4" height="52" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" />
      {/* Person leaning against wall */}
      <g style={{ transformOrigin: '40px 50px', animation: `ex-pushup ${getSpeed(a, 1.3)}s ease-in-out infinite` }}>
        <circle cx="38" cy="16" r="5.5" stroke="currentColor" strokeWidth="2" />
        <line x1="36" y1="21" x2="30" y2="38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Arms reaching to wall */}
        <line x1="34" y1="26" x2="10" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="34" y1="28" x2="10" y2="28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Legs */}
        <line x1="30" y1="38" x2="34" y2="52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="30" y1="38" x2="40" y2="52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  ),

  'glute-bridge': (a) => (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="4" y1="46" x2="56" y2="46" stroke="currentColor" strokeWidth="0.8" opacity="0.1" />
      {/* Lying figure with bridge */}
      <circle cx="10" cy="36" r="5" stroke="currentColor" strokeWidth="2" />
      <line x1="15" y1="38" x2="32" y2="40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Hips lifting */}
      <g style={{ transformOrigin: '32px 40px', animation: `ex-bridge ${getSpeed(a, 1.2)}s ease-in-out infinite` }}>
        <path d="M22 40 Q28 28 34 40" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
      {/* Bent knees */}
      <line x1="34" y1="40" x2="42" y2="46" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="42" y1="46" x2="48" y2="38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Arms flat */}
      <line x1="14" y1="38" x2="8" y2="42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </svg>
  ),

  'side-lying-leg': (a) => (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="4" y1="46" x2="56" y2="46" stroke="currentColor" strokeWidth="0.8" opacity="0.1" />
      {/* Lying on side */}
      <circle cx="14" cy="34" r="5" stroke="currentColor" strokeWidth="2" />
      <line x1="18" y1="37" x2="34" y2="40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Bottom leg */}
      <line x1="34" y1="40" x2="50" y2="46" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Top leg lifting */}
      <g style={{ transformOrigin: '34px 40px', animation: `ex-leg-lift ${getSpeed(a, 1.5)}s ease-in-out infinite` }}>
        <line x1="34" y1="40" x2="50" y2="34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="50" cy="34" r="1.5" fill="currentColor" opacity="0.3" />
      </g>
      {/* Support arm */}
      <line x1="14" y1="32" x2="10" y2="26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </svg>
  ),

  'wall-sit': (a) => (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="4" height="52" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" />
      <g style={{ animation: `ex-breathe ${getSpeed(a, 3)}s ease-in-out infinite`, transformOrigin: '30px 30px' }}>
        <circle cx="24" cy="14" r="5.5" stroke="currentColor" strokeWidth="2" />
        {/* Back against wall */}
        <line x1="20" y1="19" x2="14" y2="30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Sitting position */}
        <line x1="14" y1="30" x2="26" y2="30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Legs at 90° */}
        <line x1="26" y1="30" x2="26" y2="44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="14" y1="30" x2="14" y2="44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Arms */}
        <line x1="18" y1="24" x2="10" y2="26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      </g>
    </svg>
  ),

  'calf-raises': (a) => (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g style={{ animation: `ex-calf ${getSpeed(a, 1)}s ease-in-out infinite` }}>
        <circle cx="30" cy="8" r="5.5" stroke="currentColor" strokeWidth="2" />
        <line x1="30" y1="13.5" x2="30" y2="30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="22" y1="22" x2="38" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="30" y1="30" x2="26" y2="44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="30" y1="30" x2="34" y2="44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
      {/* Feet on toes */}
      <line x1="24" y1="44" x2="24" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="36" y1="44" x2="36" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="20" y1="54" x2="40" y2="54" stroke="currentColor" strokeWidth="0.8" opacity="0.1" />
    </svg>
  ),

  'sumo-squat': (a) => (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g style={{ animation: `ex-squat ${getSpeed(a, 1.4)}s ease-in-out infinite` }}>
        <circle cx="30" cy="8" r="5.5" stroke="currentColor" strokeWidth="2" />
        <line x1="30" y1="13.5" x2="30" y2="26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Wide arms */}
        <line x1="22" y1="20" x2="38" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Wide squat legs */}
        <line x1="30" y1="26" x2="16" y2="38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="30" y1="26" x2="44" y2="38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="16" y1="38" x2="12" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="44" y1="38" x2="48" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Wide feet */}
        <line x1="10" y1="50" x2="16" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="46" y1="50" x2="52" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  ),

  // ─── Cardio ────────────────────────────────────────────
  'marching': (a) => (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="10" r="6" stroke="currentColor" strokeWidth="2" />
      <line x1="30" y1="16" x2="30" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Arms swinging */}
      <g style={{ animation: `ex-tilt ${getSpeed(a, 0.6)}s ease-in-out infinite`, transformOrigin: '30px 22px' }}>
        <line x1="22" y1="20" x2="30" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="38" y1="28" x2="30" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
      {/* Left leg marching */}
      <g style={{ animation: `ex-march ${getSpeed(a, 0.6)}s ease-in-out infinite` }}>
        <line x1="30" y1="32" x2="24" y2="44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="24" y1="44" x2="22" y2="52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
      {/* Right leg */}
      <g style={{ animation: `ex-march ${getSpeed(a, 0.6)}s ease-in-out infinite 0.3s` }}>
        <line x1="30" y1="32" x2="36" y2="44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="36" y1="44" x2="38" y2="52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  ),

  'step-touch': (a) => (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="10" r="6" stroke="currentColor" strokeWidth="2" />
      <line x1="30" y1="16" x2="30" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <g style={{ animation: `ex-stretch ${getSpeed(a, 1)}s ease-in-out infinite`, transformOrigin: '30px 32px' }}>
        {/* Arms out */}
        <line x1="18" y1="20" x2="30" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="42" y1="20" x2="30" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Legs stepping */}
        <line x1="30" y1="32" x2="18" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="30" y1="32" x2="42" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  ),

  'standing-march': (a) => (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="8" r="5.5" stroke="currentColor" strokeWidth="2" />
      <line x1="30" y1="13.5" x2="30" y2="30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Left arm + leg synced */}
      <g style={{ animation: `ex-march ${getSpeed(a, 0.7)}s ease-in-out infinite` }}>
        <line x1="22" y1="22" x2="30" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="30" y1="30" x2="22" y2="42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="22" y1="42" x2="22" y2="52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
      {/* Right arm + leg synced opposite */}
      <g style={{ animation: `ex-march ${getSpeed(a, 0.7)}s ease-in-out infinite 0.35s` }}>
        <line x1="38" y1="22" x2="30" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="30" y1="30" x2="38" y2="42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="38" y1="42" x2="38" y2="52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  ),

  'low-impact-jacks': (a) => (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="8" r="5.5" stroke="currentColor" strokeWidth="2" />
      <line x1="30" y1="13.5" x2="30" y2="30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Arms and legs spreading */}
      <g style={{ animation: `ex-stretch ${getSpeed(a, 0.8)}s ease-in-out infinite`, transformOrigin: '30px 22px' }}>
        <line x1="16" y1="12" x2="30" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="44" y1="12" x2="30" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
      <g style={{ animation: `ex-stretch ${getSpeed(a, 0.8)}s ease-in-out infinite`, transformOrigin: '30px 30px' }}>
        <line x1="30" y1="30" x2="16" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="30" y1="30" x2="44" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  ),

  // ─── Flexibility ───────────────────────────────────────
  'pelvic-tilt': (a) => (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="4" y1="46" x2="56" y2="46" stroke="currentColor" strokeWidth="0.8" opacity="0.1" />
      <circle cx="14" cy="32" r="4.5" stroke="currentColor" strokeWidth="2" />
      <line x1="18" y1="34" x2="34" y2="38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <g style={{ transformOrigin: '32px 38px', animation: `ex-tilt ${getSpeed(a, 1.6)}s ease-in-out infinite` }}>
        <path d="M28 38 Q34 30 40 38" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
      <line x1="40" y1="38" x2="48" y2="46" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="48" y1="46" x2="52" y2="40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),

  'butterfly': (a) => (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="12" r="6" stroke="currentColor" strokeWidth="2" />
      <line x1="30" y1="18" x2="30" y2="34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Butterfly legs */}
      <g style={{ transformOrigin: '30px 34px', animation: `ex-leg-lift ${getSpeed(a, 1.2)}s ease-in-out infinite` }}>
        <path d="M14 46 Q20 34 30 40" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="14" cy="46" r="2" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
      </g>
      <g style={{ transformOrigin: '30px 34px', animation: `ex-leg-lift ${getSpeed(a, 1.2)}s ease-in-out infinite reverse` }}>
        <path d="M46 46 Q40 34 30 40" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="46" cy="46" r="2" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
      </g>
      {/* Hands on feet */}
      <line x1="24" y1="22" x2="18" y2="36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="36" y1="22" x2="42" y2="36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </svg>
  ),

  'cat-cow': (a) => (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="22" r="5" stroke="currentColor" strokeWidth="2" />
      {/* Arms/knees on ground */}
      <line x1="12" y1="27" x2="10" y2="42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="48" y1="30" x2="50" y2="42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Arching/rounding spine */}
      <path d="M12 28 Q30 18 48 28" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"
        style={{ animation: `ex-tilt ${getSpeed(a, 2)}s ease-in-out infinite` }} />
      <line x1="4" y1="46" x2="56" y2="46" stroke="currentColor" strokeWidth="0.8" opacity="0.1" />
    </svg>
  ),

  'side-stretch': (a) => (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="10" r="6" stroke="currentColor" strokeWidth="2" />
      <line x1="30" y1="16" x2="30" y2="34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="30" y1="34" x2="24" y2="52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="30" y1="34" x2="36" y2="52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Arms stretching sideways */}
      <g style={{ transformOrigin: '30px 20px', animation: `ex-tilt ${getSpeed(a, 1.8)}s ease-in-out infinite` }}>
        <line x1="30" y1="20" x2="14" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="30" y1="20" x2="46" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="14" cy="10" r="1.5" fill="currentColor" opacity="0.3" />
        <circle cx="46" cy="10" r="1.5" fill="currentColor" opacity="0.3" />
      </g>
    </svg>
  ),

  'kegel': (a) => (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="10" r="6" stroke="currentColor" strokeWidth="2" />
      <line x1="30" y1="16" x2="30" y2="34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="22" y1="24" x2="38" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="30" y1="34" x2="22" y2="52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="30" y1="34" x2="38" y2="52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Pelvic floor pulse */}
      <g style={{ animation: `ex-kegel ${getSpeed(a, 1.5)}s ease-in-out infinite`, transformOrigin: '30px 38px' }}>
        <ellipse cx="30" cy="38" rx="6" ry="3" stroke="currentColor" strokeWidth="1.2" opacity={a ? 0.6 : 0.3} fill="none" />
      </g>
      <g style={{ animation: `ex-pulse ${getSpeed(a, 2)}s ease-in-out infinite`, transformOrigin: '30px 38px' }}>
        <ellipse cx="30" cy="38" rx="10" ry="5" stroke="currentColor" strokeWidth="0.6" opacity="0.12" fill="none" />
      </g>
    </svg>
  ),

  'seated-twist': (a) => (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="12" r="6" stroke="currentColor" strokeWidth="2" />
      <line x1="30" y1="18" x2="30" y2="36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Twisting arms */}
      <g style={{ transformOrigin: '30px 26px', animation: `ex-twist ${getSpeed(a, 2)}s ease-in-out infinite` }}>
        <line x1="18" y1="26" x2="42" y2="26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="18" cy="26" r="1.5" fill="currentColor" opacity="0.3" />
        <circle cx="42" cy="26" r="1.5" fill="currentColor" opacity="0.3" />
      </g>
      {/* Seated legs */}
      <path d="M22 36 Q30 42 38 36" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      <line x1="4" y1="46" x2="56" y2="46" stroke="currentColor" strokeWidth="0.8" opacity="0.1" />
    </svg>
  ),

  'hamstring-stretch': (a) => (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="4" y1="46" x2="56" y2="46" stroke="currentColor" strokeWidth="0.8" opacity="0.1" />
      <circle cx="18" cy="18" r="5" stroke="currentColor" strokeWidth="2" />
      {/* Bending forward */}
      <g style={{ transformOrigin: '18px 24px', animation: `ex-tilt ${getSpeed(a, 2.5)}s ease-in-out infinite` }}>
        <line x1="18" y1="23" x2="28" y2="36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="18" y1="28" x2="10" y2="34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
      {/* Extended leg */}
      <line x1="28" y1="36" x2="50" y2="40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="50" cy="40" r="1.5" fill="currentColor" opacity="0.3" />
    </svg>
  ),

  'figure-four': (a) => (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="4" y1="46" x2="56" y2="46" stroke="currentColor" strokeWidth="0.8" opacity="0.1" />
      {/* Lying back */}
      <circle cx="12" cy="30" r="5" stroke="currentColor" strokeWidth="2" />
      <line x1="17" y1="32" x2="30" y2="36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Bottom leg bent */}
      <line x1="30" y1="36" x2="44" y2="46" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Figure 4 crossed leg */}
      <g style={{ transformOrigin: '30px 36px', animation: `ex-leg-lift ${getSpeed(a, 1.8)}s ease-in-out infinite` }}>
        <path d="M30 36 L40 30 L46 36" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  ),

  // ─── Cooldown ──────────────────────────────────────────
  'child-pose': (a) => (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="4" y1="46" x2="56" y2="46" stroke="currentColor" strokeWidth="0.8" opacity="0.1" />
      <g style={{ animation: `ex-breathe ${getSpeed(a, 3)}s ease-in-out infinite`, transformOrigin: '30px 38px' }}>
        {/* Curled up body */}
        <ellipse cx="30" cy="38" rx="14" ry="7" stroke="currentColor" strokeWidth="2" fill="none" />
        <circle cx="18" cy="32" r="5" stroke="currentColor" strokeWidth="2" />
        {/* Extended arms */}
        <line x1="34" y1="34" x2="48" y2="38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="34" y1="36" x2="48" y2="42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  ),

  'deep-breathing': (a) => (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="12" r="6" stroke="currentColor" strokeWidth="2" />
      <line x1="30" y1="18" x2="30" y2="34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="22" y1="28" x2="38" y2="28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="30" y1="34" x2="24" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="30" y1="34" x2="36" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Breathing circles */}
      <g style={{ animation: `ex-breathe ${getSpeed(a, 3)}s ease-in-out infinite`, transformOrigin: '30px 26px' }}>
        <ellipse cx="30" cy="26" rx="8" ry="4" stroke="currentColor" strokeWidth="1" opacity="0.25" fill="none" />
      </g>
      <g style={{ animation: `ex-breathe ${getSpeed(a, 3)}s ease-in-out infinite 1.5s`, transformOrigin: '30px 26px' }}>
        <ellipse cx="30" cy="26" rx="13" ry="7" stroke="currentColor" strokeWidth="0.6" opacity="0.1" fill="none" />
      </g>
    </svg>
  ),

  'savasana': (a) => (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="4" y1="34" x2="56" y2="34" stroke="currentColor" strokeWidth="0.8" opacity="0.1" />
      <g style={{ animation: `ex-breathe ${getSpeed(a, 4)}s ease-in-out infinite`, transformOrigin: '30px 28px' }}>
        {/* Lying flat */}
        <circle cx="10" cy="28" r="5" stroke="currentColor" strokeWidth="2" />
        <line x1="15" y1="28" x2="46" y2="28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Arms spread */}
        <line x1="18" y1="28" x2="14" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="18" y1="28" x2="14" y2="36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Legs spread */}
        <line x1="46" y1="28" x2="52" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="46" y1="28" x2="52" y2="34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  ),

  'gentle-twist': (a) => (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="10" r="6" stroke="currentColor" strokeWidth="2" />
      <line x1="30" y1="16" x2="30" y2="34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Gentle twisting arms */}
      <g style={{ transformOrigin: '30px 24px', animation: `ex-twist ${getSpeed(a, 2.5)}s ease-in-out infinite` }}>
        <line x1="18" y1="24" x2="42" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="18" cy="24" r="1.5" fill="currentColor" opacity="0.3" />
        <circle cx="42" cy="24" r="1.5" fill="currentColor" opacity="0.3" />
      </g>
      <line x1="30" y1="34" x2="22" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="30" y1="34" x2="38" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Twist arc */}
      <path d="M24 16 Q30 12 36 16" stroke="currentColor" strokeWidth="0.7" opacity="0.15" strokeDasharray="2 2" />
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
    return (
      <div className={`text-muted-foreground ${className}`}>
        <style>{animations}</style>
        <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g style={{ animation: 'ex-idle-bob 2.5s ease-in-out infinite' }}>
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

export default ExerciseAnimation;
