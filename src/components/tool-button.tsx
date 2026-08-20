import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToolButtonProps {
  icon: LucideIcon;
  label: string;
  active: boolean;
  /** Number of indicator dots lit up (0..dotCount). */
  level?: number;
  /** Total number of indicator dots to render. */
  dotCount?: number;
  onClick: () => void;
  "aria-label"?: string;
}

/**
 * Axessora-style tool button: icon tile + bold label + intensity dots.
 * Rendered inside the widget root (isolation enforced by CSS classes).
 */
export function ToolButton({
  icon: Icon,
  label,
  active,
  level = 0,
  dotCount = 0,
  onClick,
  ...rest
}: ToolButtonProps) {
  const onDots = Math.min(Math.max(0, level), dotCount);

  return (
    <button
      type="button"
      className={cn("a11y-tool-button", active && "a11y-tool-active")}
      onClick={onClick}
      aria-pressed={active}
      {...rest}
    >
      <span className="a11y-tool-icon">
        <Icon className="a11y-size-6" aria-hidden="true" />
      </span>
      <span className="a11y-tool-label">{label}</span>
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
}
