import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Expand flat dotted keys (e.g. "toolsInternal.babyCryTranslator") into nested objects
function expandDottedKeys(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    const value = typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])
      ? expandDottedKeys(obj[key])
      : obj[key];
    if (key.includes('.')) {
      const parts = key.split('.');
      let current = result;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]] || typeof current[parts[i]] !== 'object') {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }
      const lastPart = parts[parts.length - 1];
      if (typeof value === 'object' && typeof current[lastPart] === 'object') {
        current[lastPart] = { ...current[lastPart], ...value };
      } else {
        current[lastPart] = value;
      }
    } else {
      if (typeof value === 'object' && typeof result[key] === 'object') {
        result[key] = { ...result[key], ...value };
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

const SUPPORTED_LANGUAGES = ['en', 'ar', 'de', 'tr', 'fr', 'es', 'pt'];
const MANUAL_LANGUAGE_KEY = 'user_selected_language';

// Lazy loaders for each locale — Vite will code-split these
const localeLoaders: Record<string, () => Promise<Record<string, any>>> = {
  en: () => import('./locales/en.json').then(m => m.default),
  ar: () => import('./locales/ar.json').then(m => m.default),
  de: () => import('./locales/de.json').then(m => m.default),
  tr: () => import('./locales/tr.json').then(m => m.default),
  fr: () => import('./locales/fr.json').then(m => m.default),
  es: () => import('./locales/es.json').then(m => m.default),
  pt: () => import('./locales/pt.json').then(m => m.default),
};

// Cache to avoid re-processing
const loadedLanguages = new Set<string>();

export async function loadLanguage(lng: string): Promise<void> {
  if (loadedLanguages.has(lng)) return;
  const loader = localeLoaders[lng];
  if (!loader) return;
  try {
    const data = await loader();
    i18n.addResourceBundle(lng, 'translation', expandDottedKeys(data), true, true);
    loadedLanguages.add(lng);
  } catch (e) {
    console.error(`Failed to load locale: ${lng}`, e);
  }
}

/** Preload all supported language bundles (non-blocking) */
export function preloadAllLanguages(): Promise<void[]> {
  return Promise.all(SUPPORTED_LANGUAGES.map(loadLanguage));
}

// Get the best matching language from browser
const getBrowserLanguage = (): string => {
  const browserLang = navigator.language?.split('-')[0] || 'en';
  return SUPPORTED_LANGUAGES.includes(browserLang) ? browserLang : 'en';
};

const getManualLanguage = (): string | null => {
  return localStorage.getItem(MANUAL_LANGUAGE_KEY);
};

const getInitialLanguage = (): string => {
  const manualLang = getManualLanguage();
  if (manualLang && SUPPORTED_LANGUAGES.includes(manualLang)) return manualLang;
  // Check i18nextLng fallback
  const i18nextLng = localStorage.getItem('i18nextLng')?.split('-')[0];
  if (i18nextLng && SUPPORTED_LANGUAGES.includes(i18nextLng)) return i18nextLng;
  // Auto-detect browser language for first-time users
  return getBrowserLanguage();
};

const initialLang = getInitialLanguage();

// Pre-load initial locale files, then init i18n with resources ready
const initPromise = (async () => {
  let resources: Record<string, { translation: Record<string, any> }> = {};

  try {
    const toLoad = [initialLang];
    if (initialLang !== 'en') toLoad.push('en');

    const bundles = await Promise.all(
      toLoad.map(async (lng) => {
        const loader = localeLoaders[lng];
        if (!loader) return { lng, data: {} };
        const data = await loader();
        return { lng, data: expandDottedKeys(data) };
      })
    );

    for (const { lng, data } of bundles) {
      resources[lng] = { translation: data };
      loadedLanguages.add(lng);
    }
  } catch (e) {
    console.warn('[i18n] Failed to load locale bundles, starting with empty resources', e);
    // Ensure at least an empty English bundle so i18n doesn't throw
    resources = { en: { translation: {} } };
  }

  await i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: Object.keys(resources).includes(initialLang) ? initialLang : 'en',
      fallbackLng: 'en',
      supportedLngs: SUPPORTED_LANGUAGES,
      interpolation: { escapeValue: false },
      returnNull: false,
      partialBundledLanguages: true,
      react: { useSuspense: false },
    });

  // If bundles failed, try loading them again in the background
  if (!loadedLanguages.has(initialLang)) {
    loadLanguage(initialLang).catch(() => {});
    if (initialLang !== 'en') loadLanguage('en').catch(() => {});
  }
})();

// On language change, lazy-load the new locale
i18n.on('languageChanged', (lng) => {
  updateDocumentDirection(lng);
  loadLanguage(lng);
});

export const updateDocumentDirection = (language: string) => {
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', language);
};

export const setManualLanguage = async (language: string) => {
  if (SUPPORTED_LANGUAGES.includes(language)) {
    localStorage.setItem(MANUAL_LANGUAGE_KEY, language);
    // Pre-load the bundle BEFORE switching so UI updates instantly
    await loadLanguage(language);
    i18n.changeLanguage(language);
  }
};

export const resetToBrowserLanguage = async () => {
  localStorage.removeItem(MANUAL_LANGUAGE_KEY);
  // Also clear i18next's cached language so true auto-detection persists across launches
  localStorage.removeItem('i18nextLng');
  const browserLang = getBrowserLanguage();
  // Pre-load the bundle BEFORE switching so the UI updates instantly & completely
  await loadLanguage(browserLang);
  await i18n.changeLanguage(browserLang);
  updateDocumentDirection(browserLang);
};

// Set initial direction synchronously
updateDocumentDirection(initialLang);

// Export the init promise for components that need to wait
export const i18nReady = initPromise;

export default i18n;
