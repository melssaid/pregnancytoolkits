import type { ReactNode } from 'react';
import { Sparkles, Baby, Moon, Star, Heart, Waves } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PlacedFurniture, RoomTheme } from './types';
import { ROOM_THEMES, FURNITURE_ASSETS } from './types';

export interface DesignTemplate {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
  theme: RoomTheme;
  furniture: Omit<PlacedFurniture, 'instanceId'>[];
  preview: string;
}

const createFurnitureItem = (
  assetId: string,
  position: { x: number; y: number },
  rotation: number = 0,
  scale: number = 1
): Omit<PlacedFurniture, 'instanceId'> | null => {
  const asset = FURNITURE_ASSETS.find(a => a.id === assetId);
  if (!asset) return null;
  return {
    ...asset,
    position,
    rotation,
    scale,
  };
};

export const DESIGN_TEMPLATES: DesignTemplate[] = [
  {
    id: 'classic-nursery',
    name: 'Classic Nursery',
    description: 'Traditional layout with crib as focal point',
    icon: <Baby className="w-5 h-5" />,
    theme: ROOM_THEMES.find(t => t.id === 'soft-pink') || ROOM_THEMES[0],
    preview: '🛏️🪑🪔',
    furniture: [
      createFurnitureItem('crib', { x: 50, y: 25 }),
      createFurnitureItem('nursing-chair', { x: 15, y: 50 }),
      createFurnitureItem('changing-table', { x: 85, y: 30 }),
      createFurnitureItem('dresser', { x: 85, y: 60 }),
      createFurnitureItem('floor-lamp', { x: 10, y: 30 }),
      createFurnitureItem('rug', { x: 50, y: 70 }),
    ].filter(Boolean) as Omit<PlacedFurniture, 'instanceId'>[],
  },
  {
    id: 'cozy-corner',
    name: 'Cozy Corner',
    description: 'Intimate space with reading nook',
    icon: <Moon className="w-5 h-5" />,
    theme: ROOM_THEMES.find(t => t.id === 'lavender') || ROOM_THEMES[0],
    preview: '🛌🪴📚',
    furniture: [
      createFurnitureItem('rocking-crib', { x: 30, y: 25 }),
      createFurnitureItem('nursing-chair', { x: 75, y: 35 }),
      createFurnitureItem('bookshelf', { x: 85, y: 65 }),
      createFurnitureItem('night-light', { x: 15, y: 25 }),
      createFurnitureItem('plant', { x: 90, y: 20 }),
      createFurnitureItem('blanket', { x: 75, y: 60 }),
      createFurnitureItem('rug', { x: 50, y: 75 }),
    ].filter(Boolean) as Omit<PlacedFurniture, 'instanceId'>[],
  },
  {
    id: 'playful-space',
    name: 'Playful Space',
    description: 'Active play area with toy storage',
    icon: <Star className="w-5 h-5" />,
    theme: ROOM_THEMES.find(t => t.id === 'sunny-yellow') || ROOM_THEMES[0],
    preview: '🎲🧸🌻',
    furniture: [
      createFurnitureItem('crib', { x: 20, y: 20 }),
      createFurnitureItem('play-table', { x: 60, y: 50 }),
      createFurnitureItem('toy-box', { x: 85, y: 65 }),
      createFurnitureItem('bookshelf', { x: 85, y: 30 }),
      createFurnitureItem('rug', { x: 55, y: 70 }),
      createFurnitureItem('mobile', { x: 20, y: 10 }),
      createFurnitureItem('star-lamp', { x: 10, y: 45 }),
    ].filter(Boolean) as Omit<PlacedFurniture, 'instanceId'>[],
  },
  {
    id: 'minimalist-zen',
    name: 'Minimalist Zen',
    description: 'Clean, calm Scandinavian style',
    icon: <Sparkles className="w-5 h-5" />,
    theme: ROOM_THEMES.find(t => t.id === 'nordic-gray') || ROOM_THEMES[0],
    preview: '🪨🌿🪞',
    furniture: [
      createFurnitureItem('crib', { x: 50, y: 30 }),
      createFurnitureItem('nursing-chair', { x: 20, y: 50 }),
      createFurnitureItem('small-wardrobe', { x: 85, y: 40 }),
      createFurnitureItem('plant', { x: 10, y: 25 }),
      createFurnitureItem('mirror', { x: 15, y: 60 }),
      createFurnitureItem('rug', { x: 50, y: 70 }),
    ].filter(Boolean) as Omit<PlacedFurniture, 'instanceId'>[],
  },
  {
    id: 'nature-inspired',
    name: 'Nature Inspired',
    description: 'Organic elements with green accents',
    icon: <Heart className="w-5 h-5" />,
    theme: ROOM_THEMES.find(t => t.id === 'sage-green') || ROOM_THEMES[0],
    preview: '🌿🍃🪴',
    furniture: [
      createFurnitureItem('rocking-crib', { x: 45, y: 25 }),
      createFurnitureItem('nursing-chair', { x: 15, y: 45 }),
      createFurnitureItem('changing-table', { x: 80, y: 25 }),
      createFurnitureItem('plant', { x: 10, y: 20 }),
      createFurnitureItem('plant', { x: 90, y: 55 }),
      createFurnitureItem('wall-art', { x: 50, y: 8 }),
      createFurnitureItem('rug', { x: 45, y: 70 }),
      createFurnitureItem('floor-lamp', { x: 10, y: 65 }),
    ].filter(Boolean) as Omit<PlacedFurniture, 'instanceId'>[],
  },
  {
    id: 'ocean-dreams',
    name: 'Ocean Dreams',
    description: 'Calming ocean-themed nursery',
    icon: <Waves className="w-5 h-5" />,
    theme: ROOM_THEMES.find(t => t.id === 'ocean-teal') || ROOM_THEMES[0],
    preview: '🌊☁️💤',
    furniture: [
      createFurnitureItem('crib', { x: 50, y: 25 }),
      createFurnitureItem('nursing-chair', { x: 80, y: 50 }),
      createFurnitureItem('dresser', { x: 15, y: 35 }),
      createFurnitureItem('mobile', { x: 50, y: 10 }),
      createFurnitureItem('night-light', { x: 85, y: 25 }),
      createFurnitureItem('curtains', { x: 10, y: 20 }),
      createFurnitureItem('rug', { x: 50, y: 70 }),
      createFurnitureItem('pillow', { x: 75, y: 75 }),
    ].filter(Boolean) as Omit<PlacedFurniture, 'instanceId'>[],
  },
];

