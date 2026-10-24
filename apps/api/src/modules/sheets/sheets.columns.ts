import type { ColumnKind } from "./sheets.parse";

export const ORDERS_HEADER_ROW = 1;

// Sheet header -> value type. The database column is the header in lowercase.
export const ORDER_COLUMNS: Record<string, ColumnKind> = {
  NIPNAS: "text",
  STANDARD_NAME: "text",
  ORDER_ID: "text",
  ORDER_SUBTYPE: "text",
  ORDER_SUBTYPE2: "text",
  LI_SID: "text",
  SID: "text",
  SEGMEN: "text",
  SUB_SEGMEN: "text",
  CUSTACCNTNAME: "text",
  BILL_REGION: "text",
  BILL_WITEL: "text",
  LI_PRODUCT_NAME: "text",
  IS_NONCONN: "text",
  LI_BILLDATE: "text",
  LI_MILESTONE: "text",
  KATEGORI: "text",
  LI_STATUS: "text",
  LI_STATUS_DATE: "date",
  LI_FULFILLMENT_STATUS: "text",
  REVENUE: "num",
  LI_CREATED_DATE: "date",
  ORDER_CREATEDBY_NAME: "text",
  ACTION_CD: "text",
  KATEGORI_UMUR: "text",
  UMUR_ORDER: "int",
  PIC: "text",
  KATEGORI_UMUR2: "text",
  NAMA_MITRA: "text",
  NEW_WITEL: "text",
  UUID: "text",
  STATUS: "text",
  NOTES: "text",
  LOG: "text",
  FINGERPRINT: "text",
};

export const ORDER_SELECT = [
  ...Object.keys(ORDER_COLUMNS).map((h) => h.toLowerCase()),
  "sheet_row",
  "synced_at",
].join(",");

export const PO_HEADER_ROW = 1;
export const PO_REQUIRED_HEADERS = ["PO_NAME", "PO_EMAIL"];
