export type Cell = string | number | boolean | null | undefined;
export type ColumnKind = "text" | "int" | "num" | "date";

export interface SheetRecord {
  sheetRow: number;
  values: Record<string, Cell>;
}

export const toText = (v: Cell): string | null => {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
};

export const toNum = (v: Cell): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n =
    typeof v === "number" ? v : Number(String(v).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : null;
};

const toInt = (v: Cell): number | null => {
  const n = toNum(v);
  return n === null ? null : Math.round(n);
};

// Sheets serial numbers, with a fallback for M/D/YYYY text.
const toDate = (v: Cell): string | null => {
  if (typeof v === "number") {
    if (v <= 0) return null;
    return new Date(Math.round((v - 25569) * 86_400_000))
      .toISOString()
      .slice(0, 10);
  }
  const s = toText(v);
  if (!s) return null;
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
  if (!m) return null;
  const iso = `${m[3]}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;
  const dt = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(dt.getTime()) || dt.toISOString().slice(0, 10) !== iso
    ? null
    : iso;
};

export function coerce(kind: ColumnKind, v: Cell) {
  switch (kind) {
    case "int":
      return toInt(v);
    case "num":
      return toNum(v);
    case "date":
      return toDate(v);
    default:
      return toText(v);
  }
}

export function toRecords(
  headers: string[],
  rows: Cell[][],
  firstDataRow: number,
): SheetRecord[] {
  const out: SheetRecord[] = [];
  rows.forEach((row, i) => {
    if (row.every((c) => toText(c) === null)) return;
    const values: Record<string, Cell> = {};
    headers.forEach((h, idx) => {
      if (h) values[h] = row[idx];
    });
    out.push({ sheetRow: firstDataRow + i, values });
  });
  return out;
}

export function missingHeaders(headers: string[], required: string[]) {
  const present = new Set(headers);
  return required.filter((h) => !present.has(h));
}

export function columnLetter(index: number): string {
  let letter = "";
  let i = index;
  while (i >= 0) {
    letter = String.fromCharCode((i % 26) + 65) + letter;
    i = Math.floor(i / 26) - 1;
  }
  return letter;
}
