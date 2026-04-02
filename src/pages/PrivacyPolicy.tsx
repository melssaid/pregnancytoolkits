import { Layout } from "@/components/Layout";
import { SEOHead } from "@/components/SEOHead";
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
  Bell,
  
  LucideIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface SectionConfig {
  id: string;
  icon: LucideIcon;
  titleKey: string;
  color: string;
  bgColor: string;
  borderColor: string;
  important?: boolean;
}

const sectionConfigs: SectionConfig[] = [
  { id: "collection", icon: Database, titleKey: "collection", color: "text-primary", bgColor: "bg-primary/10", borderColor: "border-primary/20" },
  { id: "data-safety", icon: Shield, titleKey: "dataSafety", color: "text-emerald-600", bgColor: "bg-emerald-500/10", borderColor: "border-emerald-500/20", important: true },
  { id: "local-storage", icon: Smartphone, titleKey: "localStorage", color: "text-green-600", bgColor: "bg-green-500/10", borderColor: "border-green-500/20", important: true },
  { id: "processing", icon: Scale, titleKey: "processing", color: "text-blue-600", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/20" },
  { id: "sharing", icon: Users, titleKey: "sharing", color: "text-amber-600", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/20" },
  { id: "sharing", icon: Users, titleKey: "sharing", color: "text-amber-600", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/20" },
  { id: "ai-products", icon: Sparkles, titleKey: "aiProducts", color: "text-purple-600", bgColor: "bg-purple-500/10", borderColor: "border-purple-500/20" },
  { id: "notifications", icon: Bell, titleKey: "notifications", color: "text-teal-600", bgColor: "bg-teal-500/10", borderColor: "border-teal-500/20" },
  { id: "photos", icon: Eye, titleKey: "photos", color: "text-rose-600", bgColor: "bg-rose-500/10", borderColor: "border-rose-500/20" },
  { id: "retention", icon: Clock, titleKey: "retention", color: "text-orange-600", bgColor: "bg-orange-500/10", borderColor: "border-orange-500/20" },
  { id: "security", icon: Lock, titleKey: "security", color: "text-red-600", bgColor: "bg-red-500/10", borderColor: "border-red-500/20" },
  { id: "minors", icon: Baby, titleKey: "minors", color: "text-pink-600", bgColor: "bg-pink-500/10", borderColor: "border-pink-500/20" },
  { id: "rights", icon: UserCheck, titleKey: "rights", color: "text-indigo-600", bgColor: "bg-indigo-500/10", borderColor: "border-indigo-500/20" },
  { id: "international", icon: Globe, titleKey: "international", color: "text-cyan-600", bgColor: "bg-cyan-500/10", borderColor: "border-cyan-500/20" },
  { id: "updates", icon: RefreshCw, titleKey: "updates", color: "text-gray-600", bgColor: "bg-gray-500/10", borderColor: "border-gray-500/20" },
  { id: "contact", icon: Mail, titleKey: "contact", color: "text-primary", bgColor: "bg-primary/10", borderColor: "border-primary/20" },
];

const SectionContent = ({ sectionKey }: { sectionKey: string }) => {
  const { t } = useTranslation();
  const s = (key: string) => t(`layout.privacyPolicy.sections.${sectionKey}.${key}`);

  switch (sectionKey) {
    case "collection":
      return (
        <div className="space-y-4">
          <p className="text-muted-foreground leading-relaxed text-sm">{s("desc")}</p>
          <div className="grid gap-2 mt-3">
            {["noSensitive", "noThirdParty", "noAccount", "noTracking"].map((key) => (
              <div key={key} className="flex items-start gap-2 text-sm">
                <XCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{s(key)}</span>
              </div>
            ))}
            <div className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-muted-foreground">{s("paymentSecure")}</span>
            </div>
          </div>
        </div>
      );

    case "dataSafety":
      return (
        <div className="space-y-4">
          <p className="text-muted-foreground leading-relaxed text-sm">{s("desc")}</p>
          <div className="grid gap-2 mt-3">
            {["noPersonalData", "localOnly", "encryption", "anonymousAnalytics", "deletion", "optOut"].map((key) => (
              <div key={key} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{s(key)}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground/70 mt-2">{s("analyticsDetail")}</p>
        </div>
      );

    case "localStorage":
      return (
        <div className="space-y-4">
          <p className="text-muted-foreground leading-relaxed text-sm">{s("desc")}</p>
          <div className="grid gap-2 mt-3">
            {["neverLeaves", "notUploaded", "notShared", "canDelete", "encrypted"].map((key) => (
              <div key={key} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{s(key)}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case "processing":
      return (
        <div className="space-y-3">
          <p className="text-muted-foreground leading-relaxed text-sm">{s("desc")}</p>
          <p className="text-sm text-muted-foreground">{s("legalBasis")}</p>
        </div>
      );

    case "sharing":
      return (
        <div className="space-y-3">
          <p className="text-muted-foreground leading-relaxed text-sm">{s("desc")}</p>
          <div className="grid gap-2 mt-3">
            <div className="flex items-start gap-2 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
              <span className="text-muted-foreground">{s("businessTransfers")}</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-green-500/5 rounded-lg border border-green-500/20">
            <p className="text-sm font-medium text-green-700 dark:text-green-400">{s("noSold")}</p>
          </div>
        </div>
      );

    case "aiProducts": {
      const tools = t("layout.privacyPolicy.sections.aiProducts.tools", { returnObjects: true }) as string[];
      return (
        <div className="space-y-4">
          <p className="text-muted-foreground leading-relaxed text-sm">{s("desc")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs">
            {Array.isArray(tools) && tools.map((tool) => (
              <div key={tool} className="flex items-center gap-2 p-2 rounded-lg bg-purple-500/5">
                <Sparkles className="w-3 h-3 text-purple-500 shrink-0" />
                <span className="text-muted-foreground">{tool}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-3">{s("dataNote")}</p>
          <p className="text-xs text-muted-foreground/70">{s("noTraining")}</p>
        </div>
      );
    }

    case "notifications":
      return (
        <div className="space-y-3">
          <p className="text-muted-foreground leading-relaxed text-sm">{s("desc")}</p>
          <div className="grid gap-2 mt-3">
            {["noTransmission", "noAudioCollected", "canDisable"].map((key) => (
              <div key={key} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{s(key)}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case "retention":
      return <p className="text-muted-foreground leading-relaxed text-sm">{s("desc")}</p>;

    case "photos":
      return (
        <div className="space-y-4">
          <p className="text-muted-foreground leading-relaxed text-sm">{s("desc")}</p>
          <div className="grid gap-2 mt-3">
            {["localDefault", "localOnly", "noPublic", "noDiagnosis"].map((key) => (
              <div key={key} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{s(key)}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case "security":
      return (
        <div className="space-y-3">
          <p className="text-muted-foreground leading-relaxed text-sm">{s("desc")}</p>
          <p className="text-sm text-muted-foreground">{s("note")}</p>
          <p className="text-xs text-muted-foreground/70">{s("measures")}</p>
        </div>
      );

    case "minors":
      return <p className="text-muted-foreground leading-relaxed text-sm">{s("desc")}</p>;

    case "rights": {
      const rightItems: { key: string; icon: LucideIcon }[] = [
        { key: "access", icon: Eye },
        { key: "correct", icon: RefreshCw },
        { key: "delete", icon: Trash2 },
        { key: "optOut", icon: XCircle },
      ];
      return (
        <div className="space-y-4">
          <p className="text-muted-foreground leading-relaxed text-sm">{s("desc")}</p>
          <div className="grid gap-2 mt-3">
            {rightItems.map(({ key, icon: Icon }) => (
              <div key={key} className="flex items-start gap-2 text-sm">
                <Icon className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{s(key)}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "international":
      return (
        <div className="space-y-3">
          <p className="text-muted-foreground leading-relaxed text-sm">{s("desc")}</p>
          <div className="grid gap-2 mt-3 text-sm">
            {["eu", "us", "canada"].map((key) => (
              <div key={key} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2 shrink-0" />
                <span className="text-muted-foreground">{s(key)}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case "updates":
      return <p className="text-muted-foreground leading-relaxed text-sm">{s("desc")}</p>;

    case "contact":
      return (
        <div className="space-y-3">
          <p className="text-muted-foreground leading-relaxed text-sm">{s("desc")}</p>
          <div className="grid gap-3 mt-3">
            <a 
              href="mailto:pregnancytoolkits@gmail.com" 
              className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
            >
              <Mail className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm text-primary font-medium">pregnancytoolkits@gmail.com</span>
            </a>
            <Link 
              to="/contact" 
              className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
            >
              <Globe className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm text-primary font-medium">{s("contactPage")}</span>
            </Link>
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default function PrivacyPolicy() {
  const { t } = useTranslation();
  
  return (
    <Layout showBack>
      <SEOHead title={t('layout.privacyPolicy.title')} description="Privacy policy for Pregnancy Toolkits – your data stays on your device. GDPR & CCPA compliant." />
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
              <span>{t('layout.privacyPolicy.lastUpdated')}</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">{t('layout.privacyPolicy.title')}</h1>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              {t('layout.privacyPolicy.subtitle')}
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
                   <span className="flex-1 min-w-0">{t('layout.privacyPolicy.privacyFirst.title')}</span>
                   <span className="text-xs bg-green-500/20 px-2 py-1 rounded-full shrink-0">
                     {t('layout.privacyPolicy.privacyFirst.badge')}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {t('layout.privacyPolicy.privacyFirst.content')}
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
            {sectionConfigs.slice(0, 6).map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${section.bgColor} ${section.color} border ${section.borderColor} hover:scale-105 transition-transform`}
              >
                <section.icon className="w-3 h-3" />
                <span className="truncate max-w-[100px]">
                   {t(`layout.privacyPolicy.sections.${section.titleKey}.title`)}
                </span>
              </a>
            ))}
          </motion.div>

          {/* Sections */}
          <div className="space-y-4">
            {sectionConfigs.map((section, index) => (
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
                      <div className="p-2 rounded-lg bg-background/80 shrink-0">
                        <section.icon className="w-5 h-5" />
                      </div>
                      <span className="flex-1 min-w-0 break-words">
                        {t(`layout.privacyPolicy.sections.${section.titleKey}.title`)}
                      </span>
                      {section.important && (
                        <span className="text-xs bg-green-500/20 text-green-700 dark:text-green-400 px-2 py-1 rounded-full shrink-0">
                          {t('layout.privacyPolicy.keyPoint')}
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <SectionContent sectionKey={section.titleKey} />
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
               {t('layout.privacyPolicy.footerNote')}
            </p>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
