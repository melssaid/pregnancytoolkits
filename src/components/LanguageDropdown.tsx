import React, { useState, forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { setManualLanguage } from '@/i18n';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Create a forwardRef motion button to work with Radix's asChild
const MotionButton = forwardRef<HTMLButtonElement, HTMLMotionProps<"button"> & { className?: string }>(
  ({ children, ...props }, ref) => (
    <motion.button ref={ref} {...props}>
      {children}
    </motion.button>
  )
);

const languages = [
  { code: 'en', flag: '🇺🇸', short: 'EN' },
  { code: 'ar', flag: '🇸🇦', short: 'ع' },
  { code: 'de', flag: '🇩🇪', short: 'DE' },
  { code: 'tr', flag: '🇹🇷', short: 'TR' },
  { code: 'fr', flag: '🇫🇷', short: 'FR' },
  { code: 'es', flag: '🇪🇸', short: 'ES' },
  { code: 'pt', flag: '🇵🇹', short: 'PT' },
];

interface LanguageDropdownProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export const LanguageDropdown: React.FC<LanguageDropdownProps> = ({ 
  className 
}) => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const currentLanguage = i18n.language?.split('-')[0] || 'en';
  const currentLang = languages.find(l => l.code === currentLanguage) || languages[0];

  const handleLanguageChange = (langCode: string) => {
    setManualLanguage(langCode);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <MotionButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "relative inline-flex items-center justify-center",
            "h-7 w-7 rounded-full",
            "bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20",
            "border border-primary/30 hover:border-primary/50",
            "shadow-sm hover:shadow-md hover:shadow-primary/20",
            "transition-all duration-300",
            "group overflow-hidden",
            className
          )}
        >
          {/* Animated glow effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
            }}
          />
          
          <span className="relative text-sm leading-none z-10">{currentLang.flag}</span>
          
          {/* Hover indicator */}
          <motion.div
            className="absolute -bottom-0.5 left-1/2 h-0.5 bg-primary rounded-full"
            initial={{ width: 0, x: '-50%' }}
            whileHover={{ width: '60%' }}
            transition={{ duration: 0.2 }}
          />
        </MotionButton>
      </PopoverTrigger>
      
      <PopoverContent 
        align="end" 
        sideOffset={8}
        className="w-auto p-2 bg-popover/95 backdrop-blur-lg border border-border/80 shadow-2xl shadow-primary/10 rounded-xl z-[100]"
      >
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-1.5"
          >
            {/* Header */}
            <div className="flex items-center gap-1.5 px-2 pb-1.5 border-b border-border/50">
              <Globe className="h-3 w-3 text-primary" />
              <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">
                Language
              </span>
            </div>
            
            {/* Language Grid */}
            <div className="grid grid-cols-4 gap-1">
              {languages.map((lang, index) => (
                <motion.button
                  key={lang.code}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={cn(
                    "relative flex flex-col items-center justify-center",
                    "w-10 h-10 rounded-lg",
                    "transition-all duration-200",
                    "hover:bg-accent active:scale-95",
                    currentLanguage === lang.code 
                      ? "bg-primary/15 ring-1.5 ring-primary/40 shadow-sm shadow-primary/20" 
                      : "hover:shadow-sm"
                  )}
                >
                  <span className="text-lg leading-none">{lang.flag}</span>
                  <span className={cn(
                    "text-[8px] font-bold mt-0.5 tracking-tight",
                    currentLanguage === lang.code 
                      ? "text-primary" 
                      : "text-muted-foreground"
                  )}>
                    {lang.short}
                  </span>
                  
                  {/* Active indicator dot */}
                  {currentLanguage === lang.code && (
                    <motion.div
                      layoutId="activeLanguage"
                      className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-primary rounded-full ring-2 ring-popover"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  );
};