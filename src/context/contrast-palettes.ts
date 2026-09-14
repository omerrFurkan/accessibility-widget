import type { ContrastMode } from "./types";

/**
 * Single source of truth for the class-based contrast palettes.
 * Every pair below is verified by `contrast-palettes.test.ts` against
 * WCAG 2.2 ratios (AA 4.5:1 for body text, AAA 7:1 for high-contrast text).
 * The same literals are mirrored in `src/styles/index.css`
 * (`a11y-contrast-*` blocks) — keep the two in sync.
 */
export interface ContrastPalette {
  background: string;
  text: string;
  link: string;
}

export const CONTRAST_PALETTES: Record<Exclude<ContrastMode, "normal">, ContrastPalette> = {
  dark: { background: "#121212", text: "#ffffff", link: "#8ab4f8" },
  light: { background: "#ffffff", text: "#111111", link: "#0b57d0" },
  high: { background: "#000000", text: "#ffffff", link: "#ffff00" },
  warm: { background: "#fdf6e3", text: "#433006", link: "#7c2d12" },
  cold: { background: "#edf3f8", text: "#0b2b40", link: "#0b4f8a" },
};
