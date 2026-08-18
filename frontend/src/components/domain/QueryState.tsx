import type { ReactNode } from "react";
import { AlertTriangle, Inbox, Loader2 } from "lucide-react";

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

interface QueryStateProps<T> {
  isLoading: boolean;
  error: unknown;
  data: T | undefined;
  isEmpty?: (data: T) => boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  loadingLabel?: string;
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
  children,
}: QueryStateProps<T>) {
  if (isLoading) return <LoadingState label={loadingLabel} />;
  if (error) return <ErrorState message={error instanceof Error ? error.message : "Something went wrong"} />;
  if (data === undefined) return null;
  if (isEmpty?.(data)) return <EmptyState title={emptyTitle} description={emptyDescription} />;
  return <>{children(data)}</>;
}
