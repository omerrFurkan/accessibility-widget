import { useEffect, useRef } from "react";

/**
 * A compact floating guide bar that follows the pointer on both axes,
 * with a centered upward triangle (----------^---------).
 * Rendered as part of the widget root (fixed positioning).
 */
export function ReadingGuide({ active }: { active: boolean }) {
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const onMove = (clientX: number, clientY: number) => {
      const el = barRef.current;
      if (!el) return;
      el.style.left = `${clientX}px`;
      el.style.top = `${clientY}px`;
    };
    const onMouseMove = (event: MouseEvent) => onMove(event.clientX, event.clientY);
    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) onMove(touch.clientX, touch.clientY);
    };
    const onPointerMove = (event: PointerEvent) => onMove(event.clientX, event.clientY);
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [active]);

  if (!active) return null;

  return <div ref={barRef} className="a11y-reading-guide-el" aria-hidden="true" />;
}
