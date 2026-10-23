import type { ReactNode } from "react";
// Style
import "./EmptyMessage.css";
// Components
import { Icon } from "@/components";
// Types
import type { IconsType } from "@/types/icons";
// Utils
import { cx } from "@/utils/cx";

interface EmptyMessageProps {
  title?: string;
  message?: string;
  iconName?: IconsType;
  /** e.g. a <Button> to create the first item */
  action?: ReactNode;
  className?: string;
}

export function EmptyMessage({
  title = "No data found",
  message,
  iconName,
  action,
  className,
}: EmptyMessageProps) {
  return (
    <div className={cx("empty-state empty-message", className)}>
      {iconName && (
        <span className="stack center fit empty-message__icon">
          <Icon iconName={iconName} size={24} />
        </span>
      )}
      <p className="text semibold center">{title}</p>
      {message && <p className="text sm muted center">{message}</p>}
      {action}
    </div>
  );
}
