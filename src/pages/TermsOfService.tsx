import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { 
  FileCheck, 
  AlertTriangle, 
  Shield, 
  Scale, 
  Info, 
  RefreshCw,
  CheckCircle2,
  XCircle,
  Heart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  {
    id: "acceptance",
    icon: FileCheck,
    title: "Acceptance of Terms",
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20",
    content: (
      <p className="text-muted-foreground leading-relaxed">
        By using Pregnancy Toolkits, you agree to be bound by these terms and conditions. 
        If you do not agree with any part of these terms, please do not use our application.
      </p>
    )
  },
  {
    id: "medical",
    icon: AlertTriangle,
    title: "Medical Disclaimer",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive/20",
    important: true,
    content: (
      <div className="space-y-4">
        <p className="font-medium text-destructive">
          ⚠️ Very Important: Please Read Carefully
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Pregnancy Toolkits is intended for informational and educational purposes only. 
          This application:
        </p>
        <div className="grid gap-2 mt-3">
          <div className="flex items-start gap-2 text-sm">
            <XCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
            <span className="text-muted-foreground">Does NOT provide medical advice, diagnoses, or treatments</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <XCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
            <span className="text-muted-foreground">Does NOT replace consultation with a doctor or healthcare provider</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <XCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
            <span className="text-muted-foreground">Should NOT be used for emergency medical decisions</span>
          </div>
        </div>
        <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm font-medium text-primary flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Always consult your doctor or qualified healthcare provider regarding any medical or health questions.
          </p>
        </div>
      </div>
    )
  },
  {
    id: "usage",
    icon: Shield,
    title: "Use of Application",
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    content: (
      <div className="space-y-3">
        <p className="text-muted-foreground leading-relaxed mb-3">
          You agree to the following when using our application:
        </p>
        <div className="grid gap-2">
          <div className="flex items-start gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
            <span className="text-muted-foreground">Use the app for personal, non-commercial purposes only</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
            <span className="text-muted-foreground">Not rely on app results as a substitute for medical care</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
            <span className="text-muted-foreground">Seek immediate medical care in emergency situations</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "accuracy",
    icon: Info,
    title: "Accuracy of Information",
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    content: (
      <p className="text-muted-foreground leading-relaxed">
        While we strive to provide accurate and up-to-date information, we do not guarantee 
        the accuracy or completeness of any information in the app. Calculations and estimates 
        are approximate and may differ from actual reality. Always verify important information 
        with your healthcare provider.
      </p>
    )
  },
  {
    id: "liability",
    icon: Scale,
    title: "Limitation of Liability",
    color: "text-purple-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    content: (
      <p className="text-muted-foreground leading-relaxed">
        We will not be liable for any damages resulting from the use or inability to use 
        the app, including any health decisions made based on the information provided. 
        You use this application at your own risk and discretion.
      </p>
    )
  },
  {
    id: "modifications",
    icon: RefreshCw,
    title: "Modifications to Terms",
    color: "text-teal-600",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500/20",
    content: (
      <p className="text-muted-foreground leading-relaxed">
        We reserve the right to modify these terms at any time without prior notice. 
        Your continued use of the app after any changes constitutes your acceptance of 
        the modified terms. We encourage you to review these terms periodically.
      </p>
    )
  }
];

export default function TermsOfService() {
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
              <FileCheck className="w-4 h-4" />
              <span>Last updated: January 2026</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              Please read these terms carefully before using Pregnancy Toolkits
            </p>
          </motion.div>

          {/* Quick Navigation */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap justify-center gap-2 mb-8"
          >
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${section.bgColor} ${section.color} border ${section.borderColor} hover:scale-105 transition-transform`}
              >
                <section.icon className="w-3 h-3" />
                {section.title}
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
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`overflow-hidden ${section.important ? 'ring-2 ring-destructive/20' : ''}`}>
                  <CardHeader className={`${section.bgColor} border-b ${section.borderColor} py-4`}>
                    <CardTitle className={`flex items-center gap-3 text-base ${section.color}`}>
                      <div className={`p-2 rounded-lg bg-background/80`}>
                        <section.icon className="w-5 h-5" />
                      </div>
                      {section.title}
                      {section.important && (
                        <span className="ml-auto text-xs bg-destructive/20 text-destructive px-2 py-1 rounded-full">
                          Important
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
            transition={{ delay: 0.6 }}
            className="text-center pt-6 border-t border-border mt-8"
          >
            <p className="text-xs text-muted-foreground">
              By continuing to use Pregnancy Toolkits, you acknowledge that you have read, 
              understood, and agree to be bound by these Terms of Service.
            </p>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
