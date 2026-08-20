import { describe, expect, it } from "vitest";
import { loadSettings, saveSettings, clearSettings } from "./storage";
import { DEFAULT_SETTINGS, FONT_SCALE_MAX, SPACING_MAX } from "./types";

const KEY = "test:a11y";

describe("storage", () => {
  it("returns null when nothing is stored", () => {
    expect(loadSettings(KEY, DEFAULT_SETTINGS)).toBeNull();
  });

  it("round-trips settings through localStorage", () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      fontSizeScale: 1.3,
      darkMode: true,
      grayscaleLevel: 2,
    };
    saveSettings(KEY, settings);
    expect(loadSettings(KEY, DEFAULT_SETTINGS)).toEqual(settings);
  });

  it("merges partial stored data over the fallback", () => {
    window.localStorage.setItem(KEY, JSON.stringify({ contrast: "warm" }));
    const loaded = loadSettings(KEY, DEFAULT_SETTINGS);
    expect(loaded).toEqual({ ...DEFAULT_SETTINGS, contrast: "warm" });
  });

  it("migrates legacy grayscale contrast to grayscaleLevel", () => {
    window.localStorage.setItem(KEY, JSON.stringify({ contrast: "grayscale" }));
    const loaded = loadSettings(KEY, DEFAULT_SETTINGS)!;
    expect(loaded.contrast).toBe("normal");
    expect(loaded.grayscaleLevel).toBe(4);
  });

  it("clamps out-of-range numeric values", () => {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({ fontSizeScale: 3, letterSpacing: 99, grayscaleLevel: -2 }),
    );
    const loaded = loadSettings(KEY, DEFAULT_SETTINGS)!;
    expect(loaded.fontSizeScale).toBe(FONT_SCALE_MAX);
    expect(loaded.letterSpacing).toBe(SPACING_MAX);
    expect(loaded.grayscaleLevel).toBe(0);
  });

  it("rejects unknown enum values", () => {
    window.localStorage.setItem(KEY, JSON.stringify({ contrast: "neon" }));
    const loaded = loadSettings(KEY, DEFAULT_SETTINGS)!;
    expect(loaded.contrast).toBe("normal");
  });

  it("returns null for malformed JSON", () => {
    window.localStorage.setItem(KEY, "{not json");
    expect(loadSettings(KEY, DEFAULT_SETTINGS)).toBeNull();
  });

  it("clears stored settings", () => {
    saveSettings(KEY, DEFAULT_SETTINGS);
    clearSettings(KEY);
    expect(window.localStorage.getItem(KEY)).toBeNull();
  });
});
