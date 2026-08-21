import { cn } from "@/lib/utils";

/**
 * Every seeded row must be visibly labeled — never let generated demo
 * history read as a real scrape. Deliberately understated (not a warning
 * color) since it's disclosure, not an error state: it uses the same mono
 * micro-label as every other piece of metadata, just with a dotted edge to
 * mark it as provenance rather than data.
 */
export function SeededBadge({ isSeeded, className }: { isSeeded: boolean; className?: string }) {
  if (!isSeeded) return null;
  return (
    <span
      className={cn(
        "label-mono-sm inline-flex items-center gap-1.5 rounded-sm border border-dashed border-[var(--hairline-strong)] px-1.5 py-1 text-label-3",
        className,
      )}
    >
      <span className="h-1 w-1 rounded-full bg-label-4" />
      Simulated
    </span>
  );
}
