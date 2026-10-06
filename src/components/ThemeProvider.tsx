"use client";

import * as React from "react";

type Theme = "dark" | "light" | "system";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  enableSystem?: boolean;
  attribute?: string; // we assume "class"
  disableTransitionOnChange?: boolean;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeProviderContext = React.createContext<ThemeProviderState | undefined>(
  undefined
);

const emptySubscribe = () => () => {};

export function ThemeProvider({
  children,
  defaultTheme = "system",
  enableSystem = true,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme);
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  React.useEffect(() => {
    try {
      const savedTheme = window.localStorage.getItem("theme") as Theme | null;
      if (savedTheme) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setThemeState(savedTheme);
      } else if (enableSystem) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setThemeState("system");
      }
    } catch {}
  }, [enableSystem]);

  React.useEffect(() => {
    if (!mounted) return;

    const applyTheme = (targetTheme: Theme) => {
      const root = window.document.documentElement;
      
      if (disableTransitionOnChange) {
        root.classList.add("[&_*]:!transition-none");
      }

      root.classList.remove("light", "dark");

      if (targetTheme === "system" && enableSystem) {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
        root.classList.add(systemTheme);
      } else {
        if (targetTheme !== "system") {
          root.classList.add(targetTheme);
        }
      }

      if (disableTransitionOnChange) {
        window.setTimeout(() => {
          root.classList.remove("[&_*]:!transition-none");
        }, 0);
      }
    };

    applyTheme(theme);
    
    // Save to local storage
    try {
      window.localStorage.setItem("theme", theme);
    } catch {}
  }, [theme, mounted, enableSystem, disableTransitionOnChange]);

  // Listen for system theme changes
  React.useEffect(() => {
    if (!mounted || theme !== "system" || !enableSystem) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(mediaQuery.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, mounted, enableSystem]);

  const setTheme = React.useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
