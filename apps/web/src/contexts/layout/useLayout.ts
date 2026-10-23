import { useContext } from "react";
// Context
import { LayoutContext, type LayoutContextValue } from "./LayoutContext";

export function useLayout(): LayoutContextValue {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error("useLayout must be used inside <LayoutProvider>");
  return ctx;
}
