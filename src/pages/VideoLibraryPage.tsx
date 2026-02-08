import React from 'react';
import { BookOpen, ShieldCheck } from 'lucide-react';
import { VideoLibrary } from '@/components/VideoLibrary';
import { Layout } from '@/components/Layout';
import { generalVideosByLang } from '@/data/videoData';

export default function VideoLibraryPage() {
  return (
    <Layout showBack>
      <div className="container py-6 space-y-6">
        {/* Hero Section */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Video Library</h2>
            <p className="text-sm text-muted-foreground">Specialized content for expecting mothers</p>
          </div>
        </div>

        {/* Medical Disclaimer Banner */}
        <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-r from-muted to-muted/80 shadow-sm">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/70" />
          <div className="flex items-center gap-3 p-4 pl-5">
            <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="text-sm font-medium text-muted-foreground">
              Educational content only — Always consult your doctor before following any advice.
            </p>
          </div>
        </div>

        <VideoLibrary
          videosByLang={generalVideosByLang}
          title="Educational Videos"
          subtitle="Specialized content for expecting mothers"
          accentColor="blue"
        />
      </div>
    </Layout>
  );
}