interface TemplateGalleryProps {
  onSelectTemplate: (template: DesignTemplate) => void;
  currentTheme: RoomTheme;
}

export const TemplateGallery = ({ onSelectTemplate, currentTheme }: TemplateGalleryProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4" style={{ color: `hsl(${currentTheme.accentColor})` }} />
        <h3 className="font-medium text-sm">Quick Start Templates</h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {DESIGN_TEMPLATES.map((template) => (
          <Button
            key={template.id}
            variant="outline"
            className="h-auto py-3 px-3 flex flex-col items-start gap-1 hover:shadow-md transition-all"
            style={{
              borderColor: `hsl(${template.theme.primaryColor} / 0.3)`,
              background: `hsl(${template.theme.primaryColor} / 0.05)`,
            }}
            onClick={() => onSelectTemplate(template)}
          >
            <div className="flex items-center gap-2 w-full">
              <div
                className="p-1.5 rounded-md"
                style={{ 
                  background: `hsl(${template.theme.primaryColor} / 0.2)`,
                  color: `hsl(${template.theme.accentColor})`,
                }}
              >
                {template.icon}
              </div>
              <span className="font-medium text-xs">{template.name}</span>
            </div>
            <span className="text-[10px] text-muted-foreground text-left line-clamp-1">
              {template.furniture.length} items • {template.theme.name}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};
