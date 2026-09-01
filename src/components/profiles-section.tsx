import { useState } from "react";
import {
  Accessibility,
  BookOpen,
  Brain,
  Check,
  ChevronDown,
  Eye,
  Info,
  Palette,
  Users,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAccessibility } from "@/context/accessibility-context";
import { ACCESSIBILITY_PROFILES, findProfile } from "@/context/profiles";
import type { AccessibilityWidgetLabels } from "./labels";
import { cn } from "@/lib/utils";

const PROFILE_ICONS: Record<string, LucideIcon> = {
  adhd: Brain,
  "low-vision": Eye,
  dyslexia: BookOpen,
  "color-blind": Palette,
  epilepsy: Zap,
  elderly: Accessibility,
};

export interface ProfilesSectionProps {
  labels: AccessibilityWidgetLabels;
  open: boolean;
  onToggle: () => void;
}

export function ProfilesSection({ labels, open, onToggle }: ProfilesSectionProps) {
  const { settings, applyProfile } = useAccessibility();
  const active = findProfile(settings.activeProfileId);
  const [detailsFor, setDetailsFor] = useState<string | null>(null);

  return (
    <div className="a11y-flex a11y-flex-col">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="a11y-flex a11y-w-full a11y-items-center a11y-gap-3 a11y-rounded-2xl a11y-border a11y-border-[var(--a11y-widget-border)] a11y-bg-[var(--a11y-widget-bg)]/75 a11y-p-2.5 a11y-text-left a11y-transition-colors hover:a11y-bg-[var(--a11y-widget-bg)]"
      >
        <span className="a11y-flex a11y-size-10 a11y-shrink-0 a11y-items-center a11y-justify-center a11y-rounded-full a11y-bg-[var(--a11y-widget-accent)]/10">
          <Users className="a11y-size-5 a11y-text-[var(--a11y-widget-accent)]" aria-hidden="true" />
        </span>
        <span className="a11y-flex a11y-min-w-0 a11y-flex-1 a11y-flex-col">
          <span className="a11y-text-sm a11y-font-semibold a11y-text-[var(--a11y-widget-text)]">
            {labels.profilesLabel}
          </span>
          <span className="a11y-text-xs a11y-text-muted-foreground">
            {active
              ? labels[active.nameKey as keyof AccessibilityWidgetLabels]
              : labels.profilesNone}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "a11y-size-5 a11y-shrink-0 a11y-text-[var(--a11y-widget-accent)] a11y-transition-transform",
            open && "a11y-rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul className="a11y-profiles-list a11y-mt-2 a11y-max-h-[185px] a11y-overflow-y-auto a11y-list-none a11y-p-0 a11y-pr-1">
          {ACCESSIBILITY_PROFILES.map((profile) => {
            const ProfileIcon = PROFILE_ICONS[profile.id] ?? Users;
            const isActive = settings.activeProfileId === profile.id;
            const detailsOpen = detailsFor === profile.id;
            return (
              <li key={profile.id} className="a11y-mb-2 a11y-flex a11y-list-none a11y-flex-col">
                <div
                  className={cn(
                    "a11y-flex a11y-items-center a11y-gap-2 a11y-rounded-[24px] a11y-p-2 a11y-transition-colors",
                    isActive
                      ? "a11y-bg-[var(--a11y-widget-accent)]"
                      : "hover:a11y-bg-[var(--a11y-widget-accent)]/5",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => applyProfile(profile.id)}
                    aria-pressed={isActive}
                    className="a11y-flex a11y-min-w-0 a11y-flex-1 a11y-items-center a11y-gap-3 a11y-text-left"
                  >
                    <span
                      className={cn(
                        "a11y-flex a11y-size-10 a11y-shrink-0 a11y-items-center a11y-justify-center a11y-rounded-full a11y-transition-colors",
                        isActive
                          ? "a11y-bg-white/80 a11y-text-[var(--a11y-widget-accent)]"
                          : "a11y-bg-[var(--a11y-widget-muted)] a11y-text-muted-foreground",
                      )}
                    >
                      <ProfileIcon className="a11y-size-[18px]" aria-hidden="true" />
                    </span>
                    <span className="a11y-flex a11y-min-w-0 a11y-flex-col">
                      <span
                        className={cn(
                          "a11y-text-sm a11y-font-medium",
                          isActive ? "a11y-text-white" : "a11y-text-[var(--a11y-widget-text)]",
                        )}
                      >
                        {labels[profile.nameKey as keyof AccessibilityWidgetLabels]}
                      </span>
                      <span
                        className={cn(
                          "a11y-text-xs a11y-line-clamp-1",
                          isActive ? "a11y-text-white/80" : "a11y-text-muted-foreground",
                        )}
                      >
                        {labels[profile.descriptionKey as keyof AccessibilityWidgetLabels]}
                      </span>
                    </span>
                  </button>

                  {isActive && (
                    <Check
                      className="a11y-size-4 a11y-shrink-0 a11y-text-white"
                      aria-hidden="true"
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => setDetailsFor(detailsOpen ? null : profile.id)}
                    aria-expanded={detailsOpen}
                    aria-controls={`a11y-profile-details-${profile.id}`}
                    aria-label={labels.profileInfoToggle}
                    className="a11y-inline-flex a11y-size-6 a11y-shrink-0 a11y-items-center a11y-justify-center a11y-rounded-full a11y-bg-[var(--a11y-widget-muted)] a11y-text-muted-foreground a11y-transition-all hover:a11y-bg-[var(--a11y-widget-accent)]/10 hover:a11y-scale-110 hover:a11y-text-[var(--a11y-widget-accent)]"
                  >
                    <Info className="a11y-size-4" aria-hidden="true" />
                  </button>
                </div>

                {detailsOpen && (
                  <p
                    id={`a11y-profile-details-${profile.id}`}
                    className="a11y-mx-3 a11y-mt-1 a11y-rounded-xl a11y-bg-[var(--a11y-widget-muted)]/60 a11y-px-3 a11y-py-2 a11y-text-xs a11y-text-muted-foreground"
                  >
                    {labels[profile.detailsKey as keyof AccessibilityWidgetLabels]}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
