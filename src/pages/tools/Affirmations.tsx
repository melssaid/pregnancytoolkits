import { useState, useEffect } from "react";
import { ToolFrame } from "@/components/ToolFrame";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, Heart, Share2, Copy, Check, Sun, Moon, Quote, Clock, Star, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAnalytics } from "@/hooks/useAnalytics";

const STORAGE_KEY = "favorite-affirmations";
const STREAK_KEY = "affirmation-streak";

interface AffirmationCategory {
  name: string;
  icon: string;
  affirmations: string[];
}

const affirmationCategories: AffirmationCategory[] = [
  {
    name: "Self-Love",
    icon: "💝",
    affirmations: [
      "My body knows exactly how to grow and nurture my baby.",
      "I am strong, capable, and ready for motherhood.",
      "I embrace the changes in my body with gratitude.",
      "I am already a wonderful mother.",
      "I deserve rest and self-care.",
      "I am exactly the mother my baby needs.",
    ]
  },
  {
    name: "Birth Confidence",
    icon: "🌟",
    affirmations: [
      "I am calm, relaxed, and prepared for birth.",
      "Each contraction brings me closer to meeting my baby.",
      "I release fear and welcome joy.",
      "My body was designed for this beautiful journey.",
      "I trust my body and its wisdom.",
      "My body is powerful and knows what to do.",
    ]
  },
  {
    name: "Baby Connection",
    icon: "👶",
    affirmations: [
      "My baby feels my love and peace.",
      "My love for my baby grows stronger every day.",
      "I am creating life, and that is extraordinary.",
      "My baby is healthy, happy, and thriving.",
      "I am grateful for this miracle growing inside me.",
      "Every day I am becoming a better version of myself.",
    ]
  },
  {
    name: "Inner Peace",
    icon: "🧘",
    affirmations: [
      "I breathe in peace and breathe out tension.",
      "I am patient with myself and my journey.",
      "I trust the timing of my pregnancy.",
      "I choose positive thoughts for myself and my baby.",
      "I am surrounded by love and support.",
      "I welcome this new chapter with open arms.",
    ]
  }
];

const allAffirmations = affirmationCategories.flatMap(cat => cat.affirmations);

const morningRoutine = [
  "Place your hands on your heart",
  "Take 3 deep breaths",
  "Read your affirmation out loud",
  "Visualize your day going well",
  "Send love to your baby"
];

