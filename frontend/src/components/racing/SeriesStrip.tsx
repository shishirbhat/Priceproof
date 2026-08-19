import { motion } from "motion/react";
import { MODELS } from "./data";
import { REVEAL_VIEWPORT, STAGGER, revealVariants } from "./tokens";

const SERIES = MODELS.map((m) => ({
  id: m.id,
  name: m.series,
  car: m.name,
  klass: m.klass,
  accent: m.paint.accent,
}));

/**
 * The championship strip.
 *
 * A four-up row of series cards that fills its accent bar on hover. Kept
 * deliberately typographic — it sits between two heavy media sections and
 * needs to breathe.
 */
export function SeriesStrip() {
  return (
    <section id="series" className="border-t border-white/8 bg-[#050506] px-4 py-20 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1400px]">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={REVEAL_VIEWPORT}
          variants={revealVariants}
        >
          <span className="block text-[10px] tracking-[0.28em] text-white/40 uppercase">
            Championships
          </span>
          <h2 className="mt-2.5 max-w-xl text-[26px] leading-[1.12] font-light tracking-tight text-white sm:text-[34px]">
            Four programmes, one engineering department.
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={REVEAL_VIEWPORT}
          transition={{ staggerChildren: STAGGER }}
          className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          {SERIES.map((s) => (
            <motion.a
              key={s.id}
              href="#series"
              variants={revealVariants}
              className="group relative flex min-h-[168px] flex-col justify-between overflow-hidden rounded-2xl bg-[#0b0b0d] p-5 transition-colors duration-300 hover:bg-[#101013]"
              style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.07)" }}
            >
              {/* Accent bar wipes across the top edge on hover. */}
              <span
                className="absolute inset-x-0 top-0 h-[2px] w-0 transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full"
                style={{ background: s.accent }}
              />
              <span className="text-[9.5px] tracking-[0.2em] text-white/40 uppercase">
                {s.car}
              </span>
              <span>
                <span className="block text-[15px] leading-[1.25] text-white">{s.name}</span>
                <span className="mt-1.5 block text-[11px] text-white/45">{s.klass}</span>
              </span>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
