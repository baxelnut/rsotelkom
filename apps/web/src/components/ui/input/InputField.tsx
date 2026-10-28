import { useId, useState, type InputHTMLAttributes } from "react";
// Style
import "./InputField.css";
// Components
import { FormField, Icon } from "@/components";
// Utils
import { cx } from "@/utils/cx";
import { describedBy } from "@/utils/form";

interface InputFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "id"
> {
  name: string;
  label?: string;
  hint?: string;
  error?: string;
  fullWidth?: boolean;
  /** type="password" only: adds a show/hide button */
  obscurial?: boolean;
  readonly?: boolean;
}

export function InputField({
  name,
  label,
  hint,
  error,
  fullWidth,
  obscurial = false,
  type = "text",
  className,
  readOnly = false,
  ...rest
}: InputFieldProps) {
  const id = useId();
  const [showPassword, setShowPassword] = useState(false);
  const hasToggle = type === "password" && obscurial;

  return (
    <FormField
      id={id}
      label={label}
      hint={hint}
      error={error}
      fullWidth={fullWidth}
    >
      <div className="input-field">
        <input
          id={id}
          name={name}
          type={hasToggle && showPassword ? "text" : type}
          className={cx(
            "input",
            hasToggle && "input--toggle",
            readOnly && "input--read-only",
            className,
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          {...rest}
        />
        {hasToggle && (
          <button
            type="button"
            className="btn ghost icon sm input-field__toggle"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            <Icon iconName={showPassword ? "eyeSlash" : "eye"} size={18} />
          </button>
        )}
      </div>
    </FormField>
  );
}
