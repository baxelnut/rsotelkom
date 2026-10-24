import type { ReportBucketFilter } from "@rso/shared";

export const REPORT_KATEGORI = [
  "PROV. COMPLETE",
  "PROVIDE ORDER",
  "IN PROCESS",
  "READY TO BILL",
  "BILLING COMPLETED",
] as const;

export const DEFAULT_KATEGORI: string[] = [
  "PROVIDE ORDER",
  "IN PROCESS",
  "READY TO BILL",
];

export const IN_PROCESS = "IN PROCESS";
export const ACTION_COLUMNS = ["status", "notes"];
export const PAGE_SIZE_DEFAULT = 50;

export const WITEL_ORDER = [
  "NUSA TENGGARA",
  "SURAMADU",
  "JATIM BARAT",
  "BALI",
  "JATIM TIMUR",
];

export const BUCKET_LABEL: Record<ReportBucketFilter, string> = {
  lt2: "<2 BLN",
  warning: "Warning (20 to 60 days)",
  gt2: ">2 BLN",
  all: "All ages",
};

export const STATUS_TONE: Record<string, string> = {
  Lanjut: "safe",
  Cancel: "danger",
  "Bukan Order Reg": "secondary",
};
