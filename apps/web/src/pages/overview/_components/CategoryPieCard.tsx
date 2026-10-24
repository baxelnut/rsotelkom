import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
// Style
import "./CategoryPieCard.css";
// Components
import { CardContent, Checkbox, CustomTooltip, Dropdown } from "@/components";
// Hooks
import type { CategoryPieApi } from "@/hooks";
// Utils
import { cx } from "@/utils/cx";
import { formatNumber } from "@/utils/format";

type CategoryPieCardProps = CategoryPieApi & { className?: string };

export function CategoryPieCard({
  className,
  isLoading,
  error,
  onRetry,
  category,
  setCategory,
  categoryOptions,
  categoryLabel,
  witels,
  pieData,
  toggleWitel,
}: CategoryPieCardProps) {
  return (
    <div className={cx("card stack col gap-4", className)}>
      <div className="stack col gap-1">
        <h6>Witel Pie Chart</h6>
        <p className="text sm muted">
          Showing category of witel in <strong>{categoryLabel}</strong>.
        </p>
      </div>

      <CardContent isLoading={isLoading} error={error} onRetry={onRetry}>
        <Dropdown
          name="category"
          aria-label="Category"
          size="sm"
          fullWidth
          options={categoryOptions}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
              stroke="none"
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="stack col gap-1">
          {witels.map((item) => (
            <div key={item.name} className="stack row middle nowrap gap-2">
              <Checkbox
                label={item.name}
                checked={item.included}
                onChange={() => toggleWitel(item.name)}
              />
              {item.included && (
                <p className="text sm semibold">
                  {`→ ${formatNumber(item.value)}`}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </div>
  );
}
