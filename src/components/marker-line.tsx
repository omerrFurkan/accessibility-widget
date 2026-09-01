import { useEffect, useRef } from "react";

/**
 * Ege-style yellow marker strip: a translucent, blend-mode band that
 * follows the pointer vertically. Unlike the reading line it tints the
 * row under the cursor instead of drawing a solid guide.
 * Rendered as part of the widget root (fixed positioning).
 */
export function MarkerLine({ active }: { active: boolean }) {
  const lineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const onMove = (clientY: number) => {
      const el = lineRef.current;
      if (!el) return;
      const y = Math.max(0, clientY - el.offsetHeight / 2);
      el.style.top = `${y}px`;
    };
    const onMouseMove = (event: MouseEvent) => onMove(event.clientY);
    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) onMove(touch.clientY);
    };
    const onPointerMove = (event: PointerEvent) => onMove(event.clientY);
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

  return <div ref={lineRef} className="a11y-marker-line-el" aria-hidden="true" />;
}
