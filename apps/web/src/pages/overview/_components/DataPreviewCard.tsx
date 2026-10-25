// Style
import "./DataPreviewCard.css";
// Components
import { Button, DataTable, Dropdown } from "@/components";
// Hooks
import type { DataPreviewApi } from "@/hooks";
// Utils
import { cx } from "@/utils/cx";
import { formatNumber } from "@/utils/format";

type DataPreviewCardProps = DataPreviewApi & { className?: string };

export function DataPreviewCard({
  className,
  error,
  onRetry,
  isFetching,
  rows,
  total,
  pagination,
  limit,
  limitOptions,
  setLimit,
  format,
  exportOptions,
  setFormat,
  isExporting,
  exportCurrent,
}: DataPreviewCardProps) {
  return (
    <div className={cx("card stack col gap-4", className)}>
      <div className="stack row-col between middle gap-3">
        <div className="stack row between middle nowrap gap-3 data-preview-card__group">
          <div className="stack col gap-1 fit">
            <h6>Data Preview</h6>
            <p className="text sm muted">{`Total rows: ${formatNumber(total)}`}</p>
          </div>
          <Dropdown
            name="limit"
            aria-label="Rows per page"
            size="sm"
            options={limitOptions}
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
          />
        </div>

        <div className="stack row end middle nowrap gap-2 data-preview-card__group">
          <Button
            text="Ekspor sebagai"
            size="sm"
            loading={isExporting}
            disabled={rows.length === 0}
            onClick={exportCurrent}
          />
          <Dropdown
            name="format"
            aria-label="Export format"
            size="sm"
            options={exportOptions}
            value={format}
            onChange={(e) => setFormat(e.target.value)}
          />
        </div>
      </div>

      <DataTable
        data={rows}
        isLoading={isFetching}
        error={error}
        onRetry={onRetry}
        pagination={pagination}
      />
    </div>
  );
}
