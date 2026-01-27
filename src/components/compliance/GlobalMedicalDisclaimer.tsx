import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Heart, AlertTriangle } from 'lucide-react';
import { useGlobalDisclaimer } from '@/hooks/useGlobalDisclaimer';

interface GlobalMedicalDisclaimerProps {
  children: React.ReactNode;
}

const GlobalMedicalDisclaimer: React.FC<GlobalMedicalDisclaimerProps> = ({ children }) => {
  const { hasAccepted, isLoading, acceptDisclaimer } = useGlobalDisclaimer();

  // Show loading state briefly
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">
          <Heart className="w-12 h-12 text-primary" />
        </div>
      </div>
    );
  }

  // Show disclaimer if not accepted
  if (!hasAccepted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-card">
          <CardContent className="p-6 space-y-5">
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Welcome to Pregnancy Tools</h1>
              <p className="text-sm text-muted-foreground">
                Your personal pregnancy companion
              </p>
            </div>

            {/* Disclaimer Content */}
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h2 className="font-semibold text-amber-800 dark:text-amber-200 text-sm">
                    Important Health Notice
                  </h2>
                  <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1.5">
                    <li>• This app provides informational guidance only</li>
                    <li>• It does not replace professional medical advice</li>
                    <li>• Always consult your healthcare provider for medical decisions</li>
                    <li>• Seek immediate help for any medical emergencies</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Privacy Note */}
            <p className="text-xs text-center text-muted-foreground">
              🔒 Your data stays on your device. We respect your privacy.
            </p>

            {/* Accept Button */}
            <Button 
              className="w-full h-12 text-base font-semibold rounded-xl" 
              onClick={acceptDisclaimer}
            >
              I Understand, Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User has accepted, render children
  return <>{children}</>;
};

export default GlobalMedicalDisclaimer;
