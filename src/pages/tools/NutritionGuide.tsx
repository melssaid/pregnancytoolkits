import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Apple, Leaf, Fish, Milk, Wheat, Pill } from "lucide-react";
import { motion } from "framer-motion";

const NutritionGuide = () => {
  const { t } = useTranslation();

  const nutritionCategories = [
    {
      id: "proteins",
      icon: Fish,
      items: [
        { name: t('nutritionPage.items.leanMeat'), amount: "2-3", unit: t('nutritionPage.servings') },
        { name: t('nutritionPage.items.fish'), amount: "2-3", unit: t('nutritionPage.perWeek') },
        { name: t('nutritionPage.items.eggs'), amount: "1-2", unit: t('nutritionPage.perDay') },
        { name: t('nutritionPage.items.legumes'), amount: "1-2", unit: t('nutritionPage.servings') },
      ],
    },
    {
      id: "dairy",
      icon: Milk,
      items: [
        { name: t('nutritionPage.items.milk'), amount: "3", unit: t('nutritionPage.cups') },
        { name: t('nutritionPage.items.yogurt'), amount: "1-2", unit: t('nutritionPage.servings') },
        { name: t('nutritionPage.items.cheese'), amount: "40g", unit: t('nutritionPage.perDay') },
      ],
    },
    {
      id: "fruits",
      icon: Apple,
      items: [
        { name: t('nutritionPage.items.freshFruits'), amount: "3-4", unit: t('nutritionPage.servings') },
        { name: t('nutritionPage.items.citrus'), amount: "1-2", unit: t('nutritionPage.perDay') },
        { name: t('nutritionPage.items.berries'), amount: "1", unit: t('nutritionPage.cup') },
      ],
    },
    {
      id: "vegetables",
      icon: Leaf,
      items: [
        { name: t('nutritionPage.items.leafyGreens'), amount: "2-3", unit: t('nutritionPage.servings') },
        { name: t('nutritionPage.items.coloredVeggies'), amount: "2-3", unit: t('nutritionPage.servings') },
        { name: t('nutritionPage.items.legumes'), amount: "1", unit: t('nutritionPage.servings') },
      ],
    },
    {
      id: "grains",
      icon: Wheat,
      items: [
        { name: t('nutritionPage.items.wholeGrains'), amount: "6-8", unit: t('nutritionPage.servings') },
        { name: t('nutritionPage.items.oats'), amount: "1", unit: t('nutritionPage.cup') },
        { name: t('nutritionPage.items.brownRice'), amount: "1", unit: t('nutritionPage.cup') },
      ],
    },
    {
      id: "supplements",
      icon: Pill,
      items: [
        { name: t('nutritionPage.items.folicAcid'), amount: "400-800", unit: "mcg" },
        { name: t('nutritionPage.items.iron'), amount: "27", unit: "mg" },
        { name: t('nutritionPage.items.calcium'), amount: "1000", unit: "mg" },
        { name: t('nutritionPage.items.vitaminD'), amount: "600", unit: "IU" },
        { name: t('nutritionPage.items.omega3'), amount: "200-300", unit: "mg DHA" },
      ],
    },
  ];

  return (
    <Layout title={t('tools.nutritionGuide.title')} showBack>
      <div className="container max-w-2xl py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-muted-foreground mb-6 text-center">
            {t('nutritionPage.subtitle')}
          </p>

          <div className="grid gap-4">
            {nutritionCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <category.icon className="h-5 w-5 text-primary" />
                      {t(`nutritionPage.categories.${category.id}`)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.items.map((item, idx) => (
                        <li key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
                          <span>{item.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {item.amount} {item.unit}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="mt-6">
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                <strong>{t('common.info')}:</strong> {t('nutritionPage.info')}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default NutritionGuide;
