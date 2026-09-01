import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, HTMLAttributes } from "react";
import { createPortal } from "react-dom";
import { useAccessibility } from "@/context/accessibility-context";
import { composeFilter, FILTER_NONE } from "@/context/dom-effects";
import { findProfile } from "@/context/profiles";
import { DEFAULT_LANGUAGE_KEY } from "@/context/types";
import { loadLanguage, saveLanguage } from "@/context/storage";
import { AccessibilityTrigger } from "./accessibility-trigger";
import { AccessibilityPanel } from "./accessibility-panel";
import { ReadingLine } from "./reading-line";
import { MarkerLine } from "./marker-line";
import { ReadingMask } from "./reading-mask";
import { ColorBlindnessFilters } from "./color-blindness-filters";
import { VoiceReadingController } from "./voice-reading";
import { PageStructureOverlay } from "./page-structure-overlay";
import { SkipLink } from "./skip-link";
import { labelsForLanguage } from "./labels";
import type { AccessibilityWidgetLabels, WidgetLanguage } from "./labels";
import { cn } from "@/lib/utils";

/**
 * Programmatic control surface exposed on `window.accessibilityWidget`
 * so host pages (e.g. footer links) can drive the widget.
 */
export interface AccessibilityWidgetGlobalApi {
  /** Opens the accessibility panel. */
  open: () => void;
  /** Closes the accessibility panel. */
  close: () => void;
  /** Toggles the accessibility panel. */
  toggle: () => void;
}

declare global {
  interface Window {
    accessibilityWidget?: AccessibilityWidgetGlobalApi;
  }
}

export interface AccessibilityWidgetProps {
  /** Primary brand color (header, trigger, active states). Default #1e3e7a. */
  accentColor?: string;
  /** Secondary brand color (indicator dots, active accents). Default #bf141e. */
  secondaryColor?: string;
  /** Trigger position. Defaults to "bottom-right". */
  position?: "bottom-right" | "bottom-left";
  /** Initial UI language; the user can toggle it from the panel header. */
  language?: WidgetLanguage;
  /** Custom labels merged over the current language dictionary. */
  labels?: Partial<AccessibilityWidgetLabels>;
  /** Optional brand line shown in the panel footer. */
  branding?: { name: string; url?: string };
  /** Enable the keyboard shortcut (see `shortcut`). Defaults to true. */
  enableShortcut?: boolean;
  /** Keyboard shortcut as "+"-separated tokens, e.g. "Ctrl+Shift+S". Modifiers: Alt, Ctrl, Control, Shift, Meta, Cmd; final key A–Z or 0–9. Invalid values fall back to "Alt+A" silently. Default "Alt+A". */
  shortcut?: string;
  /** URL query parameter controlling the panel on load (`?a11y=open|close|toggle`); other values are ignored. Pass `null` to disable. Default "a11y". */
  openParam?: string | null;
}

const WIDGET_CONTAINER_ID = "a11y-widget-container";

const DEFAULT_SHORTCUT = "Alt+A";

interface ParsedShortcut {
  alt: boolean;
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
  code: string;
}

/**
 * Parses "+"-separated shortcut tokens (case-insensitive): modifiers
 * Alt|Ctrl|Control|Shift|Meta|Cmd followed by a final key A–Z (Key<letter>)
 * or 0–9 (Digit<digit>). Returns null for anything invalid.
 */
function parseShortcut(shortcut: string): ParsedShortcut | null {
  const tokens = shortcut
    .split("+")
    .map((token) => token.trim().toLowerCase())
    .filter((token) => token.length > 0);
  if (tokens.length === 0) return null;
  const parsed: ParsedShortcut = {
    alt: false,
    ctrl: false,
    meta: false,
    shift: false,
    code: "",
  };
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    const isLast = i === tokens.length - 1;
    if (!isLast) {
      switch (token) {
        case "alt":
          parsed.alt = true;
          break;
        case "ctrl":
        case "control":
          parsed.ctrl = true;
          break;
        case "shift":
          parsed.shift = true;
          break;
        case "meta":
        case "cmd":
          parsed.meta = true;
          break;
        default:
          return null;
      }
      continue;
    }
    if (/^[a-z]$/.test(token)) {
      parsed.code = `Key${token.toUpperCase()}`;
    } else if (/^[0-9]$/.test(token)) {
      parsed.code = `Digit${token}`;
    } else {
      return null;
    }
  }
  return parsed.code ? parsed : null;
}

function ensureWidgetContainer(): HTMLElement {
  const existing = document.getElementById(WIDGET_CONTAINER_ID);
  if (existing) return existing;
  const el = document.createElement("div");
  el.id = WIDGET_CONTAINER_ID;
  el.className = "a11y-widget-container";
  document.documentElement.appendChild(el);
  return el;
}

