# @company/accessibility-widget

React uygulamaları için modern, hafif ve gömülebilir bir erişilebilirlik widget’ı. Performans ve kullanılabilirlikten ödün vermeden web sitelerinin erişilebilirliğini artırır, WCAG 2.2 AA bilinçli olarak geliştirilmiştir.

- **React 18+ · TypeScript · Vite** (kütüphane modu)
- **TailwindCSS** (`a11y-` önekli, `!important`, preflight yok — ana site stilleriyle çakışmaz)
- **shadcn/ui · lucide-react · Context API · localStorage** kalıcılığı
- **SSR uyumlu** (Next.js dahil)
- **OpenDyslexic** fontu pakete gömülü — harici CDN yok, KVKK/GDPR uyumlu

## Özellikler

- **Metin büyütme** yalnızca büyütme: `%100 → %125 → %150 → %200 → %100` (`--a11y-font-scale`) — ilk tıklamada 1 kırmızı nokta
- **Sesli okuma (TTS)** 3 mod: üzerine gelince / seçili metni oku / sürekli oku — klavye `focus` + dokunmatik `touchstart` destekli, `tr-TR` / `en-US` ses seçimi
- **Sesi sustur** — sayfadaki `audio`/`video` elemanlarını susturur
- **Kontrast modları:** Koyu / Açık / Yüksek Kontrast / Sıcak / Soğuk (`filter` kompozisyonu)
- **Koyu mod** ve **Mavi ışık filtresi**
- **Renk körlüğü filtreleri:** Protanopi, Deuteranopi, Tritanopi, Akromatopsi (SVG `feColorMatrix`)
- **Gri tonlama** yoğunluk göstergeli (0–100%)
- **Okuma araçları:** Harf aralığı + Kelime aralığı (`WCAG 1.4.12`), Satır yüksekliği + Paragraf aralığı, Okuma çizgisi, Sarı şerit (Ege “Sarı Şerit” paritesi, `mix-blend-mode`), Okuma maskesi (spotlight) — tümü `pointermove` + `touchmove` takipli
- **Görsel destek:** Link vurgulama, Düz alt çizgi (Ege “Altını Çiz”), Başlık vurgulama, Görsel gizle, Animasyon durdur (`WeakSet` ile oynayan medyayı duraklat), Büyük imleç (48px SVG), Metin hizalama, Disleksi dostu font
- **Sayfa yapısı** overlay — `h1–h6` toplar, odak tuzağı ile hızlı gezinme
- **Paneli büyüt** modu (`--a11y-panel-em: 1.25`) — düşük görme için gerçek ölçek
- **Bypass (atla) linki** `Ana içeriğe atla` — WCAG 2.4.1, klavyede odaklanınca görünür
- **6 tek tık profil:** DEHB, Görme Desteği, Disleksi, Renk Körlüğü, Epilepsi, Yaşlılar
- **TR (varsayılan) / EN** dil desteği, anlık değişim ve kalıcılık, `document.documentElement.lang` senkron
- **Klavye kısayolu** varsayılan `ALT + A` (`aria-keyshortcuts` + rozet senkron), `enableShortcut` ile kapatılabilir
- Tercihler `localStorage`’da kalıcı, sekmeler arası senkron (`storage` event), FOUC yok (`createEarlyApplyScript`)

## Kurulum

```bash
npm install @company/accessibility-widget
```

Stil dosyasını bir kez içe aktarın:

```tsx
import "@company/accessibility-widget/style.css";
```

## Kullanım

```tsx
import {
  AccessibilityProvider,
  AccessibilityWidget,
} from "@company/accessibility-widget";

export default function App() {
  return (
    <AccessibilityProvider>
      <AccessibilityWidget
        position="bottom-right"
        branding={{ name: "Boğaziçi Üniversitesi", url: "https://bogazici.edu.tr" }}
      />
    </AccessibilityProvider>
  );
}
```

### Provider seçenekleri

| Prop | Tip | Varsayılan | Açıklama |
|---|---|---|---|
| `defaultSettings` | `Partial<AccessibilitySettings>` | — | Kalıcı ayar yokken kullanılacak değerler |
| `storageKey` | `string` | `"@company/accessibility-widget:settings"` | localStorage anahtarı |

### Widget seçenekleri

