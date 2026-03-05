import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Brain } from 'lucide-react';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { useTranslation } from 'react-i18next';
import { useMemo, useEffect } from 'react';

interface AIResponseFrameProps {
  content: string;
  isLoading?: boolean;
  title?: string;
  icon?: React.ComponentType<{ className?: string }>;
  subtitle?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  accentColor?: string;
  /** Expected max characters for progress estimation (default: 2000) */
  expectedLength?: number;
}

/**
 * Unified professional AI response frame with gradient accent bar,
 * header section, streaming progress indicator, and subtle disclaimer.
 */
export const AIResponseFrame = ({
  content,
  isLoading = false,
  title,
  icon: Icon = Brain,
  subtitle,
  children,
  footer,
  expectedLength = 2000,
}: AIResponseFrameProps) => {
  const { t } = useTranslation();

  // Estimate progress: use a logarithmic curve so it fills fast initially, slows near 100%
  const rawProgress = useMemo(() => {
    if (!isLoading && content.length > 0) return 100;
    if (content.length === 0) return 2;
    // Logarithmic progress: fills ~80% at expectedLength, asymptotes toward 95%
    const ratio = content.length / expectedLength;
    return Math.min(95, Math.round(2 + 93 * (1 - Math.exp(-2.5 * ratio))));
  }, [content.length, isLoading, expectedLength]);

  const springProgress = useSpring(useMotionValue(0), { stiffness: 40, damping: 20 });

  useEffect(() => {
    springProgress.set(rawProgress);
  }, [rawProgress, springProgress]);

  const showProgress = isLoading || (rawProgress > 0 && rawProgress < 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-2xl overflow-hidden border border-primary/15 shadow-sm"
    >
      {/* Gradient accent top bar — doubles as progress track */}
      <div className="h-1.5 w-full bg-muted/30 relative overflow-hidden">
        {showProgress ? (
          <motion.div
            className="absolute inset-y-0 start-0 rounded-full"
            style={{
              width: springProgress.get() + '%',
              background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))',
            }}
            animate={{
              width: rawProgress + '%',
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))',
            }}
          />
        )}
        {/* Shimmer effect during loading */}
        {isLoading && (
          <motion.div
            className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ['-80px', '400px'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </div>

      {/* Header */}
      {(title || subtitle) && (
        <div className="flex items-center gap-2.5 px-4 pt-3.5 pb-1">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(330 70% 55% / 0.1))',
            }}
          >
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            {title && (
              <h3 className="text-sm font-bold text-foreground leading-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-[10px] text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {isLoading && (
            <div className="flex items-center gap-2 ms-auto">
              <span className="text-[10px] font-medium text-muted-foreground tabular-nums">
                {rawProgress}%
              </span>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-primary"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="px-4 pb-4 pt-1">
        <div className="rounded-xl bg-gradient-to-b from-primary/[0.04] to-transparent p-3">
          {children || (
            <MarkdownRenderer content={content} isLoading={isLoading} />
          )}
        </div>
        {footer}

        {/* Disclaimer */}
        <div className="mt-3 mx-auto max-w-[85%] px-3 py-1.5 rounded-full bg-muted/40 border border-border/30 text-center">
          <p className="text-[9px] text-muted-foreground/60 tracking-wide">
            {t('ai.resultDisclaimer', 'AI-generated • Consult your healthcare provider')}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default AIResponseFrame;
