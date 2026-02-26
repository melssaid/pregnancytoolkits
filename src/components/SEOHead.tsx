import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

const BASE_URL = "https://pregnancytoolkits.lovable.app";
const LANGUAGES = ["en", "ar", "de", "fr", "es", "tr", "pt"];
const OG_IMAGE = "https://storage.googleapis.com/gpt-engineer-file-uploads/jo6UX4DMdye2RhsGMYck0XjWOvR2/social-images/social-1770674585393-1000140907.jpg";

interface SEOHeadProps {
  titleKey?: string;
  descriptionKey?: string;
  /** Override title directly (useful for static pages) */
  title?: string;
  description?: string;
  type?: "website" | "article";
  noindex?: boolean;
}

/**
 * Dynamic SEO head using react-helmet-async.
 * Generates per-page: title, description, canonical, hreflang, Open Graph, Twitter Cards, and BreadcrumbList schema.
 */
export function SEOHead({
  titleKey,
  descriptionKey,
  title: titleOverride,
  description: descOverride,
  type = "website",
  noindex = false,
}: SEOHeadProps = {}) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const lang = i18n.language;
  const isRTL = lang === "ar";
  const path = location.pathname;
  const canonical = `${BASE_URL}${path}`;

  // Build title
  const brandName = "Pregnancy Toolkits";
  const pageTitle = titleOverride
    || (titleKey ? t(titleKey) : null);
  const fullTitle = pageTitle
    ? `${pageTitle} | ${brandName}`
    : `${brandName} – Lifestyle & Educational Companion | 42+ Wellness Tools`;

  // Build description
  const pageDesc = descOverride
    || (descriptionKey ? t(descriptionKey) : null)
    || t("seo.defaultDescription", "Pregnancy journal & lifestyle companion with 42+ wellness tools, daily tips & trackers. Not a medical device — for informational and educational purposes only. Available in 7 languages.");

  // Truncate for SEO best practices
  const seoTitle = fullTitle.length > 60 ? fullTitle.slice(0, 57) + "..." : fullTitle;
  const seoDesc = pageDesc.length > 160 ? pageDesc.slice(0, 157) + "..." : pageDesc;

  // Breadcrumb schema for tool pages
  const breadcrumbSchema = path.startsWith("/tools/") ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": brandName,
        "item": BASE_URL,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": pageTitle || "Tool",
        "item": canonical,
      },
    ],
  } : null;

  // Locale mapping for Open Graph
  const ogLocaleMap: Record<string, string> = {
    en: "en_US", ar: "ar_SA", de: "de_DE", fr: "fr_FR",
    es: "es_ES", tr: "tr_TR", pt: "pt_PT",
  };

  return (
    <Helmet>
      {/* Basics */}
      <html lang={lang} dir={isRTL ? "rtl" : "ltr"} />
      <title>{seoTitle}</title>
      <meta name="description" content={seoDesc} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Canonical */}
      <link rel="canonical" href={canonical} />

      {/* Hreflang */}
      {LANGUAGES.map((lng) => (
        <link
          key={lng}
          rel="alternate"
          hrefLang={lng}
          href={`${BASE_URL}${path}${path.includes("?") ? "&" : "?"}lang=${lng}`}
        />
      ))}
      <link rel="alternate" hrefLang="x-default" href={`${BASE_URL}${path}`} />

      {/* Open Graph */}
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDesc} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={seoTitle} />
      <meta property="og:site_name" content={brandName} />
      <meta property="og:locale" content={ogLocaleMap[lang] || "en_US"} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDesc} />
      <meta name="twitter:image" content={OG_IMAGE} />
      <meta name="twitter:image:alt" content={seoTitle} />

      {/* BreadcrumbList Schema */}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
    </Helmet>
  );
}

export default SEOHead;