| Prop | Tip | Varsayılan | Açıklama |
|---|---|---|---|
| `accentColor` | `string` (hex) | `"#1e3e7a"` | Tetikleyici + panel başlık rengi |
| `secondaryColor` | `string` (hex) | `"#bf141e"` | Nokta / aktif vurgu rengi |
| `position` | `"bottom-right" \| "bottom-left"` | `"bottom-right"` | Kayan buton konumu |
| `language` | `"tr" \| "en"` | `"tr"` | Başlangıç dili (kalıcı) |
| `labels` | `Partial<AccessibilityWidgetLabels>` | Türkçe | Özel metinler (`language` üzerine yazılır) |
| `branding` | `{name:string; url?:string}` | — | Sıfırla çubuğu altında gösterilen marka |
| `enableShortcut` | `boolean` | `true` | Klavye kısayolunu etkinleştir |
| `shortcut` | `string` | `"Alt+A"` | `+` ile ayrılmış kısayol, örn. `"Ctrl+Shift+S"` — geçersiz değer `Alt+A`’ya düşer |
| `openParam` | `string \| null` | `"a11y"` | URL parametresi (`?a11y=open\|close\|toggle`), `null` ile kapat |

## Entegrasyon

### Footer linki ile açma

```tsx
<a
  href="#erasilebilirlik"
  onClick={(e) => {
    e.preventDefault();
    window.accessibilityWidget?.open();
  }}
>
  Erişilebilirlik
</a>
```

Genel API: `window.accessibilityWidget.open()` / `.close()` / `.toggle()`.

### URL parametresi

```
https://ornek.com/?a11y=open    # paneli aç
https://ornek.com/?a11y=close   # paneli kapat
https://ornek.com/?a11y=toggle  # paneli aç/kapat
```

### Özel kısayol

```tsx
<AccessibilityWidget shortcut="Ctrl+Shift+S" />
```

Belirteçler: `Alt`, `Ctrl`/`Control`, `Shift`, `Meta`/`Cmd` + son tuş `A-Z` veya `0-9`.

### İlk boyamada ayarları uygula (SSR/MPA FOUC önleme)

Kalıcı ayarlar hidratasyondan sonra geri yüklenir. İlk boyamada uygulamak için `<head>` içine erken betik ekleyin:

```tsx
import { createEarlyApplyScript } from "@company/accessibility-widget";

// Next.js App Router / herhangi bir MPA <head>:
<script dangerouslySetInnerHTML={{ __html: createEarlyApplyScript() }} />
```

Özel anahtar kullanıyorsanız: `createEarlyApplyScript({ storageKey: "my-key", languageKey: "my-lang" })`.

## Geliştirme

```bash
npm install
npm run dev        # demo uygulaması (Vite)
npm test           # vitest birim testleri (65 test)
npm run typecheck  # tsc --noEmit
npm run build      # dist/ (ESM + CJS + .d.ts + style.css) oluşturur
```

Coverage:

```bash
npm test -- --coverage  # v8 provider, text/lcov/html
```

## Proje yapısı

```
src/
  context/        AccessibilityProvider, ayar tipleri, storage, DOM etkileri, early-apply
  components/     Widget, panel, araç ızgarası, profiller, okuma araçları, skip-link, sesli okuma, sayfa yapısı, ui/
  hooks/          useFocusTrap, useMediaQuery
  styles/         Tailwind + ana sayfa etki CSS’i (a11y-* sınıfları)
demo/             Vite demo uygulaması (Boğaziçi tarzı örnek sayfa)
e2e/              Playwright kabul testleri
```

## Nasıl çalışır

Provider ayarları `localStorage`’da tutar, `<html>` / `<body>` üzerine `a11y-*` sınıfları ve CSS değişkenleri (`--a11y-font-scale`, `--a11y-letter-spacing`, `--a11y-word-spacing`, `--a11y-line-height`, `--a11y-paragraph-spacing`, `--a11y-filter`) olarak uygular. Tüm ana sayfa etkileri paketlenmiş stil dosyasında tanımlıdır, ek CSS gerekmez. Widget arayüzü `a11y-` önekli ve `!important` Tailwind yardımcılarıyla bir portal üzerinden render edilir, ana site stillerinden izole kalır ve filtrelerden etkilenmez (`body` filtresi, widget `outside <body>`).

## Erişilebilirlik notları

- **2.4.1 Bypass:** `Ana içeriğe atla` skip-link’i `body` başına enjekte edilir
- **1.4.12 Metin aralığı:** harf/kelime/satır/paragraf dördü de ayarlanabilir
- **2.4.7 Odak görünürlüğü:** sarı `outline` (`#fbbf24`), odak tuzağı `Tab` sarma, `inert` + `aria-hidden` filtresi
- **4.1.3 Durum mesajları:** `aria-live="polite" role="status" aria-atomic` ile profil/dil/sıfırla anonsu
- **2.5.8 Hedef boyutu:** profil bilgi butonu `24px` (AA)
