import type { AccessibilitySettings, ColorBlindnessMode } from "./types";

export const FILTER_NONE = "none";
const INVERT_FILTER = "invert(1) hue-rotate(180deg)";
const BLUE_LIGHT_FILTER = "sepia(0.4) hue-rotate(-8deg) saturate(0.85) brightness(1.03)";

const COLOR_BLINDNESS_VALUES: readonly Exclude<ColorBlindnessMode, "none">[] = [
  "protanopia",
  "deuteranopia",
  "tritanopia",
  "achromatopsia",
];

/**
 * Media elements that were playing and have been paused by the stop-animations
 * setting. Only these get resumed once the setting is turned off again.
 */
const PAUSED_MEDIA = new WeakSet<HTMLMediaElement>();

/**
 * Media elements that were NOT muted by the site itself but have been muted
 * by the mute-sounds setting, so only these get restored when it turns off.
 */
const MUTED_MEDIA = new WeakSet<HTMLMediaElement>();

function muteMedia(mute: boolean): void {
  const media = Array.from(
    document.querySelectorAll<HTMLMediaElement>("video, audio"),
  ).filter((el) => !el.closest("[data-a11y-widget]"));
  media.forEach((el) => {
    if (mute && !el.muted) {
      el.muted = true;
      MUTED_MEDIA.add(el);
    } else if (!mute && MUTED_MEDIA.has(el)) {
      el.muted = false;
      MUTED_MEDIA.delete(el);
    }
  });
}

function pauseMedia(stop: boolean): void {
  const media = Array.from(
    document.querySelectorAll<HTMLMediaElement>("video, audio"),
  ).filter((el) => !el.closest("[data-a11y-widget]"));
  if (stop) {
    media.forEach((el) => {
      if (!el.paused) {
        el.pause();
        PAUSED_MEDIA.add(el);
      }
    });
  } else {
    media.forEach((el) => {
      if (PAUSED_MEDIA.has(el)) {
        void el.play().catch(() => undefined);
        PAUSED_MEDIA.delete(el);
      }
    });
  }
}

function classList(root: HTMLElement): DOMTokenList {
  return root.classList;
}

/**
 * Builds the composed, stackable filter list for the given settings.
 * Contrast modes are class-based palettes (WCAG ratios, see
 * contrast-palettes.ts) and intentionally NOT part of this list —
 * only dark mode, grayscale, blue light and color blindness stack here.
 * The list is built WITHOUT "none" entries: `none` is only valid as the
 * whole filter value, and a bare `none` inside a filter function list
 * makes the entire declaration invalid at computed-value time in real
 * browsers (jsdom never catches this because it does not compute CSS).
 * Exported so the widget can mirror the same filter on its own UI.
 * Note: the reading mask is NOT part of this list — it is a standalone
 * overlay that dims the page around a cursor-following window.
 */
export function composeFilter(settings: AccessibilitySettings): string {
  const invert = settings.darkMode ? INVERT_FILTER : FILTER_NONE;
  const grayscale =
    settings.grayscaleLevel > 0
      ? `grayscale(${settings.grayscaleLevel * 0.25})`
      : FILTER_NONE;
  const blueLight = settings.blueLightFilter ? BLUE_LIGHT_FILTER : FILTER_NONE;
  const cbFilter =
    settings.colorBlindness === "none"
      ? FILTER_NONE
      : `url(#a11y-cb-${settings.colorBlindness})`;

  return (
    [invert, grayscale, blueLight, cbFilter]
      .filter((value) => value !== FILTER_NONE)
      .join(" ") || FILTER_NONE
  );
}

