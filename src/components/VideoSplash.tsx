import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SPLASH_SEEN_KEY = 'pt_video_splash_seen';
const logoImage = '/splash-logo-v2.webp';

export const VideoSplash: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [fading, setFading] = useState(false);
  const endedRef = useRef(false);

  const handleEnd = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    setFading(true);
    localStorage.setItem(SPLASH_SEEN_KEY, 'true');
    // Smooth fade out before handing off
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

    const markReady = () => setVideoReady(true);

    if (video.readyState >= 3) {
      tryPlay();
    } else {
      video.addEventListener('canplay', tryPlay, { once: true });
    }

    video.addEventListener('playing', markReady, { once: true });

    return () => {
      video.removeEventListener('canplay', tryPlay);
      video.removeEventListener('playing', markReady);
    };
  }, [handleEnd]);

  return (
    <motion.div
      className="fixed inset-0 z-[500] overflow-hidden"
      style={{ background: '#fdf2f8' }}
      animate={{ opacity: fading ? 0 : 1 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      {/* Branded loader while video buffers */}
      <AnimatePresence>
        {!videoReady && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center gap-5"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={logoImage}
              alt=""
              width={72}
              height={72}
              style={{ animation: 'pulse 2s ease-in-out infinite' }}
            />
            <div className="flex gap-2">
              {[0, 0.2, 0.4].map((d, i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: '#d4608a',
                    animation: `dotBounce 1.4s ease-in-out ${d}s infinite`,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video */}
      <motion.video
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
        animate={{ opacity: videoReady ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      />
    </motion.div>
  );
};

export const shouldShowVideoSplash = (): boolean => {
  return !localStorage.getItem(SPLASH_SEEN_KEY);
};
