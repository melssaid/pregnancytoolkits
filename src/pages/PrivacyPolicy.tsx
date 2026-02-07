import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { 
  Shield, 
  Database, 
  Scale, 
  Users, 
  Sparkles, 
  Clock, 
  Lock, 
  Baby,
  UserCheck,
  Globe,
  RefreshCw,
  Mail,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Smartphone,
  Bell
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const sections = [
  {
    id: "collection",
    icon: Database,
    title: "Information We Collect",
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground leading-relaxed">
          We collect personal information that you voluntarily provide to us when you express an interest 
          in obtaining information about us or our products and Services.
        </p>
        <div className="grid gap-2 mt-3">
          <div className="flex items-start gap-2 text-sm">
            <XCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
            <span className="text-muted-foreground">We do <strong>NOT</strong> process sensitive personal information</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <XCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
            <span className="text-muted-foreground">We do <strong>NOT</strong> collect information from third parties</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <span className="text-muted-foreground">Payment data is handled securely by Google Play</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "local-storage",
    icon: Smartphone,
    title: "Local Data Storage",
    color: "text-green-600",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/20",
    important: true,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground leading-relaxed">
          <strong>All personal health data</strong>, appointments, and tracking information 
          you enter into our tools is stored <strong>locally on your device only</strong> using browser 
          localStorage/JSON.
        </p>
        <div className="grid gap-2 mt-3">
          <div className="flex items-start gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
            <span className="text-muted-foreground">Data never leaves your device</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
            <span className="text-muted-foreground">Not uploaded to our servers</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
            <span className="text-muted-foreground">Not shared with any third parties</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
            <span className="text-muted-foreground">Can be deleted at any time</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "processing",
    icon: Scale,
    title: "How We Process Information",
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    content: (
      <div className="space-y-3">
        <p className="text-muted-foreground leading-relaxed">
          We process your information to provide, improve, and administer our Services, 
          communicate with you, for security and fraud prevention, and to comply with law.
        </p>
        <p className="text-sm text-muted-foreground">
          We process your information only when we have a valid legal reason to do so under applicable law.
        </p>
      </div>
    )
  },
  {
    id: "sharing",
    icon: Users,
    title: "Information Sharing",
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    content: (
      <div className="space-y-3">
        <p className="text-muted-foreground leading-relaxed">
          We may share information in specific situations and with specific third parties:
        </p>
        <div className="grid gap-2 mt-3">
          <div className="flex items-start gap-2 text-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
            <span className="text-muted-foreground"><strong>Business Transfers:</strong> During mergers, sales, or acquisitions</span>
          </div>
        </div>
        <div className="mt-4 p-3 bg-green-500/5 rounded-lg border border-green-500/20">
          <p className="text-sm font-medium text-green-700 dark:text-green-400">
            We have NOT sold or shared any personal information to third parties for commercial purposes in the past 12 months.
          </p>
        </div>
      </div>
    )
  },
  {
    id: "ai-products",
    icon: Sparkles,
    title: "AI-Powered Products",
    color: "text-purple-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground leading-relaxed">
          We offer products powered by artificial intelligence through third-party service providers 
          including Perplexity AI.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs">
          {[
            "AI Pregnancy Assistant",
            "AI Symptom Analyzer",
            "AI Meal Suggestion",
            "Smart Appointment Reminder",
            "AI Fitness Coaches",
            "Labor Progress Tracker"
          ].map((tool) => (
            <div key={tool} className="flex items-center gap-2 p-2 rounded-lg bg-purple-500/5">
              <Sparkles className="w-3 h-3 text-purple-500" />
              <span className="text-muted-foreground">{tool}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          When using AI features, only your specific query (anonymized) is processed. 
          Your stored health data remains on your device.
        </p>
      </div>
    )
  },
  {
    id: "notifications",
    icon: Bell,
    title: "Notification Sounds",
    color: "text-teal-600",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500/20",
    content: (
      <div className="space-y-3">
        <p className="text-muted-foreground leading-relaxed">
          Our application uses audio notification sounds generated locally using the Web Audio API.
        </p>
        <div className="grid gap-2 mt-3">
          <div className="flex items-start gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
            <span className="text-muted-foreground">No data transmission required</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
            <span className="text-muted-foreground">No audio data collected or transmitted</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
            <span className="text-muted-foreground">Can be enabled/disabled in settings</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "retention",
    icon: Clock,
    title: "Data Retention",
    color: "text-orange-600",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    content: (
      <p className="text-muted-foreground leading-relaxed">
        We keep your information for as long as necessary to fulfill the purposes outlined 
        in this Privacy Notice unless otherwise required by law. When we have no ongoing 
        legitimate business need to process your personal information, we will either delete 
        or anonymize such information.
      </p>
    )
  },
  {
    id: "security",
    icon: Lock,
    title: "Information Security",
    color: "text-red-600",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    content: (
      <div className="space-y-3">
        <p className="text-muted-foreground leading-relaxed">
          We have implemented appropriate technical and organizational security measures 
          designed to protect the security of any personal information we process.
        </p>
        <p className="text-sm text-muted-foreground">
          However, no electronic transmission over the Internet can be guaranteed to be 100% secure.
        </p>
      </div>
    )
  },
  {
    id: "minors",
    icon: Baby,
    title: "Information from Minors",
    color: "text-pink-600",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/20",
    content: (
      <p className="text-muted-foreground leading-relaxed">
        We do not knowingly collect data from or market to children under 18 years of age. 
        By using the Services, you represent that you are at least 18 or that you are the 
        parent or guardian of such a minor and consent to such minor dependent's use of the Services.
      </p>
    )
  },
  {
    id: "rights",
    icon: UserCheck,
    title: "Your Privacy Rights",
    color: "text-indigo-600",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/20",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground leading-relaxed">
          Depending on your location, you may have certain rights regarding your personal information:
        </p>
        <div className="grid gap-2 mt-3">
          <div className="flex items-start gap-2 text-sm">
            <Eye className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
            <span className="text-muted-foreground">Right to access your personal data</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <RefreshCw className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
            <span className="text-muted-foreground">Right to correct inaccuracies</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <Trash2 className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
            <span className="text-muted-foreground">Right to request deletion</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <XCircle className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
            <span className="text-muted-foreground">Right to opt out of data processing</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "international",
    icon: Globe,
    title: "International Users",
    color: "text-cyan-600",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20",
    content: (
      <div className="space-y-3">
        <p className="text-muted-foreground leading-relaxed">
          We comply with applicable data protection laws including GDPR (EU/UK) and regional privacy laws.
        </p>
        <div className="grid gap-2 mt-3 text-sm">
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2 shrink-0" />
            <span className="text-muted-foreground"><strong>EU/UK:</strong> GDPR compliance with consent-based processing</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2 shrink-0" />
            <span className="text-muted-foreground"><strong>US:</strong> State-specific privacy rights (California, Virginia, etc.)</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2 shrink-0" />
            <span className="text-muted-foreground"><strong>Canada:</strong> Express and implied consent framework</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "updates",
    icon: RefreshCw,
    title: "Policy Updates",
    color: "text-gray-600",
    bgColor: "bg-gray-500/10",
    borderColor: "border-gray-500/20",
    content: (
      <p className="text-muted-foreground leading-relaxed">
        We may update this Privacy Notice from time to time. The updated version will be 
        indicated by an updated "Last updated" date. We encourage you to review this 
        Privacy Notice frequently to be informed of how we are protecting your information.
      </p>
    )
  },
  {
    id: "contact",
    icon: Mail,
    title: "Contact Us",
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
    content: (
      <div className="space-y-3">
        <p className="text-muted-foreground leading-relaxed">
          If you have questions or comments about this notice:
        </p>
        <div className="grid gap-3 mt-3">
          <a 
            href="mailto:M.melssaid@gmail.com" 
            className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
          >
            <Mail className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">M.melssaid@gmail.com</span>
          </a>
          <Link 
            to="/contact" 
            className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
          >
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">Contact Page</span>
          </Link>
        </div>
      </div>
    )
  }
];

export default function PrivacyPolicy() {
  const { t } = useTranslation();
  
  return (
    <Layout showBack>
      <div className="container py-6 pb-24">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2 mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>{t('privacyPolicy.lastUpdated', 'Last updated: January 26, 2026')}</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">{t('privacyPolicy.title', 'Privacy Policy')}</h1>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              {t('privacyPolicy.subtitle', 'Your privacy is important to us. This notice explains how we handle your information.')}
            </p>
          </motion.div>

          {/* Important Notice - Privacy-First Approach */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="ring-2 ring-green-500/20 bg-gradient-to-br from-green-500/5 to-green-500/10">
              <CardHeader className="bg-green-500/10 border-b border-green-500/20 py-4">
                <CardTitle className="flex items-center gap-3 text-base text-green-700 dark:text-green-400">
                  <div className="p-2 rounded-lg bg-background/80">
                    <Shield className="w-5 h-5" />
                  </div>
                  {t('privacyPolicy.privacyFirst.title', 'Privacy-First Approach')}
                  <span className="ml-auto text-xs bg-green-500/20 px-2 py-1 rounded-full">
                    {t('privacyPolicy.privacyFirst.badge', 'Important')}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {t('privacyPolicy.privacyFirst.content', 'We offer all services without the collection of personal data. Our application is specialized in providing tools to support pregnant women, with strict adherence not to collect user data for any commercial purposes. All health data is stored locally on your device.')}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Navigation */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-2 mb-8"
          >
            {sections.slice(0, 6).map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${section.bgColor} ${section.color} border ${section.borderColor} hover:scale-105 transition-transform`}
              >
                <section.icon className="w-3 h-3" />
                {section.title.split(' ').slice(0, 2).join(' ')}
              </a>
            ))}
          </motion.div>

          {/* Sections */}
          <div className="space-y-4">
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Card className={`overflow-hidden ${section.important ? 'ring-2 ring-green-500/20' : ''}`}>
                  <CardHeader className={`${section.bgColor} border-b ${section.borderColor} py-4`}>
                    <CardTitle className={`flex items-center gap-3 text-base ${section.color}`}>
                      <div className="p-2 rounded-lg bg-background/80">
                        <section.icon className="w-5 h-5" />
                      </div>
                      {section.title}
                      {section.important && (
                        <span className="ml-auto text-xs bg-green-500/20 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">
                          Key Point
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {section.content}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center pt-6 border-t border-border mt-8"
          >
            <p className="text-xs text-muted-foreground">
              {t('privacyPolicy.footerNote', 'By continuing to use Pregnancy Toolkits, you acknowledge that you have read and understood this Privacy Policy. For the full legal text, please contact us.')}
            </p>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