export function applySettings(settings: AccessibilitySettings): void {
  const root = document.documentElement;
  const body = document.body;
  const rootClasses = classList(root);
  const bodyClasses = classList(body);

  root.style.setProperty("--a11y-font-scale", String(settings.fontSizeScale));
  root.style.setProperty(
    "--a11y-letter-spacing",
    `${(settings.letterSpacing - 1) * 0.05}em`,
  );
  root.style.setProperty(
    "--a11y-word-spacing",
    `${(settings.wordSpacing - 1) * 0.08}em`,
  );
  root.style.setProperty(
    "--a11y-line-height",
    `${1.3 + (settings.lineHeight - 1) * 0.15}`,
  );
  root.style.setProperty(
    "--a11y-paragraph-spacing",
    `${(settings.paragraphSpacing - 1) * 0.5}em`,
  );

  // Composed page-wide filters (single filter property, stackable).
  const filterList = composeFilter(settings);

  // The filter lives on <body>. The widget container is mounted outside
  // <body>, so the widget UI is never filtered.
  body.style.setProperty("--a11y-filter", filterList);
  bodyClasses.toggle("a11y-filtered", filterList !== FILTER_NONE);

  rootClasses.toggle("a11y-font-scaling", settings.fontSizeScale !== 1);
  rootClasses.toggle(
    "a11y-text-spacing",
    settings.letterSpacing !== 1 ||
      settings.wordSpacing !== 1 ||
      settings.lineHeight !== 1 ||
      settings.paragraphSpacing !== 1,
  );

  rootClasses.toggle("a11y-dark-mode", settings.darkMode);
  rootClasses.toggle("a11y-high-contrast", settings.contrast === "high");
  rootClasses.toggle("a11y-contrast-dark", settings.contrast === "dark");
  rootClasses.toggle("a11y-contrast-light", settings.contrast === "light");
  rootClasses.toggle("a11y-contrast-warm", settings.contrast === "warm");
  rootClasses.toggle("a11y-contrast-cold", settings.contrast === "cold");

  rootClasses.toggle("a11y-links", settings.highlightLinks);
  rootClasses.toggle("a11y-underline-links", settings.underlineLinks);
  rootClasses.toggle("a11y-headings", settings.highlightHeadings);

  rootClasses.toggle("a11y-hide-images", settings.hideImages);
  rootClasses.toggle("a11y-text-align-left", settings.textAlign === "left");
  rootClasses.toggle("a11y-text-align-center", settings.textAlign === "center");
  rootClasses.toggle("a11y-text-align-right", settings.textAlign === "right");
  rootClasses.toggle("a11y-text-align-justify", settings.textAlign === "justify");

  bodyClasses.toggle("a11y-stop-animations", settings.stopAnimations);
  bodyClasses.toggle("a11y-large-cursor", settings.largeCursor);
  bodyClasses.toggle("a11y-dyslexia-font", settings.dyslexiaFont);

  pauseMedia(settings.stopAnimations);
  muteMedia(settings.muteSounds);
}

export function clearSettingsEffects(): void {
  const root = document.documentElement;
  const body = document.body;

  root.style.removeProperty("--a11y-font-scale");
  root.style.removeProperty("--a11y-letter-spacing");
  root.style.removeProperty("--a11y-word-spacing");
  root.style.removeProperty("--a11y-line-height");
  root.style.removeProperty("--a11y-paragraph-spacing");

  body.style.removeProperty("--a11y-filter");

  root.classList.remove(
    "a11y-font-scaling",
    "a11y-text-spacing",
    "a11y-dark-mode",
    "a11y-high-contrast",
    "a11y-contrast-dark",
    "a11y-contrast-light",
    "a11y-contrast-warm",
    "a11y-contrast-cold",
    "a11y-links",
    "a11y-underline-links",
    "a11y-headings",
    "a11y-hide-images",
    "a11y-text-align-left",
    "a11y-text-align-center",
    "a11y-text-align-right",
    "a11y-text-align-justify",
  );

  body.classList.remove(
    "a11y-filtered",
    "a11y-stop-animations",
    "a11y-large-cursor",
    "a11y-dyslexia-font",
  );

  // Remove any legacy color blindness classes (kept for safety).
  for (const mode of COLOR_BLINDNESS_VALUES) {
    body.classList.remove(`a11y-cb-${mode}`);
  }

  // Resume any media that the stop-animations setting had paused.
  pauseMedia(false);
  // Unmute any media that the mute-sounds setting had muted.
  muteMedia(false);
}
