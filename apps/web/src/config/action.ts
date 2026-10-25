import type { ActionStatus, StatusByWitel } from "@rso/shared";

export const ACTION_STATUSES: ActionStatus[] = [
  "Lanjut",
  "Cancel",
  "Bukan Order Reg",
  "No Status",
];

export const EDITABLE_STATUSES = ACTION_STATUSES.filter(
  (status) => status !== "No Status",
);

export const STATUS_FIELD = {
  Lanjut: "lanjut",
  Cancel: "cancel",
  "Bukan Order Reg": "bukan_order_reg",
  "No Status": "no_status",
} as const satisfies Record<ActionStatus, keyof StatusByWitel>;

export const ACTION_TONE: Record<ActionStatus, string> = {
  Lanjut: "safe",
  Cancel: "danger",
  "Bukan Order Reg": "secondary",
  "No Status": "none",
};

export const STATUS_COLOR: Record<ActionStatus, string> = {
  Lanjut: "var(--clr-safe)",
  Cancel: "var(--clr-secondary)",
  "Bukan Order Reg": "var(--clr-danger)",
  "No Status": "var(--clr-ink-faint)",
};

export const ACTION_BUCKETS: { bucket: "lt2" | "gt2"; label: string }[] = [
  { bucket: "lt2", label: "<2 BLN" },
  { bucket: "gt2", label: ">2 BLN" },
];

export const ALERT_LABEL = { aman: "Aman", segera: "Segera Diproses" } as const;

export const WARNING_MIN_DAYS = 20;
export const OVERDUE_DAYS = 60;
