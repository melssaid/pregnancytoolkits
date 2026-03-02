import React from 'react';
import { BookOpen, ShieldCheck } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';
import { VideoLibrary } from '@/components/VideoLibrary';
import { Layout } from '@/components/Layout';
import { generalVideosByLang } from '@/data/videoData';
import { useTranslation } from 'react-i18next';

export default function VideoLibraryPage() {
  const { t } = useTranslation();

  return (
    <Layout showBack>
      <SEOHead title={t('videoLibrary.title')} description="Free pregnancy education videos: exercises, nutrition, labor preparation, and baby care guides." />
      <div className="container py-6 space-y-6">
        {/* Hero Section */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">{t('videoLibraryPage.title')}</h2>
            <p className="text-sm text-muted-foreground">{t('videoLibraryPage.subtitle')}</p>
          </div>
        </div>


        <VideoLibrary
          videosByLang={generalVideosByLang}
          title={t('videoLibraryPage.videosTitle')}
          subtitle={t('videoLibraryPage.subtitle')}
          accentColor="blue"
        />
      </div>
    </Layout>
  );
}
