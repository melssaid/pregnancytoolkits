import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Heart, Sparkles, Baby, Flower2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { addDays, format, subDays, differenceInDays } from "date-fns";
import ToolFrame from "@/components/ToolFrame";
import MotivationalQuote from "@/components/MotivationalQuote";
import useAnalytics from "@/hooks/useAnalytics";

export default function OvulationCalculator() {
  const { trackAction } = useAnalytics("ovulation-calculator");
  const [lastPeriod, setLastPeriod] = useState("");
  const [cycleLength, setCycleLength] = useState("28");
  const [result, setResult] = useState<{
    ovulationDate: Date;
    fertileStart: Date;
    fertileEnd: Date;
    nextPeriod: Date;
    daysUntilOvulation: number;
  } | null>(null);

  const calculate = () => {
    if (!lastPeriod) return;

    const lmpDate = new Date(lastPeriod);
    const cycle = parseInt(cycleLength);
    
    const ovulationDate = addDays(lmpDate, cycle - 14);
    const fertileStart = subDays(ovulationDate, 5);
    const fertileEnd = addDays(ovulationDate, 1);
    const nextPeriod = addDays(lmpDate, cycle);
    const daysUntilOvulation = differenceInDays(ovulationDate, new Date());

    setResult({
      ovulationDate,
      fertileStart,
      fertileEnd,
      nextPeriod,
      daysUntilOvulation,
    });

    trackAction("calculate", { cycleLength: cycle });
  };

  return (
    <ToolFrame
      title="Ovulation Calculator"
      subtitle="Find your most fertile days"
      icon={Calendar}
      mood="nurturing"
    >
      <div className="space-y-6">
        {/* Motivational Quote */}
        <MotivationalQuote variant="banner" />

        {/* Input Card */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-rose-50/30">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/10 to-pink-100">
                <Flower2 className="h-5 w-5 text-primary" />
              </div>
              Calculate Your Fertile Window
            </CardTitle>
            <CardDescription className="text-base">
              Enter your cycle details to discover your best days ✨
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="lastPeriod" className="text-sm font-medium">
                First Day of Last Period
              </Label>
              <Input
                id="lastPeriod"
                type="date"
                value={lastPeriod}
                onChange={(e) => setLastPeriod(e.target.value)}
                className="h-12 text-base border-2 border-primary/20 focus:border-primary/50 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cycleLength" className="text-sm font-medium">
                Average Cycle Length (days)
              </Label>
              <Input
                id="cycleLength"
                type="number"
                min="21"
                max="45"
                value={cycleLength}
                onChange={(e) => setCycleLength(e.target.value)}
                className="h-12 text-base border-2 border-primary/20 focus:border-primary/50 rounded-xl"
              />
              <p className="text-xs text-muted-foreground">
                Most cycles range from 21-35 days
              </p>
            </div>

            <Button 
              onClick={calculate} 
              className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Heart className="h-5 w-5 mr-2" />
              Calculate Ovulation
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Countdown Card */}
            {result.daysUntilOvulation > 0 && (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-pink-500 to-rose-400 p-6 text-white shadow-xl"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-10 -right-10 opacity-20"
                >
                  <Sparkles className="h-40 w-40" />
                </motion.div>
                <div className="relative z-10 text-center">
                  <p className="text-white/80 text-sm font-medium mb-1">Days Until Ovulation</p>
                  <p className="text-5xl font-bold mb-2">{result.daysUntilOvulation}</p>
                  <p className="text-white/90">Get ready for your fertile window! 🌸</p>
                </div>
              </motion.div>
            )}

            {/* Key Dates */}
            <div className="grid gap-4 sm:grid-cols-2">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl bg-gradient-to-br from-primary/10 to-pink-50 p-5 border border-primary/20 shadow-md"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-5 w-5 text-primary" />
                  <p className="text-sm font-medium text-muted-foreground">Ovulation Day</p>
                </div>
                <p className="text-2xl font-bold text-primary">
                  {format(result.ovulationDate, "MMM d")}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Peak fertility day
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 p-5 border border-purple-200/50 shadow-md"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  <p className="text-sm font-medium text-muted-foreground">Next Period</p>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {format(result.nextPeriod, "MMM d")}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Expected start
                </p>
              </motion.div>
            </div>

            {/* Fertile Window */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 p-6 border border-green-200/50 shadow-md"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-green-100">
                  <Baby className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-green-700 text-lg">Fertile Window</p>
                  <p className="text-sm text-green-600/80">Your best days for conception</p>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-4 py-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Start</p>
                  <p className="text-xl font-bold text-green-700">{format(result.fertileStart, "MMM d")}</p>
                </div>
                <div className="flex items-center gap-1 text-green-400">
                  <span>→</span>
                  <Heart className="h-4 w-4 animate-pulse" />
                  <span>→</span>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">End</p>
                  <p className="text-xl font-bold text-green-700">{format(result.fertileEnd, "MMM d")}</p>
                </div>
              </div>
              
              <p className="text-sm text-center text-green-600/80 mt-2">
                6 days of peak fertility 💕
              </p>
            </motion.div>

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="rounded-xl bg-amber-50/80 border border-amber-200/50 p-4"
            >
              <p className="text-sm text-amber-800 leading-relaxed">
                <span className="font-semibold">💡 Tip:</span> For the best chances, 
                try to be intimate during your fertile window, especially 1-2 days before ovulation.
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* Info Footer */}
        <div className="flex items-start gap-3 rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
          <Sparkles className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary/50" />
          <p>
            This calculator provides estimates based on average cycle patterns. 
            Individual cycles may vary. Consider using ovulation predictor kits 
            for more accuracy.
          </p>
        </div>
      </div>
    </ToolFrame>
  );
}
