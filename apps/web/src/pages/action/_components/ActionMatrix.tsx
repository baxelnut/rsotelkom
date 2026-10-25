// Style
import "./ActionMatrix.css";
// Components
import { Button, CardContent, EmptyMessage } from "@/components";
// Config
import { ACTION_STATUSES, ACTION_TONE } from "@/config/action";
// Types
import type { ActionSelect } from "@/types/report";
// Utils
import { cx } from "@/utils/cx";
import { formatNumber } from "@/utils/format";
import type { ActionTableData } from "@/utils/action";

interface ActionMatrixProps extends ActionTableData {
  bucket: "lt2" | "gt2";
  label: string;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onSelect: (selection: ActionSelect) => void;
}

export function ActionMatrix({
  bucket,
  label,
  rows,
  totals,
  total,
  witel,
  isLoading,
  error,
  onRetry,
  onSelect,
}: ActionMatrixProps) {
  return (
    <div className="card stack col gap-3 action-matrix">
      <div className="stack row between middle nowrap gap-3">
        <h5>{label}</h5>
        <span className="badge secondary">{formatNumber(total)} orders</span>
      </div>

      <CardContent
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        skeletonHeight="14rem"
      >
        {rows.length === 0 ? (
          <EmptyMessage title="No project operations" />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th className="action-matrix__name">PO</th>
                  <th>Witel</th>
                  {ACTION_STATUSES.map((status) => (
                    <th key={status} className={`tone-${ACTION_TONE[status]}`}>
                      {status}
                    </th>
                  ))}
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key}>
                    <th scope="row" className="action-matrix__name">
                      <Button
                        variant="ghost"
                        size="sm"
                        text={row.name}
                        onClick={() =>
                          onSelect({ witel: row.witel, pic: row.name, bucket })
                        }
                      />
                    </th>
                    <td>
                      <Button
                        variant="ghost"
                        size="sm"
                        text={row.witel}
                        onClick={() => onSelect({ witel: row.witel, bucket })}
                      />
                    </td>
                    {ACTION_STATUSES.map((status) => (
                      <StatusCell
                        key={status}
                        status={status}
                        count={row.counts[status]}
                        onSelect={() =>
                          onSelect({
                            witel: row.witel,
                            pic: row.name,
                            status,
                            bucket,
                          })
                        }
                      />
                    ))}
                    <StatusCell
                      total
                      count={row.total}
                      onSelect={() =>
                        onSelect({ witel: row.witel, pic: row.name, bucket })
                      }
                    />
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row" className="action-matrix__name">
                    TOTAL
                  </th>
                  <td />
                  {ACTION_STATUSES.map((status) => (
                    <StatusCell
                      key={status}
                      status={status}
                      count={totals[status]}
                      onSelect={() => onSelect({ witel, status, bucket })}
                    />
                  ))}
                  <StatusCell
                    total
                    count={total}
                    onSelect={() => onSelect({ witel, bucket })}
                  />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </CardContent>
    </div>
  );
}

interface StatusCellProps {
  count: number;
  status?: (typeof ACTION_STATUSES)[number];
  total?: boolean;
  onSelect: () => void;
}

function StatusCell({
  count,
  status,
  total = false,
  onSelect,
}: StatusCellProps) {
  const tone = status ? ACTION_TONE[status] : "none";

  return (
    <td
      className={cx(
        "action-matrix__cell",
        `tone-${tone}`,
        total && "is-total",
        count === 0 ? "is-zero" : "is-clickable",
      )}
    >
      {count === 0 ? (
        <span className="action-matrix__zero">0</span>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="action-matrix__button"
          text={formatNumber(count)}
          onClick={onSelect}
          aria-label={`${count} orders, view details`}
        />
      )}
    </td>
  );
}
