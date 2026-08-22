import { useEffect, useState } from "react";

/**
 * Dev-only frame-rate readout.
 *
 * Four rounds of performance work on this app were done by reading the code
 * and guessing, because the person writing it could not run it. This makes
 * the number visible to whoever *can* run it, without them having to open
 * DevTools: frames per second, and how much of each second the main thread
 * spent blocked by long tasks.
 *
 * Stripped from production builds by the `import.meta.env.DEV` guard at the
 * call site, so it costs nothing shipped.
 */
export function PerfBadge() {
  const [fps, setFps] = useState(0);
  const [blocked, setBlocked] = useState(0);

  useEffect(() => {
    let frames = 0;
    let longTaskMs = 0;
    let last = performance.now();
    let raf = 0;

    const tick = () => {
      frames++;
      const now = performance.now();
      if (now - last >= 1000) {
        setFps(Math.round((frames * 1000) / (now - last)));
        setBlocked(Math.round(longTaskMs));
        frames = 0;
        longTaskMs = 0;
        last = now;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    let observer: PerformanceObserver | undefined;
    try {
      observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) longTaskMs += entry.duration;
      });
      observer.observe({ entryTypes: ["longtask"] });
    } catch {
      // Safari has no longtask entry type; the FPS number still works.
    }

    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, []);

  const tone = fps >= 55 ? "#16d6a3" : fps >= 30 ? "#ffd23f" : "#ff3b5c";

  return (
    <div
      style={{
        position: "fixed",
        right: 10,
        bottom: 10,
        zIndex: 9999,
        padding: "6px 10px",
        borderRadius: 8,
        background: "rgba(11,14,19,0.92)",
        border: "1px solid rgba(233,237,244,0.14)",
        font: "500 11px/1.3 ui-monospace, SFMono-Regular, Menlo, monospace",
        color: "rgba(233,237,244,0.7)",
        pointerEvents: "none",
        letterSpacing: "0.04em",
      }}
    >
      <span style={{ color: tone }}>{fps} fps</span>
      <span style={{ opacity: 0.5 }}> · blocked {blocked}ms/s</span>
    </div>
  );
}
