import type { CSSProperties } from "react";

export const SEGMEN_COLORS: Record<string, string> = {
  Government: "#FDB827",
  "Private Service": "#C70A80",
  "State-Owned Enterprise Service": "#54B435",
  Regional: "#247881",
};

export const DEFAULT_SERIES_COLOR = "var(--clr-primary)";

export const SERIES_COLORS = [
  "#e76705",
  "#5cb338",
  "#2DAA9E",
  "#D91656",
  "#7C4585",
];

export const CHART_TICK = { fontSize: 12, fill: "var(--clr-ink-soft)" };
export const CHART_GRID_STROKE = "var(--clr-border-strong)";
export const CHART_LEGEND_STYLE: CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: "14px",
  color: "var(--clr-ink)",
  lineHeight: 1,
};

export function seriesColor(index: number): string {
  return SERIES_COLORS[index % SERIES_COLORS.length];
}

/** Segment color, else `fallback` (e.g. the color Recharts assigned), else primary */
export function getSegmenColor(
  name: string | number | undefined,
  fallback?: string,
): string {
  const known = name === undefined ? undefined : SEGMEN_COLORS[String(name)];
  return known ?? fallback ?? DEFAULT_SERIES_COLOR;
}
