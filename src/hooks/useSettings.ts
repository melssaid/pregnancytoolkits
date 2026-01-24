import { useEffect, useState, useCallback } from "react";

interface Settings {
  language?: string;
  theme?: "light" | "dark" | "system";
  [key: string]: unknown;
}

const SETTINGS_STORAGE_KEY = "wellmama_settings";

/**
 * Settings hook that uses localStorage only.
 * This app is designed for anonymous usage without authentication,
 * so settings are stored locally on the device.
 */
export function useSettings() {
  const [settings, setSettings] = useState<Settings>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed === "object" && parsed !== null) {
          setSettings(parsed);
        }
      }
    } catch (error) {
      console.warn("Failed to load settings from localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.warn("Failed to save settings to localStorage:", error);
      }
      return updated;
    });
  }, []);

  return { settings, updateSettings, isLoading, isAuthenticated: false };
}
