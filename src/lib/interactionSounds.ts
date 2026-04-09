const SOUNDS_ENABLED_KEY = 'pt_sounds_enabled';

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    if (!audioCtx) audioCtx = new AudioContext();
    return audioCtx;
  } catch {
    return null;
  }
}

function playTone(freq: number, duration: number, volume = 0.15) {
  const enabled = localStorage.getItem(SOUNDS_ENABLED_KEY) !== 'false';
  if (!enabled) return;

  const ctx = getCtx();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

export function playKickSound() {
  // Soft heartbeat-like double tap
  playTone(200, 0.15, 0.12);
  setTimeout(() => playTone(180, 0.2, 0.08), 150);
}

export function playSuccessSound() {
  // Gentle ascending chime
  playTone(523, 0.15, 0.1);
  setTimeout(() => playTone(659, 0.15, 0.1), 100);
  setTimeout(() => playTone(784, 0.2, 0.1), 200);
}

export function playReminderSound() {
  // Soft single note
  playTone(440, 0.3, 0.08);
}

export function setSoundsEnabled(enabled: boolean) {
  try { localStorage.setItem(SOUNDS_ENABLED_KEY, String(enabled)); } catch {}
}

export function isSoundsEnabled(): boolean {
  return localStorage.getItem(SOUNDS_ENABLED_KEY) !== 'false';
}
