// Style
import "./DataTable.css";
// Components
import { CustomPagination, TableScroll, type TableColumn } from "@/components";
import { EmptyMessage, ErrorMessage, SkeletonTable } from "@/components";
// Utils
import { cx } from "@/utils/cx";

export interface DataTablePagination {
  /** Zero-based current page */
  page: number;
  pageSize: number;
  /** Total rows on the server, not just this page */
  total: number;
  onPageChange: (page: number) => void;
}

export interface DataTableProps<T extends Record<string, unknown>> {
  /** Rows of the current page. null/undefined = not loaded yet */
  data: T[] | null | undefined;
  isLoading?: boolean;
  error?: string | Error | null;
  /** Shows "Coba lagi" in the error state, e.g. the hook's refetch */
  onRetry?: () => void;
  columns?: TableColumn<T>[];
  getRowKey?: (row: T, index: number) => string | number;
  pagination?: DataTablePagination;
  emptyTitle?: string;
  emptyMessage?: string;
  className?: string;
}

/**
 * Renders the result of a fetch hook:
 *   error -> ErrorMessage, first load -> LoadingSpinner, no rows -> EmptyMessage,
 *   rows -> table (+ pager). Reloading with rows already shown dims them with
 *   a spinner overlay instead of flashing the whole table away.
 *
 * Usage:
 *   const { data, isLoading, error, refetch } = useSomething(page);
 *   <DataTable data={data?.rows} isLoading={isLoading} error={error}
 *              onRetry={refetch} pagination={{ page, pageSize, total, onPageChange: setPage }} />
 */
export function DataTable<T extends Record<string, unknown>>({
  data,
  isLoading = false,
  error,
  onRetry,
  columns,
  getRowKey,
  pagination,
  emptyTitle,
  emptyMessage,
  className,
}: DataTableProps<T>) {
  const hasRows = !!data && data.length > 0;
  const errorMessage = error
    ? typeof error === "string"
      ? error
      : error.message
    : null;
  const pageCount = pagination
    ? Math.ceil(pagination.total / pagination.pageSize)
    : 0;

  let body;
  if (errorMessage) {
    body = (
      <div className="table-wrapper data-table__state">
        <ErrorMessage message={errorMessage} onRetry={onRetry} />
      </div>
    );
  } else if (!hasRows && isLoading) {
    body = (
      <div className="table-wrapper data-table__state">
        <SkeletonTable />
      </div>
    );
  } else if (!hasRows) {
    body = (
      <div className="table-wrapper data-table__state">
        <EmptyMessage title={emptyTitle} message={emptyMessage} />
      </div>
    );
  } else {
    body = (
      <TableScroll
        data={data}
        columns={columns}
        getRowKey={getRowKey}
        currentPage={pagination?.page}
        rowsPerPage={pagination?.pageSize}
      />
    );
  }

  return (
    <div
      className={cx("data-table stack col gap-3", className)}
      aria-busy={isLoading}
    >
      <div
        className={cx(
          "data-table__body",
          hasRows && isLoading && "is-refreshing",
        )}
      >
        {body}
      </div>

      {pagination && hasRows && !errorMessage && (
        <CustomPagination
          pageCount={pageCount}
          forcePage={pagination.page}
          onPageChange={pagination.onPageChange}
        />
      )}
    </div>
  );
}
