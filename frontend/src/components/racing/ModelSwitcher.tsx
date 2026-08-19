import { motion } from "motion/react";
import { MODELS } from "./data";
import { DUR, EASE_EXPO, SPRING_SNAP } from "./tokens";

type Props = {
  activeId: string;
  onSelect: (id: string) => void;
  onExplore: () => void;
  hidden?: boolean;
};

/**
 * The bottom-anchored model switcher.
 *
 * Two pill groups: the model list, whose selected item carries a sliding
 * indicator, and a separate "explore" action that opens the detail
 * overlay. They stay visually distinct because they do different things.
 */
export function ModelSwitcher({ activeId, onSelect, onExplore, hidden = false }: Props) {
  return (
    <motion.div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-5 sm:pb-7"
      initial={{ y: 34, opacity: 0 }}
      animate={{ y: hidden ? 90 : 0, opacity: hidden ? 0 : 1 }}
      transition={{ duration: DUR.panel, ease: EASE_EXPO, delay: hidden ? 0 : 0.25 }}
    >
      <div className="pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-2">
        <div
          className="flex items-center gap-0.5 overflow-x-auto rounded-full p-1 backdrop-blur-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{
            background: "rgba(14,14,16,0.82)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08), 0 10px 34px rgba(0,0,0,0.5)",
          }}
          role="tablist"
          aria-label="Select a car"
        >
          {MODELS.map((m) => {
            const selected = m.id === activeId;
            return (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => onSelect(m.id)}
                className={`relative shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] whitespace-nowrap outline-none transition-colors duration-200 focus-visible:ring-1 focus-visible:ring-white/40 ${
                  selected ? "text-white" : "text-white/60 hover:text-white/90"
                }`}
              >
                {selected && (
                  <motion.span
                    layoutId="model-pill"
                    className="absolute inset-0 rounded-full bg-white/[0.14]"
                    transition={SPRING_SNAP}
                  />
                )}
                <span className="relative z-10">{m.name}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onExplore}
          className="group flex shrink-0 items-center gap-2.5 rounded-full px-3.5 py-2 text-[12.5px] text-white/85 backdrop-blur-xl transition-colors duration-200 hover:text-white"
          style={{
            background: "rgba(14,14,16,0.82)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08), 0 10px 34px rgba(0,0,0,0.5)",
          }}
        >
          <GridIcon />
          Explore the details
        </button>
      </div>
    </motion.div>
  );
}

/** Four dots that spread apart slightly on hover of the parent button. */
function GridIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      {[
        [2, 2], [9, 2], [2, 9], [9, 9],
      ].map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r="1.5"
          fill="currentColor"
          className="origin-center transition-transform duration-300 group-hover:scale-110"
        />
      ))}
    </svg>
  );
}
