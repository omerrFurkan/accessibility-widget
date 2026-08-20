import { describe, expect, it, vi } from "vitest";
import { applySettings, clearSettingsEffects } from "./dom-effects";
import { DEFAULT_SETTINGS } from "./types";

function build(overrides: Partial<typeof DEFAULT_SETTINGS> = {}) {
  return { ...DEFAULT_SETTINGS, ...overrides };
}

describe("dom-effects", () => {
  it("toggles the font scaling class and CSS variable", () => {
    applySettings(build({ fontSizeScale: 1.2 }));
    expect(document.documentElement.classList.contains("a11y-font-scaling")).toBe(true);
    expect(document.documentElement.style.getPropertyValue("--a11y-font-scale")).toBe("1.2");
  });

  it("does not add font scaling class at default scale", () => {
    applySettings(DEFAULT_SETTINGS);
    expect(document.documentElement.classList.contains("a11y-font-scaling")).toBe(false);
  });

  it("applies the text spacing class when spacing is changed", () => {
    applySettings(build({ lineHeight: 2 }));
    expect(document.documentElement.classList.contains("a11y-text-spacing")).toBe(true);
    expect(document.documentElement.style.getPropertyValue("--a11y-line-height")).toBe("1.45");
    applySettings(build({ letterSpacing: 3 }));
    expect(document.documentElement.style.getPropertyValue("--a11y-letter-spacing")).toBe("0.1em");
  });

  it("composes filters through a11y-filtered and CSS variables on the body", () => {
    applySettings(build({ darkMode: true, grayscaleLevel: 4, blueLightFilter: true }));
    const root = document.documentElement;
    const body = document.body;
    expect(body.classList.contains("a11y-filtered")).toBe(true);
    expect(root.classList.contains("a11y-filtered")).toBe(false);
    expect(body.style.getPropertyValue("--a11y-filter")).toBe(
      "invert(1) hue-rotate(180deg) grayscale(1) sepia(0.4) hue-rotate(-8deg) saturate(0.85) brightness(1.03)",
    );
    expect(root.classList.contains("a11y-dark-mode")).toBe(true);
  });

  it("removes the filter composition at defaults", () => {
    applySettings(build({ darkMode: true }));
    expect(document.body.classList.contains("a11y-filtered")).toBe(true);
    applySettings(DEFAULT_SETTINGS);
    expect(document.body.classList.contains("a11y-filtered")).toBe(false);
    expect(document.body.style.getPropertyValue("--a11y-filter")).toBe("none");
  });

  it("toggles contrast classes exclusively", () => {
    applySettings(build({ contrast: "high" }));
    expect(document.documentElement.classList.contains("a11y-high-contrast")).toBe(true);
    applySettings(build({ contrast: "warm" }));
    expect(document.documentElement.classList.contains("a11y-high-contrast")).toBe(false);
    applySettings(DEFAULT_SETTINGS);
    expect(document.documentElement.classList.contains("a11y-high-contrast")).toBe(false);
  });

  it("applies the filter-based contrast modes through the body filter", () => {
    applySettings(build({ contrast: "dark" }));
    expect(document.body.classList.contains("a11y-filtered")).toBe(true);
    expect(document.body.style.getPropertyValue("--a11y-filter")).toBe(
      "invert(1) hue-rotate(180deg) contrast(1.05)",
    );
    applySettings(build({ contrast: "light" }));
    expect(document.body.style.getPropertyValue("--a11y-filter")).toBe(
      "brightness(1.08) contrast(1.02)",
    );
    applySettings(build({ contrast: "warm" }));
    expect(document.body.style.getPropertyValue("--a11y-filter")).toBe(
      "sepia(0.25) hue-rotate(-12deg) saturate(1.15)",
    );
    applySettings(build({ contrast: "cold" }));
    expect(document.body.style.getPropertyValue("--a11y-filter")).toBe(
      "hue-rotate(12deg) saturate(1.05)",
    );
    applySettings(build({ contrast: "high" }));
    expect(document.body.classList.contains("a11y-filtered")).toBe(false);
    expect(document.body.style.getPropertyValue("--a11y-filter")).toBe("none");
  });

  it("applies the grayscale level through the composed filter", () => {
    applySettings(build({ grayscaleLevel: 2 }));
    expect(document.body.style.getPropertyValue("--a11y-filter")).toBe("grayscale(0.5)");
  });

  it("applies color blindness through the body filter", () => {
    applySettings(build({ colorBlindness: "protanopia" }));
    expect(document.body.classList.contains("a11y-filtered")).toBe(true);
    expect(document.body.style.getPropertyValue("--a11y-filter")).toBe(
      "url(#a11y-cb-protanopia)",
    );
    applySettings(DEFAULT_SETTINGS);
    expect(document.body.classList.contains("a11y-filtered")).toBe(false);
  });

  it("does not filter the page for the reading mask alone", () => {
    applySettings(build({ readingMask: true }));
    expect(document.body.classList.contains("a11y-filtered")).toBe(false);
    expect(document.body.style.getPropertyValue("--a11y-filter")).toBe("none");
  });

  it("applies the new tool classes", () => {
    applySettings(
      build({
        hideImages: true,
        textAlign: "center",
        stopAnimations: true,
        largeCursor: true,
        dyslexiaFont: true,
      }),
    );
    expect(document.documentElement.classList.contains("a11y-hide-images")).toBe(true);
    expect(document.documentElement.classList.contains("a11y-text-align-center")).toBe(true);
    expect(document.body.classList.contains("a11y-stop-animations")).toBe(true);
    expect(document.body.classList.contains("a11y-large-cursor")).toBe(true);
    expect(document.body.classList.contains("a11y-dyslexia-font")).toBe(true);
  });

  it("applies highlight classes", () => {
    applySettings(build({ highlightLinks: true, highlightHeadings: true }));
    expect(document.documentElement.classList.contains("a11y-links")).toBe(true);
    expect(document.documentElement.classList.contains("a11y-headings")).toBe(true);
  });

  it("pauses playing media with stop animations and resumes it when turned off", () => {
    const video = document.createElement("video");
    Object.defineProperty(video, "paused", { value: false, writable: true, configurable: true });
    video.src = "https://example.com/video.mp4";
    document.body.appendChild(video);

    const pauseSpy = vi
      .spyOn(HTMLMediaElement.prototype, "pause")
      .mockImplementation(function (this: HTMLMediaElement) {
        (this as unknown as { paused: boolean }).paused = true;
      });
    const playSpy = vi
      .spyOn(HTMLMediaElement.prototype, "play")
      .mockImplementation(function (this: HTMLMediaElement) {
        (this as unknown as { paused: boolean }).paused = false;
        return Promise.resolve();
      });

    applySettings(build({ stopAnimations: true }));
    expect(pauseSpy).toHaveBeenCalledTimes(1);
    expect(video.paused).toBe(true);

    applySettings(DEFAULT_SETTINGS);
    expect(playSpy).toHaveBeenCalledTimes(1);
    expect(video.paused).toBe(false);

    video.remove();
    pauseSpy.mockRestore();
    playSpy.mockRestore();
  });

  it("does not pause media that is already stopped", () => {
    const video = document.createElement("video");
    Object.defineProperty(video, "paused", { value: true, writable: true, configurable: true });
    video.src = "https://example.com/video.mp4";
    document.body.appendChild(video);

    const pauseSpy = vi
      .spyOn(HTMLMediaElement.prototype, "pause")
      .mockImplementation(() => undefined);

    applySettings(build({ stopAnimations: true }));
    expect(pauseSpy).not.toHaveBeenCalled();

    video.remove();
    pauseSpy.mockRestore();
  });

  it("clears every class and inline variable", () => {
    applySettings(
      build({
        fontSizeScale: 1.5,
        contrast: "warm",
        darkMode: true,
        highlightLinks: true,
        highlightHeadings: true,
        letterSpacing: 2,
        lineHeight: 2,
        colorBlindness: "tritanopia",
        grayscaleLevel: 3,
        blueLightFilter: true,
        readingMask: true,
        hideImages: true,
        textAlign: "justify",
        stopAnimations: true,
        largeCursor: true,
        dyslexiaFont: true,
      }),
    );
    clearSettingsEffects();
    expect(document.documentElement.className).toBe("");
    expect(document.body.className).toBe("");
    expect(document.documentElement.style.getPropertyValue("--a11y-font-scale")).toBe("");
    expect(document.body.style.getPropertyValue("--a11y-filter")).toBe("");
  });
});
