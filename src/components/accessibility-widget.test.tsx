import { describe, expect, it, vi } from "vitest";
import { render, within, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AccessibilityProvider } from "@/context/accessibility-context";
import { AccessibilityWidget } from "./accessibility-widget";

const KEY = "test:a11y:widget";

/**
 * The widget renders through a portal OUTSIDE <body>, so all queries must
 * target the full document (<html>) rather than testing-library's `screen`.
 */
function documentQueries() {
  return within(document.documentElement);
}

describe("AccessibilityWidget", () => {
  it("renders the floating trigger button", () => {
    render(
      <AccessibilityProvider storageKey={KEY}>
        <AccessibilityWidget />
      </AccessibilityProvider>,
    );
    const trigger = documentQueries().getByRole("button", {
      name: "Erişilebilirlik ayarları",
    });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("opens the panel on click and exposes dialog semantics", async () => {
    const user = userEvent.setup();
    render(
      <AccessibilityProvider storageKey={KEY}>
        <AccessibilityWidget />
      </AccessibilityProvider>,
    );
    const page = documentQueries();
    const trigger = page.getByRole("button", { name: "Erişilebilirlik ayarları" });
    await user.click(trigger);

    const dialog = page.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(
      page.getByRole("heading", { name: "Erişilebilirlik Seçenekleri" }),
    ).toBeInTheDocument();
    expect(page.getByText("Erişilebilirlik Profilleri")).toBeInTheDocument();
    expect(page.getByRole("button", { name: "Metin Büyütme: %100" })).toBeInTheDocument();
  });

  it("opens the panel with the Enter key", async () => {
    const user = userEvent.setup();
    render(
      <AccessibilityProvider storageKey={KEY}>
        <AccessibilityWidget />
      </AccessibilityProvider>,
    );
    const page = documentQueries();
    const trigger = page.getByRole("button", { name: "Erişilebilirlik ayarları" });
    trigger.focus();
    await user.keyboard("{Enter}");

    expect(page.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes the panel with Escape", async () => {
    const user = userEvent.setup();
    render(
      <AccessibilityProvider storageKey={KEY}>
        <AccessibilityWidget />
      </AccessibilityProvider>,
    );
    const page = documentQueries();
    await user.click(page.getByRole("button", { name: "Erişilebilirlik ayarları" }));
    expect(page.getByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(page.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes the panel when clicking outside (no backdrop)", async () => {
    const user = userEvent.setup();
    render(
      <AccessibilityProvider storageKey={KEY}>
        <AccessibilityWidget />
      </AccessibilityProvider>,
    );
    const page = documentQueries();
    await user.click(page.getByRole("button", { name: "Erişilebilirlik ayarları" }));
    expect(page.getByRole("dialog")).toBeInTheDocument();

    const body = document.body;
    expect(document.querySelector("[data-a11y-backdrop]")).toBeNull();
    await user.click(body);
    expect(page.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("toggles the panel with the Alt+A shortcut", async () => {
    render(
      <AccessibilityProvider storageKey={KEY}>
        <AccessibilityWidget />
      </AccessibilityProvider>,
    );
    const page = documentQueries();
    const trigger = page.getByRole("button", { name: "Erişilebilirlik ayarları" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "a",
          code: "KeyA",
          altKey: true,
          bubbles: true,
        }),
      );
    });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "a",
          code: "KeyA",
          altKey: true,
          bubbles: true,
        }),
      );
    });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("switches the panel language and persists the choice", async () => {
    const user = userEvent.setup();
    render(
      <AccessibilityProvider storageKey={KEY}>
        <AccessibilityWidget />
      </AccessibilityProvider>,
    );
    const page = documentQueries();
    const root = document.querySelector(".a11y-widget-root");
    expect(root).toHaveAttribute("lang", "tr");

    await user.click(page.getByRole("button", { name: "Erişilebilirlik ayarları" }));
    await user.click(page.getByRole("button", { name: "Dil değiştir" }));

    expect(page.getByRole("heading", { name: "Accessibility Options" })).toBeInTheDocument();
    expect(page.getByRole("button", { name: "Text Zoom: %100" })).toBeInTheDocument();
    expect(root).toHaveAttribute("lang", "en");
    expect(page.getByRole("dialog", { name: "Accessibility Options" })).toHaveAttribute(
      "lang",
      "en",
    );
    expect(window.localStorage.getItem("@company/accessibility-widget:language")).toBe("en");
  });

  it("cycles the text zoom through its levels", async () => {
    const user = userEvent.setup();
    render(
      <AccessibilityProvider storageKey={KEY}>
        <AccessibilityWidget />
      </AccessibilityProvider>,
    );
    const page = documentQueries();
    await user.click(page.getByRole("button", { name: "Erişilebilirlik ayarları" }));

    const zoom = page.getByRole("button", { name: "Metin Büyütme: %100" });
    await user.click(zoom);
    expect(document.documentElement.classList.contains("a11y-font-scaling")).toBe(true);
    expect(page.getByRole("button", { name: "Metin Büyütme: %125" })).toBeInTheDocument();

    await user.click(page.getByRole("button", { name: "Metin Büyütme: %125" }));
    await user.click(page.getByRole("button", { name: "Metin Büyütme: %150" }));
    expect(page.getByRole("button", { name: "Metin Büyütme: %200" })).toBeInTheDocument();

    await user.click(page.getByRole("button", { name: "Metin Büyütme: %200" }));
    // Growth-only cycle wraps back to default (no shrinking).
    expect(document.documentElement.classList.contains("a11y-font-scaling")).toBe(false);
    expect(page.getByRole("button", { name: "Metin Büyütme: %100" })).toBeInTheDocument();
  });

  it("writes the active alignment into the grid button label", async () => {
    const user = userEvent.setup();
    render(
      <AccessibilityProvider storageKey={KEY}>
        <AccessibilityWidget />
      </AccessibilityProvider>,
    );
    const page = documentQueries();
    await user.click(page.getByRole("button", { name: "Erişilebilirlik ayarları" }));
    await user.click(page.getByRole("button", { name: "Metin Hizalama: Normal" }));
    const active = page.getByRole("button", { name: "Metin Hizalama: Sola Hizala" });
    expect(active.textContent).toContain("Sola Hizala");
  });

  it("applies a profile and clears the marker on manual changes", async () => {
    const user = userEvent.setup();
    render(
      <AccessibilityProvider storageKey={KEY}>
        <AccessibilityWidget />
      </AccessibilityProvider>,
    );
    const page = documentQueries();
    await user.click(page.getByRole("button", { name: "Erişilebilirlik ayarları" }));

    await user.click(
      page.getByRole("button", { name: /Erişilebilirlik Profilleri/ }),
    );
    await user.click(page.getByRole("button", { name: /^Disleksi Desteği/ }));
    expect(document.body.classList.contains("a11y-dyslexia-font")).toBe(true);

    // A manual change deselects the profile but keeps the applied values.
    await user.click(page.getByRole("button", { name: "Koyu Mod" }));
    expect(document.body.classList.contains("a11y-dyslexia-font")).toBe(true);
    expect(page.getByText("Profil Seçilmedi")).toBeInTheDocument();
  });

  it("toggles the reading mask spotlight and follows the mouse", async () => {
    const user = userEvent.setup();
    render(
      <AccessibilityProvider storageKey={KEY}>
        <AccessibilityWidget />
      </AccessibilityProvider>,
    );
    const page = documentQueries();
    await user.click(page.getByRole("button", { name: "Erişilebilirlik ayarları" }));
    await user.click(page.getByRole("button", { name: "Okuma Maskesi" }));

    const mask = document.querySelector<HTMLElement>(".a11y-reading-mask-el");
    expect(mask).not.toBeNull();
    expect(document.body.classList.contains("a11y-filtered")).toBe(false);

    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 123, clientY: 456 }));
    });
    expect(mask!.style.left).toBe("123px");
    expect(mask!.style.top).toBe("456px");

    await user.click(page.getByRole("button", { name: "Okuma Maskesi" }));
    expect(document.querySelector(".a11y-reading-mask-el")).toBeNull();
  });

  it("toggles the reading guide bar and follows the mouse", async () => {
    const user = userEvent.setup();
    render(
      <AccessibilityProvider storageKey={KEY}>
        <AccessibilityWidget />
      </AccessibilityProvider>,
    );
    const page = documentQueries();
    await user.click(page.getByRole("button", { name: "Erişilebilirlik ayarları" }));
    await user.click(page.getByRole("button", { name: "Okuma Yardım Çubuğu" }));

    const guide = document.querySelector<HTMLElement>(".a11y-reading-guide-el");
    expect(guide).not.toBeNull();

    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 200, clientY: 300 }));
    });
    expect(guide!.style.left).toBe("200px");
    expect(guide!.style.top).toBe("300px");

    await user.click(page.getByRole("button", { name: "Okuma Yardım Çubuğu" }));
    expect(document.querySelector(".a11y-reading-guide-el")).toBeNull();
  });

  it("grays the widget UI when grayscale is enabled", async () => {
    const user = userEvent.setup();
    render(
      <AccessibilityProvider storageKey={KEY}>
        <AccessibilityWidget />
      </AccessibilityProvider>,
    );
    const page = documentQueries();
    const root = document.querySelector(".a11y-widget-root") as HTMLElement | null;
    expect(root).not.toBeNull();

    await user.click(page.getByRole("button", { name: "Erişilebilirlik ayarları" }));
    expect(root!.classList.contains("a11y-widget-filtered")).toBe(false);

    await user.click(page.getByRole("button", { name: "Gri Tonlama" }));
    expect(document.body.classList.contains("a11y-filtered")).toBe(true);
    expect(root!.classList.contains("a11y-widget-filtered")).toBe(true);
    expect(root!.style.getPropertyValue("--a11y-widget-filter")).toBe("grayscale(1)");

    await user.click(page.getByRole("button", { name: "Gri Tonlama" }));
    expect(root!.classList.contains("a11y-widget-filtered")).toBe(false);
  });

  it("mirrors the color blindness mode on the widget UI", async () => {
    const user = userEvent.setup();
    render(
      <AccessibilityProvider storageKey={KEY}>
        <AccessibilityWidget />
      </AccessibilityProvider>,
    );
    const page = documentQueries();
    const root = document.querySelector(".a11y-widget-root") as HTMLElement | null;
    expect(root).not.toBeNull();

    await user.click(page.getByRole("button", { name: "Erişilebilirlik ayarları" }));
    await user.click(page.getByRole("button", { name: /Renk Körü Modu/ }));

    expect(document.body.classList.contains("a11y-filtered")).toBe(true);
    expect(document.body.style.getPropertyValue("--a11y-filter")).toBe(
      "url(#a11y-cb-protanopia)",
    );
    expect(root!.classList.contains("a11y-widget-filtered")).toBe(true);
    expect(root!.style.getPropertyValue("--a11y-widget-filter")).toBe(
      "url(#a11y-cb-protanopia)",
    );
    expect(
      document.querySelector(".a11y-tool-button.a11y-tool-active .a11y-tool-label")
        ?.textContent,
    ).toBe("Renk Körü Modu (Kırmızı - Yeşil)");

    await user.click(page.getByRole("button", { name: /Renk Körü Modu/ }));
    expect(root!.style.getPropertyValue("--a11y-widget-filter")).toBe(
      "url(#a11y-cb-deuteranopia)",
    );
    expect(
      document.querySelector(".a11y-tool-button.a11y-tool-active .a11y-tool-label")
        ?.textContent,
    ).toBe("Renk Körü Modu (Yeşil - Kırmızı)");

    await user.click(page.getByRole("button", { name: /Renk Körü Modu/ }));
    await user.click(page.getByRole("button", { name: /Renk Körü Modu/ }));
    await user.click(page.getByRole("button", { name: /Renk Körü Modu/ }));
    expect(root!.classList.contains("a11y-widget-filtered")).toBe(false);
    expect(
      page
        .getByRole("button", { name: /Renk Körü Modu/ })
        .querySelector(".a11y-tool-label")?.textContent,
    ).toBe("Renk Körü Modu");
  });

  it("mirrors the dark mode filter on the widget UI", async () => {
    const user = userEvent.setup();
    render(
      <AccessibilityProvider storageKey={KEY}>
        <AccessibilityWidget />
      </AccessibilityProvider>,
    );
    const page = documentQueries();
    const root = document.querySelector(".a11y-widget-root") as HTMLElement | null;
    expect(root).not.toBeNull();

    await user.click(page.getByRole("button", { name: "Erişilebilirlik ayarları" }));
    await user.click(page.getByRole("button", { name: "Koyu Mod" }));

    expect(root!.classList.contains("a11y-widget-filtered")).toBe(true);
    expect(root!.style.getPropertyValue("--a11y-widget-filter")).toBe(
      "invert(1) hue-rotate(180deg)",
    );

    await user.click(page.getByRole("button", { name: "Koyu Mod" }));
    expect(root!.classList.contains("a11y-widget-filtered")).toBe(false);
  });

  it("enlarges the panel via the toggle", async () => {
    const user = userEvent.setup();
    render(
      <AccessibilityProvider storageKey={KEY}>
        <AccessibilityWidget />
      </AccessibilityProvider>,
    );
    const page = documentQueries();
    await user.click(page.getByRole("button", { name: "Erişilebilirlik ayarları" }));
    expect(
      document.querySelector(".a11y-widget-root")?.classList.contains("a11y-panel-enlarged"),
    ).toBe(false);

    await user.click(page.getByRole("switch", { name: "Paneli Büyüt" }));
    expect(
      document.querySelector(".a11y-widget-root")?.classList.contains("a11y-panel-enlarged"),
    ).toBe(true);
  });

  it("resets everything via the footer button", async () => {
    const user = userEvent.setup();
    render(
      <AccessibilityProvider storageKey={KEY}>
        <AccessibilityWidget />
      </AccessibilityProvider>,
    );
    const page = documentQueries();
    await user.click(page.getByRole("button", { name: "Erişilebilirlik ayarları" }));
    await user.click(page.getByRole("button", { name: "Metin Büyütme: %100" }));
    expect(document.documentElement.classList.contains("a11y-font-scaling")).toBe(true);

    await user.click(page.getByRole("button", { name: "Ayarları Sıfırla" }));
    expect(document.documentElement.classList.contains("a11y-font-scaling")).toBe(false);
    expect(page.getByRole("button", { name: "Metin Büyütme: %100" })).toBeInTheDocument();
  });

  it("traps focus in the page structure overlay and restores it on close", async () => {
    const user = userEvent.setup();
    render(
      <AccessibilityProvider storageKey={KEY}>
        <AccessibilityWidget />
      </AccessibilityProvider>,
    );
    const page = documentQueries();
    await user.click(page.getByRole("button", { name: "Erişilebilirlik ayarları" }));

    const tool = page.getByRole("button", { name: "Sayfa Yapısı" });
    const heading = document.createElement("h1");
    heading.textContent = "Test Başlığı";
    document.body.appendChild(heading);
    await user.click(tool);

    const overlay = page.getByRole("dialog", { name: "Sayfa Yapısı" });
    expect(overlay).toBeInTheDocument();

    // Focus moves into the overlay (the refresh button is its first focusable).
    const refresh = page.getByRole("button", { name: "Başlık listesini yenile" });
    const close = page.getByRole("button", { name: "Kapat" });
    expect(document.activeElement).toBe(refresh);

    // The panel behind the overlay is inert.
    expect(
      page.getByRole("dialog", { name: "Erişilebilirlik Seçenekleri" }),
    ).toHaveAttribute("inert");

    // Tab wraps within the overlay.
    await user.tab();
    expect(document.activeElement).toBe(close);
    await user.tab();
    expect(document.activeElement).toBe(
      page.getByRole("button", { name: /^H1 Test Başlığı/ }),
    );
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(close);
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(refresh);

    // Escape closes and focus returns to the trigger button.
    await user.keyboard("{Escape}");
    heading.remove();
    expect(page.queryByRole("dialog", { name: "Sayfa Yapısı" })).not.toBeInTheDocument();
    expect(document.activeElement).toBe(tool);
  });

  it("refreshes the heading list in the page structure overlay", async () => {
    const user = userEvent.setup();
    render(
      <AccessibilityProvider storageKey={KEY}>
        <AccessibilityWidget />
      </AccessibilityProvider>,
    );
    const page = documentQueries();
    const heading = document.createElement("h2");
    heading.textContent = "İlk Başlık";
    document.body.appendChild(heading);

    await user.click(page.getByRole("button", { name: "Erişilebilirlik ayarları" }));
    await user.click(page.getByRole("button", { name: "Sayfa Yapısı" }));

    const overlay = page.getByRole("dialog", { name: "Sayfa Yapısı" });
    expect(
      within(overlay).getByRole("button", { name: /^H2 İlk Başlık/ }),
    ).toBeInTheDocument();

    const added = document.createElement("h3");
    added.textContent = "Yeni Başlık";
    document.body.appendChild(added);

    await user.click(page.getByRole("button", { name: "Başlık listesini yenile" }));
    expect(
      within(overlay).getByRole("button", { name: /^H3 Yeni Başlık/ }),
    ).toBeInTheDocument();

    heading.remove();
    added.remove();
  });

  it("announces profile application and settings reset via the live region", async () => {
    const user = userEvent.setup();
    render(
      <AccessibilityProvider storageKey={KEY}>
        <AccessibilityWidget />
      </AccessibilityProvider>,
    );
    const page = documentQueries();
    const announce = () =>
      (document.querySelector("[data-a11y-announce]") as HTMLElement)?.textContent ?? "";

    await user.click(page.getByRole("button", { name: "Erişilebilirlik ayarları" }));
    await user.click(page.getByRole("button", { name: /Erişilebilirlik Profilleri/ }));
    await user.click(page.getByRole("button", { name: /^DEHB Desteği/ }));
    expect(announce()).toBe("DEHB Desteği profili uygulandı");

    // Clicking the active profile again removes it.
    await user.click(page.getByRole("button", { name: /^DEHB Desteği/ }));
    expect(announce()).toBe("DEHB Desteği profili kaldırıldı");

    await user.click(page.getByRole("button", { name: "Ayarları Sıfırla" }));
    expect(announce()).toBe("Ayarlar sıfırlandı");
  });

  it("announces language changes via the live region", async () => {
    const user = userEvent.setup();
    render(
      <AccessibilityProvider storageKey={KEY}>
        <AccessibilityWidget />
      </AccessibilityProvider>,
    );
    const page = documentQueries();
    const announce = () =>
      (document.querySelector("[data-a11y-announce]") as HTMLElement)?.textContent ?? "";

    await user.click(page.getByRole("button", { name: "Erişilebilirlik ayarları" }));
    await user.click(page.getByRole("button", { name: "Dil değiştir" }));
    expect(announce()).toBe("Dil değiştirildi");
  });

  it("exposes list semantics for the profiles list", async () => {
    const user = userEvent.setup();
    render(
      <AccessibilityProvider storageKey={KEY}>
        <AccessibilityWidget />
      </AccessibilityProvider>,
    );
    const page = documentQueries();
    await user.click(page.getByRole("button", { name: "Erişilebilirlik ayarları" }));

    expect(page.queryByRole("list")).not.toBeInTheDocument();

    await user.click(page.getByRole("button", { name: /Erişilebilirlik Profilleri/ }));
    const profilesList = page.getByRole("list");
    expect(within(profilesList).getAllByRole("listitem")).toHaveLength(6);
  });

  it("renders the mobile menu instead of the panel when the viewport is narrow", async () => {
    const user = userEvent.setup();
    const matchMediaSpy = vi
      .spyOn(window, "matchMedia")
      .mockImplementation((query) => ({
        matches: query === "(max-width: 640px)",
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        onchange: null,
        dispatchEvent: vi.fn(),
      }));

    render(
      <AccessibilityProvider storageKey={KEY}>
        <AccessibilityWidget />
      </AccessibilityProvider>,
    );
    const page = documentQueries();
    await user.click(page.getByRole("button", { name: "Erişilebilirlik ayarları" }));

    const menu = page.getByRole("dialog", { name: "Erişilebilirlik Aracı" });
    expect(menu).toHaveClass("a11y-mobile-menu");
    expect(
      page.queryByRole("dialog", { name: "Erişilebilirlik Seçenekleri" }),
    ).not.toBeInTheDocument();

    matchMediaSpy.mockRestore();
  });

  it("renders the widget outside <body> (unaffected by page filters)", () => {
    render(
      <AccessibilityProvider storageKey={KEY}>
        <AccessibilityWidget />
      </AccessibilityProvider>,
    );
    const container = document.getElementById("a11y-widget-container");
    expect(container).not.toBeNull();
    expect(document.body.contains(container)).toBe(false);
    expect(container).toContainElement(
      documentQueries().getByRole("button", { name: "Erişilebilirlik ayarları" }),
    );
  });
});
