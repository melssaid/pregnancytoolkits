import { Layout } from "@/components/Layout";
import { SEOHead } from "@/components/SEOHead";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { 
  FileCheck, 
  AlertTriangle, 
  Shield, 
  Scale, 
  Info, 
  RefreshCw,
  CheckCircle2,
  XCircle,
  Heart,
  LucideIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  { id: "acceptance", icon: FileCheck, titleKey: "acceptance", color: "text-primary", bgColor: "bg-primary/10", borderColor: "border-primary/20" },
  { id: "medical", icon: AlertTriangle, titleKey: "medical", color: "text-destructive", bgColor: "bg-destructive/10", borderColor: "border-destructive/20", important: true },
  { id: "usage", icon: Shield, titleKey: "usage", color: "text-blue-600", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/20" },
  { id: "intellectualProperty", icon: Scale, titleKey: "intellectualProperty", color: "text-purple-600", bgColor: "bg-purple-500/10", borderColor: "border-purple-500/20" },
  { id: "userContent", icon: Info, titleKey: "userContent", color: "text-teal-600", bgColor: "bg-teal-500/10", borderColor: "border-teal-500/20" },
  { id: "accuracy", icon: Info, titleKey: "accuracy", color: "text-amber-600", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/20" },
  { id: "appStore", icon: Shield, titleKey: "appStore", color: "text-green-600", bgColor: "bg-green-500/10", borderColor: "border-green-500/20" },
  { id: "liability", icon: Scale, titleKey: "liability", color: "text-red-600", bgColor: "bg-red-500/10", borderColor: "border-red-500/20" },
  { id: "termination", icon: AlertTriangle, titleKey: "termination", color: "text-orange-600", bgColor: "bg-orange-500/10", borderColor: "border-orange-500/20" },
  { id: "governingLaw", icon: FileCheck, titleKey: "governingLaw", color: "text-indigo-600", bgColor: "bg-indigo-500/10", borderColor: "border-indigo-500/20" },
  { id: "modifications", icon: RefreshCw, titleKey: "modifications", color: "text-gray-600", bgColor: "bg-gray-500/10", borderColor: "border-gray-500/20" },
];

const SectionContent = ({ sectionKey }: { sectionKey: string }) => {
  const { t } = useTranslation();
  const s = (key: string) => t(`layout.termsOfService.sections.${sectionKey}.${key}`);

  switch (sectionKey) {
    case "acceptance":
      return <p className="text-muted-foreground leading-relaxed text-sm">{s("content")}</p>;

    case "medical":
      return (
        <div className="space-y-4">
          <p className="font-medium text-destructive">{s("warning")}</p>
          <p className="text-muted-foreground leading-relaxed text-sm">{s("content")}</p>
          <div className="grid gap-2 mt-3">
            {["noAdvice", "noReplace", "noEmergency"].map((key) => (
              <div key={key} className="flex items-start gap-2 text-sm">
                <XCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{s(key)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm font-medium text-primary flex items-center gap-2">
              <Heart className="w-4 h-4 shrink-0" />
              <span>{s("consultDoctor")}</span>
            </p>
          </div>
        </div>
      );

    case "usage":
      return (
        <div className="space-y-3">
          <p className="text-muted-foreground leading-relaxed text-sm mb-3">{s("content")}</p>
          <div className="grid gap-2">
            {["personal", "notSubstitute", "seekCare", "noMisuse"].map((key) => (
              <div key={key} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{s(key)}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case "intellectualProperty":
    case "userContent":
    case "accuracy":
    case "appStore":
    case "liability":
    case "termination":
    case "governingLaw":
    case "modifications":
      return <p className="text-muted-foreground leading-relaxed text-sm">{s("content")}</p>;

    default:
      return null;
  }
};

export default function TermsOfService() {
  const { t } = useTranslation();

  return (
    <Layout showBack>
      <SEOHead title={t('layout.termsOfService.title')} description="Terms of service for Pregnancy Toolkits – educational & lifestyle companion, not a medical device." />
      <div className="container py-6 pb-24">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2 mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 text-sm text-muted-foreground">
              <FileCheck className="w-4 h-4" />
              <span>{t('layout.termsOfService.lastUpdated')}</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">{t('layout.termsOfService.title')}</h1>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              {t('layout.termsOfService.subtitle')}
            </p>
          </motion.div>

          {/* Quick Navigation */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap justify-center gap-2 mb-8"
          >
            {sectionConfigs.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${section.bgColor} ${section.color} border ${section.borderColor} hover:scale-105 transition-transform`}
              >
                <section.icon className="w-3 h-3" />
                <span className="break-words">
                  {t(`layout.termsOfService.sections.${section.titleKey}.title`)}
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
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`overflow-hidden ${section.important ? 'ring-2 ring-destructive/20' : ''}`}>
                  <CardHeader className={`${section.bgColor} border-b ${section.borderColor} py-4`}>
                    <CardTitle className={`flex items-center gap-3 text-base ${section.color}`}>
                      <div className="p-2 rounded-lg bg-background/80 shrink-0">
                        <section.icon className="w-5 h-5" />
                      </div>
                      <span className="flex-1 min-w-0 break-words">
                        {t(`layout.termsOfService.sections.${section.titleKey}.title`)}
                      </span>
                      {section.important && (
                        <span className="text-xs bg-destructive/20 text-destructive px-2 py-1 rounded-full shrink-0">
                          {t('layout.termsOfService.important')}
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
            transition={{ delay: 0.6 }}
            className="text-center pt-6 border-t border-border mt-8"
          >
            <p className="text-xs text-muted-foreground">
              {t('layout.termsOfService.footerNote')}
            </p>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
