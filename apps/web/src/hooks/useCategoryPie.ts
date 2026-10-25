import { useMemo, useState } from "react";
// Hooks
import { queryState } from "./queryState";
import { useSummary } from "./useSummary";
// Config
import { seriesColor } from "@/config/chart";
import {
  CATEGORY_ALL,
  CATEGORY_OPTIONS,
  KATEGORI_FIELDS,
  type KategoriField,
} from "@/config/overview";
// Utils
import { formatLabel } from "@/utils/format";

export function useCategoryPie() {
  const query = useSummary("kategori-simplified");
  const [category, setCategory] = useState<string>(CATEGORY_ALL);
  const [excluded, setExcluded] = useState<string[]>([]);

  const witels = useMemo(
    () =>
      (query.data ?? []).map((row, index) => ({
        name: row.new_witel,
        value:
          category === CATEGORY_ALL
            ? KATEGORI_FIELDS.reduce((sum, field) => sum + (row[field] || 0), 0)
            : row[category as KategoriField] || 0,
        fill: seriesColor(index),
        included: !excluded.includes(row.new_witel),
      })),
    [query.data, category, excluded],
  );

  const pieData = useMemo(
    () => witels.filter((item) => item.included),
    [witels],
  );

  const toggleWitel = (name: string) =>
    setExcluded((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );

  return {
    ...queryState(query),
    category,
    setCategory,
    categoryOptions: CATEGORY_OPTIONS,
    categoryLabel:
      category === CATEGORY_ALL ? "SEMUA" : formatLabel(category).toUpperCase(),
    witels,
    pieData,
    toggleWitel,
  };
}

export type CategoryPieApi = ReturnType<typeof useCategoryPie>;
