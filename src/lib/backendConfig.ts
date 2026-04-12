const CURRENT_BACKEND_REF = 'frlrngdogjzqpqpjhjvq';
const CURRENT_BACKEND_URL = 'https://frlrngdogjzqpqpjhjvq.supabase.co';
const CURRENT_BACKEND_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZybHJuZ2RvZ2p6cXBxcGpoanZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNTMzOTUsImV4cCI6MjA4NjkyOTM5NX0.mR1PQoK5WhLt2Had26Y-PWVe5JwebQCU_ad7v8gTaIY';
const STALE_BACKEND_HOSTS = new Set(['hfwuufkkfijtponcmbyj.supabase.co']);

function decodeBase64Url(input: string): string {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4;
  const padded = padding === 0 ? normalized : normalized.padEnd(normalized.length + (4 - padding), '=');
  return globalThis.atob(padded);
}

function getProjectRefFromPublishableKey(key: string | undefined): string | null {
  if (!key) return null;

  const parts = key.split('.');
  if (parts.length < 2) return null;

  try {
    const payload = JSON.parse(decodeBase64Url(parts[1]));
    return typeof payload?.ref === 'string' ? payload.ref : null;
  } catch {
    return null;
  }
}

function shouldUseCurrentBackend(): boolean {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!envUrl || !envKey) return true;

  try {
    const hostname = new URL(envUrl).hostname;
    if (STALE_BACKEND_HOSTS.has(hostname)) return true;
  } catch {
    return true;
  }

  const envRef = getProjectRefFromPublishableKey(envKey);
  return envRef !== CURRENT_BACKEND_REF;
}

export function getBackendUrl(): string {
  return shouldUseCurrentBackend() ? CURRENT_BACKEND_URL : import.meta.env.VITE_SUPABASE_URL;
}

export function getBackendPublishableKey(): string {
  return shouldUseCurrentBackend()
    ? CURRENT_BACKEND_PUBLISHABLE_KEY
    : import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
}

export function getBackendFunctionUrl(functionName: string): string {
  return `${getBackendUrl()}/functions/v1/${functionName}`;
}
