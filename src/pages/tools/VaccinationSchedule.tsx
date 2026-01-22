import { motion } from "framer-motion";
import { Syringe, CheckCircle, Info } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Vaccine {
  name: string;
  timing: string;
  importance: string;
  notes?: string;
}

const pregnancyVaccines: Vaccine[] = [
  {
    name: "Flu Shot (Influenza)",
    timing: "Any trimester during flu season",
    importance: "Protects you and baby from flu complications; provides antibodies to newborn",
    notes: "Get the injection (shot), not nasal spray",
  },
  {
    name: "Tdap (Whooping Cough)",
    timing: "27-36 weeks of each pregnancy",
    importance: "Protects newborn from whooping cough before they can be vaccinated",
    notes: "Recommended during every pregnancy",
  },
  {
    name: "COVID-19 Vaccine",
    timing: "Any trimester; boosters as recommended",
    importance: "Reduces risk of severe illness; may provide protection to newborn",
    notes: "mRNA vaccines (Pfizer, Moderna) are recommended",
  },
  {
    name: "RSV Vaccine",
    timing: "32-36 weeks (September-January)",
    importance: "Protects baby from RSV for first 6 months",
    notes: "New recommendation; discuss with provider",
  },
];

const babyVaccines: { age: string; vaccines: Vaccine[] }[] = [
  {
    age: "Birth",
    vaccines: [
      { name: "Hepatitis B (1st dose)", timing: "Within 24 hours of birth", importance: "Prevents liver infection" },
    ],
  },
  {
    age: "2 Months",
    vaccines: [
      { name: "DTaP (1st dose)", timing: "2 months", importance: "Diphtheria, tetanus, pertussis protection" },
      { name: "Polio (IPV, 1st dose)", timing: "2 months", importance: "Prevents polio" },
      { name: "Hib (1st dose)", timing: "2 months", importance: "Prevents bacterial meningitis" },
      { name: "PCV13 (1st dose)", timing: "2 months", importance: "Prevents pneumococcal disease" },
      { name: "Rotavirus (1st dose)", timing: "2 months", importance: "Prevents severe diarrhea", notes: "Oral vaccine" },
      { name: "Hepatitis B (2nd dose)", timing: "1-2 months", importance: "Continues protection" },
    ],
  },
  {
    age: "4 Months",
    vaccines: [
      { name: "DTaP (2nd dose)", timing: "4 months", importance: "Builds immunity" },
      { name: "Polio (IPV, 2nd dose)", timing: "4 months", importance: "Builds immunity" },
      { name: "Hib (2nd dose)", timing: "4 months", importance: "Builds immunity" },
      { name: "PCV13 (2nd dose)", timing: "4 months", importance: "Builds immunity" },
      { name: "Rotavirus (2nd dose)", timing: "4 months", importance: "Builds immunity" },
    ],
  },
  {
    age: "6 Months",
    vaccines: [
      { name: "DTaP (3rd dose)", timing: "6 months", importance: "Continues protection" },
      { name: "Polio (IPV, 3rd dose)", timing: "6-18 months", importance: "May be given now or later" },
      { name: "Hib (3rd or 4th dose)", timing: "6 months", importance: "Depends on brand" },
      { name: "PCV13 (3rd dose)", timing: "6 months", importance: "Continues protection" },
      { name: "Rotavirus (3rd dose)", timing: "6 months", importance: "If 3-dose series", notes: "Depends on brand" },
      { name: "Hepatitis B (3rd dose)", timing: "6-18 months", importance: "Completes series" },
      { name: "Influenza (annual)", timing: "6 months+", importance: "First season: 2 doses 4 weeks apart" },
    ],
  },
  {
    age: "12-15 Months",
    vaccines: [
      { name: "MMR (1st dose)", timing: "12-15 months", importance: "Measles, mumps, rubella protection" },
      { name: "Varicella (1st dose)", timing: "12-15 months", importance: "Chickenpox protection" },
      { name: "Hepatitis A (1st dose)", timing: "12-23 months", importance: "Prevents liver infection" },
      { name: "PCV13 (4th dose)", timing: "12-15 months", importance: "Completes series" },
      { name: "Hib (final dose)", timing: "12-15 months", importance: "Completes series" },
    ],
  },
];

export default function VaccinationSchedule() {
  return (
    <Layout title="Vaccination Schedule" showBack>
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
                  <Syringe className="h-5 w-5 text-primary" />
                  Recommended Vaccinations
                </CardTitle>
                <CardDescription>
                  Important vaccines during pregnancy and for your baby's first year
                </CardDescription>
              </CardHeader>
            </Card>

            <Tabs defaultValue="pregnancy">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="pregnancy">During Pregnancy</TabsTrigger>
                <TabsTrigger value="baby">Baby's First Year</TabsTrigger>
              </TabsList>

              <TabsContent value="pregnancy" className="space-y-4">
                <Card className="bg-secondary/30">
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">
                      Vaccines during pregnancy protect you from illness and pass antibodies 
                      to your baby, providing protection during their first months of life.
                    </p>
                  </CardContent>
                </Card>

                {pregnancyVaccines.map((vaccine, index) => (
                  <motion.div
                    key={vaccine.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">{vaccine.name}</p>
                            <p className="text-sm text-primary mt-1">{vaccine.timing}</p>
                            <p className="text-sm text-muted-foreground mt-1">{vaccine.importance}</p>
                            {vaccine.notes && (
                              <p className="text-xs text-muted-foreground mt-2 italic">{vaccine.notes}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </TabsContent>

              <TabsContent value="baby" className="space-y-6">
                <Card className="bg-secondary/30">
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">
                      Following the recommended vaccination schedule protects your baby 
                      from serious diseases. Vaccines are thoroughly tested for safety.
                    </p>
                  </CardContent>
                </Card>

                {babyVaccines.map((ageGroup, groupIndex) => (
                  <motion.div
                    key={ageGroup.age}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: groupIndex * 0.1 }}
                  >
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base text-primary">{ageGroup.age}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {ageGroup.vaccines.map((vaccine) => (
                            <div key={vaccine.name} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-foreground">{vaccine.name}</p>
                                <p className="text-xs text-muted-foreground">{vaccine.importance}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex items-start gap-3 rounded-lg bg-muted p-4">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                This schedule follows CDC recommendations. Your healthcare provider may 
                adjust timing based on your specific situation. Keep a record of all 
                vaccinations for your reference.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
