import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, ShieldCheck } from 'lucide-react';
import { VideoLibrary, type Video } from '@/components/VideoLibrary';

const videos: Video[] = [
  // Nutrition Videos - Educational and professional
  { id: "1", youtubeId: "2kNGY3gyrEc", title: "10 Foods I Eat Every Day Pregnant", description: "Daily pregnancy superfoods for you and baby", category: "Nutrition", duration: "11:30" },
  { id: "2", youtubeId: "pozcaggYIWk", title: "Pregnancy Diet Guide", description: "What to eat and what to avoid while pregnant", category: "Nutrition", duration: "8:42" },
  { id: "3", youtubeId: "YwuUDE-QSOg", title: "Pregnancy Preparation Tips", description: "5 things to do to prepare for pregnancy from a dietitian", category: "Nutrition", duration: "12:00" },
  
  // Nausea & Morning Sickness
  { id: "4", youtubeId: "qTEDyHPUeYQ", title: "Top Tips for Nausea in Pregnancy", description: "Expert advice from Dr. Lora Shahine", category: "First Trimester", duration: "8:30" },
  { id: "5", youtubeId: "Y3-oVdPmh7U", title: "Managing Nausea During Pregnancy", description: "Effective strategies for morning sickness", category: "First Trimester", duration: "10:00" },
  { id: "6", youtubeId: "KPA3DRZeH4A", title: "First Trimester Survival Tips", description: "OB/GYN tips for early pregnancy", category: "First Trimester", duration: "12:00" },
  
  // Meditation & Relaxation
  { id: "7", youtubeId: "pCSjhbVOdYQ", title: "Pregnancy Relaxation Meditation", description: "1 hour calming meditation for better sleep", category: "Mental Health", duration: "60:00" },
  { id: "8", youtubeId: "FdeqyQTavzI", title: "Prenatal Sleep Meditation", description: "Cozy sleep meditation for expecting mothers", category: "Mental Health", duration: "25:00" },
  { id: "9", youtubeId: "vEcZD8Js2Ws", title: "Prenatal Yoga Nidra", description: "Deep relaxation meditation for pregnancy", category: "Mental Health", duration: "25:00" },
  
  // Mental Health
  { id: "10", youtubeId: "6kV2_L3uSS0", title: "What is Postpartum Depression?", description: "Mental health professionals explain PPD", category: "Mental Health", duration: "8:30" },
  { id: "11", youtubeId: "Aj1Vk3q-4tg", title: "Postpartum Depression Explained", description: "Symptoms, risk factors, and treatment", category: "Mental Health", duration: "10:15" },
  
  // Labor & Birth Positions
  { id: "12", youtubeId: "npGb1aHQteo", title: "Top 5 Pushing Positions", description: "Best positions for effective pushing during labor", category: "Labor & Birth", duration: "10:00" },
  { id: "13", youtubeId: "nc8IbAAotHo", title: "Birth Faster With Less Pain", description: "Childbirth positions for easier labor", category: "Labor & Birth", duration: "15:00" },
  { id: "14", youtubeId: "i7vcGKtyqCY", title: "Different Pushing Positions", description: "Various positions explained for delivery", category: "Labor & Birth", duration: "12:00" },
  
  // Hospital Preparation
  { id: "15", youtubeId: "NTulfAOzbp8", title: "Hospital Bag Checklist", description: "Midwife advice on what to pack", category: "Preparation", duration: "8:00" },
  { id: "16", youtubeId: "oUxVPhwFuMM", title: "Essential Hospital Bag Items", description: "Must-have items for labor and delivery", category: "Preparation", duration: "12:30" },
  
  // Newborn Care
  { id: "17", youtubeId: "hpgjwK_oQe0", title: "Newborn Care Week 1", description: "Pediatrician guide to first week", category: "Newborn Care", duration: "18:00" },
  { id: "18", youtubeId: "-CWJYxIvoFQ", title: "Caring For Your Newborn", description: "Comprehensive newborn care guide", category: "Newborn Care", duration: "15:00" },
  { id: "19", youtubeId: "CXWzqbe1i9c", title: "Newborn Baby Care Guide", description: "Handling, feeding, and sleeping basics", category: "Newborn Care", duration: "6:00" },
  { id: "20", youtubeId: "rNjJyTga__w", title: "Breastfeeding a Newborn", description: "What's normal and common challenges", category: "Newborn Care", duration: "20:00" },
  
  // Skincare
  { id: "21", youtubeId: "CK9K2TmLG3c", title: "Pregnancy Safe Skincare Routine", description: "Dermatologist's safe skincare guide", category: "Skincare", duration: "15:30" },
  { id: "22", youtubeId: "OeEQy4PO8Jg", title: "Safe Skincare During Pregnancy", description: "What products to use and avoid", category: "Skincare", duration: "12:00" },
];

export default function VideoLibraryPage() {
  const navigate = useNavigate();

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
              Educational content only — Always consult your doctor before following any advice.
            </p>
          </div>
        </div>

        <VideoLibrary
          videos={videos}
          title="Educational Videos"
          subtitle="Specialized content for expecting mothers"
          accentColor="blue"
        />
      </div>
    </div>
  );
}
