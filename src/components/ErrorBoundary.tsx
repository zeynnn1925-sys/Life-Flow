import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    const { children } = this.props;
    if (this.state.hasError) {
      let errorMessage = this.state.error?.message || 'An unexpected error occurred.';
      try {
        const parsedError = JSON.parse(errorMessage);
        if (parsedError && parsedError.error) {
          errorMessage = parsedError.error;
        }
      } catch (e) {
        // Not a JSON string, use as is
      }

      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-surface-1 rounded-lg border border-hairline shadow-card">
          <div className="w-16 h-16 bg-danger/10 rounded-xl flex items-center justify-center text-danger mb-6 shadow-sm border border-danger/20">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-display-sm font-black text-ink tracking-tight uppercase mb-2">Something went wrong</h2>
          <p className="text-body-sm text-ink-subtle mb-8 max-w-md font-medium">
            The application encountered an unexpected error. Don't worry, your data is safe.
          </p>
          <div className="bg-surface-2 p-6 rounded-md border border-hairline mb-8 w-full max-w-lg overflow-auto text-left shadow-inner">
            <code className="text-xs text-danger font-mono font-bold leading-relaxed">
              {errorMessage}
            </code>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-3 px-8 h-14 bg-accent text-white rounded-pill font-black text-button uppercase tracking-widest hover:bg-accent-hover transition-all shadow-glow-accent active:scale-95"
          >
            <RefreshCcw className="w-5 h-5" />
            Reload Application
          </button>
        </div>
      );
    }

    return children;
  }
}
