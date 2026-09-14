/**
 * End-user acceptance tests: drive the real demo page like a keyboard/mouse
 * user and assert every tool visibly affects the host page (DOM classes,
 * CSS variables, media state) — the same checks a human tester performs.
 */
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const TRIG = "button[aria-label='Erişilebilirlik ayarları']";
const TRIG_ANY = "button[aria-controls='a11y-widget-panel']";
const PANEL = "#a11y-widget-panel";

async function openPanel(page: Page) {
  await page.click(TRIG);
  await expect(page.locator(PANEL)).toHaveAttribute("aria-hidden", "false");
}

/** Navigates to the demo with localStorage cleared via a clean context page. */
async function fresh(page: Page, suffix = "") {
  await page.goto("/" + suffix);
  await page.waitForSelector(TRIG);
}

const htmlClass = (page: Page, cls: string) =>
  page.evaluate((c) => document.documentElement.classList.contains(c), cls);
const bodyClass = (page: Page, cls: string) =>
  page.evaluate((c) => document.body.classList.contains(c), cls);

test.beforeEach(async ({ page }) => {
  // spy on speech synthesis for the TTS tests
  await page.addInitScript(() => {
    (window as any).__a11ySpoken = [] as string[];
    if (window.speechSynthesis) {
      const origSpeak = window.speechSynthesis.speak.bind(window.speechSynthesis);
      (window as any).__a11ySpeakSpy = (utt: SpeechSynthesisUtterance) => {
        (window as any).__a11ySpoken.push(utt.text);
      };
      window.speechSynthesis.speak = (utt: SpeechSynthesisUtterance) => {
        (window as any).__a11ySpeakSpy(utt);
        try {
          origSpeak(utt);
        } catch {
          /* headless environments may lack voices */
        }
      };
    }
  });
});

test.describe("Panel açma/kapama (kullanıcı görünümü)", () => {
  test("tetikleyici buton görünür ve paneli açar", async ({ page }) => {
    await fresh(page);
    await expect(page.locator(TRIG)).toBeVisible();
    await openPanel(page);
    await expect(page.locator("h2", { hasText: "Erişilebilirlik Seçenekleri" })).toBeVisible();
  });

  test("Alt+A kısayolu paneli açar/kapatır", async ({ page }) => {
    await fresh(page);
    await page.keyboard.press("Alt+a");
    await expect(page.locator(PANEL)).toHaveAttribute("aria-hidden", "false");
    await page.keyboard.press("Alt+a");
    await expect(page.locator(PANEL)).toHaveAttribute("aria-hidden", "true");
  });

  test("Escape ve arka plan tıklaması paneli kapatır", async ({ page }) => {
    await fresh(page);
    await openPanel(page);
    await page.keyboard.press("Escape");
    await expect(page.locator(PANEL)).toHaveAttribute("aria-hidden", "true");
    await openPanel(page);
    await page.mouse.click(50, 400); // host page area
    await expect(page.locator(PANEL)).toHaveAttribute("aria-hidden", "true");
  });
});

test.describe("Entegrasyon noktaları", () => {
  test("window.accessibilityWidget global API paneli açar (footer link senaryosu)", async ({
    page,
  }) => {
    await fresh(page);
    await page.evaluate(() => (window as any).accessibilityWidget.open());
    await expect(page.locator("#a11y-widget-panel")).toBeVisible();
  });

  test("?a11y=open parametresi paneli otomatik açar", async ({ page }) => {
    await fresh(page, "?a11y=open");
    await expect(page.locator("#a11y-widget-panel")).toBeVisible();
  });
});

