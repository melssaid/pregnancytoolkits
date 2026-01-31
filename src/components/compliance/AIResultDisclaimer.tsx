import { Info } from 'lucide-react';

interface AIResultDisclaimerProps {
  className?: string;
}

/**
 * Light footer disclaimer for AI-generated results only.
 * Complies with Google Play medical app policies without requiring user consent.
 */
export const AIResultDisclaimer = ({ className = '' }: AIResultDisclaimerProps) => {
  return (
    <p className={`text-[10px] text-muted-foreground/70 text-center mt-3 ${className}`}>
      <Info className="w-3 h-3 inline-block mr-1 -mt-0.5" />
      للاطلاع فقط • استشيري طبيبك دائماً
    </p>
  );
};

export default AIResultDisclaimer;
