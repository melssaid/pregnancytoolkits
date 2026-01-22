import { useState } from "react";
import { motion } from "framer-motion";
import { Dumbbell, Info, ChevronDown, ChevronUp } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Exercise {
  name: string;
  description: string;
  benefits: string;
  cautions?: string;
}

interface TrimesterData {
  title: string;
  overview: string;
  recommended: Exercise[];
  avoid: string[];
  tips: string[];
}

const exerciseData: Record<string, TrimesterData> = {
  first: {
    title: "First Trimester (Weeks 1-12)",
    overview: "If you were active before pregnancy, you can usually continue your routine with modifications. Listen to your body and adjust for fatigue and nausea.",
    recommended: [
      { name: "Walking", description: "30 minutes of brisk walking most days", benefits: "Low impact, improves cardiovascular health", cautions: "Stay hydrated, avoid overheating" },
      { name: "Swimming", description: "Laps or water aerobics", benefits: "Supports body weight, reduces swelling, cool exercise option", cautions: "Avoid diving and hot tubs" },
      { name: "Prenatal Yoga", description: "Gentle stretching and breathing", benefits: "Flexibility, stress relief, prepares for labor", cautions: "Avoid hot yoga and deep twists" },
      { name: "Stationary Cycling", description: "Low-resistance cycling", benefits: "Cardiovascular without balance concerns", cautions: "Adjust as belly grows" },
      { name: "Light Strength Training", description: "Moderate weights, higher reps", benefits: "Maintains muscle tone, supports joints", cautions: "Avoid lying flat on back after first trimester" },
    ],
    avoid: [
      "Contact sports (basketball, soccer, hockey)",
      "Activities with fall risk (skiing, horseback riding)",
      "Hot yoga or hot pilates",
      "Scuba diving",
      "Heavy lifting or straining",
    ],
    tips: [
      "Aim for 150 minutes of moderate activity per week",
      "Stay well hydrated before, during, and after exercise",
      "Wear supportive shoes and a supportive bra",
      "Stop if you feel dizzy, short of breath, or have pain",
    ],
  },
  second: {
    title: "Second Trimester (Weeks 13-27)",
    overview: "Often called the 'golden trimester' as energy returns. Your belly is growing, so focus on balance and core stability.",
    recommended: [
      { name: "Prenatal Pilates", description: "Modified core exercises", benefits: "Strengthens pelvic floor and core", cautions: "Avoid exercises flat on back" },
      { name: "Swimming", description: "Water aerobics and swimming", benefits: "Buoyancy supports growing belly", cautions: "Avoid diving" },
      { name: "Walking", description: "Continue or increase duration", benefits: "Maintains fitness, reduces constipation", cautions: "Watch for round ligament pain" },
      { name: "Low-impact Aerobics", description: "Prenatal aerobics classes", benefits: "Cardiovascular health, mood boost", cautions: "Keep one foot on ground" },
      { name: "Kegel Exercises", description: "Pelvic floor strengthening", benefits: "Prevents incontinence, aids delivery", cautions: "Don't overdo it" },
    ],
    avoid: [
      "Exercises lying flat on back (after 16 weeks)",
      "Activities with abdominal trauma risk",
      "High-altitude exercise (above 6,000 ft)",
      "Exercises requiring balance on one leg",
      "Jumping or jarring movements",
    ],
    tips: [
      "Use a pregnancy support belt if needed",
      "Modify exercises as your center of gravity shifts",
      "Take breaks and don't push through pain",
      "Consider prenatal exercise classes for proper guidance",
    ],
  },
  third: {
    title: "Third Trimester (Weeks 28-40)",
    overview: "Focus on gentle movement and preparation for labor. Listen to your body—it's working hard growing your baby.",
    recommended: [
      { name: "Walking", description: "Shorter, more frequent walks", benefits: "Helps baby descend, maintains energy", cautions: "Stay close to home as due date nears" },
      { name: "Swimming", description: "Gentle swimming or floating", benefits: "Relieves pressure and swelling", cautions: "Be careful entering/exiting pool" },
      { name: "Prenatal Yoga", description: "Focus on breathing and stretching", benefits: "Prepares for labor, reduces anxiety", cautions: "Avoid inversions and deep stretches" },
      { name: "Pelvic Tilts", description: "On hands and knees", benefits: "Relieves back pain, optimal baby positioning", cautions: "Move slowly and gently" },
      { name: "Squats", description: "Wall-supported squats", benefits: "Opens pelvis, strengthens legs for labor", cautions: "Use support if needed" },
    ],
    avoid: [
      "Any exercise that feels uncomfortable",
      "Activities with fall or impact risk",
      "Exercises that cause shortness of breath",
      "Heavy lifting",
      "Lying flat on back",
    ],
    tips: [
      "Focus on breathing exercises for labor preparation",
      "Do pelvic floor exercises regularly",
      "Rest when you need to—this is not the time to push limits",
      "Stay active to help with labor and recovery",
    ],
  },
};

export default function ExerciseGuide() {
  const [openExercise, setOpenExercise] = useState<string | null>(null);

  return (
    <Layout title="Pregnancy Exercise Guide" showBack>
      <div className="container py-8">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-primary" />
                  Safe Exercise by Trimester
                </CardTitle>
                <CardDescription>
                  Guidelines for staying active throughout your pregnancy
                </CardDescription>
              </CardHeader>
            </Card>

            <Tabs defaultValue="first">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="first">1st Trimester</TabsTrigger>
                <TabsTrigger value="second">2nd Trimester</TabsTrigger>
                <TabsTrigger value="third">3rd Trimester</TabsTrigger>
              </TabsList>

              {Object.entries(exerciseData).map(([key, data]) => (
                <TabsContent key={key} value={key} className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{data.title}</CardTitle>
                      <CardDescription>{data.overview}</CardDescription>
                    </CardHeader>
                  </Card>

                  {/* Recommended Exercises */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base text-success">Recommended Exercises</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {data.recommended.map((exercise) => (
                        <Collapsible
                          key={exercise.name}
                          open={openExercise === `${key}-${exercise.name}`}
                          onOpenChange={(open) =>
                            setOpenExercise(open ? `${key}-${exercise.name}` : null)
                          }
                        >
                          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                            <span className="font-medium text-foreground">{exercise.name}</span>
                            {openExercise === `${key}-${exercise.name}` ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </CollapsibleTrigger>
                          <CollapsibleContent className="px-3 pb-3">
                            <div className="pt-3 space-y-2 text-sm">
                              <p className="text-muted-foreground">{exercise.description}</p>
                              <p>
                                <span className="font-medium text-success">Benefits:</span>{" "}
                                <span className="text-muted-foreground">{exercise.benefits}</span>
                              </p>
                              {exercise.cautions && (
                                <p>
                                  <span className="font-medium text-warning">Note:</span>{" "}
                                  <span className="text-muted-foreground">{exercise.cautions}</span>
                                </p>
                              )}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Exercises to Avoid */}
                  <Card className="border-destructive/20 bg-destructive/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base text-destructive">Avoid These Activities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {data.avoid.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="text-destructive">✕</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Tips */}
                  <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base text-primary">Tips for This Trimester</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {data.tips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="text-primary">✓</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>

            <div className="mt-6 flex items-start gap-3 rounded-lg bg-muted p-4">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                Always consult your healthcare provider before starting or continuing 
                an exercise program during pregnancy, especially if you have any 
                complications or high-risk conditions.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
