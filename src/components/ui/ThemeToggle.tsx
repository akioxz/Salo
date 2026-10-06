"use client";

import { useTheme } from "@/components/ThemeProvider";
import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return <div className="w-8 h-8" />;
  }

  return (
    <button
      onClick={() => {
        const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
        setTheme(isDark ? "light" : "dark");
      }}
      className="bg-black/5 dark:bg-white/10 text-zinc-600 dark:text-zinc-300 rounded-full h-8 w-8 flex items-center justify-center transition-transform hover:scale-95 active:scale-90"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
}
