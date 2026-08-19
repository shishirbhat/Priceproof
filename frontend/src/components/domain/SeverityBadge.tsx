import { cn } from "@/lib/utils";
import type { MarketVerdict } from "@/lib/api";

const STYLES: Record<MarketVerdict, string> = {
  GOOD_DEAL:
    "bg-severity-genuine/10 text-severity-genuine border-severity-genuine/25 shadow-[0_0_12px_-4px] shadow-severity-genuine/40",
  FAIR:
    "bg-muted-foreground/10 text-foreground border-white/[0.12]",
  OVERPRICED:
    "bg-severity-violation/10 text-severity-violation border-severity-violation/25 shadow-[0_0_12px_-4px] shadow-severity-violation/40",
  INSUFFICIENT_COMPARABLES:
    "bg-severity-drift/10 text-severity-drift border-severity-drift/25 shadow-[0_0_12px_-4px] shadow-severity-drift/40",
};

const DOT: Record<MarketVerdict, string> = {
  GOOD_DEAL: "bg-severity-genuine",
  FAIR: "bg-muted-foreground",
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
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        STYLES[verdict],
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", DOT[verdict])} />
      {LABELS[verdict]}
    </span>
  );
}
