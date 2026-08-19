import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Without this, a single bad render anywhere in the tree white-screens the
 * whole app — no page in a data-dense dashboard should be able to take the
 * rest of the nav down with it.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("Render error:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-severity-violation/30 bg-severity-violation/10 p-10 text-center">
          <AlertTriangle className="h-6 w-6 text-severity-violation" />
          <div className="text-sm font-medium text-foreground">Something went wrong rendering this page</div>
          <div className="max-w-md font-mono text-xs text-muted-foreground">{this.state.error.message}</div>
        </div>
      );
    }
    return this.props.children;
  }
}
