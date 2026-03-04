interface InlineDisclaimerProps {
  compact?: boolean;
}

export const InlineDisclaimer = ({ compact = false }: InlineDisclaimerProps) => {
  if (compact) {
    return (
      <p className="text-[8px] text-muted-foreground/40 text-center">
        For informational purposes only. Consult your healthcare provider.
      </p>
    );
  }

  return (
    <div className="px-2.5 py-1.5 rounded-lg bg-muted/20 border border-border/30">
      <p className="text-[8px] text-muted-foreground/50 leading-relaxed">
        For informational purposes only. Always consult your healthcare provider for medical advice.
      </p>
    </div>
  );
};
