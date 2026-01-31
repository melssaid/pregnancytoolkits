import React, { useState } from 'react';
import { Play, BookOpen, Clock, ExternalLink } from 'lucide-react';
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

interface VideoLibraryProps {
  videos: Video[];
  title?: string;
  subtitle?: string;
  accentColor?: string;
}

export const VideoLibrary: React.FC<VideoLibraryProps> = ({
  videos,
  title = "Educational Videos",
  subtitle = "Learn more with expert guidance",
  accentColor = "blue"
}) => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = ['all', ...new Set(videos.map(v => v.category))];
  
  const filteredVideos = activeCategory === 'all' 
    ? videos 
    : videos.filter(v => v.category === activeCategory);

  const getYoutubeThumbnail = (youtubeId: string) => 
    `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;

  const colorClasses = {
    blue: {
      gradient: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      border: 'border-blue-200/50',
      text: 'text-blue-600',
      badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
    },
    violet: {
      gradient: 'from-violet-500 to-purple-500',
      bg: 'bg-violet-50 dark:bg-violet-950/30',
      border: 'border-violet-200/50',
      text: 'text-violet-600',
      badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300'
    },
    rose: {
      gradient: 'from-rose-500 to-pink-500',
      bg: 'bg-rose-50 dark:bg-rose-950/30',
      border: 'border-rose-200/50',
      text: 'text-rose-600',
      badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300'
    },
    emerald: {
      gradient: 'from-emerald-500 to-teal-500',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      border: 'border-emerald-200/50',
      text: 'text-emerald-600',
      badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
    }
  };

  const colors = colorClasses[accentColor as keyof typeof colorClasses] || colorClasses.blue;

  if (videos.length === 0) return null;

  return (
    <>
      <Card className={`${colors.bg} ${colors.border} border`}>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 mb-3">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${colors.gradient}`}>
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
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
                        ? `bg-gradient-to-r ${colors.gradient} text-white border-0` 
                        : ''
                    }`}
                  >
                    {cat === 'all' ? 'All' : cat}
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
                    <div className="flex gap-3 p-2 rounded-xl bg-white/60 dark:bg-gray-800/40 hover:bg-white dark:hover:bg-gray-800/60 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-md">
                      {/* Thumbnail */}
                      <div className="relative w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={video.thumbnail || getYoutubeThumbnail(video.youtubeId)}
                          alt={video.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className={`p-1.5 rounded-full bg-gradient-to-r ${colors.gradient}`}>
                            <Play className="w-3 h-3 text-white" fill="white" />
                          </div>
                        </div>
                        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 rounded">
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
            <p className="text-xs text-center text-muted-foreground mt-3">
              +{filteredVideos.length - 4} more videos available
            </p>
          )}
        </CardContent>
      </Card>

      {/* Video Player Dialog */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="text-base pr-6">{selectedVideo?.title}</DialogTitle>
          </DialogHeader>
          <div className="px-4 pb-4">
            {/* Medical Disclaimer Alert */}
            <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-2">
              <span className="text-amber-600 text-lg">⚠️</span>
              <p className="text-xs text-amber-800 dark:text-amber-200">
                These videos are for educational purposes only and do not replace professional medical advice.
              </p>
            </div>
            
            <AspectRatio ratio={16 / 9}>
              {selectedVideo && (
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1&rel=0`}
                  title={selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full rounded-lg"
                />
              )}
            </AspectRatio>
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
