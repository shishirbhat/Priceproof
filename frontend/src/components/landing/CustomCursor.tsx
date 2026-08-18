import { useEffect, useRef } from "react";
import { animate } from "animejs";

/**
 * A small glowing ring that trails the real cursor with spring lag, and
 * grows on hover of anything clickable — the "creative technologist"
 * portfolio cursor pattern. Desktop/pointer-fine only; never shown on touch.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = dotRef.current;
    if (!el) return;

    function onMove(e: MouseEvent) {
      pos.current = { x: e.clientX, y: e.clientY };
      animate(el!, {
        left: pos.current.x,
        top: pos.current.y,
        duration: 500,
        ease: "out(3)",
      });
    }

    function isInteractive(target: EventTarget | null): boolean {
      if (!(target instanceof Element)) return false;
      return !!target.closest("a, button, input, select, [role='button']");
    }

    function onOver(e: MouseEvent) {
      if (isInteractive(e.target)) {
        animate(el!, { scale: 2.4, duration: 300, ease: "outExpo" });
      }
    }
    function onOut(e: MouseEvent) {
      if (isInteractive(e.target)) {
        animate(el!, { scale: 1, duration: 300, ease: "outExpo" });
      }
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    window.addEventListener("mouseout", onOut);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseout", onOut);
    };
  }, []);

  return (
    <div
      ref={dotRef}
      className="pointer-events-none fixed z-[90] hidden h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand bg-brand/30 shadow-[0_0_12px_2px] shadow-brand/50 lg:block"
      style={{ left: -100, top: -100 }}
    />
  );
}
