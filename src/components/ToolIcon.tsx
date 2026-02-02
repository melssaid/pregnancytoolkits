import React from 'react';

// Import all tool icons
import chatAssistant from '@/assets/icons/chat-assistant.png';
import symptomAnalyzer from '@/assets/icons/symptom-analyzer.png';
import mealSuggestion from '@/assets/icons/meal-suggestion.png';
import weeklySummary from '@/assets/icons/weekly-summary.png';
import birthPlan from '@/assets/icons/birth-plan.png';
import babyName from '@/assets/icons/baby-name.png';
import pregnancyTips from '@/assets/icons/pregnancy-tips.png';
import groceryList from '@/assets/icons/grocery-list.png';
import sleepOptimizer from '@/assets/icons/sleep-optimizer.png';
import hospitalBag from '@/assets/icons/hospital-bag.png';
import partnerGuide from '@/assets/icons/partner-guide.png';
import birthPosition from '@/assets/icons/birth-position.png';
import skincare from '@/assets/icons/skincare.png';
import nauseaRelief from '@/assets/icons/nausea-relief.png';

import lactation from '@/assets/icons/lactation.png';
import postureCoach from '@/assets/icons/posture-coach.png';
import stretchReminder from '@/assets/icons/stretch-reminder.png';
import backPain from '@/assets/icons/back-pain.png';
import mobilityCoach from '@/assets/icons/mobility-coach.png';
import smoothie from '@/assets/icons/smoothie.png';
import exercise from '@/assets/icons/exercise.png';
import laborProgress from '@/assets/icons/labor-progress.png';
import contractionTimer from '@/assets/icons/contraction-timer.png';
import breathing from '@/assets/icons/breathing.png';
import ovulation from '@/assets/icons/ovulation.png';
import cycleTracker from '@/assets/icons/cycle-tracker.png';
import dueDate from '@/assets/icons/due-date.png';
import fetalGrowth from '@/assets/icons/fetal-growth.png';
import kickCounter from '@/assets/icons/kick-counter.png';
import milestones from '@/assets/icons/milestones.png';
import bumpPhotos from '@/assets/icons/bump-photos.png';
import weightGain from '@/assets/icons/weight-gain.png';
import waterIntake from '@/assets/icons/water-intake.png';
import vitaminTracker from '@/assets/icons/vitamin-tracker.png';
import meditation from '@/assets/icons/meditation.png';
import affirmations from '@/assets/icons/affirmations.png';
import mentalHealth from '@/assets/icons/mental-health.png';
import diabetes from '@/assets/icons/diabetes.png';
import birthPrep from '@/assets/icons/birth-prep.png';
import babySleep from '@/assets/icons/baby-sleep.png';
import babyGrowth from '@/assets/icons/baby-growth.png';
import doctorQuestions from '@/assets/icons/doctor-questions.png';
import appointmentReminder from '@/assets/icons/appointment-reminder.png';
import birthStory from '@/assets/icons/birth-story.png';
import cravingAlternatives from '@/assets/icons/craving-alternatives.png';
import fitnessCoach from '@/assets/icons/fitness-coach.png';
import legCramp from '@/assets/icons/leg-cramp.png';
import stressRelief from '@/assets/icons/stress-relief.png';
import massageGuide from '@/assets/icons/massage-guide.png';

// Map tool IDs to their icon imports
export const toolIconMap: Record<string, string> = {
  // AI Core Tools
  'pregnancy-assistant': chatAssistant,
  'symptom-analyzer': symptomAnalyzer,
  'ai-meal-suggestion': mealSuggestion,
  'weekly-summary': weeklySummary,
  'ai-birth-plan': birthPlan,
  'smart-appointment-reminder': appointmentReminder,
  'ai-baby-name-finder': babyName,
  'ai-pregnancy-tips': pregnancyTips,
  'ai-birth-story': birthStory,
  'smart-grocery-list': groceryList,
  
  // AI Tools 2026
  'ai-sleep-optimizer': sleepOptimizer,
  'ai-hospital-bag': hospitalBag,
  'ai-partner-guide': partnerGuide,
  'ai-birth-position': birthPosition,
  'ai-pregnancy-skincare': skincare,
  'ai-nausea-relief': nauseaRelief,
  
  'ai-lactation-prep': lactation,
  'ai-craving-alternatives': cravingAlternatives,
  'ai-recipe-modifier': mealSuggestion,
  
  // Wellness & Fitness
  'ai-posture-coach': postureCoach,
  'smart-stretch-reminder': stretchReminder,
  'ai-back-pain-relief': backPain,
  'ai-mobility-coach': mobilityCoach,
  'pregnancy-smoothie-ai': smoothie,
  'exercise-guide': exercise,
  'ai-fitness-coach': fitnessCoach,
  'ai-leg-cramp-preventer': legCramp,
  'ai-stress-relief': stressRelief,
  'pregnancy-massage-guide': massageGuide,
  'smart-walking-coach': mobilityCoach,
  'smart-nutrition-optimizer': mealSuggestion,
  'smart-snack-planner': smoothie,
  
  // Labor & Monitoring
  'ai-labor-progress': laborProgress,
  'contraction-timer': contractionTimer,
  'labor-breathing': breathing,
  
  // Fertility & Planning
  'ovulation-calculator': ovulation,
  'cycle-tracker': cycleTracker,
  'due-date-calculator': dueDate,
  'conception-calculator': ovulation,
  
  // Pregnancy Tracking
  'fetal-growth': fetalGrowth,
  'kick-counter': kickCounter,
  'pregnancy-milestones': milestones,
  'bump-photos': bumpPhotos,
  'weight-gain': weightGain,
  'baby-gear-recommender': groceryList,
  'fetal-development-3d': fetalGrowth,
  'preeclampsia-risk': diabetes,
  'blood-type': diabetes,
  'pregnancy-bmi': weightGain,
  'forbidden-foods': cravingAlternatives,
  'pregnancy-photo-timeline': bumpPhotos,
  
  // Nutrition & Hydration
  'water-intake': waterIntake,
  'vitamin-tracker': vitaminTracker,
  'meditation-yoga': meditation,
  'kegel-exercises': exercise,
  
  // Mental Health
  'affirmations': affirmations,
  'postpartum-mental-health': mentalHealth,
  
  // Health Monitoring
  'gestational-diabetes': diabetes,
  
  // Preparation
  'birth-prep': birthPrep,
  
  // Postpartum & Baby
  'baby-sleep-tracker': babySleep,
  'baby-growth': babyGrowth,
  'doctor-questions': doctorQuestions,
  'diaper-tracker': babyGrowth,
  
  // Workout & Personalized Plans
  'personalized-workout-planner': fitnessCoach,
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
  const iconSrc = toolIconMap[toolId];
  
  if (!iconSrc) {
    return null;
  }

  return (
    <img 
      src={iconSrc}
      alt={toolId}
      className={`object-cover ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
      }}
    />
  );
};

// Helper to check if a tool has a custom icon
export const hasToolIcon = (toolId: string): boolean => {
  return toolId in toolIconMap;
};

export default ToolIcon;
