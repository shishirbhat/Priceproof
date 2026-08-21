import { cn } from "@/lib/utils";
import type { MarketVerdict } from "@/lib/api";

/**
 * The verdict chip. Square rather than pill, mono rather than sans, and
 * carrying a leading status square instead of a dot — a verdict is a
 * readout, not a tag. Colors come from the severity triad only, which is
 * why acid is kept out of data views entirely.
 */
const STYLES: Record<MarketVerdict, string> = {
  GOOD_DEAL:
    "bg-severity-genuine/10 text-severity-genuine shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--severity-genuine)_28%,transparent)]",
  FAIR: "bg-surface-2 text-label-2 shadow-[inset_0_0_0_1px_var(--hairline-strong)]",
  OVERPRICED:
    "bg-severity-violation/10 text-severity-violation shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--severity-violation)_28%,transparent)]",
  INSUFFICIENT_COMPARABLES:
    "bg-severity-drift/10 text-severity-drift shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--severity-drift)_28%,transparent)]",
};

const DOT: Record<MarketVerdict, string> = {
  GOOD_DEAL: "bg-severity-genuine",
  FAIR: "bg-label-3",
  OVERPRICED: "bg-severity-violation",
  INSUFFICIENT_COMPARABLES: "bg-severity-drift",
};

const LABELS: Record<MarketVerdict, string> = {
  GOOD_DEAL: "Good deal",
  FAIR: "Fair price",
  OVERPRICED: "Overpriced",
  INSUFFICIENT_COMPARABLES: "Insufficient comparables",
};

export function SeverityBadge({ verdict }: { verdict: MarketVerdict }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-sm px-2 py-1 font-mono text-[10px] tracking-[0.14em] uppercase",
        STYLES[verdict],
      )}
    >
      <span className={cn("h-1.5 w-1.5", DOT[verdict])} />
      {LABELS[verdict]}
    </span>
  );
}
