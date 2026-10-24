// Style
import "./GalaksiTable.css";
// Config
import { SESSION_KEYS } from "@/config/overview";
// Utils
import { cx } from "@/utils/cx";
import { formatNumber } from "@/utils/format";
import type { GalaksiCounts, GalaksiRow } from "@/utils/galaksi";

interface GalaksiTableProps {
  rows: GalaksiRow[];
  grand: GalaksiCounts;
}

export function GalaksiTable({ rows, grand }: GalaksiTableProps) {
  return (
    <div className="table-wrapper galaksi-table">
      <table>
        <thead>
          <tr>
            <th rowSpan={2} className="galaksi-table__name">
              Project Operation
            </th>
            <th colSpan={SESSION_KEYS.length} className="galaksi-table__group">
              &gt;2 BLN
            </th>
            <th rowSpan={2}>Grand total</th>
            <th rowSpan={2}>Achievement</th>
          </tr>
          <tr>
            {SESSION_KEYS.map((key) => (
              <th key={key}>{key.toUpperCase()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ name, counts, level }, index) => (
            <tr key={`${name}-${index}`}>
              <th scope="row" className="galaksi-table__name">
                {name}
              </th>
              {SESSION_KEYS.map((key) => (
                <td
                  key={key}
                  className={cx(
                    "galaksi-table__num",
                    counts[key] === 0 && "is-zero",
                  )}
                >
                  {formatNumber(counts[key])}
                </td>
              ))}
              <td className="galaksi-table__num is-total">
                {formatNumber(counts.total)}
              </td>
              <td className="galaksi-table__num">
                <span className={cx("badge", level.tone)}>{level.value}%</span>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" className="galaksi-table__name">
              GRAND TOTAL
            </th>
            {SESSION_KEYS.map((key) => (
              <td key={key} className="galaksi-table__num">
                {formatNumber(grand[key])}
              </td>
            ))}
            <td className="galaksi-table__num">{formatNumber(grand.total)}</td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
