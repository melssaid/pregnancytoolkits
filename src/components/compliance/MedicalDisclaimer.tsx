import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MedicalDisclaimerProps {
  toolName?: string;
  onAccept: () => void;
}

export default function MedicalDisclaimer({ toolName, onAccept }: MedicalDisclaimerProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4 py-8">
      <Card className="max-w-lg w-full mx-auto">
        <CardContent className="p-6 space-y-6">
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground mb-2">Medical Disclaimer</h1>
            <p className="text-sm text-muted-foreground">
              {toolName ? `${toolName} - ` : ''}Health & Safety Information
            </p>
          </div>

          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Important:</strong> This tool is designed for educational and informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment.
            </p>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="font-medium text-foreground">Always consult with your healthcare provider if you have concerns about your health or pregnancy.</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Never disregard professional medical advice based on app results</li>
                <li>Seek immediate medical attention for any concerning symptoms</li>
                <li>This tool does not replace regular prenatal care</li>
                <li>Information provided is general and may not apply to your specific situation</li>
              </ul>
            </div>

            <p className="text-xs">
              By continuing, you acknowledge that you understand this tool is for informational purposes only and that you should consult healthcare professionals for medical decisions.
            </p>
          </div>

          {toolName && (
            <div className="bg-primary/5 rounded-lg p-3">
              <p className="text-xs text-foreground">
                Tool: <span className="font-semibold">{toolName}</span>
              </p>
            </div>
          )}

          <Button className="w-full" onClick={onAccept}>
            I Understand & Accept
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
