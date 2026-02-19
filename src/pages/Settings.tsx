import React from 'react';
import { Database, Shield, Info, Heart, Lock, Globe, User } from 'lucide-react';
import { DataBackupManager } from '@/components/settings/DataBackupManager';
import { DataClearManager } from '@/components/settings/DataClearManager';
import { EncryptionManager } from '@/components/settings/EncryptionManager';
import { LanguageSelector } from '@/components/settings/LanguageSelector';
import { ProfileEditor } from '@/components/settings/ProfileEditor';
import { Layout } from '@/components/Layout';
import { useTranslation } from 'react-i18next';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Settings: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Layout showBack>
      <div className="container py-4 space-y-3 pb-24 max-w-lg mx-auto">
        
        {/* Quick Settings Header */}
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold text-foreground">{t('settings.title', 'Settings')}</h1>
          <p className="text-xs text-muted-foreground mt-1">{t('settings.subtitle', 'Manage your preferences')}</p>
        </div>

        {/* Accordion-based Settings */}
        <Accordion type="multiple" defaultValue={["profile"]} className="space-y-2">

          {/* My Profile */}
          <AccordionItem value="profile" className="border rounded-xl bg-card overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <span className="font-medium text-sm">{t('settings.profile.title', 'My Profile')}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <ProfileEditor compact />
            </AccordionContent>
          </AccordionItem>

          {/* Language */}
          <AccordionItem value="language" className="border rounded-xl bg-card overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-primary" />
                </div>
                <span className="font-medium text-sm">{t('settings.language.sectionTitle', 'Language')}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <LanguageSelector compact />
            </AccordionContent>
          </AccordionItem>

          {/* Security */}
          <AccordionItem value="security" className="border rounded-xl bg-card overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-warning/15 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-warning" />
                </div>
                <span className="font-medium text-sm">{t('settings.securityPrivacy')}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <EncryptionManager compact />
            </AccordionContent>
          </AccordionItem>

          {/* Data Management */}
          <AccordionItem value="data" className="border rounded-xl bg-card overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
                  <Database className="w-4 h-4 text-accent" />
                </div>
                <span className="font-medium text-sm">{t('settings.dataManagement')}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-3">
              <DataBackupManager compact />
              <DataClearManager compact />
            </AccordionContent>
          </AccordionItem>

        </Accordion>

        {/* Privacy & About - Compact Cards */}
        <div className="grid grid-cols-1 gap-2 mt-4">
          
          {/* Privacy Info */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">{t('settings.dataPrivacy')}</span>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>✓ {t('settings.privacyPoint1')}</p>
              <p>✓ {t('settings.privacyPoint2')}</p>
              <p>✓ {t('settings.privacyPoint3')}</p>
            </div>
          </div>

          {/* App Info */}
          <div className="p-3 rounded-xl bg-muted/30 border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-sm">{t('settings.aboutApp')}</span>
              </div>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">v1.0.0</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Heart className="w-3 h-3 text-primary" />
              {t('settings.appTagline')}
            </p>
            <p className="text-[10px] text-muted-foreground/70 mt-2 pt-2 border-t border-border/50">
              ⚕️ {t('settings.medicalNote')}
            </p>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default Settings;
