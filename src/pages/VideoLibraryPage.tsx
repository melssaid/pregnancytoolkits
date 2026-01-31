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
  { id: "1", youtubeId: "3fYsj_Bk6mk", title: "Nutrition During Pregnancy", description: "Essential nutrients for a healthy pregnancy", category: "Nutrition", duration: "8:42" },
  { id: "2", youtubeId: "0DUzm3Fhzz4", title: "First Trimester Foods", description: "Best foods for early pregnancy", category: "Nutrition", duration: "10:15" },
  { id: "3", youtubeId: "Ry7xDEv2Uxc", title: "Essential Vitamins", description: "Important vitamins and minerals for pregnant women", category: "Nutrition", duration: "7:30" },
  { id: "4", youtubeId: "sB7M_ofGC2k", title: "Foods to Avoid", description: "Foods to avoid during pregnancy", category: "Nutrition", duration: "9:15" },
  { id: "5", youtubeId: "1_9pJe5VZXE", title: "Quick Healthy Meals", description: "Easy and nutritious recipes for pregnant women", category: "Nutrition", duration: "12:00" },
  
  // Exercise Videos  
  { id: "6", youtubeId: "FaGK52oo36I", title: "Safe Pregnancy Exercises", description: "Full body workout for pregnant women", category: "Exercise", duration: "25:00" },
  { id: "7", youtubeId: "B0NOxSdCrVg", title: "Stretching Exercises", description: "Gentle exercises for each trimester", category: "Exercise", duration: "15:30" },
  { id: "8", youtubeId: "4xyOBe7PLWU", title: "Prenatal Yoga", description: "Safe and relaxing yoga exercises", category: "Exercise", duration: "20:00" },
  { id: "9", youtubeId: "jO8vyXj_wLY", title: "Back Exercises", description: "Relieve back pain during pregnancy", category: "Exercise", duration: "18:00" },
  { id: "10", youtubeId: "hMc-8mpvL2U", title: "Breathing Exercises", description: "Breathing techniques for labor", category: "Exercise", duration: "14:00" },
  { id: "11", youtubeId: "fLsGp1mCvAc", title: "Pelvic Exercises", description: "Strengthen pelvic floor muscles", category: "Exercise", duration: "10:30" },
  
  // Preparation Videos
  { id: "12", youtubeId: "VKmxG3nZP2E", title: "Hospital Bag", description: "Essentials you shouldn't forget", category: "Preparation", duration: "12:30" },
  { id: "13", youtubeId: "j1p5O7cozdo", title: "Labor Preparation", description: "Tips for hospital readiness", category: "Preparation", duration: "18:20" },
  { id: "14", youtubeId: "eLqJYpMJWyQ", title: "Nursery Setup", description: "Preparing baby's room", category: "Preparation", duration: "15:00" },
  { id: "15", youtubeId: "c2NvYvjKXxU", title: "Baby Essentials", description: "Newborn essentials checklist", category: "Preparation", duration: "11:45" },
  { id: "16", youtubeId: "WdRpX4X-p8k", title: "Signs of Labor", description: "How to know labor is near", category: "Preparation", duration: "13:20" },
  { id: "17", youtubeId: "f7H7nL_V2sQ", title: "Birth Plan", description: "How to write your birth plan", category: "Preparation", duration: "16:00" },
  
  // Mental Health
  { id: "18", youtubeId: "8GqVkn1v1ac", title: "Postpartum Mental Health", description: "Understanding postpartum depression", category: "Mental Health", duration: "14:30" },
  { id: "19", youtubeId: "aV1yGDUDNNk", title: "Relaxation Exercises", description: "Breathing and meditation techniques", category: "Mental Health", duration: "18:00" },
  { id: "20", youtubeId: "inpok4MKVLM", title: "Prenatal Meditation", description: "Calming meditation session", category: "Mental Health", duration: "20:00" },
  { id: "21", youtubeId: "O-6f5wQXSu8", title: "Managing Anxiety", description: "Tips to reduce pregnancy anxiety", category: "Mental Health", duration: "12:00" },
  { id: "22", youtubeId: "4pLUleLdwY4", title: "Healthy Sleep", description: "Improving sleep quality during pregnancy", category: "Mental Health", duration: "10:30" },
  { id: "23", youtubeId: "1ZYbU82GVz4", title: "Bonding with Baby", description: "Techniques to connect with your baby", category: "Mental Health", duration: "8:45" },
  
  // Newborn Care
  { id: "24", youtubeId: "jmVAkH_s3Vw", title: "Breastfeeding", description: "Proper breastfeeding basics", category: "Newborn Care", duration: "15:00" },
  { id: "25", youtubeId: "zWjQGhVq0Rc", title: "Diaper Changing", description: "The right way to change diapers", category: "Newborn Care", duration: "8:30" },
  { id: "26", youtubeId: "mCJxPfTS1nQ", title: "Baby Bathing", description: "Safe steps for bathing your baby", category: "Newborn Care", duration: "10:00" },
  { id: "27", youtubeId: "G2cZpAGQy08", title: "Newborn Sleep", description: "Safe sleep habits for babies", category: "Newborn Care", duration: "12:30" },
  { id: "28", youtubeId: "Q2M0N4_ZNLY", title: "Baby Crying", description: "Understanding and soothing crying", category: "Newborn Care", duration: "9:45" },
  { id: "29", youtubeId: "Rz0go1pTda8", title: "Umbilical Care", description: "How to care for baby's umbilical cord", category: "Newborn Care", duration: "7:00" },
];

const categories = ["All", "Nutrition", "Exercise", "Preparation", "Mental Health", "Newborn Care"];

export default function VideoLibraryPage() {
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredVideos = activeCategory === "All" 
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
