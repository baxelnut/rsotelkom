import { useMemo } from "react";
// Hooks
import { queryState } from "./queryState";
import { useExportControls } from "./useExportControls";
import { useLastSynced } from "./useLastSynced";
import { useGalaksiSummary } from "./useReports";
// Utils
import { makeFilename } from "@/utils/download";
import { buildGalaksi, buildGalaksiSheet } from "@/utils/galaksi";

export function useGalaksiReport() {
  const query = useGalaksiSummary();
  const lastSyncedAt = useLastSynced();
  const exporter = useExportControls();

  const { rows, grand } = useMemo(
    () => buildGalaksi(query.data ?? []),
    [query.data],
  );

  return {
    ...queryState(query),
    rows,
    grand,
    lastSyncedAt,
    exportProps: {
      format: exporter.format,
      options: exporter.options,
      onFormatChange: exporter.setFormat,
      onExport: () =>
        exporter.runSheets(
          [buildGalaksiSheet(rows, grand)],
          makeFilename("GALAKSI"),
        ),
      loading: exporter.isExporting,
      disabled: rows.length === 0,
    },
  };
}

export type GalaksiReportApi = ReturnType<typeof useGalaksiReport>;
