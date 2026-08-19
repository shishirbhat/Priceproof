import type { ReactNode } from "react";
import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-dashed border-border p-8 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}…
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-severity-violation/30 bg-severity-violation/10 p-8 text-sm text-severity-violation">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-10 text-center">
      <Inbox className="h-5 w-5 text-muted-foreground" />
      <div className="text-sm font-medium text-foreground">{title}</div>
      {description ? (
        <div className="max-w-sm text-xs text-muted-foreground">{description}</div>
      ) : null}
    </div>
  );
}

export function ListRowSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <ul className="divide-y divide-border">
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="flex items-center justify-between gap-3 py-2.5">
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </li>
      ))}
    </ul>
  );
}

export function TileGridSkeleton({ tiles = 6 }: { tiles?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      {Array.from({ length: tiles }, (_, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-12" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }, (_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return <Skeleton className="h-64 w-full rounded-lg" />;
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
