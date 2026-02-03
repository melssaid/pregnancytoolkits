import React from 'react';
import { Database, Shield, Info, Heart, Lock, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataBackupManager } from '@/components/settings/DataBackupManager';
import { DataClearManager } from '@/components/settings/DataClearManager';
import { EncryptionManager } from '@/components/settings/EncryptionManager';
import { LanguageSelector } from '@/components/settings/LanguageSelector';
import { Layout } from '@/components/Layout';
import { useTranslation } from 'react-i18next';

const Settings: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Layout showBack>
      <div className="container py-6 space-y-6 pb-24">

        {/* Language Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-lg">{t('settings.language.sectionTitle', 'Language')}</h2>
          </div>
          <LanguageSelector />
        </section>
        
        {/* Security Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-lg">{t('settings.securityPrivacy')}</h2>
          </div>
          <EncryptionManager />
        </section>

        {/* Data Backup Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-lg">{t('settings.dataManagement')}</h2>
          </div>
          <div className="space-y-4">
            <DataBackupManager />
            <DataClearManager />
          </div>
        </section>

        {/* Privacy Info */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="w-5 h-5 text-primary" />
              {t('settings.dataPrivacy')}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>✅ {t('settings.privacyPoint1')}</p>
            <p>✅ {t('settings.privacyPoint2')}</p>
            <p>✅ {t('settings.privacyPoint3')}</p>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="w-5 h-5 text-muted-foreground" />
              {t('settings.aboutApp')}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-primary" />
              <span>{t('settings.appTagline')}</span>
            </p>
            <p>{t('settings.version')}: 1.0.0</p>
            <p className="text-xs mt-2 pt-2 border-t">
              ⚕️ {t('settings.medicalNote')}
            </p>
          </CardContent>
        </Card>

      </div>
    </Layout>
  );
};

export default Settings;
