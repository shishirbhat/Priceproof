import { cn } from "@/lib/utils";

/**
 * Every seeded row must be visibly labeled — never let generated demo
 * history read as a real scrape. Deliberately understated (not a loud
 * warning color) since it's disclosure, not an error state.
 */
export function SeededBadge({ isSeeded, className }: { isSeeded: boolean; className?: string }) {
  if (!isSeeded) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground",
        className,
      )}
    >
      Simulated history
    </span>
  );
}
