// Style
import "./ReportPageG.css";
// Components
import { CardContent, EmptyMessage, ExportControls, Seo } from "@/components";
import { AchievementLegend, GalaksiTable } from "./_components";
// Hooks
import { useGalaksiReport } from "@/hooks";
// Utils
import { formatDateTime } from "@/utils/format";

export default function ReportPageG() {
  const { isLoading, error, onRetry, rows, grand, lastSyncedAt, exportProps } =
    useGalaksiReport();

  return (
    <div className="page report-page">
      <Seo page="galaksi" />

      <div className="card stack col gap-4">
        <div className="stack row-col between middle gap-3">
          <div className="stack col gap-1 fit">
            <h6>GALAKSI (GApai! kawaL! AKSI!) AOSODOMORO Non Conn</h6>
            <p className="text sm muted">
              In-process orders older than 60 days, per project operation.
              {lastSyncedAt && ` Last synced ${formatDateTime(lastSyncedAt)}.`}
            </p>
          </div>
          <ExportControls {...exportProps} />
        </div>

        <AchievementLegend />

        <CardContent isLoading={isLoading} error={error} onRetry={onRetry}>
          {rows.length === 0 ? (
            <EmptyMessage
              title="No project operations"
              message="The PO list is empty. Run a sync and try again."
            />
          ) : (
            <GalaksiTable rows={rows} grand={grand} />
          )}
        </CardContent>
      </div>
    </div>
  );
}
