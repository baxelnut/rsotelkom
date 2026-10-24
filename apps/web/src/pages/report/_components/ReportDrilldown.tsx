import { Fragment } from "react";
// Style
import "./ReportDrilldown.css";
// Components
import { ExportControls, Icon, type TableColumn } from "@/components";
import { Button, DataTable, Dropdown, ErrorMessage } from "@/components";
// Config
import { STATUS_TONE } from "@/config/report";
// Hooks
import type { ReportDrilldownApi } from "@/hooks";
// Utils
import { cx } from "@/utils/cx";
import { formatNumber, formatRupiah } from "@/utils/format";

type Row = Record<string, unknown>;

function renderStatus(value: unknown) {
  const status = typeof value === "string" ? value : "";
  if (!status) return <span className="text sm muted">No status</span>;
  return <span className={cx("badge", STATUS_TONE[status])}>{status}</span>;
}

const FIELD_COLUMNS: TableColumn<Row>[] = [
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

const COLUMNS_WITH_ACTIONS: TableColumn<Row>[] = [
  { key: "status", label: "Action", render: renderStatus },
  { key: "notes", label: "Notes" },
  ...FIELD_COLUMNS,
];

export function ReportDrilldown({
  crumbs,
  clear,
  rows,
  total,
  showActions,
  isLoading,
  error,
  onRetry,
  limit,
  limitOptions,
  setLimit,
  pagination,
  exportProps,
  exportError,
}: ReportDrilldownApi) {
  return (
    <div className="card stack col gap-4">
      <div className="stack row-col between middle gap-3">
        <Button
          text="Back"
          iconName="arrowLeft"
          variant="outline"
          size="sm"
          onClick={clear}
        />
        <ExportControls {...exportProps} />
      </div>

      {exportError && <ErrorMessage message={exportError} />}

      <div className="stack row middle gap-2">
        {crumbs.map((crumb, index) => (
          <Fragment key={`${index}-${crumb}`}>
            {index > 0 && <Icon iconName="chevronRight" size={12} />}
            <h6>{crumb}</h6>
          </Fragment>
        ))}
      </div>

      <div className="stack row between middle nowrap gap-3">
        <p className="text sm muted">{`Total rows: ${formatNumber(total)}`}</p>
        <Dropdown
          name="limit"
          aria-label="Rows per page"
          size="sm"
          options={limitOptions}
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
        />
      </div>

      <DataTable
        data={rows}
        columns={showActions ? COLUMNS_WITH_ACTIONS : FIELD_COLUMNS}
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        pagination={pagination}
      />
    </div>
  );
}
