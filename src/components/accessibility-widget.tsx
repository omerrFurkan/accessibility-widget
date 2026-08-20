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
import { ReadingMask } from "./reading-mask";
import { ColorBlindnessFilters } from "./color-blindness-filters";
import { PageStructureOverlay } from "./page-structure-overlay";
import { labelsForLanguage } from "./labels";
import type { AccessibilityWidgetLabels, WidgetLanguage } from "./labels";
import { cn } from "@/lib/utils";

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
  /** Enable the Alt+A open/close shortcut. Defaults to true. */
  enableShortcut?: boolean;
}

const WIDGET_CONTAINER_ID = "a11y-widget-container";

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
}: AccessibilityWidgetProps) {
  const { settings, isPanelOpen, closePanel, togglePanel } = useAccessibility();
  const [language, setLanguage] = useState<WidgetLanguage>(() =>
    loadLanguage(DEFAULT_LANGUAGE_KEY, initialLanguage ?? "tr"),
  );
  const [enlarged, setEnlarged] = useState(false);
  const [pageStructureOpen, setPageStructureOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    saveLanguage(DEFAULT_LANGUAGE_KEY, language);
  }, [language]);

  const labels = useMemo<AccessibilityWidgetLabels>(
    () => ({ ...labelsForLanguage(language), ...customLabels }),
    [language, customLabels],
  );

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

  useEffect(() => {
    if (!enableShortcut) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.altKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.shiftKey &&
        event.code === "KeyA"
      ) {
        event.preventDefault();
        togglePanel();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enableShortcut, togglePanel]);

  const host = typeof document !== "undefined" ? ensureWidgetContainer() : null;
  if (!host) return null;

  const widgetFilter = composeFilter(settings);
  const widgetFiltered = widgetFilter !== FILTER_NONE;

  return createPortal(
    <>
      <ColorBlindnessFilters />
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
      <ReadingMask active={settings.readingMask} />
      <div
        className="a11y-pointer-events-auto"
        {...(pageStructureOpen
          ? ({ inert: "" } as HTMLAttributes<HTMLDivElement>)
          : {})}
      >
        <AccessibilityTrigger label={labels.triggerLabel} />
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
      <span className="a11y-sr-only" aria-live="polite">
        {isPanelOpen ? labels.panelTitle : ""}
      </span>
      <span className="a11y-sr-only" aria-live="polite" data-a11y-announce="">
        {announcement}
      </span>
      </div>
    </>,
    host,
  );
}
