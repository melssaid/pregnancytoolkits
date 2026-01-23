import { useState, useEffect } from "react";
import { ToolFrame } from "@/components/ToolFrame";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, Heart, Share2, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAnalytics } from "@/hooks/useAnalytics";

const STORAGE_KEY = "favorite-affirmations";

const affirmationsList = [
  "My body knows exactly how to grow and nurture my baby.",
  "I am strong, capable, and ready for motherhood.",
  "Every day I am becoming a better version of myself.",
  "I trust my body and its wisdom.",
  "I am surrounded by love and support.",
  "My baby feels my love and peace.",
  "I embrace the changes in my body with gratitude.",
  "I am calm, relaxed, and prepared for birth.",
  "Each contraction brings me closer to meeting my baby.",
  "I release fear and welcome joy.",
  "My body was designed for this beautiful journey.",
  "I am creating life, and that is extraordinary.",
  "I breathe in peace and breathe out tension.",
  "I am patient with myself and my journey.",
  "My baby is healthy, happy, and thriving.",
  "I deserve rest and self-care.",
  "I am already a wonderful mother.",
  "I trust the timing of my pregnancy.",
  "My love for my baby grows stronger every day.",
  "I am grateful for this miracle growing inside me.",
  "I choose positive thoughts for myself and my baby.",
  "I am surrounded by a beautiful community of mothers.",
  "My body is powerful and knows what to do.",
  "I welcome this new chapter with open arms.",
  "I am exactly the mother my baby needs.",
];

const Affirmations = () => {
  const { trackAction } = useAnalytics("affirmations");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setFavorites(JSON.parse(saved));
    
    // Random start
    setCurrentIndex(Math.floor(Math.random() * affirmationsList.length));
  }, []);

  const nextAffirmation = () => {
    setCurrentIndex((prev) => (prev + 1) % affirmationsList.length);
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
    const text = affirmationsList[currentIndex];
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
    navigator.clipboard.writeText(affirmationsList[currentIndex]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    trackAction("copied");
  };

  return (
    <ToolFrame
      title="Daily Affirmations"
      subtitle="Positive thoughts for your pregnancy journey"
      icon={Sparkles}
      mood="calm"
    >
      <div className="space-y-6">
        <p className="text-center text-muted-foreground">
          Take a moment to breathe and embrace these positive words
        </p>

        {!showFavorites && (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-gradient-to-br from-primary/10 via-pink-100/50 to-purple-100/50 dark:from-primary/20 dark:via-pink-900/20 dark:to-purple-900/20 border-primary/20">
                  <CardContent className="py-12 px-6">
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                      className="mb-6"
                    >
                      <Sparkles className="h-10 w-10 text-primary mx-auto" />
                    </motion.div>
                    <p className="text-xl md:text-2xl text-center font-medium leading-relaxed">
                      "{affirmationsList[currentIndex]}"
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={nextAffirmation} size="lg" className="gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Next
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={toggleFavorite}
                  variant="outline"
                  size="lg"
                  className="gap-2"
                >
                  <Heart
                    className={`h-5 w-5 transition-colors ${
                      favorites.includes(currentIndex) ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={shareAffirmation} variant="outline" size="lg">
                  <Share2 className="h-5 w-5" />
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={copyAffirmation} variant="outline" size="lg">
                  {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                </Button>
              </motion.div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              {currentIndex + 1} of {affirmationsList.length}
            </div>
          </>
        )}

        {/* Favorites Toggle */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => setShowFavorites(!showFavorites)}
            className="gap-2"
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
                  <p className="text-muted-foreground">
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
                      <p className="text-center font-medium">
                        "{affirmationsList[idx]}"
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        )}

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
