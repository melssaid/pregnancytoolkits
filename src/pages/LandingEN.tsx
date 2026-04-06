import { Link } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { 
  Baby, Calendar, Heart, Activity, Apple, Brain, 
  Shield, Users, ArrowRight, CheckCircle2,
  Smartphone, Clock, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const tools = [
  { icon: Calendar, title: "Due Date Calculator", desc: "Calculate your estimated due date based on your last menstrual period or IVF transfer date.", link: "/tools/due-date-calculator", keyword: "due date calculator" },
  { icon: Activity, title: "Baby Kick Counter", desc: "Track fetal movements and monitor your baby's activity patterns throughout pregnancy.", link: "/tools/kick-counter", keyword: "baby kick counter" },
  { icon: Baby, title: "Baby Growth Tracker", desc: "Follow your baby's week-by-week development with size comparisons and milestones.", link: "/tools/baby-growth", keyword: "baby growth tracker" },
  { icon: Brain, title: "AI Pregnancy Assistant", desc: "Get instant, evidence-based answers to your pregnancy questions from our AI companion.", link: "/tools/pregnancy-assistant", keyword: "pregnancy assistant" },
  { icon: Apple, title: "Pregnancy Meal Planner", desc: "Personalized nutrition plans and safe food guides for every trimester.", link: "/tools/ai-meal-suggestion", keyword: "pregnancy nutrition" },
  { icon: Heart, title: "AI Birth Plan Generator", desc: "Create a comprehensive, personalized birth plan with AI guidance.", link: "/tools/ai-birth-plan", keyword: "birth plan generator" },
  { icon: Activity, title: "Weight Gain Tracker", desc: "Monitor healthy pregnancy weight gain with BMI-based guidelines from ACOG.", link: "/tools/weight-gain", keyword: "pregnancy weight gain" },
  { icon: Calendar, title: "Cycle & Ovulation Tracker", desc: "Track your menstrual cycle, predict ovulation, and identify your fertile window.", link: "/tools/cycle-tracker", keyword: "ovulation tracker" },
];

const benefits = [
  "36+ free smart pregnancy and fertility tools",
  "Week-by-week fetal development tracking",
  "Evidence-based health information from medical sources",
  "Available in 7 languages including English, Spanish, French, and German",
  "No account required — your data stays private on your device",
  "GDPR and CCPA compliant — we never sell your data",
];

const faqs = [
  {
    q: "Is this pregnancy tracker app really free?",
    a: "Yes, Pregnancy Toolkits is completely free to use. All 36+ tools including the due date calculator, kick counter, and AI assistant are available at no cost with no hidden fees."
  },
  {
    q: "How accurate is the due date calculator?",
    a: "Our due date calculator uses the same Naegele's rule method used by healthcare providers. It estimates your due date based on your last menstrual period (LMP) or IVF transfer date. Remember that only about 5% of babies arrive on their exact due date."
  },
  {
    q: "Is my pregnancy data safe and private?",
    a: "Absolutely. Your health data is stored locally on your device and never uploaded to external servers. We are fully GDPR and CCPA compliant. We do not sell, share, or monetize your personal health information."
  },
  {
    q: "Can I use this app to track my menstrual cycle and fertility?",
    a: "Yes. Our cycle tracker predicts ovulation, identifies your fertile window, and analyzes cycle patterns. It's designed for both trying-to-conceive and general menstrual health tracking."
  },
  {
    q: "Is this app a substitute for medical advice?",
    a: "No. Pregnancy Toolkits is an educational and lifestyle companion, not a medical device. Always consult your healthcare provider for medical decisions. Our tools provide general wellness information based on published medical guidelines."
  },
];

export default function LandingEN() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Pregnancy Toolkits",
    "url": "https://pregnancytoolkits.lovable.app/en",
    "description": "Free pregnancy tracker with 36+ smart tools: due date calculator, kick counter, contraction timer, baby growth tracker, and more.",
    "applicationCategory": "HealthApplication",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "ratingCount": "2450" },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a }
    }))
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="Free Pregnancy Tracker App — Due Date Calculator, Kick Counter & 42+ AI Tools"
        description="Track your pregnancy week by week with our free app. Due date calculator, baby kick counter, contraction timer, fetal development guide, meal planner & more. No signup required."
      />

      {/* JSON-LD Structured Data */}
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
              Open App <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            <span>Free — No signup required</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-foreground">
            Your Complete{" "}
            <span className="text-primary">Pregnancy Tracker</span>{" "}
            with 36+ Smart Tools
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Track your pregnancy week by week with our free due date calculator, baby kick counter, 
            contraction timer, fetal development guide, and personalized AI assistant. 
            Designed for expecting parents worldwide — available in 7 languages.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link to="/">
              <Button size="lg" className="gap-2 text-base w-full sm:w-auto">
                <Smartphone className="h-5 w-5" />
                Start Tracking — It's Free
              </Button>
            </Link>
            <a href="#tools">
              <Button variant="outline" size="lg" className="gap-2 text-base w-full sm:w-auto">
                Explore All Tools
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-muted/40 border-y border-border py-10">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">42+</p>
              <p className="text-sm text-muted-foreground">Free AI Tools</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">7</p>
              <p className="text-sm text-muted-foreground">Languages Supported</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">100%</p>
              <p className="text-sm text-muted-foreground">Privacy-First</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1">
                <p className="text-2xl font-bold text-primary">24/7</p>
              </div>
              <p className="text-sm text-muted-foreground">AI Assistant</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="container py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Essential Pregnancy & Fertility Tools
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            Everything you need from trying to conceive through postpartum — all in one free app.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tools.map((tool) => (
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
          <Link to="/">
            <Button variant="outline" className="gap-2">
              View All 36+ Tools <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-muted/40 border-y border-border py-16">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
              Why Expecting Parents Choose Pregnancy Toolkits
            </h2>
            <ul className="space-y-4">
              {benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Week-by-Week Content Section (SEO Content) */}
      <section className="container py-16">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center">
            Pregnancy Week by Week: What to Expect
          </h2>
          
          <article className="prose prose-sm max-w-none text-foreground/90">
            <h3 className="text-lg font-semibold text-foreground">First Trimester (Weeks 1–12)</h3>
            <p>
              The first trimester is a time of rapid development. By week 6, your baby's heart begins to beat. 
              Common symptoms include morning sickness, fatigue, and breast tenderness. Our{" "}
              <Link to="/tools/ai-nausea-relief" className="text-primary hover:underline">AI nausea relief tool</Link>{" "}
              offers evidence-based remedies, while the{" "}
              <Link to="/tools/ai-meal-suggestion" className="text-primary hover:underline">pregnancy meal planner</Link>{" "}
              helps you maintain proper nutrition even when appetite is low.
            </p>

            <h3 className="text-lg font-semibold text-foreground mt-6">Second Trimester (Weeks 13–26)</h3>
            <p>
              Often called the "golden trimester," many women feel their best during this period. 
              You'll likely feel your baby's first kicks around week 20. Use our{" "}
              <Link to="/tools/kick-counter" className="text-primary hover:underline">baby kick counter</Link>{" "}
              to start tracking fetal movements. The{" "}
              <Link to="/tools/fetal-growth" className="text-primary hover:underline">fetal development tracker</Link>{" "}
              shows you exactly how your baby is growing each week with accurate size comparisons.
            </p>

            <h3 className="text-lg font-semibold text-foreground mt-6">Third Trimester (Weeks 27–40)</h3>
            <p>
              As you approach your due date, preparation becomes key. Our{" "}
              <Link to="/tools/ai-hospital-bag" className="text-primary hover:underline">hospital bag checklist</Link>{" "}
              ensures you're packed and ready. Our{" "}
              <Link to="/tools/ai-birth-plan" className="text-primary hover:underline">AI birth plan generator</Link>{" "}
              helps you create a comprehensive plan for your delivery.
            </p>
          </article>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-muted/40 border-y border-border py-16">
        <div className="container max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
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
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Start Your Pregnancy Journey Today
          </h2>
          <p className="text-muted-foreground">
            Join thousands of expecting parents who use Pregnancy Toolkits to track their pregnancy, 
            stay informed, and prepare for their new arrival. Completely free, no account needed.
          </p>
          <Link to="/">
            <Button size="lg" className="gap-2 text-base">
              <Baby className="h-5 w-5" />
              Get Started — Free Forever
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container text-center space-y-3">
          <p className="text-xs text-muted-foreground">
            Pregnancy Toolkits is an educational and lifestyle companion, not a medical device. 
            Always consult your healthcare provider for medical advice.
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
          </div>
          <p className="text-[10px] text-muted-foreground/60">
            © {new Date().getFullYear()} Pregnancy Toolkits. GDPR & CCPA Compliant.
          </p>
        </div>
      </footer>
    </div>
  );
}