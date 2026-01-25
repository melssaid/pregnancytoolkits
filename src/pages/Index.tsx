import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Crown, CheckCircle, Shield, Brain, Baby, Heart, Activity, Dumbbell, AlertTriangle, Package, Clock, Users, MessageCircle, LayoutGrid, List, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { ToolCard } from "@/components/ToolCard";
import { getSortedTools, toolsData } from "@/lib/tools-data";
import { Button } from "@/components/ui/button";
import useSubscription from "@/hooks/useSubscription";

// Fixed category keys to match tools-data (no extra categories)
const categoryKeys = [
  "categories.all",
  "categories.ai",
  "categories.fertility",
  "categories.pregnancy",
  "categories.wellness",
  "categories.mentalHealth",
  "categories.riskAssessment",
  "categories.labor",
  "categories.postpartum",
];

const categoryIcons: Record<string, any> = {
  "categories.ai": Brain,
  "categories.fertility": Activity,
  "categories.pregnancy": Baby,
  "categories.wellness": Dumbbell,
  "categories.mentalHealth": Heart,
  "categories.riskAssessment": AlertTriangle,
  "categories.labor": Clock,
  "categories.postpartum": Users,
};

// ... rest same, with key={`${viewMode}-${activeCategory}`} in motion.div
// Fallback in t(): t(tool.titleKey, tool.id)
// Add ErrorBoundary wrapper

export default Index;