import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/SEOHead";
import { toolsData, getRelatedTools } from "@/lib/tools-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Baby, ArrowRight, CheckCircle2, Smartphone, Sparkles,
  Shield, Globe, Star,
} from "lucide-react";

// SEO-optimized descriptions per tool (EN)
const toolSEO: Record<string, { h1: string; desc: string; longDesc: string; keywords: string; faqs: { q: string; a: string }[] }> = {
  "due-date-calculator": {
    h1: "Free Due Date Calculator — Estimate Your Baby's Arrival",
    desc: "Calculate your estimated due date based on your last menstrual period or IVF transfer date. Free, accurate, and used by millions of expecting parents.",
    longDesc: "Our due date calculator uses Naegele's rule — the same method used by healthcare providers worldwide. Enter your last menstrual period (LMP) date or IVF transfer date, and get an instant estimated delivery date along with trimester milestones, important checkup dates, and a week-by-week pregnancy timeline.",
    keywords: "due date calculator, pregnancy due date, estimated delivery date, EDD calculator, pregnancy calculator",
    faqs: [
      { q: "How accurate is a due date calculator?", a: "Due date calculators use Naegele's rule to estimate delivery within a 2-week window. Only about 5% of babies arrive on the exact due date. Your healthcare provider may adjust the date based on ultrasound measurements." },
      { q: "Can I calculate my due date from IVF transfer?", a: "Yes. Our calculator supports both LMP-based and IVF transfer date calculations. For IVF, we adjust the calculation based on whether you had a Day 3 or Day 5 transfer." },
    ],
  },
  "kick-counter": {
    h1: "Baby Kick Counter — Track Fetal Movements Free",
    desc: "Monitor your baby's kick patterns with our free kick counter. Track fetal movements, get daily counts, and receive alerts if patterns change.",
    longDesc: "Tracking your baby's movements is one of the most important things you can do during pregnancy. Our kick counter helps you monitor fetal activity patterns, record daily kick counts, and identify any changes that may need medical attention. Most healthcare providers recommend counting kicks starting at week 28.",
    keywords: "baby kick counter, fetal movement tracker, kick count, baby movement monitor, pregnancy kick tracker",
    faqs: [
      { q: "When should I start counting baby kicks?", a: "Most healthcare providers recommend starting kick counts around week 28 of pregnancy. Aim for 10 movements within 2 hours, ideally at the same time each day." },
      { q: "What if my baby's kicks decrease?", a: "If you notice a significant decrease in movement, contact your healthcare provider immediately. Our app can help you track patterns to share with your doctor." },
    ],
  },
  "cycle-tracker": {
    h1: "Period & Ovulation Tracker — Predict Your Fertile Window",
    desc: "Track your menstrual cycle, predict ovulation, and identify your fertile window. Free cycle tracker with AI-powered insights for TTC and general health.",
    longDesc: "Our cycle tracker helps you understand your menstrual health by predicting ovulation dates, identifying your fertile window, and analyzing cycle patterns over time. Whether you're trying to conceive or simply tracking your health, our AI-powered insights help you make informed decisions.",
    keywords: "period tracker, ovulation calculator, cycle tracker, fertile window, TTC app, menstrual cycle tracker",
    faqs: [
      { q: "How does the ovulation predictor work?", a: "Our algorithm analyzes your cycle history to predict ovulation based on the average luteal phase length. For most women, ovulation occurs 12-16 days before the next period." },
      { q: "Can this app help me get pregnant?", a: "Yes. Our fertility tracker identifies your most fertile days each cycle, helping you time intercourse for the best chances of conception. It also tracks symptoms like basal body temperature and cervical mucus." },
    ],
  },
  "contraction-timer": {
    h1: "Contraction Timer — Track Labor Contractions",
    desc: "Time your contractions accurately with our free contraction timer. Track frequency, duration, and intensity to know when it's time to go to the hospital.",
    longDesc: "When labor begins, timing contractions is essential. Our contraction timer helps you track the frequency, duration, and intensity of each contraction. The app automatically calculates intervals and alerts you when contractions follow the 5-1-1 pattern (5 minutes apart, lasting 1 minute, for 1 hour) — a common guideline for heading to the hospital.",
    keywords: "contraction timer, labor timer, contraction tracker, labor contractions, 5-1-1 rule",
    faqs: [
      { q: "When should I time contractions?", a: "Start timing when you feel regular, painful contractions. Time from the start of one contraction to the start of the next to measure frequency." },
      { q: "What is the 5-1-1 rule?", a: "The 5-1-1 rule suggests going to the hospital when contractions are 5 minutes apart, lasting 1 minute each, for at least 1 hour. However, always follow your healthcare provider's specific guidance." },
    ],
  },
  "pregnancy-assistant": {
    h1: "AI Pregnancy Assistant — Get Instant Answers",
    desc: "Ask any pregnancy question and get evidence-based answers from our AI assistant. Available 24/7 in 7 languages.",
    longDesc: "Our AI pregnancy assistant provides evidence-based answers to your pregnancy questions, drawing from trusted medical guidelines and research. Whether you're wondering about symptoms, nutrition, exercise, or preparing for labor, get instant, reliable information in your preferred language.",
    keywords: "pregnancy assistant, AI pregnancy help, pregnancy questions, pregnancy advice app",
    faqs: [
      { q: "Is the AI assistant a replacement for my doctor?", a: "No. Our AI assistant provides educational information based on medical guidelines, but it is not a substitute for professional medical advice. Always consult your healthcare provider for medical decisions." },
    ],
  },
  "fetal-growth": {
    h1: "Fetal Development Tracker — Week by Week Baby Growth",
    desc: "Follow your baby's week-by-week development with 3D visualizations, size comparisons, and developmental milestones.",
    longDesc: "Track your baby's growth from conception to birth with our detailed fetal development tracker. Each week includes accurate size comparisons, developmental milestones, and what to expect. Visualize your baby's growth with our 3D models and learn about the amazing changes happening inside you.",
    keywords: "fetal development, baby growth tracker, pregnancy week by week, baby size by week, fetal growth chart",
    faqs: [
      { q: "How big is my baby this week?", a: "Our tracker shows your baby's size compared to common fruits and objects each week. By week 20, your baby is about the size of a banana; by week 40, about the size of a watermelon." },
    ],
  },
  "weight-gain": {
    h1: "Pregnancy Weight Gain Tracker — BMI-Based Guidelines",
    desc: "Monitor healthy pregnancy weight gain with ACOG-based BMI guidelines. Track your progress and get personalized recommendations.",
    longDesc: "Our pregnancy weight gain tracker uses ACOG (American College of Obstetricians and Gynecologists) guidelines to help you monitor healthy weight gain throughout your pregnancy. Enter your pre-pregnancy BMI and current weight to see if you're on track, with personalized recommendations for each trimester.",
    keywords: "pregnancy weight gain, pregnancy BMI, healthy weight pregnancy, ACOG weight guidelines",
    faqs: [
      { q: "How much weight should I gain during pregnancy?", a: "Weight gain depends on your pre-pregnancy BMI. For normal weight (BMI 18.5-24.9), ACOG recommends 25-35 pounds. Underweight women may need more, while overweight women may need less." },
    ],
  },
};

