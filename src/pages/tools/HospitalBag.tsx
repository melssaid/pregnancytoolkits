import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckSquare, Baby, Heart, Briefcase, Info } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

interface Category {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: ChecklistItem[];
}

const defaultCategories: Category[] = [
  {
    id: "mom-essentials",
    title: "Mom's Essentials",
    icon: <Heart className="h-5 w-5" />,
    items: [
      { id: "1", label: "ID and insurance cards", checked: false },
      { id: "2", label: "Birth plan (multiple copies)", checked: false },
      { id: "3", label: "Phone and charger", checked: false },
      { id: "4", label: "Glasses/contacts", checked: false },
      { id: "5", label: "Hair ties and headband", checked: false },
      { id: "6", label: "Lip balm", checked: false },
      { id: "7", label: "Toiletries (toothbrush, etc.)", checked: false },
      { id: "8", label: "Comfortable robe", checked: false },
      { id: "9", label: "Non-skid socks/slippers", checked: false },
      { id: "10", label: "Nursing bra", checked: false },
      { id: "11", label: "Comfortable underwear", checked: false },
      { id: "12", label: "Going-home outfit", checked: false },
      { id: "13", label: "Pillow from home", checked: false },
      { id: "14", label: "Snacks", checked: false },
    ],
  },
  {
    id: "baby-items",
    title: "Baby Items",
    icon: <Baby className="h-5 w-5" />,
    items: [
      { id: "15", label: "Onesies (2-3)", checked: false },
      { id: "16", label: "Sleep sacks or swaddles", checked: false },
      { id: "17", label: "Baby hat", checked: false },
      { id: "18", label: "Socks or booties", checked: false },
      { id: "19", label: "Going-home outfit", checked: false },
      { id: "20", label: "Receiving blankets", checked: false },
      { id: "21", label: "Car seat (installed)", checked: false },
      { id: "22", label: "Diapers (newborn size)", checked: false },
      { id: "23", label: "Baby wipes", checked: false },
      { id: "24", label: "Pacifier (if using)", checked: false },
    ],
  },
  {
    id: "partner-items",
    title: "Partner/Support Person",
    icon: <Briefcase className="h-5 w-5" />,
    items: [
      { id: "25", label: "Change of clothes", checked: false },
      { id: "26", label: "Toiletries", checked: false },
      { id: "27", label: "Phone charger", checked: false },
      { id: "28", label: "Snacks and drinks", checked: false },
      { id: "29", label: "Camera", checked: false },
      { id: "30", label: "Entertainment (book, tablet)", checked: false },
      { id: "31", label: "Pillow and blanket", checked: false },
      { id: "32", label: "Wallet and cash", checked: false },
    ],
  },
];

const STORAGE_KEY = "hospital-bag-checklist";

export default function HospitalBag() {
  const [categories, setCategories] = useState<Category[]>(defaultCategories);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setCategories(JSON.parse(saved));
    }
  }, []);

  const toggleItem = (categoryId: string, itemId: string) => {
    const newCategories = categories.map((cat) => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: cat.items.map((item) =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
          ),
        };
      }
      return cat;
    });
    setCategories(newCategories);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newCategories));
  };

  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  const checkedItems = categories.reduce(
    (sum, cat) => sum + cat.items.filter((i) => i.checked).length,
    0
  );
  const progressPercent = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;

  return (
    <Layout title="Hospital Bag Checklist" showBack>
      <div className="container py-8">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Progress Overview */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-primary" />
                  Packing Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Items packed</span>
                    <span className="font-medium text-foreground">
                      {checkedItems} of {totalItems}
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-3" />
                  {progressPercent === 100 && (
                    <p className="text-sm text-success font-medium text-center pt-2">
                      🎒 You're all packed and ready!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Checklist Categories */}
            <div className="space-y-4">
              {categories.map((category, catIndex) => {
                const catChecked = category.items.filter((i) => i.checked).length;
                const catTotal = category.items.length;

                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: catIndex * 0.1 }}
                  >
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center justify-between text-lg">
                          <span className="flex items-center gap-2 text-primary">
                            {category.icon}
                            {category.title}
                          </span>
                          <span className="text-sm font-normal text-muted-foreground">
                            {catChecked}/{catTotal}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {category.items.map((item) => (
                            <label
                              key={item.id}
                              className="flex items-center gap-3 cursor-pointer group"
                            >
                              <Checkbox
                                checked={item.checked}
                                onCheckedChange={() => toggleItem(category.id, item.id)}
                              />
                              <span
                                className={`text-sm transition-all ${
                                  item.checked
                                    ? "text-muted-foreground line-through"
                                    : "text-foreground group-hover:text-primary"
                                }`}
                              >
                                {item.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-lg bg-muted p-4">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                Pack your bag around 36 weeks. Keep it somewhere easy to grab, 
                and make sure your partner knows where it is!
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
