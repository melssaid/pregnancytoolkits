import { Layout } from "@/components/Layout";
import { SEOHead } from "@/components/SEOHead";
import { Mail, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function Contact() {
  const { t } = useTranslation();
  
  return (
    <Layout showBack>
      <SEOHead title={t('layout.contactPage.title')} description="Contact the Pregnancy Toolkits team for support, feedback, or questions" />
      <div className="container py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center space-y-2 mb-6">
            <h1 className="text-xl font-bold text-foreground">{t('layout.contactPage.title')}</h1>
            <p className="text-sm text-muted-foreground">
              {t('layout.contactPage.subtitle')}
            </p>
          </div>

          <div className="grid gap-6">
            {/* Email Card */}
            <motion.a
              href="mailto:M.melssaid@gmail.com"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-4 p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 flex-shrink-0">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-foreground">{t('layout.contactPage.email')}</h3>
                <p className="text-xs text-muted-foreground break-all">M.melssaid@gmail.com</p>
              </div>
            </motion.a>

            {/* Phone Card */}
            <motion.a
              href="tel:+97333775705"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4 p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 flex-shrink-0">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-foreground">{t('layout.contactPage.phone')}</h3>
                <p className="text-xs text-muted-foreground">+973 3377 5705</p>
              </div>
            </motion.a>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
