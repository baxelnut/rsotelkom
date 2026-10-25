// Style
import "./SessionCard.css";
// Components
import { CardContent } from "@/components";
// Hooks
import type { SessionBySubtypeApi } from "@/hooks";
// Utils
import { cx } from "@/utils/cx";
import { formatNumber } from "@/utils/format";

type SessionCardProps = SessionBySubtypeApi & { className?: string };

export function SessionCard({
  className,
  isLoading,
  error,
  onRetry,
  items,
}: SessionCardProps) {
  return (
    <div className={cx("card stack col gap-4", className)}>
      <div className="stack col gap-1">
        <h6>Session by Sub-type</h6>
        <p className="text sm muted">Menampilkan data (AOSODOMORO).</p>
      </div>

      <CardContent
        className="session-card__list"
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
      >
        {items.map((item) => (
          <div key={item.label} className="stack col gap-1">
            <div className="stack row between middle nowrap gap-3">
              <p className="text semibold flex-1">{item.label}</p>
              <p className="text sm">{formatNumber(item.value)}</p>
              <p className="text sm semibold">{item.percentage.toFixed(2)}%</p>
            </div>
            <div className="session-card__track">
              <div
                className="session-card__fill"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </div>
  );
}
