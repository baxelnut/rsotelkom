import type { Order } from "@rso/shared";
// Config
import { ORDER_SHEET_COLUMNS } from "@/config/orderColumns";
import { ADMIN_ONLY_COLUMNS, NEGATIVE_SUBTYPES } from "@/config/overview";
// Types
import type { SheetSpec } from "@/types/workbook";

const EMPTY_WITELS = ["NULL", "#N/A", "#N/A ()"];

export function normalizeWitel(value: string | null | undefined): string {
  const text = (value ?? "").trim();
  return !text || EMPTY_WITELS.includes(text.toUpperCase()) ? "N/A" : text;
}

export function reportRevenue(order: Order): number {
  const value = Number(order.revenue) || 0;
  const subtype = (order.order_subtype2 ?? "").trim().toUpperCase();
  return NEGATIVE_SUBTYPES.includes(subtype) ? -value : value;
}

export function stripAdminColumns(
  order: Order,
  isAdmin: boolean,
  keep: string[] = [],
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(order).filter(
      ([key]) =>
        isAdmin || keep.includes(key) || !ADMIN_ONLY_COLUMNS.includes(key),
    ),
  );
}

export function toReportRow(
  order: Order,
  isAdmin: boolean,
  keep: string[] = [],
): Record<string, unknown> {
  return {
    ...stripAdminColumns(order, isAdmin, keep),
    new_witel: normalizeWitel(order.new_witel),
    revenue: reportRevenue(order),
  };
}

export function buildOrdersSheet(orders: Order[], isAdmin: boolean): SheetSpec {
  return {
    name: "Orders",
    csv: true,
    columns: ORDER_SHEET_COLUMNS.filter(
      ({ key }) => isAdmin || !ADMIN_ONLY_COLUMNS.includes(key),
    ),
    rows: orders.map((order) => toReportRow(order, isAdmin)),
  };
}
