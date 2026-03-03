import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { useTranslation } from 'react-i18next';

interface AIResponseFrameProps {
  content: string;
  isLoading?: boolean;
  title?: string;
  icon?: React.ComponentType<{ className?: string }>;
  subtitle?: string;
  children?: React.ReactNode;
  /** Extra content rendered after the markdown, inside the frame */
  footer?: React.ReactNode;
  accentColor?: string;
}

/**
 * Unified professional AI response frame with gradient accent bar,
 * header section, loading dots, and subtle disclaimer.
 */
export const AIResponseFrame = ({
  content,
  isLoading = false,
  title,
  icon: Icon = Brain,
  subtitle,
  children,
  footer,
}: AIResponseFrameProps) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative rounded-2xl overflow-hidden border border-primary/15 shadow-sm"
    >
      {/* Gradient accent top bar */}
      <div
        className="h-1.5 w-full"
        style={{
          background:
            'linear-gradient(90deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))',
        }}
      />

      {/* Header */}
      {(title || subtitle) && (
        <div className="flex items-center gap-2.5 px-4 pt-3.5 pb-1">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background:
                'linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(330 70% 55% / 0.1))',
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
            <div className="flex gap-1 ms-auto">
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

        {/* Subtle disclaimer */}
        <p className="text-[8px] text-muted-foreground/40 text-center mt-2.5 tracking-wide">
          {t('ai.resultDisclaimer', 'AI-generated • Consult your healthcare provider')}
        </p>
      </div>
    </motion.div>
  );
};

export default AIResponseFrame;
