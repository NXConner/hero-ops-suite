import React from 'react';

interface ErrorBoundaryProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
  resetKey?: unknown;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // In real apps send this to logging infra
    console.error('ErrorBoundary caught an error', error);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="min-h-screen grid place-items-center p-6">
          <div className="max-w-md text-center space-y-3">
            <h1 className="text-2xl font-semibold">Something went wrong</h1>
            <p className="text-muted-foreground">Please refresh the page or try again.</p>
            <div className="flex items-center justify-center gap-2">
              <button className="px-4 py-2 rounded bg-primary text-primary-foreground" onClick={() => location.reload()}>Reload</button>
              <button className="px-4 py-2 rounded border" onClick={() => this.setState({ hasError: false })}>Try Again</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;