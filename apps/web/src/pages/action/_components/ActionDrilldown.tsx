import { Fragment } from "react";
// Style
import "./ActionDrilldown.css";
// Components
import { DataTable, Icon, type TableColumn } from "@/components";
import { Button, Dropdown, ErrorMessage, ExportControls } from "@/components";
import { NotesField, StatusSelect } from ".";
// Config
import { ALERT_LABEL } from "@/config/action";
import { FIELD_COLUMNS } from "@/config/orderTable";
// Hooks
import type { ActionDrilldownApi } from "@/hooks";
// Utils
import { cx } from "@/utils/cx";
import { formatNumber } from "@/utils/format";

type Row = Record<string, unknown>;

const DATA_COLUMNS = FIELD_COLUMNS.filter(({ key }) => key !== "kategori");

function renderAlert(value: unknown) {
  const segera = value === ALERT_LABEL.segera;
  return (
    <span className={cx("badge", segera ? "danger" : "safe")}>
      {String(value)}
    </span>
  );
}

export function ActionDrilldown({
  crumbs,
  clear,
  rows,
  total,
  isLoading,
  error,
  onRetry,
  limit,
  limitOptions,
  setLimit,
  pagination,
  showAlert,
  alert,
  alertOptions,
  setAlert,
  save,
  exportProps,
  exportError,
}: ActionDrilldownApi) {
  const columns: TableColumn<Row>[] = [
    {
      key: "status",
      label: "Action",
      render: (value, row) => (
        <StatusSelect
          initial={String(value ?? "")}
          onSave={(status) => save(String(row.uuid), { status })}
        />
      ),
    },
    {
      key: "notes",
      label: "Notes",
      render: (value, row) => (
        <NotesField
          initial={String(value ?? "")}
          onSave={(notes) => save(String(row.uuid), { notes })}
        />
      ),
    },
    ...(showAlert
      ? [{ key: "alert", label: "Alert", render: renderAlert }]
      : []),
    ...DATA_COLUMNS,
  ];

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

      <div className="stack row-col between middle gap-3">
        <p className="text sm muted">{`Total rows: ${formatNumber(total)}`}</p>
        <div className="stack row middle nowrap gap-2 fit">
          {showAlert && (
            <Dropdown
              name="alert"
              aria-label="Alert filter"
              size="sm"
              options={alertOptions}
              value={alert}
              onChange={(e) => setAlert(e.target.value)}
            />
          )}
          <Dropdown
            name="limit"
            aria-label="Rows per page"
            size="sm"
            options={limitOptions}
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
          />
        </div>
      </div>

      <DataTable
        data={rows}
        columns={columns}
        getRowKey={(row) => String(row.uuid)}
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        pagination={pagination}
      />
    </div>
  );
}
