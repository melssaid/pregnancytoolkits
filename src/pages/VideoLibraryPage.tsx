import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, BookOpen, ShieldCheck, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { motion } from 'framer-motion';

interface VideoItem {
  id: string;
  youtubeId: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  thumbnail?: string;
}

const videos: VideoItem[] = [
  // Nutrition Videos
  { id: "1", youtubeId: "3fYsj_Bk6mk", title: "التغذية أثناء الحمل", description: "العناصر الغذائية الأساسية لحمل صحي", category: "التغذية", duration: "8:42" },
  { id: "2", youtubeId: "0DUzm3Fhzz4", title: "أطعمة الثلث الأول", description: "أفضل الأطعمة للحمل المبكر", category: "التغذية", duration: "10:15" },
  // Exercise Videos  
  { id: "3", youtubeId: "FaGK52oo36I", title: "تمارين آمنة للحوامل", description: "تمارين كاملة للجسم", category: "التمارين", duration: "25:00" },
  { id: "4", youtubeId: "B0NOxSdCrVg", title: "تمارين الإطالة", description: "تمارين لطيفة لكل ثلث", category: "التمارين", duration: "15:30" },
  // Preparation Videos
  { id: "5", youtubeId: "VKmxG3nZP2E", title: "حقيبة المستشفى", description: "الأساسيات التي لا تنسيها", category: "التحضير", duration: "12:30" },
  { id: "6", youtubeId: "j1p5O7cozdo", title: "التحضير للولادة", description: "نصائح للاستعداد للمستشفى", category: "التحضير", duration: "18:20" },
  // Mental Health
  { id: "7", youtubeId: "8GqVkn1v1ac", title: "الصحة النفسية بعد الولادة", description: "فهم اكتئاب ما بعد الولادة", category: "الصحة النفسية", duration: "14:30" },
  { id: "8", youtubeId: "aV1yGDUDNNk", title: "تمارين الاسترخاء", description: "تقنيات التنفس والتأمل", category: "الصحة النفسية", duration: "18:00" },
];

const categories = ["الكل", "التغذية", "التمارين", "التحضير", "الصحة النفسية"];

export default function VideoLibraryPage() {
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [activeCategory, setActiveCategory] = useState("الكل");

  const filteredVideos = activeCategory === "الكل" 
    ? videos 
    : videos.filter(v => v.category === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button 
            onClick={() => navigate('/')} 
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold">فيديوهات تعليمية</h1>
              <p className="text-xs opacity-80">محتوى متخصص للحوامل</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Medical Disclaimer Banner */}
        <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100/80 dark:from-slate-900 dark:to-slate-800/80 shadow-sm">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-teal-500" />
          <div className="flex items-center gap-3 p-4 pl-5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              ⚠️ محتوى تعليمي فقط - استشيري طبيبك دائماً قبل اتباع أي نصائح
            </p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredVideos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card 
                className="overflow-hidden cursor-pointer group hover:shadow-lg transition-all border-border/50"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="relative">
                  <img
                    src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-40 object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="p-4 rounded-full bg-primary">
                      <Play className="w-6 h-6 text-primary-foreground" fill="currentColor" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
                    {video.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {video.description}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {video.category}
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Video Player Dialog */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="text-base pr-6">{selectedVideo?.title}</DialogTitle>
          </DialogHeader>
          <div className="px-4 pb-4">
            {/* Medical Disclaimer */}
            <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-2">
              <span className="text-amber-600 text-lg">⚠️</span>
              <p className="text-xs text-amber-800 dark:text-amber-200">
                هذه الفيديوهات تعليمية فقط ولا تغني عن استشارة طبيبك المختص.
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
            <Badge variant="secondary" className="mt-2">
              {selectedVideo?.category}
            </Badge>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
