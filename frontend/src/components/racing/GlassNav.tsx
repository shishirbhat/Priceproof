import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { NAV_ITEMS } from "./data";
import { DUR, EASE_EXPO, SPRING_SNAP } from "./tokens";

type Props = {
  /** Hidden while the detail overlay owns the screen. */
  hidden?: boolean;
};

/**
 * The floating glass navigation.
 *
 * It is centred and free-floating over the hero, and gains weight —
 * background opacity, blur, a hairline border — once the page scrolls, so
 * it stays legible over light content further down.
 */
export function GlassNav({ hidden = false }: Props) {
  const [active, setActive] = useState<string>("Cars");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      className="pointer-events-none fixed inset-x-0 top-0 z-40 px-4 pt-4 sm:px-6 sm:pt-5"
      initial={{ y: -28, opacity: 0 }}
      animate={{ y: hidden ? -80 : 0, opacity: hidden ? 0 : 1 }}
      transition={{ duration: DUR.panel, ease: EASE_EXPO }}
    >
      <nav className="relative mx-auto flex max-w-[1600px] items-center justify-between">
        {/* Wordmark — hidden on the hero, revealed once scrolled. */}
        <motion.a
          href="#top"
          className="pointer-events-auto hidden select-none leading-[1.05] md:block"
          animate={{ opacity: scrolled ? 1 : 0 }}
          transition={{ duration: DUR.base, ease: EASE_EXPO }}
        >
          <span className="block text-[11px] font-semibold tracking-[0.34em] text-white/90">
            PORSCHE
          </span>
          <span className="block text-[8px] tracking-[0.30em] text-white/45">
            MOTORSPORT
          </span>
        </motion.a>

        {/* Desktop pill. Absolutely centred so the wordmark can't shift it. */}
        <div
          className="pointer-events-auto absolute left-1/2 hidden -translate-x-1/2 md:block"
          onMouseLeave={() => setActive("Cars")}
        >
          <div
            className="flex items-center gap-0.5 rounded-full p-1 backdrop-blur-xl transition-colors duration-300"
            style={{
              background: scrolled ? "rgba(14,14,16,0.82)" : "rgba(18,18,20,0.55)",
              boxShadow: scrolled
                ? "inset 0 0 0 1px rgba(255,255,255,0.09), 0 8px 30px rgba(0,0,0,0.45)"
                : "inset 0 0 0 1px rgba(255,255,255,0.06)",
            }}
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item}
                type="button"
                onMouseEnter={() => setActive(item)}
                onFocus={() => setActive(item)}
                className="relative rounded-full px-3.5 py-1.5 text-[12.5px] text-white/70 outline-none transition-colors duration-200 hover:text-white focus-visible:text-white"
              >
                {/* One shared indicator that slides between items. */}
                {active === item && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-white/10"
                    transition={SPRING_SNAP}
                  />
                )}
                <span className="relative z-10">{item}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mobile trigger. */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-label="Open navigation"
          className="pointer-events-auto flex items-center gap-2 rounded-full bg-[rgba(18,18,20,0.7)] px-3.5 py-2 text-[12px] text-white/80 backdrop-blur-xl md:hidden"
          style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)" }}
        >
          <span className="flex flex-col gap-[3px]">
            <span className="block h-px w-3.5 bg-white/70" />
            <span className="block h-px w-3.5 bg-white/70" />
          </span>
          Menu
        </button>

        {/* Locale switch. */}
        <button
          type="button"
          className="pointer-events-auto ml-auto flex items-center gap-1.5 rounded-full bg-[rgba(18,18,20,0.7)] px-3 py-2 text-[11.5px] tracking-wide text-white/80 backdrop-blur-xl transition-colors duration-200 hover:text-white md:ml-0"
          style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)" }}
        >
          <GlobeIcon />
          INT
        </button>
      </nav>

      {/* Mobile sheet. */}
      <motion.div
        className="pointer-events-auto mx-auto mt-2 max-w-[1600px] overflow-hidden md:hidden"
        initial={false}
        animate={{ height: menuOpen ? "auto" : 0, opacity: menuOpen ? 1 : 0 }}
        transition={{ duration: DUR.base, ease: EASE_EXPO }}
      >
        <div
          className="rounded-2xl bg-[rgba(14,14,16,0.9)] p-2 backdrop-blur-xl"
          style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)" }}
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item}
              href="#top"
              onClick={() => setMenuOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-[14px] text-white/80 transition-colors hover:bg-white/5 hover:text-white"
            >
              {item}
            </a>
          ))}
        </div>
      </motion.div>
    </motion.header>
  );
}

function GlobeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 12h18" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}
