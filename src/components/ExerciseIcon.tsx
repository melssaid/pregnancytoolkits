import React from 'react';
import { LucideIcon } from 'lucide-react';
import { 
  RotateCcw, Activity, Hand, Footprints, Wind, Dumbbell, 
  ArrowUp, Circle, Sparkles, Target
} from 'lucide-react';

interface ExerciseIconProps {
  type: string;
  className?: string;
}

const iconMap: Record<string, LucideIcon> = {
  // Stretch icons
  neck: RotateCcw,
  shoulders: ArrowUp,
  wrists: Hand,
  back: Activity,
  spine: Activity,
  hips: Circle,
  legs: Footprints,
  breathing: Wind,
  
  // Exercise icons
  core: Target,
  yoga: Sparkles,
  strength: Dumbbell,
  stretch: ArrowUp,
  
  // Massage icons  
  feet: Footprints,
  hands: Hand,
};

export const ExerciseIcon: React.FC<ExerciseIconProps> = ({ 
  type, 
  className = "w-6 h-6 text-primary"
}) => {
  const IconComponent = iconMap[type] || Activity;
  return <IconComponent className={className} />;
};

export default ExerciseIcon;
