export type ContrastMode = "normal" | "dark" | "light" | "high" | "warm" | "cold";

export type ColorBlindnessMode =
  | "none"
  | "protanopia"
  | "deuteranopia"
  | "tritanopia"
  | "achromatopsia";

export type TextAlignMode = "none" | "left" | "center" | "right" | "justify";

/** Modes for the built-in text-to-speech voice reading tool. */
export type VoiceReadingMode = "none" | "hover" | "selection" | "continuous";

export interface AccessibilitySettings {
  /** Text size multiplier. 1 = 100%. */
  fontSizeScale: number;
   contrast: ContrastMode;
   darkMode: boolean;
   highlightLinks: boolean;
   /** Ege-style plain underline for every link (no background tint). */
   underlineLinks: boolean;
   highlightHeadings: boolean;
  /** Letter spacing step (1 = normal, 4 = wide). */
  letterSpacing: number;
  /** Word spacing step (1 = normal, 4 = wide) — WCAG 1.4.12. */
  wordSpacing: number;
  /** Line height step (1 = normal, 4 = generous). */
  lineHeight: number;
  /** Paragraph spacing step (1 = normal, 4 = generous) — WCAG 1.4.12. */
  paragraphSpacing: number;
   readingLine: boolean;
   /** Ege-style yellow marker strip that follows the pointer. */
   markerLine: boolean;
   colorBlindness: ColorBlindnessMode;
  /** Grayscale intensity 0 = off, 4 = full. */
  grayscaleLevel: number;
  textAlign: TextAlignMode;
  hideImages: boolean;
  stopAnimations: boolean;
  largeCursor: boolean;
  blueLightFilter: boolean;
   readingMask: boolean;
   dyslexiaFont: boolean;
   /** Built-in text-to-speech mode. */
   voiceReading: VoiceReadingMode;
   /** Mutes all audio/video elements on the host page. */
   muteSounds: boolean;
   /** Id of the active profile, null when customized or none selected. */
   activeProfileId: string | null;
}

export interface AccessibilityContextValue {
  settings: AccessibilitySettings;
  update: (partial: Partial<AccessibilitySettings>) => void;
  reset: () => void;
  /** Applies a preset profile and marks it active. */
  applyProfile: (profileId: string) => void;
  isPanelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
}

export const DEFAULT_SETTINGS: AccessibilitySettings = {
  fontSizeScale: 1,
   contrast: "normal",
   darkMode: false,
   highlightLinks: false,
   underlineLinks: false,
   highlightHeadings: false,
    letterSpacing: 1,
    wordSpacing: 1,
    lineHeight: 1,
    paragraphSpacing: 1,
    readingLine: false,
   markerLine: false,
   colorBlindness: "none",
  grayscaleLevel: 0,
  textAlign: "none",
  hideImages: false,
  stopAnimations: false,
  largeCursor: false,
  blueLightFilter: false,
   readingMask: false,
   dyslexiaFont: false,
   voiceReading: "none",
   muteSounds: false,
   activeProfileId: null,
};

export const FONT_SCALE_MIN = 1;
export const FONT_SCALE_MAX = 2;
export const FONT_SCALE_STEP = 0.1;
export const SPACING_MIN = 1;
export const SPACING_MAX = 4;
export const GRAYSCALE_MAX = 4;

/** Cycle levels for the "text zoom" tool (Metin Büyütme). Growth-only:
 *  100% → 125% → 150% → 200% → 100% (küçültme yok). */
export const FONT_SCALE_LEVELS = [1, 1.25, 1.5, 2] as const;
/** Cycle levels for the voice reading tool. */
export const VOICE_READING_LEVELS = ["hover", "selection", "continuous", "none"] as const;
/** Cycle levels for the letter-spacing / line-height tools. */
export const SPACING_LEVELS = [1, 2, 3, 4] as const;
/** Cycle levels for the color blindness tool. */
export const COLOR_BLINDNESS_LEVELS = [
  "protanopia",
  "deuteranopia",
  "tritanopia",
  "achromatopsia",
  "none",
] as const;
/** Cycle levels for the contrast tool. */
export const CONTRAST_LEVELS = ["dark", "light", "high", "warm", "cold", "normal"] as const;
/** Cycle levels for the text alignment tool. */
export const TEXT_ALIGN_LEVELS = ["left", "center", "right", "justify", "none"] as const;

export const DEFAULT_STORAGE_KEY = "@company/accessibility-widget:settings";
export const DEFAULT_LANGUAGE_KEY = "@company/accessibility-widget:language";
