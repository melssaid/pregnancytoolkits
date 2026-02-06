import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import ar from './locales/ar.json';
import de from './locales/de.json';
import tr from './locales/tr.json';
import fr from './locales/fr.json';
import es from './locales/es.json';
import pt from './locales/pt.json';

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

const resources = {
  en: { translation: expandDottedKeys(en as Record<string, any>) },
  ar: { translation: expandDottedKeys(ar as Record<string, any>) },
  de: { translation: expandDottedKeys(de as Record<string, any>) },
  tr: { translation: expandDottedKeys(tr as Record<string, any>) },
  fr: { translation: expandDottedKeys(fr as Record<string, any>) },
  es: { translation: expandDottedKeys(es as Record<string, any>) },
  pt: { translation: expandDottedKeys(pt as Record<string, any>) },
};

const SUPPORTED_LANGUAGES = ['en', 'ar', 'de', 'tr', 'fr', 'es', 'pt'];
const MANUAL_LANGUAGE_KEY = 'user_selected_language';

// Get the best matching language from browser
const getBrowserLanguage = (): string => {
  const browserLang = navigator.language?.split('-')[0] || 'en';
  return SUPPORTED_LANGUAGES.includes(browserLang) ? browserLang : 'en';
};

// Check if user manually selected a language
const getManualLanguage = (): string | null => {
  return localStorage.getItem(MANUAL_LANGUAGE_KEY);
};

// Determine initial language: manual selection > browser language
const getInitialLanguage = (): string => {
  const manualLang = getManualLanguage();
  if (manualLang && SUPPORTED_LANGUAGES.includes(manualLang)) {
    return manualLang;
  }
  return getBrowserLanguage();
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES,
    interpolation: {
      escapeValue: false,
    },
  });

// Function to update document direction based on language
export const updateDocumentDirection = (language: string) => {
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', language);
};

// Function to manually set language (saves to localStorage)
export const setManualLanguage = (language: string) => {
  if (SUPPORTED_LANGUAGES.includes(language)) {
    localStorage.setItem(MANUAL_LANGUAGE_KEY, language);
    i18n.changeLanguage(language);
  }
};

// Function to reset to browser language
export const resetToBrowserLanguage = () => {
  localStorage.removeItem(MANUAL_LANGUAGE_KEY);
  const browserLang = getBrowserLanguage();
  i18n.changeLanguage(browserLang);
};

// Set initial direction
updateDocumentDirection(i18n.language);

// Listen for language changes
i18n.on('languageChanged', (lng) => {
  updateDocumentDirection(lng);
});

export default i18n;
