import { useState, useEffect } from 'react';
import { Lock, LockOpen } from 'lucide-react';
import { isEncryptionEnabled } from '@/lib/encryption';
import { Link } from 'react-router-dom';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function EncryptionIndicator() {
  const [encrypted, setEncrypted] = useState(false);

  useEffect(() => {
    // Check encryption status
    setEncrypted(isEncryptionEnabled());

    // Listen for storage changes (in case encryption is toggled in another tab)
    const handleStorageChange = () => {
      setEncrypted(isEncryptionEnabled());
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically for same-tab changes
    const interval = setInterval(() => {
      setEncrypted(isEncryptionEnabled());
    }, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to="/settings"
            className={`flex items-center justify-center rounded-lg p-2 transition-colors ${
              encrypted 
                ? 'text-emerald-500 hover:bg-emerald-500/10' 
                : 'text-muted-foreground hover:bg-muted/50'
            }`}
          >
            {encrypted ? (
              <Lock className="h-4 w-4" />
            ) : (
              <LockOpen className="h-4 w-4" />
            )}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {encrypted ? (
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3 text-emerald-500" />
              Data Encrypted
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <LockOpen className="h-3 w-3" />
              Encryption Off
            </span>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
