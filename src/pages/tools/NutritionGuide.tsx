import { useState } from "react";
import { ToolFrame } from "@/components/ToolFrame";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Apple, Leaf, Fish, Milk, Wheat, Pill, Droplets, Info, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface NutrientItem {
  name: string;
  amount: string;
  unit: string;
  benefit?: string;
}

interface NutritionCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  items: NutrientItem[];
}

const NutritionGuide = () => {
  const [activeTab, setActiveTab] = useState("food");

  const foodCategories: NutritionCategory[] = [
    {
      id: "proteins",
      title: "Proteins",
      icon: Fish,
      color: "text-blue-500",
      items: [
        { name: "Lean meat (chicken, beef)", amount: "2-3", unit: "servings/day", benefit: "Builds baby's muscles" },
        { name: "Fish (low-mercury)", amount: "2-3", unit: "servings/week", benefit: "Brain development" },
        { name: "Eggs", amount: "1-2", unit: "per day", benefit: "Choline for brain" },
        { name: "Legumes & beans", amount: "1-2", unit: "servings/day", benefit: "Fiber & plant protein" },
      ],
    },
    {
      id: "dairy",
      title: "Dairy",
      icon: Milk,
      color: "text-amber-500",
      items: [
        { name: "Milk (pasteurized)", amount: "3", unit: "cups/day", benefit: "Calcium for bones" },
        { name: "Yogurt", amount: "1-2", unit: "servings/day", benefit: "Probiotics" },
        { name: "Cheese", amount: "40g", unit: "per day", benefit: "Protein & calcium" },
      ],
    },
    {
      id: "fruits",
      title: "Fruits",
      icon: Apple,
      color: "text-red-500",
      items: [
        { name: "Fresh fruits", amount: "3-4", unit: "servings/day", benefit: "Vitamins & fiber" },
        { name: "Citrus fruits", amount: "1-2", unit: "per day", benefit: "Vitamin C" },
        { name: "Berries", amount: "1", unit: "cup/day", benefit: "Antioxidants" },
      ],
    },
    {
      id: "vegetables",
      title: "Vegetables",
      icon: Leaf,
      color: "text-green-500",
      items: [
        { name: "Leafy greens (spinach, kale)", amount: "2-3", unit: "servings/day", benefit: "Folate & iron" },
        { name: "Colorful vegetables", amount: "2-3", unit: "servings/day", benefit: "Various vitamins" },
        { name: "Sweet potatoes", amount: "1", unit: "serving/day", benefit: "Vitamin A" },
      ],
    },
    {
      id: "grains",
      title: "Whole Grains",
      icon: Wheat,
      color: "text-orange-500",
      items: [
        { name: "Whole grain bread/pasta", amount: "6-8", unit: "servings/day", benefit: "Energy & B vitamins" },
        { name: "Oats", amount: "1", unit: "cup/day", benefit: "Fiber & iron" },
        { name: "Brown rice", amount: "1", unit: "cup/day", benefit: "Complex carbs" },
      ],
    },
    {
      id: "hydration",
      title: "Hydration",
      icon: Droplets,
      color: "text-cyan-500",
      items: [
        { name: "Water", amount: "8-12", unit: "cups/day", benefit: "Prevents dehydration" },
        { name: "Coconut water", amount: "1-2", unit: "cups/day", benefit: "Electrolytes" },
        { name: "Fresh fruit juice", amount: "1", unit: "cup/day", benefit: "Vitamins (limit sugar)" },
      ],
    },
  ];

  const supplements: NutrientItem[] = [
    { name: "Folic Acid", amount: "400-800", unit: "mcg", benefit: "Prevents neural tube defects" },
    { name: "Iron", amount: "27", unit: "mg", benefit: "Prevents anemia, supports baby growth" },
    { name: "Calcium", amount: "1000", unit: "mg", benefit: "Strong bones for you and baby" },
    { name: "Vitamin D", amount: "600", unit: "IU", benefit: "Calcium absorption, immune system" },
    { name: "DHA (Omega-3)", amount: "200-300", unit: "mg", benefit: "Baby's brain & eye development" },
    { name: "Iodine", amount: "220", unit: "mcg", benefit: "Thyroid function, brain development" },
    { name: "Vitamin B12", amount: "2.6", unit: "mcg", benefit: "Nerve function, red blood cells" },
  ];

  return (
    <ToolFrame
      title="Pregnancy Nutrition Guide"
      subtitle="Essential nutrients for a healthy pregnancy"
      icon={Apple}
      mood="nurturing"
    >
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="food">Daily Foods</TabsTrigger>
            <TabsTrigger value="supplements">Supplements</TabsTrigger>
          </TabsList>

          <TabsContent value="food" className="mt-4 space-y-4">
            {foodCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <category.icon className={`h-5 w-5 ${category.color}`} />
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {category.items.map((item, idx) => (
                        <li key={idx} className="flex items-start justify-between py-2 border-b last:border-0">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              <span className="font-medium">{item.name}</span>
                            </div>
                            {item.benefit && (
                              <p className="text-xs text-muted-foreground ml-6 mt-1">{item.benefit}</p>
                            )}
                          </div>
                          <Badge variant="secondary" className="ml-2 whitespace-nowrap">
                            {item.amount} {item.unit}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="supplements" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Pill className="h-5 w-5 text-purple-500" />
                  Daily Prenatal Supplements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {supplements.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{item.name}</h4>
                        <Badge>{item.amount} {item.unit}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.benefit}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
              <CardContent className="pt-4">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900 dark:text-amber-100">Important</p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Always consult your healthcare provider before taking any supplements. 
                      Your doctor can recommend the right prenatal vitamin based on your specific needs.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> This guide provides general nutritional recommendations for pregnancy. 
              Individual needs may vary based on health conditions, activity level, and trimester. 
              Always discuss your diet with your healthcare provider.
            </p>
          </CardContent>
        </Card>
      </div>
    </ToolFrame>
  );
};

export default NutritionGuide;
