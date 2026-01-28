import { useState, useEffect, useCallback } from 'react';
import { safeParseLocalStorage, safeSaveToLocalStorage, safeRemoveFromLocalStorage } from '@/lib/safeStorage';
import type { PlacedFurniture, RoomTheme } from '@/components/room-designer/types';
import { ROOM_THEMES } from '@/components/room-designer/types';

const STORAGE_KEY = 'baby-room-design';

interface SavedDesign {
  placedFurniture: PlacedFurniture[];
  themeId: string;
  roomImage: string | null;
  savedAt: string;
}

export const useRoomDesignStorage = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  const saveDesign = useCallback((
    placedFurniture: PlacedFurniture[],
    theme: RoomTheme,
    roomImage: string | null
  ) => {
    const design: SavedDesign = {
      placedFurniture,
      themeId: theme.id,
      roomImage,
      savedAt: new Date().toISOString(),
    };
    return safeSaveToLocalStorage(STORAGE_KEY, design);
  }, []);

  const loadDesign = useCallback((): {
    placedFurniture: PlacedFurniture[];
    theme: RoomTheme;
    roomImage: string | null;
  } | null => {
    const defaultDesign: SavedDesign = {
      placedFurniture: [],
      themeId: ROOM_THEMES[0].id,
      roomImage: null,
      savedAt: '',
    };
    
    const design = safeParseLocalStorage<SavedDesign>(STORAGE_KEY, defaultDesign);
    
    if (!design.savedAt) return null;
    
    const theme = ROOM_THEMES.find(t => t.id === design.themeId) || ROOM_THEMES[0];
    
    return {
      placedFurniture: design.placedFurniture || [],
      theme,
      roomImage: design.roomImage,
    };
  }, []);

  const clearDesign = useCallback(() => {
    safeRemoveFromLocalStorage(STORAGE_KEY);
  }, []);

  const hasSavedDesign = useCallback((): boolean => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved !== null;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return {
    saveDesign,
    loadDesign,
    clearDesign,
    hasSavedDesign,
    isLoaded,
  };
};
