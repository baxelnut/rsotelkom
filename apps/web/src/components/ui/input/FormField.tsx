import type { ReactNode } from "react";
// Style
import "./FormField.css";
// Utils
import { cx } from "@/utils/cx";

interface FormFieldProps {
  /** id of the control inside; links the label and helper text */
  id: string;
  label?: string;
  hint?: string;
  error?: string;
  /** Full width on desktop too (always full width on mobile) */
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}

/** Label + control + hint/error. Shared by InputField, TextareaField and Dropdown. */
export function FormField({
  id,
  label,
  hint,
  error,
  fullWidth = false,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cx("field form-field", fullWidth && "block", className)}>
      {label && <label htmlFor={id}>{label}</label>}
      {children}
      {error ? (
        <p id={`${id}-error`} className="text sm danger" role="alert">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text sm muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
