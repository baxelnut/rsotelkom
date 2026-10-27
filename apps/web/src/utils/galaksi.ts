import type { GalaksiPoRow } from "@rso/shared";
// Config
import { ACHIEVEMENT_LEVELS, type AchievementLevel } from "@/config/galaksi";
import { SESSION_KEYS } from "@/config/overview";
// Types
import type { SheetSpec } from "@/types/workbook";

export type GalaksiKey = (typeof SESSION_KEYS)[number];
export type GalaksiCounts = Record<GalaksiKey, number> & { total: number };

export interface GalaksiRow {
  name: string;
  counts: GalaksiCounts;
  level: AchievementLevel;
}

function levelFor(total: number): AchievementLevel {
  return (
    ACHIEVEMENT_LEVELS.find(({ max }) => total <= max) ??
    ACHIEVEMENT_LEVELS[ACHIEVEMENT_LEVELS.length - 1]
  );
}

export function buildGalaksi(rows: GalaksiPoRow[]) {
  const grand = {
    ao: 0,
    so: 0,
    do: 0,
    mo: 0,
    ro: 0,
    total: 0,
  } as GalaksiCounts;

  const list = rows.map((row): GalaksiRow => {
    const counts = { total: 0 } as GalaksiCounts;
    for (const key of SESSION_KEYS) {
      const value = Number(row[key]) || 0;
      counts[key] = value;
      counts.total += value;
      grand[key] += value;
    }
    grand.total += counts.total;
    return { name: row.po_name, counts, level: levelFor(counts.total) };
  });

  return { rows: list, grand };
}

export function buildGalaksiSheet(
  rows: GalaksiRow[],
  grand: GalaksiCounts,
): SheetSpec {
  return {
    name: "GALAKSI",
    csv: true,
    rows: rows.map(({ name, counts, level }) => ({
      name,
      ...counts,
      achievement: `${level.value}%`,
    })),
    footer: { name: "GRAND TOTAL", ...grand },
    columns: [
      { key: "name", header: "PO", width: 28 },
      ...SESSION_KEYS.map((key) => ({
        key,
        header: key.toUpperCase(),
        width: 9,
        format: "integer" as const,
      })),
      { key: "total", header: "Grand Total", width: 13, format: "integer" },
      { key: "achievement", header: "Achievement (%)", width: 16 },
    ],
  };
}
