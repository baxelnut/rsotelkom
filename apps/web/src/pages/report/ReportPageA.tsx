// Style
import "./ReportPageA.css";
// Components
import { Seo } from "@/components";
import { KategoriFilter, ReportDrilldown } from "./_components";
import { ReportMatrixCard, ReportSummary } from "./_components";
import { SendReportButton } from "./_components";
// Hooks
import { useReportDrilldown, useReportExport, useReportMatrix } from "@/hooks";
import { useSendReport } from "@/hooks";

export default function ReportPageA() {
  const exporter = useReportExport();
  const matrix = useReportMatrix(exporter);
  const drilldown = useReportDrilldown(exporter);
  const telegram = useSendReport();

  return (
    <div className="page report-page">
      <Seo page="aosodomoro" />

      {drilldown.selection ? (
        <ReportDrilldown {...drilldown} />
      ) : (
        <>
          <ReportSummary
            stats={matrix.matrix.stats}
            isLoading={matrix.isLoading}
          />
          {telegram.canSend && <SendReportButton {...telegram} />}
          <KategoriFilter
            options={matrix.kategoriOptions}
            selected={matrix.kategori}
            onToggle={matrix.toggleKategori}
          />
          <ReportMatrixCard {...matrix} onSelect={drilldown.select} />
        </>
      )}
    </div>
  );
}
