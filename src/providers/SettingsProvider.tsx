import { createContext, useContext, ReactNode } from "react";
import { useSettings } from "@/hooks/useSettings";

interface SettingsContextType {
  settings: any;
  updateSettings: (newSettings: any) => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const settingsManager = useSettings();
  return (
    <SettingsContext.Provider value={settingsManager}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettingsContext must be used within SettingsProvider");
  return context;
};