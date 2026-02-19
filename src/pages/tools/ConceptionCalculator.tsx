import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Baby, ArrowRight, Sparkles, Loader2, Brain } from "lucide-react";
import { motion } from "framer-motion";
import { format, addDays, subDays, addWeeks, differenceInDays } from "date-fns";
import { formatLocalized } from "@/lib/dateLocale";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePregnancyAI } from "@/hooks/usePregnancyAI";
import { useResetOnLanguageChange } from '@/hooks/useResetOnLanguageChange';
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

const ConceptionCalculator = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { streamChat, isLoading: aiLoading } = usePregnancyAI();

  useResetOnLanguageChange(() => {
    setAiAdvice('');
    setShowAiAdvice(false);
  });
  const [dueDate, setDueDate] = useState("");
  const [lmpDate, setLmpDate] = useState("");
  const [cycleLength, setCycleLength] = useState("28");
  const [aiAdvice, setAiAdvice] = useState('');
  const [showAiAdvice, setShowAiAdvice] = useState(false);
  const [result, setResult] = useState<{
    conceptionDate: Date;
    fertileWindowStart: Date;
    fertileWindowEnd: Date;
  } | null>(null);

  const getAIConceptionAdvice = async () => {
    if (!result) return;
    setAiAdvice('');
    setShowAiAdvice(true);

    await streamChat({
      type: 'pregnancy-assistant',
      messages: [{
        role: 'user',
        content: `I'm trying to conceive. Based on my data:
- Estimated conception window: ${formatLocalized(result.fertileWindowStart, "MMMM d", currentLanguage)} to ${formatLocalized(result.fertileWindowEnd, "MMMM d", currentLanguage)}
- Peak fertility (ovulation): ${formatLocalized(result.conceptionDate, "MMMM d", currentLanguage)}
- My cycle length: ${cycleLength} days

Please provide:

## 🌸 Your Fertile Window
Explanation of my fertile window and best timing

## 💕 Conception Tips
5-6 evidence-based tips for maximizing conception chances

## 🍎 Nutrition for Conception
Key nutrients and foods to focus on

## 🧘 Lifestyle Recommendations
Lifestyle factors that support fertility

## 📅 Tracking Suggestions
How to better track ovulation and fertility signs

## 💪 Staying Positive
Encouragement and realistic expectations`
      }],
      onDelta: (text) => setAiAdvice(prev => prev + text),
      onDone: () => {},
    });
  };

  const calculateFromDueDate = () => {
    if (!dueDate) return;
    
    const due = new Date(dueDate);
    // Conception is typically 266 days before due date (38 weeks)
    const conception = subDays(due, 266);
    const fertileStart = subDays(conception, 5);
    const fertileEnd = addDays(conception, 1);

    setResult({
      conceptionDate: conception,
      fertileWindowStart: fertileStart,
      fertileWindowEnd: fertileEnd,
    });
  };

  const calculateFromLMP = () => {
    if (!lmpDate) return;
    
    const lmp = new Date(lmpDate);
    const cycle = parseInt(cycleLength) || 28;
    
    // Ovulation typically occurs 14 days before next period
    const ovulation = addDays(lmp, cycle - 14);
    const fertileStart = subDays(ovulation, 5);
    const fertileEnd = addDays(ovulation, 1);

    setResult({
      conceptionDate: ovulation,
      fertileWindowStart: fertileStart,
      fertileWindowEnd: fertileEnd,
    });
  };

  return (
    <Layout showBack>
      <div className="container max-w-2xl py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Tabs defaultValue="duedate">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="duedate" className="text-xs sm:text-sm px-2">{t('conceptionPage.fromDueDate')}</TabsTrigger>
              <TabsTrigger value="lmp" className="text-xs sm:text-sm px-2">{t('conceptionPage.fromLMP')}</TabsTrigger>
            </TabsList>

            <TabsContent value="duedate">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Baby className="h-4 w-4 text-primary" />
                    {t('conceptionPage.knowDueDate')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs">{t('conceptionPage.dueDate')}</Label>
                    <Input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                  <Button onClick={calculateFromDueDate} className="w-full">
                    {t('common.calculate')}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="lmp">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    {t('conceptionPage.planningPregnancy')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs">{t('conceptionPage.lmpDate')}</Label>
                    <Input
                      type="date"
                      value={lmpDate}
                      onChange={(e) => setLmpDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">{t('conceptionPage.cycleLength')}</Label>
                    <Input
                      type="number"
                      min="21"
                      max="35"
                      value={cycleLength}
                      onChange={(e) => setCycleLength(e.target.value)}
                    />
                  </div>
                  <Button onClick={calculateFromLMP} className="w-full">
                    {t('common.calculate')}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>{t('common.results')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg bg-primary/10 p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      {t('conceptionPage.estimatedConception')}
                    </p>
                    <p className="text-sm font-bold text-primary">
                      {formatLocalized(result.conceptionDate, "MMMM d, yyyy", currentLanguage)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-secondary p-3">
                    <p className="text-xs text-muted-foreground mb-2">
                      {t('conceptionPage.fertileWindow')}
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-medium">
                        {formatLocalized(result.fertileWindowStart, "MMM d", currentLanguage)}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {formatLocalized(result.fertileWindowEnd, "MMM d", currentLanguage)}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {t('conceptionPage.info')}
                  </p>

                  {/* AI Advice Button */}
                  {!showAiAdvice ? (
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={getAIConceptionAdvice}
                      disabled={aiLoading}
                      className="relative w-full mt-4 overflow-hidden rounded-xl h-11 flex items-center justify-center gap-2 text-white text-sm font-semibold shadow-lg disabled:opacity-60 disabled:pointer-events-none"
                      style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))" }}
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
                      {aiLoading ? (
                        <><Loader2 className="h-4 w-4 animate-spin shrink-0" /><span>{t('conceptionPage.gettingAdvice')}</span></>
                      ) : (
                        <><Brain className="h-4 w-4 shrink-0" /><span>{t('conceptionPage.getAIAdvice')}</span><Sparkles className="h-3.5 w-3.5 shrink-0 opacity-80" /></>
                      )}
                    </motion.button>
                  ) : (
                    <Card className="mt-4 border-primary/20 bg-primary/5">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4 text-primary" />
                            <h3 className="font-semibold text-sm">{t('conceptionPage.aiConceptionGuide')}</h3>
                          </div>
                          <button 
                            onClick={() => setShowAiAdvice(false)}
                            className="text-muted-foreground hover:text-foreground text-xs"
                          >
                            ✕
                          </button>
                        </div>
                        {aiLoading && !aiAdvice && (
                          <div className="flex items-center gap-2 text-primary">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">{t('conceptionPage.gettingAdvice')}</span>
                          </div>
                        )}
                        {aiAdvice && <MarkdownRenderer content={aiAdvice} />}
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default ConceptionCalculator;
