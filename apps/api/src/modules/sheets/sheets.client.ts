import { env } from "../../config/env";
import { sheetsApi } from "../../lib/google";
import { columnLetter, type Cell } from "./sheets.parse";

const quote = (name: string) => `'${name.replace(/'/g, "''")}'`;
const headerCells = (cells: Cell[]) => cells.map((c) => String(c ?? "").trim());

export async function readTab(sheetName: string, headerRow: number) {
  const res = await sheetsApi.spreadsheets.values.get({
    spreadsheetId: env.SPREADSHEET_ID,
    range: quote(sheetName),
    valueRenderOption: "UNFORMATTED_VALUE",
    dateTimeRenderOption: "SERIAL_NUMBER",
  });
  const values = (res.data.values ?? []) as Cell[][];
  return {
    headers: headerCells(values[headerRow - 1] ?? []),
    rows: values.slice(headerRow),
  };
}

export async function readHeaderAndRow(sheetName: string, row: number) {
  const q = quote(sheetName);
  const res = await sheetsApi.spreadsheets.values.batchGet({
    spreadsheetId: env.SPREADSHEET_ID,
    ranges: [`${q}!1:1`, `${q}!${row}:${row}`],
    valueRenderOption: "UNFORMATTED_VALUE",
  });
  const [head, body] = res.data.valueRanges ?? [];
  return {
    headers: headerCells((head?.values?.[0] ?? []) as Cell[]),
    row: (body?.values?.[0] ?? []) as Cell[],
  };
}

export async function readColumn(sheetName: string, colIndex: number) {
  const letter = columnLetter(colIndex);
  const res = await sheetsApi.spreadsheets.values.get({
    spreadsheetId: env.SPREADSHEET_ID,
    range: `${quote(sheetName)}!${letter}:${letter}`,
    valueRenderOption: "UNFORMATTED_VALUE",
  });
  return ((res.data.values ?? []) as Cell[][]).map((r) => r[0]);
}

export interface CellUpdate {
  col: number;
  row: number;
  value: string;
}

export async function updateCells(sheetName: string, updates: CellUpdate[]) {
  await sheetsApi.spreadsheets.values.batchUpdate({
    spreadsheetId: env.SPREADSHEET_ID,
    requestBody: {
      valueInputOption: "RAW",
      data: updates.map((u) => ({
        range: `${quote(sheetName)}!${columnLetter(u.col)}${u.row}`,
        values: [[u.value]],
      })),
    },
  });
}
