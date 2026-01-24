import { useEffect, useState } from "react";

interface Settings {
  language?: string;
  theme?: "light" | "dark" | "system";
  [key: string]: any;
}

const LOCAL_KEY = "pregnancytools_user_settings";

export function useSettings() {
  const [settings, setSettings] = useState<Settings>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        const saved = localStorage.getItem(LOCAL_KEY);
        if (saved) {
          setSettings(JSON.parse(saved));
        }
      } catch (err) {
        console.warn("Failed to load settings:", err);
      }
      setIsLoading(false);
    };

    initialize();
  }, []);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn("Failed to save settings:", err);
    }
  };

  return { settings, updateSettings, isLoading, isAuthenticated };
}
