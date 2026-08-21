import type { ReactNode } from "react";
import { motion } from "motion/react";
import { DUR, EASE_EXPO } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "./AnimatedNumber";

interface StatTileProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tone?: "neutral" | "violation" | "genuine" | "drift";
  hint?: string;
  className?: string;
  delay?: number;
  /** Two-digit ordinal printed in the tile's gutter. */
  index?: string;
}

const TONE_TEXT: Record<NonNullable<StatTileProps["tone"]>, string> = {
  neutral: "text-foreground",
  violation: "text-severity-violation",
  genuine: "text-severity-genuine",
  drift: "text-severity-drift",
};

const TONE_ICON: Record<NonNullable<StatTileProps["tone"]>, string> = {
  neutral: "text-label-3",
  violation: "text-severity-violation",
  genuine: "text-severity-genuine",
  drift: "text-severity-drift",
};

const TONE_BAR: Record<NonNullable<StatTileProps["tone"]>, string> = {
  neutral: "bg-electric",
  violation: "bg-severity-violation",
  genuine: "bg-severity-genuine",
  drift: "bg-severity-drift",
};

/**
 * The KPI readout — a data plate, not a card. Mono label above, oversized
 * light figure below, ordinal in the gutter, and a rule that wipes across
 * the top edge on hover. Tone is the only color, and it always means a
 * severity, never decoration.
 */
export function StatTile({
  label,
  value,
  icon,
  tone = "neutral",
  hint,
  className,
  delay = 0,
  index,
}: StatTileProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DUR.base, delay, ease: EASE_EXPO }}
      className={cn(
        "panel-interactive group relative flex flex-col justify-between gap-6 overflow-hidden rounded-sm p-4",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {index ? <span className="index-numeral text-label-4">{index}</span> : null}
          <span className="label-mono">{label}</span>
        </div>
        {icon && (
          <span className={cn("shrink-0 transition-colors duration-300", TONE_ICON[tone])}>
            {icon}
          </span>
        )}
      </div>

      <div>
        <span
          className={cn(
            "block text-[2.4rem] leading-[0.95] font-light tracking-[-0.04em] tabular-nums",
            TONE_TEXT[tone],
          )}
        >
          {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
        </span>
        {hint ? (
          <span className="mt-2 block font-mono text-[10px] tracking-[0.08em] text-label-3">
            {hint}
          </span>
        ) : null}
      </div>

      {/* Accent rule wipes the top edge on hover, on the house curve. */}
      <span
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-px w-0 transition-[width] duration-[660ms] ease-[cubic-bezier(0.66,0,0.01,1)] group-hover:w-full",
          TONE_BAR[tone],
        )}
      />
    </motion.div>
  );
}
