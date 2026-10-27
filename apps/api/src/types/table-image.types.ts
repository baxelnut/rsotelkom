export type Align = "left" | "right" | "center";

export interface TableSpec {
  title: string;
  subtitle: string;
  columns: { header: string; align?: Align }[];
  rows: string[][];
  footer?: string[];
}

export interface Badge {
  fill: string;
  color: string;
}

export interface GridCell {
  text: string;
  sub?: string; // revenue line
  warn?: string; // warning count -> amber pill
  color?: string;
  fill?: string;
  bold?: boolean;
  badge?: Badge; // pill (achievement)
}

export interface GridRow {
  cells: GridCell[];
  fill: string;
  color: string;
  bold?: boolean;
  warnColor?: string;
}

export interface HeadCell {
  text: string;
  col: number;
  row: number;
  colSpan?: number;
  rowSpan?: number;
  color?: string;
  underline?: string;
}

export interface GridSpec {
  title: string;
  subtitle: string;
  cols: number;
  headRows: number;
  head: HeadCell[];
  rows: GridRow[];
}
