import "./styles/index.css";

export {
  AccessibilityProvider,
  useAccessibility,
} from "./context/accessibility-context";
export type { AccessibilityProviderProps } from "./context/accessibility-context";
export { AccessibilityWidget } from "./components/accessibility-widget";
export type { AccessibilityWidgetProps } from "./components/accessibility-widget";
export { DEFAULT_LABELS, LABELS_EN, LABELS_TR, labelsForLanguage } from "./components/labels";
export type { AccessibilityWidgetLabels, WidgetLanguage } from "./components/labels";
export { ACCESSIBILITY_PROFILES, findProfile } from "./context/profiles";
export type { AccessibilityProfile } from "./context/profiles";
export {
  DEFAULT_SETTINGS,
  FONT_SCALE_MIN,
  FONT_SCALE_MAX,
  FONT_SCALE_STEP,
  SPACING_MIN,
  SPACING_MAX,
  GRAYSCALE_MAX,
  FONT_SCALE_LEVELS,
  SPACING_LEVELS,
  COLOR_BLINDNESS_LEVELS,
  CONTRAST_LEVELS,
  TEXT_ALIGN_LEVELS,
} from "./context/types";
export type {
  AccessibilitySettings,
  AccessibilityContextValue,
  ContrastMode,
  ColorBlindnessMode,
  TextAlignMode,
} from "./context/types";