const Affirmations = () => {
  const { trackAction } = useAnalytics("affirmations");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [streak, setStreak] = useState({ days: 0, lastDate: "" });
  const [timeOfDay, setTimeOfDay] = useState<"morning" | "evening">("morning");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setFavorites(JSON.parse(saved));
    
    const streakData = localStorage.getItem(STREAK_KEY);
    if (streakData) setStreak(JSON.parse(streakData));
    
    // Set time of day
    const hour = new Date().getHours();
    setTimeOfDay(hour < 12 ? "morning" : "evening");
    
    // Random start
    setCurrentIndex(Math.floor(Math.random() * allAffirmations.length));
    
    // Update streak
    updateStreak();
  }, []);

  const updateStreak = () => {
    const today = new Date().toDateString();
    const streakData = localStorage.getItem(STREAK_KEY);
    
    if (streakData) {
      const { days, lastDate } = JSON.parse(streakData);
      if (lastDate === today) return;
      
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newStreak = {
        days: lastDate === yesterday ? days + 1 : 1,
        lastDate: today
      };
      setStreak(newStreak);
      localStorage.setItem(STREAK_KEY, JSON.stringify(newStreak));
    } else {
      const newStreak = { days: 1, lastDate: today };
      setStreak(newStreak);
      localStorage.setItem(STREAK_KEY, JSON.stringify(newStreak));
    }
  };

  const currentAffirmations = selectedCategory 
    ? affirmationCategories.find(c => c.name === selectedCategory)?.affirmations || allAffirmations
    : allAffirmations;

  const nextAffirmation = () => {
    setCurrentIndex((prev) => (prev + 1) % currentAffirmations.length);
    trackAction("next_affirmation");
  };

  const toggleFavorite = () => {
    const updated = favorites.includes(currentIndex)
      ? favorites.filter((i) => i !== currentIndex)
      : [...favorites, currentIndex];
    setFavorites(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    trackAction(favorites.includes(currentIndex) ? "unfavorited" : "favorited");
  };

  const shareAffirmation = async () => {
    const text = currentAffirmations[currentIndex];
    if (navigator.share) {
      try {
        await navigator.share({ 
          text: `✨ ${text}\n\n— Pregnancy Affirmation` 
        });
        trackAction("shared");
      } catch (e) {
        // User cancelled
      }
    } else {
      copyAffirmation();
    }
  };

  const copyAffirmation = () => {
    navigator.clipboard.writeText(currentAffirmations[currentIndex]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    trackAction("copied");
  };

  return (
    <ToolFrame
      title="Daily Affirmations"
      subtitle="Positive thoughts for your pregnancy journey"
      customIcon="pregnant-woman"
      mood="calm"
      toolId="affirmations"
    >
      <div className="space-y-5">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 text-center bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Star className="w-4 h-4 text-amber-500" />
              <span className="text-lg font-bold text-amber-600">{streak.days}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Day Streak</p>
          </Card>
          <Card className="p-3 text-center bg-gradient-to-br from-rose-500/10 to-pink-500/10 border-rose-500/20">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Heart className="w-4 h-4 text-rose-500" />
              <span className="text-lg font-bold text-rose-600">{favorites.length}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Favorites</p>
          </Card>
          <Card className="p-3 text-center bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
            <div className="flex items-center justify-center gap-2 mb-1">
              {timeOfDay === "morning" ? (
                <Sun className="w-4 h-4 text-violet-500" />
              ) : (
                <Moon className="w-4 h-4 text-violet-500" />
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">{timeOfDay === "morning" ? "Good Morning" : "Good Evening"}</p>
          </Card>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="shrink-0 rounded-full text-xs"
          >
            All
          </Button>
          {affirmationCategories.map((cat) => (
            <Button
              key={cat.name}
              variant={selectedCategory === cat.name ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.name)}
              className="shrink-0 rounded-full text-xs gap-1"
            >
              <span>{cat.icon}</span>
              {cat.name}
            </Button>
          ))}
        </div>

        {!showFavorites && (
          <>
            {/* Main Affirmation Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-gradient-to-br from-primary/10 via-pink-100/50 to-purple-100/50 dark:from-primary/20 dark:via-pink-900/20 dark:to-purple-900/20 border-primary/20 overflow-hidden">
                  <CardContent className="py-10 px-6 relative">
                    <Quote className="absolute top-4 left-4 w-8 h-8 text-primary/20" />
                    <Quote className="absolute bottom-4 right-4 w-8 h-8 text-primary/20 rotate-180" />
                    
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                      className="mb-6 text-center"
                    >
                      <Sparkles className="h-10 w-10 text-primary mx-auto" />
                    </motion.div>
                    <p className="text-xl md:text-2xl text-center font-medium leading-relaxed">
                      "{currentAffirmations[currentIndex]}"
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex justify-center gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={nextAffirmation} size="lg" className="gap-2 rounded-full px-6">
                  <RefreshCw className="h-4 w-4" />
                  Next
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={toggleFavorite} variant="outline" size="icon" className="rounded-full h-11 w-11">
                  <Heart className={`h-5 w-5 transition-colors ${favorites.includes(currentIndex) ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={shareAffirmation} variant="outline" size="icon" className="rounded-full h-11 w-11">
                  <Share2 className="h-5 w-5" />
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={copyAffirmation} variant="outline" size="icon" className="rounded-full h-11 w-11">
                  {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                </Button>
              </motion.div>
            </div>

            <div className="text-center text-xs text-muted-foreground">
              {currentIndex + 1} of {currentAffirmations.length}
            </div>
          </>
        )}

        {/* Favorites Toggle */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => setShowFavorites(!showFavorites)}
            className="gap-2 rounded-full"
          >
            <Heart className={`h-4 w-4 ${showFavorites ? "fill-red-500 text-red-500" : ""}`} />
            {showFavorites ? "Show All" : "My Favorites"} ({favorites.length})
          </Button>
        </div>

        {/* Favorites List */}
        {showFavorites && (
          <div className="space-y-3">
            {favorites.length === 0 ? (
              <Card className="bg-muted/50">
                <CardContent className="py-8 text-center">
                  <Heart className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground text-sm">
                    No favorites yet! Tap the heart icon to save affirmations you love.
                  </p>
                </CardContent>
              </Card>
            ) : (
              favorites.map((idx, i) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20">
                    <CardContent className="py-4">
                      <p className="text-center font-medium">"{allAffirmations[idx]}"</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Morning Routine Guide */}
        <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200/50">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            Daily Affirmation Ritual
          </h4>
          <div className="space-y-2">
            {morningRoutine.map((step, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-700">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">{step}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Tip Card */}
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground text-center">
              💡 <strong>Tip:</strong> Read your affirmations out loud each morning and before bed. 
              Place your hands on your belly and speak directly to your baby for an even more powerful connection.
            </p>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
};

export default Affirmations;