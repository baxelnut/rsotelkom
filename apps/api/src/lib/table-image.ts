import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import { Align, GridSpec, TableSpec } from "../types/table-image.types";

const here = path.dirname(fileURLToPath(import.meta.url));

const FONT_DIR_CANDIDATES = [
  path.resolve(process.cwd(), "assets/fonts"), // cwd = apps/api
  path.resolve(process.cwd(), "apps/api/assets/fonts"), // cwd = repo root
  path.resolve(here, "../../assets/fonts"), // src/lib or dist/lib
  path.resolve(here, "../assets/fonts"), // bundled dist/index.js
  path.resolve(here, "../../../assets/fonts"), // dist/src/lib
];

function findFonts(): string[] {
  const names = ["Inter-Regular.ttf", "Inter-Bold.ttf"];
  for (const dir of FONT_DIR_CANDIDATES) {
    const files = names.map((n) => path.join(dir, n));
    if (files.every((f) => fs.existsSync(f))) return files;
  }
  throw new Error(
    `table fonts not found. cwd=${process.cwd()} tried:\n${FONT_DIR_CANDIDATES.join("\n")}`,
  );
}

const CHAR_W = 8.6;
const PAD_X = 16;
const ROW_H = 36;
const HEAD_H = 72;
const BRAND = "#312A68";
const DARK = "#2C2C2C";

const xml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const HEAD_ROW_H = 34;

function gridWidths(spec: GridSpec): number[] {
  return Array.from({ length: spec.cols }, (_, c) => {
    const texts = [
      ...spec.head
        .filter((h) => h.col === c && (h.colSpan ?? 1) === 1)
        .map((h) => h.text),
      ...spec.rows.flatMap((r) => {
        const x = r.cells[c];
        return x ? [x.text, x.sub ?? "", x.warn ? "0000" : ""] : [];
      }),
    ];
    const longest = Math.max(0, ...texts.map((t) => t.length));
    return Math.max(
      c === 0 ? 150 : 84,
      Math.ceil(longest * CHAR_W + PAD_X * 2),
    );
  });
}

