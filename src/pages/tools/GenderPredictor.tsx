import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Baby, Sparkles, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

// Chinese Gender Predictor Chart (entertainment only!)
const chineseChart: { [key: number]: { [key: number]: "boy" | "girl" } } = {
  18: { 1: "girl", 2: "boy", 3: "girl", 4: "boy", 5: "boy", 6: "boy", 7: "boy", 8: "boy", 9: "boy", 10: "boy", 11: "boy", 12: "boy" },
  19: { 1: "boy", 2: "girl", 3: "boy", 4: "girl", 5: "girl", 6: "boy", 7: "boy", 8: "boy", 9: "boy", 10: "girl", 11: "boy", 12: "girl" },
  20: { 1: "girl", 2: "boy", 3: "girl", 4: "boy", 5: "boy", 6: "boy", 7: "boy", 8: "boy", 9: "boy", 10: "girl", 11: "boy", 12: "boy" },
  21: { 1: "boy", 2: "girl", 3: "girl", 4: "girl", 5: "girl", 6: "girl", 7: "girl", 8: "girl", 9: "girl", 10: "girl", 11: "girl", 12: "girl" },
  22: { 1: "girl", 2: "boy", 3: "boy", 4: "girl", 5: "boy", 6: "girl", 7: "girl", 8: "boy", 9: "girl", 10: "girl", 11: "girl", 12: "girl" },
  23: { 1: "boy", 2: "boy", 3: "girl", 4: "boy", 5: "boy", 6: "girl", 7: "boy", 8: "girl", 9: "boy", 10: "boy", 11: "boy", 12: "girl" },
  24: { 1: "boy", 2: "girl", 3: "boy", 4: "boy", 5: "girl", 6: "boy", 7: "boy", 8: "girl", 9: "girl", 10: "girl", 11: "girl", 12: "girl" },
  25: { 1: "girl", 2: "boy", 3: "boy", 4: "girl", 5: "girl", 6: "boy", 7: "girl", 8: "boy", 9: "boy", 10: "boy", 11: "boy", 12: "boy" },
  26: { 1: "boy", 2: "girl", 3: "boy", 4: "girl", 5: "girl", 6: "boy", 7: "girl", 8: "boy", 9: "girl", 10: "girl", 11: "girl", 12: "girl" },
  27: { 1: "girl", 2: "boy", 3: "girl", 4: "boy", 5: "girl", 6: "girl", 7: "boy", 8: "boy", 9: "boy", 10: "boy", 11: "girl", 12: "boy" },
  28: { 1: "boy", 2: "girl", 3: "boy", 4: "girl", 5: "girl", 6: "boy", 7: "boy", 8: "boy", 9: "boy", 10: "boy", 11: "girl", 12: "girl" },
  29: { 1: "girl", 2: "boy", 3: "girl", 4: "girl", 5: "boy", 6: "boy", 7: "girl", 8: "girl", 9: "girl", 10: "boy", 11: "girl", 12: "girl" },
  30: { 1: "boy", 2: "girl", 3: "girl", 4: "girl", 5: "girl", 6: "girl", 7: "girl", 8: "girl", 9: "girl", 10: "girl", 11: "boy", 12: "boy" },
  31: { 1: "boy", 2: "girl", 3: "boy", 4: "girl", 5: "girl", 6: "girl", 7: "girl", 8: "girl", 9: "girl", 10: "girl", 11: "girl", 12: "boy" },
  32: { 1: "boy", 2: "girl", 3: "girl", 4: "boy", 5: "girl", 6: "girl", 7: "girl", 8: "girl", 9: "girl", 10: "girl", 11: "girl", 12: "boy" },
  33: { 1: "girl", 2: "boy", 3: "girl", 4: "boy", 5: "girl", 6: "girl", 7: "girl", 8: "boy", 9: "girl", 10: "girl", 11: "boy", 12: "girl" },
  34: { 1: "boy", 2: "girl", 3: "boy", 4: "girl", 5: "girl", 6: "boy", 7: "girl", 8: "girl", 9: "girl", 10: "girl", 11: "boy", 12: "boy" },
  35: { 1: "boy", 2: "boy", 3: "girl", 4: "boy", 5: "girl", 6: "girl", 7: "boy", 8: "girl", 9: "boy", 10: "girl", 11: "boy", 12: "girl" },
  36: { 1: "girl", 2: "boy", 3: "boy", 4: "girl", 5: "boy", 6: "girl", 7: "girl", 8: "boy", 9: "girl", 10: "boy", 11: "boy", 12: "boy" },
  37: { 1: "boy", 2: "girl", 3: "boy", 4: "boy", 5: "girl", 6: "boy", 7: "girl", 8: "boy", 9: "girl", 10: "boy", 11: "girl", 12: "girl" },
  38: { 1: "girl", 2: "boy", 3: "girl", 4: "boy", 5: "boy", 6: "girl", 7: "boy", 8: "girl", 9: "boy", 10: "girl", 11: "boy", 12: "boy" },
  39: { 1: "boy", 2: "girl", 3: "boy", 4: "boy", 5: "boy", 6: "girl", 7: "girl", 8: "boy", 9: "girl", 10: "boy", 11: "girl", 12: "girl" },
  40: { 1: "girl", 2: "boy", 3: "girl", 4: "boy", 5: "girl", 6: "boy", 7: "boy", 8: "girl", 9: "boy", 10: "girl", 11: "boy", 12: "girl" },
  41: { 1: "boy", 2: "girl", 3: "boy", 4: "girl", 5: "boy", 6: "girl", 7: "girl", 8: "boy", 9: "girl", 10: "boy", 11: "girl", 12: "boy" },
  42: { 1: "girl", 2: "boy", 3: "girl", 4: "boy", 5: "girl", 6: "boy", 7: "boy", 8: "girl", 9: "boy", 10: "girl", 11: "boy", 12: "girl" },
  43: { 1: "boy", 2: "girl", 3: "boy", 4: "girl", 5: "boy", 6: "girl", 7: "boy", 8: "boy", 9: "girl", 10: "boy", 11: "girl", 12: "boy" },
  44: { 1: "boy", 2: "boy", 3: "girl", 4: "boy", 5: "girl", 6: "boy", 7: "girl", 8: "boy", 9: "girl", 10: "girl", 11: "boy", 12: "girl" },
  45: { 1: "girl", 2: "boy", 3: "girl", 4: "girl", 5: "boy", 6: "girl", 7: "boy", 8: "girl", 9: "boy", 10: "boy", 11: "girl", 12: "boy" },
};