// Fallback for tools without specific SEO data
function getToolSEO(toolId: string, toolTitle: string) {
  if (toolSEO[toolId]) return toolSEO[toolId];
  return {
    h1: `${toolTitle} — Free Pregnancy Tool`,
    desc: `Use our free ${toolTitle.toLowerCase()} to support your pregnancy journey. Part of Pregnancy Toolkits' 35+ AI-powered tools.`,
    longDesc: `${toolTitle} is part of Pregnancy Toolkits, a comprehensive free pregnancy app with 35+ AI-powered tools. Track your pregnancy, monitor your baby's growth, and get personalized insights — all in one app.`,
    keywords: `${toolTitle.toLowerCase()}, pregnancy app, pregnancy tools`,
    faqs: [] as { q: string; a: string }[],
  };
}

export default function ToolLanding() {
  const { toolSlug } = useParams();
  const { t } = useTranslation();

  // Map slug to tool
  const tool = toolsData.find((t) => {
    const slug = t.href.replace("/tools/", "");
    return slug === toolSlug;
  });

  if (!tool) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Tool not found</h1>
          <Link to="/">
            <Button>Go to App</Button>
          </Link>
        </div>
      </div>
    );
  }

  const toolTitle = t(tool.titleKey);
  const seo = getToolSEO(tool.id, toolTitle);
  const related = getRelatedTools(tool.id, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": `${seo.h1} | Pregnancy Toolkits`,
    "url": `https://pregnancytoolkits.lovable.app/tool/${toolSlug}`,
    "description": seo.desc,
    "applicationCategory": "HealthApplication",
    "operatingSystem": "Web, Android",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "isPartOf": {
      "@type": "SoftwareApplication",
      "name": "Pregnancy Toolkits",
      "url": "https://pregnancytoolkits.lovable.app",
    },
  };

  const faqJsonLd = seo.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": seo.faqs.map((f) => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a },
    })),
  } : null;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Pregnancy Toolkits", "item": "https://pregnancytoolkits.lovable.app" },
      { "@type": "ListItem", "position": 2, "name": "Tools", "item": "https://pregnancytoolkits.lovable.app/en" },
      { "@type": "ListItem", "position": 3, "name": toolTitle, "item": `https://pregnancytoolkits.lovable.app/tool/${toolSlug}` },
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title={seo.h1}
        description={seo.desc}
        keywords={seo.keywords}
      />

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/en" className="flex items-center gap-2">
            <Baby className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">Pregnancy Toolkits</span>
          </Link>
          <Link to={tool.href}>
            <Button size="sm" className="gap-1.5">
              Open Tool <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-12 md:py-20">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            Free — No signup required
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-foreground">
            {seo.h1}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {seo.desc}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link to={tool.href}>
              <Button size="lg" className="gap-2 text-base w-full sm:w-auto">
                <Smartphone className="h-5 w-5" />
                Use This Tool — Free
              </Button>
            </Link>
            <Link to="/en">
              <Button variant="outline" size="lg" className="gap-2 text-base w-full sm:w-auto">
                Explore All 35+ Tools
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-muted/40 border-y border-border py-8">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="flex flex-col items-center gap-1">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-xs text-muted-foreground">100% Private</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Globe className="h-5 w-5 text-primary" />
            <span className="text-xs text-muted-foreground">7 Languages</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Star className="h-5 w-5 text-primary" />
            <span className="text-xs text-muted-foreground">35+ Free Tools</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-xs text-muted-foreground">AI-Powered</span>
          </div>
        </div>
      </section>

      {/* Long description */}
      <section className="container py-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            About {toolTitle}
          </h2>
          <p className="text-foreground/80 leading-relaxed text-base">
            {seo.longDesc}
          </p>

          {/* Features */}
          <div className="mt-8 space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Key Features</h3>
            <ul className="space-y-2">
              {[
                "Completely free — no hidden fees or premium gates",
                "Available in 7 languages including English, Arabic, Spanish, French, German, Turkish, and Portuguese",
                tool.hasAI ? "AI-powered insights based on medical guidelines" : "Evidence-based health information",
                "Your data stays private on your device — GDPR & CCPA compliant",
                "Works on any device — web, Android, and iOS",
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                  <span className="text-sm text-foreground/80">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQs */}
      {seo.faqs.length > 0 && (
        <section className="bg-muted/40 border-y border-border py-12">
          <div className="container max-w-3xl">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {seo.faqs.map((faq, i) => (
                <article key={i} className="bg-card rounded-xl p-5 border border-border">
                  <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related tools */}
      {related.length > 0 && (
        <section className="container py-12">
          <h2 className="text-2xl font-bold text-foreground text-center mb-6">
            Related Pregnancy Tools
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((rt) => (
              <Link key={rt.id} to={`/tool/${rt.href.replace("/tools/", "")}`}>
                <Card className="h-full hover:shadow-md transition-shadow border-border hover:border-primary/30 group">
                  <CardContent className="p-4 space-y-2">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <rt.icon className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm text-foreground">{t(rt.titleKey)}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{t(rt.descriptionKey)}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container py-12 text-center">
        <div className="max-w-xl mx-auto space-y-4">
          <h2 className="text-2xl font-bold text-foreground">
            Ready to Use {toolTitle}?
          </h2>
          <p className="text-muted-foreground text-sm">
            Join thousands of expecting parents who use Pregnancy Toolkits every day. Free forever.
          </p>
          <Link to={tool.href}>
            <Button size="lg" className="gap-2">
              <Baby className="h-5 w-5" />
              Start Now — Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6">
        <div className="container text-center space-y-2">
          <p className="text-[10px] text-muted-foreground">
            Pregnancy Toolkits is an educational companion, not a medical device. Always consult your healthcare provider.
          </p>
          <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground">
            <Link to="/privacy" className="hover:text-primary">Privacy</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-primary">Terms</Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-primary">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
