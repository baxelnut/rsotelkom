import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
// Context & Hooks
import { useIsDesktop } from "@/hooks";
import { LayoutContext, type LayoutContextValue } from "./LayoutContext";

const COLLAPSE_KEY = "sidebar-collapsed";

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === "1";
  } catch {
    return false;
  }
}

export function LayoutProvider({ children }: { children: ReactNode }) {
  const isDesktop = useIsDesktop();
  const [collapsedPref, setCollapsedPref] = useState(readCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [wasDesktop, setWasDesktop] = useState(isDesktop);

  // Crossing into desktop closes the drawer (state adjusted during render)
  if (wasDesktop !== isDesktop) {
    setWasDesktop(isDesktop);
    if (isDesktop) setMobileOpen(false);
  }

  // Each mode only applies on its own breakpoint, so no resize listeners
  const isCollapsed = isDesktop && collapsedPref;
  const isMobileMenuOpen = !isDesktop && mobileOpen;

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsedPref ? "1" : "0");
    } catch {
      /* storage unavailable */
    }
  }, [collapsedPref]);

  // Drawer open: lock page scroll, close on Escape
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isMobileMenuOpen]);

  const toggleSidebar = useCallback(() => {
    if (isDesktop) setCollapsedPref((prev) => !prev);
    else setMobileOpen((prev) => !prev);
  }, [isDesktop]);

  const setCollapsed = useCallback(
    (collapsed: boolean) => setCollapsedPref(collapsed),
    [],
  );
  const closeMobileMenu = useCallback(() => setMobileOpen(false), []);

  const value = useMemo<LayoutContextValue>(
    () => ({
      isDesktop,
      isCollapsed,
      isMobileMenuOpen,
      toggleSidebar,
      setCollapsed,
      closeMobileMenu,
    }),
    [
      isDesktop,
      isCollapsed,
      isMobileMenuOpen,
      toggleSidebar,
      setCollapsed,
      closeMobileMenu,
    ],
  );

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  );
}