test.describe("Araçlar (sayfa üzerindeki etki doğrulaması)", () => {
  test("metin büyütme: %100 → %125 → ... → %80 (çift yönlü döngü)", async ({ page }) => {
    await fresh(page);
    await openPanel(page);
    const label = (pct: string) => page.getByRole("button", { name: `Metin Büyütme: %${pct}` });

    await label("100").click();
    await expect(label("125")).toBeVisible();
    expect(await htmlClass(page, "a11y-font-scaling")).toBe(true);
    const size = await page.evaluate(() =>
      document.documentElement.style.getPropertyValue("--a11y-font-scale"),
    );
    expect(size).toBe("1.25");

    await label("125").click();
    await label("150").click();
    await expect(label("200")).toBeVisible();
    await label("200").click();
    await expect(label("80")).toBeVisible(); // wraps to shrink
    await label("80").click();
    await expect(label("90")).toBeVisible();
    await label("90").click();
    expect(await htmlClass(page, "a11y-font-scaling")).toBe(false); // back at 100
  });

  test("kontrast döngüsü: koyu → açık → yüksek → sıcak → soğuk → normal", async ({ page }) => {
    await fresh(page);
    await openPanel(page);
    const btn = page.getByRole("button", { name: /Kontrast Modu/ });
    await btn.click(); // dark — palette class, no body filter
    expect(await htmlClass(page, "a11y-contrast-dark")).toBe(true);
    expect(await bodyClass(page, "a11y-filtered")).toBe(false);
    await btn.click(); // light
    expect(await htmlClass(page, "a11y-contrast-light")).toBe(true);
    await btn.click(); // high
    expect(await htmlClass(page, "a11y-high-contrast")).toBe(true);
    await btn.click(); // warm — palette class, high removed
    expect(await htmlClass(page, "a11y-high-contrast")).toBe(false);
    expect(await htmlClass(page, "a11y-contrast-warm")).toBe(true);
    await btn.click(); // cold
    expect(await htmlClass(page, "a11y-contrast-cold")).toBe(true);
    await btn.click(); // back to normal
    await expect(page.getByRole("button", { name: "Kontrast Modu: Normal" })).toBeVisible();
    expect(await htmlClass(page, "a11y-high-contrast")).toBe(false);
  });

  test("koyu mod + gri tonlama + mavi ışık filtreleri birleşir", async ({ page }) => {
    await fresh(page);
    await openPanel(page);
    await page.getByRole("button", { name: "Koyu Mod" }).click();
    await page.getByRole("button", { name: "Gri Tonlama" }).click();
    await page.getByRole("button", { name: "Mavi Işık Filtresi" }).click();
    expect(await htmlClass(page, "a11y-dark-mode")).toBe(true);
    const filter = await page.evaluate(() =>
      document.body.style.getPropertyValue("--a11y-filter"),
    );
    expect(filter).toContain("invert(1)");
    expect(filter).toContain("grayscale(1)");
    expect(filter).toContain("sepia(0.4)");
  });

  test("renk körü filtreleri SVG filtrelerine bağlanır", async ({ page }) => {
    await fresh(page);
    await openPanel(page);
    const btn = page.getByRole("button", { name: /Renk Körü Modu/ });
    await btn.click(); // protanopia
    const filter = await page.evaluate(() =>
      document.body.style.getPropertyValue("--a11y-filter"),
    );
    expect(filter).toContain("url(#a11y-cb-protanopia)");
    await expect(page.locator("#a11y-cb-protanopia")).toBeAttached();
  });

  test("link vurgu ve altı çizgi (Ege paritesi) ayrı ayrı çalışır", async ({ page }) => {
    await fresh(page);
    await openPanel(page);
    await page.getByRole("button", { name: "Linkleri Vurgula" }).click();
    expect(await htmlClass(page, "a11y-links")).toBe(true);
    expect(await htmlClass(page, "a11y-underline-links")).toBe(false);
    await page.getByRole("button", { name: "Linkleri Altına Çiz" }).click();
    expect(await htmlClass(page, "a11y-underline-links")).toBe(true);
    const decor = await page.locator("a[href='#demo-link']").evaluate(
      (el) => getComputedStyle(el).textDecorationLine,
    );
    expect(decor).toContain("underline");
  });

  test("okuma çizgisi fareyi takip eder", async ({ page }) => {
    await fresh(page);
    await openPanel(page);
    await page.getByRole("button", { name: "Okuma Çizgisi" }).click();
    await page.mouse.move(300, 420);
    const lineTop = await page.locator(".a11y-reading-line-el").evaluate(
      (el) => parseFloat((el as HTMLElement).style.top),
    );
    expect(lineTop).toBeGreaterThan(380);
    expect(lineTop).toBeLessThan(430);
  });

  test("okuma maskesi ve mesafe araçları sınıf uygular", async ({ page }) => {
    await fresh(page);
    await openPanel(page);
    await page.getByRole("button", { name: "Okuma Maskesi" }).click();
    await expect(page.locator(".a11y-reading-mask-el")).toBeAttached();
    await page.getByRole("button", { name: /Satır Yüksekliği/ }).click();
    expect(await htmlClass(page, "a11y-text-spacing")).toBe(true);
    await page.getByRole("button", { name: /Harf Aralığı/ }).click();
    const ls = await page.evaluate(() =>
      document.documentElement.style.getPropertyValue("--a11y-letter-spacing"),
    );
    expect(ls).toBe("0.05em");
  });

  test("görsel gizleme + animasyon durdurma + sesleri susturma bir arada", async ({ page }) => {
    await fresh(page);
    await openPanel(page);
    await page.getByRole("button", { name: "Resimleri Gizle" }).click();
    await page.getByRole("button", { name: "Animasyonları Durdur" }).click();
    await page.getByRole("button", { name: "Sesleri Sustur" }).click();
    expect(await htmlClass(page, "a11y-hide-images")).toBe(true);
    expect(await bodyClass(page, "a11y-stop-animations")).toBe(true);
  });

  test("disleksi fontu + büyük imleç + hizalama + başlık vurgusu", async ({ page }) => {
    await fresh(page);
    await openPanel(page);
    await page.getByRole("button", { name: "Disleksi Dostu Font" }).click();
    await page.getByRole("button", { name: "Büyük İmleç" }).click();
    await page.getByRole("button", { name: "Başlıkları Vurgula" }).click();
    await page.getByRole("button", { name: /Metin Hizalama/ }).click();
    expect(await bodyClass(page, "a11y-dyslexia-font")).toBe(true);
    expect(await bodyClass(page, "a11y-large-cursor")).toBe(true);
    expect(await htmlClass(page, "a11y-headings")).toBe(true);
    expect(await htmlClass(page, "a11y-text-align-left")).toBe(true);
    const fam = await page.locator(".demo-card p").first().evaluate(
      (el) => getComputedStyle(el).fontFamily,
    );
    expect(fam.toLowerCase()).toContain("opendyslexic");
  });
});

