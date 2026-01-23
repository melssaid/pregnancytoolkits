import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wind, Play, Pause, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type BreathingPattern = {
  id: string;
  nameKey: string;
  descKey: string;
  inhale: number;
  hold: number;
  exhale: number;
  holdAfter: number;
  cycles: number;
};

const patterns: BreathingPattern[] = [
  { id: "relaxing", nameKey: "relaxing", descKey: "relaxingDesc", inhale: 4, hold: 7, exhale: 8, holdAfter: 0, cycles: 4 },
  { id: "box", nameKey: "box", descKey: "boxDesc", inhale: 4, hold: 4, exhale: 4, holdAfter: 4, cycles: 4 },
  { id: "calming", nameKey: "calming", descKey: "calmingDesc", inhale: 4, hold: 0, exhale: 6, holdAfter: 0, cycles: 6 },
  { id: "energizing", nameKey: "energizing", descKey: "energizingDesc", inhale: 6, hold: 0, exhale: 2, holdAfter: 0, cycles: 10 },
  { id: "labor", nameKey: "labor", descKey: "laborDesc", inhale: 4, hold: 0, exhale: 8, holdAfter: 0, cycles: 10 },
];

const BreathingExercises = () => {
  const { t } = useTranslation();
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(patterns[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale" | "holdAfter">("inhale");
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startExercise = () => {
    setIsRunning(true);
    setPhase("inhale");
    setTimeLeft(selectedPattern.inhale);
    setCurrentCycle(1);
    runTimer("inhale", selectedPattern.inhale, 1);
  };

  const runTimer = (currentPhase: string, time: number, cycle: number) => {
    if (timerRef.current) clearInterval(timerRef.current);

    let remaining = time;
    setTimeLeft(remaining);
    setPhase(currentPhase as any);

    timerRef.current = setInterval(() => {
      remaining -= 1;
      setTimeLeft(remaining);

      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        nextPhase(currentPhase, cycle);
      }
    }, 1000);
  };

  const nextPhase = (currentPhase: string, cycle: number) => {
    const p = selectedPattern;
    
    if (currentPhase === "inhale" && p.hold > 0) {
      runTimer("hold", p.hold, cycle);
    } else if (currentPhase === "inhale" || currentPhase === "hold") {
      runTimer("exhale", p.exhale, cycle);
    } else if (currentPhase === "exhale" && p.holdAfter > 0) {
      runTimer("holdAfter", p.holdAfter, cycle);
    } else {
      // End of cycle
      if (cycle < p.cycles) {
        setCurrentCycle(cycle + 1);
        runTimer("inhale", p.inhale, cycle + 1);
      } else {
        // Done
        setIsRunning(false);
        setPhase("inhale");
      }
    }
  };

  const stopExercise = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    setPhase("inhale");
    setTimeLeft(0);
    setCurrentCycle(1);
  };

  const getPhaseText = () => {
    switch (phase) {
      case "inhale": return t('breathingPage.inhale');
      case "hold": return t('breathingPage.hold');
      case "exhale": return t('breathingPage.exhale');
      case "holdAfter": return t('breathingPage.hold');
    }
  };

  const getCircleScale = () => {
    if (phase === "inhale") return 1.3;
    if (phase === "exhale") return 0.8;
    return 1;
  };

  const patternEmojis: Record<string, string> = {
    relaxing: "😌",
    box: "📦",
    calming: "🧘",
    energizing: "⚡",
    labor: "👶",
  };

  return (
    <Layout title={t('tools.breathingExercises.title')} showBack>
      <div className="container max-w-2xl py-6 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Pattern Selection */}
          <div>
            <h2 className="text-base font-semibold mb-3 text-foreground">{t('breathingPage.selectPattern')}</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
              {patterns.map((pattern) => (
                <Card
                  key={pattern.id}
                  className={`cursor-pointer transition-all ${
                    selectedPattern.id === pattern.id
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border/50 hover:border-primary/30 hover:bg-muted/30"
                  } ${isRunning ? "opacity-50 pointer-events-none" : ""}`}
                  onClick={() => !isRunning && setSelectedPattern(pattern)}
                >
                  <CardContent className="p-3 text-center">
                    <span className="text-xl mb-1 block">{patternEmojis[pattern.id]}</span>
                    <p className="font-medium text-xs text-foreground leading-tight">
                      {t(`breathingPage.patterns.${pattern.nameKey}`)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Exercise Area */}
          <Card>
            <CardContent className="py-8 px-4">
              <div className="flex flex-col items-center">
                {/* Breathing Circle */}
                <motion.div
                  animate={{ scale: isRunning ? getCircleScale() : 1 }}
                  transition={{ duration: phase === "inhale" ? selectedPattern.inhale : phase === "exhale" ? selectedPattern.exhale : 0.3, ease: "easeInOut" }}
                  className="relative mb-6"
                >
                  <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center shadow-lg">
                    <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-primary/30 to-primary/50 flex items-center justify-center">
                      <div className="text-center">
                        {isRunning ? (
                          <>
                            <p className="text-4xl font-bold text-primary">{timeLeft}</p>
                            <p className="text-sm font-medium text-primary/80 mt-1">{getPhaseText()}</p>
                          </>
                        ) : (
                          <Wind className="h-10 w-10 text-primary/60" />
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Cycle Counter */}
                {isRunning && (
                  <div className="bg-secondary/50 px-4 py-2 rounded-full mb-4">
                    <p className="text-sm font-medium text-foreground">
                      {t('breathingPage.cycle')} {currentCycle}/{selectedPattern.cycles}
                    </p>
                  </div>
                )}

                {/* Pattern Info */}
                {!isRunning && (
                  <div className="text-center mb-6 max-w-xs">
                    <h3 className="font-semibold text-foreground mb-1">
                      {t(`breathingPage.patterns.${selectedPattern.nameKey}`)}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {t(`breathingPage.patterns.${selectedPattern.descKey}`)}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 text-xs">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                        {t('breathingPage.inhale')}: {selectedPattern.inhale}s
                      </span>
                      {selectedPattern.hold > 0 && (
                        <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full font-medium">
                          {t('breathingPage.hold')}: {selectedPattern.hold}s
                        </span>
                      )}
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                        {t('breathingPage.exhale')}: {selectedPattern.exhale}s
                      </span>
                      {selectedPattern.holdAfter > 0 && (
                        <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full font-medium">
                          {t('breathingPage.hold')}: {selectedPattern.holdAfter}s
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Controls */}
                <div className="flex gap-3">
                  {!isRunning ? (
                    <Button onClick={startExercise} size="lg" className="px-8">
                      <Play className="h-5 w-5 me-2" />
                      {t('common.start')}
                    </Button>
                  ) : (
                    <Button onClick={stopExercise} variant="outline" size="lg" className="px-8">
                      <RotateCcw className="h-5 w-5 me-2" />
                      {t('common.reset')}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-secondary/30 border-secondary">
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground text-center">
                {t('breathingPage.benefits')}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default BreathingExercises;
