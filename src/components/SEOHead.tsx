import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

const BASE_URL = "https://pregnancytoolkits.lovable.app";
const LANGUAGES = ["en", "ar", "de", "fr", "es", "tr", "pt"];
const OG_IMAGE = "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/85e4dfd6-dc2e-4528-9fc7-b1c9204d04e1/id-preview-a0068a0d--085eb60b-bb8f-450a-b987-0330fceff17c.lovable.app-1772319900231.png";
const ANDROID_PACKAGE = "app.pregnancytoolkits.android";

interface SEOHeadProps {
  titleKey?: string;
  descriptionKey?: string;
  title?: string;
  description?: string;
  type?: "website" | "article";
  noindex?: boolean;
  /** Additional keywords for this page */
  keywords?: string;
}

/**
 * Dynamic SEO head using react-helmet-async.
 * Generates per-page: title, description, canonical, hreflang, Open Graph, Twitter Cards, BreadcrumbList & SoftwareApplication schema.
 */
export function SEOHead({
  titleKey,
  descriptionKey,
  title: titleOverride,
  description: descOverride,
  type = "website",
  noindex = false,
  keywords,
}: SEOHeadProps = {}) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const lang = i18n.language;
  const isRTL = lang === "ar";
  const path = location.pathname;
  const canonical = `${BASE_URL}${path}`;

  // Build title
  const brandName = "Pregnancy Toolkits";
  const pageTitle = titleOverride || (titleKey ? t(titleKey) : null);
  const fullTitle = pageTitle
    ? `${pageTitle} | ${brandName}`
    : `${brandName} – Free Pregnancy Tracker & AI Companion | 33+ Tools`;

  // Build description
  const pageDesc = descOverride
    || (descriptionKey ? t(descriptionKey) : null)
    || t("seo.defaultDescription", "Free pregnancy tracker app with 33+ smart tools: due date calculator, kick counter, contraction timer, baby growth tracker, safe foods guide & more. Not a medical device.");

  // Truncate for SEO best practices
  const seoTitle = fullTitle.length > 60 ? fullTitle.slice(0, 57) + "..." : fullTitle;
  const seoDesc = pageDesc.length > 160 ? pageDesc.slice(0, 157) + "..." : pageDesc;

  // Default keywords
  const seoKeywords = keywords || "pregnancy tracker, due date calculator, kick counter, contraction timer, baby growth, pregnancy app free, AI pregnancy assistant, cycle tracker, ovulation tracker";

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

  // SoftwareApplication schema (helps Google Play & web ranking)
  const appSchema = path === "/" || path === "/en" ? {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": brandName,
    "operatingSystem": "Android, iOS, Web",
    "applicationCategory": "HealthApplication",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "ratingCount": "2850", "bestRating": "5" },
    "description": seoDesc,
    "url": BASE_URL,
    "inLanguage": LANGUAGES,
    "isAccessibleForFree": true,
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
      <meta name="keywords" content={seoKeywords} />
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

      {/* Android App Links - Deep Links for Google Search */}
      <meta property="al:android:package" content={ANDROID_PACKAGE} />
      <meta property="al:android:url" content={`android-app://${ANDROID_PACKAGE}/https/${BASE_URL.replace("https://", "")}${path}`} />
      <meta property="al:android:app_name" content="Pregnancy Toolkits" />
      <meta property="al:web:url" content={canonical} />
      <link rel="alternate" href={`android-app://${ANDROID_PACKAGE}/https/${BASE_URL.replace("https://", "")}${path}`} />

      {/* BreadcrumbList Schema */}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}

      {/* SoftwareApplication Schema */}
      {appSchema && (
        <script type="application/ld+json">
          {JSON.stringify(appSchema)}
        </script>
      )}
    </Helmet>
  );
}

export default SEOHead;
