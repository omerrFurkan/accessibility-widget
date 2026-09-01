import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { Languages, Minimize2, Maximize2, RotateCcw, X } from "lucide-react";
import { useAccessibility } from "@/context/accessibility-context";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { AccessibilityWidgetLabels, WidgetLanguage } from "./labels";
import { ProfilesSection } from "./profiles-section";
import { ToolsGrid } from "./tools-grid";
import { Switch } from "./ui/switch";
import { cn } from "@/lib/utils";

export interface AccessibilityPanelProps {
  labels: AccessibilityWidgetLabels;
  language: WidgetLanguage;
  onToggleLanguage: () => void;
  onAnnounce: (message: string) => void;
  branding?: { name: string; url?: string };
  enlarged: boolean;
  onToggleEnlarged: () => void;
  pageStructureOpen: boolean;
  onOpenPageStructure: () => void;
  /** Hide the panel from assistive tech + interaction (e.g. while a modal overlay is open). */
  inert?: boolean;
  shortcutHint?: string;
}

export function AccessibilityPanel({
  labels,
  language,
  onToggleLanguage,
  onAnnounce,
  branding,
  enlarged,
  onToggleEnlarged,
  pageStructureOpen,
  onOpenPageStructure,
  inert = false,
  shortcutHint,
}: AccessibilityPanelProps) {
  const { isPanelOpen, closePanel, reset } = useAccessibility();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [profilesOpen, setProfilesOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 640px)");

  useFocusTrap(panelRef, isPanelOpen);

  // Close when clicking outside the widget (no page dimming backdrop).
  useEffect(() => {
    if (!isPanelOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const root = panelRef.current?.closest("[data-a11y-widget]");
      if (root && root.contains(event.target as Node)) return;
      closePanel();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isPanelOpen, closePanel]);

  const onKeyDown = (event: ReactKeyboardEvent) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      closePanel();
    }
  };

  return (
    <div
      ref={panelRef}
      id="a11y-widget-panel"
      role="dialog"
      lang={language}
      aria-modal="true"
      aria-label={labels.panelTitle}
      aria-hidden={!isPanelOpen}
      {...((!isPanelOpen || inert) ? ({ inert: "" } as React.HTMLAttributes<HTMLDivElement>) : {})}
      onKeyDown={onKeyDown}
      className={cn(
        "a11y-widget-panel",
        "a11y-fixed a11y-top-0 a11y-bottom-0 a11y-right-0 a11y-z-[var(--a11y-widget-z)]",
        "a11y-flex a11y-flex-col a11y-bg-[var(--a11y-widget-bg)] a11y-text-[var(--a11y-widget-text)]",
        "a11y-border-l a11y-border-[var(--a11y-widget-border)] a11y-shadow-2xl a11y-shadow-black/20",
        "a11y-transition-transform a11y-duration-300 a11y-ease-in-out",
        isMobile && "a11y-panel-mobile",
        isPanelOpen ? "a11y-translate-x-0" : "a11y-translate-x-full",
      )}
    >
      <header className="a11y-panel-header a11y-sticky a11y-top-0 a11y-z-10 a11y-flex a11y-shrink-0 a11y-items-center a11y-justify-between a11y-gap-3 a11y-px-5 a11y-py-4">
        <div className="a11y-min-w-0">
          <div className="a11y-flex a11y-items-center a11y-gap-2">
            <h2 className="a11y-truncate a11y-text-base a11y-font-bold a11y-text-[var(--a11y-widget-accent-foreground)]">
              {labels.panelTitle}
            </h2>
            <span className="a11y-shortcut-badge" title={labels.languageToggleLabel}>
              <kbd>( {shortcutHint ?? labels.shortcutHint} )</kbd>
            </span>
          </div>
          <p className="a11y-mt-0.5 a11y-text-xs a11y-text-[var(--a11y-widget-accent-foreground)]">
            {labels.panelSubtitle}
          </p>
        </div>
        <div className="a11y-flex a11y-shrink-0 a11y-items-center a11y-gap-2">
          <button
            type="button"
            onClick={onToggleLanguage}
            aria-label={labels.languageToggleLabel}
            className="a11y-header-lang a11y-inline-flex a11y-h-9 a11y-items-center a11y-gap-1.5 a11y-rounded-full a11y-px-3 a11y-text-xs a11y-font-bold a11y-text-white"
          >
            <Languages className="a11y-size-4" aria-hidden="true" />
            {labels.languageShort}
          </button>
          <button
            type="button"
            onClick={closePanel}
            aria-label={labels.closePanel}
            className="a11y-header-close a11y-inline-flex a11y-size-9 a11y-items-center a11y-justify-center a11y-rounded-full a11y-text-white"
          >
            <X className="a11y-size-5" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="a11y-panel-scroll a11y-flex-1 a11y-overflow-y-auto a11y-px-4 a11y-py-4">
        <div className="a11y-panel-anim a11y-flex a11y-flex-col a11y-gap-4">
          <ProfilesSection
            labels={labels}
            open={profilesOpen}
            onToggle={() => setProfilesOpen((open) => !open)}
          />

          <div className="a11y-flex a11y-items-center a11y-justify-between a11y-gap-3 a11y-rounded-xl a11y-border a11y-border-[var(--a11y-widget-border)] a11y-bg-[var(--a11y-widget-muted)]/60 a11y-px-4 a11y-py-3">
            <span className="a11y-flex a11y-items-center a11y-gap-2.5">
              {enlarged ? (
                <Minimize2
                  className="a11y-size-4 a11y-text-[var(--a11y-widget-accent)]"
                  aria-hidden="true"
                />
              ) : (
                <Maximize2
                  className="a11y-size-4 a11y-text-[var(--a11y-widget-accent)]"
                  aria-hidden="true"
                />
              )}
              <span className="a11y-text-sm a11y-font-medium">
                {enlarged ? labels.shrinkPanel : labels.enlargePanel}
              </span>
            </span>
            <Switch
              checked={enlarged}
              onCheckedChange={onToggleEnlarged}
              aria-label={enlarged ? labels.shrinkPanel : labels.enlargePanel}
            />
          </div>

          <ToolsGrid
            labels={labels}
            pageStructureOpen={pageStructureOpen}
            onOpenPageStructure={onOpenPageStructure}
            onAnnounce={onAnnounce}
          />
        </div>
      </div>

      <div className="a11y-shrink-0 a11y-px-4 a11y-pb-4 a11y-pt-1">
        <button
          type="button"
          onClick={() => {
            reset();
            onAnnounce(labels.announceSettingsReset);
          }}
          aria-label={labels.resetAll}
          className="a11y-reset-button a11y-inline-flex a11y-h-12 a11y-w-full a11y-items-center a11y-justify-center a11y-gap-2 a11y-rounded-xl a11y-text-sm a11y-font-bold a11y-text-white a11y-transition-colors hover:a11y-shadow-lg"
        >
          <RotateCcw className="a11y-size-4" aria-hidden="true" />
          {labels.resetAll}
        </button>
        {branding && (
          <p className="a11y-mt-2 a11y-text-center a11y-text-[11px] a11y-text-muted-foreground">
            {labels.footerCopyright}{" "}
            {branding.url ? (
              <a
                href={branding.url}
                target="_blank"
                rel="noreferrer"
                className="a11y-font-semibold a11y-text-[var(--a11y-widget-accent)] hover:a11y-underline"
              >
                {branding.name}
              </a>
            ) : (
              branding.name
            )}
          </p>
        )}
      </div>
    </div>
  );
}
