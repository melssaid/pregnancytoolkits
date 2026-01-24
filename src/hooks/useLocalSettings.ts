import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LocalSettings {
  language: string;
  theme: "light" | "dark" | "system";
}

const LOCAL_KEY = "pregnancytools_settings_v1";

export function useLocalSettings() {
  const [settings, setSettings] = useState<LocalSettings>(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem(LOCAL_KEY) : null;
      return saved ? JSON.parse(saved) : { language: "ar", theme: "system" };
    } catch {
      return { language: "ar", theme: "system" };
    }
  });

  useEffect(() => {
    const syncToCloud = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("user_settings").upsert({
            user_id: user.id,
            settings: settings,
            updated_at: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn("Cloud sync failed, using local storage as fallback:", err);
      }
    };

    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(settings));
      }
    } catch (storageError) {
      console.warn("LocalStorage save failed:", storageError);
    }

    syncToCloud();
  }, [settings]);

  return { settings, setSettings };
}