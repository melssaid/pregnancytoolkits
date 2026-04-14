import { Link } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { 
  Baby, Calendar, Heart, Activity, Apple, Brain, 
  Shield, ArrowRight, CheckCircle2,
  Smartphone, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface LandingPageContent {
  lang: string;
  dir?: "ltr" | "rtl";
  seoTitle: string;
  seoDesc: string;
  badge: string;
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  toolsSectionTitle: string;
  toolsSectionDesc: string;
  tools: { icon: any; title: string; desc: string; link: string }[];
  benefitsTitle: string;
  benefits: string[];
  trimester1Title: string;
  trimester1: string;
  trimester2Title: string;
  trimester2: string;
  trimester3Title: string;
  trimester3: string;
  fertilityTitle: string;
  fertilityContent: string;
  fertilityTips: string;
  birthTitle: string;
  birthContent: string;
  birthBag: string;
  postpartumTitle: string;
  postpartumContent: string;
  postpartumTips: string;
  faqTitle: string;
  faqs: { q: string; a: string }[];
  ctaFinalTitle: string;
  ctaFinalDesc: string;
  ctaFinalBtn: string;
  disclaimer: string;
  viewAll: string;
}

export function LandingPage({ content }: { content: LandingPageContent }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Pregnancy Toolkits",
    "url": `https://pregnancytoolkits.lovable.app/${content.lang}`,
    "description": content.seoDesc,
    "applicationCategory": "LifestyleApplication",
    "operatingSystem": "Web",
    "inLanguage": content.lang,
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "ratingCount": "2450" },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": content.faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a }
    }))
  };

  return (
    <div className="min-h-screen bg-background text-foreground" dir={content.dir || "ltr"}>
      <SEOHead title={content.seoTitle} description={content.seoDesc} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Baby className="h-7 w-7 text-primary" />
            <span className="text-lg font-bold text-foreground">Pregnancy Toolkits</span>
          </Link>
          <Link to="/">
            <Button size="sm" className="gap-1.5">
              {content.ctaPrimary.split("—")[0].trim()} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            <span>{content.badge}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-foreground">
            {content.heroTitle}{" "}
            <span className="text-primary">{content.heroHighlight}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">{content.heroSubtitle}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link to="/"><Button size="lg" className="gap-2 text-base w-full sm:w-auto"><Smartphone className="h-5 w-5" />{content.ctaPrimary}</Button></Link>
            <a href="#tools"><Button variant="outline" size="lg" className="gap-2 text-base w-full sm:w-auto">{content.ctaSecondary}</Button></a>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-muted/40 border-y border-border py-10">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div><p className="text-2xl font-bold text-primary">33+</p><p className="text-sm text-muted-foreground">{content.lang === "ar" ? "أداة ذكية مجانية" : "Free AI Tools"}</p></div>
            <div><p className="text-2xl font-bold text-primary">7</p><p className="text-sm text-muted-foreground">{content.lang === "ar" ? "لغات مدعومة" : "Languages"}</p></div>
            <div><p className="text-2xl font-bold text-primary">100%</p><p className="text-sm text-muted-foreground">{content.lang === "ar" ? "خصوصية تامة" : "Privacy-First"}</p></div>
            <div><p className="text-2xl font-bold text-primary">24/7</p><p className="text-sm text-muted-foreground">{content.lang === "ar" ? "مساعد ذكي" : "AI Assistant"}</p></div>
          </div>
        </div>
      </section>

      {/* Tools */}
      <section id="tools" className="container py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">{content.toolsSectionTitle}</h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">{content.toolsSectionDesc}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {content.tools.map((tool) => (
            <Link key={tool.link} to={tool.link}>
              <Card className="h-full hover:shadow-md transition-shadow border-border hover:border-primary/30 group">
                <CardContent className="p-5 space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <tool.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">{tool.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{tool.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/"><Button variant="outline" className="gap-2">{content.viewAll} <ArrowRight className="h-4 w-4" /></Button></Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-muted/40 border-y border-border py-16">
        <div className="container max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">{content.benefitsTitle}</h2>
          <ul className="space-y-4">
            {content.benefits.map((b, i) => (
              <li key={i} className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" /><span className="text-foreground">{b}</span></li>
            ))}
          </ul>
        </div>
      </section>

      {/* Trimester Content */}
      <section className="container py-16">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center">{content.trimester1Title.includes("1") ? content.trimester1Title.replace(/\(.*/, "").trim() : content.trimester1Title}</h2>
          <article className="prose prose-sm max-w-none text-foreground/90">
            <h3 className="text-lg font-semibold text-foreground">{content.trimester1Title}</h3>
            <p>{content.trimester1}</p>
            <h3 className="text-lg font-semibold text-foreground mt-6">{content.trimester2Title}</h3>
            <p>{content.trimester2}</p>
            <h3 className="text-lg font-semibold text-foreground mt-6">{content.trimester3Title}</h3>
            <p>{content.trimester3}</p>
          </article>
        </div>
      </section>

      {/* Fertility */}
      <section className="bg-muted/40 border-y border-border py-16">
        <div className="container max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-6">{content.fertilityTitle}</h2>
          <article className="prose prose-sm max-w-none text-foreground/90 space-y-4">
            <p>{content.fertilityContent}</p>
            <p><strong>{content.fertilityTips}</strong></p>
          </article>
        </div>
      </section>

      {/* Birth Prep */}
      <section className="container py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-6">{content.birthTitle}</h2>
          <article className="prose prose-sm max-w-none text-foreground/90 space-y-4">
            <p>{content.birthContent}</p>
            <p><strong>{content.birthBag}</strong></p>
          </article>
        </div>
      </section>

      {/* Postpartum */}
      <section className="bg-muted/40 border-y border-border py-16">
        <div className="container max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-6">{content.postpartumTitle}</h2>
          <article className="prose prose-sm max-w-none text-foreground/90 space-y-4">
            <p>{content.postpartumContent}</p>
            <p><strong>{content.postpartumTips}</strong></p>
          </article>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-muted/40 border-y border-border py-16">
        <div className="container max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">{content.faqTitle}</h2>
          <div className="space-y-6">
            {content.faqs.map((faq, i) => (
              <article key={i} className="bg-card rounded-xl p-5 border border-border">
                <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-16 text-center">
        <div className="max-w-xl mx-auto space-y-5">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">{content.ctaFinalTitle}</h2>
          <p className="text-muted-foreground">{content.ctaFinalDesc}</p>
          <Link to="/"><Button size="lg" className="gap-2 text-base"><Baby className="h-5 w-5" />{content.ctaFinalBtn}</Button></Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container text-center space-y-3">
          <p className="text-xs text-muted-foreground">{content.disclaimer}</p>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
          </div>
          <p className="text-[10px] text-muted-foreground/60">© {new Date().getFullYear()} Pregnancy Toolkits. GDPR & CCPA Compliant.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
