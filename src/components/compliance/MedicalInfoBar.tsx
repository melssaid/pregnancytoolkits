import React from 'react';

interface MedicalInfoBarProps {
  compact?: boolean;
}

const MedicalInfoBar: React.FC<MedicalInfoBarProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="px-3 py-1.5 rounded-lg bg-muted/30 border border-border/30">
        <span className="text-[8px] text-muted-foreground/50 leading-tight">
          For informational purposes only. Consult your healthcare provider.
        </span>
      </div>
    );
  }

  return (
    <div className="px-3 py-2 rounded-lg bg-muted/20 border border-border/30">
      <span className="text-[9px] text-muted-foreground/50 leading-relaxed">
        This tool provides general guidance. Always consult your healthcare provider for medical advice.
      </span>
    </div>
  );
};

export default MedicalInfoBar;
