import { useState } from "react";
import { motion } from "framer-motion";
import { Pill, Search, CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Medication {
  name: string;
  category: "safe" | "caution" | "avoid";
  pregnancy: string;
  breastfeeding: string;
  notes?: string;
}

const medications: Medication[] = [
  // Pain relievers
  { name: "Acetaminophen (Tylenol)", category: "safe", pregnancy: "Generally safe when used as directed", breastfeeding: "Safe in recommended doses" },
  { name: "Ibuprofen (Advil, Motrin)", category: "caution", pregnancy: "Avoid in 3rd trimester; use sparingly in 1st/2nd", breastfeeding: "Safe for occasional use" },
  { name: "Aspirin", category: "avoid", pregnancy: "Avoid except low-dose if prescribed", breastfeeding: "Avoid regular use" },
  { name: "Naproxen (Aleve)", category: "avoid", pregnancy: "Avoid especially in 3rd trimester", breastfeeding: "Not recommended" },
  
  // Allergy
  { name: "Diphenhydramine (Benadryl)", category: "safe", pregnancy: "Generally safe", breastfeeding: "May decrease milk supply; use occasionally" },
  { name: "Loratadine (Claritin)", category: "safe", pregnancy: "Preferred antihistamine in pregnancy", breastfeeding: "Safe" },
  { name: "Cetirizine (Zyrtec)", category: "safe", pregnancy: "Generally safe", breastfeeding: "Safe" },
  { name: "Fexofenadine (Allegra)", category: "safe", pregnancy: "Limited data but likely safe", breastfeeding: "Safe" },
  
  // Cold & Flu
  { name: "Guaifenesin (Mucinex)", category: "safe", pregnancy: "Generally safe after 1st trimester", breastfeeding: "Safe" },
  { name: "Dextromethorphan (Robitussin DM)", category: "safe", pregnancy: "Generally safe", breastfeeding: "Safe" },
  { name: "Pseudoephedrine (Sudafed)", category: "caution", pregnancy: "Avoid in 1st trimester; may affect blood flow", breastfeeding: "May decrease milk supply" },
  { name: "Phenylephrine", category: "caution", pregnancy: "Limited effectiveness; use with caution", breastfeeding: "Minimal data available" },
  
  // Digestive
  { name: "Antacids (Tums, Rolaids)", category: "safe", pregnancy: "Safe for heartburn relief", breastfeeding: "Safe" },
  { name: "Famotidine (Pepcid)", category: "safe", pregnancy: "Generally safe", breastfeeding: "Safe" },
  { name: "Omeprazole (Prilosec)", category: "caution", pregnancy: "Use if other options don't work", breastfeeding: "Safe" },
  { name: "Simethicone (Gas-X)", category: "safe", pregnancy: "Safe for gas relief", breastfeeding: "Safe" },
  { name: "Docusate (Colace)", category: "safe", pregnancy: "Safe stool softener", breastfeeding: "Safe" },
  { name: "Bismuth subsalicylate (Pepto-Bismol)", category: "avoid", pregnancy: "Avoid due to salicylate content", breastfeeding: "Avoid" },
  
  // Antibiotics
  { name: "Amoxicillin", category: "safe", pregnancy: "Safe when prescribed", breastfeeding: "Safe" },
  { name: "Azithromycin (Z-Pack)", category: "safe", pregnancy: "Safe when prescribed", breastfeeding: "Safe" },
  { name: "Cephalexin (Keflex)", category: "safe", pregnancy: "Safe when prescribed", breastfeeding: "Safe" },
  { name: "Ciprofloxacin", category: "avoid", pregnancy: "Avoid if alternatives exist", breastfeeding: "Use with caution" },
  { name: "Tetracycline/Doxycycline", category: "avoid", pregnancy: "Avoid - affects fetal teeth/bones", breastfeeding: "Avoid" },
  
  // Other
  { name: "Prenatal Vitamins", category: "safe", pregnancy: "Recommended daily", breastfeeding: "Continue taking" },
  { name: "Folic Acid", category: "safe", pregnancy: "Essential - prevents neural tube defects", breastfeeding: "Safe and recommended" },
  { name: "Iron Supplements", category: "safe", pregnancy: "Often needed; may cause constipation", breastfeeding: "Safe" },
  { name: "Melatonin", category: "caution", pregnancy: "Limited safety data; consult doctor", breastfeeding: "Limited data" },
  { name: "Caffeine", category: "caution", pregnancy: "Limit to 200mg/day", breastfeeding: "Moderate amounts OK; watch baby for fussiness" },
];

export default function SafeMedications() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredMeds = medications.filter((med) => {
    const matchesSearch = med.name.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === "all" || med.category === activeTab;
    return matchesSearch && matchesTab;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "safe":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "caution":
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case "avoid":
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return null;
    }
  };

  const getCategoryBg = (category: string) => {
    switch (category) {
      case "safe":
        return "bg-success/10 border-success/20";
      case "caution":
        return "bg-warning/10 border-warning/20";
      case "avoid":
        return "bg-destructive/10 border-destructive/20";
      default:
        return "bg-muted";
    }
  };

  return (
    <Layout title="Safe Medications Guide" showBack>
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
                  <Pill className="h-5 w-5 text-primary" />
                  Medication Safety Reference
                </CardTitle>
                <CardDescription>
                  Quick reference for common medications during pregnancy and breastfeeding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search medications..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Category Filter */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="safe" className="text-success">Safe</TabsTrigger>
                    <TabsTrigger value="caution" className="text-warning">Caution</TabsTrigger>
                    <TabsTrigger value="avoid" className="text-destructive">Avoid</TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-muted-foreground">Generally safe</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <span className="text-muted-foreground">Use with caution</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <XCircle className="h-4 w-4 text-destructive" />
                    <span className="text-muted-foreground">Avoid if possible</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medication List */}
            <div className="space-y-3">
              {filteredMeds.map((med, index) => (
                <motion.div
                  key={med.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <Card className={`border ${getCategoryBg(med.category)}`}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        {getCategoryIcon(med.category)}
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{med.name}</p>
                          <div className="mt-2 grid gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Pregnancy: </span>
                              <span className="text-foreground">{med.pregnancy}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Breastfeeding: </span>
                              <span className="text-foreground">{med.breastfeeding}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {filteredMeds.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  No medications found matching your search.
                </div>
              )}
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-lg bg-muted p-4">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                <strong>Important:</strong> This is a general reference guide only. Always 
                consult your healthcare provider or pharmacist before taking any medication 
                during pregnancy or while breastfeeding.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
