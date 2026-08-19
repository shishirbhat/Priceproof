import { useEffect, useMemo, useRef } from "react";
import { buildCar, renderCar } from "./carRenderer";
import type { CarModel } from "./data";

type Props = {
  model: CarModel;
  /** Paused while the detail overlay is open, so we stop burning frames. */
  paused?: boolean;
};

/** Radians per second while idling. Matches the reference's slow drift. */
const IDLE_SPEED = 0.34;
/** Multiplier converting a pixel of horizontal drag into yaw. */
const DRAG_SENSITIVITY = 0.0075;
/** Per-frame velocity retention after release — the flick-to-spin feel. */
const FRICTION = 0.94;

/**
 * The hero turntable.
 *
 * Drag to spin, release to let it coast back to an idle rotation. The
 * canvas is sized to its container in device pixels, and the whole loop
 * stops when the element scrolls out of view or the tab is hidden.
 */
export function Turntable({ model, paused = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Mutable animation state, kept off React so the loop never re-renders.
  const yaw = useRef(-0.55);
  const velocity = useRef(0);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const visible = useRef(true);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  const faces = useMemo(() => buildCar(model.paint), [model.paint]);
  const facesRef = useRef(faces);
  facesRef.current = faces;
  const accentRef = useRef(model.paint.accent);
  accentRef.current = model.paint.accent;

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    // Cap the pixel ratio — a 3x retina fill of this many polygons is the
    // difference between a locked 60fps and a visibly soft one.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      width = r.width;
      height = r.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const io = new IntersectionObserver(
      ([e]) => { visible.current = e.isIntersecting; },
      { threshold: 0.05 },
    );
    io.observe(wrap);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    let raf = 0;
    let prev = performance.now();

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;

      const idle = !visible.current || document.hidden;
      if (idle) return;

      if (!dragging.current) {
        if (Math.abs(velocity.current) > 0.0008) {
          // Coasting after a flick.
          yaw.current += velocity.current * dt * 60;
          velocity.current *= FRICTION;
        } else if (!pausedRef.current && !reduced.matches) {
          yaw.current += IDLE_SPEED * dt;
        }
      }

      renderCar(ctx, facesRef.current, width, height, yaw.current, accentRef.current);
    };
    raf = requestAnimationFrame(frame);

    // Draw one frame immediately so a paused or reduced-motion visitor
    // still gets a fully composed hero rather than an empty canvas.
    renderCar(ctx, facesRef.current, width, height, yaw.current, accentRef.current);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  // Pointer drag. Captured on the element so a fast flick that leaves the
  // canvas still tracks until release.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const down = (e: PointerEvent) => {
      dragging.current = true;
      lastX.current = e.clientX;
      velocity.current = 0;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = "grabbing";
    };
    const move = (e: PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - lastX.current;
      lastX.current = e.clientX;
      const delta = dx * DRAG_SENSITIVITY;
      yaw.current += delta;
      // Blend into the running velocity so the release reads as momentum
      // rather than as whatever the final pointer event happened to be.
      velocity.current = velocity.current * 0.6 + delta * 0.4;
    };
    const up = (e: PointerEvent) => {
      if (!dragging.current) return;
      dragging.current = false;
      try { canvas.releasePointerCapture(e.pointerId); } catch { /* already released */ }
      canvas.style.cursor = "grab";
    };

    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    return () => {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
    };
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="block h-full w-full touch-none select-none"
        style={{ cursor: "grab" }}
        role="img"
        aria-label={`${model.title} — drag to rotate the car`}
      />
    </div>
  );
}
