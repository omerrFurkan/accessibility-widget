import { DEFAULT_LANGUAGE_KEY, DEFAULT_STORAGE_KEY } from "./types";

/**
 * Options for {@link createEarlyApplyScript}.
 * Both keys must match the keys the widget uses at runtime
 * (see `DEFAULT_STORAGE_KEY` / `DEFAULT_LANGUAGE_KEY`) or the
 * persisted settings will not be found.
 */
export interface EarlyApplyOptions {
  /** localStorage key the widget persists settings under. */
  storageKey?: string;
  /** localStorage key the widget persists the UI language under. */
  languageKey?: string;
}

/**
 * Builds a standalone, dependency-free, ES5-friendly JavaScript snippet
 * that applies persisted accessibility settings to the document BEFORE any
 * framework code runs, eliminating the flash of unstyled accessibility
 * settings (FOUC) on classic multi-page sites.
 *
 * The returned string contains raw JavaScript (no <script> tags) suitable
 * for injection via `dangerouslySetInnerHTML` into a <script> element
 * placed in the document <head>. Everything is wrapped in a try/catch so
 * the snippet can never break page rendering.
 *
 * The generated code replicates `applySettings` + `composeFilter`
 * (src/context/dom-effects.ts) and the validation bounds of
 * `normalizeSettings` (src/context/storage.ts) so the early-painted state
 * is pixel-identical to what React applies after hydration.
 */
