import { cn } from "@/lib/utils";
import type { MarketVerdict } from "@/lib/api";

/**
 * The verdict chip. A filled pill rather than a square outline — the
 * references treat a status as a solid, confident object, and a verdict is
 * the most important thing on a market-value row.
 */
const STYLES: Record<MarketVerdict, string> = {
  GOOD_DEAL: "bg-severity-genuine/15 text-severity-genuine ring-1 ring-severity-genuine/30",
  FAIR: "bg-surface-3 text-label-2 ring-1 ring-[var(--hairline-strong)]",
  OVERPRICED: "bg-severity-violation/15 text-severity-violation ring-1 ring-severity-violation/30",
  INSUFFICIENT_COMPARABLES: "bg-severity-drift/15 text-severity-drift ring-1 ring-severity-drift/30",
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
        "inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-[11.5px] font-medium tracking-[0.01em]",
        STYLES[verdict],
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", DOT[verdict])} />
      {LABELS[verdict]}
    </span>
  );
}
