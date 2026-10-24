import { throwIfError } from "../../lib/db";
import { AppError } from "../../lib/errors";
import { supabaseAdmin } from "../../lib/supabase";
import type { AuthUser } from "../auth/auth.service";
import { ORDER_SELECT } from "../sheets/sheets.columns";

export type Bucket = "lt2" | "warning" | "gt2";
export type Scope = "all" | "warning";

export const WARNING_MIN_DAYS = 20;
export const OVERDUE_DAYS = 60;

const IN_PROCESS_KEY = "INPROCESS";

const kategoriKey = (v: string) => v.replace(/\s+/g, "").toUpperCase();
export const picKey = (v: string) =>
  v.trim().replace(/\s+/g, " ").toUpperCase();

export interface OrderRow {
  uuid: string;
  order_id: string | null;
  order_subtype: string | null;
  new_witel: string | null;
  pic: string | null;
  [column: string]: unknown;
}

interface Amount {
  count: number;
  revenue: number;
}

export interface KategoriReport {
  kategori: string;
  lt2: Amount;
  warning: Amount;
  gt2: Amount;
}

export interface WitelReport {
  witel: string;
  kategori: KategoriReport[];
}

export interface AlertGroup {
  pic: string;
  witel: string;
  statuses: Record<string, number>;
  total: number;
}

interface RegionalViewRow {
  new_witel: string;
  kategori: string;
  lt2_count: number;
  lt2_revenue: number;
  warning_count: number;
  warning_revenue: number;
  gt2_count: number;
  gt2_revenue: number;
}

interface AlertViewRow {
  pic: string;
  witel: string;
  status: string;
  quantity: number;
}

export async function getRegionalReport(): Promise<WitelReport[]> {
  const { data, error } = await supabaseAdmin
    .from("v_report_witel_kategori")
    .select("*")
    .order("new_witel")
    .order("kategori");
  throwIfError(error, "regional report");

  const rows = (data ?? []) as unknown as RegionalViewRow[];
  const byWitel = new Map<string, KategoriReport[]>();

  for (const r of rows) {
    const list = byWitel.get(r.new_witel) ?? [];
    list.push({
      kategori: r.kategori,
      lt2: { count: r.lt2_count, revenue: r.lt2_revenue },
      warning: { count: r.warning_count, revenue: r.warning_revenue },
      gt2: { count: r.gt2_count, revenue: r.gt2_revenue },
    });
    byWitel.set(r.new_witel, list);
  }
  return [...byWitel].map(([witel, kategori]) => ({ witel, kategori }));
}

export interface ItemsFilter {
  witel: string;
  kategori: string;
  bucket: Bucket;
  page: number;
  limit: number;
}

export async function listReportItems(
  f: ItemsFilter,
): Promise<{ rows: OrderRow[]; total: number }> {
  const from = (f.page - 1) * f.limit;
  const inProcess = kategoriKey(f.kategori) === IN_PROCESS_KEY;

  if (!inProcess && f.bucket === "warning") return { rows: [], total: 0 };

  let query = supabaseAdmin
    .from("orders")
    .select(ORDER_SELECT, { count: "exact" })
    .eq("new_witel", f.witel)
    .eq("kategori", f.kategori)
    .order("umur_order", { ascending: false, nullsFirst: false })
    .order("sheet_row")
    .range(from, from + f.limit - 1);

  if (inProcess) {
    if (f.bucket === "lt2") {
      query = query.or(`umur_order.lte.${OVERDUE_DAYS},umur_order.is.null`);
    } else if (f.bucket === "warning") {
      query = query
        .gte("umur_order", WARNING_MIN_DAYS)
        .lte("umur_order", OVERDUE_DAYS);
    } else {
      query = query.gt("umur_order", OVERDUE_DAYS);
    }
  } else {
    query = query.eq("umur_key", f.bucket === "lt2" ? "<2BLN" : ">2BLN");
  }

  const { data, count, error } = await query;
  throwIfError(error, "report items");
  return { rows: (data ?? []) as unknown as OrderRow[], total: count ?? 0 };
}

export async function getAlertReport(): Promise<AlertGroup[]> {
  const { data, error } = await supabaseAdmin
    .from("v_alert_by_pic")
    .select("*");
  throwIfError(error, "alert report");

  const rows = (data ?? []) as unknown as AlertViewRow[];
  const groups = new Map<string, AlertGroup>();

  for (const r of rows) {
    const key = `${r.pic}|||${r.witel}`;
    const group: AlertGroup = groups.get(key) ?? {
      pic: r.pic,
      witel: r.witel,
      statuses: {},
      total: 0,
    };
    group.statuses[r.status] = (group.statuses[r.status] ?? 0) + r.quantity;
    group.total += r.quantity;
    groups.set(key, group);
  }

  return [...groups.values()].sort(
    (a, b) => a.pic.localeCompare(b.pic) || a.witel.localeCompare(b.witel),
  );
}

export async function getPicReport(name: string, scope: Scope, limit: number) {
  const key = picKey(name);

  const { data: summary, error } = await supabaseAdmin.rpc("pic_summary", {
    p_pic_key: key,
    p_only_warning: scope === "warning",
  });
  throwIfError(error, "pic summary");

  let query = supabaseAdmin
    .from("orders")
    .select(ORDER_SELECT)
    .eq("pic_key", key)
    .order("umur_order", { ascending: false, nullsFirst: false })
    .order("sheet_row")
    .limit(limit);

  if (scope === "warning") {
    query = query
      .eq("kategori_key", IN_PROCESS_KEY)
      .gte("umur_order", WARNING_MIN_DAYS)
      .lte("umur_order", OVERDUE_DAYS);
  }

  const { data: items, error: itemsError } = await query;
  throwIfError(itemsError, "pic items");

  return {
    pic: name,
    scope,
    summary,
    items: (items ?? []) as unknown as OrderRow[],
  };
}

export async function resolvePicName(user: AuthUser): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from("po_contacts")
    .select("po_name")
    .eq("po_email", user.email.trim().toLowerCase())
    .limit(1)
    .maybeSingle();
  throwIfError(error, "po lookup");

  const name = data?.po_name?.trim() || user.fullName?.trim();
  if (!name) throw AppError.notFound("No PIC name is linked to this account");
  return name;
}

export async function listGalaksi(page: number, limit: number) {
  const from = (page - 1) * limit;
  const { data, count, error } = await supabaseAdmin
    .from("orders")
    .select("order_subtype2,pic,kategori_umur,kategori,umur_order", {
      count: "exact",
    })
    .eq("kategori_key", IN_PROCESS_KEY)
    .gt("umur_order", OVERDUE_DAYS)
    .order("sheet_row")
    .range(from, from + limit - 1);
  throwIfError(error, "galaksi list");
  return { rows: data ?? [], total: count ?? 0 };
}
