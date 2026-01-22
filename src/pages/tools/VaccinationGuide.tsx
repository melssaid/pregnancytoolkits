import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Syringe, Baby, User, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";

interface Vaccine {
  id: string;
  nameKey: string;
  ageKey: string;
  descKey: string;
}

const VaccinationGuide = () => {
  const { t } = useTranslation();
  const [completedVaccines, setCompletedVaccines] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("completedVaccines");
    if (saved) setCompletedVaccines(JSON.parse(saved));
  }, []);

  const toggleVaccine = (id: string) => {
    const updated = completedVaccines.includes(id)
      ? completedVaccines.filter((v) => v !== id)
      : [...completedVaccines, id];
    setCompletedVaccines(updated);
    localStorage.setItem("completedVaccines", JSON.stringify(updated));
  };

  const babyVaccines: Vaccine[] = [
    { id: "hepb-birth", nameKey: "hepB", ageKey: "atBirth", descKey: "hepBDesc" },
    { id: "bcg", nameKey: "bcg", ageKey: "atBirth", descKey: "bcgDesc" },
    { id: "dtap-1", nameKey: "dtap", ageKey: "2months", descKey: "dtapDesc" },
    { id: "ipv-1", nameKey: "ipv", ageKey: "2months", descKey: "ipvDesc" },
    { id: "hib-1", nameKey: "hib", ageKey: "2months", descKey: "hibDesc" },
    { id: "pcv-1", nameKey: "pcv", ageKey: "2months", descKey: "pcvDesc" },
    { id: "rota-1", nameKey: "rotavirus", ageKey: "2months", descKey: "rotaDesc" },
    { id: "dtap-2", nameKey: "dtap", ageKey: "4months", descKey: "dtapDesc" },
    { id: "ipv-2", nameKey: "ipv", ageKey: "4months", descKey: "ipvDesc" },
    { id: "hib-2", nameKey: "hib", ageKey: "4months", descKey: "hibDesc" },
    { id: "pcv-2", nameKey: "pcv", ageKey: "4months", descKey: "pcvDesc" },
    { id: "rota-2", nameKey: "rotavirus", ageKey: "4months", descKey: "rotaDesc" },
    { id: "dtap-3", nameKey: "dtap", ageKey: "6months", descKey: "dtapDesc" },
    { id: "hepb-3", nameKey: "hepB", ageKey: "6months", descKey: "hepBDesc" },
    { id: "ipv-3", nameKey: "ipv", ageKey: "6months", descKey: "ipvDesc" },
    { id: "flu", nameKey: "flu", ageKey: "6months", descKey: "fluDesc" },
    { id: "mmr-1", nameKey: "mmr", ageKey: "12months", descKey: "mmrDesc" },
    { id: "varicella-1", nameKey: "varicella", ageKey: "12months", descKey: "varicellaDesc" },
    { id: "hepa-1", nameKey: "hepA", ageKey: "12months", descKey: "hepADesc" },
    { id: "dtap-4", nameKey: "dtap", ageKey: "18months", descKey: "dtapDesc" },
    { id: "mmr-2", nameKey: "mmr", ageKey: "4years", descKey: "mmrDesc" },
    { id: "varicella-2", nameKey: "varicella", ageKey: "4years", descKey: "varicellaDesc" },
  ];

  const pregnancyVaccines: Vaccine[] = [
    { id: "tdap", nameKey: "tdap", ageKey: "27-36weeks", descKey: "tdapDesc" },
    { id: "flu-preg", nameKey: "flu", ageKey: "anySeason", descKey: "fluPregDesc" },
    { id: "covid", nameKey: "covid", ageKey: "anyTrimester", descKey: "covidDesc" },
    { id: "rsv", nameKey: "rsv", ageKey: "32-36weeks", descKey: "rsvDesc" },
  ];

  const VaccineList = ({ vaccines }: { vaccines: Vaccine[] }) => (
    <div className="space-y-3">
      {vaccines.map((vaccine, index) => (
        <motion.div
          key={vaccine.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className={completedVaccines.includes(vaccine.id) ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20" : ""}>
            <CardContent className="py-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={completedVaccines.includes(vaccine.id)}
                  onCheckedChange={() => toggleVaccine(vaccine.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="font-medium">
                      {t(`vaccGuide.vaccines.${vaccine.nameKey}`)}
                    </p>
                    <span className="text-sm text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {t(`vaccGuide.ages.${vaccine.ageKey}`)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t(`vaccGuide.descriptions.${vaccine.descKey}`)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const babyCompleted = babyVaccines.filter((v) => completedVaccines.includes(v.id)).length;
  const pregCompleted = pregnancyVaccines.filter((v) => completedVaccines.includes(v.id)).length;

  return (
    <Layout title={t('tools.vaccinationGuide.title')} showBack>
      <div className="container max-w-2xl py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Tabs defaultValue="baby">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="baby" className="gap-2">
                <Baby className="h-4 w-4" />
                {t('vaccGuide.babyVaccines')}
              </TabsTrigger>
              <TabsTrigger value="pregnancy" className="gap-2">
                <User className="h-4 w-4" />
                {t('vaccGuide.pregnancyVaccines')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="baby">
              <Card className="mb-4">
                <CardContent className="py-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {t('vaccGuide.progress')}
                    </span>
                    <span className="font-medium text-primary">
                      {babyCompleted}/{babyVaccines.length}
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${(babyCompleted / babyVaccines.length) * 100}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
              <VaccineList vaccines={babyVaccines} />
            </TabsContent>

            <TabsContent value="pregnancy">
              <Card className="mb-4">
                <CardContent className="py-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {t('vaccGuide.progress')}
                    </span>
                    <span className="font-medium text-primary">
                      {pregCompleted}/{pregnancyVaccines.length}
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${(pregCompleted / pregnancyVaccines.length) * 100}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
              <VaccineList vaccines={pregnancyVaccines} />
            </TabsContent>
          </Tabs>

          <Card className="mt-6 border-primary/20 bg-primary/5">
            <CardContent className="pt-4">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  {t('vaccGuide.disclaimer')}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default VaccinationGuide;
