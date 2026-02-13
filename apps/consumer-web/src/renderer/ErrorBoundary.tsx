import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  fallback?: ReactNode;
  sectionId?: string;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class SectionErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      `[SDUI] Section ${this.props.sectionId ?? "unknown"} error:`,
      error,
      errorInfo,
    );
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Failed to render section
          {this.props.sectionId ? ` "${this.props.sectionId}"` : ""}
        </div>
      );
    }
    return this.props.children;
  }
}
