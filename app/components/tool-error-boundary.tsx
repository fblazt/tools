import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "~/components/ui/button";

interface Props {
  children: ReactNode;
  toolName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ToolErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[ToolErrorBoundary] ${this.props.toolName ?? "Tool"} crashed:`, error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
          <AlertTriangle className="h-10 w-10 text-destructive" />
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            {this.props.toolName ?? "This tool"} encountered an unexpected error.
          </p>
          {this.state.error && (
            <pre className="text-xs text-muted-foreground bg-muted rounded p-3 max-w-md overflow-auto">
              {this.state.error.message}
            </pre>
          )}
          <Button onClick={this.handleReset}>Try again</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
