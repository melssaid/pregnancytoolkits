import { useEffect, useState } from "react";

interface LocalSettings {
  language: string;
  theme: "light" | "dark" | "system";
}

const LOCAL_KEY = "pregnancytools_settings_v1";

export function useLocalSettings() {
  const [settings, setSettings] = useState<LocalSettings>(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem(LOCAL_KEY) : null;
      return saved ? JSON.parse(saved) : { language: "en", theme: "system" };
    } catch {
      return { language: "en", theme: "system" };
    }
  });

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(settings));
      }
    } catch (storageError) {
      console.warn("LocalStorage save failed:", storageError);
    }
  }, [settings]);

  return { settings, setSettings };
}
