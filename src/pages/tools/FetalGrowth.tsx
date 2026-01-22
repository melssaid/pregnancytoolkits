import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Baby, Info } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FetalData {
  week: number;
  length: string;
  weight: string;
  comparison: string;
  development: string;
}

const fetalGrowthData: FetalData[] = [
  { week: 4, length: "0.04 in", weight: "<1 g", comparison: "Poppy seed", development: "Neural tube developing" },
  { week: 5, length: "0.05 in", weight: "<1 g", comparison: "Sesame seed", development: "Heart begins to beat" },
  { week: 6, length: "0.08 in", weight: "<1 g", comparison: "Lentil", development: "Eyes and ears forming" },
  { week: 7, length: "0.3 in", weight: "<1 g", comparison: "Blueberry", development: "Arms and legs sprouting" },
  { week: 8, length: "0.6 in", weight: "1 g", comparison: "Raspberry", development: "Fingers forming" },
  { week: 9, length: "0.9 in", weight: "2 g", comparison: "Cherry", development: "Toes developing" },
  { week: 10, length: "1.2 in", weight: "4 g", comparison: "Kumquat", development: "Vital organs functioning" },
  { week: 11, length: "1.6 in", weight: "7 g", comparison: "Fig", development: "Bones hardening" },
  { week: 12, length: "2.1 in", weight: "14 g", comparison: "Lime", development: "Reflexes developing" },
  { week: 13, length: "2.9 in", weight: "23 g", comparison: "Pea pod", development: "Fingerprints forming" },
  { week: 14, length: "3.4 in", weight: "43 g", comparison: "Lemon", development: "Facial muscles working" },
  { week: 15, length: "4 in", weight: "70 g", comparison: "Apple", development: "Can sense light" },
  { week: 16, length: "4.6 in", weight: "100 g", comparison: "Avocado", development: "Skeleton forming" },
  { week: 17, length: "5.1 in", weight: "140 g", comparison: "Turnip", development: "Fat accumulating" },
  { week: 18, length: "5.6 in", weight: "190 g", comparison: "Bell pepper", development: "Ears hearing sounds" },
  { week: 19, length: "6 in", weight: "240 g", comparison: "Heirloom tomato", development: "Vernix coating forming" },
  { week: 20, length: "6.5 in", weight: "300 g", comparison: "Banana", development: "Halfway there! Swallowing" },
  { week: 21, length: "10.5 in", weight: "360 g", comparison: "Carrot", development: "Taste buds developing" },
  { week: 22, length: "10.9 in", weight: "430 g", comparison: "Papaya", development: "Eyes moving" },
  { week: 23, length: "11.4 in", weight: "500 g", comparison: "Grapefruit", development: "Hearing improving" },
  { week: 24, length: "11.8 in", weight: "600 g", comparison: "Cantaloupe", development: "Lungs developing" },
  { week: 25, length: "13.6 in", weight: "660 g", comparison: "Cauliflower", development: "Hair growing" },
  { week: 26, length: "14 in", weight: "760 g", comparison: "Lettuce", development: "Eyes opening" },
  { week: 27, length: "14.4 in", weight: "875 g", comparison: "Cabbage", development: "Sleeping and waking" },
  { week: 28, length: "14.8 in", weight: "1 kg", comparison: "Eggplant", development: "Brain developing rapidly" },
  { week: 29, length: "15.2 in", weight: "1.15 kg", comparison: "Butternut squash", development: "Kicking strongly" },
  { week: 30, length: "15.7 in", weight: "1.3 kg", comparison: "Large cabbage", development: "Red blood cells forming" },
  { week: 31, length: "16.2 in", weight: "1.5 kg", comparison: "Coconut", development: "All senses working" },
  { week: 32, length: "16.7 in", weight: "1.7 kg", comparison: "Jicama", development: "Practicing breathing" },
  { week: 33, length: "17.2 in", weight: "1.9 kg", comparison: "Pineapple", development: "Bones hardening" },
  { week: 34, length: "17.7 in", weight: "2.1 kg", comparison: "Cantaloupe", development: "Central nervous system maturing" },
  { week: 35, length: "18.2 in", weight: "2.4 kg", comparison: "Honeydew melon", development: "Kidneys fully developed" },
  { week: 36, length: "18.7 in", weight: "2.6 kg", comparison: "Romaine lettuce", development: "Downy hair shedding" },
  { week: 37, length: "19.1 in", weight: "2.9 kg", comparison: "Swiss chard", development: "Considered full term" },
  { week: 38, length: "19.6 in", weight: "3.1 kg", comparison: "Leek", development: "Organ systems ready" },
  { week: 39, length: "20 in", weight: "3.3 kg", comparison: "Mini watermelon", development: "Brain and lungs maturing" },
  { week: 40, length: "20.2 in", weight: "3.5 kg", comparison: "Small pumpkin", development: "Ready to be born!" },
];

export default function FetalGrowth() {
  const [selectedWeek, setSelectedWeek] = useState<string>("20");
  
  const currentData = fetalGrowthData.find((d) => d.week === parseInt(selectedWeek));
  const prevData = fetalGrowthData.find((d) => d.week === parseInt(selectedWeek) - 1);

  return (
    <Layout title="Fetal Growth Tracker" showBack>
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
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Track Baby's Growth
                </CardTitle>
                <CardDescription>
                  See how your baby develops week by week
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Select Week</Label>
                  <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select week" />
                    </SelectTrigger>
                    <SelectContent>
                      {fetalGrowthData.map((data) => (
                        <SelectItem key={data.week} value={data.week.toString()}>
                          Week {data.week}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {currentData && (
                  <motion.div
                    key={selectedWeek}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="rounded-xl bg-gradient-to-br from-secondary to-secondary/50 p-6 text-center">
                      <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                        <Baby className="h-10 w-10 text-primary" />
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-1">Week {currentData.week}</p>
                      <p className="text-3xl font-bold text-foreground mb-2">
                        {currentData.comparison}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Your baby is about the size of a {currentData.comparison.toLowerCase()}
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-lg bg-card p-4 shadow-card text-center">
                        <p className="text-sm text-muted-foreground mb-1">Length</p>
                        <p className="text-2xl font-bold text-primary">{currentData.length}</p>
                        {prevData && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Last week: {prevData.length}
                          </p>
                        )}
                      </div>
                      
                      <div className="rounded-lg bg-card p-4 shadow-card text-center">
                        <p className="text-sm text-muted-foreground mb-1">Weight</p>
                        <p className="text-2xl font-bold text-primary">{currentData.weight}</p>
                        {prevData && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Last week: {prevData.weight}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-lg bg-primary/5 border border-primary/10 p-4">
                      <p className="font-medium text-foreground mb-1">This Week's Development</p>
                      <p className="text-muted-foreground">{currentData.development}</p>
                    </div>

                    {/* Progress indicator */}
                    <div className="pt-4">
                      <div className="flex justify-between text-xs text-muted-foreground mb-2">
                        <span>Week 4</span>
                        <span>Week 40</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${((parseInt(selectedWeek) - 4) / 36) * 100}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <p className="text-center text-sm text-muted-foreground mt-2">
                        {40 - parseInt(selectedWeek)} weeks to go
                      </p>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            <div className="flex items-start gap-3 rounded-lg bg-muted p-4">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                These measurements are averages. Your baby may be slightly larger or smaller. 
                Your healthcare provider will track actual growth through ultrasounds.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
