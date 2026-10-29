import type { ApiResponse } from "./index";

export type Role = "admin" | "user" | "pending";
export type Dataset = "orders" | "po";

export interface PageMeta {
  total: number;
  page: number;
  limit: number;
}
export type Paged<T> = ApiResponse<T> & { meta: PageMeta };

export interface AuthUser {
  id: string;
  email: string;
  fullName: string | null;
  role: Role;
  telegramId: number | null;
}

export interface UpdateMeInput {
  fullName?: string;
  telegramId?: number | null;
}

export interface ManagedUser {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  telegram_id: number | null;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

export interface CreateUserInput {
  email: string;
  password: string;
  fullName?: string;
  role?: Role;
  telegramId?: number;
}

export interface UpdateUserInput {
  fullName?: string;
  role?: Role;
  isActive?: boolean;
  telegramId?: number | null;
}

export interface Order {
  uuid: string;
  nipnas: string | null;
  standard_name: string | null;
  order_id: string | null;
  order_subtype: string | null;
  order_subtype2: string | null;
  li_sid: string | null;
  sid: string | null;
  segmen: string | null;
  sub_segmen: string | null;
  custaccntname: string | null;
  bill_region: string | null;
  bill_witel: string | null;
  li_product_name: string | null;
  is_nonconn: string | null;
  li_billdate: string | null;
  li_milestone: string | null;
  kategori: string | null;
  li_status: string | null;
  li_status_date: string | null;
  li_fulfillment_status: string | null;
  revenue: number | null;
  li_created_date: string | null;
  order_createdby_name: string | null;
  action_cd: string | null;
  kategori_umur: string | null;
  umur_order: number | null;
  pic: string | null;
  kategori_umur2: string | null;
  nama_mitra: string | null;
  new_witel: string | null;
  status: string | null;
  notes: string | null;
  log: string | null;
  fingerprint: string | null;
  sheet_row: number;
  synced_at: string;
}

export interface OrdersQuery {
  page?: number;
  limit?: number;
  kategori?: string;
  witel?: string;
  pic?: string;
  status?: string;
  minAge?: number;
  maxAge?: number;
}

export interface OrderPatch {
  status?: string;
  notes?: string;
}

export interface PoContact {
  PO_EMAIL: string;
  PO_NAME: string;
  WITEL: string;
  [header: string]: string;
}

export interface SyncRun {
  id: string;
  dataset: Dataset;
  status: "running" | "ok" | "failed";
  rows: number | null;
  deleted: number | null;
  skipped: number | null;
  error: string | null;
  started_at: string;
  finished_at: string | null;
}

export interface SyncOutcome {
  dataset: Dataset;
  ok: boolean;
  durationMs: number;
  rows?: number;
  deleted?: number;
  skipped?: number;
  error?: string;
}

export interface StatusByWitel {
  new_witel: string;
  lanjut: number;
  cancel: number;
  bukan_order_reg: number;
  no_status: number;
}

export interface SubtypeRevenueByWitel {
  new_witel: string;
  new_install: number;
  modify: number;
  suspend: number;
  disconnect: number;
  upgrade: number;
  downgrade: number;
  other: number;
}

export interface SegmenByWitel {
  new_witel: string;
  segmen: string;
  quantity: number;
}

export interface SegmenSubtype2 {
  new_witel: string;
  sub_type2: string;
  segmen: string;
  quantity: number;
  revenue: number;
}

export interface OrderSubtype2ByWitel {
  new_witel: string;
  ao: number;
  so: number;
  do: number;
  mo: number;
  ro: number;
}

export interface SegmenSimplified {
  new_witel: string;
  state_owned_enterprise_service: number;
  government: number;
  regional: number;
  private_service: number;
  enterprise: number;
}

export interface KategoriSimplified {
  new_witel: string;
  billing_completed: number;
  in_process: number;
  prov_complete: number;
  provide_order: number;
  ready_to_bill: number;
}

export interface SummaryMap {
  "process-status": StatusByWitel[];
  "subtype-revenue": SubtypeRevenueByWitel[];
  segmen: SegmenByWitel[];
  "segmen-subtype2": SegmenSubtype2[];
  "order-subtype2": OrderSubtype2ByWitel[];
  "segmen-simplified": SegmenSimplified[];
  "kategori-simplified": KategoriSimplified[];
}
export type SummaryName = keyof SummaryMap;

export type ReportBucket = "lt2" | "warning" | "gt2";

export interface Amount {
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

export type ReportBucketFilter = ReportBucket | "all";

export interface SubtypeReport {
  subtype: string;
  witel: string;
  kategori: KategoriReport[];
}

export type ReportAlert = "aman" | "segera";

export interface ReportItemsQuery {
  witel?: string;
  witels?: string;
  subtype?: string;
  kategori?: string;
  pic?: string;
  status?: string;
  alert?: ReportAlert;
  bucket?: ReportBucketFilter;
  page?: number;
  limit?: number;
}

export interface AlertGroup {
  pic: string;
  witel: string;
  statuses: Record<string, number>;
  total: number;
}

export interface PicSummary {
  total_orders: number;
  total_revenue: number;
  by_kategori: Record<string, number>;
  lt2: Amount;
  gt2: Amount;
}

export interface PicReport {
  pic: string;
  scope: "all" | "warning";
  summary: PicSummary;
  items: Order[];
}

export interface GalaksiRow {
  order_subtype2: string | null;
  pic: string | null;
  kategori_umur: string | null;
  kategori: string | null;
  umur_order: number | null;
}

export interface GalaksiPoRow {
  po_name: string;
  ao: number;
  so: number;
  do: number;
  mo: number;
  ro: number;
  witel: string | null;
}

export type ActionStatus =
  | "Lanjut"
  | "Cancel"
  | "Bukan Order Reg"
  | "No Status";

export type ActionCounts = Record<ActionStatus, number>;

export interface ActionRow {
  po_name: string;
  witel: string;
  lt2: ActionCounts;
  gt2: ActionCounts;
}
