import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
// Style
import "./SegmenRadarCard.css";
// Components
import { CardContent, CustomTooltip, Dropdown } from "@/components";
// Config
import {
  CHART_GRID_STROKE,
  CHART_LEGEND_STYLE,
  CHART_TICK,
} from "@/config/chart";
// Hooks
import type { SegmenRadarApi } from "@/hooks";
// Utils
import { cx } from "@/utils/cx";
import { formatNumber } from "@/utils/format";

type SegmenRadarCardProps = SegmenRadarApi & { className?: string };

export function SegmenRadarCard({
  className,
  isLoading,
  error,
  onRetry,
  witel,
  setWitel,
  witelOptions,
  series,
  chartData,
  radarMax,
  totals,
}: SegmenRadarCardProps) {
  return (
    <div className={cx("card stack col gap-4", className)}>
      <div className="stack col gap-1">
        <h6>Segmen Radar Chart</h6>
        <p className="text sm muted">
          Showing data for segmen per witel in <strong>{witel}</strong>.
        </p>
      </div>

      <CardContent isLoading={isLoading} error={error} onRetry={onRetry}>
        <Dropdown
          name="witel"
          aria-label="Witel"
          size="sm"
          fullWidth
          options={witelOptions}
          value={witel}
          onChange={(e) => setWitel(e.target.value)}
        />

        <ResponsiveContainer width="100%" height={300}>
          <RadarChart cx="50%" cy="50%" outerRadius="55%" data={chartData}>
            <PolarGrid stroke={CHART_GRID_STROKE} />
            <PolarAngleAxis dataKey="subject" tick={CHART_TICK} />
            <PolarRadiusAxis
              angle={30}
              tick={CHART_TICK}
              domain={[0, radarMax]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend layout="horizontal" wrapperStyle={CHART_LEGEND_STYLE} />
            {series.map(({ name, color }) => (
              <Radar
                key={name}
                name={name}
                dataKey={name}
                stroke={color}
                fill={color}
                fillOpacity={0.3}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>

        <div className="stack col gap-1">
          {totals.map(({ label, value }) => (
            <p key={label} className="text sm">
              {label}: <strong>{formatNumber(value)}</strong>
            </p>
          ))}
        </div>
      </CardContent>
    </div>
  );
}
