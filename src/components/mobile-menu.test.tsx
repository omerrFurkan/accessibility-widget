import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render, within, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AccessibilityProvider } from "@/context/accessibility-context";
import { AccessibilityWidget } from "./accessibility-widget";

const KEY = "test:a11y:mobile";

function documentQueries() {
  return within(document.documentElement);
}

function mockMobile() {
  const original = window.matchMedia;
  window.matchMedia = ((query: string) => ({
    matches: query.includes("640"),
    media: query,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  })) as unknown as typeof window.matchMedia;
  return () => {
    window.matchMedia = original;
  };
}

let restoreMedia: (() => void) | null = null;

beforeEach(() => {
  window.localStorage.clear();
  restoreMedia = mockMobile();
});

afterEach(() => {
  restoreMedia?.();
  restoreMedia = null;
});

async function openMenu() {
  const user = userEvent.setup();
  render(
    <AccessibilityProvider storageKey={KEY}>
      <AccessibilityWidget />
    </AccessibilityProvider>,
  );
  const page = documentQueries();
  await user.click(page.getByRole("button", { name: "Erişilebilirlik ayarları" }));
  return { user, page };
}

describe("MobileMenu", () => {
  it("opens the profiles view on mobile", async () => {
    const { page } = await openMenu();
    expect(page.getByRole("dialog", { name: "Erişilebilirlik Aracı" })).toBeInTheDocument();
    expect(page.getByRole("button", { name: "Disleksi Desteği" })).toBeInTheDocument();
    expect(
      page.getByRole("button", { name: "Ayarları Sıfırla" }),
    ).toBeInTheDocument();
  });

  it("switches to the tools rail and back", async () => {
    const { user, page } = await openMenu();
    await user.click(page.getByRole("button", { name: "Araçlar" }));
    expect(page.getByRole("group", { name: "Araçlar" })).toBeInTheDocument();
    expect(page.getByRole("button", { name: "Koyu Mod" })).toBeInTheDocument();

    await user.click(page.getByRole("button", { name: "Profillere dön" }));
    expect(page.getByRole("button", { name: "Disleksi Desteği" })).toBeInTheDocument();
  });

  it("toggles a tool from the rail", async () => {
    const { user, page } = await openMenu();
    await user.click(page.getByRole("button", { name: "Araçlar" }));
    await user.click(page.getByRole("button", { name: "Koyu Mod" }));
    expect(document.documentElement.classList.contains("a11y-dark-mode")).toBe(true);
  });

  it("toggles a tool from the content settings card", async () => {
    const { user, page } = await openMenu();
    expect(page.getByRole("button", { name: "İçerik Ayarları" })).toBeInTheDocument();
    await user.click(page.getByRole("button", { name: "Koyu Mod" }));
    expect(document.documentElement.classList.contains("a11y-dark-mode")).toBe(true);
    await user.click(page.getByRole("button", { name: "İçerik Ayarları" }));
    expect(page.queryByRole("button", { name: "Koyu Mod" })).not.toBeInTheDocument();
  });

  it("applies a profile and resets from the mobile menu", async () => {
    const { user, page } = await openMenu();
    await user.click(page.getByRole("button", { name: "Disleksi Desteği" }));
    expect(document.body.classList.contains("a11y-dyslexia-font")).toBe(true);

    await user.click(page.getByRole("button", { name: "Ayarları Sıfırla" }));
    expect(document.body.classList.contains("a11y-dyslexia-font")).toBe(false);
  });

  it("closes from the navy bar", async () => {
    const { user, page } = await openMenu();
    await user.click(page.getByRole("button", { name: "Araçlar" }));
    await user.click(page.getByRole("button", { name: "Paneli kapat" }));
    // aria-hidden dialogs leave the accessibility tree — assert on the DOM node.
    expect(document.getElementById("a11y-widget-panel")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("keeps focus inside the new view on switch", async () => {
    const { user, page } = await openMenu();
    await user.click(page.getByRole("button", { name: "Araçlar" }));
    act(() => undefined);
    expect(document.activeElement?.getAttribute("aria-label")).toBe("Paneli kapat");
  });
});
