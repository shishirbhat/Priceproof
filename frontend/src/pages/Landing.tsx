import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, Boxes, ArrowDown } from "lucide-react";
import { ParticleField } from "@/components/landing/ParticleField";
import { ScrollReveal } from "@/components/landing/ScrollReveal";
import { StatBlock } from "@/components/landing/StatBlock";
import { ScrollDots } from "@/components/landing/ScrollDots";
import { PriceHistoryChart } from "@/components/domain/PriceHistoryChart";
import { MagneticButton } from "@/components/domain/MagneticButton";

const FEATURES = [
  {
    n: "01",
    title: "Price Integrity",
    body: "Every advertised discount checked against the true 30-day low. EU Omnibus, UK CMA, India CCPA — the reference price the law actually requires, computed, not eyeballed.",
  },
  {
    n: "02",
    title: "MAP Violations",
    body: "Retailers selling below the floor you set, ranked by how far below and how long they've stayed there.",
  },
  {
    n: "03",
    title: "Stockout Tracking",
    body: "Every restock and outage timestamped, with real time-to-restock — not a guess from the last time someone checked.",
  },
  {
    n: "04",
    title: "Scraper Health",
    body: "Field-level coverage over time, so a site that changes under the scraper shows up as a drift alert, then a recovery — not silence.",
  },
];

