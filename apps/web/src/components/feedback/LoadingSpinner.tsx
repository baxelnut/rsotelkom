// Style
import "./LoadingSpinner.css";
// Utils
import { cx } from "@/utils/cx";

interface LoadingSpinnerProps {
  /** Pass null to hide the text */
  label?: string | null;
  size?: "sm" | "md" | "lg";
  /** Cover the nearest positioned parent instead of filling it in flow */
  overlay?: boolean;
  className?: string;
}

export function LoadingSpinner({
  label = "Please wait...",
  size = "lg",
  overlay = false,
  className,
}: LoadingSpinnerProps) {
  return (
    <div
      className={cx(
        "loading stack col center gap-4",
        overlay && "loading--overlay",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <span
        className={cx("spinner", size !== "md" && size)}
        aria-hidden="true"
      />
      {label && <p className="text sm muted">{label}</p>}
    </div>
  );
}
