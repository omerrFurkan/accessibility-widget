import { describe, expect, it } from "vitest";
import { CONTRAST_PALETTES } from "./contrast-palettes";

function luminance(hex: string): number {
  const channels = [0, 2, 4].map((i) => {
    const v = parseInt(hex.slice(1 + i, 3 + i), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function ratio(a: string, b: string): number {
  const hi = Math.max(luminance(a), luminance(b));
  const lo = Math.min(luminance(a), luminance(b));
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * WCAG 2.2: body text AA >= 4.5:1, high-contrast text AAA >= 7:1,
 * every link >= 4.5:1. Guards the literals shared with index.css.
 */
describe("contrast palettes", () => {
  it.each(["dark", "light", "warm", "cold"] as const)(
    "%s body text meets AA 4.5:1",
    (mode) => {
      const p = CONTRAST_PALETTES[mode];
      expect(ratio(p.background, p.text)).toBeGreaterThanOrEqual(4.5);
    },
  );

  it("high body text and links meet AAA 7:1", () => {
    const p = CONTRAST_PALETTES.high;
    expect(ratio(p.background, p.text)).toBeGreaterThanOrEqual(7);
    expect(ratio(p.background, p.link)).toBeGreaterThanOrEqual(7);
  });

  it("every link meets AA 4.5:1", () => {
    for (const p of Object.values(CONTRAST_PALETTES)) {
      expect(ratio(p.background, p.link)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
