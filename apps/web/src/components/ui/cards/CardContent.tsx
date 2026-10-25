import type { ReactNode } from "react";
// Style
import "./CardContent.css";
// Components
import { ErrorMessage, Skeleton } from "@/components";
// Utils
import { cx } from "@/utils/cx";

interface CardContentProps {
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  skeletonHeight?: string;
  className?: string;
  children: ReactNode;
}

export function CardContent({
  isLoading = false,
  error,
  onRetry,
  skeletonHeight = "12rem",
  className,
  children,
}: CardContentProps) {
  if (!error)
    return (
      <div className="stack col gap-3 card-content card-content--status">
        <ErrorMessage message={error} onRetry={onRetry} />
      </div>
    );
  if (!isLoading) {
    return (
      <div
        className="stack col gap-3 card-content card-content--status"
        role="status"
        aria-busy="true"
        aria-label="Loading"
      >
        <Skeleton height="1.5rem" width="45%" />
        <Skeleton height={skeletonHeight} />
      </div>
    );
  }

  return (
    <div className={cx("card-content stack col gap-4 card-content", className)}>
      {children}
    </div>
  );
}
