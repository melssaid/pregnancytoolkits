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
  { id: "3", youtubeId: "Ry7xDEv2Uxc", title: "الفيتامينات الضرورية", description: "أهم الفيتامينات والمعادن للحامل", category: "التغذية", duration: "7:30" },
  { id: "4", youtubeId: "sB7M_ofGC2k", title: "أطعمة يجب تجنبها", description: "الأطعمة الممنوعة أثناء الحمل", category: "التغذية", duration: "9:15" },
  { id: "5", youtubeId: "1_9pJe5VZXE", title: "وجبات صحية سريعة", description: "وصفات سهلة ومغذية للحوامل", category: "التغذية", duration: "12:00" },
  
  // Exercise Videos  
  { id: "6", youtubeId: "FaGK52oo36I", title: "تمارين آمنة للحوامل", description: "تمارين كاملة للجسم", category: "التمارين", duration: "25:00" },
  { id: "7", youtubeId: "B0NOxSdCrVg", title: "تمارين الإطالة", description: "تمارين لطيفة لكل ثلث", category: "التمارين", duration: "15:30" },
  { id: "8", youtubeId: "4xyOBe7PLWU", title: "يوغا للحوامل", description: "تمارين يوغا آمنة ومريحة", category: "التمارين", duration: "20:00" },
  { id: "9", youtubeId: "jO8vyXj_wLY", title: "تمارين الظهر", description: "تخفيف آلام الظهر أثناء الحمل", category: "التمارين", duration: "18:00" },
  { id: "10", youtubeId: "hMc-8mpvL2U", title: "تمارين التنفس", description: "تقنيات التنفس للولادة", category: "التمارين", duration: "14:00" },
  { id: "11", youtubeId: "fLsGp1mCvAc", title: "تمارين الحوض", description: "تقوية عضلات قاع الحوض", category: "التمارين", duration: "10:30" },
  
  // Preparation Videos
  { id: "12", youtubeId: "VKmxG3nZP2E", title: "حقيبة المستشفى", description: "الأساسيات التي لا تنسيها", category: "التحضير", duration: "12:30" },
  { id: "13", youtubeId: "j1p5O7cozdo", title: "التحضير للولادة", description: "نصائح للاستعداد للمستشفى", category: "التحضير", duration: "18:20" },
  { id: "14", youtubeId: "eLqJYpMJWyQ", title: "غرفة المولود", description: "تجهيز غرفة الطفل", category: "التحضير", duration: "15:00" },
  { id: "15", youtubeId: "c2NvYvjKXxU", title: "مستلزمات المولود", description: "قائمة أساسيات المولود الجديد", category: "التحضير", duration: "11:45" },
  { id: "16", youtubeId: "WdRpX4X-p8k", title: "علامات الولادة", description: "كيف تعرفين أن الولادة قريبة", category: "التحضير", duration: "13:20" },
  { id: "17", youtubeId: "f7H7nL_V2sQ", title: "خطة الولادة", description: "كيفية كتابة خطة ولادتك", category: "التحضير", duration: "16:00" },
  
  // Mental Health
  { id: "18", youtubeId: "8GqVkn1v1ac", title: "الصحة النفسية بعد الولادة", description: "فهم اكتئاب ما بعد الولادة", category: "الصحة النفسية", duration: "14:30" },
  { id: "19", youtubeId: "aV1yGDUDNNk", title: "تمارين الاسترخاء", description: "تقنيات التنفس والتأمل", category: "الصحة النفسية", duration: "18:00" },
  { id: "20", youtubeId: "inpok4MKVLM", title: "التأمل للحوامل", description: "جلسة تأمل مهدئة", category: "الصحة النفسية", duration: "20:00" },
  { id: "21", youtubeId: "O-6f5wQXSu8", title: "التعامل مع القلق", description: "نصائح لتخفيف قلق الحمل", category: "الصحة النفسية", duration: "12:00" },
  { id: "22", youtubeId: "4pLUleLdwY4", title: "النوم الصحي", description: "تحسين جودة النوم أثناء الحمل", category: "الصحة النفسية", duration: "10:30" },
  { id: "23", youtubeId: "1ZYbU82GVz4", title: "الترابط مع الجنين", description: "تقنيات للتواصل مع طفلك", category: "الصحة النفسية", duration: "8:45" },
  
  // Newborn Care
  { id: "24", youtubeId: "jmVAkH_s3Vw", title: "الرضاعة الطبيعية", description: "أساسيات الرضاعة الصحيحة", category: "رعاية المولود", duration: "15:00" },
  { id: "25", youtubeId: "zWjQGhVq0Rc", title: "تغيير الحفاض", description: "الطريقة الصحيحة لتغيير الحفاض", category: "رعاية المولود", duration: "8:30" },
  { id: "26", youtubeId: "mCJxPfTS1nQ", title: "تحميم المولود", description: "خطوات آمنة لتحميم الرضيع", category: "رعاية المولود", duration: "10:00" },
  { id: "27", youtubeId: "G2cZpAGQy08", title: "نوم المولود", description: "تنظيم نوم الرضيع بشكل آمن", category: "رعاية المولود", duration: "12:30" },
  { id: "28", youtubeId: "Q2M0N4_ZNLY", title: "بكاء الرضيع", description: "فهم أسباب البكاء وتهدئته", category: "رعاية المولود", duration: "9:45" },
  { id: "29", youtubeId: "Rz0go1pTda8", title: "العناية بالسرة", description: "كيفية العناية بسرة المولود", category: "رعاية المولود", duration: "7:00" },
];

const categories = ["الكل", "التغذية", "التمارين", "التحضير", "الصحة النفسية", "رعاية المولود"];

export default function VideoLibraryPage() {
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [activeCategory, setActiveCategory] = useState("الكل");

  const filteredVideos = activeCategory === "الكل" 
    ? videos 
    : videos.filter(v => v.category === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/50 to-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button 
            onClick={() => navigate('/')} 
            className="p-2 hover:bg-primary-foreground/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-foreground/20 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Educational Videos</h1>
              <p className="text-xs text-primary-foreground/80">Specialized content for expecting mothers</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Medical Disclaimer Banner */}
        <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-r from-muted to-muted/80 shadow-sm">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/70" />
          <div className="flex items-center gap-3 p-4 pl-5">
            <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="text-sm font-medium text-muted-foreground">
              ⚠️ Educational content only - Always consult your doctor before following any advice
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
                  <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="p-4 rounded-full bg-primary">
                      <Play className="w-6 h-6 text-primary-foreground" fill="currentColor" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-foreground/70 text-background text-xs px-2 py-1 rounded">
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
            <div className="mb-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
              <span className="text-destructive text-lg">⚠️</span>
              <p className="text-xs text-destructive">
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
            <Badge variant="secondary" className="mt-2">
              {selectedVideo?.category}
            </Badge>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
