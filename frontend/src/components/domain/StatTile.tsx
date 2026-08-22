import type { ReactNode } from "react";
import { motion } from "motion/react";
import { DUR, EASE_EXPO } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "./AnimatedNumber";

interface StatTileProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tone?: "neutral" | "hot" | "violation" | "genuine" | "drift";
  hint?: string;
  /** Small uppercase unit riding beside the figure, e.g. "listings". */
  unit?: string;
  className?: string;
  delay?: number;
}

/** Tone colours a status dot beside the label — never the figure. */
const TONE_DOT: Record<NonNullable<StatTileProps["tone"]>, string | null> = {
  neutral: null,
  hot: null,
  violation: "bg-severity-violation",
  genuine: "bg-severity-genuine",
  drift: "bg-severity-drift",
};

/**
 * The KPI readout.
 *
 * Two registers. The quiet tiles are strictly monochrome — figure in
 * label-1, status carried by a small dot beside the label and nothing else —
 * because colouring every numeral by tone gave the row six figures in five
 * colours with no legend, and the colour then carried no information.
 *
 * Exactly one tile per screen runs `hot`: the live headline. That one earns
 * the accent — an orange figure, a pulsing live dot, corner brackets and a
 * flowing accent rail along its base — so the eye lands on it first. This is
 * the "energy dashboard" register the brief asked for, kept to a single tile
 * so it reads as emphasis rather than decoration, and built entirely from
 * transform/opacity animation so it composites and never touches raster.
 */
export function StatTile({
  label,
  value,
  icon,
  tone = "neutral",
  hint,
  unit,
  className,
  delay = 0,
}: StatTileProps) {
  const isHot = tone === "hot";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DUR.base, delay, ease: EASE_EXPO }}
      className={cn(
        // One rhythm for every tile: label row, figure, optional hint.
        "stat-tile group relative flex flex-col gap-3 overflow-hidden p-4",
        isHot ? "stat-tile-hot" : "panel-interactive",
        className,
      )}
    >
      {isHot && (
        <>
          <span className="stat-corner stat-corner-tl" aria-hidden />
          <span className="stat-corner stat-corner-br" aria-hidden />
        </>
      )}

      <div className="flex items-center justify-between gap-3">
        <span className="label-mono flex items-center gap-2 text-label-2">
          {isHot ? (
            <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden>
              <span className="stat-ping absolute inline-flex h-full w-full rounded-full bg-hot" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-hot" />
            </span>
          ) : (
            TONE_DOT[tone] && (
              <span className={cn("h-1 w-1 shrink-0 rounded-full", TONE_DOT[tone])} />
            )
          )}
          {label}
        </span>
        {icon && (
          <span className={cn("shrink-0", isHot ? "text-hot" : "text-label-4")}>{icon}</span>
        )}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className={cn("readout", isHot ? "text-hot" : "text-label-1")}>
          {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
        </span>
        {unit ? <span className="readout-unit">{unit}</span> : null}
      </div>

      {hint ? (
        <span className="mt-auto text-[12px] leading-snug text-label-3">{hint}</span>
      ) : null}

      {isHot && (
        <span className="stat-flow" aria-hidden>
          <span className="stat-flow-run" />
        </span>
      )}
    </motion.div>
  );
}
