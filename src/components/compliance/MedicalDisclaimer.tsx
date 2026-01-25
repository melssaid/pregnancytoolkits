import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface MedicalDisclaimerProps {
  toolName: string;
  onAccept: () => void;
}

const MedicalDisclaimer: React.FC<MedicalDisclaimerProps> = ({ toolName, onAccept }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleAccept = () => {
    setIsVisible(false);
    onAccept();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Medical Disclaimer</h2>
        </div>
        
        <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
          <p>
            <strong>{toolName}</strong> is designed for <strong>educational and informational purposes only</strong>.
          </p>
          
          <p>
            This tool does <strong>NOT</strong> provide medical advice, diagnosis, or treatment recommendations.
          </p>
          
          <p>
            Always consult with a qualified healthcare professional for any medical concerns or before making any decisions related to your health or pregnancy.
          </p>
          
          <p className="text-xs text-gray-500">
            By continuing, you acknowledge that you have read and understood this disclaimer.
          </p>
        </div>
        
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleAccept}
            className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            I Understand & Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicalDisclaimer;
