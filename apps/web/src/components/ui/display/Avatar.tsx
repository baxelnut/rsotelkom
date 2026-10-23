// Style
import "./Avatar.css";
// Components
import { cx } from "@/utils/cx";

type AvatarSize = "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: AvatarSize;
  className?: string;
}

function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  return (
    <span className={cx("avatar", `avatar--${size}`, className)}>
      {src ? (
        <img src={src} alt={name} className="avatar__img" loading="lazy" />
      ) : (
        <span className="avatar__initials" aria-label={name} role="img">
          {initialsOf(name)}
        </span>
      )}
    </span>
  );
}
