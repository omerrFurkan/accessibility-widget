import { Accessibility } from "lucide-react";
import { useAccessibility } from "@/context/accessibility-context";
import { cn } from "@/lib/utils";

interface AccessibilityTriggerProps {
  label: string;
}

export function AccessibilityTrigger({ label }: AccessibilityTriggerProps) {
  const { isPanelOpen, togglePanel } = useAccessibility();

  return (
    <button
      type="button"
      className={cn(
        "a11y-trigger a11y-fixed a11y-z-[var(--a11y-widget-z)]",
        "a11y-flex a11y-h-14 a11y-w-14 a11y-items-center a11y-justify-center a11y-rounded-full",
        "a11y-border-none a11y-shadow-lg a11y-shadow-black/25 a11y-cursor-pointer",
        "a11y-bg-[var(--a11y-widget-accent)] a11y-text-[var(--a11y-widget-accent-foreground)]",
        "a11y-transition-transform hover:a11y-scale-105 active:a11y-scale-95",
        isPanelOpen && "a11y-scale-95 a11y-ring-4 a11y-ring-[var(--a11y-widget-accent)]/30",
      )}
      aria-label={label}
      aria-haspopup="dialog"
      aria-expanded={isPanelOpen}
      aria-controls="a11y-widget-panel"
      onClick={togglePanel}
    >
      <Accessibility className="a11y-size-7" aria-hidden="true" />
    </button>
  );
}
