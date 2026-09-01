import { useEffect, useState } from "react";

/**
 * A cursor-following spotlight: the window under the pointer stays bright
 * while the rest of the page is softly darkened (the dim comes from the
 * box-shadow on the element itself — see index.css).
 */
export function ReadingMask({ active }: { active: boolean }) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!active) return;
    const onMouseMove = (event: MouseEvent) => setPosition({ x: event.clientX, y: event.clientY });
    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) setPosition({ x: touch.clientX, y: touch.clientY });
    };
    const onPointerMove = (event: PointerEvent) => setPosition({ x: event.clientX, y: event.clientY });
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
  return (
    <div
      className="a11y-reading-mask-el"
      aria-hidden="true"
      style={position ? { left: position.x, top: position.y } : undefined}
    />
  );
}
