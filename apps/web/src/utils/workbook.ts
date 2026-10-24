// Types
import type { SheetColumn, SheetSpec } from "@/types/workbook";
// Utils
import { formatLabel } from "@/utils/format";

const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const BRAND_ARGB = "FFE81E28";

const NUMBER_FORMATS: Record<NonNullable<SheetColumn["format"]>, string> = {
  integer: "#,##0",
  money: "#,##0;[Red]-#,##0",
};

export function rowsToSheet(
  rows: Record<string, unknown>[],
  name = "Report",
): SheetSpec {
  return {
    name,
    rows,
    csv: true,
    columns: Object.keys(rows[0] ?? {}).map((key) => ({
      key,
      header: formatLabel(key),
      width: 18,
    })),
  };
}

export async function buildXlsx(sheets: SheetSpec[]): Promise<Blob> {
  const { default: ExcelJS } = await import("exceljs");
  const book = new ExcelJS.Workbook();

  for (const sheet of sheets) {
    const ws = book.addWorksheet(sheet.name, {
      views: [{ state: "frozen", ySplit: 1 }],
    });

    ws.columns = sheet.columns.map((column) => ({
      header: column.header,
      key: column.key,
      width: column.width ?? 16,
      style: column.format
        ? {
            numFmt: NUMBER_FORMATS[column.format],
            alignment: { horizontal: "right" as const },
          }
        : {},
    }));
    ws.addRows(sheet.rows);

    const header = ws.getRow(1);
    header.height = 26;
    header.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: BRAND_ARGB },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
    });

    ws.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: sheet.rows.length + 1, column: sheet.columns.length },
    };

    if (sheet.footer) {
      const footer = ws.addRow(sheet.footer);
      footer.font = { bold: true };
      footer.eachCell((cell) => {
        cell.border = { top: { style: "thin" } };
      });
    }
  }

  const buffer = await book.xlsx.writeBuffer();
  return new Blob([buffer], { type: XLSX_MIME });
}

export function buildCsv(sheet: SheetSpec): Blob {
  const escape = (value: unknown) => {
    const text = value === null || value === undefined ? "" : String(value);
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };

  const lines = [
    sheet.columns.map((column) => escape(column.header)).join(","),
    ...sheet.rows.map((row) =>
      sheet.columns.map((column) => escape(row[column.key])).join(","),
    ),
  ];
  return new Blob(["\ufeff" + lines.join("\r\n")], {
    type: "text/csv;charset=utf-8;",
  });
}
