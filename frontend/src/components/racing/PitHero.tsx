import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { DUR, EASE_EXPO } from "@/lib/motion";

const LINES = ["Porsche Motorsport.", "From racing to everything we are."];

/**
 * The pit-garage statement section.
 *
 * Three depth layers (backdrop, car, foreground fixtures) move at
 * different rates against scroll, which is what sells the parallax in the
 * reference without resorting to a video. The headline reveals per line
 * on a clip mask.
 */
export function PitHero() {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Back layers travel least, foreground most — standard parallax ordering.
  const backY = useTransform(scrollYProgress, [0, 1], ["-4%", "6%"]);
  const midY = useTransform(scrollYProgress, [0, 1], ["-9%", "12%"]);
  const frontY = useTransform(scrollYProgress, [0, 1], ["-16%", "20%"]);
  const scrimOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 0.55, 0.9]);

  return (
    <section
      ref={ref}
      className="relative isolate h-[86vh] min-h-[520px] overflow-hidden bg-[#0a0b0d]"
    >
      {/* Backdrop: the pit lane beyond the garage door. */}
      <motion.div style={{ y: backY }} className="absolute inset-[-8%]">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #c9ced6 0%, #9aa3ae 32%, #5d6570 62%, #2a2e34 100%)",
          }}
        />
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
          {/* Grandstand silhouette and track line. */}
          <rect x="0" y="470" width="1600" height="70" fill="#7a828d" opacity="0.55" />
          <rect x="0" y="540" width="1600" height="22" fill="#e6142d" opacity="0.35" />
          <rect x="0" y="562" width="1600" height="120" fill="#4c535c" opacity="0.6" />
        </svg>
      </motion.div>

      {/* Mid layer: the car, squared up in the box. */}
      <motion.div style={{ y: midY }} className="absolute inset-0 flex items-end justify-center">
        <svg
          className="h-[62%] w-auto"
          viewBox="0 0 600 380"
          fill="none"
          aria-hidden="true"
        >
          {/* Rear wing. */}
          <rect x="120" y="60" width="360" height="16" rx="3" fill="#1b1e23" />
          <rect x="118" y="46" width="14" height="70" rx="3" fill="#23272d" />
          <rect x="468" y="46" width="14" height="70" rx="3" fill="#23272d" />
          {/* Body. */}
          <path
            d="M150 300 L164 190 Q 300 150 436 190 L450 300 Z"
            fill="#2b2f36"
          />
          <path
            d="M196 190 Q 300 162 404 190 L410 236 L190 236 Z"
            fill="#181b20"
          />
          {/* Light bar. */}
          <rect x="196" y="244" width="208" height="9" rx="4.5" fill="#e6142d" />
          <rect x="196" y="244" width="208" height="9" rx="4.5" fill="#ff5a6a" opacity="0.55" />
          {/* Diffuser and lower bumper. */}
          <rect x="182" y="272" width="236" height="30" rx="4" fill="#e6142d" opacity="0.9" />
          <rect x="200" y="278" width="200" height="18" rx="3" fill="#0d0f12" />
          {/* Tyres. */}
          <rect x="126" y="228" width="42" height="76" rx="10" fill="#101215" />
          <rect x="432" y="228" width="42" height="76" rx="10" fill="#101215" />
          {/* Floor contact shadow. */}
          <ellipse cx="300" cy="308" rx="190" ry="14" fill="#000" opacity="0.45" />
        </svg>
      </motion.div>

      {/* Foreground: garage structure and overhead lighting. */}
      <motion.div style={{ y: frontY }} className="pointer-events-none absolute inset-[-6%]">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
          {/* Side walls framing the box. */}
          <rect x="0" y="0" width="150" height="900" fill="#d8dce1" opacity="0.9" />
          <rect x="1450" y="0" width="150" height="900" fill="#e2e5e9" opacity="0.92" />
          {/* Overhead gantry with light strips. */}
          <rect x="330" y="70" width="940" height="24" rx="4" fill="#1a1c20" />
          {[420, 700, 980].map((x) => (
            <g key={x}>
              <rect x={x} y="96" width="180" height="14" rx="7" fill="#ffffff" opacity="0.96" />
              <rect x={x - 20} y="110" width="220" height="70" fill="url(#lightfall)" />
            </g>
          ))}
          {/* Monitor bank. */}
          <rect x="600" y="188" width="120" height="62" rx="4" fill="#0d0f12" />
          <rect x="740" y="188" width="120" height="62" rx="4" fill="#0d0f12" />
          <rect x="746" y="196" width="108" height="46" rx="2" fill="#e6142d" opacity="0.8" />
          <rect x="880" y="188" width="120" height="62" rx="4" fill="#0d0f12" />
          <defs>
            <linearGradient id="lightfall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.42" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Bottom scrim so the headline always clears its background. */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
        style={{
          opacity: scrimOpacity,
          background: "linear-gradient(to top, rgba(4,4,6,0.96), rgba(4,4,6,0))",
        }}
      />

      {/* Headline — each line masked and pushed up into place. */}
      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-14">
        <h2 className="max-w-3xl text-[26px] leading-[1.18] font-light tracking-tight text-white sm:text-[36px] lg:text-[42px]">
          {LINES.map((line, i) => (
            <span key={line} className="block overflow-hidden">
              <motion.span
                className="block"
                initial={{ y: "104%" }}
                whileInView={{ y: "0%" }}
                viewport={{ once: true, margin: "-18% 0px" }}
                transition={{ duration: DUR.panel, ease: EASE_EXPO, delay: i * 0.09 }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h2>
      </div>

      {/* Picture-in-picture preview, pinned bottom-right. */}
      <motion.button
        type="button"
        aria-label="Play the season film"
        className="group absolute right-6 bottom-6 hidden h-[58px] w-[92px] overflow-hidden rounded-lg sm:block lg:right-14 lg:bottom-14"
        style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.18), 0 10px 30px rgba(0,0,0,0.5)" }}
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: DUR.base, ease: EASE_EXPO, delay: 0.3 }}
      >
        <span
          className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
          style={{ background: "linear-gradient(135deg, #4a5058, #16181c 70%)" }}
        />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/85 text-black transition-transform duration-300 group-hover:scale-110">
            <svg width="7" height="8" viewBox="0 0 9 10" fill="currentColor" aria-hidden="true">
              <path d="M0 0l9 5-9 5z" />
            </svg>
          </span>
        </span>
      </motion.button>
    </section>
  );
}
