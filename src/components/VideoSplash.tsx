import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SPLASH_SEEN_KEY = 'pt_video_splash_seen';
const logoImage = '/splash-logo-v2.webp';

export const VideoSplash: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fading, setFading] = useState(false);
  const endedRef = useRef(false);

  const handleEnd = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    setFading(true);
    localStorage.setItem(SPLASH_SEEN_KEY, 'true');
    setTimeout(onComplete, 600);
  }, [onComplete]);

  // Safety timeout
  useEffect(() => {
    const timer = setTimeout(handleEnd, 6000);
    return () => clearTimeout(timer);
  }, [handleEnd]);

  // Autoplay video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tryPlay = () => {
      video.play().catch(handleEnd);
    };

    if (video.readyState >= 3) {
      tryPlay();
    } else {
      video.addEventListener('canplay', tryPlay, { once: true });
    }

    return () => {
      video.removeEventListener('canplay', tryPlay);
    };
  }, [handleEnd]);

  return (
    <motion.div
      className="fixed inset-0 z-[500] overflow-hidden"
      style={{ background: '#000' }}
      animate={{ opacity: fading ? 0 : 1 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      {/* Video — always visible, no loader */}
      <video
        ref={videoRef}
        src="/splash-video.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={handleEnd}
        onError={handleEnd}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ pointerEvents: 'none' }}
      />
    </motion.div>
  );
};

export const shouldShowVideoSplash = (): boolean => {
  return !localStorage.getItem(SPLASH_SEEN_KEY);
};
