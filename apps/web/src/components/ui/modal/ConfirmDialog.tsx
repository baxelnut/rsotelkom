// Style
import "./ConfirmDialog.css";
// Components
import { Button, Modal } from "@/components";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmText: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmText,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={onCancel} closeDisabled={loading} size="sm">
      <p className="text sm">{message}</p>
      <div className="stack row end gap-2">
        <Button
          text="Cancel"
          variant="ghost"
          onClick={onCancel}
          disabled={loading}
        />
        <Button
          text={confirmText}
          variant="secondary"
          onClick={onConfirm}
          loading={loading}
        />
      </div>
    </Modal>
  );
}
