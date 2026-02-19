/**
 * Date formatting utility with locale support
 * Maps app language codes to date-fns locales
 */
import { format as dateFnsFormat } from "date-fns";
import { ar, de, fr, es, pt, tr, enUS } from "date-fns/locale";
import type { Locale } from "date-fns";

const LOCALE_MAP: Record<string, Locale> = {
  ar,
  de,
  fr,
  es,
  pt,
  tr,
  en: enUS,
};

/**
 * Format a date using the user's current app language
 * @param date - Date object or ISO string
 * @param formatStr - date-fns format string (e.g. "MMMM d, yyyy")
 * @param language - current app language code (e.g. "ar", "fr")
 */
export function formatLocalized(
  date: Date | string | number,
  formatStr: string,
  language: string
): string {
  const locale = LOCALE_MAP[language] ?? enUS;
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return dateFnsFormat(d, formatStr, { locale });
}

/** Returns the date-fns Locale object for a given language code */
export function getDateLocale(language: string): Locale {
  return LOCALE_MAP[language] ?? enUS;
}
