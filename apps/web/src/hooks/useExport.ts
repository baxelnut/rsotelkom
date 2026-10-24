import { useState } from "react";
// Config
import type { ExportFormat } from "@/config/overview";
// Types
import type { SheetSpec } from "@/types/workbook";
// Utils
import { downloadBlob } from "@/utils/download";
import { buildCsv, buildXlsx, rowsToSheet } from "@/utils/workbook";

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportSheets = async (
    format: ExportFormat,
    sheets: SheetSpec[],
    filename: string,
  ) => {
    if (sheets.length === 0) return;
    setIsExporting(true);
    try {
      if (format === "csv") {
        const sheet = sheets.find((item) => item.csv) ?? sheets[0];
        downloadBlob(buildCsv(sheet), `${filename}.csv`);
        return;
      }
      downloadBlob(await buildXlsx(sheets), `${filename}.xlsx`);
    } finally {
      setIsExporting(false);
    }
  };

  const exportRows = async (
    format: ExportFormat,
    rows: Record<string, unknown>[],
    filename: string,
  ) => {
    if (rows.length === 0) return;
    await exportSheets(format, [rowsToSheet(rows)], filename);
  };

  return { exportSheets, exportRows, isExporting };
}
