import { Exercise } from '@/components/fitness/ExerciseCard';

export const exerciseDatabase: Exercise[] = [
  // ─── Warmup ────────────────────────────────────────────
  { id: 'neck-rolls', nameKey: 'neckRolls', duration: 30, descriptionKey: 'neckRollsDesc', category: 'warmup', difficulty: 'beginner', caloriesPerMin: 2, muscleGroupKey: 'neck' },
  { id: 'arm-circles', nameKey: 'armCircles', duration: 30, descriptionKey: 'armCirclesDesc', category: 'warmup', difficulty: 'beginner', caloriesPerMin: 2, muscleGroupKey: 'shoulders' },
  { id: 'ankle-circles', nameKey: 'ankleCircles', duration: 30, descriptionKey: 'ankleCirclesDesc', category: 'warmup', difficulty: 'beginner', caloriesPerMin: 1, muscleGroupKey: 'ankles' },
  { id: 'hip-circles', nameKey: 'hipCircles', duration: 30, descriptionKey: 'hipCirclesDesc', category: 'warmup', difficulty: 'beginner', caloriesPerMin: 2, muscleGroupKey: 'hips' },
  { id: 'shoulder-shrugs', nameKey: 'shoulderShrugs', duration: 25, descriptionKey: 'shoulderShrugsDesc', category: 'warmup', difficulty: 'beginner', caloriesPerMin: 2, muscleGroupKey: 'shoulders' },

  // ─── Strength ──────────────────────────────────────────
  { id: 'squat', nameKey: 'prenatalSquats', duration: 45, descriptionKey: 'prenatalSquatsDesc', category: 'strength', difficulty: 'beginner', caloriesPerMin: 5, muscleGroupKey: 'legs' },
  { id: 'bird-dog', nameKey: 'birdDog', duration: 30, descriptionKey: 'birdDogDesc', category: 'strength', difficulty: 'intermediate', caloriesPerMin: 4, muscleGroupKey: 'core' },
  { id: 'wall-pushup', nameKey: 'wallPushups', duration: 45, descriptionKey: 'wallPushupsDesc', category: 'strength', difficulty: 'beginner', caloriesPerMin: 4, muscleGroupKey: 'arms' },
  { id: 'glute-bridge', nameKey: 'gluteBridge', duration: 40, descriptionKey: 'gluteBridgeDesc', category: 'strength', difficulty: 'beginner', caloriesPerMin: 4, muscleGroupKey: 'glutes' },
  { id: 'side-lying-leg', nameKey: 'sideLyingLeg', duration: 35, descriptionKey: 'sideLyingLegDesc', category: 'strength', difficulty: 'intermediate', caloriesPerMin: 3, muscleGroupKey: 'hips' },
  { id: 'wall-sit', nameKey: 'wallSit', duration: 30, descriptionKey: 'wallSitDesc', category: 'strength', difficulty: 'intermediate', caloriesPerMin: 5, muscleGroupKey: 'legs' },
  { id: 'calf-raises', nameKey: 'calfRaises', duration: 30, descriptionKey: 'calfRaisesDesc', category: 'strength', difficulty: 'beginner', caloriesPerMin: 3, muscleGroupKey: 'calves' },
  { id: 'sumo-squat', nameKey: 'sumoSquat', duration: 40, descriptionKey: 'sumoSquatDesc', category: 'strength', difficulty: 'intermediate', caloriesPerMin: 5, muscleGroupKey: 'legs' },

  // ─── Cardio ────────────────────────────────────────────
  { id: 'marching', nameKey: 'seatedMarching', duration: 60, descriptionKey: 'seatedMarchingDesc', category: 'cardio', difficulty: 'beginner', caloriesPerMin: 5, muscleGroupKey: 'legs' },
  { id: 'step-touch', nameKey: 'stepTouch', duration: 45, descriptionKey: 'stepTouchDesc', category: 'cardio', difficulty: 'beginner', caloriesPerMin: 4, muscleGroupKey: 'fullBody' },
  { id: 'standing-march', nameKey: 'standingMarch', duration: 60, descriptionKey: 'standingMarchDesc', category: 'cardio', difficulty: 'beginner', caloriesPerMin: 5, muscleGroupKey: 'fullBody' },
  { id: 'low-impact-jacks', nameKey: 'lowImpactJacks', duration: 30, descriptionKey: 'lowImpactJacksDesc', category: 'cardio', difficulty: 'intermediate', caloriesPerMin: 6, muscleGroupKey: 'fullBody' },

  // ─── Flexibility ───────────────────────────────────────
  { id: 'pelvic-tilt', nameKey: 'pelvicTilts', duration: 60, descriptionKey: 'pelvicTiltsDesc', category: 'flexibility', difficulty: 'beginner', caloriesPerMin: 2, muscleGroupKey: 'pelvis' },
  { id: 'butterfly', nameKey: 'butterflyStretch', duration: 60, descriptionKey: 'butterflyStretchDesc', category: 'flexibility', difficulty: 'beginner', caloriesPerMin: 2, muscleGroupKey: 'hips' },
  { id: 'cat-cow', nameKey: 'catCow', duration: 45, descriptionKey: 'catCowDesc', category: 'flexibility', difficulty: 'beginner', caloriesPerMin: 2, muscleGroupKey: 'spine' },
  { id: 'side-stretch', nameKey: 'sideStretch', duration: 30, descriptionKey: 'sideStretchDesc', category: 'flexibility', difficulty: 'beginner', caloriesPerMin: 2, muscleGroupKey: 'obliques' },
  { id: 'kegel', nameKey: 'kegelExercise', duration: 60, descriptionKey: 'kegelExerciseDesc', category: 'flexibility', difficulty: 'beginner', caloriesPerMin: 1, muscleGroupKey: 'pelvicFloor' },
  { id: 'seated-twist', nameKey: 'seatedTwist', duration: 30, descriptionKey: 'seatedTwistDesc', category: 'flexibility', difficulty: 'beginner', caloriesPerMin: 2, muscleGroupKey: 'spine' },
  { id: 'hamstring-stretch', nameKey: 'hamstringStretch', duration: 40, descriptionKey: 'hamstringStretchDesc', category: 'flexibility', difficulty: 'beginner', caloriesPerMin: 1, muscleGroupKey: 'legs' },
  { id: 'figure-four', nameKey: 'figureFour', duration: 40, descriptionKey: 'figureFourDesc', category: 'flexibility', difficulty: 'beginner', caloriesPerMin: 1, muscleGroupKey: 'hips' },

  // ─── Cooldown ──────────────────────────────────────────
  { id: 'child-pose', nameKey: 'childPose', duration: 45, descriptionKey: 'childPoseDesc', category: 'cooldown', difficulty: 'beginner', caloriesPerMin: 1, muscleGroupKey: 'back' },
  { id: 'deep-breathing', nameKey: 'deepBreathing', duration: 60, descriptionKey: 'deepBreathingDesc', category: 'cooldown', difficulty: 'beginner', caloriesPerMin: 1, muscleGroupKey: 'diaphragm' },
  { id: 'savasana', nameKey: 'savasana', duration: 60, descriptionKey: 'savasanaDesc', category: 'cooldown', difficulty: 'beginner', caloriesPerMin: 1, muscleGroupKey: 'fullBody' },
  { id: 'gentle-twist', nameKey: 'gentleTwist', duration: 30, descriptionKey: 'gentleTwistDesc', category: 'cooldown', difficulty: 'beginner', caloriesPerMin: 1, muscleGroupKey: 'spine' },
];

