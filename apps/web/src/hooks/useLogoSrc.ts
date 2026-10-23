import { useCallback } from "react";
// Context
import { useTheme } from "@/contexts/theme";

// Custom hook to get logo source based on theme & screen size
export function useLogoSrc() {
  const { isDarkMode } = useTheme();

  const getLogoSrc = useCallback(() => {
    return window.innerWidth >= 768
      ? isDarkMode
        ? "/telkom-big-reverse.svg"
        : "/telkom-big.svg"
      : isDarkMode
        ? "/telkom-reverse.svg"
        : "/favicon.svg";
  }, [isDarkMode]);

  return getLogoSrc;
}
