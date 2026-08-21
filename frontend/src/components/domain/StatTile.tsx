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

const TONE_TEXT: Record<NonNullable<StatTileProps["tone"]>, string> = {
  neutral: "text-label-1",
  hot: "text-hot",
  violation: "text-severity-violation",
  genuine: "text-severity-genuine",
  drift: "text-severity-drift",
};

const TONE_CHIP: Record<NonNullable<StatTileProps["tone"]>, string> = {
  neutral: "bg-surface-3 text-label-2",
  hot: "bg-hot/15 text-hot",
  violation: "bg-severity-violation/15 text-severity-violation",
  genuine: "bg-severity-genuine/15 text-severity-genuine",
  drift: "bg-severity-drift/15 text-severity-drift",
};

/**
 * The KPI readout.
 *
 * A big light numeral with a small uppercase unit beside it, an icon in a
 * tinted chip, and a raised card under it — the shape every one of the
 * references uses for a headline figure. The previous version was a flat
 * square plate with a 10px mono label, which is why a row of six of them read
 * as a spreadsheet header rather than an instrument cluster.
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DUR.base, delay, ease: EASE_EXPO }}
      className={cn(
        "panel-interactive group relative flex flex-col justify-between gap-5 overflow-hidden p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="label-mono text-label-2">{label}</span>
        {icon && (
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-300",
              TONE_CHIP[tone],
            )}
          >
            {icon}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className={cn("readout", TONE_TEXT[tone])}>
          {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
        </span>
        {unit ? <span className="readout-unit">{unit}</span> : null}
      </div>

      {hint ? <span className="text-[12px] leading-snug text-label-3">{hint}</span> : null}

      {/* Accent rule wipes the bottom edge on hover. */}
      <span
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 transition-transform duration-[660ms] ease-[cubic-bezier(0.66,0,0.01,1)] group-hover:scale-x-100",
          tone === "neutral" ? "bg-hot" : "bg-current",
        )}
      />
    </motion.div>
  );
}
