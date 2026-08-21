import type { ReactNode } from "react";
import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Query lifecycle surfaces.
 *
 * These are the states a data product actually spends most of its time in,
 * so they get the same design attention as the happy path: mono labels, the
 * hairline panel treatment, and a sweeping rule that makes "loading" read as
 * an instrument acquiring a signal rather than a spinner.
 */

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="panel relative flex items-center gap-3 overflow-hidden rounded-sm px-4 py-3.5">
      <Loader2 className="h-3.5 w-3.5 animate-spin text-label-3" />
      <span className="label-mono text-label-2">{label}</span>
      <span className="rule-sweep absolute inset-x-0 bottom-0 h-px bg-electric/50" />
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div
      className="flex items-center gap-3 rounded-sm bg-severity-violation/[0.07] px-4 py-3"
      style={{ boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--severity-violation) 30%, transparent)" }}
    >
      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-severity-violation" />
      <span className="label-mono text-severity-violation">Failed</span>
      <span className="min-w-0 truncate font-mono text-[11.5px] text-label-2">{message}</span>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div
      className="flex flex-col items-center gap-2.5 rounded-sm border border-dashed border-[var(--hairline-strong)] px-6 py-8 text-center"
    >
      <Inbox className="h-4 w-4 text-label-4" />
      <div className="label-mono text-label-2">{title}</div>
      {description ? (
        <div className="max-w-sm text-[12.5px] leading-relaxed text-label-3">{description}</div>
      ) : null}
    </div>
  );
}

export function ListRowSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <ul>
      {Array.from({ length: rows }, (_, i) => (
        <li
          key={i}
          className="rule-t flex items-center justify-between gap-3 py-3.5 first:shadow-none"
        >
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-40 rounded-sm" />
            <Skeleton className="h-2.5 w-24 rounded-sm" />
          </div>
          <Skeleton className="h-5 w-16 rounded-sm" />
        </li>
      ))}
    </ul>
  );
}

export function TileGridSkeleton({ tiles = 6 }: { tiles?: number }) {
  return (
    <div className="grid grid-cols-2 gap-px bg-[var(--hairline)] md:grid-cols-3 lg:grid-cols-6">
      {Array.from({ length: tiles }, (_, i) => (
        <div key={i} className="flex flex-col gap-6 bg-surface-1 p-4">
          <Skeleton className="h-2.5 w-20 rounded-sm" />
          <Skeleton className="h-9 w-14 rounded-sm" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }, (_, c) => (
            <Skeleton key={c} className="h-3.5 flex-1 rounded-sm" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return <Skeleton className="h-64 w-full rounded-sm" />;
}

interface QueryStateProps<T> {
  isLoading: boolean;
  error: unknown;
  data: T | undefined;
  isEmpty?: (data: T) => boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  loadingLabel?: string;
  /** Skeleton shape while loading — defaults to a plain spinner if omitted. */
  skeleton?: ReactNode;
  children: (data: T) => ReactNode;
}

export function QueryState<T>({
  isLoading,
  error,
  data,
  isEmpty,
  emptyTitle = "Nothing here yet",
  emptyDescription,
  loadingLabel,
  skeleton,
  children,
}: QueryStateProps<T>) {
  if (isLoading) return skeleton ? <>{skeleton}</> : <LoadingState label={loadingLabel} />;
  if (error) return <ErrorState message={error instanceof Error ? error.message : "Something went wrong"} />;
  if (data === undefined) return null;
  if (isEmpty?.(data)) return <EmptyState title={emptyTitle} description={emptyDescription} />;
  return <>{children(data)}</>;
}
