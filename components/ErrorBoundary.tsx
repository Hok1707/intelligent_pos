
import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
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
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-md w-full text-center">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Something went wrong
            </h2>
            
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              We apologize for the inconvenience. Please try refreshing the page or return to the dashboard.
            </p>
            
            <div className="flex space-x-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw size={18} className="mr-2" />
                Reload Page
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex items-center px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                <Home size={18} className="mr-2" />
                Home
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-8 text-left p-4 bg-said slate-100 dark:bg-slate-900 rounded-lg overflow-auto max-h-40 text-xs text-red-600 font-mono">
                {this.state.error.toString()}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
