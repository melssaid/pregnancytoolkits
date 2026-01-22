import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Scale, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const WeightGain = () => {
  const { t } = useTranslation();
  const [prePregnancyWeight, setPrePregnancyWeight] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");
  const [height, setHeight] = useState("");
  const [week, setWeek] = useState("");
  const [result, setResult] = useState<{
    bmi: number;
    category: string;
    recommendedGain: { min: number; max: number };
    currentGain: number;
    status: string;
  } | null>(null);

  const calculateWeightGain = () => {
    const preWeight = parseFloat(prePregnancyWeight);
    const currWeight = parseFloat(currentWeight);
    const h = parseFloat(height) / 100;
    const weekNum = parseInt(week);

    if (!preWeight || !currWeight || !h || !weekNum) return;

    const bmi = preWeight / (h * h);
    let category = "";
    let recommendedGain = { min: 0, max: 0 };

    if (bmi < 18.5) {
      category = "underweight";
      recommendedGain = { min: 12.5, max: 18 };
    } else if (bmi < 25) {
      category = "normal";
      recommendedGain = { min: 11.5, max: 16 };
    } else if (bmi < 30) {
      category = "overweight";
      recommendedGain = { min: 7, max: 11.5 };
    } else {
      category = "obese";
      recommendedGain = { min: 5, max: 9 };
    }

    const currentGain = currWeight - preWeight;
    const expectedGainAtWeek = (weekNum / 40) * ((recommendedGain.min + recommendedGain.max) / 2);
    
    let status = "onTrack";
    if (currentGain < expectedGainAtWeek * 0.8) {
      status = "below";
    } else if (currentGain > expectedGainAtWeek * 1.2) {
      status = "above";
    }

    setResult({ bmi, category, recommendedGain, currentGain, status });
  };

  return (
    <Layout title={t('tools.weightGain.title')} showBack>
      <div className="container max-w-2xl py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                {t('tools.weightGain.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('weightGainPage.prePregnancyWeight')}</Label>
                  <Input
                    type="number"
                    placeholder="kg"
                    value={prePregnancyWeight}
                    onChange={(e) => setPrePregnancyWeight(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('weightGainPage.currentWeight')}</Label>
                  <Input
                    type="number"
                    placeholder="kg"
                    value={currentWeight}
                    onChange={(e) => setCurrentWeight(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('weightGainPage.height')}</Label>
                  <Input
                    type="number"
                    placeholder="cm"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('weightGainPage.currentWeek')}</Label>
                  <Input
                    type="number"
                    placeholder="1-40"
                    min="1"
                    max="40"
                    value={week}
                    onChange={(e) => setWeek(e.target.value)}
                  />
                </div>
              </div>

              <Button onClick={calculateWeightGain} className="w-full">
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-secondary p-4 text-center">
                      <p className="text-sm text-muted-foreground">{t('weightGainPage.preBmi')}</p>
                      <p className="text-2xl font-bold text-primary">{result.bmi.toFixed(1)}</p>
                      <p className="text-sm">{t(`weightGainPage.${result.category}`)}</p>
                    </div>
                    <div className="rounded-lg bg-secondary p-4 text-center">
                      <p className="text-sm text-muted-foreground">{t('weightGainPage.currentGain')}</p>
                      <p className="text-2xl font-bold text-primary">{result.currentGain.toFixed(1)} kg</p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-muted p-4">
                    <p className="font-medium">{t('weightGainPage.recommendedRange')}</p>
                    <p className="text-lg">
                      {result.recommendedGain.min} - {result.recommendedGain.max} kg
                    </p>
                    <p className={`mt-2 text-sm ${
                      result.status === 'onTrack' ? 'text-green-600' :
                      result.status === 'below' ? 'text-yellow-600' : 'text-orange-600'
                    }`}>
                      {t(`weightGainPage.status.${result.status}`)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default WeightGain;
