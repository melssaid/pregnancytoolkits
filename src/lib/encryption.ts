/**
 * Data Encryption Utilities using Web Crypto API
 * Provides AES-GCM encryption for sensitive local data
 */

// Key for storing the encryption key in localStorage (this key itself is not encrypted)
const ENCRYPTION_KEY_STORAGE = '_encryption_key_v1';
const ENCRYPTION_ENABLED_STORAGE = '_encryption_enabled';

// Check if Web Crypto API is available
const isCryptoAvailable = typeof window !== 'undefined' && 
  window.crypto && 
  window.crypto.subtle;

/**
 * Generate a new AES-GCM encryption key
 */
async function generateKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Export CryptoKey to base64 string for storage
 */
async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key);
  return arrayBufferToBase64(exported);
}

/**
 * Import base64 string back to CryptoKey
 */
async function importKey(keyData: string): Promise<CryptoKey> {
  const rawKey = base64ToArrayBuffer(keyData);
  return await crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert base64 string to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Get or create the encryption key
 */
async function getOrCreateEncryptionKey(): Promise<CryptoKey | null> {
  if (!isCryptoAvailable) {
    console.warn('Web Crypto API not available, encryption disabled');
    return null;
  }

  try {
    const storedKey = localStorage.getItem(ENCRYPTION_KEY_STORAGE);
    
    if (storedKey) {
      return await importKey(storedKey);
    }

    // Generate new key
    const newKey = await generateKey();
    const exportedKey = await exportKey(newKey);
    localStorage.setItem(ENCRYPTION_KEY_STORAGE, exportedKey);
    
    return newKey;
  } catch (error) {
    console.error('Failed to get/create encryption key:', error);
    return null;
  }
}

// Cache the key to avoid repeated async calls
let cachedKey: CryptoKey | null = null;
let keyInitialized = false;

/**
 * Initialize encryption (call once at app start)
 */
export async function initializeEncryption(): Promise<boolean> {
  if (keyInitialized) return cachedKey !== null;
  
  cachedKey = await getOrCreateEncryptionKey();
  keyInitialized = true;
  
  return cachedKey !== null;
}

/**
 * Check if encryption is enabled by user
 */
export function isEncryptionEnabled(): boolean {
  return localStorage.getItem(ENCRYPTION_ENABLED_STORAGE) === 'true';
}

/**
 * Enable or disable encryption
 */
export function setEncryptionEnabled(enabled: boolean): void {
  localStorage.setItem(ENCRYPTION_ENABLED_STORAGE, enabled ? 'true' : 'false');
}

/**
 * Encrypt a string using AES-GCM
 */
export async function encryptData(plaintext: string): Promise<string | null> {
  if (!cachedKey || !isEncryptionEnabled()) {
    return null; // Return null to indicate no encryption was applied
  }

  try {
    // Generate random IV for each encryption
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Encode the plaintext
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);

    // Encrypt
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cachedKey,
      data
    );

    // Combine IV + encrypted data and encode as base64
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);

    return 'ENC:' + arrayBufferToBase64(combined.buffer);
  } catch (error) {
    console.error('Encryption failed:', error);
    return null;
  }
}

/**
 * Decrypt a string using AES-GCM
 */
export async function decryptData(ciphertext: string): Promise<string | null> {
  // Check if data is encrypted
  if (!ciphertext.startsWith('ENC:')) {
    return ciphertext; // Return as-is if not encrypted
  }

  if (!cachedKey) {
    await initializeEncryption();
    if (!cachedKey) {
      console.error('Cannot decrypt: encryption key not available');
      return null;
    }
  }

  try {
    // Remove prefix and decode
    const encryptedBase64 = ciphertext.slice(4);
    const combined = new Uint8Array(base64ToArrayBuffer(encryptedBase64));

    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      cachedKey,
      encrypted
    );

    // Decode the result
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}

/**
 * Check if a value is encrypted
 */
export function isEncrypted(value: string): boolean {
  return value.startsWith('ENC:');
}

/**
 * Encrypt existing localStorage data (migration)
 */
export async function encryptExistingData(keys: string[]): Promise<number> {
  if (!isEncryptionEnabled()) return 0;

  let encryptedCount = 0;

  for (const key of keys) {
    try {
      const value = localStorage.getItem(key);
      if (value && !isEncrypted(value)) {
        const encrypted = await encryptData(value);
        if (encrypted) {
          localStorage.setItem(key, encrypted);
          encryptedCount++;
        }
      }
    } catch (error) {
      console.error(`Failed to encrypt key "${key}":`, error);
    }
  }

  return encryptedCount;
}

/**
 * Decrypt all localStorage data (for export or disabling encryption)
 */
export async function decryptAllData(keys: string[]): Promise<number> {
  let decryptedCount = 0;

  for (const key of keys) {
    try {
      const value = localStorage.getItem(key);
      if (value && isEncrypted(value)) {
        const decrypted = await decryptData(value);
        if (decrypted) {
          localStorage.setItem(key, decrypted);
          decryptedCount++;
        }
      }
    } catch (error) {
      console.error(`Failed to decrypt key "${key}":`, error);
    }
  }

  return decryptedCount;
}
