import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Baby, TrendingUp, Ruler, Scale } from "lucide-react";
import { motion } from "framer-motion";

// WHO growth standards (simplified percentiles)
const WHO_WEIGHT_BOYS = [
  { month: 0, p3: 2.5, p50: 3.3, p97: 4.3 },
  { month: 3, p3: 5.1, p50: 6.4, p97: 7.9 },
  { month: 6, p3: 6.4, p50: 7.9, p97: 9.7 },
  { month: 9, p3: 7.2, p50: 9.0, p97: 11.0 },
  { month: 12, p3: 7.8, p50: 9.6, p97: 11.8 },
  { month: 18, p3: 8.6, p50: 10.9, p97: 13.5 },
  { month: 24, p3: 9.7, p50: 12.2, p97: 15.1 },
];

const WHO_WEIGHT_GIRLS = [
  { month: 0, p3: 2.4, p50: 3.2, p97: 4.2 },
  { month: 3, p3: 4.6, p50: 5.8, p97: 7.3 },
  { month: 6, p3: 5.8, p50: 7.3, p97: 9.1 },
  { month: 9, p3: 6.6, p50: 8.2, p97: 10.2 },
  { month: 12, p3: 7.1, p50: 8.9, p97: 11.2 },
  { month: 18, p3: 8.0, p50: 10.2, p97: 12.8 },
  { month: 24, p3: 9.0, p50: 11.5, p97: 14.5 },
];

const BabyGrowth = () => {
  const { t } = useTranslation();
  const [gender, setGender] = useState<"boy" | "girl">("boy");
  const [ageMonths, setAgeMonths] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [headCirc, setHeadCirc] = useState("");
  const [result, setResult] = useState<{
    weightPercentile: string;
    status: string;
    expectedRange: { min: number; max: number };
  } | null>(null);

  const calculate = () => {
    const age = parseInt(ageMonths);
    const w = parseFloat(weight);
    
    if (!age || !w) return;

    const standards = gender === "boy" ? WHO_WEIGHT_BOYS : WHO_WEIGHT_GIRLS;
    
    // Find closest age bracket
    let closest = standards[0];
    for (const s of standards) {
      if (s.month <= age) closest = s;
    }

    let percentile = "50th";
    let status = "normal";

    if (w < closest.p3) {
      percentile = "<3rd";
      status = "underweight";
    } else if (w < closest.p50) {
      percentile = "3rd-50th";
      status = "normal";
    } else if (w < closest.p97) {
      percentile = "50th-97th";
      status = "normal";
    } else {
      percentile = ">97th";
      status = "overweight";
    }

    setResult({
      weightPercentile: percentile,
      status,
      expectedRange: { min: closest.p3, max: closest.p97 },
    });
  };

  return (
    <Layout title={t('tools.babyGrowth.title')} showBack>
      <div className="container max-w-2xl py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Baby className="h-5 w-5 text-primary" />
                {t('babyGrowthPage.enterDetails')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('babyGrowthPage.gender')}</Label>
                <Select value={gender} onValueChange={(v) => setGender(v as "boy" | "girl")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boy">{t('babyGrowthPage.boy')}</SelectItem>
                    <SelectItem value="girl">{t('babyGrowthPage.girl')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('babyGrowthPage.ageMonths')}</Label>
                <Input
                  type="number"
                  min="0"
                  max="24"
                  placeholder="0-24"
                  value={ageMonths}
                  onChange={(e) => setAgeMonths(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{t('babyGrowthPage.weight')}</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="kg"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('babyGrowthPage.height')}</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="cm"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('babyGrowthPage.headCirc')}</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="cm"
                    value={headCirc}
                    onChange={(e) => setHeadCirc(e.target.value)}
                  />
                </div>
              </div>

              <Button onClick={calculate} className="w-full">
                {t('common.calculate')}
              </Button>
            </CardContent>
          </Card>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    {t('common.results')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg bg-secondary p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">
                      {t('babyGrowthPage.weightPercentile')}
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {result.weightPercentile}
                    </p>
                    <p className={`text-sm mt-2 ${
                      result.status === "normal" ? "text-green-600" :
                      result.status === "underweight" ? "text-yellow-600" : "text-orange-600"
                    }`}>
                      {t(`babyGrowthPage.status.${result.status}`)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm text-muted-foreground">
                      {t('babyGrowthPage.expectedRange')}
                    </p>
                    <p className="font-medium">
                      {result.expectedRange.min} - {result.expectedRange.max} kg
                    </p>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {t('babyGrowthPage.info')}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default BabyGrowth;
