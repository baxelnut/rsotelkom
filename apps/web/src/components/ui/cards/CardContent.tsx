import type { ReactNode } from "react";
// Style
import "./CardContent.css";
// Components
import { ErrorMessage, LoadingSpinner } from "@/components";
// Utils
import { cx } from "@/utils/cx";

interface CardContentProps {
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
  children: ReactNode;
}

export function CardContent({
  isLoading = false,
  error,
  onRetry,
  className,
  children,
}: CardContentProps) {
  if (error) return <ErrorMessage message={error} onRetry={onRetry} />;
  if (isLoading) return <LoadingSpinner />;

  return (
    <div className={cx("card-content stack col gap-4", className)}>
      {children}
    </div>
  );
}
