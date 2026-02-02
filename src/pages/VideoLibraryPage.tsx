import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, ShieldCheck } from 'lucide-react';
import { VideoLibrary, type Video } from '@/components/VideoLibrary';

const videos: Video[] = [
  // Nutrition Videos - Educational and professional
  { id: "1", youtubeId: "IWBF60kQcuk", title: "Pregnancy Nutrition Tips", description: "Essential nutrition advice from a registered dietitian", category: "Nutrition", duration: "5:30" },
  { id: "2", youtubeId: "0BrxCY89_uQ", title: "Nutrition During Pregnancy", description: "Healthy eating habits for your baby's development", category: "Nutrition", duration: "4:15" },
  { id: "3", youtubeId: "C_HuuCN9FMU", title: "Healthy Eating in Pregnancy", description: "Foundation of maternal health nutrition", category: "Nutrition", duration: "6:00" },
  { id: "4", youtubeId: "pozcaggYIWk", title: "Pregnancy Diet Guide", description: "What to eat and what to avoid while pregnant", category: "Nutrition", duration: "8:42" },
  
  // Fetal Development - 3D Animation (modest, educational)
  { id: "5", youtubeId: "3HPhF_IPJ1E", title: "Baby Development Week by Week", description: "3D animation of fetal development journey", category: "Development", duration: "15:00" },
  { id: "6", youtubeId: "xNfagna9Fxw", title: "Full Pregnancy Journey", description: "Week by week 3D animated guide", category: "Development", duration: "21:00" },
  { id: "7", youtubeId: "8BH7WFmRs-E", title: "Month-by-Month Guide", description: "Realistic 3D baby development animation", category: "Development", duration: "12:00" },
  { id: "8", youtubeId: "E0i7NQsJdWY", title: "First Trimester Guide", description: "3D animated first trimester overview", category: "Development", duration: "8:30" },
  
  // Meditation & Relaxation (audio-focused, modest)
  { id: "9", youtubeId: "pCSjhbVOdYQ", title: "Pregnancy Meditation", description: "1 hour relaxation and sleep meditation", category: "Mental Health", duration: "60:00" },
  { id: "10", youtubeId: "vEcZD8Js2Ws", title: "Prenatal Yoga Nidra", description: "Deep relaxation meditation for pregnancy", category: "Mental Health", duration: "25:00" },
  
  // Hospital Preparation (informative, no exposure)
  { id: "11", youtubeId: "NTulfAOzbp8", title: "Hospital Bag Checklist", description: "Midwife advice on what to pack", category: "Preparation", duration: "8:00" },
  { id: "12", youtubeId: "oUxVPhwFuMM", title: "Essential Hospital Bag Items", description: "Must-have items for labor and delivery", category: "Preparation", duration: "12:30" },
  { id: "13", youtubeId: "6YdwII4BO0g", title: "Hospital Bag Tips", description: "Nurse-approved essentials you'll actually use", category: "Preparation", duration: "10:00" },
  
  // Newborn Care (educational, professional)
  { id: "14", youtubeId: "hpgjwK_oQe0", title: "Newborn Care Week 1", description: "Pediatrician guide to first week", category: "Newborn Care", duration: "18:00" },
  { id: "15", youtubeId: "-CWJYxIvoFQ", title: "Caring For Your Newborn", description: "Comprehensive newborn care guide", category: "Newborn Care", duration: "15:00" },
  { id: "16", youtubeId: "CXWzqbe1i9c", title: "Newborn Baby Care Guide", description: "Handling, feeding, and sleeping basics", category: "Newborn Care", duration: "6:00" },
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
