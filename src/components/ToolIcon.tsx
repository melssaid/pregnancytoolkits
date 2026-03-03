import React from 'react';

// Map tool IDs to their icon filenames in /public/icons/
const toolIconMap: Record<string, string> = {
  'pregnancy-assistant': 'chat-assistant',
  'wellness-diary': 'symptom-analyzer',
  'ai-meal-suggestion': 'meal-suggestion',
  'weekly-summary': 'weekly-summary',
  'ai-birth-plan': 'birth-plan',
  'smart-appointment-reminder': 'appointment-reminder',
  'ai-baby-name-finder': 'baby-name',
  'ai-pregnancy-tips': 'pregnancy-tips',
  'ai-birth-story': 'birth-story',
  'smart-grocery-list': 'grocery-list',
  'ai-sleep-optimizer': 'sleep-optimizer',
  'ai-hospital-bag': 'hospital-bag',
  'ai-partner-guide': 'partner-guide',
  'ai-birth-position': 'birth-position',
  'ai-pregnancy-skincare': 'skincare',
  'ai-nausea-relief': 'nausea-relief',
  'ai-lactation-prep': 'lactation',
  'ai-craving-alternatives': 'craving-alternatives',
  'ai-recipe-modifier': 'meal-suggestion',
  'ai-posture-coach': 'posture-coach',
  'smart-stretch-reminder': 'stretch-reminder',
  'ai-back-pain-relief': 'back-pain',
  'ai-mobility-coach': 'mobility-coach',
  'pregnancy-smoothie-ai': 'smoothie',
  'exercise-guide': 'exercise',
  'ai-fitness-coach': 'fitness-coach',
  'ai-leg-cramp-preventer': 'leg-cramp',
  'ai-stress-relief': 'stress-relief',
  'pregnancy-massage-guide': 'massage-guide',
  'smart-walking-coach': 'mobility-coach',
  'smart-nutrition-optimizer': 'meal-suggestion',
  'smart-snack-planner': 'smoothie',
  'ai-labor-progress': 'labor-progress',
  'contraction-timer': 'contraction-timer',
  'labor-breathing': 'breathing',
  'ovulation-calculator': 'ovulation',
  'cycle-tracker': 'cycle-tracker',
  'due-date-calculator': 'due-date',
  'conception-calculator': 'ovulation',
  'fetal-growth': 'fetal-growth',
  'kick-counter': 'kick-counter',
  'pregnancy-milestones': 'milestones',
  'bump-photos': 'bump-photos',
  'weight-gain': 'weight-gain',
  'baby-gear-recommender': 'grocery-list',
  'fetal-development-3d': 'fetal-growth',
  'preeclampsia-risk': 'diabetes',
  'blood-type': 'diabetes',
  'pregnancy-bmi': 'weight-gain',
  'forbidden-foods': 'craving-alternatives',
  'pregnancy-photo-timeline': 'bump-photos',
  'water-intake': 'water-intake',
  'vitamin-tracker': 'vitamin-tracker',
  'meditation-yoga': 'meditation',
  'kegel-exercises': 'exercise',
  'affirmations': 'affirmations',
  'postpartum-mental-health': 'mental-health',
  'gestational-diabetes': 'diabetes',
  'birth-prep': 'birth-prep',
  'baby-sleep-tracker': 'baby-sleep',
  'baby-growth': 'baby-growth',
  'doctor-questions': 'doctor-questions',
  'diaper-tracker': 'baby-growth',
  'baby-cry-translator': 'baby-cry-translator',
  'postpartum-recovery': 'postpartum-recovery',
  'personalized-workout-planner': 'fitness-coach',
};

export type ToolIconName = keyof typeof toolIconMap;

interface ToolIconProps {
  toolId: string;
  size?: number;
  className?: string;
}

export const ToolIcon: React.FC<ToolIconProps> = ({ 
  toolId, 
  size = 100,
  className = ''
}) => {
  const iconFile = toolIconMap[toolId];
  
  if (!iconFile) return null;

  return (
    <img 
      src={`/icons/${iconFile}.png`}
      alt={toolId}
      loading="lazy"
      decoding="async"
      className={`object-cover ${className}`}
      style={{ width: size, height: size, borderRadius: '50%' }}
    />
  );
};

export const hasToolIcon = (toolId: string): boolean => toolId in toolIconMap;

export default ToolIcon;
