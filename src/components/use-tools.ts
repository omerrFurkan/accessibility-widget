import type { LucideIcon } from "lucide-react";
import {
  AlignLeft,
  CaseSensitive,
  Contrast,
  Eye,
  Frame,
  Heading1,
  ImageOff,
  Link2,
  ListTree,
  Moon,
  MousePointer2,
  MoveHorizontal,
  Palette,
  PauseCircle,
  Rows3,
  Ruler,
  Sun,
  Type,
  Underline,
  Volume2,
  VolumeX,
  ZoomIn,
} from "lucide-react";
import { useAccessibility } from "@/context/accessibility-context";
import {
  COLOR_BLINDNESS_LEVELS,
  CONTRAST_LEVELS,
  FONT_SCALE_LEVELS,
  SPACING_LEVELS,
  TEXT_ALIGN_LEVELS,
  VOICE_READING_LEVELS,
} from "@/context/types";
import type {
  ColorBlindnessMode,
  ContrastMode,
  TextAlignMode,
} from "@/context/types";
import type { AccessibilityWidgetLabels } from "./labels";
import { voiceModeLabel } from "./voice-reading";

function cycle<T>(levels: readonly T[], current: T): T {
  const index = levels.indexOf(current);
  return levels[(index + 1) % levels.length];
}

function nearestIndex(levels: readonly number[], value: number): number {
  let best = 0;
  let bestDistance = Infinity;
  levels.forEach((level, index) => {
    const distance = Math.abs(level - value);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = index;
    }
  });
  return best;
}

const COLOR_BLIND_NAMES: Record<
  Exclude<ColorBlindnessMode, "none">,
  keyof AccessibilityWidgetLabels
> = {
  protanopia: "colorBlindnessProtanopia",
  deuteranopia: "colorBlindnessDeuteranopia",
  tritanopia: "colorBlindnessTritanopia",
  achromatopsia: "colorBlindnessAchromatopsia",
};

const COLOR_BLIND_PAIR_NAMES: Record<
  Exclude<ColorBlindnessMode, "none">,
  keyof AccessibilityWidgetLabels
> = {
  protanopia: "colorBlindPairProtanopia",
  deuteranopia: "colorBlindPairDeuteranopia",
  tritanopia: "colorBlindPairTritanopia",
  achromatopsia: "colorBlindPairAchromatopsia",
};

const CONTRAST_NAMES: Record<
  Exclude<ContrastMode, "normal">,
  keyof AccessibilityWidgetLabels
> = {
  high: "contrastHigh",
  dark: "contrastDark",
  light: "contrastLight",
  warm: "contrastWarm",
  cold: "contrastCold",
};

const CONTRAST_SHORT_NAMES: Record<
  Exclude<ContrastMode, "normal">,
  keyof AccessibilityWidgetLabels
> = {
  high: "contrastShortHigh",
  dark: "contrastShortDark",
  light: "contrastShortLight",
  warm: "contrastShortWarm",
  cold: "contrastShortCold",
};

const ALIGN_NAMES: Record<
  Exclude<TextAlignMode, "none">,
  keyof AccessibilityWidgetLabels
> = {
  left: "alignLeft",
  center: "alignCenter",
  right: "alignRight",
  justify: "alignJustify",
};

export interface ToolDescriptor {
  id: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
  ariaLabel: string;
  /** Lit indicator dots (0..dotCount); omitted for binary toggles. */
  level?: number;
  dotCount?: number;
}

export interface UseToolsOptions {
  labels: AccessibilityWidgetLabels;
  pageStructureOpen: boolean;
  onOpenPageStructure: () => void;
  onAnnounce?: (message: string) => void;
}

/**
 * Single source of truth for every tool (icon, label, state, action).
 * Shared by the desktop grid and the mobile icon rail so the two
 * can never drift apart.
 */
