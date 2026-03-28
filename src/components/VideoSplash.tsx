import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SPLASH_SEEN_KEY = 'pt_video_splash_seen';

export const VideoSplash: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Fallback: auto-dismiss after 6 seconds even if video fails
    const timer = setTimeout(() => handleEnd(), 6000);
    return () => clearTimeout(timer);
  }, []);

  const handleEnd = () => {
    if (!visible) return;
    setVisible(false);
    localStorage.setItem(SPLASH_SEEN_KEY, 'true');
    setTimeout(onComplete, 500);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[500] bg-black flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          onClick={handleEnd}
        >
          <video
            ref={videoRef}
            src="/splash-video.mp4"
            autoPlay
            muted
            playsInline
            onEnded={handleEnd}
            onError={handleEnd}
            className="w-full h-full object-cover"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const shouldShowVideoSplash = (): boolean => {
  return !localStorage.getItem(SPLASH_SEEN_KEY);
};
