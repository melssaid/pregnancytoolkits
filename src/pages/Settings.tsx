import React from 'react';
import { Settings as SettingsIcon, Database, Shield, Info, Heart, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataBackupManager } from '@/components/settings/DataBackupManager';
import { DataClearManager } from '@/components/settings/DataClearManager';
import { EncryptionManager } from '@/components/settings/EncryptionManager';
import BackButton from '@/components/BackButton';

const Settings: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <BackButton />
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">الإعدادات</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        
        {/* Security Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-lg">الأمان والخصوصية</h2>
          </div>
          <EncryptionManager />
        </section>

        {/* Data Backup Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-lg">إدارة البيانات</h2>
          </div>
          <div className="space-y-4">
            <DataBackupManager />
            <DataClearManager />
          </div>
        </section>

        {/* Privacy Info */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="w-5 h-5 text-blue-600" />
              خصوصية البيانات
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              ✅ جميع بياناتك الصحية تُخزن محلياً على جهازك فقط
            </p>
            <p>
              ✅ لا نجمع أو نشارك معلوماتك الشخصية
            </p>
            <p>
              ✅ يمكنك تصدير بياناتك في أي وقت
            </p>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="w-5 h-5 text-muted-foreground" />
              عن التطبيق
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-500" />
              <span>Pregnancy Tools - رفيقك في رحلة الحمل</span>
            </p>
            <p>الإصدار: 1.0.0</p>
            <p className="text-xs mt-2 pt-2 border-t">
              ⚕️ هذا التطبيق للأغراض التثقيفية فقط ولا يغني عن استشارة الطبيب
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default Settings;
