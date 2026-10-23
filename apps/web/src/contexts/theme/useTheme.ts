import { useContext } from "react";
// Context
import { ThemeContext, type ThemeContextValue } from "./ThemeContext";

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
