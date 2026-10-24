// Style
import "./OverviewPage.css";
// Components
import { Seo } from "@/components";
import { CategoryPieCard, DataPreviewCard } from "./_components";
import { SegmenRadarCard, SessionCard, SubtypeChartCard } from "./_components";
// Hooks
import { useCategoryPie, useDataPreview, useSegmenRadar } from "@/hooks";
import { useSessionBySubtype, useSubtypeChart } from "@/hooks";
// Utils
import { formatCompact, formatNumber } from "@/utils/format";

export default function OverviewPage() {
  const revenue = useSubtypeChart("revenue");
  const amount = useSubtypeChart("quantity");
  const session = useSessionBySubtype();
  const radar = useSegmenRadar();
  const pie = useCategoryPie();
  const preview = useDataPreview();

  return (
    <div className="page overview-page">
      <Seo page="overview" />

      <div className="cards-container row-1-1">
        <SubtypeChartCard
          {...revenue}
          title="Revenue by Order Sub-type"
          metricLabel="revenue"
          formatValue={formatCompact}
          showSummary
        />
        <SubtypeChartCard
          {...amount}
          title="Amount by Order Sub-type"
          metricLabel="amount"
          formatValue={formatNumber}
        />
      </div>

      <div className="cards-container row">
        <SessionCard {...session} className="overview-page__session" />
        <div className="cards-container row-1-1 overview-page__charts">
          <SegmenRadarCard {...radar} />
          <CategoryPieCard {...pie} />
        </div>
      </div>

      <DataPreviewCard {...preview} />
    </div>
  );
}
