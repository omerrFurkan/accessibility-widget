import { describe, expect, it } from "vitest";
import { applySettings, clearSettingsEffects, composeFilter } from "./dom-effects";
import { DEFAULT_SETTINGS } from "./types";

function build(overrides: Partial<typeof DEFAULT_SETTINGS> = {}) {
  return { ...DEFAULT_SETTINGS, ...overrides };
}

/**
 * Locks the intended panel behavior: filter-family modes are mirrored
 * onto the widget root (so the panel stays consistent with the page),
 * while palette/class-family modes never touch the panel.
 */
describe("widget filter mirror", () => {
  it.each([
    ["darkMode", build({ darkMode: true })],
    ["grayscale", build({ grayscaleLevel: 4 })],
    ["blueLightFilter", build({ blueLightFilter: true })],
    ["colorBlindness", build({ colorBlindness: "protanopia" })],
  ])("mirrors %s onto the widget", (_name, settings) => {
    expect(composeFilter(settings)).not.toBe("none");
  });

  it.each([
    ["contrast:dark (palette)", build({ contrast: "dark" })],
    ["contrast:light (palette)", build({ contrast: "light" })],
    ["contrast:warm (palette)", build({ contrast: "warm" })],
    ["contrast:cold (palette)", build({ contrast: "cold" })],
    ["contrast:high (class-based restyle instead)", build({ contrast: "high" })],
    ["readingMask (overlay only)", build({ readingMask: true })],
    ["stopAnimations", build({ stopAnimations: true })],
    ["muteSounds", build({ muteSounds: true })],
    ["highlightLinks", build({ highlightLinks: true })],
    ["dyslexiaFont", build({ dyslexiaFont: true })],
  ])("does not mirror %s onto the widget", (_name, settings) => {
    expect(composeFilter(settings)).toBe("none");
  });

  it("toggles the high-contrast class that restyles the panel", () => {
    applySettings(build({ contrast: "high" }));
    expect(document.documentElement.classList.contains("a11y-high-contrast")).toBe(true);
    clearSettingsEffects();
    expect(document.documentElement.classList.contains("a11y-high-contrast")).toBe(false);
  });
});
