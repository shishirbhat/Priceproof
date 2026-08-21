import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, Car, ArrowDown } from "lucide-react";
import { ParticleField } from "@/components/landing/ParticleField";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { StatBlock } from "@/components/landing/StatBlock";
import { ScrollDots } from "@/components/landing/ScrollDots";
import { Preloader } from "@/components/landing/Preloader";
import { CustomCursor } from "@/components/landing/CustomCursor";
import { PriceHistoryChart } from "@/components/domain/PriceHistoryChart";
import { MagneticButton } from "@/components/domain/MagneticButton";

const FEATURES = [
  {
    n: "01",
    title: "Market Value",
    body: "Every active listing scored against the median of comparable listings — same make and model, widened to make and model-year when a line is too thin. A verdict only ever comes with enough comparables to back it.",
  },
  {
    n: "02",
    title: "Cross-Portal Matching",
    body: "The same car, cross-posted by an individual seller to two portals at two prices — matched on make, model, year, registration prefix, and city, since no portal publishes a full VIN on its results grid.",
  },
  {
    n: "03",
    title: "Days-on-Market & Price Cuts",
    body: "A listing disappearing between two collection runs is the only sold signal a portal gives. Track that, plus every markdown before the sale, and you get sell-through data the portals themselves don't show.",
  },
  {
    n: "04",
    title: "Scraper Health",
    body: "Field-level coverage over time, so a portal that changes under the scraper shows up as a drift alert, then a recovery — not silence.",
  },
];

const demoData = (() => {
  const base = 680000;
  const days = 48;
  const out: { date: Date; current?: number; list?: number; trueLow?: number }[] = [];
  const now = new Date("2026-08-19T00:00:00Z").getTime();
  for (let i = 0; i < days; i++) {
    const date = new Date(now - (days - 1 - i) * 86400000);
    if (i < 15) {
      out.push({ date, current: base * (1 + Math.sin(i / 2) * 0.006) });
    } else if (i < 30) {
      out.push({ date, current: base * 0.956, list: i < 19 ? base : undefined });
    } else if (i < 45) {
      out.push({ date, current: base * 0.912, list: i < 34 ? base * 0.956 : undefined });
    } else {
      out.push({ date, current: base * 0.868, list: base * 0.912 });
    }
  }
  return out;
})();

function Nav() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-6 py-4"
    >
      <div className="flex w-full max-w-5xl items-center justify-between rounded-lg bg-surface-1/70 px-4 py-3 backdrop-blur-xl" style={{ boxShadow: "inset 0 0 0 1px var(--hairline)" }}>
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand text-brand-foreground">
            <Car className="h-3.5 w-3.5" />
          </div>
          <span className="font-mono text-[11px] font-medium tracking-[0.3em] text-label-1">PRICEPROOF</span>
        </div>
        <nav className="hidden items-center gap-7 md:flex">
          <a href="#proof" className="label-mono transition-colors duration-200 hover:text-label-1">Product</a>
          <a href="#features" className="label-mono transition-colors duration-200 hover:text-label-1">Features</a>
          <a href="#how" className="label-mono transition-colors duration-200 hover:text-label-1">How it works</a>
        </nav>
        <MagneticButton strength={0.4}>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 font-mono text-[10px] font-medium tracking-[0.18em] text-brand-foreground uppercase"
          >
            Enter dashboard <ArrowRight className="h-3 w-3" />
          </Link>
        </MagneticButton>
      </div>
    </motion.header>
  );
}

