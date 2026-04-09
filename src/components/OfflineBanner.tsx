import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function OfflineBanner() {
  const { t } = useTranslation();
  const [isOffline, setIsOffline] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => { setIsOffline(false); setDismissed(false); };

    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);

    // Check initial state
    if (!navigator.onLine) setIsOffline(true);

    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  if (!isOffline || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-0 inset-x-0 z-50 bg-amber-500 text-white px-4 py-2.5 flex items-center justify-between shadow-lg"
      >
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span className="text-xs font-bold">
            {t('offline.title', { defaultValue: 'أنتِ غير متصلة بالإنترنت' })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] opacity-90">
            {t('offline.localTools', { defaultValue: 'الأدوات المحلية تعمل بشكل طبيعي' })}
          </span>
          <button onClick={() => setDismissed(true)} className="p-0.5 rounded hover:bg-white/20">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
