import { beforeEach, describe, expect, it } from "vitest";
import { applySettings, clearSettingsEffects } from "./dom-effects";
import { createEarlyApplyScript } from "./early-apply";
import { normalizeSettings } from "./storage";
import { DEFAULT_SETTINGS, DEFAULT_STORAGE_KEY } from "./types";

const KEY = DEFAULT_STORAGE_KEY;

function runEarly(script: string = createEarlyApplyScript()): void {
  // Evaluates the snippet exactly like an inline <script> would.
  new Function(script)();
}

function resetDom(): void {
  document.documentElement.className = "";
  document.body.className = "";
  document.documentElement.removeAttribute("style");
  document.body.removeAttribute("style");
  document.documentElement.removeAttribute("lang");
  localStorage.clear();
}

beforeEach(resetDom);

describe("createEarlyApplyScript", () => {
  it("returns bare, parseable JavaScript without <script> tags", () => {
    const script = createEarlyApplyScript();
    expect(script).not.toContain("<script");
    expect(script).not.toContain("</script");
    expect(script.trimEnd().endsWith("})();")).toBe(true);
    expect(() => new Function(script)).not.toThrow();
    // Default keys are baked in as resolved literals.
    expect(script).toContain(JSON.stringify(KEY));
  });

  it("applies dark mode + font scaling + link highlighting", () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({ darkMode: true, fontSizeScale: 1.5, highlightLinks: true }),
    );
    runEarly();

    const html = document.documentElement;
    const body = document.body;
    expect(html.classList.contains("a11y-dark-mode")).toBe(true);
    expect(html.classList.contains("a11y-font-scaling")).toBe(true);
    expect(html.classList.contains("a11y-links")).toBe(true);
    expect(html.style.getPropertyValue("--a11y-font-scale")).toBe("1.5");

    expect(body.classList.contains("a11y-filtered")).toBe(true);
    expect(body.style.getPropertyValue("--a11y-filter")).toContain("invert(1)");
  });

  it("applies color blindness filter references", () => {
    localStorage.setItem(KEY, JSON.stringify({ colorBlindness: "deuteranopia" }));
    runEarly();

    expect(document.body.style.getPropertyValue("--a11y-filter")).toBe(
      "url(#a11y-cb-deuteranopia)",
    );
    expect(document.body.classList.contains("a11y-filtered")).toBe(true);
    expect(document.documentElement.classList.contains("a11y-filtered")).toBe(false);
  });

  it("swallows malformed JSON without throwing or styling", () => {
    localStorage.setItem(KEY, "{this is not json");
    expect(() => runEarly()).not.toThrow();
    expect(document.documentElement.className).toBe("");
    expect(document.body.className).toBe("");
    expect(document.documentElement.getAttribute("style")).toBe(null);
    expect(document.body.getAttribute("style")).toBe(null);
  });

  it("ignores non-object payloads (arrays, primitives)", () => {
    localStorage.setItem(KEY, JSON.stringify([1, 2]));
    expect(() => runEarly()).not.toThrow();
    localStorage.setItem(KEY, '"darkMode":true');
    expect(() => runEarly()).not.toThrow();
    expect(document.documentElement.className).toBe("");
  });

  it("clamps out-of-range numbers to the normalizeSettings bounds", () => {
    localStorage.setItem(KEY, JSON.stringify({ fontSizeScale: 99, letterSpacing: -5, grayscaleLevel: 12 }));
    runEarly();

    const html = document.documentElement;
    expect(html.style.getPropertyValue("--a11y-font-scale")).toBe("2");
    expect(html.classList.contains("a11y-font-scaling")).toBe(true);
    // letterSpacing clamps to 4 -> (4-1)*0.05em; grayscale clamps to 4 -> grayscale(1)
    expect(document.body.style.getPropertyValue("--a11y-filter")).toContain("grayscale(1)");
  });

  it("keeps defaults for wrong-typed values (mirrors normalizeSettings)", () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        fontSizeScale: "big",
        darkMode: "true",
        contrast: "neon",
        colorBlindness: 3,
      }),
    );
    runEarly();

    const html = document.documentElement;
    expect(html.style.getPropertyValue("--a11y-font-scale")).toBe("1");
    expect(html.classList.contains("a11y-font-scaling")).toBe(false);
    expect(html.classList.contains("a11y-dark-mode")).toBe(false);
    expect(document.body.style.getPropertyValue("--a11y-filter")).toBe("none");
    expect(document.body.classList.contains("a11y-filtered")).toBe(false);
  });

  it("respects custom options.storageKey", () => {
    localStorage.setItem(KEY, JSON.stringify({ darkMode: true }));
    localStorage.setItem("custom-key", JSON.stringify({ largeCursor: true }));

    runEarly(createEarlyApplyScript({ storageKey: "custom-key" }));

    expect(document.body.classList.contains("a11y-large-cursor")).toBe(true);
    expect(document.documentElement.classList.contains("a11y-dark-mode")).toBe(false);
  });

  it("respects custom options.languageKey and sets html[lang]", () => {
    localStorage.setItem("@custom/lang", "tr");
    runEarly(createEarlyApplyScript({ languageKey: "@custom/lang" }));
    expect(document.documentElement.getAttribute("lang")).toBe("tr");
  });

  it("produces output identical to applySettings for a full payload", () => {
    const payload: Record<string, unknown> = {
      fontSizeScale: 1.25,
      contrast: "warm",
      darkMode: true,
      highlightLinks: true,
      highlightHeadings: true,
      letterSpacing: 3,
      lineHeight: 2,
      readingLine: true,
      colorBlindness: "deuteranopia",
      grayscaleLevel: 2,
      textAlign: "right",
      hideImages: true,
      stopAnimations: true,
      largeCursor: true,
      blueLightFilter: true,
      readingMask: true,
      dyslexiaFont: true,
    };
    localStorage.setItem(KEY, JSON.stringify(payload));
    runEarly();

    const earlyHtmlStyle = document.documentElement.getAttribute("style");
    const earlyBodyStyle = document.body.getAttribute("style");
    const earlyHtmlCls = document.documentElement.className;
    const earlyBodyCls = document.body.className;

    clearSettingsEffects();
    applySettings(normalizeSettings(payload, DEFAULT_SETTINGS));

    expect(earlyHtmlCls).toBe(document.documentElement.className);
    expect(earlyBodyCls).toBe(document.body.className);
    expect(earlyHtmlStyle).toBe(document.documentElement.getAttribute("style"));
    expect(earlyBodyStyle).toBe(document.body.getAttribute("style"));
    expect(earlyBodyStyle).toContain("invert(1) hue-rotate(180deg) grayscale(0.5)");
    expect(earlyBodyStyle).toContain("sepia(0.4)");
    expect(earlyBodyStyle).toContain("url(#a11y-cb-deuteranopia)");
  });
});
