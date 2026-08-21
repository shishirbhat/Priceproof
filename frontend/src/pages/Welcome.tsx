import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { Turntable } from "@/components/racing/Turntable";
import { ArtTile } from "@/components/racing/ArtTile";
import { SEGMENTS, CAPABILITIES } from "@/components/welcome/segments";
import { framesFor } from "@/components/racing/carImages";
import {
  DUR,
  EASE_66,
  EASE_EXPO,
  REVEAL_VIEWPORT,
  STAGGER_WIDE,
  revealVariants,
  revealDisplayVariants,
} from "@/lib/motion";

const SECTIONS = [
  { id: "segments", label: "Segments" },
  { id: "capabilities", label: "Capabilities" },
  { id: "method", label: "Method" },
];

/** The ticker strip under the nav — upvent's live-status idiom. */
const TICKER = [
  "APPEND-ONLY SNAPSHOT HISTORY",
  "BRIGHT DATA SCRAPER STUDIO",
  "MEDIAN-SCORED AGAINST COMPARABLES",
  "CROSS-PORTAL FUZZY MATCHING",
  "DELISTING-DERIVED DAYS ON MARKET",
  "FIELD-LEVEL DRIFT DETECTION",
];

/** The figures the product stands on, stated plainly. */
const FIGURES = [
  { k: "5", label: "Minimum comparables before any verdict is given" },
  { k: "6h", label: "Collection cadence, running on GitHub Actions" },
  { k: "2", label: "Portals connected — Cars24 and CarWale" },
  { k: "0", label: "Rows ever updated in place" },
];

