import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatTileProps {
  label: string;
  value: ReactNode;
  tone?: "neutral" | "violation" | "genuine" | "drift";
  hint?: string;
  className?: string;
}

const TONE_TEXT: Record<NonNullable<StatTileProps["tone"]>, string> = {
  neutral: "text-foreground",
  violation: "text-severity-violation",
  genuine: "text-severity-genuine",
  drift: "text-severity-drift",
};

export function StatTile({ label, value, tone = "neutral", hint, className }: StatTileProps) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between gap-3 rounded-xl border border-border bg-card p-4",
        className,
      )}
    >
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className={cn("font-mono text-3xl font-semibold tabular-nums", TONE_TEXT[tone])}>
        {value}
      </span>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  );
}
