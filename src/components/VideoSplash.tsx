import React, { useEffect, useRef, useCallback } from 'react';

const SPLASH_SEEN_KEY = 'pt_video_splash_seen';

declare global {
  interface Window {
    __htmlSplashVideoActive?: boolean;
    __htmlSplashVideoEnded?: boolean;
  }
}

export const VideoSplash: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const completedRef = useRef(false);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    localStorage.setItem(SPLASH_SEEN_KEY, 'true');
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    // HTML already started the video — just wait for it to end
    if (window.__htmlSplashVideoActive) {
      if (window.__htmlSplashVideoEnded) {
        finish();
        return;
      }
      // Poll until HTML splash ends
      const interval = setInterval(() => {
        if (window.__htmlSplashVideoEnded) {
          clearInterval(interval);
          finish();
        }
      }, 100);
      // Safety
      const timer = setTimeout(finish, 7000);
      return () => { clearInterval(interval); clearTimeout(timer); };
    }

    // Fallback: shouldn't happen but just in case
    finish();
  }, [finish]);

  // No React UI needed — HTML handles the video display
  return null;
};

export const shouldShowVideoSplash = (): boolean => {
  return !localStorage.getItem(SPLASH_SEEN_KEY);
};
