import { memo, useState, type MouseEvent } from "react";
// Style
import "./ReportMatrix.css";
// Components
import { Button } from "@/components";
import { AmountCell } from "./AmountCell";
// Types
import type { Matrix, ReportSelection } from "@/types/report";
// Utils
import { cx } from "@/utils/cx";

type SelectHandler = (selection: ReportSelection) => void;

interface ReportMatrixProps {
  matrix: Matrix;
  compact: boolean;
  collapsed: string[];
  onToggle: (subtype: string) => void;
  onSelect: SelectHandler;
}

interface MatrixBodyProps extends Omit<ReportMatrixProps, "matrix"> {
  rows: Matrix["rows"];
  columns: Matrix["columns"];
  onHover: (col: number | null) => void;
}

const MatrixBody = memo(function MatrixBody({
  rows,
  columns,
  compact,
  collapsed,
  onToggle,
  onSelect,
  onHover,
}: MatrixBodyProps) {
  const visible = rows.filter(
    (row) => row.kind !== "witel" || !collapsed.includes(row.subtype ?? ""),
  );

  const handleOver = (event: MouseEvent<HTMLTableSectionElement>) => {
    const cell = (event.target as HTMLElement).closest<HTMLElement>(
      "td[data-col]",
    );
    onHover(cell ? Number(cell.dataset.col) : null);
  };

  return (
    <tbody onMouseOver={handleOver} onMouseLeave={() => onHover(null)}>
      {visible.map((row) => {
        const isCollapsed = collapsed.includes(row.subtype ?? "");

        return (
          <tr key={row.key} className={cx("matrix-row", `is-${row.kind}`)}>
            <th scope="row" className="matrix-witel">
              {row.kind === "subtype" && row.subtype ? (
                <Button
                  variant="ghost"
                  size="sm"
                  text={row.label}
                  iconName={isCollapsed ? "chevronRight" : "chevronDown"}
                  iconSize={12}
                  onClick={() => onToggle(row.subtype ?? "")}
                  aria-expanded={!isCollapsed}
                />
              ) : (
                row.label
              )}
            </th>
            {row.cells.map((cell, index) => {
              const column = columns[index];
              const select =
                (bucket = column.bucket) =>
                () =>
                  onSelect({
                    subtype: row.subtype,
                    witel: row.witel,
                    kategori: column.kategori,
                    bucket,
                  });

              return (
                <AmountCell
                  key={column.id}
                  col={index}
                  tone={column.tone}
                  total={column.total}
                  compact={compact}
                  amount={cell.amount}
                  warning={cell.warning}
                  onSelect={select()}
                  onSelectWarning={select("warning")}
                />
              );
            })}
          </tr>
        );
      })}
    </tbody>
  );
});

export function ReportMatrix({
  matrix,
  compact,
  collapsed,
  onToggle,
  onSelect,
}: ReportMatrixProps) {
  const [hoverCol, setHoverCol] = useState<number | null>(null);
  const { columns, rows } = matrix;
  const span = (columns.length - 1) / 2;
  const last = columns.length - 1;

  return (
    <div className="table-wrapper report-matrix">
      <table>
        <thead>
          <tr>
            <th rowSpan={2} className="matrix-witel">
              Witel
            </th>
            <th colSpan={span} className="matrix-group tone-safe">
              &lt;2 BLN
            </th>
            <th colSpan={span} className="matrix-group tone-primary">
              &gt;2 BLN
            </th>
            <th
              rowSpan={2}
              className={cx(
                "matrix-col tone-secondary",
                hoverCol === last && "is-hover",
              )}
            >
              Grand total
            </th>
          </tr>
          <tr>
            {columns.slice(0, last).map((column, index) => (
              <th
                key={column.id}
                className={cx(
                  "matrix-col",
                  `tone-${column.tone}`,
                  hoverCol === index && "is-hover",
                )}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <MatrixBody
          rows={rows}
          columns={columns}
          compact={compact}
          collapsed={collapsed}
          onToggle={onToggle}
          onSelect={onSelect}
          onHover={setHoverCol}
        />
      </table>
    </div>
  );
}
