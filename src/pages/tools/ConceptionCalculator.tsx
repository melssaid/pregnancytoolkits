import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Baby, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { format, addDays, subDays, addWeeks, differenceInDays } from "date-fns";

const ConceptionCalculator = () => {
  const { t } = useTranslation();
  const [dueDate, setDueDate] = useState("");
  const [lmpDate, setLmpDate] = useState("");
  const [cycleLength, setCycleLength] = useState("28");
  const [result, setResult] = useState<{
    conceptionDate: Date;
    fertileWindowStart: Date;
    fertileWindowEnd: Date;
  } | null>(null);

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
    <Layout title={t('tools.conceptionCalculator.title')} showBack>
      <div className="container max-w-2xl py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Tabs defaultValue="duedate">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="duedate">{t('conceptionPage.fromDueDate')}</TabsTrigger>
              <TabsTrigger value="lmp">{t('conceptionPage.fromLMP')}</TabsTrigger>
            </TabsList>

            <TabsContent value="duedate">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Baby className="h-5 w-5 text-primary" />
                    {t('conceptionPage.knowDueDate')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t('conceptionPage.dueDate')}</Label>
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
                    <Calendar className="h-5 w-5 text-primary" />
                    {t('conceptionPage.planningPregnancy')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t('conceptionPage.lmpDate')}</Label>
                    <Input
                      type="date"
                      value={lmpDate}
                      onChange={(e) => setLmpDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('conceptionPage.cycleLength')}</Label>
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
                  <div className="rounded-lg bg-primary/10 p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-1">
                      {t('conceptionPage.estimatedConception')}
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {format(result.conceptionDate, "MMMM d, yyyy")}
                    </p>
                  </div>

                  <div className="rounded-lg bg-secondary p-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      {t('conceptionPage.fertileWindow')}
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-medium">
                        {format(result.fertileWindowStart, "MMM d")}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {format(result.fertileWindowEnd, "MMM d")}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {t('conceptionPage.info')}
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

export default ConceptionCalculator;
