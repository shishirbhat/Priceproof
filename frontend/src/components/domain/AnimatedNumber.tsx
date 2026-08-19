import { useEffect, useRef } from "react";
import { animate } from "animejs";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
}

/**
 * Count-up on mount/value-change via anime.js — animates a detached number,
 * writes the formatted string to the DOM node directly in onUpdate rather
 * than through React state, so a 60fps tween doesn't trigger a re-render
 * per frame.
 */
export function AnimatedNumber({ value, duration = 900, format, className }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const prevValue = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const from = { n: prevValue.current };
    const fmt = format ?? ((n: number) => String(Math.round(n)));

    el.textContent = fmt(from.n);
    const animation = animate(from, {
      n: value,
      duration,
      ease: "outExpo",
      onUpdate: () => {
        el.textContent = fmt(from.n);
      },
    });

    prevValue.current = value;
    return () => {
      animation.pause();
    };
  }, [value, duration, format]);

  return <span ref={ref} className={className} />;
}
