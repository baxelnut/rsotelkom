// Style
import "./ReportPageG.css";
// Components
import { CardContent, EmptyMessage, ExportControls, Seo } from "@/components";
import { AchievementLegend, GalaksiTable } from "./_components";
import { SendReportButton } from "./_components";
// Hooks
import { useGalaksiReport, useSendReport } from "@/hooks";
// Utils
import { formatDateTime } from "@/utils/format";

export default function ReportPageG() {
  const { isLoading, error, onRetry, rows, grand, lastSyncedAt, exportProps } =
    useGalaksiReport();
  const telegram = useSendReport();

  return (
    <div className="page report-page">
      <Seo page="galaksi" />

      {telegram.canSend && <SendReportButton {...telegram} />}

      <div className="card stack col gap-4">
        <div className="stack row-col between middle gap-3">
          <div className="stack col gap-1 fit">
            <h6>GALAKSI (GApai! kawaL! AKSI!) AOSODOMORO Non Conn</h6>
            <p className="text sm muted">
              Pesanan "In Process" dengan usia &gt;2 bln.
              {lastSyncedAt &&
                ` Terakhir disinkronkan ${formatDateTime(lastSyncedAt)}.`}
            </p>
          </div>
          <ExportControls {...exportProps} />
        </div>

        <AchievementLegend />

        <CardContent isLoading={false} error={error} onRetry={onRetry}>
          {!isLoading && rows.length === 0 ? (
            <EmptyMessage
              title="Tidak ada data"
              message="Daftar PO kosong. Lakukan sinkronisasi lalu coba lagi."
            />
          ) : (
            <GalaksiTable rows={rows} grand={grand} isLoading={isLoading} />
          )}
        </CardContent>
      </div>
    </div>
  );
}
