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
      const parsed = saved ? (JSON.parse(saved) as Partial<LocalSettings> | null) : null;

      // This app is English-only.
      const theme: LocalSettings["theme"] =
        parsed?.theme === "light" || parsed?.theme === "dark" || parsed?.theme === "system"
          ? parsed.theme
          : "system";

      return { language: "en", theme };
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
