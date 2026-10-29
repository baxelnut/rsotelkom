import type { InputHTMLAttributes, ReactNode } from "react";
// Style
import "./Checkbox.css";
// Utils
import { cx } from "@/utils/cx";

interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "onChange"
> {
  /** Text or elements (e.g. a link). Plain React, never raw HTML */
  label: ReactNode;
  onChange?: (checked: boolean) => void;
  /** Box after the label */
  reverse?: boolean;
}

/** Controlled with `checked`, uncontrolled with `defaultChecked` */
export function Checkbox({
  label,
  onChange,
  reverse = false,
  className,
  ...rest
}: CheckboxProps) {
  return (
    <label
      className={cx(
        "checkbox stack middle nowrap fit gap-2",
        reverse ? "row-reverse" : "row",
        className,
      )}
    >
      <input
        type="checkbox"
        onChange={(e) => onChange?.(e.target.checked)}
        {...rest}
      />
      <span className="text sm">{label}</span>
    </label>
  );
}
