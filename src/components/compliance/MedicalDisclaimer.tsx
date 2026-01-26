import React, { forwardRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

interface MedicalDisclaimerProps {
  toolName?: string;
  onAccept: () => void;
}

const MedicalDisclaimer = forwardRef<HTMLDivElement, MedicalDisclaimerProps>(
  ({ toolName, onAccept }, ref) => {
    return (
      <div ref={ref} className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
        <Card className="w-full max-w-sm mx-auto shadow-xl border-0 bg-card animate-scale-in">
          <CardContent className="p-5 space-y-4">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="mx-auto w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold text-foreground">Medical Disclaimer</h1>
              {toolName && (
                <p className="text-xs text-muted-foreground">{toolName}</p>
              )}
            </div>

            {/* Simple Warning */}
            <p className="text-sm text-center text-muted-foreground leading-relaxed">
              For informational purposes only. Always consult your healthcare provider.
            </p>

            {/* Accept Button */}
            <Button 
              className="w-full h-10 text-sm font-semibold rounded-xl" 
              onClick={onAccept}
            >
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
);

MedicalDisclaimer.displayName = 'MedicalDisclaimer';

export default MedicalDisclaimer;
