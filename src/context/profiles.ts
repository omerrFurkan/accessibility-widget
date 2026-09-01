import type { AccessibilitySettings } from "./types";

export interface AccessibilityProfile {
  id: string;
  /** Key into the labels dictionary for the profile name. */
  nameKey: string;
  /** Key into the labels dictionary for the one-line description. */
  descriptionKey: string;
  /** Key into the labels dictionary for the expanded settings summary. */
  detailsKey: string;
  settings: Partial<AccessibilitySettings>;
}

export const ACCESSIBILITY_PROFILES: AccessibilityProfile[] = [
  {
    id: "adhd",
    nameKey: "profileAdhd",
    descriptionKey: "profileDescAdhd",
    detailsKey: "profileDetailsAdhd",
    settings: {
      stopAnimations: true,
      readingLine: true,
    },
  },
  {
    id: "low-vision",
    nameKey: "profileLowVision",
    descriptionKey: "profileDescLowVision",
    detailsKey: "profileDetailsLowVision",
    settings: {
      fontSizeScale: 1.5,
      contrast: "high",
      lineHeight: 3,
      largeCursor: true,
    },
  },
  {
    id: "dyslexia",
    nameKey: "profileDyslexia",
    descriptionKey: "profileDescDyslexia",
    detailsKey: "profileDetailsDyslexia",
    settings: {
      dyslexiaFont: true,
      letterSpacing: 3,
      lineHeight: 4,
      readingLine: true,
    },
  },
  {
    id: "color-blind",
    nameKey: "profileColorBlind",
    descriptionKey: "profileDescColorBlind",
    detailsKey: "profileDetailsColorBlind",
    settings: {
      colorBlindness: "deuteranopia",
    },
  },
  {
    id: "epilepsy",
    nameKey: "profileEpilepsy",
    descriptionKey: "profileDescEpilepsy",
    detailsKey: "profileDetailsEpilepsy",
    settings: {
      stopAnimations: true,
      hideImages: true,
    },
  },
  {
    id: "elderly",
    nameKey: "profileElderly",
    descriptionKey: "profileDescElderly",
    detailsKey: "profileDetailsElderly",
    settings: {
      fontSizeScale: 1.25,
      lineHeight: 3,
      letterSpacing: 1,
      largeCursor: true,
      blueLightFilter: true,
    },
  },
];

export function findProfile(profileId: string | null): AccessibilityProfile | undefined {
  if (!profileId) return undefined;
  return ACCESSIBILITY_PROFILES.find((profile) => profile.id === profileId);
}
