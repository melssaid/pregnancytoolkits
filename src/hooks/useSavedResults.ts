import { useState, useEffect, useCallback } from 'react';
import { safeParseLocalStorage, safeSaveToLocalStorage } from '@/lib/safeStorage';
import { toast } from 'sonner';

const STORAGE_KEY = 'ai-saved-results';
const MAX_SAVED = 20;

export interface SavedAIResult {
  id: string;
  toolId: string;
  title: string;
  content: string;
  savedAt: string;
  meta?: Record<string, any>;
}

export function useSavedResults(toolId?: string) {
  const [allResults, setAllResults] = useState<SavedAIResult[]>(() =>
    safeParseLocalStorage<SavedAIResult[]>(STORAGE_KEY, [], (d): d is SavedAIResult[] => Array.isArray(d))
  );

  useEffect(() => {
    safeSaveToLocalStorage(STORAGE_KEY, allResults);
  }, [allResults]);

  // Sync from external auto-saves (useSmartInsight) and other tabs
  useEffect(() => {
    const reload = () => {
      const fresh = safeParseLocalStorage<SavedAIResult[]>(STORAGE_KEY, [], (d): d is SavedAIResult[] => Array.isArray(d));
      setAllResults(fresh);
    };
    const onStorage = (e: StorageEvent) => { if (e.key === STORAGE_KEY) reload(); };
    window.addEventListener('ai-results-saved', reload);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('ai-results-saved', reload);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const results = toolId ? allResults.filter(r => r.toolId === toolId) : allResults;

  const isSaved = useCallback((content: string) => {
    return allResults.some(r => r.content === content);
  }, [allResults]);

  const save = useCallback((item: Omit<SavedAIResult, 'id' | 'savedAt'>) => {
    if (allResults.length >= MAX_SAVED) {
      toast.error('Maximum saved results reached. Delete some to save more.');
      return false;
    }
    if (isSaved(item.content)) {
      toast.info('Already saved');
      return false;
    }
    const newItem: SavedAIResult = {
      ...item,
      id: `saved-${Date.now()}`,
      savedAt: new Date().toISOString(),
    };
    setAllResults(prev => [newItem, ...prev]);
    toast.success('✓');
    return true;
  }, [allResults.length, isSaved]);

  const remove = useCallback((id: string) => {
    setAllResults(prev => prev.filter(r => r.id !== id));
    toast.success('✓');
  }, []);

  const unsaveByContent = useCallback((content: string) => {
    setAllResults(prev => prev.filter(r => r.content !== content));
    toast.success('✓');
  }, []);

  return { results, allResults, save, remove, isSaved, unsaveByContent, count: allResults.length, max: MAX_SAVED };
}
