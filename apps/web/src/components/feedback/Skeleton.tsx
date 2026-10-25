// Style
import "./Skeleton.css";
// Utils
import { cx } from "@/utils/cx";

interface SkeletonProps {
  height?: string;
  width?: string;
  className?: string;
}

export function Skeleton({
  height = "1rem",
  width = "100%",
  className,
}: SkeletonProps) {
  return (
    <span
      className={cx("skeleton skeleton-block", className)}
      style={{ height, width }}
      aria-hidden="true"
    />
  );
}

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

export function SkeletonTable({ rows = 6, columns = 5 }: SkeletonTableProps) {
  return (
    <div
      className="skeleton-table stack col gap-2"
      role="status"
      aria-busy="true"
      aria-label="Loading"
    >
      {Array.from({ length: rows }, (_, row) => (
        <div
          key={row}
          className="skeleton-table__row"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }, (_, col) => (
            <Skeleton key={col} height={row === 0 ? "1.5rem" : "1.1rem"} />
          ))}
        </div>
      ))}
    </div>
  );
}
