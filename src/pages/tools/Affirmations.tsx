import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, Heart, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Affirmations = () => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);

  const affirmations = [
    "affirmation1", "affirmation2", "affirmation3", "affirmation4", "affirmation5",
    "affirmation6", "affirmation7", "affirmation8", "affirmation9", "affirmation10",
    "affirmation11", "affirmation12", "affirmation13", "affirmation14", "affirmation15",
    "affirmation16", "affirmation17", "affirmation18", "affirmation19", "affirmation20",
    "affirmation21", "affirmation22", "affirmation23", "affirmation24", "affirmation25",
  ];

  useEffect(() => {
    const saved = localStorage.getItem("favoriteAffirmations");
    if (saved) setFavorites(JSON.parse(saved));
    
    // Random start
    setCurrentIndex(Math.floor(Math.random() * affirmations.length));
  }, []);

  const nextAffirmation = () => {
    setCurrentIndex((prev) => (prev + 1) % affirmations.length);
  };

  const toggleFavorite = () => {
    const updated = favorites.includes(currentIndex)
      ? favorites.filter((i) => i !== currentIndex)
      : [...favorites, currentIndex];
    setFavorites(updated);
    localStorage.setItem("favoriteAffirmations", JSON.stringify(updated));
  };

  const shareAffirmation = async () => {
    const text = t(`affirmationsPage.list.${affirmations[currentIndex]}`);
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (e) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  const displayList = showFavorites
    ? favorites.map((i) => affirmations[i])
    : [affirmations[currentIndex]];

  return (
    <Layout title={t('tools.affirmations.title')} showBack>
      <div className="container max-w-2xl py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-center text-muted-foreground mb-8">
            {t('affirmationsPage.subtitle')}
          </p>

          {!showFavorites && (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="mb-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                  <CardContent className="py-12 px-6">
                    <Sparkles className="h-8 w-8 text-primary mx-auto mb-6" />
                    <p className="text-xl md:text-2xl text-center font-medium leading-relaxed">
                      "{t(`affirmationsPage.list.${affirmations[currentIndex]}`)}"
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          )}

          {!showFavorites && (
            <div className="flex justify-center gap-3 mb-8">
              <Button onClick={nextAffirmation} size="lg">
                <RefreshCw className="h-5 w-5 me-2" />
                {t('affirmationsPage.next')}
              </Button>
              <Button
                onClick={toggleFavorite}
                variant="outline"
                size="lg"
              >
                <Heart
                  className={`h-5 w-5 ${
                    favorites.includes(currentIndex) ? "fill-red-500 text-red-500" : ""
                  }`}
                />
              </Button>
              <Button onClick={shareAffirmation} variant="outline" size="lg">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Favorites Toggle */}
          <div className="text-center mb-6">
            <Button
              variant="ghost"
              onClick={() => setShowFavorites(!showFavorites)}
            >
              <Heart className="h-4 w-4 me-2" />
              {showFavorites
                ? t('affirmationsPage.showAll')
                : t('affirmationsPage.showFavorites')} ({favorites.length})
            </Button>
          </div>

          {/* Favorites List */}
          {showFavorites && (
            <div className="space-y-3">
              {favorites.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {t('affirmationsPage.noFavorites')}
                </p>
              ) : (
                favorites.map((idx, i) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card>
                      <CardContent className="py-4">
                        <p className="text-center">
                          "{t(`affirmationsPage.list.${affirmations[idx]}`)}"
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          )}

          <Card className="mt-8 bg-muted/50">
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground text-center">
                {t('affirmationsPage.tip')}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Affirmations;
