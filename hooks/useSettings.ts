"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_SETTINGS,
  getSettings,
  saveSettings,
  subscribeSettings,
  applyTheme,
  type AppSettings,
} from "@/lib/settings";

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const current = getSettings();
    setSettings(current);
    applyTheme(current.theme);
    setReady(true);
    return subscribeSettings(setSettings);
  }, []);

  const update = useCallback((patch: Partial<AppSettings>) => {
    setSettings(saveSettings(patch));
  }, []);

  const toggleTheme = useCallback(() => {
    const next = getSettings().theme === "dark" ? "light" : "dark";
    setSettings(saveSettings({ theme: next }));
  }, []);

  return { settings, ready, update, toggleTheme };
}

export default useSettings;
