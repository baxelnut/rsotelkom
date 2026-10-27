// Style
import "./ErrorMessage.css";
// Components
import { Button, Icon } from "@/components";
// Utils
import { cx } from "@/utils/cx";

interface ErrorMessageProps {
  message?: string | null;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({
  message,
  onRetry,
  className,
}: ErrorMessageProps) {
  const text = message?.trim() || "Gagal memuat data.";

  return (
    <div
      className={cx("error-message stack col center gap-2", className)}
      role="alert"
    >
      <span className="error-message__icon">
        <Icon iconName="exclamationTriangleFill" size={22} />
      </span>
      <p className="text sm semibold center danger">{text}</p>
      {onRetry && (
        <Button
          text="Coba lagi"
          size="sm"
          variant="outline"
          onClick={onRetry}
        />
      )}
    </div>
  );
}
