import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
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
            
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              We encountered an unexpected error. Please try refreshing the page or return to the dashboard.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full flex items-center justify-center px-4 py-3 bg-primary text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Page
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full flex items-center justify-center px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                Return Home
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-8 p-4 bg-slate-100 dark:bg-slate-900 rounded-lg text-left overflow-auto max-h-40">
                <p className="font-mono text-xs text-red-600 dark:text-red-400 break-words">
                  {this.state.error.toString()}
                </p>
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