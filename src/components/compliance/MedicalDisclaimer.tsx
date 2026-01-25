import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield } from 'lucide-react';

interface MedicalDisclaimerProps {
  toolName?: string;
  onAccept: () => void;
}

export default function MedicalDisclaimer({ toolName, onAccept }: MedicalDisclaimerProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-muted/30 to-background p-6">
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardContent className="p-8 space-y-8">
          {/* Header with Icon */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Medical Disclaimer</h1>
              <p className="text-sm text-muted-foreground">
                {toolName ? `${toolName} - ` : ''}Health & Safety Information
              </p>
            </div>
          </div>

          {/* Warning Content */}
          <div className="space-y-6 text-foreground">
            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-6">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-destructive mt-1 flex-shrink-0" />
                <p className="font-semibold text-destructive">
                  Important: This tool is designed for educational and informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment.
                </p>
              </div>

              <div className="space-y-3 text-sm">
                <p className="font-medium">Always consult with your healthcare provider if you have concerns about your health or pregnancy.</p>
                
                <div className="bg-background rounded-lg p-4 space-y-2">
                  <p className="font-medium text-foreground mb-2">Key Points:</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-1">•</span>
                      <span>Never disregard professional medical advice based on app results</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-1">•</span>
                      <span>Seek immediate medical attention for any concerning symptoms</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-1">•</span>
                      <span>This tool does not replace regular prenatal care</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-1">•</span>
                      <span>Information provided is general and may not apply to your specific situation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                By continuing, you acknowledge that you understand this tool is for informational purposes only and that you should consult healthcare professionals for medical decisions.
              </p>
            </div>

            {toolName && (
              <div className="bg-primary/5 rounded-lg p-4">
                <p className="text-sm">
                  <span className="text-muted-foreground">Tool: </span>
                  <span className="font-semibold text-primary">{toolName}</span>
                </p>
              </div>
            )}
          </div>

          {/* Action Button */}
          <Button 
            className="w-full h-12 text-base font-semibold" 
            onClick={onAccept}
            size="lg"
          >
            I Understand & Accept
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
