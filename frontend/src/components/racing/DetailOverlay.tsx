import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArtTile } from "./ArtTile";
import type { CarModel } from "./data";
import { DUR, EASE_EXPO, SPRING_PANEL } from "@/lib/motion";

type Props = {
  model: CarModel;
  open: boolean;
  onClose: () => void;
};

/** Cards rise in sequence once the scrim has established itself. */
const card = {
  hidden: { opacity: 0, y: 22, scale: 0.985 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ...SPRING_PANEL, delay: 0.06 + i * 0.06 },
  }),
  exit: { opacity: 0, y: 12, transition: { duration: 0.2, ease: EASE_EXPO } },
};

/**
 * The model detail overlay.
 *
 * Opens over the turntable as a full-bleed dark panel: specification table
 * on the left, a media tile top-right, and series / news cards beneath.
 * Focus is trapped while open and Escape closes it.
 */
export function DetailOverlay({ model, open, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    restoreFocus.current = document.activeElement as HTMLElement;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      // Trap tab focus inside the panel.
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button, a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Move focus in on the next frame, once the panel has mounted.
    const t = requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLElement>("button")?.focus();
    });

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      cancelAnimationFrame(t);
      restoreFocus.current?.focus();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DUR.base, ease: EASE_EXPO }}
          role="dialog"
          aria-modal="true"
          aria-label={`${model.title} details`}
        >
          {/* The scrim carries a wash of the model's accent, which is what
              makes each car's overlay feel like a different room. */}
          <motion.div
            className="fixed inset-0"
            style={{
              background: `radial-gradient(120% 90% at 50% 0%, ${model.paint.accent}22 0%, #08080a 58%, #050506 100%)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DUR.panel, ease: EASE_EXPO }}
          />

          <div ref={panelRef} className="relative min-h-full px-4 pt-16 pb-8 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-[1400px]">
              <div className="mb-4 flex justify-end">
                <motion.button
                  type="button"
                  onClick={onClose}
                  aria-label="Close details"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/70 backdrop-blur transition-colors duration-200 hover:bg-white/20 hover:text-white"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ ...SPRING_PANEL, delay: 0.05 }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                    <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </motion.button>
              </div>

              {/* Two columns on desktop, stacked below lg. The left column
                  is fixed-ish width; the media column takes the remainder. */}
              <div className="grid gap-3 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
                <motion.section
                  custom={0}
                  variants={card}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="relative flex flex-col rounded-2xl bg-[#0b0b0d] p-5 sm:p-6"
                  style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.07)" }}
                >
                  <CornerLink label={`Open ${model.title} model page`} />
                  <h2 className="text-[30px] leading-none font-light tracking-tight text-white">
                    {model.title}
                  </h2>
                  <p className="mt-3.5 text-[11.5px] leading-[1.62] text-white/55">
                    {model.blurb}
                  </p>

                  <dl className="mt-6">
                    {model.specs.map((spec) => (
                      <div
                        key={spec.label}
                        className="grid grid-cols-[minmax(70px,auto)_1fr] gap-4 border-t border-white/10 py-3"
                      >
                        <dt className="text-[10.5px] text-white/45">{spec.label}</dt>
                        <dd className="text-right text-[10.5px] leading-[1.55] text-white/85">
                          {spec.value}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-auto flex items-end justify-between pt-8 text-[9.5px] text-white/22">
                    <span>{model.footnoteLeft}</span>
                    <span>{model.footnoteRight}</span>
                  </div>
                </motion.section>

                <div className="grid content-start gap-3">
                  {/* Media tile — an autoplaying loop in the reference. */}
                  <motion.div
                    custom={1}
                    variants={card}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="group relative aspect-[16/7] overflow-hidden rounded-2xl bg-black"
                    style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.07)" }}
                  >
                    <div className="absolute inset-0 scale-[1.02] transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]">
                      <ArtTile id={`${model.id}-hero`} tone={[model.paint.base, model.paint.accent]} />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
                      <span className="text-[11px] tracking-[0.2em] text-white/80 uppercase">
                        {model.klass}
                      </span>
                      <PlayBadge />
                    </div>
                  </motion.div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <motion.section
                      custom={2}
                      variants={card}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="flex min-h-[190px] flex-col rounded-2xl bg-[#0b0b0d] p-5"
                      style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.07)" }}
                    >
                      <h3 className="text-[12.5px] text-white/85">Series</h3>
                      <a
                        href="#series"
                        className="group mt-auto flex items-center justify-between gap-3 rounded-xl bg-[#141417] px-4 py-3.5 transition-colors duration-200 hover:bg-[#1c1c20]"
                      >
                        <span className="text-[11.5px] text-white/85">{model.series}</span>
                        <ArrowBadge />
                      </a>
                    </motion.section>

                    <motion.section
                      custom={3}
                      variants={card}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="relative flex min-h-[190px] flex-col rounded-2xl bg-[#0b0b0d] p-5"
                      style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.07)" }}
                    >
                      <CornerLink label="Open the latest news" />
                      <h3 className="text-[12.5px] text-white/85">Latest News</h3>
                      <div className="mt-auto">
                        <p className="text-[11.5px] leading-[1.45] font-medium text-white">
                          {model.news.title}
                        </p>
                        <p className="mt-2 text-[10.5px] leading-[1.55] text-white/50">
                          {model.news.body}
                        </p>
                      </div>
                    </motion.section>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** The small square arrow button pinned to a card's top-right corner. */
function CornerLink({ label }: { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-lg bg-[#17171a] text-white/60 transition-all duration-200 hover:bg-[#232327] hover:text-white"
    >
      <ArrowGlyph />
    </button>
  );
}

function ArrowBadge() {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#232327] text-white/70 transition-all duration-200 group-hover:bg-white group-hover:text-black">
      <ArrowGlyph />
    </span>
  );
}

function ArrowGlyph() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M3 9L9 3M9 3H4.2M9 3v4.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlayBadge() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition-transform duration-300 group-hover:scale-110">
      <svg width="9" height="10" viewBox="0 0 9 10" fill="currentColor" aria-hidden="true">
        <path d="M0 0l9 5-9 5z" />
      </svg>
    </span>
  );
}
