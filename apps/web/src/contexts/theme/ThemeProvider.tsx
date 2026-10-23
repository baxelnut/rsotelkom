import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
// Context
import { ThemeContext } from "./ThemeContext";
import type { Theme, ThemeContextValue } from "./ThemeContext";

const STORAGE_KEY = "theme";

/** Saved choice first, then the OS preference */
function readInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* storage unavailable */
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);

  // styles/tokens.css switches palettes on body.dark
  useEffect(() => {
    document.body.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* storage unavailable */
    }
  }, [theme]);

  const setIsDarkMode = useCallback(
    (dark: boolean) => setTheme(dark ? "dark" : "light"),
    [],
  );
  const toggleTheme = useCallback(
    () => setTheme((prev) => (prev === "dark" ? "light" : "dark")),
    [],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, isDarkMode: theme === "dark", setIsDarkMode, toggleTheme }),
    [theme, setIsDarkMode, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
