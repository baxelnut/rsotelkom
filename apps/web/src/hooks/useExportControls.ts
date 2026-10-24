import { useState } from "react";
// Hooks
import { useExport } from "./useExport";
// Config
import { EXPORT_OPTIONS, type ExportFormat } from "@/config/overview";
// Types
import type { SheetSpec } from "@/types/workbook";

export function useExportControls() {
  const [format, setFormat] = useState<ExportFormat>("xlsx");
  const { exportRows, exportSheets, isExporting } = useExport();

  return {
    format,
    setFormat: (value: string) => setFormat(value as ExportFormat),
    options: EXPORT_OPTIONS,
    isExporting,
    run: (rows: Record<string, unknown>[], filename: string) =>
      exportRows(format, rows, filename),
    runSheets: (sheets: SheetSpec[], filename: string) =>
      exportSheets(format, sheets, filename),
  };
}

export type ExportControlsApi = ReturnType<typeof useExportControls>;
