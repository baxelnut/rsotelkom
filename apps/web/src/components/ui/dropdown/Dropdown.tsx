import { useId, type SelectHTMLAttributes } from "react";
// Style
import "./Dropdown.css";
// Components
import { FormField, Icon } from "@/components";
// Types
import type { IconsType } from "@/types/icons";
// Utils
import { cx } from "@/utils/cx";
import { describedBy } from "@/utils/form";

export interface DropdownOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface DropdownGroup {
  label: string;
  options: DropdownOption[];
}

export type DropdownItem = DropdownOption | DropdownGroup;

interface DropdownProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "id" | "children"
> {
  name: string;
  options: DropdownItem[];
  label?: string;
  hint?: string;
  error?: string;
  fullWidth?: boolean;
  pill?: boolean;
  size?: "md" | "sm";
  /** Replaces the default chevron */
  iconName?: IconsType;
}

function isGroup(item: DropdownItem): item is DropdownGroup {
  return "options" in item;
}

function renderOption(option: DropdownOption) {
  return (
    <option key={option.value} value={option.value} disabled={option.disabled}>
      {option.label}
    </option>
  );
}

export function Dropdown({
  name,
  options,
  label,
  hint,
  error,
  fullWidth,
  pill = false,
  size = "md",
  iconName,
  className,
  ...rest
}: DropdownProps) {
  const id = useId();

  return (
    <FormField
      id={id}
      label={label}
      hint={hint}
      error={error}
      fullWidth={fullWidth}
    >
      <div className="dropdown">
        <select
          id={id}
          name={name}
          className={cx(
            "input dropdown__select",
            pill && "pill",
            size === "sm" && "sm",
            className,
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          {...rest}
        >
          {options.map((item) =>
            isGroup(item) ? (
              <optgroup key={item.label} label={item.label}>
                {item.options.map(renderOption)}
              </optgroup>
            ) : (
              renderOption(item)
            ),
          )}
        </select>

        <span className="dropdown__icon">
          <Icon
            iconName={iconName ?? "chevronDown"}
            size={12}
            fillRule={iconName ? undefined : "evenodd"}
          />
        </span>
      </div>
    </FormField>
  );
}
