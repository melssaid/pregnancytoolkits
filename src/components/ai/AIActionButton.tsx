import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Loader2, Sparkles } from 'lucide-react';

interface AIActionButtonProps {
  onClick: () => void;
  isLoading: boolean;
  label: string;
  loadingLabel?: string;
  disabled?: boolean;
  icon?: React.ElementType;
  className?: string;
  variant?: 'default' | 'compact';
}

/**
 * Unified AI action button used across all tool pages.
 * Clean gradient with shimmer effect and pulse animation.
 */
export const AIActionButton: React.FC<AIActionButtonProps> = ({
  onClick,
  isLoading,
  label,
  loadingLabel,
  disabled,
  icon: CustomIcon,
  className = '',
  variant = 'default',
}) => {
  const Icon = CustomIcon || Brain;
  const isCompact = variant === 'compact';

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || isLoading}
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.01 }}
      className={`
        relative w-full overflow-hidden rounded-xl
        disabled:opacity-50 disabled:cursor-not-allowed
        group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2
        ${className}
      `}
    >
      {/* Background gradient */}
      <div
        className={`
          w-full flex items-center justify-center gap-2
          font-semibold text-white
          transition-all duration-300
          ${isCompact ? 'px-4 h-10 text-xs rounded-xl' : 'px-5 h-[52px] text-sm rounded-xl'}
        `}
        style={{
          background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(330 65% 50%) 50%, hsl(270 55% 50%) 100%)',
          boxShadow: isLoading
            ? 'none'
            : '0 4px 16px -2px hsl(var(--primary) / 0.35), 0 1px 4px hsl(var(--primary) / 0.2)',
        }}
      >
        {isLoading ? (
          <div className="flex items-center gap-2.5">
            <Loader2 className={`animate-spin shrink-0 ${isCompact ? 'w-3.5 h-3.5' : 'w-[18px] h-[18px]'}`} />
            <span className="truncate">{loadingLabel || label}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="relative shrink-0">
              <Icon className={`${isCompact ? 'w-3.5 h-3.5' : 'w-[18px] h-[18px]'}`} />
              <Sparkles className={`absolute -top-1 -end-1.5 text-yellow-300 opacity-80 ${isCompact ? 'w-2 h-2' : 'w-2.5 h-2.5'}`} />
            </div>
            <span className="truncate">{label}</span>
          </div>
        )}
      </div>

      {/* Shimmer sweep on hover */}
      <span
        className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
        aria-hidden
      />
    </motion.button>
  );
};

export default AIActionButton;
