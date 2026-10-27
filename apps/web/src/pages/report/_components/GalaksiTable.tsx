// Style
import "./GalaksiTable.css";
// Config
import { SESSION_KEYS } from "@/config/overview";
// Utils
import { cx } from "@/utils/cx";
import { formatNumber } from "@/utils/format";
import type { GalaksiCounts, GalaksiRow } from "@/utils/galaksi";

const SKELETON_ROWS = 6;

interface GalaksiTableProps {
  rows: GalaksiRow[];
  grand: GalaksiCounts;
  isLoading?: boolean;
}

function SkeletonBar({ className }: { className?: string }) {
  return <span className={cx("galaksi-table__skeleton", className)} />;
}

export function GalaksiTable({
  rows,
  grand,
  isLoading = false,
}: GalaksiTableProps) {
  return (
    <div
      className="table-wrapper galaksi-table"
      aria-busy={isLoading || undefined}
    >
      <table>
        <thead className="galaksi-table__thead">
          <tr>
            <th rowSpan={2} className="galaksi-table__name">
              PO
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

        {isLoading ? (
          <>
            <tbody className="galaksi-table__skeleton-body" aria-hidden="true">
              {Array.from({ length: SKELETON_ROWS }, (_, index) => (
                <tr key={index}>
                  <th scope="row" className="galaksi-table__name">
                    <SkeletonBar className="galaksi-table__skeleton--name" />
                  </th>
                  {SESSION_KEYS.map((key) => (
                    <td key={key} className="galaksi-table__num">
                      <SkeletonBar className="galaksi-table__skeleton--num" />
                    </td>
                  ))}
                  <td className="galaksi-table__num is-total">
                    <SkeletonBar className="galaksi-table__skeleton--num" />
                  </td>
                  <td className="galaksi-table__num">
                    <SkeletonBar className="galaksi-table__skeleton--badge" />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot aria-hidden="true">
              <tr>
                <th scope="row" className="galaksi-table__name">
                  <SkeletonBar className="galaksi-table__skeleton--name" />
                </th>
                {SESSION_KEYS.map((key) => (
                  <td key={key} className="galaksi-table__num">
                    <SkeletonBar className="galaksi-table__skeleton--num" />
                  </td>
                ))}
                <td className="galaksi-table__num">
                  <SkeletonBar className="galaksi-table__skeleton--num" />
                </td>
                <td />
              </tr>
            </tfoot>
          </>
        ) : (
          <>
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
                    <span className={cx("badge", level.tone)}>
                      {level.value}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th
                  scope="row"
                  className="galaksi-table__name galaksi-table__name--grand-total"
                >
                  GRAND TOTAL
                </th>
                {SESSION_KEYS.map((key) => (
                  <td key={key} className="galaksi-table__num">
                    {formatNumber(grand[key])}
                  </td>
                ))}
                <td className="galaksi-table__num">
                  {formatNumber(grand.total)}
                </td>
                <td />
              </tr>
            </tfoot>
          </>
        )}
      </table>
    </div>
  );
}
