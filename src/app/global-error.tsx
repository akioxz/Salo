"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <html>
      <body className="bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white dark:bg-[#111111] p-8 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 text-center">
          <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black tracking-tight mb-2">May Problema</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8 text-sm">
            May hindi inaasahang error na nangyari. Subukang i-refresh ang app.
          </p>
          <button
            onClick={() => reset()}
            className="w-full bg-[#111111] dark:bg-white text-white dark:text-[#111111] hover:bg-black dark:hover:bg-zinc-200 font-bold py-3.5 px-6 rounded-xl transition-colors"
          >
            I-refresh
          </button>
        </div>
      </body>
    </html>
  );
}