/**
 * The front door.
 *
 * Built on the same system as the dashboard, at marketing scale: the mono
 * structural voice, the indexed flat list, viewport-relative display type,
 * and acid reserved for identity moments. The car in the hero is the domain,
 * not decoration — every verdict the platform produces is scoped to a
 * vehicle segment, so the segments are what the hero cycles through.
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
    <div id="top" className="min-h-screen bg-surface-0 text-foreground antialiased">
      {/* ---------------------------------------------------------------- */}
      {/* Navigation — a flat bar that gains a hairline and a plane on
          scroll, rather than a floating pill. */}
      <motion.header
        className="fixed inset-x-0 top-0 z-40 transition-colors duration-300"
        initial={{ y: -28, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: DUR.panel, ease: EASE_66 }}
        style={{
          background: scrolled ? "rgb(8 9 10 / 0.9)" : "transparent",
          backdropFilter: scrolled ? "blur(10px)" : "none",
          boxShadow: scrolled ? "inset 0 -1px 0 0 var(--hairline)" : "none",
        }}
      >
        <nav className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-4 sm:px-6 lg:px-10">
          <a href="#top" className="group">
            <span className="block font-mono text-[12px] font-medium tracking-[0.34em] text-label-1 transition-colors duration-200 group-hover:text-brand">
              PRICEPROOF
            </span>
            <span className="label-mono-sm mt-1 block">Market Intelligence</span>
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {SECTIONS.map((s, i) => (
              <a key={s.id} href={`#${s.id}`} className="group flex items-center gap-2">
                <span className="index-numeral text-label-4 transition-colors duration-200 group-hover:text-brand">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="label-mono transition-colors duration-200 group-hover:text-label-1">
                  {s.label}
                </span>
              </a>
            ))}
          </div>

          <Link
            to="/"
            className="group flex items-center gap-2 rounded-sm bg-brand px-4 py-2.5 text-brand-foreground transition-transform duration-300 ease-[cubic-bezier(0.66,0,0.01,1)] hover:scale-[1.03]"
          >
            <span className="font-mono text-[10px] font-medium tracking-[0.18em] uppercase">
              Open dashboard
            </span>
            <ArrowUpRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </nav>

        {/* Status ticker. Duplicated once so the marquee wraps seamlessly. */}
        <div
          className="overflow-hidden py-2"
          style={{ boxShadow: "inset 0 -1px 0 0 var(--hairline)" }}
          aria-hidden="true"
        >
          <div className="marquee flex w-max gap-10 whitespace-nowrap">
            {[...TICKER, ...TICKER].map((t, i) => (
              <span key={i} className="flex items-center gap-10">
                <span className="font-mono text-[9px] tracking-[0.26em] text-label-4">{t}</span>
                <span className="h-1 w-1 shrink-0 bg-brand/50" />
              </span>
            ))}
          </div>
        </div>
      </motion.header>

      {/* ---------------------------------------------------------------- */}
      {/* Hero — the studio, cycling the segments the platform scores. */}
      <section id="segments" className="relative h-[92svh] min-h-[560px] w-full overflow-hidden">
        <Turntable
          paint={segment.paint}
          label={`${segment.name} segment`}
          silhouette={segment.silhouette}
          frames={framesFor(segment.id)}
        />

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 pt-24 pb-28 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={segment.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: DUR.panel, ease: EASE_66 }}
            >
              <div className="flex items-center justify-center gap-3">
                <span className="index-numeral">{String(active + 1).padStart(2, "0")}</span>
                <span className="label-mono text-label-2">{segment.name} segment</span>
              </div>
              <h1 className="display-2 mx-auto mt-5 max-w-4xl text-label-1">{segment.headline}</h1>
              <p className="mx-auto mt-6 max-w-md text-[13px] leading-[1.65] text-label-2">
                {segment.note}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Segment switcher — the same segmented readout the dashboard uses
            for verdict filters, so the two halves share one control. */}
        <div className="absolute inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-8">
          <div
            className="flex gap-px overflow-x-auto rounded-sm bg-[var(--hairline)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                className={`relative shrink-0 px-5 py-3 font-mono text-[10px] tracking-[0.18em] whitespace-nowrap uppercase outline-none transition-colors duration-200 focus-visible:ring-1 focus-visible:ring-brand/50 ${
                  i === active
                    ? "bg-surface-3 text-label-1"
                    : "bg-surface-1/95 text-label-3 hover:bg-surface-2 hover:text-label-2"
                }`}
              >
                <span className="relative z-10">{s.name}</span>
                {i === active && (
                  <motion.span
                    layoutId="segment-underline"
                    className="absolute inset-x-0 bottom-0 h-[2px] bg-brand"
                    transition={{ duration: DUR.micro, ease: EASE_EXPO }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Figures band — four numbers, hairline-gridded. */}
      <section className="px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1600px]">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={REVEAL_VIEWPORT}
            transition={{ staggerChildren: STAGGER_WIDE }}
            className="grid grid-cols-2 gap-px bg-[var(--hairline)] lg:grid-cols-4"
          >
            {FIGURES.map((f) => (
              <motion.div key={f.label} variants={revealVariants} className="bg-surface-0 px-6 py-10">
                <div className="text-[3.5rem] leading-none font-light tracking-[-0.05em] tabular-nums text-label-1">
                  {f.k}
                </div>
                <div className="label-mono mt-4 leading-[1.7]">{f.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Capabilities — an index, not a card grid. Each row is a full-width
          rule that lights up and pushes its arrow on hover. */}
      <section id="capabilities" className="px-4 py-24 sm:px-6 lg:px-10 lg:py-36">
        <div className="mx-auto max-w-[1600px]">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={REVEAL_VIEWPORT}
            variants={revealDisplayVariants}
          >
            <div className="flex items-center gap-3">
              <span className="index-numeral">02</span>
              <span className="label-mono text-label-2">Capabilities</span>
            </div>
            <h2 className="display-3 mt-6 max-w-3xl text-label-1">
              Four questions a single listing page can never answer.
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={REVEAL_VIEWPORT}
            transition={{ staggerChildren: STAGGER_WIDE }}
            className="mt-16"
          >
            {CAPABILITIES.map((c) => (
              <motion.div key={c.n} variants={revealVariants}>
                <Link
                  to={c.to}
                  className="group relative grid grid-cols-1 items-start gap-4 py-8 transition-colors duration-300 md:grid-cols-[5rem_minmax(0,22rem)_minmax(0,1fr)_3rem]"
                  style={{ boxShadow: "inset 0 1px 0 0 var(--hairline)" }}
                >
                  <span className="index-numeral pt-2 transition-colors duration-300 group-hover:text-brand">
                    {c.n}
                  </span>

                  <span className="display-4 text-label-1 transition-colors duration-300 group-hover:text-brand">
                    {c.title}
                  </span>

                  <span className="max-w-2xl text-[13.5px] leading-[1.7] text-label-2">
                    {c.body}
                  </span>

                  <span className="flex items-start justify-start pt-2 md:justify-end">
                    <ArrowRight className="h-4 w-4 text-label-4 transition-all duration-[660ms] ease-[cubic-bezier(0.66,0,0.01,1)] group-hover:translate-x-2 group-hover:text-brand" />
                  </span>

                  {/* The acid rule that draws across the row on hover. */}
                  <span className="pointer-events-none absolute inset-x-0 top-0 h-px w-full origin-left scale-x-0 bg-brand transition-transform duration-[660ms] ease-[cubic-bezier(0.66,0,0.01,1)] group-hover:scale-x-100" />
                </Link>
              </motion.div>
            ))}
            <div className="h-px bg-[var(--hairline)]" />
          </motion.div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Method — the statement section, with the line-by-line word reveal. */}
      <section
        id="method"
        className="relative isolate overflow-hidden px-4 py-28 sm:px-6 lg:px-10 lg:py-40"
      >
        <div className="absolute inset-0 -z-10 opacity-30">
          <ArtTile id="method-band" tone={["#0f1111", "#1b2352"]} />
        </div>
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(to top, var(--surface-0) 4%, rgb(8 9 10 / 0.7) 60%, var(--surface-0) 100%)",
          }}
        />

        <div className="mx-auto max-w-[1600px]">
          <div className="flex items-center gap-3">
            <span className="index-numeral">03</span>
            <span className="label-mono text-label-2">Method</span>
          </div>

          <h2 className="display-2 mt-8 max-w-4xl text-label-1">
            {["Append-only history.", "Every verdict traceable to the snapshot it came from."].map(
              (line, i) => (
                <span key={line} className="block overflow-hidden">
                  <motion.span
                    className="block"
                    initial={{ y: "104%" }}
                    whileInView={{ y: "0%" }}
                    viewport={{ once: true, margin: "-18% 0px" }}
                    transition={{ duration: DUR.hero, ease: EASE_66, delay: i * 0.09 }}
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
            className="mt-8 max-w-xl text-[14px] leading-[1.7] text-label-2"
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
            className="mt-12"
          >
            <Link
              to="/"
              className="group inline-flex items-center gap-3 rounded-sm bg-brand px-6 py-3.5 text-brand-foreground transition-transform duration-300 ease-[cubic-bezier(0.66,0,0.01,1)] hover:scale-[1.03]"
            >
              <span className="font-mono text-[11px] font-medium tracking-[0.18em] uppercase">
                Open the dashboard
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      <footer className="rule-t px-4 py-14 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-end justify-between gap-8">
          <div>
            <span className="block font-mono text-[13px] font-medium tracking-[0.34em] text-label-1">
              PRICEPROOF
            </span>
            <span className="label-mono-sm mt-1.5 block">Market Intelligence</span>
            <span className="mt-4 block h-px w-10 bg-brand" />
          </div>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <Link to="/racing" className="label-mono transition-colors duration-200 hover:text-label-1">
              Showroom build
            </Link>
            <Link
              to="/welcome/classic"
              className="label-mono transition-colors duration-200 hover:text-label-1"
            >
              Classic landing
            </Link>
            <Link to="/" className="label-mono transition-colors duration-200 hover:text-label-1">
              Dashboard
            </Link>
            <span className="label-mono-sm">Into the Scrape-Verse · Bright Data</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Welcome;
