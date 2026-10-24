// Style
import "./ReportSummary.css";
// Types
import type { ReportStat } from "@/types/report";
// Utils
import { cx } from "@/utils/cx";
import { formatNumber, formatRupiahCompact } from "@/utils/format";

interface ReportSummaryProps {
  stats: ReportStat[];
  isLoading: boolean;
}

export function ReportSummary({ stats, isLoading }: ReportSummaryProps) {
  return (
    <div className="grid-auto-sm">
      {isLoading
        ? stats.map((stat) => (
            <div
              key={stat.label}
              className="card flat skeleton report-summary__placeholder"
            />
          ))
        : stats.map((stat) => (
            <div
              key={stat.label}
              className={cx("card flat stack col gap-1", stat.tone)}
            >
              <p className="text eyebrow">{stat.label}</p>
              <h4 className="text num">{formatNumber(stat.count)}</h4>
              <p className="text sm muted">
                {formatRupiahCompact(stat.revenue)}
              </p>
            </div>
          ))}
    </div>
  );
}
