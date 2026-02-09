import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface MedicalInfoBarProps {
  compact?: boolean;
}

const MedicalInfoBar: React.FC<MedicalInfoBarProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/30 border border-border/30">
        <ShieldCheck className="w-2.5 h-2.5 text-muted-foreground/60 shrink-0" />
        <span className="text-[9px] text-muted-foreground/70 leading-tight">
          For informational purposes only. Consult your healthcare provider.
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/20 border border-border/30">
      <ShieldCheck className="w-3 h-3 text-muted-foreground/50 shrink-0" />
      <span className="text-[10px] text-muted-foreground/70 leading-relaxed">
        This tool provides general guidance. Always consult your healthcare provider for medical advice.
      </span>
    </div>
  );
};

export default MedicalInfoBar;
