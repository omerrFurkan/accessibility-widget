# @company/accessibility-widget

A modern, lightweight, embeddable accessibility widget for React applications. Improves website accessibility while maintaining performance, usability and WCAG awareness.

- React 18+ · TypeScript · Vite (library mode)
- TailwindCSS (prefixed `a11y-`, `!important`, no preflight so it never clashes with the host site)
- shadcn/ui components · lucide-react icons · Context API · localStorage persistence
- SSR-safe (Next.js compatible)
- Inter font loaded from Google Fonts (weight 300 / 400 / 500 / 700 + 500 italic)

## Features

- Text zoom cycling 100 / 115 / 130 / 150% (`--a11y-font-scale`)
- Bidirectional text zoom %80–%200 — the scale shrinks below 100% as well as up
- Built-in voice reading (TTS): hover, selection and continuous read-aloud modes
- Mute sounds tool (silences audio/video elements on the page)
- Contrast modes: High Contrast / Inverted (plus grayscale as a separate intensity control)
- Dark mode (`.a11y-dark-mode`, invert strategy with media + widget compensation)
- Reading tools: letter spacing, line height, reading line, yellow marker strip (pointer-following tint band, Ege "Sarı Şerit" parity), reading mask
- Visual assist: link highlighting, plain link underlining (Ege "Altını Çiz" parity), heading highlighting, color blindness filters (protanopia, deuteranopia, tritanopia, achromatopsia), image hiding, animation pausing, large cursor, text alignment, blue-light filter
- Enlarged-panel mode with real scaling for low-vision users
- Bundled OpenDyslexic dyslexia font (self-hosted, no Google Fonts dependency)
- 5 one-click accessibility profiles (low vision, color blindness, dyslexia, cognitive, screen reader)
- Turkish (default) and English UI, toggleable at runtime and persisted
- Customizable keyboard shortcut (default `ALT + A`; disable via `enableShortcut`)
- Preferences persisted across sessions (localStorage), synced across tabs

## Installation

```bash
npm install @company/accessibility-widget
```

Import the stylesheet once:

```tsx
import "@company/accessibility-widget/style.css";
```

## Usage

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
        branding="Boğaziçi Üniversitesi"
      />
    </AccessibilityProvider>
  );
}
```

### Provider options

| Prop            | Type                          | Default | Description                              |
| --------------- | ----------------------------- | ------- | ---------------------------------------- |
| `defaultSettings` | `Partial<AccessibilitySettings>` | —     | Settings used when nothing is persisted  |
| `storageKey`    | `string`                      | `"@company/accessibility-widget:settings"` | localStorage key |

### Widget options

| Prop            | Type                  | Default      | Description                          |
| --------------- | --------------------- | ------------ | ------------------------------------ |
| `accentColor`   | `string` (hex)        | `"#1e3e7a"`  | Trigger button + panel header color  |
| `secondaryColor`| `string` (hex)        | `"#bf141e"`  | Accent highlights (reset bar, badges) |
| `position`      | `"bottom-right" \| "bottom-left"` | `"bottom-right"` | Floating button position |
| `language`      | `"tr" \| "en"`        | `"tr"`       | Initial UI language (persisted across sessions) |
| `labels`        | `Partial<AccessibilityWidgetLabels>` | Turkish defaults | Custom UI copy (overrides `language`) |
| `branding`      | `string \| undefined` | —            | Footer text shown under the reset bar |
| `enableShortcut`| `boolean`             | `true`       | Enable keyboard shortcut toggle (see `shortcut`) |
| `shortcut`      | `string`              | `"Alt+A"`    | Shortcut as "+"-separated tokens (e.g. `"Ctrl+Shift+S"`); invalid values fall back to `"Alt+A"` |
| `openParam`     | `string \| null`      | `"a11y"`     | URL query parameter controlling the panel on load (`?a11y=open\|close\|toggle`); pass `null` to disable |

## Integration

### Footer link

Open the widget from any host-page element, e.g. an "Erişilebilirlik" footer link:

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

The global API also exposes `window.accessibilityWidget.close()` and `.toggle()`.

### URL parameter

Use the `openParam` query parameter (default `a11y`) to control the panel on page load:

```
https://example.com/?a11y=open    # opens the panel
https://example.com/?a11y=close   # closes the panel
https://example.com/?a11y=toggle  # toggles the panel
```

Any other value is ignored; rename the parameter or disable it with the `openParam` prop.

### Custom shortcut

```tsx
<AccessibilityWidget shortcut="Ctrl+Shift+S" />
```

Modifiers: `Alt`, `Ctrl`, `Shift`, `Meta`/`Cmd`; the final token must be a letter A–Z or digit 0–9. Invalid strings silently fall back to `Alt+A`.

### Avoid flash of unstyled settings (SSR/MPA)

Persisted settings are normally restored after hydration. Include the early-apply script in your `<head>` to replay persisted localStorage settings before first paint:

```tsx
import { createEarlyApplyScript } from "@company/accessibility-widget";

// Next.js App Router / any MPA <head>:
<script dangerouslySetInnerHTML={{ __html: createEarlyApplyScript() }} />
```

## Development

```bash
npm install
npm run dev        # demo app (Vite playground)
npm test           # vitest unit tests
npm run typecheck  # tsc --noEmit
npm run build      # builds dist/ (ESM + CJS + .d.ts + style.css)
```

## Project layout

```
src/
  context/        AccessibilityProvider, settings types, storage, DOM effects
  components/     Widget, panel, tools grid, profiles, reading mask, page-structure overlay, ui/ (shadcn)
  hooks/          useFocusTrap
  styles/         Tailwind + host-page effect CSS
demo/             Vite playground app (Boğaziçi-style sample page)
```

## How it works

The provider persists settings to `localStorage` and applies them to the document root (`<html>` / `<body>`) as `a11y-*` classes and CSS variables (`--a11y-font-scale`, `--a11y-letter-spacing`, `--a11y-line-height`). All host-page effects are defined in the shipped stylesheet, so no extra CSS is required from consumers. The widget UI renders through a portal with prefixed + `!important` Tailwind utilities, keeping it isolated from host site styles.

## License

MIT
