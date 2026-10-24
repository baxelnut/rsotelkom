import { useEffect, useState } from "react";
// Contexts
import { useTheme } from "@/contexts/theme";

export function useForceLightTheme() {
  const { isDarkMode, setIsDarkMode } = useTheme();
  const [initial] = useState(isDarkMode);

  useEffect(() => {
    setIsDarkMode(false);
    return () => setIsDarkMode(initial);
  }, [initial, setIsDarkMode]);
}
