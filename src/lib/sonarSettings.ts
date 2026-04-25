/**
 * Sonar Integration Settings
 *
 * Lets the user choose which data sources feed the holistic AI analyzer
 * (Sonar). Persisted in localStorage and exposed via a tiny pub/sub hook
 * so the analyzer card reacts instantly to changes.
 */
import { useEffect, useState } from "react";

export type SonarScope = "snapshot" | "timeline" | "both";
export type SonarTimelineWindow = 7 | 30;

export interface SonarSettings {
  scope: SonarScope;
  timelineWindow: SonarTimelineWindow;
  includeSavedReport: boolean;
  includeNutritionCard: boolean;
}

export const SONAR_SETTINGS_KEY = "sonar-integration-settings-v1";
export const SONAR_SETTINGS_EVENT = "sonar-settings-changed";

export const DEFAULT_SONAR_SETTINGS: SonarSettings = {
  scope: "both",
  timelineWindow: 30,
  includeSavedReport: true,
  includeNutritionCard: true,
};

function read(): SonarSettings {
  if (typeof window === "undefined") return DEFAULT_SONAR_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SONAR_SETTINGS_KEY);
    if (!raw) return DEFAULT_SONAR_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SONAR_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SONAR_SETTINGS;
  }
}

function write(value: SonarSettings) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SONAR_SETTINGS_KEY, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(SONAR_SETTINGS_EVENT, { detail: value }));
  } catch {
    /* ignore */
  }
}

export function getSonarSettings(): SonarSettings {
  return read();
}

export function useSonarSettings() {
  const [settings, setSettings] = useState<SonarSettings>(() => read());

  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<SonarSettings>).detail;
      if (detail) setSettings(detail);
      else setSettings(read());
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === SONAR_SETTINGS_KEY) setSettings(read());
    };
    window.addEventListener(SONAR_SETTINGS_EVENT, onChange as EventListener);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(SONAR_SETTINGS_EVENT, onChange as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const update = (patch: Partial<SonarSettings>) => {
    const next = { ...read(), ...patch };
    write(next);
    setSettings(next);
  };

  const reset = () => {
    write(DEFAULT_SONAR_SETTINGS);
    setSettings(DEFAULT_SONAR_SETTINGS);
  };

  return { settings, update, reset };
}
