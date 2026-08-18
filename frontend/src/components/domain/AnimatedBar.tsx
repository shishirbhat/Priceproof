import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { cn } from "@/lib/utils";

interface AnimatedBarProps {
  pct: number; // 0-100
  className?: string;
  trackClassName?: string;
  delay?: number;
}

/** A progress bar that fills in via anime.js rather than snapping to width. */
export function AnimatedBar({ pct, className, trackClassName, delay = 0 }: AnimatedBarProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.width = "0%";
    const animation = animate(el, {
      width: `${Math.max(0, Math.min(100, pct))}%`,
      duration: 900,
      delay,
      ease: "outExpo",
    });
    return () => {
      animation.pause();
    };
  }, [pct, delay]);

  return (
    <div className={cn("h-2 flex-1 overflow-hidden rounded-full bg-muted", trackClassName)}>
      <div ref={ref} className={cn("h-full rounded-full", className)} />
    </div>
  );
}
