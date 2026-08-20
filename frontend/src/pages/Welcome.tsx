import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { Turntable } from "@/components/racing/Turntable";
import { ArtTile } from "@/components/racing/ArtTile";
import { SEGMENTS, CAPABILITIES } from "@/components/welcome/segments";
import { framesFor } from "@/components/racing/carImages";
import {
  DUR,
  EASE_EXPO,
  REVEAL_VIEWPORT,
  SPRING_SNAP,
  STAGGER,
  revealVariants,
} from "@/lib/motion";

const SECTIONS = ["Segments", "Capabilities", "Method"] as const;

/**
 * The front door.
 *
 * Same design language as the showroom build — studio turntable, glass
 * navigation, expo-out motion throughout — applied to what this product
 * actually does. The car in the hero is the domain, not decoration: every
 * verdict the platform produces is scoped to a vehicle segment, so the
 * segments are what the hero cycles through.
 */
export function Welcome() {
  const [active, setActive] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const segment = SEGMENTS[active];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div id="top" className="min-h-screen bg-[#050506] text-white antialiased">
      {/* Navigation */}
      <motion.header
        className="pointer-events-none fixed inset-x-0 top-0 z-40 px-4 pt-4 sm:px-6 sm:pt-5"
        initial={{ y: -28, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: DUR.panel, ease: EASE_EXPO }}
      >
        <nav className="relative mx-auto flex max-w-[1600px] items-center justify-between">
          <a href="#top" className="pointer-events-auto leading-[1.05]">
            <span className="block text-[11px] font-semibold tracking-[0.30em] text-white">
              PRICEPROOF
            </span>
            <span className="block text-[8px] tracking-[0.26em] text-white/45">
              MARKET INTELLIGENCE
            </span>
          </a>

          <div className="pointer-events-auto absolute left-1/2 hidden -translate-x-1/2 md:block">
            <div
              className="flex items-center gap-0.5 rounded-full p-1 backdrop-blur-xl transition-colors duration-300"
              style={{
                background: scrolled ? "rgba(14,14,16,0.82)" : "rgba(18,18,20,0.55)",
                boxShadow: scrolled
                  ? "inset 0 0 0 1px rgba(255,255,255,0.09), 0 8px 30px rgba(0,0,0,0.45)"
                  : "inset 0 0 0 1px rgba(255,255,255,0.06)",
              }}
            >
              {SECTIONS.map((s) => (
                <a
                  key={s}
                  href={`#${s.toLowerCase()}`}
                  className="rounded-full px-3.5 py-1.5 text-[12.5px] text-white/70 transition-colors duration-200 hover:bg-white/10 hover:text-white"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          <Link
            to="/"
            className="group pointer-events-auto flex items-center gap-1.5 rounded-full bg-brand px-3.5 py-2 text-[12px] font-medium text-brand-foreground transition-transform duration-200 hover:scale-[1.03]"
          >
            Open dashboard
            <ArrowUpRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </nav>
      </motion.header>

      {/* Hero — the studio, cycling the segments the platform scores. */}
      <section className="relative h-[100svh] min-h-[580px] w-full overflow-hidden">
        <Turntable
          paint={segment.paint}
          label={`${segment.name} segment`}
          silhouette={segment.silhouette}
          frames={framesFor(segment.id)}
        />

        <div className="pointer-events-none absolute inset-x-0 top-[19%] flex flex-col items-center px-6 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={segment.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: DUR.base, ease: EASE_EXPO }}
            >
              <span className="text-[10px] tracking-[0.3em] text-white/45 uppercase">
                {segment.name}
              </span>
              <h1 className="mt-3 max-w-3xl text-[34px] leading-[1.08] font-light tracking-tight text-white sm:text-[50px]">
                {segment.headline}
              </h1>
              <p className="mx-auto mt-4 max-w-md text-[12.5px] leading-[1.6] text-white/50">
                {segment.note}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Segment switcher, carrying the showroom's sliding indicator. */}
        <div className="absolute inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-6 sm:pb-8">
          <div
            className="flex items-center gap-0.5 overflow-x-auto rounded-full p-1 backdrop-blur-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{
              background: "rgba(14,14,16,0.82)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08), 0 10px 34px rgba(0,0,0,0.5)",
            }}
            role="tablist"
            aria-label="Vehicle segment"
          >
            {SEGMENTS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={i === active}
                onClick={() => setActive(i)}
                className={`relative shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] whitespace-nowrap outline-none transition-colors duration-200 focus-visible:ring-1 focus-visible:ring-white/40 ${
                  i === active ? "text-white" : "text-white/60 hover:text-white/90"
                }`}
              >
                {i === active && (
                  <motion.span
                    layoutId="segment-pill"
                    className="absolute inset-0 rounded-full bg-white/[0.14]"
                    transition={SPRING_SNAP}
                  />
                )}
                <span className="relative z-10">{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section id="capabilities" className="px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-[1400px]">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={REVEAL_VIEWPORT}
            variants={revealVariants}
          >
            <span className="block text-[10px] tracking-[0.28em] text-white/40 uppercase">
              Capabilities
            </span>
            <h2 className="mt-2.5 max-w-2xl text-[26px] leading-[1.12] font-light tracking-tight sm:text-[34px]">
              Four questions a single listing page can never answer.
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={REVEAL_VIEWPORT}
            transition={{ staggerChildren: STAGGER }}
            className="mt-10 grid gap-3 sm:grid-cols-2"
          >
            {CAPABILITIES.map((c) => (
              <motion.div key={c.n} variants={revealVariants}>
                <Link
                  to={c.to}
                  className="group relative flex h-full flex-col justify-between gap-8 overflow-hidden rounded-2xl bg-[#0b0b0d] p-6 transition-colors duration-300 hover:bg-[#101013]"
                  style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.07)" }}
                >
                  <span className="absolute inset-x-0 top-0 h-[2px] w-0 bg-brand transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full" />
                  <span className="text-[10px] tracking-[0.2em] text-white/35">{c.n}</span>
                  <span>
                    <span className="block text-[19px] leading-tight font-light">{c.title}</span>
                    <span className="mt-3 block max-w-md text-[12px] leading-[1.62] text-white/50">
                      {c.body}
                    </span>
                    <span className="mt-4 flex items-center gap-1.5 text-[11.5px] text-white/70 transition-colors group-hover:text-white">
                      Open
                      <ArrowUpRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Method — the statement section. */}
      <section
        id="method"
        className="relative isolate overflow-hidden px-4 py-24 sm:px-6 lg:px-10 lg:py-32"
      >
        <div className="absolute inset-0 -z-10 opacity-45">
          <ArtTile id="method-band" tone={["#141a24", "#5a2630"]} />
        </div>
        <div
          className="absolute inset-0 -z-10"
          style={{ background: "linear-gradient(to top, #050506 4%, rgba(5,5,6,0.68) 60%, #050506 100%)" }}
        />
        <div className="mx-auto max-w-[1400px]">
          <h2 className="max-w-3xl text-[26px] leading-[1.18] font-light tracking-tight sm:text-[38px]">
            {["Append-only history.", "Every verdict traceable to the snapshot it came from."].map(
              (line, i) => (
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
              ),
            )}
          </h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={REVEAL_VIEWPORT}
            variants={revealVariants}
            className="mt-6 max-w-xl text-[13px] leading-[1.65] text-white/55"
          >
            Nothing is ever updated in place. Each collection run appends a new
            snapshot, so a price cut, a delisting and a portal changing shape are
            all the same kind of record — and any number on screen can be walked
            back to the run that produced it. Generated demo history is labelled
            as such, everywhere it appears.
          </motion.p>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={REVEAL_VIEWPORT}
            variants={revealVariants}
            className="mt-10"
          >
            <Link
              to="/"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13px] font-medium text-black transition-transform duration-200 hover:scale-[1.03]"
            >
              Open the dashboard
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <footer
        className="px-4 py-12 sm:px-6 lg:px-10"
        style={{ boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.07)" }}
      >
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-end justify-between gap-6">
          <div className="leading-[1.05]">
            <span className="block text-[13px] font-semibold tracking-[0.30em] text-white">
              PRICEPROOF
            </span>
            <span className="block text-[9px] tracking-[0.26em] text-white/45">
              MARKET INTELLIGENCE
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-5 text-[11.5px] text-white/45">
            <Link to="/racing" className="transition-colors hover:text-white">
              Showroom build
            </Link>
            <Link to="/" className="transition-colors hover:text-white">
              Dashboard
            </Link>
            <span>Into the Scrape-Verse · Bright Data</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Welcome;
