// Style
import "./ActionBasedPage.css";
// Components
import { Dropdown, Seo } from "@/components";
import { ActionDrilldown, ActionMatrix, WitelStatusCards } from "./_components";
// Hooks
import { useActionDrilldown, useActionReport, useReportExport } from "@/hooks";

export default function ActionBasedPage() {
  const exporter = useReportExport();
  const report = useActionReport();
  const drilldown = useActionDrilldown(exporter);

  console.log(drilldown);

  return (
    <div className="page action-based-page">
      <Seo page="action" />

      {drilldown.selection ? (
        <ActionDrilldown {...drilldown} />
      ) : (
        <>
          <WitelStatusCards
            cards={report.cards}
            isLoading={report.cardsLoading}
            error={report.cardsError}
            selected={report.witel}
            onSelect={report.setWitel}
          />

          <div className="card flat stack row middle gap-3">
            <Dropdown
              name="witel"
              label="Witel"
              size="sm"
              options={report.witelOptions}
              value={report.witel}
              onChange={(e) => report.setWitel(e.target.value)}
            />
          </div>

          {report.tables.map((table) => (
            <ActionMatrix
              key={table.bucket}
              {...table}
              isLoading={report.isLoading}
              error={report.error}
              onRetry={report.onRetry}
              onSelect={drilldown.select}
            />
          ))}
        </>
      )}
    </div>
  );
}
