import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { animate } from "animejs";

/**
 * Brief branded intro before the hero appears — the Prime Security "100%"
 * loading-screen pattern. Kept short (~1.1s) and skippable in spirit: it
 * only ever blocks the very first paint of /welcome, never re-shows on
 * client-side navigation back to it, and respects prefers-reduced-motion
 * by skipping straight through.
 */
export function Preloader({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      onDone();
      return;
    }
    const counter = { n: 0 };
    const animation = animate(counter, {
      n: 100,
      duration: 1000,
      ease: "inOutQuad",
      onUpdate: () => setPct(Math.round(counter.n)),
      onComplete: () => {
        setExiting(true);
        setTimeout(onDone, 500);
      },
    });
    return () => {
      animation.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimatePresence>
      {!exiting || pct < 100 ? (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
        >
          <div className="absolute inset-0 opacity-[0.15]" style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }} />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative flex flex-col items-center gap-3"
          >
            <span className="font-mono text-[6rem] font-bold leading-none tracking-tighter text-foreground tabular-nums">
              {pct}%
            </span>
            <span className="font-mono text-xs tracking-widest text-muted-foreground">
              LOADING PRICEPROOF
            </span>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
