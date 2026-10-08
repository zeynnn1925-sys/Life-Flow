import React, { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public handleReload = () => {
    try {
      window.location.reload();
    } catch {
      this.handleReset();
    }
  };

  public render(): ReactNode {
    const { children, fallback } = this.props;
    if (this.state.hasError) {
      if (fallback) return fallback;

      let errorMessage = this.state.error?.message || 'Terjadi kesalahan sistem yang tidak terduga.';
      try {
        const parsed = JSON.parse(errorMessage);
        if (parsed?.error) {
          errorMessage = parsed.error;
        }
      } catch {
        // Not a JSON string
      }

      return (
        <div className="min-h-screen w-full bg-canvas text-ink flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-surface-1 border border-hairline rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-danger/10 text-danger border border-danger/20 flex items-center justify-center mb-5">
              <AlertCircle className="w-7 h-7" />
            </div>

            <h2 className="text-lg font-bold text-ink tracking-tight mb-2">
              Terjadi Kendala Memuat Layar
            </h2>

            <p className="text-xs text-ink-subtle leading-relaxed mb-4 max-w-sm">
              Aplikasi mendeteksi kendala pada antarmuka. Tenang, data keuangan dan catatan Anda tetap aman di cloud.
            </p>

            <div className="w-full bg-surface-2 border border-hairline rounded-lg p-3 mb-6 text-left overflow-x-auto max-h-32">
              <code className="text-[11px] text-danger font-mono font-medium break-all whitespace-pre-wrap">
                {errorMessage}
              </code>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 w-full">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 h-10 px-4 bg-accent text-white rounded-lg text-xs font-bold hover:bg-accent/90 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                <span>Muat Ulang Halaman</span>
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="h-10 px-4 bg-surface-2 text-ink hover:bg-surface-3 border border-hairline rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Coba Lagi</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
