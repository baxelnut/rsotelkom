import { useId, type TextareaHTMLAttributes } from "react";
// Style
import "./TextareaField.css";
// Components
import { FormField } from "@/components";
// Utils
import { cx } from "@/utils/cx";
import { describedBy } from "@/utils/form";

interface TextareaFieldProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "id"
> {
  name: string;
  label?: string;
  hint?: string;
  error?: string;
  fullWidth?: boolean;
  /** Let the user drag to resize vertically */
  resizable?: boolean;
}

export function TextareaField({
  name,
  label,
  hint,
  error,
  fullWidth,
  resizable = false,
  rows = 4,
  className,
  ...rest
}: TextareaFieldProps) {
  const id = useId();

  return (
    <FormField
      id={id}
      label={label}
      hint={hint}
      error={error}
      fullWidth={fullWidth}
    >
      <textarea
        id={id}
        name={name}
        rows={rows}
        className={cx("input textarea", resizable && "resizable", className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        {...rest}
      />
    </FormField>
  );
}
