// Style
import "./ReportMatrixCard.css";
// Components
import { Button, CardContent, Checkbox } from "@/components";
import { EmptyMessage, ErrorMessage, ExportControls } from "@/components";
import { ReportMatrix } from "./ReportMatrix";
// Hooks
import type { ReportMatrixApi } from "@/hooks";
// Types
import type { ReportSelection } from "@/types/report";
// Utils
import { formatDateTime } from "@/utils/format";

type ReportMatrixCardProps = ReportMatrixApi & {
  onSelect: (selection: ReportSelection) => void;
};

export function ReportMatrixCard({
  isLoading,
  error,
  onRetry,
  kategori,
  matrix,
  compact,
  setCompact,
  collapsed,
  toggleSubtype,
  lastSyncedAt,
  onSync,
  isSyncing,
  syncError,
  exportError,
  exportProps,
  onSelect,
}: ReportMatrixCardProps) {
  return (
    <div className="card stack col gap-4">
      <div className="stack row-col between middle gap-3">
        <div className="stack col gap-1 fit">
          <h6>Regional 3 Order Report</h6>
          <p className="text sm muted">
            Select any number to see its orders.
            {lastSyncedAt && ` Last synced ${formatDateTime(lastSyncedAt)}.`}
          </p>
        </div>
        <div className="stack row end middle gap-3 fit">
          <Checkbox
            label="Compact amounts"
            checked={compact}
            onChange={setCompact}
          />
          {onSync && (
            <Button
              text="Sync data"
              iconName="repeat"
              variant="outline"
              size="sm"
              loading={isSyncing}
              onClick={onSync}
            />
          )}
          <ExportControls {...exportProps} />
        </div>
      </div>

      {syncError && <ErrorMessage message={syncError} />}
      {exportError && <ErrorMessage message={exportError} />}

      <CardContent isLoading={false} error={error} onRetry={onRetry}>
        {!isLoading && kategori.length === 0 ? (
          <EmptyMessage
            title="No category selected"
            message="Select at least one category above."
          />
        ) : (
          <ReportMatrix
            matrix={matrix}
            compact={compact}
            collapsed={collapsed}
            onToggle={toggleSubtype}
            onSelect={onSelect}
          />
        )}
      </CardContent>
    </div>
  );
}
