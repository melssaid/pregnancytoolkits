import React, { forwardRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, CheckCircle2 } from 'lucide-react';

interface MedicalDisclaimerProps {
  toolName?: string;
  onAccept: () => void;
}

const MedicalDisclaimer = forwardRef<HTMLDivElement, MedicalDisclaimerProps>(
  ({ toolName, onAccept }, ref) => {
    return (
      <div ref={ref} className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
        <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-card animate-scale-in">
          <CardContent className="p-6 space-y-5">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="mx-auto w-14 h-14 bg-destructive/10 rounded-full flex items-center justify-center">
                <Shield className="w-7 h-7 text-destructive" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Medical Disclaimer</h1>
                {toolName && (
                  <p className="text-xs text-muted-foreground mt-1">{toolName}</p>
                )}
              </div>
            </div>

            {/* Warning Box */}
            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-sm font-medium text-destructive leading-relaxed">
                  This tool is for educational purposes only. Not a substitute for medical advice.
                </p>
              </div>

              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span>Always consult your healthcare provider</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span>Seek immediate care for concerning symptoms</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span>This does not replace regular prenatal care</span>
                </div>
              </div>
            </div>

            {/* Consent Text */}
            <p className="text-[11px] text-center text-muted-foreground leading-relaxed">
              By continuing, you acknowledge this tool is for informational purposes only.
            </p>

            {/* Accept Button */}
            <Button 
              className="w-full h-11 text-sm font-semibold rounded-xl" 
              onClick={onAccept}
            >
              I Understand & Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
);

MedicalDisclaimer.displayName = 'MedicalDisclaimer';

export default MedicalDisclaimer;
