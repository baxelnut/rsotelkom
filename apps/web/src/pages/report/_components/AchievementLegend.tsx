// Style
import "./AchievementLegend.css";
// Config
import { ACHIEVEMENT_LEVELS } from "@/config/galaksi";
// Utils
import { cx } from "@/utils/cx";

export function AchievementLegend() {
  return (
    <div className="stack row middle gap-3">
      <p className="text eyebrow">Achievement</p>
      {ACHIEVEMENT_LEVELS.map(({ range, value, tone }) => (
        <span key={range} className={cx("badge", `ach--${tone}`)}>
          {range} → {value}%
        </span>
      ))}
    </div>
  );
}
