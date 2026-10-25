import type { KategoriSimplified, SegmenSimplified } from "@rso/shared";
import type { DropdownOption } from "@/components";
import { formatLabel } from "@/utils/format";

export const ALL = "ALL";

export const SUBTYPE_ORDER = ["AO", "SO", "DO", "MO", "RO"];
export const NEGATIVE_SUBTYPES = ["DO", "SO"];
export const SESSION_KEYS = ["ao", "so", "do", "mo", "ro"] as const;

export const SEGMEN_FIELDS = [
  "state_owned_enterprise_service",
  "government",
  "regional",
  "private_service",
  "enterprise",
] as const satisfies ReadonlyArray<
  Exclude<keyof SegmenSimplified, "new_witel">
>;

export const KATEGORI_FIELDS = [
  "billing_completed",
  "in_process",
  "prov_complete",
  "provide_order",
  "ready_to_bill",
] as const satisfies ReadonlyArray<
  Exclude<keyof KategoriSimplified, "new_witel">
>;
export type KategoriField = (typeof KATEGORI_FIELDS)[number];

export const CATEGORY_ALL = "all";
export const CATEGORY_OPTIONS: DropdownOption[] = [
  { value: CATEGORY_ALL, label: ALL },
  ...KATEGORI_FIELDS.map((field) => ({
    value: field,
    label: formatLabel(field),
  })),
];

export const ADMIN_ONLY_COLUMNS: string[] = [
  "uuid",
  "log",
  "fingerprint",
  "notes",
  "status",
  "sheet_row",
  "synced_at",
];

export const ROWS_PER_PAGE_OPTIONS: DropdownOption[] = [
  10, 20, 50, 100, 200, 500,
].map((value) => ({ value, label: `Tampilkan ${value} rows` }));

export type ExportFormat = "xlsx" | "csv";
export const EXPORT_OPTIONS: DropdownOption[] = [
  { value: "xlsx", label: "Excel" },
  { value: "csv", label: "CSV" },
];
