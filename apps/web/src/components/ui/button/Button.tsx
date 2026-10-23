import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import type { ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";
// Style
import "./Button.css";
// Components
import { Icon } from "@/components";
// Types
import type { IconsType } from "@/types/icons";
// Utils
import { cx } from "@/utils/cx";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "md" | "sm";

interface ButtonOwnProps {
  text?: string;
  /** Wins over `text` */
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Full width */
  block?: boolean;
  pill?: boolean;
  iconName?: IconsType;
  iconAfter?: boolean;
  iconSize?: number;
  /** Shows a spinner and disables the button */
  loading?: boolean;
  className?: string;
}

type OwnKeys = keyof ButtonOwnProps;

type ButtonAsButton = ButtonOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, OwnKeys> & {
    to?: undefined;
    href?: undefined;
  };

/** Internal route */
type ButtonAsRouterLink = ButtonOwnProps &
  Omit<LinkProps, OwnKeys> & { to: LinkProps["to"]; href?: undefined };

/** External URL (opens in a new tab) */
type ButtonAsAnchor = ButtonOwnProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, OwnKeys | "href"> & {
    href: string;
    to?: undefined;
  };

export type ButtonProps = ButtonAsButton | ButtonAsRouterLink | ButtonAsAnchor;

/** Styles live in Button.css (.btn + variant/size modifiers). */
export function Button(props: ButtonProps) {
  const {
    text,
    children,
    variant = "primary",
    size = "md",
    block = false,
    pill = false,
    iconName,
    iconAfter = false,
    iconSize,
    loading = false,
    className,
    ...rest
  } = props;

  const label = children ?? text;
  const isIconOnly = !label && !!iconName;

  const classes = cx(
    "btn",
    variant,
    size === "sm" && "sm",
    isIconOnly && "icon",
    block && "block",
    pill && "pill",
    className,
  );

  const icon = loading ? (
    <span className="spinner sm" aria-hidden="true" />
  ) : iconName ? (
    <Icon iconName={iconName} size={iconSize ?? (size === "sm" ? 14 : 16)} />
  ) : null;

  const content = (
    <>
      {!iconAfter && icon}
      {label && <span>{label}</span>}
      {iconAfter && icon}
    </>
  );

  if (props.to !== undefined) {
    return (
      <Link
        {...(rest as Omit<LinkProps, OwnKeys>)}
        to={props.to}
        className={classes}
      >
        {content}
      </Link>
    );
  }

  if (props.href !== undefined) {
    return (
      <a
        target="_blank"
        rel="noopener noreferrer"
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
        href={props.href}
        className={classes}
      >
        {content}
      </a>
    );
  }

  const {
    disabled,
    type = "button",
    ...buttonProps
  } = rest as ButtonHTMLAttributes<HTMLButtonElement>;

  return (
    <button
      {...buttonProps}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {content}
    </button>
  );
}