export function AccessibilityWidget({
  accentColor = "#1e3e7a",
  secondaryColor = "#bf141e",
  position = "bottom-right",
  language: initialLanguage,
  labels: customLabels,
  branding,
  enableShortcut = true,
  shortcut = "Alt+A",
  openParam = "a11y",
}: AccessibilityWidgetProps) {
  const { settings, isPanelOpen, openPanel, closePanel, togglePanel } =
    useAccessibility();
  const [language, setLanguage] = useState<WidgetLanguage>(() =>
    loadLanguage(DEFAULT_LANGUAGE_KEY, initialLanguage ?? "tr"),
  );
  const [enlarged, setEnlarged] = useState(false);
  const [pageStructureOpen, setPageStructureOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    saveLanguage(DEFAULT_LANGUAGE_KEY, language);
    // Keep documentElement lang in sync for screen readers outside widget
    try {
      if (typeof document !== "undefined" && document.documentElement) {
        document.documentElement.setAttribute("lang", language);
      }
    } catch {}
  }, [language]);

  const labels = useMemo<AccessibilityWidgetLabels>(
    () => ({ ...labelsForLanguage(language), ...customLabels }),
    [language, customLabels],
  );

  // Expose a programmatic API for host pages. If multiple widget instances
  // are mounted, last-mounted wins.
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.accessibilityWidget = {
      open: openPanel,
      close: closePanel,
      toggle: togglePanel,
    };
    return () => {
      delete window.accessibilityWidget;
    };
  }, [openPanel, closePanel, togglePanel]);

  // Deep link: apply ?<openParam>=open|close|toggle once on mount. Other
  // values are ignored; no history manipulation is performed.
  useEffect(() => {
    if (!openParam || typeof window === "undefined") return;
    const action = new URLSearchParams(window.location.search).get(openParam);
    if (action === "open") openPanel();
    else if (action === "close") closePanel();
    else if (action === "toggle") togglePanel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard shortcut. Modifier booleans must match exactly, so a shortcut
  // without Ctrl will not fire while Ctrl is held.
  useEffect(() => {
    if (!enableShortcut) return;
    // Invalid shortcut strings fall back silently to Alt+A behavior.
    const parsed = parseShortcut(shortcut) ?? parseShortcut(DEFAULT_SHORTCUT)!;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (
        event.code !== parsed.code ||
        event.altKey !== parsed.alt ||
        event.ctrlKey !== parsed.ctrl ||
        event.metaKey !== parsed.meta ||
        event.shiftKey !== parsed.shift
      ) {
        return;
      }
      event.preventDefault();
      togglePanel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enableShortcut, shortcut, togglePanel]);

  // Announce applied/removed profiles; bring the user back to the top of the
  // page only when a profile is applied so they can see its effect.
  const previousProfileId = useRef(settings.activeProfileId);
  useEffect(() => {
    const previous = previousProfileId.current;
    if (previous === settings.activeProfileId) return;
    if (settings.activeProfileId) {
      const profile = findProfile(settings.activeProfileId);
      if (profile) {
        setAnnouncement(
          `${labels[profile.nameKey as keyof AccessibilityWidgetLabels]} ${
            labels.announceProfileApplied
          }`,
        );
        if (typeof window.scrollTo === "function") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    } else if (previous) {
      const profile = findProfile(previous);
      if (profile) {
        setAnnouncement(
          `${labels[profile.nameKey as keyof AccessibilityWidgetLabels]} ${
            labels.announceProfileRemoved
          }`,
        );
      }
    }
    previousProfileId.current = settings.activeProfileId;
  }, [settings.activeProfileId, labels]);

  const host = typeof document !== "undefined" ? ensureWidgetContainer() : null;
  if (!host) return null;

  const widgetFilter = composeFilter(settings);
  const widgetFiltered = widgetFilter !== FILTER_NONE;

  return createPortal(
    <>
      <SkipLink labels={labels} />
      <ColorBlindnessFilters />
      <VoiceReadingController labels={labels} language={language} />
      <div
        className={cn(
          "a11y-widget-root",
          "a11y-fixed a11y-inset-0 a11y-pointer-events-none a11y-z-[var(--a11y-widget-z)]",
          "a11y-font-sans a11y-antialiased a11y-text-sm",
          position === "bottom-left" && "a11y-trigger--left",
          enlarged && "a11y-panel-enlarged",
          widgetFiltered && "a11y-widget-filtered",
        )}
        lang={language}
        style={
          {
            "--a11y-widget-accent": accentColor,
            "--a11y-widget-accent-2": secondaryColor,
            "--a11y-widget-filter": widgetFilter,
          } as CSSProperties
        }
        data-a11y-widget=""
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            closePanel();
          }
        }}
      >
        <ReadingLine active={settings.readingLine} />
        <MarkerLine active={settings.markerLine} />
      <ReadingMask active={settings.readingMask} />
      <div
        className="a11y-pointer-events-auto"
        {...(pageStructureOpen
          ? ({ inert: "" } as HTMLAttributes<HTMLDivElement>)
          : {})}
      >
        <AccessibilityTrigger label={labels.triggerLabel} shortcutHint={shortcut} />
      </div>
      <div
        className="a11y-pointer-events-auto"
        {...(pageStructureOpen
          ? ({ inert: "" } as HTMLAttributes<HTMLDivElement>)
          : {})}
      >
        <AccessibilityPanel
          labels={labels}
          language={language}
          onToggleLanguage={() => {
            setLanguage((current) => (current === "tr" ? "en" : "tr"));
            setAnnouncement(labels.announceLanguageChanged);
          }}
          onAnnounce={setAnnouncement}
          branding={branding}
          enlarged={enlarged}
          onToggleEnlarged={() => setEnlarged((value) => !value)}
          pageStructureOpen={pageStructureOpen}
          onOpenPageStructure={() => setPageStructureOpen(true)}
          inert={pageStructureOpen}
          shortcutHint={shortcut
            .split("+")
            .map((s) => s.trim().toUpperCase())
            .join(" + ")}
        />
      </div>
      <div className="a11y-pointer-events-auto">
        <PageStructureOverlay
          labels={labels}
          language={language}
          open={pageStructureOpen}
          onClose={() => setPageStructureOpen(false)}
        />
      </div>
      <span className="a11y-sr-only" aria-live="polite" role="status" aria-atomic="true">
        {isPanelOpen ? labels.panelTitle : ""}
      </span>
      <span className="a11y-sr-only" aria-live="polite" role="status" aria-atomic="true" data-a11y-announce="">
        {announcement}
      </span>
      </div>
    </>,
    host,
  );
}
