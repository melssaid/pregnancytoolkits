import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface MedicalInfoBarProps {
  compact?: boolean;
}

const MedicalInfoBar: React.FC<MedicalInfoBarProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="relative overflow-hidden">
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/80 dark:from-slate-900/50 dark:to-slate-800/30 border border-slate-200/60 dark:border-slate-700/40">
          {/* Decorative accent */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-l-xl" />
          
          {/* Icon container */}
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10 ml-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          
          {/* Text */}
          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 leading-tight">
            For informational purposes only. Consult your healthcare provider.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-900/60 dark:via-slate-800/40 dark:to-slate-900/60 border border-slate-200/70 dark:border-slate-700/50 shadow-sm">
        {/* Decorative accent */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-emerald-400 via-teal-500 to-cyan-500 rounded-l-2xl" />
        
        {/* Icon container */}
        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/15 to-teal-500/15 ring-1 ring-emerald-500/20 ml-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        
        {/* Text */}
        <span className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
          This tool provides general guidance. Always consult your healthcare provider for medical advice.
        </span>
      </div>
    </div>
  );
};

export default MedicalInfoBar;
