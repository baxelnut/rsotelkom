import { useState } from "react";
// Config
import type { ExportFormat } from "@/config/overview";
// Utils
import { downloadBlob } from "@/utils/download";

export function useExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportRows = async (
    format: ExportFormat,
    rows: Record<string, unknown>[],
    filename: string,
  ) => {
    if (rows.length === 0) return;
    setIsExporting(true);
    try {
      const XLSX = await import("xlsx");
      const sheet = XLSX.utils.json_to_sheet(rows);

      if (format === "csv") {
        downloadBlob(
          new Blob([XLSX.utils.sheet_to_csv(sheet)], {
            type: "text/csv;charset=utf-8;",
          }),
          `${filename}.csv`,
        );
        return;
      }

      const book = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(book, sheet, "Report");
      const buffer = XLSX.write(book, { bookType: "xlsx", type: "array" });
      downloadBlob(
        new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        `${filename}.xlsx`,
      );
    } finally {
      setIsExporting(false);
    }
  };

  return { exportRows, isExporting };
}
