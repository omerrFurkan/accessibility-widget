import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  DEFAULT_SETTINGS,
  DEFAULT_STORAGE_KEY,
} from "./types";
import type { AccessibilityContextValue, AccessibilitySettings } from "./types";
import { loadSettings, normalizeSettings, saveSettings } from "./storage";
import { applySettings, clearSettingsEffects } from "./dom-effects";
import { findProfile } from "./profiles";

export interface AccessibilityProviderProps {
  children: ReactNode;
  /**
   * Settings applied when no persisted state exists.
   * Takes precedence over persisted values? No - persisted values win.
   */
  defaultSettings?: Partial<AccessibilitySettings>;
  /** localStorage key used for persistence. */
  storageKey?: string;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export function AccessibilityProvider({
  children,
  defaultSettings,
  storageKey = DEFAULT_STORAGE_KEY,
}: AccessibilityProviderProps) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => ({
    ...DEFAULT_SETTINGS,
    ...defaultSettings,
  }));
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Load persisted settings once, after mount (SSR/hydration safe).
  useEffect(() => {
    const stored = loadSettings(storageKey, { ...DEFAULT_SETTINGS, ...defaultSettings });
    if (stored) {
      setSettings(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist + apply DOM effects whenever settings change.
  useEffect(() => {
    saveSettings(storageKey, settings);
    applySettings(settings);
    return () => {
      // Only clear when the provider itself unmounts.
      clearSettingsEffects();
    };
  }, [settings, storageKey]);

  // Sync across tabs.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKey && event.newValue) {
        try {
          setSettings(
            normalizeSettings(JSON.parse(event.newValue), {
              ...DEFAULT_SETTINGS,
              ...defaultSettings,
            }),
          );
        } catch {
          // ignore malformed payloads
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [storageKey, defaultSettings]);

  const update = useCallback((partial: Partial<AccessibilitySettings>) => {
    setSettings((prev) => ({ ...prev, ...partial, activeProfileId: null }));
  }, []);

  // Reverts the settings that `profileId` overrides back to their effective
  // defaults, leaving all other settings untouched.
  const revertProfileKeys = useCallback(
    (settings: AccessibilitySettings, profileId: string): AccessibilitySettings => {
      const profile = findProfile(profileId);
      if (!profile) return settings;
      const defaults = { ...DEFAULT_SETTINGS, ...defaultSettings };
      const reverted: AccessibilitySettings = { ...settings };
      for (const key of Object.keys(profile.settings) as (keyof AccessibilitySettings)[]) {
        (reverted as unknown as Record<string, AccessibilitySettings[keyof AccessibilitySettings]>)[
          key
        ] = defaults[key];
      }
      return reverted;
    },
    [defaultSettings],
  );

  const applyProfile = useCallback(
    (profileId: string) => {
      const profile = findProfile(profileId);
      if (!profile) return;
      setSettings((prev) => {
        // Clicking the active profile again toggles it off: revert the
        // profile's own settings back to the effective defaults.
        if (prev.activeProfileId === profile.id) {
          return { ...revertProfileKeys(prev, profile.id), activeProfileId: null };
        }
        // Switching profiles: drop the previous profile's settings first, so
        // its features do not linger while its button shows as unselected.
        const base = prev.activeProfileId
          ? revertProfileKeys(prev, prev.activeProfileId)
          : prev;
        return { ...base, ...profile.settings, activeProfileId: profile.id };
      });
    },
    [revertProfileKeys],
  );

  const reset = useCallback(() => {
    setSettings({ ...DEFAULT_SETTINGS, ...defaultSettings });
  }, [defaultSettings]);

  const openPanel = useCallback(() => setIsPanelOpen(true), []);
  const closePanel = useCallback(() => setIsPanelOpen(false), []);
  const togglePanel = useCallback(() => setIsPanelOpen((open) => !open), []);

  const value = useMemo<AccessibilityContextValue>(
    () => ({
      settings,
      update,
      reset,
      applyProfile,
      isPanelOpen,
      openPanel,
      closePanel,
      togglePanel,
    }),
    [
      settings,
      update,
      reset,
      applyProfile,
      isPanelOpen,
      openPanel,
      closePanel,
      togglePanel,
    ],
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility(): AccessibilityContextValue {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error(
      "useAccessibility must be used within an <AccessibilityProvider>.",
    );
  }
  return ctx;
}
