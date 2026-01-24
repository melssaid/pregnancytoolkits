/**
 * Safe localStorage utilities with JSON validation
 * Prevents crashes from malformed data and provides type-safe parsing
 */

/**
 * Safely parse JSON from localStorage with fallback to default value
 * @param key - localStorage key
 * @param defaultValue - Value to return if parsing fails or data is invalid
 * @param validator - Optional validation function to verify data structure
 */
export function safeParseLocalStorage<T>(
  key: string,
  defaultValue: T,
  validator?: (data: unknown) => data is T
): T {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return defaultValue;

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
 * Safely save data to localStorage with error handling
 * @param key - localStorage key
 * @param value - Value to save (will be JSON stringified)
 * @returns true if save was successful, false otherwise
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
