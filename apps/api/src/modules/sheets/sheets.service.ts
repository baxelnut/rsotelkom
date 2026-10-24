import { env } from "../../config/env";
import { throwIfError } from "../../lib/db";
import { AppError } from "../../lib/errors";
import { supabaseAdmin } from "../../lib/supabase";
import { readColumn, readHeaderAndRow, updateCells } from "./sheets.client";
import { ORDER_SELECT } from "./sheets.columns";
import { toText } from "./sheets.parse";

export const SUMMARY_VIEWS = {
  "process-status": "v_status_by_witel",
  "subtype-revenue": "v_subtype_revenue_by_witel",
  segmen: "v_segmen_by_witel",
  "segmen-subtype2": "v_segmen_subtype2",
  "order-subtype2": "v_order_subtype2_by_witel",
  "segmen-simplified": "v_segmen_simplified",
  "kategori-simplified": "v_kategori_simplified",
} as const;

export type SummaryName = keyof typeof SUMMARY_VIEWS;

export interface OrderFilters {
  page: number;
  limit: number;
  kategori?: string;
  witel?: string;
  pic?: string;
  status?: string;
  minAge?: number;
  maxAge?: number;
}

export async function listOrders(f: OrderFilters) {
  const from = (f.page - 1) * f.limit;

  let query = supabaseAdmin
    .from("orders")
    .select(ORDER_SELECT, { count: "exact" })
    .order("sheet_row")
    .range(from, from + f.limit - 1);

  if (f.kategori) query = query.eq("kategori", f.kategori);
  if (f.witel) query = query.eq("new_witel", f.witel);
  if (f.pic) query = query.eq("pic", f.pic);
  if (f.status) query = query.eq("status", f.status);
  if (f.minAge !== undefined) query = query.gte("umur_order", f.minAge);
  if (f.maxAge !== undefined) query = query.lte("umur_order", f.maxAge);

  const { data, count, error } = await query;
  throwIfError(error, "orders list");
  return { rows: data ?? [], total: count ?? 0 };
}

export async function getSummary(name: SummaryName) {
  const { data, error } = await supabaseAdmin
    .from(SUMMARY_VIEWS[name])
    .select("*")
    .order("new_witel");
  throwIfError(error, `summary ${name}`);
  return data ?? [];
}

export async function listPo() {
  const { data, error } = await supabaseAdmin
    .from("po_contacts")
    .select("data")
    .order("po_name");
  throwIfError(error, "po list");
  return (data ?? []).map((r) => r.data);
}

const FIELD_HEADER = { status: "STATUS", notes: "NOTES", log: "LOG" } as const;
type Field = keyof typeof FIELD_HEADER;

export type OrderPatch = Partial<Record<Field, string>>;

async function locateRow(sheet: string, uuid: string, hint: number | null) {
  const { headers, row } = await readHeaderAndRow(sheet, hint ?? 2);
  const uuidCol = headers.indexOf("UUID");
  if (uuidCol === -1) throw new Error("UUID column missing in sheet");

  if (hint && toText(row[uuidCol]) === uuid) return { headers, row: hint };

  const column = await readColumn(sheet, uuidCol);
  const idx = column.findIndex((v) => toText(v) === uuid);
  if (idx === -1)
    throw AppError.notFound("Order no longer exists in the sheet");
  return { headers, row: idx + 1 };
}

export async function updateOrder(uuid: string, patch: OrderPatch) {
  const { data: current, error } = await supabaseAdmin
    .from("orders")
    .select("sheet_row")
    .eq("uuid", uuid)
    .maybeSingle();
  throwIfError(error, "orders lookup");
  if (!current) throw AppError.notFound("Order not found");

  const sheet = env.ORDERS_SHEET_NAME;
  const located = await locateRow(sheet, uuid, current.sheet_row);

  const fields = (Object.keys(FIELD_HEADER) as Field[]).filter(
    (f) => patch[f] !== undefined,
  );

  const updates = fields.map((f) => {
    const col = located.headers.indexOf(FIELD_HEADER[f]);
    if (col === -1)
      throw new Error(`${FIELD_HEADER[f]} column missing in sheet`);
    return { col, row: located.row, value: patch[f] as string };
  });
  await updateCells(sheet, updates);

  const dbPatch: Record<string, string | number | null> = {
    sheet_row: located.row,
  };
  for (const f of fields) dbPatch[f] = toText(patch[f]);

  const { data, error: updateError } = await supabaseAdmin
    .from("orders")
    .update(dbPatch)
    .eq("uuid", uuid)
    .select(ORDER_SELECT)
    .single();
  throwIfError(updateError, "orders update");
  return data;
}
