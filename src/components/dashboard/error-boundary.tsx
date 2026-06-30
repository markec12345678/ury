'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component for graceful error handling in URY Dashboard.
 * Catches runtime errors in child components and displays a friendly fallback UI.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[URY ErrorBoundary]', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-[400px] p-6">
          <Card className="max-w-md w-full border-red-200 dark:border-red-800">
            <CardContent className="p-6 text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-3 rounded-full bg-red-50 dark:bg-red-900/20">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">
                  Nekaj je šlo narobe
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Prišlo je do napake pri prikazu te komponente. Poskusi znova ali osveži stran.
                </p>
              </div>
              {this.state.error && (
                <details className="text-left">
                  <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                    Podrobnosti napake
                  </summary>
                  <pre className="mt-2 text-xs bg-muted p-3 rounded-md overflow-auto max-h-[120px]">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
              <div className="flex gap-2 justify-center">
                <Button variant="outline" size="sm" onClick={this.handleRetry}>
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  Poskusi znova
                </Button>
                <Button variant="outline" size="sm" onClick={this.handleReload}>
                  Osveži stran
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Tab-specific error boundary with tab name in error message
 */
export function TabErrorBoundary({ tabName, children }: { tabName: string; children: React.ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error) => console.error(`[URY ${tabName} Tab Error]`, error)}
    >
      {children}
    </ErrorBoundary>
  );
}
