export type CellFormat = "integer" | "money";

export interface SheetColumn {
  key: string;
  header: string;
  width?: number;
  format?: CellFormat;
}

export interface SheetSpec {
  name: string;
  columns: SheetColumn[];
  rows: Record<string, unknown>[];
  footer?: Record<string, unknown>;
  csv?: boolean;
}
