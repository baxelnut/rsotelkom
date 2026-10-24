import { useMemo, useState } from "react";
// Hooks
import { queryState } from "./queryState";
import { useSummary } from "./useSummary";
// Config
import { ALL, NEGATIVE_SUBTYPES, SUBTYPE_ORDER } from "@/config/overview";
// Utils
import { uniqueValues, withAllOption } from "@/utils/options";

export type SubtypeMetric = "quantity" | "revenue";

type ChartRow = Record<string, string | number>;

function rank(name: string) {
  const index = SUBTYPE_ORDER.indexOf(name);
  return index === -1 ? SUBTYPE_ORDER.length : index;
}

export function useSubtypeChart(metric: SubtypeMetric) {
  const query = useSummary("segmen-subtype2");
  const [witel, setWitel] = useState(ALL);
  const [segmen, setSegmen] = useState(ALL);
  const rows = query.data ?? undefined;

  const allSegmens = useMemo(
    () => uniqueValues(rows, (row) => row.segmen),
    [rows],
  );
  const witelOptions = useMemo(
    () => withAllOption(uniqueValues(rows, (row) => row.new_witel)),
    [rows],
  );
  const segmenOptions = useMemo(() => withAllOption(allSegmens), [allSegmens]);
  const segmens = segmen === ALL ? allSegmens : [segmen];

  const { data, stats } = useMemo(() => {
    const grouped = new Map<string, ChartRow>();
    const totals = new Map<string, number>();

    for (const row of rows ?? []) {
      if (witel !== ALL && row.new_witel !== witel) continue;
      if (segmen !== ALL && row.segmen !== segmen) continue;

      const name = row.sub_type2 || "UNKNOWN";
      const raw = Number(row[metric]) || 0;
      const value =
        metric === "revenue" && NEGATIVE_SUBTYPES.includes(name) ? -raw : raw;
      const seriesKey = row.segmen || "UNKNOWN";

      const entry = grouped.get(name) ?? { name };
      entry[seriesKey] = (Number(entry[seriesKey]) || 0) + value;
      grouped.set(name, entry);
      totals.set(name, (totals.get(name) ?? 0) + value);
    }

    const data = [...grouped.values()].sort(
      (a, b) => rank(String(a.name)) - rank(String(b.name)),
    );
    const stats = {
      total: [...totals.values()].reduce((sum, value) => sum + value, 0),
      count: data.length,
      top: [...totals.entries()]
        .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
        .slice(0, 2)
        .map(([name]) => name),
    };
    return { data, stats };
  }, [rows, witel, segmen, metric]);

  return {
    ...queryState(query),
    witel,
    setWitel,
    segmen,
    setSegmen,
    witelOptions,
    segmenOptions,
    chartData: data,
    segmens,
    summary: stats,
  };
}

export type SubtypeChartApi = ReturnType<typeof useSubtypeChart>;
