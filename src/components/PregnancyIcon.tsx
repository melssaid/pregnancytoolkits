import React from 'react';
import pregnancyIcons from '@/assets/icons/pregnancy-icons.png';

// Icon positions in the sprite (4x4 grid, each icon ~25% of width/height)
const iconPositions = {
  // Row 1
  'pregnant-woman': { row: 0, col: 0 },
  'baby-growth': { row: 0, col: 1 },
  'calendar': { row: 0, col: 2 },
  'blood-type': { row: 0, col: 3 },
  // Row 2
  'weight-scale': { row: 1, col: 0 },
  'nutrition': { row: 1, col: 1 },
  'chat-assistant': { row: 1, col: 2 },
  'partner-guide': { row: 1, col: 3 },
  // Row 3
  'heartbeat': { row: 2, col: 0 },
  'breastfeeding': { row: 2, col: 1 },
  'checklist': { row: 2, col: 2 },
  'shopping': { row: 2, col: 3 },
  // Row 4
  'pregnancy-profile': { row: 3, col: 0 },
  'medical-report': { row: 3, col: 1 },
  'health-shield': { row: 3, col: 2 },
  'mother-baby': { row: 3, col: 3 },
} as const;

export type PregnancyIconName = keyof typeof iconPositions;

interface PregnancyIconProps {
  name: PregnancyIconName;
  size?: number;
  className?: string;
}

export const PregnancyIcon: React.FC<PregnancyIconProps> = ({ 
  name, 
  size = 32,
  className = ''
}) => {
  const position = iconPositions[name];
  if (!position) return null;

  const spriteSize = size * 4; // 4 icons per row/column
  const offsetX = position.col * size;
  const offsetY = position.row * size;

  return (
    <div 
      className={`inline-block flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${pregnancyIcons})`,
        backgroundSize: `${spriteSize}px ${spriteSize}px`,
        backgroundPosition: `-${offsetX}px -${offsetY}px`,
        backgroundRepeat: 'no-repeat',
      }}
      role="img"
      aria-label={name}
    />
  );
};

// Map tool IDs to custom icon names
export const toolIconMapping: Record<string, PregnancyIconName> = {
  // AI Core Tools
  'pregnancy-assistant': 'chat-assistant',
  'wellness-diary': 'heartbeat',
  'ai-meal-suggestion': 'nutrition',
  'weekly-summary': 'calendar',
  'ai-birth-plan': 'checklist',
  'ai-baby-name-finder': 'baby-growth',
  'ai-pregnancy-tips': 'pregnant-woman',
  'ai-birth-story': 'mother-baby',
  'smart-grocery-list': 'shopping',
  'ai-partner-guide': 'partner-guide',
  
  // Wellness Tools
  'ai-posture-coach': 'pregnant-woman',
  'vitamin-tracker': 'health-shield',
  'weight-gain': 'weight-scale',
  'ai-lactation-prep': 'breastfeeding',
  
  // Health & Monitoring
  'gestational-diabetes': 'medical-report',
  'doctor-questions': 'medical-report',
  'smart-appointment-reminder': 'calendar',
  
  // Pregnancy Tracking
  'fetal-growth': 'baby-growth',
  'kick-counter': 'heartbeat',
  'due-date-calculator': 'calendar',
  'baby-growth': 'baby-growth',
  
  // Labor & Birth
  'birth-prep': 'checklist',
  'contraction-timer': 'heartbeat',
  'labor-breathing': 'pregnant-woman',
  
  // Postpartum
  'baby-sleep-tracker': 'mother-baby',
  'postpartum-mental-health': 'health-shield',
};

// Helper to get icon for a tool
export const getToolIcon = (toolId: string): PregnancyIconName | null => {
  return toolIconMapping[toolId] || null;
};

export default PregnancyIcon;
