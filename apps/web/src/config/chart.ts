/** Chart colors per customer segment. Keys must match the series `name`. */
export const SEGMEN_COLORS: Record<string, string> = {
  Government: "#FDB827",
  "Private Service": "#C70A80",
  "State-Owned Enterprise Service": "#54B435",
  Regional: "#247881",
};

export const DEFAULT_SERIES_COLOR = "var(--clr-primary)";

/** Segment color, else `fallback` (e.g. the color Recharts assigned), else primary */
export function getSegmenColor(
  name: string | number | undefined,
  fallback?: string,
): string {
  const known = name === undefined ? undefined : SEGMEN_COLORS[String(name)];
  return known ?? fallback ?? DEFAULT_SERIES_COLOR;
}
