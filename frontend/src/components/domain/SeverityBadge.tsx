import { cn } from "@/lib/utils";
import type { IntegrityVerdict } from "@/lib/api";

const STYLES: Record<IntegrityVerdict, string> = {
  GENUINE: "bg-severity-genuine/15 text-severity-genuine border-severity-genuine/30",
  INFLATED: "bg-severity-violation/15 text-severity-violation border-severity-violation/30",
  INSUFFICIENT_HISTORY: "bg-severity-drift/15 text-severity-drift border-severity-drift/30",
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
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        STYLES[verdict],
      )}
    >
      {LABELS[verdict]}
    </span>
  );
}
