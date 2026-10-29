import type { Amount, ReportAlert, ReportBucketFilter } from "@rso/shared";

export type Tone = "safe" | "primary" | "secondary";
export type StatTone = Tone | "danger";

export interface ReportSelection {
  witel?: string;
  subtype?: string;
  kategori: string[];
  bucket: ReportBucketFilter;
  witels?: string[];
}

export interface MatrixColumn {
  id: string;
  label: string;
  bucket: ReportBucketFilter;
  kategori: string[];
  total: boolean;
  tone: Tone;
}

export interface MatrixCell {
  amount: Amount;
  warning: Amount | null;
}

export interface MatrixRow {
  key: string;
  kind: "grand" | "subtype" | "witel";
  label: string;
  subtype?: string;
  witel?: string;
  cells: MatrixCell[];
}

export interface ReportStat extends Amount {
  label: string;
  tone: StatTone;
}

export interface Matrix {
  columns: MatrixColumn[];
  rows: MatrixRow[];
  stats: ReportStat[];
}

export interface ReportSelection {
  witel?: string;
  subtype?: string;
  pic?: string;
  status?: string;
  alert?: ReportAlert;
  kategori: string[];
  bucket: ReportBucketFilter;
}

export type ActionSelect = Omit<ReportSelection, "kategori">;
