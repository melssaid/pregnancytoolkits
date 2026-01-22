import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Search, XCircle, AlertCircle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

type SafetyLevel = "forbidden" | "caution" | "safe";

interface FoodItem {
  nameKey: string;
  level: SafetyLevel;
  reasonKey: string;
}

const ForbiddenFoods = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const foods: FoodItem[] = [
    // Forbidden
    { nameKey: "rawFish", level: "forbidden", reasonKey: "rawFishReason" },
    { nameKey: "rawMeat", level: "forbidden", reasonKey: "rawMeatReason" },
    { nameKey: "rawEggs", level: "forbidden", reasonKey: "rawEggsReason" },
    { nameKey: "unpasteurizedMilk", level: "forbidden", reasonKey: "unpasteurizedReason" },
    { nameKey: "softCheese", level: "forbidden", reasonKey: "softCheeseReason" },
    { nameKey: "deli", level: "forbidden", reasonKey: "deliReason" },
    { nameKey: "alcohol", level: "forbidden", reasonKey: "alcoholReason" },
    { nameKey: "highMercuryFish", level: "forbidden", reasonKey: "mercuryReason" },
    { nameKey: "rawSprouts", level: "forbidden", reasonKey: "sproutsReason" },
    // Caution
    { nameKey: "caffeine", level: "caution", reasonKey: "caffeineReason" },
    { nameKey: "herbalTea", level: "caution", reasonKey: "herbalTeaReason" },
    { nameKey: "liver", level: "caution", reasonKey: "liverReason" },
    { nameKey: "tuna", level: "caution", reasonKey: "tunaReason" },
    { nameKey: "artificialSweeteners", level: "caution", reasonKey: "sweetenersReason" },
    // Safe alternatives
    { nameKey: "cookedFish", level: "safe", reasonKey: "cookedFishReason" },
    { nameKey: "pasteurizedDairy", level: "safe", reasonKey: "pasteurizedReason" },
    { nameKey: "wellCookedMeat", level: "safe", reasonKey: "cookedMeatReason" },
    { nameKey: "hardCheese", level: "safe", reasonKey: "hardCheeseReason" },
  ];

  const filteredFoods = foods.filter((food) =>
    t(`forbiddenFoodsPage.foods.${food.nameKey}`).toLowerCase().includes(search.toLowerCase())
  );

  const getLevelIcon = (level: SafetyLevel) => {
    switch (level) {
      case "forbidden":
        return <XCircle className="h-5 w-5 text-destructive" />;
      case "caution":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "safe":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getLevelBadge = (level: SafetyLevel) => {
    switch (level) {
      case "forbidden":
        return <Badge variant="destructive">{t('forbiddenFoodsPage.forbidden')}</Badge>;
      case "caution":
        return <Badge className="bg-yellow-500">{t('forbiddenFoodsPage.caution')}</Badge>;
      case "safe":
        return <Badge className="bg-green-500">{t('forbiddenFoodsPage.safe')}</Badge>;
    }
  };

  const groupedFoods = {
    forbidden: filteredFoods.filter((f) => f.level === "forbidden"),
    caution: filteredFoods.filter((f) => f.level === "caution"),
    safe: filteredFoods.filter((f) => f.level === "safe"),
  };

  return (
    <Layout title={t('tools.forbiddenFoods.title')} showBack>
      <div className="container max-w-2xl py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative mb-6">
            <Search className="absolute start-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('forbiddenFoodsPage.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-10"
            />
          </div>

          {Object.entries(groupedFoods).map(([level, items]) => (
            items.length > 0 && (
              <div key={level} className="mb-6">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  {getLevelIcon(level as SafetyLevel)}
                  {t(`forbiddenFoodsPage.${level}Title`)}
                </h2>
                <div className="space-y-2">
                  {items.map((food, index) => (
                    <motion.div
                      key={food.nameKey}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card>
                        <CardContent className="py-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-medium">
                                {t(`forbiddenFoodsPage.foods.${food.nameKey}`)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {t(`forbiddenFoodsPage.reasons.${food.reasonKey}`)}
                              </p>
                            </div>
                            {getLevelBadge(food.level)}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )
          ))}

          <Card className="mt-6 border-primary/20 bg-primary/5">
            <CardContent className="pt-4">
              <div className="flex gap-2">
                <AlertTriangle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  {t('forbiddenFoodsPage.disclaimer')}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default ForbiddenFoods;
