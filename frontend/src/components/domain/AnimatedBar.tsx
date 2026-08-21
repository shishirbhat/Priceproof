import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { cn } from "@/lib/utils";

interface AnimatedBarProps {
  pct: number; // 0-100
  className?: string;
  trackClassName?: string;
  delay?: number;
}

/**
 * A progress bar that fills in via anime.js rather than snapping to width.
 * Square-ended and hairline-thin, so a row of them reads as a bar chart on
 * an instrument rather than a stack of pills.
 */
export function AnimatedBar({ pct, className, trackClassName, delay = 0 }: AnimatedBarProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // scaleX rather than width: a width animation runs layout on every
    // frame for every bar on the page, a transform is composited.
    const target = Math.max(0, Math.min(100, pct)) / 100;
    el.style.transformOrigin = "left center";
    el.style.transform = "scaleX(0)";
    const animation = animate(el, {
      scaleX: target,
      duration: 900,
      delay,
      ease: "outExpo",
    });
    return () => {
      animation.pause();
    };
  }, [pct, delay]);

  return (
    <div className={cn("h-1.5 flex-1 overflow-hidden bg-surface-3", trackClassName)}>
      <div ref={ref} className={cn("h-full w-full", className)} />
    </div>
  );
}