const GenderPredictor = () => {
  const { t } = useTranslation();
  const [age, setAge] = useState("");
  const [month, setMonth] = useState("");
  const [result, setResult] = useState<"boy" | "girl" | null>(null);

  const predict = () => {
    const ageNum = parseInt(age);
    const monthNum = parseInt(month);

    if (!ageNum || !monthNum || ageNum < 18 || ageNum > 45) return;

    const prediction = chineseChart[ageNum]?.[monthNum] || "boy";
    setResult(prediction);
  };

  return (
    <Layout title={t('tools.genderPredictor.title')} showBack>
      <div className="container max-w-2xl py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="pt-4">
              <div className="flex gap-2">
                <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  {t('genderPredictorPage.funNote')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Baby className="h-5 w-5 text-primary" />
                {t('genderPredictorPage.chineseMethod')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('genderPredictorPage.motherAge')}</Label>
                <Select value={age} onValueChange={setAge}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('genderPredictorPage.selectAge')} />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 28 }, (_, i) => i + 18).map((a) => (
                      <SelectItem key={a} value={a.toString()}>
                        {a} {t('genderPredictorPage.years')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('genderPredictorPage.conceptionMonth')}</Label>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('genderPredictorPage.selectMonth')} />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <SelectItem key={m} value={m.toString()}>
                        {t(`genderPredictorPage.months.${m}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={predict} className="w-full">
                <Sparkles className="h-4 w-4 me-2" />
                {t('genderPredictorPage.predict')}
              </Button>
            </CardContent>
          </Card>

          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring" }}
            >
              <Card className={`text-center ${result === "boy" ? "bg-blue-50 dark:bg-blue-950 border-blue-300" : "bg-pink-50 dark:bg-pink-950 border-pink-300"}`}>
                <CardContent className="py-8">
                  <div className="text-6xl mb-4">
                    {result === "boy" ? "👶🏻💙" : "👶🏻💗"}
                  </div>
                  <h3 className={`text-2xl font-bold ${result === "boy" ? "text-blue-600" : "text-pink-600"}`}>
                    {t(`genderPredictorPage.result.${result}`)}
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    {t('genderPredictorPage.resultNote')}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <Card className="mt-6">
            <CardContent className="pt-4">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  {t('genderPredictorPage.disclaimer')}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default GenderPredictor;