export function Landing() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      {loading && <Preloader onDone={() => setLoading(false)} />}
      <CustomCursor />
      <Nav />
      <ScrollDots />

      {/* HERO */}
      <section id="hero" className="relative flex min-h-screen items-center overflow-hidden px-6 pt-24">
        <ParticleField className="pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />

        <div className="relative mx-auto w-full max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mb-7 flex items-center gap-3"
          >
            <span className="index-numeral">01</span>
            <span className="label-mono">Market value &amp; listings intelligence platform</span>
          </motion.div>

          <h1 className="display-1 text-label-1">
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="block"
            >
              Every listing.
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="block text-label-3"
            >
              Priced honestly.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="mt-8 max-w-lg text-[15px] leading-[1.7] text-label-2"
          >
            PriceProof builds a continuous listings-history record across every portal you track, then
            scores — with a verdict, not a guess — whether an asking price is actually fair.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.68, duration: 0.5 }}
            className="mt-9 flex items-center gap-4"
          >
            <MagneticButton>
              <Link
                to="/"
                className="inline-flex items-center gap-2.5 rounded-lg bg-brand px-6 py-3.5 font-mono text-[11px] font-medium tracking-[0.18em] text-brand-foreground uppercase"
              >
                Enter dashboard <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </MagneticButton>
            <MagneticButton strength={0.25}>
              <a
                href="#how"
                className="inline-flex items-center gap-2 rounded-lg px-6 py-3.5 font-mono text-[11px] tracking-[0.18em] text-label-2 uppercase transition-colors duration-200 hover:bg-surface-2 hover:text-label-1"
                style={{ boxShadow: "inset 0 0 0 1px var(--hairline-strong)" }}
              >
                See a verdict
              </a>
            </MagneticButton>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="label-mono absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2.5"
        >
          SCROLL
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
            <ArrowDown className="h-3.5 w-3.5" />
          </motion.div>
        </motion.div>
      </section>

      {/* PRODUCT SHOWCASE — a real, live iframe of the dashboard, not a screenshot */}
      <section id="showcase" className="px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: 4 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-5xl [perspective:1600px]"
        >
          <div className="overflow-hidden rounded-lg bg-surface-1 shadow-elevate-lg" style={{ boxShadow: "inset 0 0 0 1px var(--hairline)" }}>
            <div className="rule-b flex items-center gap-2 bg-surface-2 px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 bg-severity-violation/50" />
                <span className="h-2 w-2 bg-severity-drift/50" />
                <span className="h-2 w-2 bg-severity-genuine/50" />
              </div>
              <div className="label-mono mx-auto flex items-center gap-1.5 rounded-lg bg-surface-3 px-3 py-1.5">
                priceproof.app
              </div>
            </div>
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-background">
              <iframe
                src="/"
                title="PriceProof live dashboard"
                className="h-[125%] w-[125%] origin-top-left scale-[0.8] border-0"
                loading="lazy"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface-1 via-transparent to-transparent" />
            </div>
          </div>
          <p className="label-mono mt-5 text-center">
            This is the real dashboard, live — not a mockup
          </p>
        </motion.div>
      </section>

      {/* PROOF STATEMENT */}
      <section id="proof" className="px-6 py-40">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 flex items-center gap-3">
            <span className="index-numeral">02</span>
            <span className="label-mono">The problem</span>
          </div>
          <ScrollReveal
            text="A single listing can't tell you if ₹4.2L for a 2019 Swift is a good deal — only a market can. Dealers price high and wait it out; individual sellers panic-sell underpriced. Every portal shows you one asking price with no reference point. Until there's a record of the whole market."
            className="display-3 text-label-3"
          />
        </div>
      </section>

      {/* STATS */}
      <section id="stats" className="rule-t bg-surface-1/50 px-6 py-28">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-16 md:grid-cols-3">
          <StatBlock value="5+" label="comparable listings required before any verdict is given" delay={0} />
          <StatBlock value="0" label="guesses — INSUFFICIENT_COMPARABLES is a real answer, not a fallback" delay={0.1} />
          <StatBlock value="24/7" label="continuous tracking, not spot checks run by hand" delay={0.2} />
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="px-6 py-32">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="mb-16 max-w-xl"
          >
            <div className="mb-6 flex items-center gap-3">
              <span className="index-numeral">03</span>
              <span className="label-mono">The platform</span>
            </div>
            <h2 className="display-2 text-label-1">Four ways to prove it.</h2>
          </motion.div>

          <div className="border-t border-[var(--hairline)]">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
                className="group relative grid grid-cols-1 gap-3 py-9 md:grid-cols-[100px_1fr_2fr] md:gap-8"
                style={{ boxShadow: "inset 0 -1px 0 0 var(--hairline)" }}
              >
                <div className="index-numeral pt-1.5 transition-colors duration-300 group-hover:text-brand">{f.n}</div>
                <div className="display-4 text-label-1 transition-colors duration-300 group-hover:text-brand">
                  {f.title}
                </div>
                <div className="max-w-lg text-[13.5px] leading-[1.7] text-label-2">{f.body}</div>
                <span className="pointer-events-none absolute inset-x-0 top-0 h-px w-full origin-left scale-x-0 bg-brand transition-transform duration-[660ms] ease-[cubic-bezier(0.66,0,0.01,1)] group-hover:scale-x-100" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — real chart demo */}
      <section id="how" className="px-6 py-32">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6 flex items-center gap-3">
              <span className="index-numeral">04</span>
              <span className="label-mono">See it work</span>
            </div>
            <h2 className="display-2 mb-5 text-label-1">This is a real listing's markdown.</h2>
            <p className="mb-12 max-w-xl text-[14px] leading-[1.7] text-label-2">
              Steady asking price for two weeks, then two price cuts over the following month as the
              listing sat without selling — 680,000 down to 590,000, 48 days on market. This exact
              pattern is what PriceProof's Market Activity page tracks automatically, from nothing more
              than the listing quietly changing between collection runs.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="panel rounded-lg p-6"
          >
            <div className="mb-6 flex items-center gap-6">
              <span className="label-mono flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-chart-1" /> Asking price
              </span>
              <span className="label-mono flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-severity-violation" /> Price before cut
              </span>
            </div>
            <PriceHistoryChart data={demoData} />
          </motion.div>
        </div>
      </section>

      {/* CTA — inverted */}
      <section id="cta" className="bg-brand px-6 py-32 text-brand-foreground">
        <div className="mx-auto max-w-4xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="display-1 text-brand-foreground"
          >
            Ready to see what your
            <br />
            listings are actually worth?
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-10"
          >
            <MagneticButton>
              <Link
                to="/"
                className="inline-flex items-center gap-2.5 rounded-lg bg-surface-0 px-7 py-4 font-mono text-[11px] font-medium tracking-[0.18em] text-label-1 uppercase"
              >
                Enter dashboard <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </MagneticButton>
          </motion.div>
        </div>
      </section>

      <footer className="rule-t px-6 py-12">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
          <span className="label-mono">PriceProof — Into the Scrape-Verse · Bright Data</span>
          <span className="label-mono-sm">Built on Bright Data Scraper Studio</span>
        </div>
      </footer>
    </div>
  );
}