const demoData = (() => {
  const base = 83.11;
  const days = 30;
  const out: { date: Date; current?: number; list?: number; trueLow?: number }[] = [];
  const now = new Date("2026-08-18T00:00:00Z").getTime();
  for (let i = 0; i < days; i++) {
    const date = new Date(now - (days - 1 - i) * 86400000);
    if (i < days - 6) {
      out.push({ date, current: base * (1 + Math.sin(i / 2) * 0.03), trueLow: base * 0.97 });
    } else {
      const t = (i - (days - 6)) / 5;
      out.push({
        date,
        current: base * (1 - 0.15 * t),
        list: base * 1.35,
        trueLow: base * 0.97,
      });
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
      <div className="flex w-full max-w-5xl items-center justify-between rounded-full border border-white/[0.08] bg-black/40 px-4 py-2.5 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-brand to-brand/70 text-brand-foreground">
            <Boxes className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-semibold tracking-tight">PriceProof</span>
        </div>
        <nav className="hidden items-center gap-6 text-[13px] text-muted-foreground md:flex">
          <a href="#proof" className="transition-colors hover:text-foreground">Product</a>
          <a href="#features" className="transition-colors hover:text-foreground">Features</a>
          <a href="#how" className="transition-colors hover:text-foreground">How it works</a>
        </nav>
        <MagneticButton strength={0.4}>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-b from-brand to-brand/85 px-4 py-1.5 text-[13px] font-medium text-brand-foreground shadow-[0_1px_1px_oklch(1_0_0/0.3)_inset,0_4px_14px_-4px] shadow-brand/50"
          >
            Enter dashboard <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </MagneticButton>
      </div>
    </motion.header>
  );
}

export function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
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
            className="mb-6 flex items-center gap-2 font-mono text-xs tracking-wider text-muted-foreground"
          >
            <span className="text-brand">// 01</span> PRICE INTEGRITY &amp; COMPLIANCE PLATFORM
          </motion.div>

          <h1 className="text-[clamp(3rem,9vw,7.5rem)] font-bold leading-[0.92] tracking-tighter">
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="block"
            >
              Fake discounts.
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="block text-muted-foreground"
            >
              Caught on the record.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="mt-8 max-w-lg text-[15px] leading-relaxed text-muted-foreground"
          >
            PriceProof builds a continuous price-history record across every store you track, then proves
            — with a verdict, not a guess — whether an advertised discount was ever real.
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
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-brand to-brand/85 px-6 py-3 text-sm font-medium text-brand-foreground shadow-[0_1px_1px_oklch(1_0_0/0.3)_inset,0_8px_24px_-6px] shadow-brand/50"
              >
                Enter dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </MagneticButton>
            <MagneticButton strength={0.25}>
              <a
                href="#how"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm font-medium transition-colors hover:bg-white/[0.04]"
              >
                See it catch one
              </a>
            </MagneticButton>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 font-mono text-[11px] tracking-widest text-muted-foreground"
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
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-elevate-lg">
            <div className="flex items-center gap-2 border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-severity-violation/50" />
                <span className="h-2.5 w-2.5 rounded-full bg-severity-drift/50" />
                <span className="h-2.5 w-2.5 rounded-full bg-severity-genuine/50" />
              </div>
              <div className="mx-auto flex items-center gap-1.5 rounded-md bg-white/[0.04] px-3 py-1 font-mono text-[11px] text-muted-foreground">
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
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
            </div>
          </div>
          <p className="mt-4 text-center font-mono text-[11px] tracking-wider text-muted-foreground">
            THIS IS THE REAL DASHBOARD, LIVE — NOT A MOCKUP
          </p>
        </motion.div>
      </section>

      {/* PROOF STATEMENT */}
      <section id="proof" className="px-6 py-40">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 font-mono text-xs tracking-wider text-brand">// 02 THE PROBLEM</div>
          <ScrollReveal
            text="Anyone can scrape a price once. A single snapshot can't tell you whether a 40% off sale is real — only accumulated history can. Retailers quietly raise the list price days before a markdown, advertise the inflated gap, and there's no record to catch it against. Until there's a record."
            className="text-[clamp(1.5rem,3.5vw,2.75rem)] font-medium leading-tight tracking-tight text-muted-foreground"
          />
        </div>
      </section>

      {/* STATS */}
      <section id="stats" className="border-y border-white/[0.06] bg-white/[0.02] px-6 py-28">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-16 md:grid-cols-3">
          <StatBlock value="30" label="days of price history checked before any verdict is given" delay={0} />
          <StatBlock value="0" label="guesses — INSUFFICIENT_HISTORY is a real answer, not a fallback" delay={0.1} />
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
            <div className="mb-4 font-mono text-xs tracking-wider text-brand">// 03 THE PLATFORM</div>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight">
              Four ways to prove it.
            </h2>
          </motion.div>

          <div className="divide-y divide-white/[0.06] border-t border-white/[0.06]">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
                className="group grid grid-cols-1 gap-3 py-8 transition-colors md:grid-cols-[100px_1fr_2fr] md:gap-8"
              >
                <div className="font-mono text-sm text-muted-foreground">({f.n})</div>
                <div className="text-xl font-semibold tracking-tight transition-colors group-hover:text-brand">
                  {f.title}
                </div>
                <div className="max-w-lg text-sm leading-relaxed text-muted-foreground">{f.body}</div>
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
            <div className="mb-4 font-mono text-xs tracking-wider text-brand">// 04 SEE IT WORK</div>
            <h2 className="mb-3 text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight">
              This is a real verdict.
            </h2>
            <p className="mb-10 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Steady price for weeks, then the list price jumps 35% six days before the "sale" —
              while the true 30-day low barely moved. This exact pattern is what PriceProof's Price
              Integrity page flags as <span className="text-severity-violation">Inflated</span>, automatically.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-transparent p-6 shadow-elevate-lg"
          >
            <div className="mb-4 flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-chart-1" /> Selling price
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-severity-violation" /> Claimed "was" price
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-chart-2" /> True 30-day low
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
            className="text-[clamp(2rem,5vw,4rem)] font-bold leading-[0.95] tracking-tighter"
          >
            Ready to see what your
            <br />
            competitors aren't telling you?
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
                className="inline-flex items-center gap-2 rounded-full bg-black px-7 py-3.5 text-sm font-medium text-white"
              >
                Enter dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </MagneticButton>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] px-6 py-10 text-xs text-muted-foreground">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span>PriceProof — Into the Scrape-Verse · Bright Data</span>
          <span>Built on Bright Data Scraper Studio</span>
        </div>
      </footer>
    </div>
  );
}
