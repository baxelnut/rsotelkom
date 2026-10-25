import type { TableColumn } from "@/components";
import { formatRupiah } from "@/utils/format";

type Row = Record<string, unknown>;

export const FIELD_COLUMNS: TableColumn<Row>[] = [
  { key: "order_id", label: "Order ID" },
  { key: "order_subtype2", label: "Sub-type" },
  { key: "new_witel", label: "Witel" },
  { key: "segmen", label: "Segmen" },
  { key: "custaccntname", label: "Customer" },
  { key: "li_product_name", label: "Product" },
  { key: "kategori", label: "Kategori" },
  { key: "umur_order", label: "Age (days)", align: "end" },
  {
    key: "revenue",
    label: "Revenue",
    align: "end",
    render: (value) => formatRupiah(Number(value)),
  },
  { key: "pic", label: "PIC" },
];
