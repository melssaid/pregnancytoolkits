import { useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Hook that calls a reset callback whenever the app language changes.
 * Use this in AI tool components to clear generated results when the user switches language.
 * 
 * @param onReset - Callback to execute when language changes (e.g., clear AI state)
 * 
 * @example
 * useResetOnLanguageChange(() => {
 *   setAiResponse('');
 *   setHasGenerated(false);
 * });
 */
export function useResetOnLanguageChange(onReset: () => void) {
  const { currentLanguage } = useLanguage();
  const prevLangRef = useRef(currentLanguage);
  const onResetRef = useRef(onReset);
  onResetRef.current = onReset;

  useEffect(() => {
    if (prevLangRef.current !== currentLanguage) {
      prevLangRef.current = currentLanguage;
      onResetRef.current();
    }
  }, [currentLanguage]);
}
