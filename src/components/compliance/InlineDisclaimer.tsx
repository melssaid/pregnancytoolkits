import { ShieldCheck } from 'lucide-react';

interface InlineDisclaimerProps {
  compact?: boolean;
}

export const InlineDisclaimer = ({ compact = false }: InlineDisclaimerProps) => {
  if (compact) {
    return (
      <p className="text-[9px] text-muted-foreground/60 text-center">
        For informational purposes only. Consult your healthcare provider.
      </p>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted/20 border border-border/30">
      <ShieldCheck className="w-2.5 h-2.5 flex-shrink-0 text-muted-foreground/50" />
      <p className="text-[9px] text-muted-foreground/60 leading-relaxed">
        For informational purposes only. Always consult your healthcare provider for medical advice.
      </p>
    </div>
  );
};