function gridSvg(spec: GridSpec): string {
  const cols = gridWidths(spec);
  const lefts = cols.map((_, i) => cols.slice(0, i).reduce((s, w) => s + w, 0));
  const tableW = cols.reduce((s, w) => s + w, 0);
  const width = Math.max(tableW, 480);
  const headH = spec.headRows * HEAD_ROW_H;
  const heights = spec.rows.map((r) =>
    r.cells.some((c) => c.warn) ? 78 : r.cells.some((c) => c.sub) ? 54 : ROW_H,
  );
  const height = HEAD_H + headH + heights.reduce((s, h) => s + h, 0) + 12;

  const p: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" font-family="Inter">`,
    `<rect width="${width}" height="${height}" fill="#ffffff"/>`,
    `<text x="${PAD_X}" y="30" font-size="20" font-weight="700" fill="${DARK}">${xml(spec.title)}</text>`,
    `<text x="${PAD_X}" y="54" font-size="14" fill="#6a6e6e">${xml(spec.subtitle)}</text>`,
  ];

  for (const h of spec.head) {
    const span = h.colSpan ?? 1;
    const x = lefts[h.col];
    const w = cols.slice(h.col, h.col + span).reduce((s, v) => s + v, 0);
    const y = HEAD_H + h.row * HEAD_ROW_H;
    const hh = (h.rowSpan ?? 1) * HEAD_ROW_H;
    p.push(
      `<rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="#e8e9e9" stroke="#d9dbdb"/>`,
    );
    if (h.underline) {
      p.push(
        `<rect x="${x}" y="${y + hh - 3}" width="${w}" height="3" fill="${h.underline}"/>`,
      );
    }
    const left = h.col === 0;
    p.push(
      `<text x="${left ? x + PAD_X : x + w / 2}" y="${y + hh / 2 + 5}" font-size="14" font-weight="700" fill="${h.color ?? DARK}" text-anchor="${left ? "start" : "middle"}">${xml(h.text)}</text>`,
    );
  }

  let top = HEAD_H + headH;
  spec.rows.forEach((row, ri) => {
    const rh = heights[ri];
    row.cells.forEach((cell, c) => {
      const x = lefts[c];
      const w = cols[c];
      const color = cell.color ?? row.color;
      const weight = (cell.bold ?? row.bold) ? 700 : 400;
      const left = c === 0;
      const tx = left ? x + PAD_X : x + w / 2;
      const a = left ? "start" : "middle";

      p.push(
        `<rect x="${x}" y="${top}" width="${w}" height="${rh}" fill="${cell.fill ?? row.fill}"/>`,
      );
      p.push(
        `<rect x="${x}" y="${top + rh - 1}" width="${w}" height="1" fill="#000000" fill-opacity="0.08"/>`,
      );

      if (cell.badge) {
        const bw = cell.text.length * CHAR_W + 22;
        p.push(
          `<rect x="${tx - bw / 2}" y="${top + rh / 2 - 11}" width="${bw}" height="22" rx="11" fill="${cell.badge.fill}"/>`,
          `<text x="${tx}" y="${top + rh / 2 + 5}" font-size="13" font-weight="700" fill="${cell.badge.color}" text-anchor="middle">${xml(cell.text)}</text>`,
        );
      } else if (cell.sub || cell.warn) {
        const y0 = top + 8;
        p.push(
          `<text x="${tx}" y="${y0 + 16}" font-size="16" font-weight="700" fill="${color}" text-anchor="${a}">${xml(cell.text)}</text>`,
        );
        if (cell.sub) {
          p.push(
            `<text x="${tx}" y="${y0 + 32}" font-size="12" fill="${color}" fill-opacity="0.75" text-anchor="${a}">${xml(cell.sub)}</text>`,
          );
        }
        if (cell.warn) {
          const wc = row.warnColor ?? "#8a6300";
          const py = top + rh - 26;
          p.push(
            `<rect x="${tx - 26}" y="${py}" width="52" height="20" rx="10" fill="none" stroke="${wc}" stroke-width="1.5"/>`,
            `<polygon points="${tx - 19},${py + 15} ${tx - 14},${py + 5} ${tx - 9},${py + 15}" fill="${wc}"/>`,
            `<text x="${tx + 8}" y="${py + 14}" font-size="12" font-weight="700" fill="${wc}" text-anchor="middle">${xml(cell.warn)}</text>`,
          );
        }
      } else {
        p.push(
          `<text x="${tx}" y="${top + rh / 2 + 5}" font-size="15" font-weight="${weight}" fill="${color}" text-anchor="${a}">${xml(cell.text)}</text>`,
        );
      }
    });
    top += rh;
  });

  p.push("</svg>");
  return p.join("");
}

export function renderGridPng(spec: GridSpec): Uint8Array {
  const resvg = new Resvg(gridSvg(spec), {
    fitTo: { mode: "zoom", value: 2 },
    font: {
      loadSystemFonts: false,
      defaultFontFamily: "Inter",
      fontFiles: findFonts(),
    },
  });
  return resvg.render().asPng();
}

// Plain-text fallback if the image fails
export function renderGridText(spec: GridSpec): string {
  const lines = spec.rows.map((r) =>
    r.cells.map((c) => (c.warn ? `${c.text}(!${c.warn})` : c.text)).join(" | "),
  );
  const header = spec.head
    .filter((h) => h.row === spec.headRows - 1 || h.rowSpan === spec.headRows)
    .sort((a, b) => a.col - b.col)
    .map((h) => h.text)
    .join(" | ");
  return [spec.title, spec.subtitle, "", header, ...lines].join("\n");
}

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
      fontFiles: findFonts(),
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
