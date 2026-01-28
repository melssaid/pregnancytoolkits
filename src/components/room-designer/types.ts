export interface Position {
  x: number;
  y: number;
}

export interface FurnitureAsset {
  id: string;
  name: string;
  icon: string;
  category: 'furniture' | 'decor' | 'lighting' | 'textile';
  defaultSize: { width: number; height: number };
}

export interface PlacedFurniture extends FurnitureAsset {
  instanceId: string;
  position: Position;
  rotation: number;
  scale: number;
  tintColor?: string;
}

export interface RoomTheme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  icon: string;
}

export const ROOM_THEMES: RoomTheme[] = [
  {
    id: 'soft-pink',
    name: 'Soft Pink',
    primaryColor: '346 77% 85%',
    secondaryColor: '346 60% 92%',
    accentColor: '346 85% 70%',
    icon: '🌸'
  },
  {
    id: 'sky-blue',
    name: 'Sky Blue',
    primaryColor: '199 89% 85%',
    secondaryColor: '199 70% 92%',
    accentColor: '199 95% 65%',
    icon: '☁️'
  },
  {
    id: 'sage-green',
    name: 'Sage Green',
    primaryColor: '143 40% 82%',
    secondaryColor: '143 30% 90%',
    accentColor: '143 50% 60%',
    icon: '🌿'
  },
  {
    id: 'neutral-beige',
    name: 'Neutral Beige',
    primaryColor: '35 30% 85%',
    secondaryColor: '35 20% 92%',
    accentColor: '35 45% 65%',
    icon: '🏠'
  },
  {
    id: 'lavender',
    name: 'Lavender',
    primaryColor: '270 50% 85%',
    secondaryColor: '270 40% 92%',
    accentColor: '270 60% 70%',
    icon: '💜'
  },
];

export const FURNITURE_ASSETS: FurnitureAsset[] = [
  // Furniture
  { id: 'crib', name: 'Modern Crib', icon: '🛏️', category: 'furniture', defaultSize: { width: 120, height: 80 } },
  { id: 'nursing-chair', name: 'Nursing Chair', icon: '🪑', category: 'furniture', defaultSize: { width: 80, height: 80 } },
  { id: 'changing-table', name: 'Changing Table', icon: '🗄️', category: 'furniture', defaultSize: { width: 100, height: 60 } },
  { id: 'dresser', name: 'Dresser', icon: '🗃️', category: 'furniture', defaultSize: { width: 100, height: 50 } },
  { id: 'bookshelf', name: 'Bookshelf', icon: '📚', category: 'furniture', defaultSize: { width: 80, height: 40 } },
  
  // Decor
  { id: 'mobile', name: 'Mobile', icon: '🎠', category: 'decor', defaultSize: { width: 50, height: 50 } },
  { id: 'wall-art', name: 'Wall Art', icon: '🖼️', category: 'decor', defaultSize: { width: 60, height: 60 } },
  { id: 'mirror', name: 'Mirror', icon: '🪞', category: 'decor', defaultSize: { width: 50, height: 70 } },
  { id: 'plant', name: 'Plant', icon: '🪴', category: 'decor', defaultSize: { width: 40, height: 50 } },
  
  // Lighting
  { id: 'floor-lamp', name: 'Floor Lamp', icon: '🪔', category: 'lighting', defaultSize: { width: 40, height: 40 } },
  { id: 'night-light', name: 'Night Light', icon: '💡', category: 'lighting', defaultSize: { width: 30, height: 30 } },
  { id: 'ceiling-light', name: 'Pendant Light', icon: '💫', category: 'lighting', defaultSize: { width: 50, height: 30 } },
  
  // Textiles
  { id: 'rug', name: 'Area Rug', icon: '🟫', category: 'textile', defaultSize: { width: 140, height: 100 } },
  { id: 'curtains', name: 'Curtains', icon: '🪟', category: 'textile', defaultSize: { width: 80, height: 120 } },
  { id: 'blanket', name: 'Baby Blanket', icon: '🧶', category: 'textile', defaultSize: { width: 60, height: 60 } },
];
