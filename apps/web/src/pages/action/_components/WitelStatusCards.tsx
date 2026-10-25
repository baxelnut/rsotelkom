import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
// Style
import "./WitelStatusCards.css";
// Components
import { ErrorMessage, Icon, Skeleton } from "@/components";
// Config
import { ALL } from "@/config/overview";
// Utils
import { cx } from "@/utils/cx";
import { formatNumber } from "@/utils/format";
import type { WitelCard } from "@/utils/action";

interface WitelStatusCardsProps {
  cards: WitelCard[];
  isLoading: boolean;
  error: string | null;
  selected: string;
  onSelect: (witel: string) => void;
}

export function WitelStatusCards({
  cards,
  isLoading,
  error,
  selected,
  onSelect,
}: WitelStatusCardsProps) {
  if (error)
    return (
      <div className="grid-4 gap-4">
        {Array.from({ length: 5 }, (_, index) => (
          <div className="card interactive stack col gap-2 witel-card witel-card--status">
            <ErrorMessage key={index} message={error} />
          </div>
        ))}
      </div>
    );

  if (isLoading) {
    return (
      <div className="grid-4 gap-4">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} height="15rem" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid-4 gap-4">
      {cards.map(({ witel, total, slices }) => {
        const active = selected === witel;
        return (
          <button
            key={witel}
            type="button"
            className={cx(
              "card interactive stack col gap-2 witel-card",
              active && "primary",
            )}
            aria-pressed={active}
            onClick={() => onSelect(active ? ALL : witel)}
          >
            <h6 className="wc__title">{witel}</h6>

            {total === 0 ? (
              <div className="stack col center gap-2 witel-card__empty">
                <Icon iconName="check" size={22} />
                <p className="text sm muted center">No "In Process" orders</p>
              </div>
            ) : (
              <>
                <div className="witel-card__chart">
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie
                        data={slices.filter((slice) => slice.value > 0)}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={34}
                        outerRadius={56}
                        stroke="none"
                        isAnimationActive={false}
                      >
                        {slices
                          .filter((slice) => slice.value > 0)
                          .map((slice) => (
                            <Cell key={slice.name} fill={slice.color} />
                          ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="stack col gap-1">
                  {slices.map((slice) => (
                    <div
                      key={slice.name}
                      className="stack row between middle nowrap gap-2"
                    >
                      <span className="stack row middle nowrap gap-2 fit">
                        <span
                          className="witel-card__swatch"
                          style={{ backgroundColor: slice.color }}
                          aria-hidden="true"
                        />
                        <span className="text sm">{slice.name}</span>
                      </span>
                      <span className="text sm semibold">
                        {formatNumber(slice.value)}
                        <span className="muted">
                          {` (${((slice.value / total) * 100).toFixed(0)}%)`}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
