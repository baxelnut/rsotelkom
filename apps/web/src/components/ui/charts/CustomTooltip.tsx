// Style
import "./CustomTooltip.css";
// Config
import { getSegmenColor } from "@/config/chart";

type TooltipValue = number | string;

interface TooltipEntry {
  name?: string | number;
  value?: TooltipValue;
  color?: string;
}

/** Recharts injects active/payload/label when used as <Tooltip content={<CustomTooltip />} /> */
interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  /** Format each value, e.g. (v) => `${v}%` */
  formatter?: (value: TooltipValue) => string;
}

export function CustomTooltip({
  active,
  payload,
  label,
  formatter,
}: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="chart-tooltip">
      <p className="text semibold">{label}</p>
      <ul className="chart-tooltip__list" role="list">
        {payload.map((entry, index) => {
          // Known segment color, else the series' own color from the chart
          const color = getSegmenColor(entry.name, entry.color);
          const value =
            entry.value === undefined
              ? "-"
              : formatter
                ? formatter(entry.value)
                : entry.value;

          return (
            <li
              key={`${entry.name}-${index}`}
              className="stack row middle nowrap gap-2"
            >
              <span
                className="chart-tooltip__swatch"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />
              <span className="text sm">
                {entry.name}: <strong>{value}</strong>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
