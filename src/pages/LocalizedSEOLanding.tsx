import { useParams, Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getSEOLocale, isRTLSEO, SEO_LOCALES } from "@/data/seoLocales";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowRight } from "lucide-react";

const BASE = "https://pregnancytoolkits.lovable.app";

export default function LocalizedSEOLanding() {
  const { lang = "en" } = useParams<{ lang: string }>();

  if (!SEO_LOCALES[lang]) {
    return <Navigate to="/seo/en" replace />;
  }

  const locale = getSEOLocale(lang);
  const rtl = isRTLSEO(lang);
  const url = `${BASE}/seo/${lang}`;
  const ogImage = `https://frlrngdogjzqpqpjhjvq.supabase.co/functions/v1/og-image?lang=${lang}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Pregnancy Toolkits",
    url,
    inLanguage: locale.code,
    description: locale.metaDescription,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web, Android, iOS",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: locale.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div dir={rtl ? "rtl" : "ltr"} lang={locale.iso} className="min-h-screen bg-background">
      <Helmet>
        <html lang={locale.iso} dir={rtl ? "rtl" : "ltr"} />
        <title>{locale.metaTitle}</title>
        <meta name="description" content={locale.metaDescription} />
        <meta name="keywords" content={locale.keywords.join(", ")} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={locale.metaTitle} />
        <meta property="og:description" content={locale.metaDescription} />
        <meta property="og:url" content={url} />
        <meta property="og:locale" content={locale.code.replace("-", "_")} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/svg+xml" />
        <meta property="og:image:alt" content={locale.h1} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:title" content={locale.metaTitle} />
        <meta name="twitter:description" content={locale.metaDescription} />
        {Object.values(SEO_LOCALES).map((l) => (
          <link key={l.code} rel="alternate" hrefLang={l.code} href={`${BASE}/seo/${l.code}`} />
        ))}
        <link rel="alternate" hrefLang="x-default" href={`${BASE}/seo/en`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
      </Helmet>

      <main className="container max-w-4xl mx-auto px-4 py-8 space-y-10">
        <header className="text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
            {locale.h1}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {locale.intro}
          </p>
          <Link to="/">
            <Button size="lg" className="mt-4">
              {locale.cta} <ArrowRight className={`w-4 h-4 ${rtl ? "mr-2 rotate-180" : "ml-2"}`} />
            </Button>
          </Link>
        </header>

        <section aria-label="features">
          <Card>
            <CardContent className="p-6 grid sm:grid-cols-2 gap-3">
              {locale.features.map((f, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{f}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="prose prose-sm max-w-none text-foreground">
          <p className="leading-relaxed text-muted-foreground">{locale.longDescription}</p>
        </section>

        <section aria-label="faq" className="space-y-3">
          <h2 className="text-2xl font-bold">FAQ</h2>
          {locale.faq.map((f, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-1">{f.q}</h3>
                <p className="text-sm text-muted-foreground">{f.a}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <footer className="text-center pt-8 border-t border-border">
          <Link to="/" className="text-primary hover:underline">
            {locale.cta} →
          </Link>
        </footer>
      </main>
    </div>
  );
}
