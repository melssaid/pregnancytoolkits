import { getUserId } from '@/hooks/useSupabase';
import { getDeviceFingerprint } from '@/lib/deviceFingerprint';

export async function getCouponRequestHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};

  try {
    const fingerprint = await getDeviceFingerprint();
    if (fingerprint) {
      headers['X-Device-Fingerprint'] = fingerprint;
    }
  } catch {
    // Ignore fingerprint failures so AI requests still work.
  }

  try {
    const localUserId = getUserId();
    if (localUserId) {
      headers['X-Local-User-Id'] = localUserId;
    }
  } catch {
    // Ignore local user failures so AI requests still work.
  }

  return headers;
}