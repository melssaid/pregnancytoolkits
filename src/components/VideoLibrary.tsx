import React, { useMemo, useState } from 'react';
import { AlertTriangle, Clock, ExternalLink, Play, Video as VideoIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { motion, AnimatePresence } from 'framer-motion';

export interface Video {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  duration: string;
  category: string;
  thumbnail?: string;
}

export type VideosByLang = Record<string, Video[]>;

interface VideoLibraryProps {
  videos?: Video[];
  videosByLang?: VideosByLang;
  title?: string;
  subtitle?: string;
  accentColor?: string;
}

// Fallback thumbnail component when YouTube thumbnail fails to load
const VideoThumbnail: React.FC<{
  video: Video;
}> = ({ video }) => {
  const [hasError, setHasError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  
  // Try maxresdefault first, fallback to hqdefault, then mqdefault
  const getThumbnailUrls = (youtubeId: string) => [
    `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
    `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`,
    `https://img.youtube.com/vi/${youtubeId}/default.jpg`,
  ];
  
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const thumbnailUrls = getThumbnailUrls(video.youtubeId);
  
  const handleError = () => {
    if (currentUrlIndex < thumbnailUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
    } else {
      setHasError(true);
    }
  };
  
  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <VideoIcon className="w-6 h-6 text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <>
      {!imgLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <VideoIcon className="w-6 h-6 text-muted-foreground/60 animate-pulse" />
        </div>
      )}
      <img
        src={video.thumbnail || thumbnailUrls[currentUrlIndex]}
        alt={video.title}
        className={`w-full h-full object-cover transition-opacity ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
        loading="lazy"
        onLoad={() => setImgLoaded(true)}
        onError={handleError}
      />
    </>
  );
};

export const VideoLibrary: React.FC<VideoLibraryProps> = ({
  videos: videosProp,
  videosByLang,
  title,
  subtitle,
  accentColor = "blue"
}) => {
  const { t, i18n } = useTranslation();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [browseOpen, setBrowseOpen] = useState(false);

  // Resolve videos: prefer videosByLang with language fallback, then videosProp
  // Normalize language code (e.g. 'ar-SA' → 'ar') to match videosByLang keys
  const videos = useMemo(() => {
    if (videosByLang) {
      const lang = i18n.language?.split('-')[0] || 'en';
      return videosByLang[lang] || videosByLang['default'] || videosProp || [];
    }
    return videosProp || [];
  }, [videosByLang, videosProp, i18n.language]);

  const categories = useMemo(() => ['all', ...new Set(videos.map(v => v.category))], [videos]);
  
  const filteredVideos = activeCategory === 'all' 
    ? videos 
    : videos.filter(v => v.category === activeCategory);

  // Keep API stable while using semantic tokens (no hardcoded palette)
  const colors = {
    panel: 'bg-muted/30 border-border/60',
    badge: 'bg-muted text-foreground',
    chipActive: 'bg-primary text-primary-foreground border-0',
    chipInactive: '',
    playBadge: 'bg-primary',
  };

  if (videos.length === 0) return null;

  return (
    <>
      <Card className={`${colors.panel} border`}>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground">
              <VideoIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{title || t('videoLibrary.defaultTitle')}</h3>
              <p className="text-xs text-muted-foreground">{subtitle || t('videoLibrary.defaultSubtitle')}</p>
            </div>
          </div>

          {/* Category Filter */}
          {categories.length > 2 && (
            <ScrollArea className="w-full mb-3">
              <div className="flex gap-2 pb-2">
                {categories.map(cat => (
                  <Button
                    key={cat}
                    variant={activeCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(cat)}
                    className={`text-xs whitespace-nowrap ${
                      activeCategory === cat 
                        ? colors.chipActive
                        : ''
                    }`}
                  >
                    {cat === 'all' ? t('videoLibrary.all') : cat}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* Video Grid */}
          <div className="grid gap-3">
            <AnimatePresence mode="popLayout">
              {filteredVideos.slice(0, 4).map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <button
                    onClick={() => setSelectedVideo(video)}
                    className="w-full text-left group"
                  >
                    <div className="flex gap-3 p-2 rounded-xl bg-background/70 hover:bg-background transition-all border border-border/40 hover:border-border hover:shadow-md">
                      {/* Thumbnail */}
                      <div className="relative w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                        <VideoThumbnail video={video} />
                        <div className="absolute inset-0 bg-foreground/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className={`p-1.5 rounded-full ${colors.playBadge}`}>
                            <Play className="w-3 h-3 text-primary-foreground" fill="currentColor" />
                          </div>
                        </div>
                        <div className="absolute bottom-1 right-1 bg-foreground/70 text-background text-[10px] px-1 rounded">
                          {video.duration}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {video.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {video.description}
                        </p>
                        <Badge variant="secondary" className={`mt-1 text-[10px] ${colors.badge}`}>
                          {video.category}
                        </Badge>
                      </div>
                    </div>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredVideos.length > 4 && (
            <div className="mt-3 flex flex-col items-center gap-2">
              <p className="text-xs text-center text-muted-foreground">
                {t('videoLibrary.moreVideos', { count: filteredVideos.length - 4 })}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setBrowseOpen(true)}
                className="text-xs"
              >
                {t('videoLibrary.viewAll', { count: filteredVideos.length })}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Browse All Videos Dialog */}
      <Dialog open={browseOpen} onOpenChange={setBrowseOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="text-base pr-6">
              {title} {activeCategory !== 'all' ? `• ${activeCategory}` : ''}
            </DialogTitle>
          </DialogHeader>

          <div className="px-4 pb-4">
            {/* Important Notice Alert */}
            <div className="mb-3 p-3 bg-muted/50 border border-border rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-muted-foreground mt-0.5" />
              <p className="text-xs text-muted-foreground">
                {t('videoLibrary.disclaimer')}
              </p>
            </div>

            <ScrollArea className="h-[60vh]">
              <div className="grid gap-3 pr-3">
                {filteredVideos.map((video) => (
                  <button
                    key={`browse-${video.id}`}
                    onClick={() => {
                      setBrowseOpen(false);
                      setSelectedVideo(video);
                    }}
                    className="w-full text-left group"
                  >
                    <div className="flex gap-3 p-2 rounded-xl bg-background/70 hover:bg-background transition-all border border-border/40 hover:border-border hover:shadow-md">
                      {/* Thumbnail */}
                      <div className="relative w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                        <VideoThumbnail video={video} />
                        <div className="absolute inset-0 bg-foreground/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className={`p-1.5 rounded-full ${colors.playBadge}`}>
                            <Play className="w-3 h-3 text-primary-foreground" fill="currentColor" />
                          </div>
                        </div>
                        <div className="absolute bottom-1 right-1 bg-foreground/70 text-background text-[10px] px-1 rounded">
                          {video.duration}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {video.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {video.description}
                        </p>
                        <Badge variant="secondary" className={`mt-1 text-[10px] ${colors.badge}`}>
                          {video.category}
                        </Badge>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Player Dialog */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="text-base pr-6">{selectedVideo?.title}</DialogTitle>
          </DialogHeader>
          <div className="px-4 pb-4">
            {/* Important Notice Alert */}
            <div className="mb-3 p-3 bg-muted/50 border border-border rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-muted-foreground mt-0.5" />
              <p className="text-xs text-muted-foreground">
                {t('videoLibrary.disclaimer')}
              </p>
            </div>
            
            <AspectRatio ratio={16 / 9}>
              {selectedVideo && (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${selectedVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1&hl=${i18n.language}&cc_lang_pref=${i18n.language}`}
                  title={selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full rounded-lg"
                />
              )}
            </AspectRatio>

            {selectedVideo && (
              <div className="mt-3">
                <a
                  href={`https://www.youtube.com/watch?v=${selectedVideo.youtubeId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                   <ExternalLink className="w-3 h-3" />
                   {t('videoLibrary.openOnYouTube')}
                </a>
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-3">
              {selectedVideo?.description}
            </p>
            <div className="flex items-center gap-3 mt-3">
              <Badge variant="secondary" className={colors.badge}>
                {selectedVideo?.category}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {selectedVideo?.duration}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VideoLibrary;
