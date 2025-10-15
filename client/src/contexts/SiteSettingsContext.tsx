import React, { createContext, useContext, useEffect, useState } from "react";
import { getSiteSettings } from "../api/services/site-settings-service";

/**
 * Represents the shape of site settings returned from the backend. These
 * settings control global properties such as the platform name and enabled
 * login providers. Additional keys can be added here if the backend
 * provides more configuration options.
 */
export interface SiteSettings {
  platformName: string;
  loginOptions: {
    studentEnabled: boolean;
    instructorEnabled: boolean;
    googleEnabled: boolean;
  };
}

interface SiteSettingsContextValue {
  settings: SiteSettings | null;
  refreshSettings: () => Promise<void>;
}

// Create a React context with a nullable default value. Consumers should
// use the hook below to access this context.
const SiteSettingsContext = createContext<SiteSettingsContextValue | null>(
  null
);

/**
 * Provider component responsible for fetching site settings from the server
 * and storing them in state. The settings are retrieved on mount and
 * whenever refreshSettings is called. Consumers can access current
 * settings via the useSiteSettings hook.
 */
const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  const fetchSettings = async () => {
    try {
      const response = await getSiteSettings();
      // The API returns data under .data.data; adjust as necessary
      setSettings(response.data.data);
    } catch (error) {
      console.error("Failed to fetch site settings", error);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const refreshSettings = async () => {
    await fetchSettings();
  };

  return (
    <SiteSettingsContext.Provider value={{ settings, refreshSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

/**
 * Hook to access site settings context. Throws an error if used outside of
 * SiteSettingsProvider.
 */
export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error(
      "useSiteSettings must be used within a SiteSettingsProvider"
    );
  }
  return context;
};

export { SiteSettingsProvider };
