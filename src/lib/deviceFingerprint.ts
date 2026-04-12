/**
 * Device Fingerprint Generator
 * Creates a stable hash from browser/device properties.
 * Used to prevent coupon reuse even after clearing app data.
 */

async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function getDeviceFingerprint(): Promise<string> {
  const components = [
    navigator.userAgent,
    `${screen.width}x${screen.height}`,
    `${screen.colorDepth}`,
    navigator.hardwareConcurrency?.toString() || 'unknown',
    navigator.language,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.maxTouchPoints?.toString() || '0',
    (navigator as any).deviceMemory?.toString() || 'unknown',
  ];

  return sha256(components.join('|'));
}
