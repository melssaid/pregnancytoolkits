const RTL_LANGUAGES = new Set(["ar", "he", "fa", "ur"]);

export const resolveArticleLocale = (language?: string) => {
  const lang = language?.split("-")[0] || "en";
  const isRTL = RTL_LANGUAGES.has(lang);

  return {
    lang,
    isRTL,
    dir: isRTL ? "rtl" as const : "ltr" as const,
    textAlign: isRTL ? "right" as const : "left" as const,
    headingClass: isRTL ? "ar-heading" : "",
  };
};