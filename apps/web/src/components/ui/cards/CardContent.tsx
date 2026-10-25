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
  if (error) return <ErrorMessage message={error} onRetry={onRetry} />;
  if (isLoading) {
    return (
      <div
        className="stack col gap-3"
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
    <div className={cx("card-content stack col gap-4", className)}>
      {children}
    </div>
  );
}
