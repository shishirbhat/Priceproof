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
        <div
          className="flex flex-col items-center gap-4 rounded-lg bg-severity-violation/[0.07] p-12 text-center"
          style={{ boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--severity-violation) 30%, transparent)" }}
        >
          <AlertTriangle className="h-5 w-5 text-severity-violation" />
          <div className="label-mono text-severity-violation">Render error</div>
          <div className="display-4 max-w-md text-foreground">
            Something went wrong rendering this page
          </div>
          <div className="max-w-md font-mono text-[11.5px] leading-relaxed break-all text-label-3">
            {this.state.error.message}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
