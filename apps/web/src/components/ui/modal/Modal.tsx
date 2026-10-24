import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
// Style
import "./Modal.css";
// Components
import { Button } from "@/components";
// Utils
import { cx } from "@/utils/cx";

interface ModalProps {
  title: string;
  onClose: () => void;
  /** Blocks Escape, the backdrop and the close button (e.g. while saving) */
  closeDisabled?: boolean;
  size?: "sm" | "md";
  className?: string;
  children: ReactNode;
}

export function Modal({
  title,
  onClose,
  closeDisabled = false,
  size = "md",
  className,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !closeDisabled) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, closeDisabled]);

  return createPortal(
    <div
      className="modal-overlay"
      onMouseDown={closeDisabled ? undefined : onClose}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={cx(
          "card modal-dialog stack col gap-4",
          size === "sm" && "sm",
          className,
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="stack row between middle nowrap">
          <h5 id={titleId}>{title}</h5>
          <Button
            variant="ghost"
            size="sm"
            iconName="xLg"
            iconSize={18}
            onClick={onClose}
            disabled={closeDisabled}
            aria-label="Close dialog"
          />
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
