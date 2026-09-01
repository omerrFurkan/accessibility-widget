import type { AccessibilitySettings, VoiceReadingMode } from "./types";
import {
  COLOR_BLINDNESS_LEVELS,
  CONTRAST_LEVELS,
  DEFAULT_SETTINGS,
  FONT_SCALE_MAX,
  FONT_SCALE_MIN,
  GRAYSCALE_MAX,
  SPACING_MAX,
  SPACING_MIN,
  TEXT_ALIGN_LEVELS,
  VOICE_READING_LEVELS,
} from "./types";

const COLOR_BLINDNESS_VALUES: readonly string[] = COLOR_BLINDNESS_LEVELS;
const CONTRAST_VALUES: readonly string[] = CONTRAST_LEVELS;
const TEXT_ALIGN_VALUES: readonly string[] = TEXT_ALIGN_LEVELS;

const BOOLEAN_KEYS: readonly (keyof AccessibilitySettings)[] = [
  "darkMode",
  "highlightLinks",
  "underlineLinks",
  "highlightHeadings",
  "readingLine",
  "markerLine",
  "hideImages",
  "stopAnimations",
  "largeCursor",
  "blueLightFilter",
  "readingMask",
  "dyslexiaFont",
  "muteSounds",
];

const VOICE_READING_VALUES: readonly string[] = VOICE_READING_LEVELS;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Coerces an unknown stored payload into a valid AccessibilitySettings,
 * migrating legacy shapes (e.g. old `contrast: "grayscale"`) and clamping
 * numeric ranges.
 */
export function normalizeSettings(
  raw: unknown,
  fallback: AccessibilitySettings,
): AccessibilitySettings {
  const src =
    raw && typeof raw === "object"
      ? (raw as Record<string, unknown>)
      : ({} as Record<string, unknown>);
  const out: AccessibilitySettings = { ...fallback };

  if (src.contrast === "grayscale") {
    // Legacy: grayscale used to live on the contrast enum.
    out.contrast = "normal";
    out.grayscaleLevel = GRAYSCALE_MAX;
  } else if (typeof src.contrast === "string" && CONTRAST_VALUES.includes(src.contrast)) {
    out.contrast = src.contrast as AccessibilitySettings["contrast"];
  }

  if (typeof src.colorBlindness === "string" && COLOR_BLINDNESS_VALUES.includes(src.colorBlindness)) {
    out.colorBlindness = src.colorBlindness as AccessibilitySettings["colorBlindness"];
  }

  if (typeof src.textAlign === "string" && TEXT_ALIGN_VALUES.includes(src.textAlign)) {
    out.textAlign = src.textAlign as AccessibilitySettings["textAlign"];
  }

  if (typeof src.voiceReading === "string" && VOICE_READING_VALUES.includes(src.voiceReading)) {
    out.voiceReading = src.voiceReading as VoiceReadingMode;
  }

  if (typeof src.fontSizeScale === "number") {
    out.fontSizeScale = clamp(src.fontSizeScale, FONT_SCALE_MIN, FONT_SCALE_MAX);
  }
  if (typeof src.letterSpacing === "number") {
    out.letterSpacing = clamp(Math.round(src.letterSpacing), SPACING_MIN, SPACING_MAX);
  }
  if (typeof src.wordSpacing === "number") {
    out.wordSpacing = clamp(Math.round(src.wordSpacing), SPACING_MIN, SPACING_MAX);
  }
  if (typeof src.lineHeight === "number") {
    out.lineHeight = clamp(Math.round(src.lineHeight), SPACING_MIN, SPACING_MAX);
  }
  if (typeof src.paragraphSpacing === "number") {
    out.paragraphSpacing = clamp(Math.round(src.paragraphSpacing), SPACING_MIN, SPACING_MAX);
  }
  if (typeof src.grayscaleLevel === "number") {
    out.grayscaleLevel = clamp(Math.round(src.grayscaleLevel), 0, GRAYSCALE_MAX);
  }

  for (const key of BOOLEAN_KEYS) {
    const value = src[key];
    if (typeof value === "boolean") {
      (out as unknown as Record<string, unknown>)[key] = value;
    }
  }

  if (typeof src.activeProfileId === "string") {
    out.activeProfileId = src.activeProfileId;
  } else {
    out.activeProfileId = null;
  }

  return out;
}

export function loadSettings(
  key: string,
  fallback: AccessibilitySettings,
): AccessibilitySettings | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return normalizeSettings(parsed, fallback);
  } catch {
    return null;
  }
}

export function saveSettings(key: string, settings: AccessibilitySettings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(settings));
  } catch {
    // localStorage unavailable (private mode / quota) - fail silently
  }
}

export function clearSettings(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function loadLanguage(key: string, fallback: "tr" | "en"): "tr" | "en" {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value === "en" ? "en" : value === "tr" ? "tr" : fallback;
  } catch {
    return fallback;
  }
}

export function saveLanguage(key: string, language: "tr" | "en"): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, language);
  } catch {
    // ignore
  }
}

export { DEFAULT_SETTINGS };