export function createEarlyApplyScript(options?: EarlyApplyOptions): string {
  // Resolve defaults here; the OUTPUT string cannot import anything,
  // so the resolved literals are baked into the generated source.
  const storageKey = options?.storageKey ?? DEFAULT_STORAGE_KEY;
  const languageKey = options?.languageKey ?? DEFAULT_LANGUAGE_KEY;
  // JSON.stringify produces a safely quoted JS string literal for the key.
  const keyLiteral = JSON.stringify(storageKey);
  const langKeyLiteral = JSON.stringify(languageKey);

  // Single-quoted TS literals wrapping double-quoted generated JS keeps
  // escaping to a minimum while the emitted code stays conventionally styled.
  const lines: string[] = [
    '/*! a11y-widget early-apply: pre-framework settings bootstrap. Safe to inline in <head>. */',
    '(function () {',
    '  "use strict";',
    '',
    '  function num(v, min, max, fb, round) {',
    '    if (typeof v !== "number" || v !== v) {',
    '      return fb;',
    '    }',
    '    if (round) {',
    '      v = Math.round(v);',
    '    }',
    '    return Math.min(max, Math.max(min, v));',
    '  }',
    '',
    '  function bool(v) {',
    '    return v === true;',
    '  }',
    '',
    '  function oneOf(v, list, fb) {',
    '    for (var i = 0; i < list.length; i++) {',
    '      if (v === list[i]) {',
    '        return v;',
    '      }',
    '    }',
    '    return fb;',
    '  }',
    '',
    '  function tg(el, name, on) {',
    '    if (!el || !el.classList) {',
    '      return;',
    '    }',
    '    if (typeof el.classList.toggle === "function") {',
    '      el.classList.toggle(name, !!on);',
    '    } else if (on) {',
    '      el.classList.add(name);',
    '    } else {',
    '      el.classList.remove(name);',
    '    }',
    '  }',
    '',
    '  try {',
    `    var s = null;`,
    '    try {',
    `      s = JSON.parse(localStorage.getItem(${keyLiteral}));`,
    '    } catch (e) {',
    '      s = null;',
    '    }',
    '    if (s && typeof s === "object") {',
    '      var html = document.documentElement;',
    '      var body = document.body;',
    '      if (html && body) {',
    '        var fontSizeScale = num(s.fontSizeScale, 1, 2, 1, false);',
    '        var letterSpacing = num(s.letterSpacing, 1, 4, 1, true);',
    '        var wordSpacing = num(s.wordSpacing, 1, 4, 1, true);',
    '        var lineHeight = num(s.lineHeight, 1, 4, 1, true);',
    '        var paragraphSpacing = num(s.paragraphSpacing, 1, 4, 1, true);',
    '        var grayscaleLevel = num(s.grayscaleLevel, 0, 4, 0, true);',
    '        var contrast = oneOf(s.contrast, ["normal", "dark", "light", "high", "warm", "cold"], "normal");',
    '        var colorBlindness = oneOf(s.colorBlindness, ["none", "protanopia", "deuteranopia", "tritanopia", "achromatopsia"], "none");',
    '        var textAlign = oneOf(s.textAlign, ["none", "left", "center", "right", "justify"], "none");',
    '        var darkMode = bool(s.darkMode);',
    '        var highlightLinks = bool(s.highlightLinks);',
    '        var underlineLinks = bool(s.underlineLinks);',
    '        var highlightHeadings = bool(s.highlightHeadings);',
    '        var readingLine = bool(s.readingLine);',
    '        var hideImages = bool(s.hideImages);',
    '        var stopAnimations = bool(s.stopAnimations);',
    '        var largeCursor = bool(s.largeCursor);',
    '        var blueLightFilter = bool(s.blueLightFilter);',
    '        var readingMask = bool(s.readingMask);',
    '        var dyslexiaFont = bool(s.dyslexiaFont);',
    '        var muteSounds = bool(s.muteSounds);',
    '',
    '        html.style.setProperty("--a11y-font-scale", String(fontSizeScale));',
    '        html.style.setProperty("--a11y-letter-spacing", (letterSpacing - 1) * 0.05 + "em");',
    '        html.style.setProperty("--a11y-word-spacing", (wordSpacing - 1) * 0.08 + "em");',
    '        html.style.setProperty("--a11y-line-height", String(1.3 + (lineHeight - 1) * 0.15));',
    '        html.style.setProperty("--a11y-paragraph-spacing", (paragraphSpacing - 1) * 0.5 + "em");',
    '',
    '        var parts = [];',
    '        if (darkMode) {',
    '          parts.push("invert(1) hue-rotate(180deg)");',
    '        }',
    '        if (grayscaleLevel > 0) {',
    '          parts.push("grayscale(" + grayscaleLevel * 0.25 + ")");',
    '        }',
    '        if (blueLightFilter) {',
    '          parts.push("sepia(0.4) hue-rotate(-8deg) saturate(0.85) brightness(1.03)");',
    '        }',
    '        if (colorBlindness !== "none") {',
    '          parts.push("url(#a11y-cb-" + colorBlindness + ")");',
    '        }',
    '        var filter = parts.length > 0 ? parts.join(" ") : "none";',
    '',
    '        body.style.setProperty("--a11y-filter", filter);',
    '        tg(body, "a11y-filtered", filter !== "none");',
    '',
    '        tg(html, "a11y-font-scaling", fontSizeScale !== 1);',
    '        tg(html, "a11y-text-spacing", letterSpacing !== 1 || wordSpacing !== 1 || lineHeight !== 1 || paragraphSpacing !== 1);',
    '        tg(html, "a11y-dark-mode", darkMode);',
    '        tg(html, "a11y-high-contrast", contrast === "high");',
    '        tg(html, "a11y-contrast-dark", contrast === "dark");',
    '        tg(html, "a11y-contrast-light", contrast === "light");',
    '        tg(html, "a11y-contrast-warm", contrast === "warm");',
    '        tg(html, "a11y-contrast-cold", contrast === "cold");',
    '        tg(html, "a11y-links", highlightLinks);',
    '        tg(html, "a11y-underline-links", underlineLinks);',
    '        tg(html, "a11y-headings", highlightHeadings);',
    '        tg(html, "a11y-hide-images", hideImages);',
    '        tg(html, "a11y-text-align-left", textAlign === "left");',
    '        tg(html, "a11y-text-align-center", textAlign === "center");',
    '        tg(html, "a11y-text-align-right", textAlign === "right");',
    '        tg(html, "a11y-text-align-justify", textAlign === "justify");',
    '',
    '        tg(body, "a11y-stop-animations", stopAnimations);',
    '        tg(body, "a11y-large-cursor", largeCursor);',
    '        tg(body, "a11y-dyslexia-font", dyslexiaFont);',
    '      }',
    '    }',
    '    try {',
    `      var lang = localStorage.getItem(${langKeyLiteral});`,
    '      if ((lang === "tr" || lang === "en") && document.documentElement) {',
    '        document.documentElement.setAttribute("lang", lang);',
    '      }',
    '    } catch (e2) {}',
    '  } catch (err) {}',
    '})();',
  ];

  return lines.join("\n");
}
