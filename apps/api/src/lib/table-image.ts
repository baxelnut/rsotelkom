import path from "node:path";
import { Resvg } from "@resvg/resvg-js";

type Align = "left" | "right" | "center";

export interface TableSpec {
  title: string;
  subtitle: string;
  columns: { header: string; align?: Align }[];
  rows: string[][];
  footer?: string[];
}

const FONT_DIR = path.join(process.cwd(), "assets", "fonts");
const CHAR_W = 8.6;
const PAD_X = 16;
const ROW_H = 36;
const HEAD_H = 72;
const BRAND = "#E81E28";
const DARK = "#2C2C2C";

const xml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function widths(spec: TableSpec): number[] {
  return spec.columns.map((column, index) => {
    const cells = [
      column.header,
      ...spec.rows.map((row) => row[index] ?? ""),
      spec.footer?.[index] ?? "",
    ];
    const longest = Math.max(...cells.map((cell) => cell.length));
    return Math.max(70, Math.ceil(longest * CHAR_W + PAD_X * 2));
  });
}

function anchor(align: Align = "left") {
  return align === "right" ? "end" : align === "center" ? "middle" : "start";
}

function textX(left: number, width: number, align: Align = "left") {
  if (align === "right") return left + width - PAD_X;
  if (align === "center") return left + width / 2;
  return left + PAD_X;
}

function buildSvg(spec: TableSpec): string {
  const cols = widths(spec);
  const tableW = cols.reduce((sum, w) => sum + w, 0);
  const width = Math.max(tableW, 480);
  const bodyRows = spec.rows.length + 1 + (spec.footer ? 1 : 0);
  const height = HEAD_H + bodyRows * ROW_H + 12;

  const lefts = cols.map((_, i) => cols.slice(0, i).reduce((s, w) => s + w, 0));
  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" font-family="Inter">`,
    `<rect width="${width}" height="${height}" fill="#ffffff"/>`,
    `<text x="${PAD_X}" y="30" font-size="20" font-weight="700" fill="${DARK}">${xml(spec.title)}</text>`,
    `<text x="${PAD_X}" y="54" font-size="14" fill="#6a6e6e">${xml(spec.subtitle)}</text>`,
  ];

  const row = (
    cells: string[],
    top: number,
    fill: string,
    color: string,
    weight: number,
  ) => {
    parts.push(
      `<rect x="0" y="${top}" width="${tableW}" height="${ROW_H}" fill="${fill}"/>`,
    );
    cells.forEach((cell, i) => {
      const { align } = spec.columns[i];
      parts.push(
        `<text x="${textX(lefts[i], cols[i], align)}" y="${top + ROW_H / 2 + 5}" font-size="15" font-weight="${weight}" fill="${color}" text-anchor="${anchor(align)}">${xml(cell)}</text>`,
      );
    });
  };

  row(
    spec.columns.map((c) => c.header),
    HEAD_H,
    BRAND,
    "#ffffff",
    700,
  );
  spec.rows.forEach((cells, index) =>
    row(
      cells,
      HEAD_H + (index + 1) * ROW_H,
      index % 2 === 0 ? "#ffffff" : "#f3f4f4",
      DARK,
      index === 0 ? 400 : 400,
    ),
  );
  if (spec.footer) {
    row(
      spec.footer,
      HEAD_H + (spec.rows.length + 1) * ROW_H,
      DARK,
      "#ffffff",
      700,
    );
  }

  parts.push("</svg>");
  return parts.join("");
}

export function renderTablePng(spec: TableSpec): Uint8Array {
  const resvg = new Resvg(buildSvg(spec), {
    fitTo: { mode: "zoom", value: 2 },
    font: {
      loadSystemFonts: false,
      defaultFontFamily: "Inter",
      fontFiles: [
        path.join(FONT_DIR, "Inter-Regular.ttf"),
        path.join(FONT_DIR, "Inter-Bold.ttf"),
      ],
    },
  });
  return resvg.render().asPng();
}

export function renderTableText(spec: TableSpec): string {
  const all = [
    spec.columns.map((c) => c.header),
    ...spec.rows,
    ...(spec.footer ? [spec.footer] : []),
  ];
  const w = spec.columns.map((_, i) =>
    Math.max(...all.map((r) => (r[i] ?? "").length)),
  );
  const line = (cells: string[]) =>
    cells
      .map((cell, i) =>
        spec.columns[i].align === "right"
          ? cell.padStart(w[i])
          : cell.padEnd(w[i]),
      )
      .join("  ");
  const rule = "-".repeat(w.reduce((s, n) => s + n, 0) + (w.length - 1) * 2);
  return [
    line(all[0]),
    rule,
    ...all.slice(1, spec.footer ? -1 : undefined).map(line),
    ...(spec.footer ? [rule, line(spec.footer)] : []),
  ].join("\n");
}
