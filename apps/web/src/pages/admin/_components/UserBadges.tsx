// Style
import "./UserBadges.css";
// Hooks
import type { UserRow } from "@/hooks";
// Utils
import { cx } from "@/utils/cx";

interface UserBadgesProps {
  row: UserRow;
}

export function UserBadges({ row }: UserBadgesProps) {
  return (
    <div className="stack row gap-1 fit">
      <span className={cx("badge", row.roleTone)}>{row.roleLabel}</span>
      {row.statusLabel && (
        <span className={cx("badge", row.statusTone)}>{row.statusLabel}</span>
      )}
      {row.isSelf && <span className="badge">You</span>}
    </div>
  );
}
