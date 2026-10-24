import type { ReactNode } from "react";
// Style
import "./SettingsCard.css";
// Components
import { Icon } from "@/components";
// Hooks
import type { Notice } from "@/hooks";
// Types
import type { IconsType } from "@/types/icons";
// Utils
import { cx } from "@/utils/cx";

interface SettingsCardProps {
  title: string;
  description?: string;
  iconName?: IconsType;
  notice?: Notice;
  className?: string;
  children: ReactNode;
}

export function SettingsCard({
  title,
  description,
  iconName,
  notice,
  className,
  children,
}: SettingsCardProps) {
  return (
    <section className={cx("card settings-card stack col gap-4", className)}>
      <header className="stack row middle nowrap gap-3">
        {iconName && (
          <span className="settings-card__icon stack center fit">
            <Icon iconName={iconName} size={18} />
          </span>
        )}
        <div className="stack col gap-1 flex-1">
          <h6>{title}</h6>
          {description && <p className="text sm muted">{description}</p>}
        </div>
      </header>

      {notice && (
        <p className={cx("card flat text sm", notice.tone)} role="status">
          {notice.message}
        </p>
      )}

      {children}
    </section>
  );
}
