import { Info } from 'lucide-react';

interface InlineDisclaimerProps {
  compact?: boolean;
}

export const InlineDisclaimer = ({ compact = false }: InlineDisclaimerProps) => {
  if (compact) {
    return (
      <p className="text-[10px] text-muted-foreground text-center">
        For informational purposes only. Consult your healthcare provider.
      </p>
    );
  }

  return (
    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/30 border border-border/50">
      <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-muted-foreground" />
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        For informational purposes only. Always consult your healthcare provider for medical advice.
      </p>
    </div>
  );
};
