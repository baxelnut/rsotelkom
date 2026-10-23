import { useCallback, useSyncExternalStore } from "react";

/** Matches the 768px "tablet and up" breakpoint used in layout.css */
export const DESKTOP_QUERY = "(min-width: 768px)";

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (notify: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", notify);
      return () => mql.removeEventListener("change", notify);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export function useIsDesktop(): boolean {
  return useMediaQuery(DESKTOP_QUERY);
}
