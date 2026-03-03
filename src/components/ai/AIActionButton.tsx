import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Loader2 } from 'lucide-react';

interface AIActionButtonProps {
  onClick: () => void;
  isLoading: boolean;
  label: string;
  loadingLabel?: string;
  disabled?: boolean;
  icon?: React.ElementType;
  className?: string;
}

/**
 * Unified AI action button used across all tool pages.
 * Gradient primary → pink → purple with shimmer effect.
 */
export const AIActionButton: React.FC<AIActionButtonProps> = ({
  onClick,
  isLoading,
  label,
  loadingLabel,
  disabled,
  icon: CustomIcon,
  className = '',
}) => {
  const Icon = CustomIcon || Brain;

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || isLoading}
      whileTap={{ scale: 0.95 }}
      className={`relative w-full overflow-hidden rounded-2xl disabled:opacity-60 disabled:cursor-not-allowed group ${className}`}
    >
      <div
        className="w-full flex items-center justify-center gap-2.5 px-5 h-12 font-semibold text-white text-sm rounded-2xl transition-shadow"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(330 70% 55%), hsl(280 60% 55%))',
          boxShadow: '0 4px 20px -4px hsl(var(--primary) / 0.5)',
        }}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>{loadingLabel || label}</span>
          </>
        ) : (
          <>
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
          </>
        )}
      </div>
      {/* Shimmer effect on hover */}
      <span
        className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none"
        aria-hidden
      />
    </motion.button>
  );
};

export default AIActionButton;
