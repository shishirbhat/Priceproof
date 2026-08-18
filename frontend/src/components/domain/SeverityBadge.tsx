import { cn } from "@/lib/utils";
import type { IntegrityVerdict } from "@/lib/api";

const STYLES: Record<IntegrityVerdict, string> = {
  GENUINE:
    "bg-severity-genuine/10 text-severity-genuine border-severity-genuine/25 shadow-[0_0_12px_-4px] shadow-severity-genuine/40",
  INFLATED:
    "bg-severity-violation/10 text-severity-violation border-severity-violation/25 shadow-[0_0_12px_-4px] shadow-severity-violation/40",
  INSUFFICIENT_HISTORY:
    "bg-severity-drift/10 text-severity-drift border-severity-drift/25 shadow-[0_0_12px_-4px] shadow-severity-drift/40",
};

const DOT: Record<IntegrityVerdict, string> = {
  GENUINE: "bg-severity-genuine",
  INFLATED: "bg-severity-violation",
  INSUFFICIENT_HISTORY: "bg-severity-drift",
};

const LABELS: Record<IntegrityVerdict, string> = {
  GENUINE: "Genuine",
  INFLATED: "Inflated",
  INSUFFICIENT_HISTORY: "Insufficient history",
};

export function SeverityBadge({ verdict }: { verdict: IntegrityVerdict }) {
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
