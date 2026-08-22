import { useEffect, useRef } from "react";

/**
 * Dev-only frame-rate readout, bottom-right.
 *
 * This is deliberately *not* React state. A badge that called setState once
 * a frame would itself schedule a render and a commit on every vsync, which
 * is the exact cost it claims to measure — the numbers would be an artefact
 * of the instrument. It writes textContent on a ref instead, so the whole
 * thing is one text mutation per second and no React work at all.
 *
 * Reported values are the mean and the worst frame in the last second.
 * The worst frame is the number that matters: a page can average 58fps and
 * still feel broken if one frame in thirty takes 200ms.
 */
export function FpsBadge() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let last = performance.now();
    let windowStart = last;
    let frames = 0;
    let worst = 0;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const delta = now - last;
      last = now;
      // Ignore the gap produced by a backgrounded tab.
      if (delta < 1000) {
        frames++;
        if (delta > worst) worst = delta;
      }

      const elapsed = now - windowStart;
      if (elapsed >= 1000) {
        const fps = Math.round((frames * 1000) / elapsed);
        el.textContent = `${fps} fps · worst ${worst.toFixed(0)}ms`;
        // Green under one dropped frame, amber past that, red past 50ms.
        el.dataset.state = worst > 50 ? "bad" : worst > 33 ? "warn" : "ok";
        frames = 0;
        worst = 0;
        windowStart = now;
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!import.meta.env.DEV) return null;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed right-3 bottom-3 z-[100] rounded-sm px-2 py-1 font-mono text-[10px] tracking-[0.08em] tabular-nums data-[state=bad]:text-destructive data-[state=ok]:text-label-3 data-[state=warn]:text-hot"
      style={{
        background: "rgb(0 0 0 / 0.72)",
        boxShadow: "inset 0 0 0 1px var(--hairline)",
      }}
    >
      measuring…
    </div>
  );
}

export default FpsBadge;
