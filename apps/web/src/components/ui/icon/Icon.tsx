import type { CSSProperties, ElementType } from "react";
import type { MouseEventHandler, ReactNode } from "react";
// Style
import "./Icon.css";
// Assets
import { SVG_PATHS } from "@/assets/icons";
import type { IconsType } from "@/types/icons";
// Utils
import { cx } from "@/utils/cx";

// Types
type SVGShapeType =
  | "path"
  | "circle"
  | "rect"
  | "ellipse"
  | "line"
  | "polyline"
  | "polygon";

interface IconShape {
  type: string;
  [key: string]: unknown;
}

/** A path string, a list of path strings, or a list of mixed shape objects */
type IconData = string | Array<string | IconShape> | ReactNode;

interface IconProps {
  /** Raw icon data. Wins over `iconName` */
  path?: IconData;
  /** Key of SVG_PATHS in @barito-bahalap/icons */
  iconName?: IconsType;
  size?: number | string;
  /** Defaults to currentColor, so the icon follows its parent's text color */
  fill?: string;
  fillHover?: string;
  stroke?: string;
  strokeWidth?: number;
  /** Needed by some Bootstrap-style paths (e.g. chevrons) */
  fillRule?: "evenodd" | "nonzero";
  viewBox?: string;
  onClick?: MouseEventHandler<SVGSVGElement>;
  style?: CSSProperties;
  /** Renders a text label next to the icon */
  label?: string;
  className?: string;
  /** Makes the icon meaningful to screen readers. Omit for decorative icons */
  ariaLabel?: string;
  pointer?: boolean;
}

const SHAPE_COMPONENTS: Record<SVGShapeType, ElementType> = {
  path: "path",
  circle: "circle",
  rect: "rect",
  ellipse: "ellipse",
  line: "line",
  polyline: "polyline",
  polygon: "polygon",
};

function isValidShapeType(type: string): type is SVGShapeType {
  return type in SHAPE_COMPONENTS;
}

function renderShapes(data: IconData): ReactNode {
  if (!data) return null;
  if (typeof data === "string") return <path d={data} />;
  if (Array.isArray(data)) {
    return (data as Array<string | IconShape>).map((item, i) => {
      if (typeof item === "string") return <path key={i} d={item} />;
      const { type, ...props } = item;
      if (!isValidShapeType(type)) return null;
      const Tag = SHAPE_COMPONENTS[type];
      return <Tag key={i} {...props} />;
    });
  }
  return data as ReactNode;
}

export function Icon({
  path,
  iconName,
  size = 20,
  fill = "currentColor",
  fillHover = fill,
  stroke = "none",
  strokeWidth = 2,
  fillRule,
  viewBox = "0 0 16 16",
  onClick,
  style,
  label,
  className,
  ariaLabel,
  pointer = false,
}: IconProps) {
  const registry = SVG_PATHS as Record<string, IconData>;
  const data: IconData = path ?? (iconName ? registry[iconName] : null);

  const cssVars = {
    "--icon-fill": fill,
    "--icon-fill-hover": fillHover,
  } as CSSProperties;

  const svg = (
    <span className="icon-svg">
      <svg
        className={cx("app-icon", pointer && "app-icon--pointer", className)}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox={viewBox}
        fill={fill}
        fillRule={fillRule}
        stroke={stroke}
        strokeWidth={stroke !== "none" ? strokeWidth : undefined}
        onClick={onClick}
        style={{ ...style, ...cssVars }}
        aria-label={ariaLabel}
        aria-hidden={ariaLabel ? undefined : true}
        role={ariaLabel ? "img" : undefined}
      >
        {renderShapes(data)}
      </svg>
    </span>
  );

  if (!label) return svg;

  return (
    <span className="stack row middle fit gap-2 icon-container">
      {svg}
      <span className="icon-label" style={{ color: fill }}>
        {label}
      </span>
    </span>
  );
}
