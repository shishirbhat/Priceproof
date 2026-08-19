import { useRef, type ReactNode, type MouseEvent } from "react";
import { animate } from "animejs";
import { cn } from "@/lib/utils";

/**
 * Wraps a button-like element and pulls it toward the cursor on hover
 * (anime.js spring-back on leave) — the "magnetic" interaction pattern from
 * the Aaron J. Cunningham / creative-technologist portfolio reference.
 * Wrap the real interactive element as children; this only handles the
 * transform.
 */
export function MagneticButton({
  children,
  className,
  strength = 0.35,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function onMouseMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * strength;
    const y = (e.clientY - rect.top - rect.height / 2) * strength;
    animate(el, { translateX: x, translateY: y, duration: 400, ease: "out(3)" });
  }

  function onMouseLeave() {
    const el = ref.current;
    if (!el) return;
    animate(el, { translateX: 0, translateY: 0, duration: 600, ease: "outElastic(1, 0.5)" });
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={cn("inline-block will-change-transform", className)}
    >
      {children}
    </div>
  );
}