export function useTools({
  labels,
  pageStructureOpen,
  onOpenPageStructure,
  onAnnounce,
}: UseToolsOptions): ToolDescriptor[] {
  const { settings, update } = useAccessibility();
  const announce = (msg: string) => onAnnounce?.(msg);

  const zoomIndex = nearestIndex(FONT_SCALE_LEVELS as readonly number[], settings.fontSizeScale);
  const zoomActive = settings.fontSizeScale !== 1;
  const zoomPercent = Math.round(settings.fontSizeScale * 100);
  // Growth-only: index maps directly to dots (1→0, 1.25→1, 1.5→2, 2→3)
  // so the first press lights exactly one dot.
  const zoomDotLevel = zoomActive ? zoomIndex : 0;

  const cbIndex = COLOR_BLINDNESS_LEVELS.indexOf(settings.colorBlindness);
  const cbActive = settings.colorBlindness !== "none";
  const cbLabel = cbActive
    ? `${labels.toolColorBlind} (${
        labels[
          COLOR_BLIND_PAIR_NAMES[
            settings.colorBlindness as Exclude<ColorBlindnessMode, "none">
          ]
        ]
      })`
    : labels.toolColorBlind;

  const grayActive = settings.grayscaleLevel > 0;
  const grayNext = grayActive ? 0 : 4;

  const contrastIndex = CONTRAST_LEVELS.indexOf(settings.contrast);
  const contrastActive = settings.contrast !== "normal";
  const contrastLabel = contrastActive
    ? `${labels.toolContrast} (${
        labels[
          CONTRAST_SHORT_NAMES[
            settings.contrast as Exclude<ContrastMode, "normal">
          ]
        ]
      })`
    : labels.toolContrast;

  const spacingIndex = nearestIndex(SPACING_LEVELS as readonly number[], settings.letterSpacing);
  const lineHeightIndex = nearestIndex(SPACING_LEVELS as readonly number[], settings.lineHeight);

  const alignIndex = TEXT_ALIGN_LEVELS.indexOf(settings.textAlign);
  const alignActive = settings.textAlign !== "none";
  const alignLabel = alignActive
    ? `${labels.toolTextAlign} (${
        labels[ALIGN_NAMES[settings.textAlign as Exclude<TextAlignMode, "none">]]
      })`
    : labels.toolTextAlign;

  const vrIndex = VOICE_READING_LEVELS.indexOf(settings.voiceReading);
  const voiceActive = settings.voiceReading !== "none";
  const voiceLabel = voiceActive
    ? `${labels.toolVoiceReading} (${voiceModeLabel(settings.voiceReading, labels)})`
    : labels.toolVoiceReading;

  return [
    {
      id: "text-zoom",
      icon: ZoomIn,
      label: labels.toolTextZoom,
      active: zoomActive,
      level: zoomDotLevel,
      dotCount: 3,
      onClick: () => {
        const next = cycle(FONT_SCALE_LEVELS, FONT_SCALE_LEVELS[zoomIndex]);
        update({ fontSizeScale: next });
        announce(`${labels.toolTextZoom}: %${Math.round(next * 100)}`);
      },
      ariaLabel: `${labels.toolTextZoom}: %${zoomPercent}`,
    },
    {
      id: "color-blindness",
      icon: Eye,
      label: cbLabel,
      active: cbActive,
      level: cbActive ? cbIndex + 1 : 0,
      dotCount: 4,
      onClick: () =>
        update({ colorBlindness: cycle(COLOR_BLINDNESS_LEVELS, settings.colorBlindness) }),
      ariaLabel: `${labels.toolColorBlind}: ${
        cbActive
          ? labels[COLOR_BLIND_NAMES[settings.colorBlindness as Exclude<ColorBlindnessMode, "none">]]
          : labels.contrastNormal
      }`,
    },
    {
      id: "grayscale",
      icon: Palette,
      label: labels.toolGrayscale,
      active: grayActive,
      onClick: () => {
        update({ grayscaleLevel: grayNext });
        announce(`${labels.toolGrayscale}: ${grayNext > 0 ? `100%` : labels.contrastNormal}`);
      },
      ariaLabel: labels.toolGrayscale,
    },
    {
      id: "contrast",
      icon: Contrast,
      label: contrastLabel,
      active: contrastActive,
      level: contrastActive ? contrastIndex + 1 : 0,
      dotCount: 5,
      onClick: () => update({ contrast: cycle(CONTRAST_LEVELS, settings.contrast) }),
      ariaLabel: `${labels.toolContrast}: ${
        contrastActive
          ? labels[CONTRAST_NAMES[settings.contrast as Exclude<ContrastMode, "normal">]]
          : labels.contrastNormal
      }`,
    },
    {
      id: "dark-mode",
      icon: Moon,
      label: labels.toolDarkMode,
      active: settings.darkMode,
      onClick: () => update({ darkMode: !settings.darkMode }),
      ariaLabel: labels.toolDarkMode,
    },
    {
      id: "highlight-links",
      icon: Link2,
      label: labels.toolHighlightLinks,
      active: settings.highlightLinks,
      onClick: () => update({ highlightLinks: !settings.highlightLinks }),
      ariaLabel: labels.toolHighlightLinks,
    },
    {
      id: "underline-links",
      icon: Underline,
      label: labels.toolUnderlineLinks,
      active: settings.underlineLinks,
      onClick: () => update({ underlineLinks: !settings.underlineLinks }),
      ariaLabel: labels.toolUnderlineLinks,
    },
    {
      id: "highlight-headings",
      icon: Heading1,
      label: labels.toolHighlightHeadings,
      active: settings.highlightHeadings,
      onClick: () => update({ highlightHeadings: !settings.highlightHeadings }),
      ariaLabel: labels.toolHighlightHeadings,
    },
    {
      id: "reading-line",
      icon: Ruler,
      label: labels.toolReadingLine,
      active: settings.readingLine,
      onClick: () => update({ readingLine: !settings.readingLine }),
      ariaLabel: labels.toolReadingLine,
    },
    {
      id: "reading-guide",
      icon: MoveHorizontal,
      label: labels.toolReadingGuide,
      active: settings.readingGuide,
      onClick: () => update({ readingGuide: !settings.readingGuide }),
      ariaLabel: labels.toolReadingGuide,
    },
    {
      id: "reading-mask",
      icon: Frame,
      label: labels.toolReadingMask,
      active: settings.readingMask,
      onClick: () => update({ readingMask: !settings.readingMask }),
      ariaLabel: labels.toolReadingMask,
    },
    {
      id: "voice-reading",
      icon: Volume2,
      label: voiceLabel,
      active: voiceActive,
      level: voiceActive ? vrIndex + 1 : 0,
      dotCount: 3,
      onClick: () => update({ voiceReading: cycle(VOICE_READING_LEVELS, settings.voiceReading) }),
      ariaLabel: `${labels.toolVoiceReading}: ${
        voiceActive
          ? voiceModeLabel(settings.voiceReading, labels)
          : labels.contrastNormal
      }`,
    },
    {
      id: "large-cursor",
      icon: MousePointer2,
      label: labels.toolLargeCursor,
      active: settings.largeCursor,
      onClick: () => update({ largeCursor: !settings.largeCursor }),
      ariaLabel: labels.toolLargeCursor,
    },
    {
      id: "blue-light",
      icon: Sun,
      label: labels.toolBlueLight,
      active: settings.blueLightFilter,
      onClick: () => update({ blueLightFilter: !settings.blueLightFilter }),
      ariaLabel: labels.toolBlueLight,
    },
    {
      id: "stop-animations",
      icon: PauseCircle,
      label: labels.toolStopAnimations,
      active: settings.stopAnimations,
      onClick: () => update({ stopAnimations: !settings.stopAnimations }),
      ariaLabel: labels.toolStopAnimations,
    },
    {
      id: "mute-sounds",
      icon: VolumeX,
      label: labels.toolMuteSounds,
      active: settings.muteSounds,
      onClick: () => update({ muteSounds: !settings.muteSounds }),
      ariaLabel: labels.toolMuteSounds,
    },
    {
      id: "hide-images",
      icon: ImageOff,
      label: labels.toolHideImages,
      active: settings.hideImages,
      onClick: () => update({ hideImages: !settings.hideImages }),
      ariaLabel: labels.toolHideImages,
    },
    {
      id: "dyslexia-font",
      icon: Type,
      label: labels.toolDyslexiaFont,
      active: settings.dyslexiaFont,
      onClick: () => update({ dyslexiaFont: !settings.dyslexiaFont }),
      ariaLabel: labels.toolDyslexiaFont,
    },
    {
      id: "line-height",
      icon: Rows3,
      label: labels.toolLineHeight,
      active: settings.lineHeight > 1 || settings.paragraphSpacing > 1,
      level: lineHeightIndex,
      dotCount: 3,
      onClick: () => {
        const next = cycle(SPACING_LEVELS, SPACING_LEVELS[lineHeightIndex]);
        update({ lineHeight: next, paragraphSpacing: next });
        announce(`${labels.toolLineHeight}: ${next}`);
      },
      ariaLabel: `${labels.toolLineHeight}: ${SPACING_LEVELS[lineHeightIndex]}`,
    },
    {
      id: "text-align",
      icon: AlignLeft,
      label: alignLabel,
      active: alignActive,
      level: alignActive ? alignIndex + 1 : 0,
      dotCount: 4,
      onClick: () => update({ textAlign: cycle(TEXT_ALIGN_LEVELS, settings.textAlign) }),
      ariaLabel: `${labels.toolTextAlign}: ${
        alignActive
          ? labels[ALIGN_NAMES[settings.textAlign as Exclude<TextAlignMode, "none">]]
          : labels.contrastNormal
      }`,
    },
    {
      id: "letter-spacing",
      icon: CaseSensitive,
      label: labels.toolLetterSpacing,
      active: settings.letterSpacing > 1 || settings.wordSpacing > 1,
      level: spacingIndex,
      dotCount: 3,
      onClick: () => {
        const next = cycle(SPACING_LEVELS, SPACING_LEVELS[spacingIndex]);
        update({ letterSpacing: next, wordSpacing: next });
        announce(`${labels.toolLetterSpacing}: ${next}`);
      },
      ariaLabel: `${labels.toolLetterSpacing}: ${SPACING_LEVELS[spacingIndex]}`,
    },
    {
      id: "page-structure",
      icon: ListTree,
      label: labels.toolPageStructure,
      active: pageStructureOpen,
      onClick: onOpenPageStructure,
      ariaLabel: labels.toolPageStructure,
    },
  ];
}
