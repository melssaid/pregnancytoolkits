import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { SEOHead } from '@/components/SEOHead';
import { motion } from 'framer-motion';
import { Globe, Check, ChevronDown, Languages, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

const languages = [
  { code: 'en', name: 'English', native: 'English', flag: '🇺🇸', short: 'EN' },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦', short: 'ع' },
  { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪', short: 'DE' },
  { code: 'tr', name: 'Turkish', native: 'Türkçe', flag: '🇹🇷', short: 'TR' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷', short: 'FR' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸', short: 'ES' },
  { code: 'pt', name: 'Portuguese', native: 'Português', flag: '🇵🇹', short: 'PT' },
];

const LanguageStylePreview: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const [selected, setSelected] = useState<number | null>(null);

  const currentLang = languages.find(l => l.code === currentLanguage) || languages[0];

  return (
    <Layout showBack>
      <SEOHead title="Language Icon Styles" description="Preview language selector styles" />
      <div className="container py-6 pb-28 max-w-lg mx-auto space-y-8">

        <div className="text-center mb-4">
          <h1 className="text-xl font-bold text-foreground">نماذج أيقونة اللغة</h1>
          <p className="text-xs text-muted-foreground mt-1">اختر النموذج الأنسب لتطبيقك</p>
        </div>

        {/* ─── Style 1: Flag Only (Circle) ─── */}
        <StyleCard
          index={0}
          selected={selected}
          onSelect={setSelected}
          title="١. علم دائري فقط"
          description="أيقونة مدمجة — علم اللغة الحالية في دائرة"
        >
          <div className="flex items-center justify-center gap-4">
            <motion.button whileTap={{ scale: 0.9 }} className="w-10 h-10 rounded-full bg-muted/60 border border-border/50 flex items-center justify-center text-lg shadow-sm">
              {currentLang.flag}
            </motion.button>
            <span className="text-xs text-muted-foreground">← الشكل في الشريط العلوي</span>
          </div>
        </StyleCard>

        {/* ─── Style 2: Flag + Short Code ─── */}
        <StyleCard
          index={1}
          selected={selected}
          onSelect={setSelected}
          title="٢. علم + رمز اللغة"
          description="يعرض العلم مع اختصار اللغة بجانبه"
        >
          <div className="flex items-center justify-center gap-4">
            <motion.button whileTap={{ scale: 0.9 }} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/60 border border-border/50 shadow-sm">
              <span className="text-base">{currentLang.flag}</span>
              <span className="text-xs font-bold text-foreground">{currentLang.short}</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </motion.button>
            <span className="text-xs text-muted-foreground">← الشكل في الشريط العلوي</span>
          </div>
        </StyleCard>

        {/* ─── Style 3: Globe Icon ─── */}
        <StyleCard
          index={2}
          selected={selected}
          onSelect={setSelected}
          title="٣. أيقونة الكرة الأرضية"
          description="أيقونة كرة أرضية عامة بدون علم"
        >
          <div className="flex items-center justify-center gap-4">
            <motion.button whileTap={{ scale: 0.9 }} className="w-10 h-10 rounded-xl bg-muted/60 border border-border/50 flex items-center justify-center shadow-sm">
              <Globe className="w-5 h-5 text-primary" />
            </motion.button>
            <span className="text-xs text-muted-foreground">← الشكل في الشريط العلوي</span>
          </div>
        </StyleCard>

        {/* ─── Style 4: Globe + Label ─── */}
        <StyleCard
          index={3}
          selected={selected}
          onSelect={setSelected}
          title="٤. كرة أرضية + اسم اللغة"
          description="أيقونة الكرة الأرضية مع اسم اللغة الحالية"
        >
          <div className="flex items-center justify-center gap-4">
            <motion.button whileTap={{ scale: 0.9 }} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/60 border border-border/50 shadow-sm">
              <Globe className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-foreground">{currentLang.native}</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </motion.button>
            <span className="text-xs text-muted-foreground">← الشكل في الشريط العلوي</span>
          </div>
        </StyleCard>

        {/* ─── Style 5: Languages Icon ─── */}
        <StyleCard
          index={4}
          selected={selected}
          onSelect={setSelected}
          title="٥. أيقونة الترجمة"
          description="أيقونة ترجمة (A/文) احترافية"
        >
          <div className="flex items-center justify-center gap-4">
            <motion.button whileTap={{ scale: 0.9 }} className="w-10 h-10 rounded-xl bg-muted/60 border border-border/50 flex items-center justify-center shadow-sm">
              <Languages className="w-5 h-5 text-primary" />
            </motion.button>
            <span className="text-xs text-muted-foreground">← الشكل في الشريط العلوي</span>
          </div>
        </StyleCard>

        {/* ─── Style 6: Pill Badge ─── */}
        <StyleCard
          index={5}
          selected={selected}
          onSelect={setSelected}
          title="٦. شارة مدمجة (Pill)"
          description="شارة صغيرة بالعلم والرمز في كبسولة"
        >
          <div className="flex items-center justify-center gap-4">
            <motion.button whileTap={{ scale: 0.9 }} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 shadow-sm">
              <span className="text-sm">{currentLang.flag}</span>
              <span className="text-[10px] font-bold text-primary">{currentLang.short}</span>
            </motion.button>
            <span className="text-xs text-muted-foreground">← الشكل في الشريط العلوي</span>
          </div>
        </StyleCard>

        {/* ─── Style 7: Minimal Text ─── */}
        <StyleCard
          index={6}
          selected={selected}
          onSelect={setSelected}
          title="٧. نص فقط (Minimal)"
          description="رمز اللغة فقط بخط عريض بدون أيقونة"
        >
          <div className="flex items-center justify-center gap-4">
            <motion.button whileTap={{ scale: 0.9 }} className="w-9 h-9 rounded-lg bg-muted/60 border border-border/50 flex items-center justify-center shadow-sm">
              <span className="text-xs font-black text-primary tracking-tight">{currentLang.short}</span>
            </motion.button>
            <span className="text-xs text-muted-foreground">← الشكل في الشريط العلوي</span>
          </div>
        </StyleCard>

        {/* ─── Style 8: Floating Flag with dot ─── */}
        <StyleCard
          index={7}
          selected={selected}
          onSelect={setSelected}
          title="٨. علم عائم مع نقطة نشطة"
          description="علم في مربع مع نقطة خضراء تدل على اللغة النشطة"
        >
          <div className="flex items-center justify-center gap-4">
            <motion.button whileTap={{ scale: 0.9 }} className="relative w-10 h-10 rounded-xl bg-muted/60 border border-border/50 flex items-center justify-center text-lg shadow-sm">
              {currentLang.flag}
              <span className="absolute -top-0.5 -end-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
            </motion.button>
            <span className="text-xs text-muted-foreground">← الشكل في الشريط العلوي</span>
          </div>
        </StyleCard>

        {/* Selection Result */}
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-4 text-center"
          >
            <Sparkles className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-sm font-semibold text-foreground">
              اخترت النموذج رقم {selected + 1}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              أخبرني برقم النموذج المفضل وسأطبقه على التطبيق
            </p>
          </motion.div>
        )}

      </div>
    </Layout>
  );
};

interface StyleCardProps {
  index: number;
  selected: number | null;
  onSelect: (i: number) => void;
  title: string;
  description: string;
  children: React.ReactNode;
}

const StyleCard: React.FC<StyleCardProps> = ({ index, selected, onSelect, title, description, children }) => {
  const isSelected = selected === index;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onSelect(index)}
      className={cn(
        "rounded-2xl border p-4 space-y-3 cursor-pointer transition-all duration-200",
        isSelected
          ? "border-primary/50 bg-primary/5 shadow-md shadow-primary/10 ring-1 ring-primary/20"
          : "border-border/60 bg-card hover:border-border"
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
          <p className="text-[10px] text-muted-foreground">{description}</p>
        </div>
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0"
          >
            <Check className="w-3.5 h-3.5 text-primary-foreground" />
          </motion.div>
        )}
      </div>
      <div className="py-2">{children}</div>
    </motion.div>
  );
};

export default LanguageStylePreview;
