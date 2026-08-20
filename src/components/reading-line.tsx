import { useEffect, useRef } from "react";

/**
 * A horizontal reading guide line that follows the pointer.
 * Rendered as part of the widget root (fixed positioning).
 */
export function ReadingLine({ active }: { active: boolean }) {
  const lineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const onMove = (event: MouseEvent) => {
      const el = lineRef.current;
      if (!el) return;
      const y = Math.max(0, event.clientY - el.offsetHeight / 2);
      el.style.top = `${y}px`;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [active]);

  if (!active) return null;

  return <div ref={lineRef} className="a11y-reading-line-el" aria-hidden="true" />;
}
