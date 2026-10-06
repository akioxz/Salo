"use client";

import React from "react";

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400 border border-rose-200 dark:border-rose-900 m-4 flex flex-col gap-2">
          <h2 className="font-bold">May naganap na problema (Error)</h2>
          <p className="text-xs font-mono break-all">{this.state.error?.message}</p>
          <button
            type="button"
            className="mt-2 text-xs bg-rose-600 text-white px-4 py-2 rounded-lg font-bold self-start active:scale-95 transition-transform"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Subukang muli
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
