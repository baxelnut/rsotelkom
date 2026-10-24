import { useMemo, useState } from "react";
// Hooks
import { queryState } from "./queryState";
import { useSummary } from "./useSummary";
// Config
import { seriesColor } from "@/config/chart";
import { ALL, SEGMEN_FIELDS } from "@/config/overview";
// Utils
import { formatLabel } from "@/utils/format";
import { uniqueValues, withAllOption } from "@/utils/options";

type RadarRow = Record<string, string | number>;

export function useSegmenRadar() {
  const query = useSummary("segmen-simplified");
  const [witel, setWitel] = useState(ALL);
  const rows = query.data ?? undefined;

  const witels = useMemo(
    () => uniqueValues(rows, (row) => row.new_witel),
    [rows],
  );
  const witelOptions = useMemo(() => withAllOption(witels), [witels]);

  const series = useMemo(
    () =>
      witels
        .filter((name) => witel === ALL || name === witel)
        .map((name) => ({ name, color: seriesColor(witels.indexOf(name)) })),
    [witels, witel],
  );

  const chartData = useMemo(
    () =>
      SEGMEN_FIELDS.map((field): RadarRow => {
        const row: RadarRow = { subject: formatLabel(field) };
        for (const item of rows ?? []) row[item.new_witel] = item[field] || 0;
        return row;
      }),
    [rows],
  );

  const radarMax = useMemo(
    () =>
      Math.max(
        0,
        ...(rows ?? []).flatMap((row) =>
          SEGMEN_FIELDS.map((field) => row[field] || 0),
        ),
      ),
    [rows],
  );

  const totals = useMemo(
    () =>
      SEGMEN_FIELDS.map((field) => ({
        label: formatLabel(field),
        value: (rows ?? [])
          .filter((row) => witel === ALL || row.new_witel === witel)
          .reduce((sum, row) => sum + (row[field] || 0), 0),
      })),
    [rows, witel],
  );

  return {
    ...queryState(query),
    witel,
    setWitel,
    witelOptions,
    series,
    chartData,
    radarMax,
    totals,
  };
}

export type SegmenRadarApi = ReturnType<typeof useSegmenRadar>;
