import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  /** Ordered frames, one per angle around the car. */
  frames: string[];
  label: string;
  paused?: boolean;
  /** Frames advanced per second while idling. */
  idleFps?: number;
};

/**
 * A photographic turntable.
 *
 * This is how a production configurator actually works: a sequence of
 * studio frames shot at fixed angles, scrubbed by drag. It replaces the
 * generated car wherever real photography exists, and shares the
 * generated version's interaction model so the two feel identical.
 */
export function FrameSequence({ frames, label, paused = false, idleFps = 8 }: Props) {
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const accum = useRef(0);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Preload every frame before showing the sequence, so a drag never lands
  // on a blank. One decoded set is a few hundred kilobytes, not megabytes.
  useEffect(() => {
    let cancelled = false;
    let loaded = 0;
    if (frames.length === 0) return;
    for (const src of frames) {
      const img = new Image();
      img.onload = img.onerror = () => {
        loaded += 1;
        if (!cancelled && loaded === frames.length) setReady(true);
      };
      img.src = src;
    }
    return () => { cancelled = true; };
  }, [frames]);

  // Idle rotation.
  useEffect(() => {
    if (paused || !ready || frames.length < 2) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;
    const id = window.setInterval(() => {
      if (!dragging.current) setIndex((i) => (i + 1) % frames.length);
    }, 1000 / idleFps);
    return () => window.clearInterval(id);
  }, [paused, ready, frames.length, idleFps]);

  // Drag to scrub.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || frames.length < 2) return;
    // Roughly one full turn per viewport width of travel.
    const pxPerFrame = Math.max(6, el.clientWidth / frames.length);

    const down = (e: PointerEvent) => {
      dragging.current = true;
      lastX.current = e.clientX;
      accum.current = 0;
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!dragging.current) return;
      accum.current += e.clientX - lastX.current;
      lastX.current = e.clientX;
      const steps = Math.trunc(accum.current / pxPerFrame);
      if (steps !== 0) {
        accum.current -= steps * pxPerFrame;
        setIndex((i) => (((i + steps) % frames.length) + frames.length) % frames.length);
      }
    };
    const up = (e: PointerEvent) => {
      dragging.current = false;
      try { el.releasePointerCapture(e.pointerId); } catch { /* already released */ }
    };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [frames.length]);

  const backdrop = useMemo(
    () => "radial-gradient(120% 80% at 50% 42%, #6f747c 0%, #26292e 46%, #0a0b0c 100%)",
    [],
  );

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0 touch-none overflow-hidden select-none"
      style={{ background: backdrop, cursor: frames.length > 1 ? "grab" : "default" }}
    >
      {/* All frames stay mounted and only opacity changes, so scrubbing
          never waits on a decode. */}
      {frames.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={i === 0 ? label : ""}
          aria-hidden={i !== 0}
          draggable={false}
          className="absolute inset-0 h-full w-full object-contain"
          style={{ opacity: i === index ? 1 : 0 }}
        />
      ))}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 60% at 50% 55%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.62) 100%)",
        }}
      />
    </div>
  );
}
