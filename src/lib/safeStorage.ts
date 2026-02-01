/**
 * Safe localStorage utilities with JSON validation and optional encryption
 * Prevents crashes from malformed data and provides type-safe parsing
 */

import { encryptData, decryptData, isEncryptionEnabled, isEncrypted } from './encryption';

/**
 * Safely parse JSON from localStorage with fallback to default value
 * Automatically decrypts data if encrypted
 * @param key - localStorage key
 * @param defaultValue - Value to return if parsing fails or data is invalid
 * @param validator - Optional validation function to verify data structure
 */
export async function safeParseLocalStorageAsync<T>(
  key: string,
  defaultValue: T,
  validator?: (data: unknown) => data is T
): Promise<T> {
  try {
    let saved = localStorage.getItem(key);
    if (!saved) return defaultValue;

    // Decrypt if encrypted
    if (isEncrypted(saved)) {
      const decrypted = await decryptData(saved);
      if (decrypted === null) {
        console.warn(`Failed to decrypt localStorage key "${key}", using default`);
        return defaultValue;
      }
      saved = decrypted;
    }

    const parsed = JSON.parse(saved);

    // If a validator is provided, use it to verify the data structure
    if (validator) {
      if (validator(parsed)) {
        return parsed;
      }
      console.warn(`Invalid data structure in localStorage key "${key}", using default`);
      return defaultValue;
    }

    // Basic type check for objects and arrays
    if (typeof parsed !== typeof defaultValue) {
      console.warn(`Type mismatch in localStorage key "${key}", using default`);
      return defaultValue;
    }

    return parsed as T;
  } catch (error) {
    console.warn(`Failed to parse localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Synchronous version for backward compatibility (no decryption)
 * Use safeParseLocalStorageAsync for encrypted data
 */
export function safeParseLocalStorage<T>(
  key: string,
  defaultValue: T,
  validator?: (data: unknown) => data is T
): T {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return defaultValue;

    // If encrypted, return default (use async version for encrypted data)
    if (isEncrypted(saved)) {
      console.warn(`Encrypted data found for key "${key}", use async version`);
      return defaultValue;
    }

    const parsed = JSON.parse(saved);

    // If a validator is provided, use it to verify the data structure
    if (validator) {
      if (validator(parsed)) {
        return parsed;
      }
      console.warn(`Invalid data structure in localStorage key "${key}", using default`);
      return defaultValue;
    }

    // Basic type check for objects and arrays
    if (typeof parsed !== typeof defaultValue) {
      console.warn(`Type mismatch in localStorage key "${key}", using default`);
      return defaultValue;
    }

    return parsed as T;
  } catch (error) {
    console.warn(`Failed to parse localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Safely save data to localStorage with error handling and optional encryption
 * @param key - localStorage key
 * @param value - Value to save (will be JSON stringified)
 * @param encrypt - Whether to encrypt sensitive data (uses global setting if not specified)
 * @returns true if save was successful, false otherwise
 */
export async function safeSaveToLocalStorageAsync<T>(
  key: string, 
  value: T,
  encrypt?: boolean
): Promise<boolean> {
  try {
    const stringified = JSON.stringify(value);
    
    // Check size before saving (5MB limit for most browsers)
    if (stringified.length > 4 * 1024 * 1024) {
      console.warn(`Data too large for localStorage key "${key}"`);
      return false;
    }

    // Encrypt if enabled and requested
    const shouldEncrypt = encrypt ?? isEncryptionEnabled();
    if (shouldEncrypt) {
      const encrypted = await encryptData(stringified);
      if (encrypted) {
        localStorage.setItem(key, encrypted);
        return true;
      }
    }
    
    // Save unencrypted
    localStorage.setItem(key, stringified);
    return true;
  } catch (error) {
    console.warn(`Failed to save to localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Synchronous version for backward compatibility (no encryption)
 * Use safeSaveToLocalStorageAsync for encrypted data
 */
export function safeSaveToLocalStorage<T>(key: string, value: T): boolean {
  try {
    const stringified = JSON.stringify(value);
    
    // Check size before saving (5MB limit for most browsers)
    if (stringified.length > 4 * 1024 * 1024) {
      console.warn(`Data too large for localStorage key "${key}"`);
      return false;
    }
    
    localStorage.setItem(key, stringified);
    return true;
  } catch (error) {
    console.warn(`Failed to save to localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Safely remove an item from localStorage
 * @param key - localStorage key to remove
 */
export function safeRemoveFromLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Failed to remove localStorage key "${key}":`, error);
  }
}

/**
 * Type guard validators for common data structures
 */
export const validators = {
  isArray: (data: unknown): data is unknown[] => Array.isArray(data),
  
  isObject: (data: unknown): data is Record<string, unknown> =>
    typeof data === "object" && data !== null && !Array.isArray(data),
  
  isString: (data: unknown): data is string => typeof data === "string",
  
  isNumber: (data: unknown): data is number => typeof data === "number" && !isNaN(data),
  
  isBoolean: (data: unknown): data is boolean => typeof data === "boolean",
};
