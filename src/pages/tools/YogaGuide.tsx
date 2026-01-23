import { useState } from "react";
import { ToolFrame } from "@/components/ToolFrame";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Flower2, Clock, AlertTriangle, CheckCircle, Play, Info } from "lucide-react";
import { motion } from "framer-motion";

interface YogaPose {
  id: string;
  name: string;
  description: string;
  benefits: string;
  duration: string;
  trimester: number[];
  caution?: boolean;
  image?: string;
}

const YogaGuide = () => {
  const [selectedTrimester, setSelectedTrimester] = useState("1");

  const poses: YogaPose[] = [
    // Safe for all trimesters
    { 
      id: "cat-cow", 
      name: "Cat-Cow Stretch", 
      description: "On all fours, alternate between arching and rounding your back with breath.", 
      benefits: "Relieves back pain, improves spine flexibility", 
      duration: "5-10 reps", 
      trimester: [1, 2, 3] 
    },
    { 
      id: "child", 
      name: "Child's Pose (Modified)", 
      description: "Kneel with knees wide, reach arms forward, rest forehead down.", 
      benefits: "Relaxation, gentle hip stretch, calms the mind", 
      duration: "1-3 min", 
      trimester: [1, 2, 3] 
    },
    { 
      id: "butterfly", 
      name: "Butterfly Pose", 
      description: "Sit with soles of feet together, gently press knees toward floor.", 
      benefits: "Opens hips, prepares for labor, improves circulation", 
      duration: "1-2 min", 
      trimester: [1, 2, 3] 
    },
    { 
      id: "warrior2", 
      name: "Warrior II", 
      description: "Wide stance, front knee bent, arms extended, gaze over front hand.", 
      benefits: "Builds leg strength, opens hips, improves balance", 
      duration: "30s-1 min", 
      trimester: [1, 2, 3] 
    },
    { 
      id: "side-stretch", 
      name: "Side Stretch", 
      description: "Standing or seated, reach one arm overhead and lean to the side.", 
      benefits: "Stretches sides, creates space for baby, improves breathing", 
      duration: "30s each side", 
      trimester: [1, 2, 3] 
    },
    { 
      id: "legs-up", 
      name: "Legs Up the Wall", 
      description: "Lie on side near wall, swing legs up, rest with back on floor.", 
      benefits: "Reduces swelling, relieves tired legs, promotes relaxation", 
      duration: "5-10 min", 
      trimester: [1, 2, 3] 
    },
    { 
      id: "pelvic-tilt", 
      name: "Pelvic Tilts", 
      description: "On all fours or standing, gently tuck and release pelvis.", 
      benefits: "Strengthens core, eases back pain, prepares for labor", 
      duration: "10-15 reps", 
      trimester: [1, 2, 3] 
    },
    // First/Second trimester
    { 
      id: "standing-forward", 
      name: "Standing Forward Fold", 
      description: "Feet hip-width apart, hinge at hips, let upper body hang.", 
      benefits: "Stretches hamstrings, relieves tension", 
      duration: "30s-1 min", 
      trimester: [1, 2], 
      caution: true 
    },
    { 
      id: "triangle", 
      name: "Triangle Pose", 
      description: "Wide stance, extend one arm down to shin, other arm up.", 
      benefits: "Strengthens legs, opens chest, stretches sides", 
      duration: "30s each side", 
      trimester: [1, 2] 
    },
    // Second/Third trimester
    { 
      id: "hip-circles", 
      name: "Hip Circles", 
      description: "On hands and knees, make slow circles with hips.", 
      benefits: "Loosens pelvis, relieves pressure, prepares for birth", 
      duration: "1-2 min", 
      trimester: [2, 3] 
    },
    { 
      id: "squat", 
      name: "Supported Squat", 
      description: "Wide stance, lower into deep squat with support.", 
      benefits: "Opens pelvis, strengthens legs, optimal birth position", 
      duration: "1-3 min", 
      trimester: [2, 3] 
    },
    { 
      id: "savasana-side", 
      name: "Side-Lying Relaxation", 
      description: "Lie on left side with pillow between knees.", 
      benefits: "Deep relaxation, optimal blood flow, comfortable rest", 
      duration: "5-10 min", 
      trimester: [2, 3] 
    },
  ];

  const getPosesForTrimester = (tri: string) => 
    poses.filter((p) => p.trimester.includes(parseInt(tri)));

  const trimesterInfo: Record<string, { title: string; tip: string }> = {
    "1": {
      title: "First Trimester (Weeks 1-12)",
      tip: "Focus on gentle movements. Avoid overheating and lying flat on your back for long periods. Listen to your body - nausea and fatigue are normal."
    },
    "2": {
      title: "Second Trimester (Weeks 13-27)",
      tip: "Your energy returns! Great time for building strength. Modify poses as your belly grows. Stay hydrated and avoid deep twists."
    },
    "3": {
      title: "Third Trimester (Weeks 28-40)",
      tip: "Focus on hip openers and relaxation. Use props for support. Practice breathing techniques for labor. Avoid inversions and lying on back."
    }
  };

  return (
    <ToolFrame
      title="Prenatal Yoga Guide"
      subtitle="Safe and beneficial poses for each trimester"
      icon={Flower2}
      mood="calm"
    >
      <div className="space-y-6">
        <Tabs value={selectedTrimester} onValueChange={setSelectedTrimester}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="1">1st Tri</TabsTrigger>
            <TabsTrigger value="2">2nd Tri</TabsTrigger>
            <TabsTrigger value="3">3rd Tri</TabsTrigger>
          </TabsList>

          {["1", "2", "3"].map((tri) => (
            <TabsContent key={tri} value={tri} className="mt-4 space-y-4">
              <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="pt-4">
                  <h3 className="font-semibold mb-2">{trimesterInfo[tri].title}</h3>
                  <p className="text-sm text-muted-foreground">{trimesterInfo[tri].tip}</p>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {getPosesForTrimester(tri).map((pose, index) => (
                  <motion.div
                    key={pose.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={pose.caution ? "border-yellow-500/50" : ""}>
                      <CardContent className="py-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Play className="h-4 w-4 text-primary" />
                            <h3 className="font-semibold">{pose.name}</h3>
                          </div>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {pose.duration}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {pose.description}
                        </p>
                        
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-green-700 dark:text-green-400">
                            {pose.benefits}
                          </span>
                        </div>
                        
                        {pose.caution && (
                          <div className="flex items-center gap-2 mt-2 p-2 rounded bg-yellow-50 dark:bg-yellow-900/20">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm text-yellow-700 dark:text-yellow-400">
                              Modify as pregnancy progresses
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="pt-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive mb-1">Poses to Avoid During Pregnancy</p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Deep backbends (Full Wheel, Camel)</li>
                  <li>Intense twists that compress abdomen</li>
                  <li>Inversions (Headstand, Shoulderstand)</li>
                  <li>Lying flat on back (after 1st trimester)</li>
                  <li>Hot yoga or Bikram yoga</li>
                  <li>Poses that require lying on stomach</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                <strong>Safety First:</strong> Always consult your healthcare provider before starting any exercise program during pregnancy. 
                Stop immediately if you experience pain, dizziness, or shortness of breath. 
                Consider taking a prenatal yoga class with a certified instructor.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
};

export default YogaGuide;
