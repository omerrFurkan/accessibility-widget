import { useEffect, useRef, useState } from "react";
import type { HTMLAttributes } from "react";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronDown,
  Info,
  Languages,
  RotateCcw,
  Users,
  X,
} from "lucide-react";
import { useAccessibility } from "@/context/accessibility-context";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { ACCESSIBILITY_PROFILES } from "@/context/profiles";
import { PROFILE_ICONS } from "./profiles-section";
import type { AccessibilityWidgetLabels, WidgetLanguage } from "./labels";
import { useTools } from "./use-tools";
import { cn } from "@/lib/utils";

export interface MobileMenuProps {
  labels: AccessibilityWidgetLabels;
  language: WidgetLanguage;
  onToggleLanguage: () => void;
  onAnnounce: (message: string) => void;
  pageStructureOpen: boolean;
  onOpenPageStructure: () => void;
  /** Hide the menu from assistive tech + interaction (e.g. while a modal overlay is open). */
  inert?: boolean;
}

type MobileView = "profiles" | "tools";

/**
 * Two-view mobile menu (<=640px): a profiles card ("Erişilebilirlik Aracı")
 * and an icon rail with every tool. The navy bar's back arrow returns
 * from the rail to the profiles view.
 */
export function MobileMenu({
  labels,
  language,
  onToggleLanguage,
  onAnnounce,
  pageStructureOpen,
  onOpenPageStructure,
  inert = false,
}: MobileMenuProps) {
  const { settings, applyProfile, reset, isPanelOpen, closePanel } = useAccessibility();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [view, setView] = useState<MobileView>("profiles");
  const [profilesOpen, setProfilesOpen] = useState(true);
  const [toolsOpen, setToolsOpen] = useState(true);
  const [detailsFor, setDetailsFor] = useState<string | null>(null);
  const tools = useTools({ labels, pageStructureOpen, onOpenPageStructure, onAnnounce });

  useFocusTrap(menuRef, isPanelOpen);

  // Close when tapping outside the menu (mirrors the desktop panel).
  useEffect(() => {
    if (!isPanelOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const root = menuRef.current?.closest("[data-a11y-widget]");
      if (root && root.contains(event.target as Node)) return;
      closePanel();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isPanelOpen, closePanel]);

  // Keep focus inside the new view when switching (the old trigger unmounts).
  useEffect(() => {
    if (!isPanelOpen) return;
    menuRef.current?.querySelector<HTMLElement>("button")?.focus();
  }, [view, isPanelOpen]);

  const goTools = () => {
    setView("tools");
    onAnnounce(labels.mobileTools);
  };
  const goProfiles = () => {
    setView("profiles");
    onAnnounce(labels.backToProfiles);
  };
  const onReset = () => {
    reset();
    onAnnounce(labels.announceSettingsReset);
  };

  return (
    <div
      ref={menuRef}
      id="a11y-widget-panel"
      role="dialog"
      lang={language}
      aria-modal="true"
      aria-label={labels.mobileTitle}
      aria-hidden={!isPanelOpen}
      {...((!isPanelOpen || inert) ? ({ inert: "" } as HTMLAttributes<HTMLDivElement>) : {})}
      className={cn(
        "a11y-mobile-menu",
        isPanelOpen ? "a11y-mobile-open" : "a11y-mobile-closed",
      )}
    >
      {view === "profiles" ? (
        <div className="a11y-mobile-main">
          <header className="a11y-mobile-header">
            <span className="a11y-mobile-title" aria-label={labels.mobileTitle}>
              {labels.mobileTitle.split(" ").map((word, i) => (
                <span key={i} className="a11y-mobile-title-line">
                  {word}
                </span>
              ))}
            </span>
            <span className="a11y-mobile-header-actions">
              <button type="button" onClick={goTools} aria-label={labels.mobileTools}>
                <BookOpen aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onToggleLanguage}
                aria-label={labels.languageToggleLabel}
              >
                <Languages aria-hidden="true" />
                {labels.languageShort}
              </button>
              <button type="button" onClick={closePanel} aria-label={labels.closePanel}>
                <X aria-hidden="true" />
              </button>
            </span>
          </header>

          <div className="a11y-mobile-scroll">
            <section className="a11y-mobile-card" aria-label={labels.profilesLabel}>
              <button
                type="button"
                className="a11y-mobile-card-head"
                onClick={() => setProfilesOpen((open) => !open)}
                aria-expanded={profilesOpen}
              >
                <span>{labels.profilesLabel}</span>
                <ChevronDown
                  className={cn(profilesOpen && "a11y-rotate-180")}
                  aria-hidden="true"
                />
              </button>

              {profilesOpen && (
                <ul className="a11y-mobile-profiles">
                  {ACCESSIBILITY_PROFILES.map((profile) => {
                    const ProfileIcon = PROFILE_ICONS[profile.id] ?? Users;
                    const isActive = settings.activeProfileId === profile.id;
                    const detailsOpen = detailsFor === profile.id;
                    return (
                      <li
                        key={profile.id}
                        className={cn(isActive && "a11y-mobile-profile-active")}
                      >
                        <div className="a11y-mobile-profile-row">
                          <button
                            type="button"
                            onClick={() => applyProfile(profile.id)}
                            aria-pressed={isActive}
                            aria-label={
                              labels[profile.nameKey as keyof AccessibilityWidgetLabels]
                            }
                          >
                            <ProfileIcon aria-hidden="true" />
                            <span>
                              {labels[profile.nameKey as keyof AccessibilityWidgetLabels]}
                            </span>
                            {isActive && <Check aria-hidden="true" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDetailsFor(detailsOpen ? null : profile.id)}
                            aria-expanded={detailsOpen}
                            aria-controls={`a11y-mprofile-details-${profile.id}`}
                            aria-label={labels.profileInfoToggle}
                          >
                            <Info aria-hidden="true" />
                          </button>
                        </div>
                        {detailsOpen && (
                          <p id={`a11y-mprofile-details-${profile.id}`}>
                            {labels[profile.detailsKey as keyof AccessibilityWidgetLabels]}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section className="a11y-mobile-card" aria-label={labels.contentSettings}>
              <button
                type="button"
                className="a11y-mobile-card-head"
                onClick={() => setToolsOpen((open) => !open)}
                aria-expanded={toolsOpen}
              >
                <span>{labels.contentSettings}</span>
                <ChevronDown
                  className={cn(toolsOpen && "a11y-rotate-180")}
                  aria-hidden="true"
                />
              </button>

              {toolsOpen && (
                <ul className="a11y-mobile-profiles">
                  {tools.map((tool) => {
                    const Icon = tool.icon;
                    const dotCount = tool.dotCount ?? 0;
                    const onDots = Math.min(Math.max(0, tool.level ?? 0), dotCount);
                    return (
                      <li
                        key={tool.id}
                        className={cn(tool.active && "a11y-mobile-profile-active")}
                      >
                        <div className="a11y-mobile-profile-row">
                          <button
                            type="button"
                            onClick={tool.onClick}
                            aria-pressed={tool.active}
                            aria-label={tool.ariaLabel}
                            title={tool.ariaLabel}
                          >
                            <Icon aria-hidden="true" />
                            <span className="a11y-mobile-tool-text">
                              <span className="a11y-mobile-tool-name">{tool.ariaLabel}</span>
                              {dotCount > 0 && (
                                <span className="a11y-tool-dots" aria-hidden="true">
                                  {Array.from({ length: dotCount }, (_, index) => (
                                    <span
                                      key={index}
                                      className={cn(
                                        "a11y-tool-dot",
                                        index < onDots && "a11y-tool-dot-on",
                                      )}
                                    />
                                  ))}
                                </span>
                              )}
                            </span>
                            {tool.active && <Check aria-hidden="true" />}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

          </div>
          <div className="a11y-mobile-footer">
            <button type="button" className="a11y-mobile-reset" onClick={onReset}>
              <RotateCcw aria-hidden="true" />
              {labels.resetAll}
            </button>
          </div>
        </div>
      ) : (
        <div className="a11y-mobile-railview">
          <nav className="a11y-mobile-bar" aria-label={labels.mobileTools}>
            <button type="button" onClick={closePanel} aria-label={labels.closePanel}>
              <X aria-hidden="true" />
            </button>
            <button type="button" onClick={onReset} aria-label={labels.resetAll}>
              <RotateCcw aria-hidden="true" />
            </button>
            <button type="button" onClick={goProfiles} aria-label={labels.backToProfiles}>
              <ArrowLeft aria-hidden="true" />
            </button>
          </nav>
          <div className="a11y-mobile-rail" role="group" aria-label={labels.mobileTools}>
            {tools.map((tool) => {
              const Icon = tool.icon;
              const dotCount = tool.dotCount ?? 0;
              const onDots = Math.min(Math.max(0, tool.level ?? 0), dotCount);
              return (
                <button
                  key={tool.id}
                  type="button"
                  className={cn("a11y-mobile-railbutton", tool.active && "a11y-rail-active")}
                  aria-pressed={tool.active}
                  aria-label={tool.ariaLabel}
                  title={tool.label}
                  onClick={tool.onClick}
                >
                  <Icon aria-hidden="true" />
                  {dotCount > 0 && (
                    <span className="a11y-tool-dots" aria-hidden="true">
                      {Array.from({ length: dotCount }, (_, index) => (
                        <span
                          key={index}
                          className={cn("a11y-tool-dot", index < onDots && "a11y-tool-dot-on")}
                        />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
