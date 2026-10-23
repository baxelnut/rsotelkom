import { createContext } from "react";

export interface LayoutContextValue {
  isDesktop: boolean;
  isCollapsed: boolean; /** Desktop only: sidebar shrunk to icons */
  isMobileMenuOpen: boolean; /** Mobile only: sidebar drawer is open */
  toggleSidebar: () => void; /** Collapses/expands on desktop, opens/closes the drawer on mobile */
  setCollapsed: (collapsed: boolean) => void;
  closeMobileMenu: () => void;
}

export const LayoutContext = createContext<LayoutContextValue | null>(null);
