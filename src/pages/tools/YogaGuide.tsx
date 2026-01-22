import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Flower2, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface YogaPose {
  id: string;
  nameKey: string;
  descKey: string;
  benefitsKey: string;
  duration: string;
  trimester: number[];
  caution?: boolean;
}

const YogaGuide = () => {
  const { t } = useTranslation();

  const poses: YogaPose[] = [
    // First Trimester Safe
    { id: "cat-cow", nameKey: "catCow", descKey: "catCowDesc", benefitsKey: "catCowBenefits", duration: "5-10", trimester: [1, 2, 3] },
    { id: "child", nameKey: "child", descKey: "childDesc", benefitsKey: "childBenefits", duration: "1-3", trimester: [1, 2, 3] },
    { id: "butterfly", nameKey: "butterfly", descKey: "butterflyDesc", benefitsKey: "butterflyBenefits", duration: "1-2", trimester: [1, 2, 3] },
    { id: "standing-forward", nameKey: "standingForward", descKey: "standingForwardDesc", benefitsKey: "standingForwardBenefits", duration: "30s-1", trimester: [1, 2], caution: true },
    // Second Trimester
    { id: "warrior2", nameKey: "warrior2", descKey: "warrior2Desc", benefitsKey: "warrior2Benefits", duration: "30s-1", trimester: [1, 2, 3] },
    { id: "triangle", nameKey: "triangle", descKey: "triangleDesc", benefitsKey: "triangleBenefits", duration: "30s", trimester: [1, 2] },
    { id: "side-stretch", nameKey: "sideStretch", descKey: "sideStretchDesc", benefitsKey: "sideStretchBenefits", duration: "30s", trimester: [1, 2, 3] },
    { id: "hip-circles", nameKey: "hipCircles", descKey: "hipCirclesDesc", benefitsKey: "hipCirclesBenefits", duration: "1-2", trimester: [2, 3] },
    // Third Trimester
    { id: "squat", nameKey: "squat", descKey: "squatDesc", benefitsKey: "squatBenefits", duration: "1-3", trimester: [2, 3] },
    { id: "legs-up", nameKey: "legsUp", descKey: "legsUpDesc", benefitsKey: "legsUpBenefits", duration: "5-10", trimester: [1, 2, 3] },
    { id: "pelvic-tilt", nameKey: "pelvicTilt", descKey: "pelvicTiltDesc", benefitsKey: "pelvicTiltBenefits", duration: "10-15", trimester: [1, 2, 3] },
    { id: "savasana-side", nameKey: "savasnaSide", descKey: "savasnaSideDesc", benefitsKey: "savasnaSideBenefits", duration: "5-10", trimester: [2, 3] },
  ];

  const getPosesForTrimester = (tri: number) => 
    poses.filter((p) => p.trimester.includes(tri));

  const PoseCard = ({ pose, index }: { pose: YogaPose; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className={pose.caution ? "border-yellow-500/50" : ""}>
        <CardContent className="py-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold">
              {t(`yogaPage.poses.${pose.nameKey}`)}
            </h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {pose.duration} {t('common.minutes')}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            {t(`yogaPage.poses.${pose.descKey}`)}
          </p>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-700 dark:text-green-400">
              {t(`yogaPage.poses.${pose.benefitsKey}`)}
            </span>
          </div>
          {pose.caution && (
            <div className="flex items-center gap-2 mt-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-yellow-700 dark:text-yellow-400">
                {t('yogaPage.modifyLater')}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Layout title={t('tools.yogaGuide.title')} showBack>
      <div className="container max-w-2xl py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-center text-muted-foreground mb-6">
            {t('yogaPage.subtitle')}
          </p>

          <Tabs defaultValue="1">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="1">{t('yogaPage.trimester1')}</TabsTrigger>
              <TabsTrigger value="2">{t('yogaPage.trimester2')}</TabsTrigger>
              <TabsTrigger value="3">{t('yogaPage.trimester3')}</TabsTrigger>
            </TabsList>

            {[1, 2, 3].map((tri) => (
              <TabsContent key={tri} value={tri.toString()}>
                <Card className="mb-4 bg-primary/5 border-primary/20">
                  <CardContent className="py-3">
                    <p className="text-sm">
                      {t(`yogaPage.trimester${tri}Info`)}
                    </p>
                  </CardContent>
                </Card>
                <div className="space-y-3">
                  {getPosesForTrimester(tri).map((pose, index) => (
                    <PoseCard key={pose.id} pose={pose} index={index} />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <Card className="mt-6 border-destructive/20 bg-destructive/5">
            <CardContent className="pt-4">
              <div className="flex gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-destructive mb-1">
                    {t('yogaPage.avoidTitle')}
                  </p>
                  <p className="text-muted-foreground">
                    {t('yogaPage.avoidList')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                {t('yogaPage.disclaimer')}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default YogaGuide;
