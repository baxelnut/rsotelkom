import { throwIfError } from "../../lib/db";
import { AppError } from "../../lib/errors";
import { supabaseAdmin } from "../../lib/supabase";
import type { AuthUser } from "../auth/auth.service";
import { ORDER_SELECT } from "../sheets/sheets.columns";

export type Bucket = "lt2" | "warning" | "gt2";
export type BucketFilter = Bucket | "all";
export type Scope = "all" | "warning";

export interface GalaksiPoRow {
  po_name: string;
  ao: number;
  so: number;
  do: number;
  mo: number;
  ro: number;
}

export const WARNING_MIN_DAYS = 20;
export const OVERDUE_DAYS = 60;

const IN_PROCESS_KEY = "INPROCESS";
const EXPORT_CHUNK = 1000;

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

export interface SubtypeReport {
  subtype: string;
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

interface SubtypeViewRow extends Omit<RegionalViewRow, "new_witel"> {
  subtype: string;
  witel: string;
}

interface AlertViewRow {
  pic: string;
  witel: string;
  status: string;
  quantity: number;
}

function toKategoriReport(
  r: Omit<RegionalViewRow, "new_witel">,
): KategoriReport {
  return {
    kategori: r.kategori,
    lt2: { count: r.lt2_count, revenue: r.lt2_revenue },
    warning: { count: r.warning_count, revenue: r.warning_revenue },
    gt2: { count: r.gt2_count, revenue: r.gt2_revenue },
  };
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
    list.push(toKategoriReport(r));
    byWitel.set(r.new_witel, list);
  }
  return [...byWitel].map(([witel, kategori]) => ({ witel, kategori }));
}

export async function getSubtypeReport(): Promise<SubtypeReport[]> {
  const { data, error } = await supabaseAdmin
    .from("v_report_subtype_witel_kategori")
    .select("*")
    .order("subtype")
    .order("witel")
    .order("kategori");
  throwIfError(error, "subtype report");

  const rows = (data ?? []) as unknown as SubtypeViewRow[];
  const groups = new Map<string, SubtypeReport>();

  for (const r of rows) {
    const key = `${r.subtype}|||${r.witel}`;
    const group = groups.get(key) ?? {
      subtype: r.subtype,
      witel: r.witel,
      kategori: [],
    };
    group.kategori.push(toKategoriReport(r));
    groups.set(key, group);
  }
  return [...groups.values()];
}

export type ActionStatus =
  | "Lanjut"
  | "Cancel"
  | "Bukan Order Reg"
  | "No Status";

export interface ReportFilter {
  witel?: string | undefined;
  subtype?: string | undefined;
  kategori?: string[] | undefined;
  pic?: string | undefined;
  status?: ActionStatus | undefined;
  alert?: "aman" | "segera" | undefined;
  bucket: BucketFilter;
}

export interface ItemsFilter extends ReportFilter {
  page: number;
  limit: number;
}

type ActionCounts = Record<ActionStatus, number>;

export interface ActionRow {
  po_name: string;
  witel: string;
  lt2: ActionCounts;
  gt2: ActionCounts;
}

interface ActionViewRow {
  po_name: string;
  witel: string;
  lt2_lanjut: number;
  lt2_cancel: number;
  lt2_bukan: number;
  lt2_none: number;
  gt2_lanjut: number;
  gt2_cancel: number;
  gt2_bukan: number;
  gt2_none: number;
}

function reportQuery(f: ReportFilter, withCount: boolean) {
  let query: any = supabaseAdmin
    .from("orders")
    .select(ORDER_SELECT, withCount ? { count: "exact" as const } : undefined)
    .not("kategori", "is", null);

  if (f.kategori?.length) query = query.in("kategori", f.kategori);
  if (f.witel) query = query.eq("witel_key", f.witel);
  if (f.pic) query = query.eq("pic_key", picKey(f.pic));
  if (f.status) query = query.eq("status_label", f.status);
  if (f.alert) query = query.eq("is_warning", f.alert === "segera");
  if (f.subtype) {
    query = query.eq(
      "subtype_key",
      f.subtype === "N/A" ? "" : f.subtype.toUpperCase(),
    );
  }

  if (f.bucket === "warning") query = query.eq("is_warning", true);
  else if (f.bucket === "all") query = query.not("bucket", "is", null);
  else query = query.eq("bucket", f.bucket);

  return query;
}

export async function listReportItems(
  f: ItemsFilter,
): Promise<{ rows: OrderRow[]; total: number }> {
  const from = (f.page - 1) * f.limit;

  const { data, count, error } = await reportQuery(f, true)
    .order("umur_order", { ascending: false, nullsFirst: false })
    .order("sheet_row")
    .range(from, from + f.limit - 1);
  throwIfError(error, "report items");

  return { rows: (data ?? []) as unknown as OrderRow[], total: count ?? 0 };
}

export async function listAllReportOrders(
  f: ReportFilter,
): Promise<OrderRow[]> {
  const rows: OrderRow[] = [];

  for (let from = 0; ; from += EXPORT_CHUNK) {
    const { data, error } = await reportQuery(f, false)
      .order("subtype_key")
      .order("witel_key")
      .order("kategori")
      .order("umur_order", { ascending: false, nullsFirst: false })
      .order("sheet_row")
      .range(from, from + EXPORT_CHUNK - 1);
    throwIfError(error, "report export");

    const batch = (data ?? []) as unknown as OrderRow[];
    rows.push(...batch);
    if (batch.length < EXPORT_CHUNK) return rows;
  }
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

export async function getGalaksiSummary(): Promise<GalaksiPoRow[]> {
  const { data, error } = await supabaseAdmin.from("v_galaksi_po").select("*");
  throwIfError(error, "galaksi summary");
  return (data ?? []) as unknown as GalaksiPoRow[];
}

export async function getActionReport(): Promise<ActionRow[]> {
  const { data, error } = await supabaseAdmin.from("v_action_po").select("*");
  throwIfError(error, "action report");

  return ((data ?? []) as unknown as ActionViewRow[]).map((r) => ({
    po_name: r.po_name,
    witel: r.witel,
    lt2: {
      Lanjut: r.lt2_lanjut,
      Cancel: r.lt2_cancel,
      "Bukan Order Reg": r.lt2_bukan,
      "No Status": r.lt2_none,
    },
    gt2: {
      Lanjut: r.gt2_lanjut,
      Cancel: r.gt2_cancel,
      "Bukan Order Reg": r.gt2_bukan,
      "No Status": r.gt2_none,
    },
  }));
}
