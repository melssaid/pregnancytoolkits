import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Activity, Sparkles, Play, Pause, RotateCcw, Trophy, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToolFrame } from "@/components/ToolFrame";
import MedicalDisclaimer from "@/components/compliance/MedicalDisclaimer";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { useSettings } from "@/hooks/useSettings";
import { safeParseLocalStorage, safeSaveToLocalStorage } from "@/lib/safeStorage";

interface ExerciseStats {
  totalSessions: number;
  totalContractions: number;
  streak: number;
  lastSession: string;
}

const AIPelvicFloor = () => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { streamChat, isLoading } = usePregnancyAI();
  
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [isExercising, setIsExercising] = useState(false);
  const [phase, setPhase] = useState<"squeeze" | "hold" | "release" | "rest">("squeeze");
  const [timer, setTimer] = useState(0);
  const [reps, setReps] = useState(0);
  const [targetReps, setTargetReps] = useState(10);
  const [holdTime, setHoldTime] = useState(5);
  const [difficulty, setDifficulty] = useState("beginner");
  const [response, setResponse] = useState("");
  const [stats, setStats] = useState<ExerciseStats>(() => {
    return safeParseLocalStorage<ExerciseStats>("pelvic-floor-stats", {
      totalSessions: 0,
      totalContractions: 0,
      streak: 0,
      lastSession: ""
    });
  });

  const phaseDurations = {
    squeeze: 2,
    hold: holdTime,
    release: 2,
    rest: 3
  };

  const phaseColors = {
    squeeze: "from-rose-500 to-pink-600",
    hold: "from-violet-500 to-purple-600",
    release: "from-cyan-500 to-teal-600",
    rest: "from-gray-400 to-gray-500"
  };

  const phaseInstructions = {
    squeeze: "🔼 SQUEEZE - Tighten your pelvic floor",
    hold: "⏸️ HOLD - Keep muscles engaged",
    release: "🔽 RELEASE - Slowly relax",
    rest: "😌 REST - Breathe normally"
  };

  const runExerciseCycle = useCallback(() => {
    if (!isExercising) return;

    const phases: Array<"squeeze" | "hold" | "release" | "rest"> = ["squeeze", "hold", "release", "rest"];
    let currentPhaseIndex = 0;
    let phaseTimer = 0;

    const interval = setInterval(() => {
      if (!isExercising) {
        clearInterval(interval);
        return;
      }

      const currentPhase = phases[currentPhaseIndex];
      const phaseDuration = phaseDurations[currentPhase];

      if (phaseTimer >= phaseDuration) {
        currentPhaseIndex++;
        phaseTimer = 0;

        if (currentPhaseIndex >= phases.length) {
          currentPhaseIndex = 0;
          setReps(prev => {
            const newReps = prev + 1;
            if (newReps >= targetReps) {
              setIsExercising(false);
              completeSession();
            }
            return newReps;
          });
        }

        setPhase(phases[currentPhaseIndex]);
      }

      phaseTimer++;
      setTimer(phaseTimer);
    }, 1000);

    return () => clearInterval(interval);
  }, [isExercising, targetReps, holdTime]);

  useEffect(() => {
    if (isExercising) {
      const cleanup = runExerciseCycle();
      return cleanup;
    }
  }, [isExercising, runExerciseCycle]);

  const completeSession = () => {
    const today = new Date().toDateString();
    const newStats = {
      totalSessions: stats.totalSessions + 1,
      totalContractions: stats.totalContractions + targetReps,
      streak: stats.lastSession === new Date(Date.now() - 86400000).toDateString() 
        ? stats.streak + 1 
        : stats.lastSession === today ? stats.streak : 1,
      lastSession: today
    };
    setStats(newStats);
    safeSaveToLocalStorage("pelvic-floor-stats", newStats);
  };

  const startExercise = () => {
    setReps(0);
    setTimer(0);
    setPhase("squeeze");
    setIsExercising(true);
  };

  const stopExercise = () => {
    setIsExercising(false);
  };

  const getPersonalizedPlan = async () => {
    const prompt = `As a pelvic floor physiotherapist specializing in pregnancy, create a personalized Kegel exercise plan:

**Pregnancy Week:** ${settings.pregnancyWeek || 20}
**Current Level:** ${difficulty}
**Sessions Completed:** ${stats.totalSessions}
**Total Contractions:** ${stats.totalContractions}

Provide:
1. **Why Pelvic Floor Matters** - Benefits during pregnancy and birth
2. **Proper Technique** - Step-by-step instructions to find the right muscles
3. **Weekly Progression Plan** - How to gradually increase difficulty
4. **Exercise Variations** - Beyond basic Kegels (elevator, quick flicks, etc.)
5. **When to Exercise** - Best times during the day
6. **Warning Signs** - When to stop or consult a doctor
7. **Postpartum Continuation** - Importance after birth

Include breathing techniques and common mistakes to avoid.`;

    setResponse("");
    await streamChat({
      type: "pregnancy-assistant",
      messages: [{ role: "user", content: prompt }],
      context: { week: Number(settings.pregnancyWeek) || 20 },
      onDelta: (text) => setResponse((prev) => prev + text),
      onDone: () => {},
    });
  };

  if (!disclaimerAccepted) {
    return (
      <MedicalDisclaimer
        onAccept={() => setDisclaimerAccepted(true)}
        toolName="AI Pelvic Floor Coach"
      />
    );
  }

  return (
    <ToolFrame
      title="Pelvic Floor Coach"
      icon={Activity}
      mood="empowering"
    >
      <div className="space-y-6">
        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 text-center">
            <Trophy className="w-5 h-5 text-amber-500 mx-auto mb-1" />
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <div className="text-xs text-muted-foreground">Sessions</div>
          </Card>
          <Card className="p-3 text-center">
            <Activity className="w-5 h-5 text-rose-500 mx-auto mb-1" />
            <div className="text-2xl font-bold">{stats.totalContractions}</div>
            <div className="text-xs text-muted-foreground">Contractions</div>
          </Card>
          <Card className="p-3 text-center">
            <Timer className="w-5 h-5 text-violet-500 mx-auto mb-1" />
            <div className="text-2xl font-bold">{stats.streak}</div>
            <div className="text-xs text-muted-foreground">Day Streak</div>
          </Card>
        </div>

        {/* Exercise Visualization */}
        <Card className={`p-6 bg-gradient-to-br ${phaseColors[phase]} text-white text-center`}>
          <div className="text-6xl mb-4">
            {phase === "squeeze" && "🔼"}
            {phase === "hold" && "⏸️"}
            {phase === "release" && "🔽"}
            {phase === "rest" && "😌"}
          </div>
          <h2 className="text-2xl font-bold uppercase mb-2">{phase}</h2>
          <p className="text-white/80 mb-4">{phaseInstructions[phase]}</p>
          
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-4xl font-mono">{timer}s</div>
            <div className="text-lg">Rep {reps}/{targetReps}</div>
          </div>

          <Progress value={(reps / targetReps) * 100} className="h-3 bg-white/30" />
        </Card>

        {/* Controls */}
        <div className="flex gap-3">
          {!isExercising ? (
            <Button 
              onClick={startExercise} 
              className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600"
              size="lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Exercise
            </Button>
          ) : (
            <Button 
              onClick={stopExercise} 
              variant="destructive"
              className="flex-1"
              size="lg"
            >
              <Pause className="w-5 h-5 mr-2" />
              Stop
            </Button>
          )}
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              setReps(0);
              setTimer(0);
              setPhase("squeeze");
            }}
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Difficulty</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">🌱 Beginner</SelectItem>
                <SelectItem value="intermediate">🌿 Intermediate</SelectItem>
                <SelectItem value="advanced">🌳 Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Hold Time</Label>
            <Select value={holdTime.toString()} onValueChange={(v) => setHoldTime(parseInt(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 seconds</SelectItem>
                <SelectItem value="5">5 seconds</SelectItem>
                <SelectItem value="8">8 seconds</SelectItem>
                <SelectItem value="10">10 seconds</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Video Tutorial */}
        <Card className="p-4">
          <h3 className="font-medium mb-3">📹 How to Do Kegels Correctly</h3>
          <div className="aspect-video rounded-lg overflow-hidden">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/F1D9TcJa3d4"
              title="Kegel Exercises Tutorial"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </Card>

        {/* AI Plan */}
        <Button
          onClick={getPersonalizedPlan}
          disabled={isLoading}
          variant="outline"
          className="w-full"
          size="lg"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {isLoading ? "Creating Plan..." : "Get AI Personalized Plan"}
        </Button>

        {response && (
          <Card className="p-4 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30">
            <MarkdownRenderer content={response} isLoading={isLoading} />
          </Card>
        )}
      </div>
    </ToolFrame>
  );
};

export default AIPelvicFloor;
