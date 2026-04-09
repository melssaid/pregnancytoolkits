import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useInAppReview } from '@/hooks/useInAppReview';

interface AIFeedbackPromptProps {
  toolId: string;
  onFeedback?: (positive: boolean) => void;
}

export function AIFeedbackPrompt({ toolId, onFeedback }: AIFeedbackPromptProps) {
  const { t } = useTranslation();
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const { maybePromptReview } = useInAppReview();

  const storageKey = `ai_feedback_${toolId}_${new Date().toDateString()}`;

  // Don't show if already submitted today
  if (typeof window !== 'undefined' && localStorage.getItem(storageKey)) return null;

  const handleFeedback = (positive: boolean) => {
    setFeedback(positive ? 'positive' : 'negative');
    setShowThankYou(true);
    onFeedback?.(positive);

    try {
      localStorage.setItem(storageKey, positive ? '1' : '0');
    } catch {}

    if (positive) {
      // Trigger Play Store review after positive feedback
      setTimeout(() => maybePromptReview('ai_result_positive'), 1500);
    }
  };

  if (showThankYou) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-primary/5 border border-primary/10"
      >
        {feedback === 'positive' ? (
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
        ) : null}
        <span className="text-[11px] font-semibold text-muted-foreground">
          {feedback === 'positive'
            ? t('aiFeedback.thankYou', { defaultValue: 'شكراً لتقييمك! 💕' })
            : t('aiFeedback.willImprove', { defaultValue: 'شكراً! سنعمل على التحسين 🙏' })
          }
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="flex items-center justify-between py-2 px-3 rounded-xl bg-muted/30 border border-border/30"
    >
      <span className="text-[11px] font-semibold text-muted-foreground">
        {t('aiFeedback.question', { defaultValue: 'هل أفادتك هذه النتيجة؟' })}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleFeedback(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 transition-colors"
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold">{t('aiFeedback.yes', { defaultValue: 'نعم' })}</span>
        </button>
        <button
          onClick={() => handleFeedback(false)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
        >
          <ThumbsDown className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold">{t('aiFeedback.no', { defaultValue: 'لا' })}</span>
        </button>
      </div>
    </motion.div>
  );
}