test.describe("Sesli okuma (TTS)", () => {
  test("hover modu: fare metnin üzerine gelince okur", async ({ page }) => {
    await fresh(page);
    await openPanel(page);
    await page.getByRole("button", { name: /Sesli Okuma/ }).click(); // hover mode
    await expect(page.getByRole("button", { name: "Sesli Okuma: Üzerine Gelince" })).toBeVisible();
    // move over the host-page <h1> (its text is predictable)
    const h1 = page.locator(".demo-hero h1");
    const box = (await h1.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await expect
      .poll(
        async () => page.evaluate(() => (window as any).__a11ySpoken.length),
        { timeout: 4000 },
      )
      .toBeGreaterThan(0);
    const spoken: string[] = await page.evaluate(() => (window as any).__a11ySpoken);
    expect(spoken[0]).toContain("Yüksek İhtisas Üniversitesi");
  });

  test("seçim modu: metin seçilince okur", async ({ page }) => {
    await fresh(page);
    await openPanel(page);
    await page.getByRole("button", { name: /Sesli Okuma/ }).click();
    await page.getByRole("button", { name: /Sesli Okuma/ }).click(); // selection mode
    const p = page.locator(".demo-hero p").first();
    const box = (await p.boundingBox())!;
    // drag-select some text
    await page.mouse.move(box.x, box.y + 4);
    await page.mouse.down();
    await page.mouse.move(box.x + Math.min(200, box.width), box.y + 4, { steps: 5 });
    await page.mouse.up();
    await expect
      .poll(
        async () => page.evaluate(() => (window as any).__a11ySpoken.length),
        { timeout: 4000 },
      )
      .toBeGreaterThan(0);
  });
});

test.describe("Profiller ve genel akış", () => {
  test("görme desteği profili uygulanır ve sıfırlanır", async ({ page }) => {
    await fresh(page);
    await openPanel(page);
    // expand the profiles accordion
    await page.getByText("Erişilebilirlik Profilleri").click();
    await page.getByRole("button", { name: /Görme Desteği/ }).click();
    expect(await htmlClass(page, "a11y-high-contrast")).toBe(true);
    const scale = await page.evaluate(() =>
      document.documentElement.style.getPropertyValue("--a11y-font-scale"),
    );
    expect(scale).toBe("1.3");
    expect(await bodyClass(page, "a11y-large-cursor")).toBe(true);

    await page.getByRole("button", { name: "Ayarları Sıfırla" }).click();
    expect(await htmlClass(page, "a11y-high-contrast")).toBe(false);
    expect(await htmlClass(page, "a11y-font-scaling")).toBe(false);
  });

  test("tercihler sayfa yenilendiğinde korunur (localStorage)", async ({ page }) => {
    await fresh(page);
    await openPanel(page);
    await page.getByRole("button", { name: "Koyu Mod" }).click();
    await page.getByRole("button", { name: /Metin Büyütme/ }).click();
    await page.reload();
    await page.waitForSelector(TRIG);
    // provider re-applies persisted settings after mount — wait for effects
    await expect
      .poll(async () => htmlClass(page, "a11y-dark-mode"))
      .toBe(true);
    await expect
      .poll(async () => htmlClass(page, "a11y-font-scaling"))
      .toBe(true);
  });

  test("createEarlyApplyScript yenilemeden önce durumu boyar (FOUC yok)", async ({ page }) => {
    // 1) persist dark mode like a user
    await fresh(page);
    await openPanel(page);
    await page.getByRole("button", { name: "Koyu Mod" }).click();

    // 2) build the snippet from the shipped build artifact
    const { createEarlyApplyScript } = await import("../dist/index.js");
    const snippet = createEarlyApplyScript() as string;
    expect(snippet.length).toBeGreaterThan(1000);

    // 3) fresh page: run the snippet IN THE BOOTSTRAP SLOT (before app scripts)
    const mpa = await page.context().newPage();
    await mpa.addInitScript((code: string) => {
      // emulate <head> inline injection: run as soon as <html>/<body> exist,
      // before the app bundle executes.
      const run = () => {
        if (!document.documentElement) return;
        new Function(code)();
        if (document.body) {
          (window as any).__earlyAppliedAt = document.readyState;
          (window as any).__earlyClasses = {
            html: document.documentElement.className,
            body: document.body.className,
            filter: document.body.style.getPropertyValue("--a11y-filter"),
          };
          return;
        }
        setTimeout(run, 0);
      };
      run();
    }, snippet);
    await mpa.goto("/");
    await mpa.waitForSelector(TRIG_ANY);

    // the snippet applied the persisted state pre-framework
    const early = await mpa.evaluate(() => (window as any).__earlyClasses);
    expect(early.html).toContain("a11y-dark-mode");
    expect(early.filter).toContain("invert(1)");
    // and the framework replay keeps the same state
    expect(await htmlClass(mpa, "a11y-dark-mode")).toBe(true);
    await mpa.close();
  });

  test("sayfa yapısı overlay'i atlama yolları sunar", async ({ page }) => {
    await fresh(page);
    await openPanel(page);
    await page.getByRole("button", { name: "Sayfa Yapısı" }).click();
    await expect(page.getByRole("dialog", { name: "Sayfa Yapısı" })).toBeVisible();
    const btn = page.getByRole("button", { name: /Akademik Takvim/ });
    await expect(btn).toBeVisible();
    await btn.click();
    await page.waitForFunction(() => {
      const h = Array.from(document.querySelectorAll("h2")).find((el) =>
        el.textContent?.includes("Akademik Takvim"),
      );
      if (!h) return false;
      const rect = h.getBoundingClientRect();
      return rect.top <= window.innerHeight;
    });
  });

  test("panel büyütme gerçek ölçek artışı üretir", async ({ page }) => {
    await fresh(page);
    await openPanel(page);
    const heightOf = () =>
      page.locator(".a11y-tool-button").first().evaluate((el) => el.getBoundingClientRect().height);
    const before = await heightOf();
    await page.locator(".a11y-panel-enlarged-switch, [role='switch']").first().click();
    const after = await heightOf();
    expect(after).toBeGreaterThan(before * 1.15);
  });

  test("dil TR ↔ EN arasında değişir ve kalıcıdır", async ({ page }) => {
    await fresh(page);
    await openPanel(page);
    await page.getByRole("button", { name: "Dil değiştir" }).click();
    await expect(
      page.getByRole("heading", { name: "Accessibility Options" }),
    ).toBeVisible();
    await page.reload();
    // trigger label switched to English — select it language-agnostically
    await page.waitForSelector(TRIG_ANY);
    expect(await page.getAttribute(TRIG_ANY, "aria-label")).toBe("Accessibility settings");
    await page.click(TRIG_ANY);
    await expect(page.locator(PANEL)).toHaveAttribute("aria-hidden", "false");
    await expect(
      page.getByRole("heading", { name: "Accessibility Options" }),
    ).toBeVisible();
  });
});
