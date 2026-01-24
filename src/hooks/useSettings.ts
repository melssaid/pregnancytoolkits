import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Settings {
  language?: string;
  theme?: "light" | "dark" | "system";
  [key: string]: any;
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Auth error:", error);
        setIsLoading(false);
        return;
      }

      if (!session) {
        setIsLoading(false);
        return;
      }

      setIsAuthenticated(true);
      await loadSettings(session.user.id);
    };

    initialize();
  }, []);

  const loadSettings = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_settings")
      .select("settings")
      .single();

    if (error && error.code !== "PGRST116") {
      console.warn("Settings fetch error:", error.message);
    }

    if (data) {
      setSettings(data.settings);
    }
    setIsLoading(false);
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("يجب تسجيل الدخول أولاً");

    const updated = { ...settings, ...newSettings };
    const { error } = await supabase.from("user_settings").upsert({
      user_id: user.id,
      settings: updated,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;
    setSettings(updated);
  };

  return { settings, updateSettings, isLoading, isAuthenticated };
}