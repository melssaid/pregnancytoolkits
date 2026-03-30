import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SPLASH_SEEN_KEY = 'pt_video_splash_seen';

export const VideoSplash: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(true);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => handleEnd(), 6000);
    return () => clearTimeout(timer);
  }, []);

  // Try to play and detect autoplay failure
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setVideoReady(true))
        .catch(() => {
          // Autoplay blocked — skip splash entirely
          handleEnd();
        });
    }
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
          {/* Loading spinner while video loads */}
          {!videoReady && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
          <video
            ref={videoRef}
            src="/splash-video.mp4"
            muted
            playsInline
            preload="auto"
            onEnded={handleEnd}
            onError={handleEnd}
            className={`w-full h-full object-cover transition-opacity duration-300 ${videoReady ? 'opacity-100' : 'opacity-0'}`}
            style={{ pointerEvents: 'none' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const shouldShowVideoSplash = (): boolean => {
  return !localStorage.getItem(SPLASH_SEEN_KEY);
};
