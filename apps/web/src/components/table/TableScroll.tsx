import type { ReactNode } from "react";
// Style
import "./TableScroll.css";
// Components
import { EmptyMessage } from "@/components";
// Utils
import { cx } from "@/utils/cx";

export interface TableColumn<T> {
  key: keyof T & string;
  /** Header text. Defaults to the key */
  label?: string;
  align?: "start" | "center" | "end";
  /** Custom cell content (badges, links, formatted numbers...) */
  render?: (value: T[keyof T], row: T) => ReactNode;
}

export interface TableScrollProps<T extends Record<string, unknown>> {
  data: T[];
  /** Zero-based page, for the row numbers */
  currentPage?: number;
  rowsPerPage?: number;
  /** Defaults to every key of the first row */
  columns?: TableColumn<T>[];
  showIndex?: boolean;
  getRowKey?: (row: T, index: number) => string | number;
  className?: string;
}

/** null, undefined, "" and "NULL" all mean "no value". 0 and false are real values. */
function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const text = String(value).trim();
  return text.toUpperCase() === "NULL" ? "" : text;
}

export function TableScroll<T extends Record<string, unknown>>({
  data,
  currentPage = 0,
  rowsPerPage = data.length,
  columns,
  showIndex = true,
  getRowKey,
  className,
}: TableScrollProps<T>) {
  if (data.length === 0) {
    return (
      <div className={cx("table-wrapper", className)}>
        <EmptyMessage />
      </div>
    );
  }

  const cols: TableColumn<T>[] =
    columns ??
    (Object.keys(data[0]) as Array<keyof T & string>).map((key) => ({ key }));

  return (
    <div className={cx("table-wrapper table-scroll", className)}>
      <table>
        <thead>
          <tr>
            {showIndex && (
              <th className="table-scroll__index" aria-label="Row number">
                #
              </th>
            )}
            {cols.map(({ key, label, align }) => (
              <th
                key={key}
                scope="col"
                className={cx(align && `align-${align}`)}
              >
                {label ?? key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={getRowKey?.(row, rowIndex) ?? rowIndex}>
              {showIndex && (
                <td className="table-scroll__index">
                  {currentPage * rowsPerPage + rowIndex + 1}
                </td>
              )}
              {cols.map(({ key, align, render }) => {
                const tdClass = cx(align && `align-${align}`);

                if (render) {
                  return (
                    <td key={key} className={tdClass}>
                      {render(row[key], row)}
                    </td>
                  );
                }

                const text = formatCell(row[key]);
                return (
                  <td key={key} className={tdClass}>
                    <span
                      className={cx("table-scroll__cell", !text && "is-empty")}
                      title={text || undefined}
                    >
                      {text || "-"}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
