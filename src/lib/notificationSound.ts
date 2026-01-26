/**
 * Notification sound utility using Web Audio API
 * Creates a gentle notification sound without requiring external audio files
 */

let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
      return null;
    }
  }
  return audioContext;
};

/**
 * Play a gentle notification sound
 * Creates a soft, pleasant chime that's not jarring
 */
export const playNotificationSound = (type: 'gentle' | 'success' | 'reminder' = 'gentle'): void => {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume audio context if suspended (required for autoplay policies)
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const now = ctx.currentTime;
  
  // Configure sound based on type
  const config = {
    gentle: { freq: 523.25, duration: 0.3, volume: 0.15 }, // C5
    success: { freq: 659.25, duration: 0.25, volume: 0.12 }, // E5
    reminder: { freq: 440, duration: 0.4, volume: 0.18 }, // A4
  }[type];

  // Create oscillator for the main tone
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(config.freq, now);
  
  // Gentle fade in and out
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(config.volume, now + 0.05);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + config.duration);
  
  oscillator.start(now);
  oscillator.stop(now + config.duration);

  // Add a second harmonic for richness
  const harmonic = ctx.createOscillator();
  const harmonicGain = ctx.createGain();
  
  harmonic.connect(harmonicGain);
  harmonicGain.connect(ctx.destination);
  
  harmonic.type = 'sine';
  harmonic.frequency.setValueAtTime(config.freq * 2, now);
  
  harmonicGain.gain.setValueAtTime(0, now);
  harmonicGain.gain.linearRampToValueAtTime(config.volume * 0.3, now + 0.05);
  harmonicGain.gain.exponentialRampToValueAtTime(0.001, now + config.duration * 0.8);
  
  harmonic.start(now);
  harmonic.stop(now + config.duration);
};

/**
 * Request permission to play sounds (needed for some browsers)
 * Should be called on user interaction
 */
export const initNotificationSound = (): void => {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume();
  }
};
