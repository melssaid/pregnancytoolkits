/**
 * Device Fingerprint Generator
 * Creates a stable hash from browser/device properties.
 * Survives clearing app data — used to prevent quota reset abuse.
 */

const FINGERPRINT_CACHE_KEY = 'device_fp_cache_v1';

async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Canvas fingerprint — provides extra entropy from GPU rendering.
 */
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas';
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(0, 0, 200, 50);
    ctx.fillStyle = '#069';
    ctx.fillText('PT-fp-2026 🔐', 2, 2);
    ctx.strokeStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.strokeRect(10, 10, 100, 30);
    return canvas.toDataURL().slice(-100);
  } catch {
    return 'canvas-error';
  }
}

/**
 * WebGL renderer info — distinguishes hardware.
 */
function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    if (!gl) return 'no-webgl';
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    if (!dbg) return 'no-debug-ext';
    const vendor = gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) || '';
    const renderer = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '';
    return `${vendor}|${renderer}`;
  } catch {
    return 'webgl-error';
  }
}

export async function getDeviceFingerprint(): Promise<string> {
  // Try cache first (in-memory across session)
  try {
    const cached = sessionStorage.getItem(FINGERPRINT_CACHE_KEY);
    if (cached && cached.length === 64) return cached;
  } catch { /* ignore */ }

  const components = [
    navigator.userAgent,
    `${screen.width}x${screen.height}`,
    `${screen.colorDepth}`,
    navigator.hardwareConcurrency?.toString() || 'unknown',
    navigator.language,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.maxTouchPoints?.toString() || '0',
    (navigator as any).deviceMemory?.toString() || 'unknown',
    getCanvasFingerprint(),
    getWebGLFingerprint(),
  ];

  const fp = await sha256(components.join('|'));
  
  try {
    sessionStorage.setItem(FINGERPRINT_CACHE_KEY, fp);
  } catch { /* ignore */ }
  
  return fp;
}
