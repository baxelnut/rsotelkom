import type { MouseEvent } from "react";
import type { Amount } from "@rso/shared";
// Style
import "./AmountCell.css";
// Components
import { Button } from "@/components";
// Types
import type { Tone } from "@/types/report";
// Utils
import { cx } from "@/utils/cx";
import {
  formatNumber,
  formatRupiah,
  formatRupiahCompact,
} from "@/utils/format";

interface AmountCellProps {
  col: number;
  tone: Tone;
  amount: Amount;
  warning: Amount | null;
  total: boolean;
  compact: boolean;
  onSelect: () => void;
  onSelectWarning: () => void;
}

export function AmountCell({
  col,
  tone,
  amount,
  warning,
  total,
  compact,
  onSelect,
  onSelectWarning,
}: AmountCellProps) {
  const empty = amount.count === 0;
  const showWarning = !!warning && warning.count > 0;

  const selectWarning = (event: MouseEvent) => {
    event.stopPropagation();
    onSelectWarning();
  };

  return (
    <td
      data-col={col}
      className={cx(
        "amount-cell",
        `tone-${tone}`,
        total && "is-total",
        empty ? "is-empty" : "is-clickable",
      )}
      title={empty ? undefined : formatRupiah(amount.revenue)}
      onClick={empty ? undefined : onSelect}
    >
      {empty ? (
        <span className="amount-cell__zero">0</span>
      ) : (
        <div className="stack col center gap-1 amount-cell__content">
          <Button
            variant="ghost"
            size="sm"
            className="amount-cell__button"
            aria-label={`${amount.count} orders, view details`}
          >
            <span className="amount-cell__count">
              {formatNumber(amount.count)}
            </span>
            <span className="amount-cell__revenue">
              {compact
                ? formatRupiahCompact(amount.revenue)
                : formatRupiah(amount.revenue)}
            </span>
          </Button>

          {showWarning && (
            <Button
              text={formatNumber(warning.count)}
              iconName="exclamationTriangleFill"
              iconSize={12}
              size="sm"
              variant="outline"
              className="amount-cell__warning"
              onClick={selectWarning}
              title="In process for 20 to 60 days"
              aria-label={`${warning.count} warning orders, view details`}
            />
          )}
        </div>
      )}
    </td>
  );
}
