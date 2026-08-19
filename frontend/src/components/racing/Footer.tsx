import { motion } from "motion/react";
import { REVEAL_VIEWPORT, STAGGER, revealVariants } from "./tokens";

const COLUMNS = [
  { title: "Racing", links: ["Series", "Calendar", "Results", "Standings"] },
  { title: "Cars", links: ["963", "99X Electric", "911 GT3 R", "911 Cup"] },
  { title: "Teams", links: ["Factory squad", "Customer teams", "Drivers", "Junior programme"] },
  { title: "More", links: ["Journal", "Heritage", "Careers", "Contact"] },
];

export function Footer() {
  return (
    <footer className="border-t border-white/8 bg-[#050506] px-4 py-14 sm:px-6 lg:px-10">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={REVEAL_VIEWPORT}
        transition={{ staggerChildren: STAGGER }}
        className="mx-auto max-w-[1400px]"
      >
        <motion.div variants={revealVariants} className="flex flex-wrap items-end justify-between gap-8">
          <div className="leading-[1.05]">
            <span className="block text-[13px] font-semibold tracking-[0.34em] text-white">
              PORSCHE
            </span>
            <span className="block text-[9px] tracking-[0.30em] text-white/45">
              MOTORSPORT
            </span>
          </div>
          <a
            href="#top"
            className="group flex items-center gap-2 text-[12px] text-white/55 transition-colors hover:text-white"
          >
            Back to top
            <span className="transition-transform duration-300 group-hover:-translate-y-0.5">↑</span>
          </a>
        </motion.div>

        <div className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-4">
          {COLUMNS.map((col) => (
            <motion.div key={col.title} variants={revealVariants}>
              <h3 className="text-[10px] tracking-[0.22em] text-white/40 uppercase">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#top"
                      className="text-[12.5px] text-white/70 transition-colors duration-200 hover:text-white"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          variants={revealVariants}
          className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-white/8 pt-6 text-[10.5px] text-white/35"
        >
          <span>
            An independent front-end reference implementation. Not affiliated with, endorsed
            by, or connected to Dr. Ing. h.c. F. Porsche AG.
          </span>
          <span>© {new Date().getFullYear()}</span>
        </motion.div>
      </motion.div>
    </footer>
  );
}
