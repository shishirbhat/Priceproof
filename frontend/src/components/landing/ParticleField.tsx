import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  baseAlpha: number;
}

/**
 * Canvas-based ambient particle field, mouse-reactive (particles drift away
 * from the cursor). No WebGL/three.js dependency — plain 2D canvas.
 *
 * The glow comes from blitting one pre-rendered radial-gradient sprite per
 * particle. It used to come from `shadowBlur`, which makes the canvas run a
 * real gaussian blur on every particle on every frame; at 260 particles that
 * is ~15,600 blurred draw calls a second and it visibly bogged down laptops.
 *
 * The loop also stops when the tab is hidden and never starts under
 * prefers-reduced-motion — an ambient decoration has no business burning a
 * core in a background tab.
 */
export function ParticleField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let raf = 0;

    // Read the identity accent off the token layer so the field always
    // matches whatever --brand currently is. Canvas can't parse every color
    // space, so anything non-hex falls back to the acid literal.
    const token = getComputedStyle(document.documentElement)
      .getPropertyValue("--brand")
      .trim();
    const brand = token.startsWith("#") ? token : "#d4ff32";

    /** How far the glow extends past the particle's own radius. */
    const SPRITE_SCALE = 4;

    // One offscreen sprite, drawn once: a radial gradient from the solid
    // brand core out to fully transparent. Every particle is then a single
    // cheap drawImage of this bitmap.
    const sprite = document.createElement("canvas");
    {
      const size = 64;
      sprite.width = size;
      sprite.height = size;
      const sctx = sprite.getContext("2d")!;
      const g = sctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      g.addColorStop(0, brand);
      g.addColorStop(0.25, brand);
      g.addColorStop(1, "transparent");
      sctx.fillStyle = g;
      sctx.fillRect(0, 0, size, size);
    }

    function resize() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.parentElement!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * devicePixelRatio;
      canvas.height = height * devicePixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx!.scale(devicePixelRatio, devicePixelRatio);

      const count = Math.min(140, Math.floor((width * height) / 11000));
      particles = Array.from({ length: count }, () => {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.pow(Math.random(), 0.5) * Math.min(width, height) * 0.42;
        const cx = width * 0.72;
        const cy = height * 0.48;
        return {
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          r: Math.random() * 1.8 + 0.4,
          baseAlpha: Math.random() * 0.5 + 0.15,
        };
      });
    }

    function onMove(e: MouseEvent) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    function onLeave() {
      mouse.current = { x: -9999, y: -9999 };
    }

    function tick() {
      ctx!.clearRect(0, 0, width, height);
      for (const p of particles) {
        const dx = p.x - mouse.current.x;
        const dy = p.y - mouse.current.y;
        const dist = Math.hypot(dx, dy);
        const repelRadius = 140;
        if (dist < repelRadius) {
          const force = ((repelRadius - dist) / repelRadius) * 1.8;
          p.vx += (dx / (dist || 1)) * force * 0.06;
          p.vy += (dy / (dist || 1)) * force * 0.06;
        }
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.x += p.vx;
        p.y += p.vy;

        // Blit the pre-rendered sprite. `shadowBlur` here meant the canvas
        // ran a gaussian blur per particle per frame — 260 particles at
        // 60fps is ~15,600 blurred draw calls a second, which is what was
        // melting laptops on this page.
        const d = p.r * SPRITE_SCALE;
        ctx!.globalAlpha = p.baseAlpha;
        ctx!.drawImage(sprite, p.x - d, p.y - d, d * 2, d * 2);
      }
      ctx!.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    }

    function onVisibility() {
      cancelAnimationFrame(raf);
      if (!document.hidden) tick();
    }

    resize();
    tick();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} />;
}
