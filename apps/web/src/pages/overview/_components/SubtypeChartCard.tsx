import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
// Style
import "./SubtypeChartCard.css";
// Components
import { CardContent, CustomTooltip, Dropdown } from "@/components";
// Config
import {
  CHART_GRID_STROKE,
  CHART_LEGEND_STYLE,
  CHART_TICK,
  getSegmenColor,
} from "@/config/chart";
// Hooks
import type { SubtypeChartApi } from "@/hooks";
// Utils
import { cx } from "@/utils/cx";
import { formatCompact } from "@/utils/format";

type SubtypeChartCardProps = SubtypeChartApi & {
  title: string;
  metricLabel: string;
  formatValue: (value: number | string) => string;
  showSummary?: boolean;
  className?: string;
};

export function SubtypeChartCard({
  title,
  metricLabel,
  formatValue,
  showSummary = false,
  className,
  isLoading,
  error,
  onRetry,
  witel,
  setWitel,
  segmen,
  setSegmen,
  witelOptions,
  segmenOptions,
  chartData,
  segmens,
  summary,
}: SubtypeChartCardProps) {
  return (
    <div className={cx("card stack col gap-4", className)}>
      <h6>{title}</h6>

      <CardContent isLoading={isLoading} error={error} onRetry={onRetry}>
        <div className="grid-auto-sm">
          <Dropdown
            name="witel"
            label="Witel"
            size="sm"
            fullWidth
            options={witelOptions}
            value={witel}
            onChange={(e) => setWitel(e.target.value)}
          />
          <Dropdown
            name="segmen"
            label="Segmen"
            size="sm"
            fullWidth
            options={segmenOptions}
            value={segmen}
            onChange={(e) => setSegmen(e.target.value)}
          />
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} stackOffset="sign">
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
            <XAxis dataKey="name" tick={CHART_TICK} />
            <YAxis
              orientation="right"
              tick={CHART_TICK}
              tickFormatter={formatValue}
            />
            <Tooltip content={<CustomTooltip formatter={formatValue} />} />
            <Legend
              layout="horizontal"
              verticalAlign="top"
              align="left"
              wrapperStyle={CHART_LEGEND_STYLE}
            />
            <ReferenceLine y={0} stroke="var(--clr-ink)" />
            {segmens.map((name) => (
              <Bar
                key={name}
                dataKey={name}
                stackId="a"
                fill={getSegmenColor(name)}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>

        <p className="text sm muted">
          Showing {metricLabel} for <strong>{segmen}</strong> segmen in{" "}
          <strong>{witel}</strong> witel.
        </p>

        {showSummary && (
          <div className="stack col gap-1">
            <p className="text semibold">Summary:</p>
            <p className="text sm muted">
              <strong>{summary.count}</strong> categories analyzed totaling{" "}
              <strong>{`IDR ${formatCompact(summary.total)}.`}</strong>
              {summary.top.length > 0 && (
                <>
                  {" "}
                  Top contributors: <strong>{summary.top.join(" & ")}</strong>.
                </>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </div>
  );
}
