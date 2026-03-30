import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SPLASH_SEEN_KEY = 'pt_video_splash_seen';

export const VideoSplash: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const endedRef = useRef(false);

  const handleEnd = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    setVisible(false);
    localStorage.setItem(SPLASH_SEEN_KEY, 'true');
    setTimeout(onComplete, 400);
  }, [onComplete]);

  // Safety timeout — skip after 5s regardless
  useEffect(() => {
    const timer = setTimeout(handleEnd, 5000);
    return () => clearTimeout(timer);
  }, [handleEnd]);

  // Attempt autoplay as soon as mounted
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // canplaythrough = enough data buffered to play without stalling
    const onReady = () => {
      setVideoReady(true);
      video.play().catch(handleEnd);
    };

    // If already buffered (preloaded)
    if (video.readyState >= 3) {
      onReady();
    } else {
      video.addEventListener('canplaythrough', onReady, { once: true });
      // Also try on canplay for faster start
      video.addEventListener('canplay', () => {
        setVideoReady(true);
        video.play().catch(handleEnd);
      }, { once: true });
    }

    return () => {
      video.removeEventListener('canplaythrough', onReady);
    };
  }, [handleEnd]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[500] flex items-center justify-center"
          style={{ background: '#fdf2f8' }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onClick={handleEnd}
        >
          {/* Branded loader — logo + dots while video buffers */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center gap-5"
            animate={{ opacity: videoReady ? 0 : 1 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src="/splash-logo-v2.webp"
              alt=""
              width={72}
              height={72}
              style={{ animation: 'pulse 2s ease-in-out infinite' }}
            />
            <div className="flex gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" style={{ animation: 'dotBounce 1.4s ease-in-out infinite' }} />
              <span className="w-2 h-2 rounded-full bg-primary" style={{ animation: 'dotBounce 1.4s ease-in-out 0.2s infinite' }} />
              <span className="w-2 h-2 rounded-full bg-primary" style={{ animation: 'dotBounce 1.4s ease-in-out 0.4s infinite' }} />
            </div>
          </motion.div>

          {/* Video — fades in when ready */}
          <motion.video
            ref={videoRef}
            src="/splash-video.mp4"
            muted
            playsInline
            preload="auto"
            onEnded={handleEnd}
            onError={handleEnd}
            className="w-full h-full object-cover"
            style={{ pointerEvents: 'none' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: videoReady ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const shouldShowVideoSplash = (): boolean => {
  return !localStorage.getItem(SPLASH_SEEN_KEY);
};
