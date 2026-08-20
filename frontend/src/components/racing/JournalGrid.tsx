import { motion } from "motion/react";
import { ArtTile } from "./ArtTile";
import { EventCalendar } from "./EventCalendar";
import { JOURNAL } from "./data";
import type { JournalItem } from "./data";
import { EASE_EXPO, REVEAL_VIEWPORT, STAGGER, revealVariants } from "@/lib/motion";

/**
 * The journal bento grid.
 *
 * Named grid areas rather than spans, because the arrangement is genuinely
 * irregular — one tall feature column, a stacked news pair, and a calendar
 * that occupies the top-left. Below lg the whole thing linearises.
 */
export function JournalGrid() {
  return (
    <section id="journal" className="relative bg-[#050506] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-[1400px]">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={REVEAL_VIEWPORT}
          variants={revealVariants}
          className="mb-8 flex items-end justify-between gap-6"
        >
          <div>
            <span className="block text-[10px] tracking-[0.28em] text-white/40 uppercase">
              Journal
            </span>
            <h2 className="mt-2.5 max-w-xl text-[26px] leading-[1.12] font-light tracking-tight text-white sm:text-[34px]">
              Every race weekend, and everything around it.
            </h2>
          </div>
          <a
            href="#journal"
            className="group hidden shrink-0 items-center gap-2 text-[12px] text-white/60 transition-colors hover:text-white sm:flex"
          >
            All stories
            <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
          </a>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={REVEAL_VIEWPORT}
          transition={{ staggerChildren: STAGGER }}
          className="grid gap-3 lg:grid-cols-4 lg:grid-rows-[auto_auto]"
        >
          {/* Calendar occupies the first cell of the first row. */}
          <motion.div variants={revealVariants} className="lg:col-span-1">
            <EventCalendar />
          </motion.div>

          {/* Tall feature spans both rows in the second column. */}
          <motion.div variants={revealVariants} className="lg:col-start-2 lg:row-span-2">
            <Tile item={JOURNAL[1]} className="h-full min-h-[300px] lg:min-h-[560px]" />
          </motion.div>

          <motion.div variants={revealVariants} className="lg:col-start-3">
            <Tile item={JOURNAL[2]} className="min-h-[190px] lg:min-h-[265px]" compact />
          </motion.div>

          <motion.div variants={revealVariants} className="lg:col-start-4">
            <Tile item={JOURNAL[3]} className="min-h-[190px] lg:min-h-[265px]" compact />
          </motion.div>

          <motion.div variants={revealVariants} className="lg:col-start-1 lg:row-start-2">
            <Tile item={JOURNAL[0]} className="min-h-[220px] lg:min-h-[283px]" />
          </motion.div>

          <motion.div
            variants={revealVariants}
            className="lg:col-start-3 lg:col-span-2 lg:row-start-2"
          >
            <Tile item={JOURNAL[4]} className="min-h-[220px] lg:min-h-[283px]" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

type TileProps = {
  item: JournalItem;
  className?: string;
  /** Compact tiles keep their caption on a scrim rather than below a gap. */
  compact?: boolean;
};

/**
 * One media card: artwork zooms on hover, the corner action fills, and the
 * caption lifts a couple of pixels. All three share one easing curve so
 * the card reads as a single object responding, not three animations.
 */
function Tile({ item, className = "", compact = false }: TileProps) {
  return (
    <a
      href="#journal"
      className={`group relative block overflow-hidden rounded-2xl bg-[#0b0b0d] ${className}`}
      style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.07)" }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 scale-[1.01] transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.09]">
          <ArtTile id={item.id} tone={item.tone} />
        </div>
      </div>

      {/* Caption scrim — deeper on compact tiles, where text sits over art. */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: compact ? "62%" : "52%",
          background:
            "linear-gradient(to top, rgba(4,4,5,0.94) 0%, rgba(4,4,5,0.72) 38%, rgba(4,4,5,0) 100%)",
        }}
      />

      <span className="absolute top-3.5 right-3.5 flex h-7 w-7 items-center justify-center rounded-lg bg-black/45 text-white/75 backdrop-blur transition-all duration-300 group-hover:bg-white group-hover:text-black">
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="M3 9L9 3M9 3H4.2M9 3v4.8"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      <div
        className="absolute inset-x-0 bottom-0 p-4 transition-transform duration-500 group-hover:-translate-y-0.5"
        style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
      >
        <span className="block text-[9.5px] tracking-[0.18em] text-white/55 uppercase">
          {item.kicker}
        </span>
        <span className="mt-1.5 block text-[13px] leading-[1.32] text-white">
          {item.title}
        </span>
        {/* Underline wipe, matching the reference's link affordance. */}
        <span
          className="mt-2 block h-px w-0 bg-white/45 transition-[width] duration-500 group-hover:w-10"
          style={{ transitionTimingFunction: `cubic-bezier(${EASE_EXPO.join(",")})` }}
        />
      </div>
    </a>
  );
}