// Language-specific video sets for cultural relevance
export const fitnessVideosByLang: Record<string, { youtubeId: string; duration: string; categoryKey: string }[]> = {
  ar: [
    { youtubeId: "pHzsNfr2NCQ", duration: "15:00", categoryKey: "yoga" },
    { youtubeId: "qa7RY4V6ihM", duration: "10:00", categoryKey: "fullBody" },
    { youtubeId: "Vy6jonW1lFg", duration: "12:00", categoryKey: "strength" },
    { youtubeId: "jvY_KDCy7E4", duration: "8:00", categoryKey: "birthPrep" },
    { youtubeId: "oBY_25mR2WU", duration: "15:00", categoryKey: "stretching" },
    { youtubeId: "pCSjhbVOdYQ", duration: "60:00", categoryKey: "relaxation" },
  ],
  tr: [
    { youtubeId: "0_z0oqZyHq8", duration: "15:00", categoryKey: "fullBody" },
    { youtubeId: "RTFFwC6nvpo", duration: "12:00", categoryKey: "birthPrep" },
    { youtubeId: "ohLIZdyOKFs", duration: "10:00", categoryKey: "stretching" },
    { youtubeId: "pCSjhbVOdYQ", duration: "60:00", categoryKey: "relaxation" },
    { youtubeId: "MxFf7P-DK6c", duration: "12:00", categoryKey: "strength" },
  ],
  de: [
    { youtubeId: "AzuIPejeHXA", duration: "10:00", categoryKey: "stretching" },
    { youtubeId: "c1PoK233RNQ", duration: "12:00", categoryKey: "strength" },
    { youtubeId: "M3dMkgv2JPw", duration: "15:00", categoryKey: "fullBody" },
    { youtubeId: "pCSjhbVOdYQ", duration: "60:00", categoryKey: "relaxation" },
    { youtubeId: "4JfuBEJLbDc", duration: "12:00", categoryKey: "yoga" },
  ],
  fr: [
    { youtubeId: "ZhtzgI1cmTA", duration: "15:00", categoryKey: "core" },
    { youtubeId: "CWa-cAZuVyE", duration: "20:00", categoryKey: "strength" },
    { youtubeId: "qE99koyxv_w", duration: "14:00", categoryKey: "fullBody" },
    { youtubeId: "pCSjhbVOdYQ", duration: "60:00", categoryKey: "relaxation" },
    { youtubeId: "w5jf2Yxw5ws", duration: "12:00", categoryKey: "stretching" },
  ],
  es: [
    { youtubeId: "gVwBXO3kqUc", duration: "20:00", categoryKey: "fullBody" },
    { youtubeId: "eugdUjFGnyQ", duration: "15:00", categoryKey: "stretching" },
    { youtubeId: "mLVZoZ9KDBM", duration: "15:00", categoryKey: "birthPrep" },
    { youtubeId: "0tra1nmahwc", duration: "45:00", categoryKey: "strength" },
    { youtubeId: "dtwlqVWThMY", duration: "20:00", categoryKey: "yoga" },
    { youtubeId: "pCSjhbVOdYQ", duration: "60:00", categoryKey: "relaxation" },
  ],
  pt: [
    { youtubeId: "-6QpPBWsiAo", duration: "12:00", categoryKey: "birthPrep" },
    { youtubeId: "2E52kABbQg0", duration: "15:00", categoryKey: "stretching" },
    { youtubeId: "NOJQwTw6pAM", duration: "20:00", categoryKey: "fullBody" },
    { youtubeId: "InieW2MYgsA", duration: "10:00", categoryKey: "core" },
    { youtubeId: "5GNrC3ML_VM", duration: "15:00", categoryKey: "yoga" },
    { youtubeId: "pCSjhbVOdYQ", duration: "60:00", categoryKey: "relaxation" },
  ],
  default: [
    { youtubeId: "Mcic8Z-8pxY", duration: "30:00", categoryKey: "fullBody" },
    { youtubeId: "M4IoSwHGezg", duration: "30:00", categoryKey: "strength" },
    { youtubeId: "gb8ZF-8i160", duration: "15:00", categoryKey: "stretching" },
    { youtubeId: "vEcZD8Js2Ws", duration: "25:00", categoryKey: "yoga" },
    { youtubeId: "pCSjhbVOdYQ", duration: "60:00", categoryKey: "relaxation" },
    { youtubeId: "f7KnXTEpf5M", duration: "10:00", categoryKey: "core" },
    { youtubeId: "zk5eFlXUbCs", duration: "12:00", categoryKey: "birthPrep" },
  ],
};

export const getVideosByLanguage = (lang: string) => {
  return fitnessVideosByLang[lang] || fitnessVideosByLang.default;
};
