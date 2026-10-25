import type { ActionCounts, ActionRow } from "@rso/shared";
import type { Order, StatusByWitel } from "@rso/shared";
// Config
import { ACTION_STATUSES, ALERT_LABEL, OVERDUE_DAYS } from "@/config/action";
import { STATUS_COLOR, STATUS_FIELD, WARNING_MIN_DAYS } from "@/config/action";
import { ALL } from "@/config/overview";

export interface ActionTableRow {
  key: string;
  name: string;
  witel: string;
  counts: ActionCounts;
  total: number;
}

export interface ActionTableData {
  rows: ActionTableRow[];
  totals: ActionCounts;
  total: number;
  witel: string | undefined;
}

export interface WitelCard {
  witel: string;
  total: number;
  slices: { name: string; value: number; color: string }[];
}

const sum = (counts: ActionCounts) =>
  ACTION_STATUSES.reduce((total, status) => total + counts[status], 0);

export function buildActionTable(
  report: ActionRow[],
  bucket: "lt2" | "gt2",
  witel: string,
): ActionTableData {
  const rows = report
    .filter((row) => witel === ALL || (row.witel || "N/A") === witel)
    .map(
      (row, index): ActionTableRow => ({
        key: `${row.po_name}|${row.witel}|${index}`,
        name: row.po_name,
        witel: row.witel || "N/A",
        counts: row[bucket],
        total: sum(row[bucket]),
      }),
    );

  const totals = Object.fromEntries(
    ACTION_STATUSES.map((status) => [
      status,
      rows.reduce((total, row) => total + row.counts[status], 0),
    ]),
  ) as ActionCounts;

  return {
    rows,
    totals,
    total: sum(totals),
    witel: witel === ALL ? undefined : witel,
  };
}

export function buildWitelCards(rows: StatusByWitel[]): WitelCard[] {
  return rows.map((row) => {
    const slices = ACTION_STATUSES.map((status) => ({
      name: status,
      value: Number(row[STATUS_FIELD[status]]) || 0,
      color: STATUS_COLOR[status],
    }));
    return {
      witel: row.new_witel || "N/A",
      total: slices.reduce((total, slice) => total + slice.value, 0),
      slices,
    };
  });
}

export function alertOf(order: Order): string {
  const days = order.umur_order ?? 0;
  const warning = days >= WARNING_MIN_DAYS && days <= OVERDUE_DAYS;
  return warning ? ALERT_LABEL.segera : ALERT_LABEL.aman;
}
