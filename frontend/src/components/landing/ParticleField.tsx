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
 * from the cursor). No WebGL/three.js dependency — plain 2D canvas with
 * additive-ish glow via shadowBlur, cheap enough to run behind a full-bleed
 * hero without a frame budget problem.
 */
export function ParticleField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let raf = 0;

    const brand = getComputedStyle(document.documentElement).getPropertyValue("--brand").trim() || "oklch(0.72 0.19 235)";

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

      const count = Math.min(260, Math.floor((width * height) / 5500));
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

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = brand.includes("oklch") ? "#4db8ff" : brand;
        ctx!.globalAlpha = p.baseAlpha;
        ctx!.shadowColor = "#4db8ff";
        ctx!.shadowBlur = 6;
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    }

    resize();
    tick();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} />;
}
