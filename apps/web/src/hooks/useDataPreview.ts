import { useMemo, useState } from "react";
// Hooks
import { queryState } from "./queryState";
import { useExport } from "./useExport";
import { useOrders } from "./useOrders";
// Config
import {
  ADMIN_ONLY_COLUMNS,
  EXPORT_OPTIONS,
  ROWS_PER_PAGE_OPTIONS,
  type ExportFormat,
} from "@/config/overview";
// Contexts
import { useAuth } from "@/contexts/auth";

type Row = Record<string, unknown>;

export function useDataPreview() {
  const { isAdmin } = useAuth();
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(20);
  const [format, setFormat] = useState<ExportFormat>("xlsx");
  const query = useOrders({ page: page + 1, limit });
  const { exportRows, isExporting } = useExport();

  const rows = useMemo<Row[]>(
    () =>
      (query.data?.data ?? []).map((order) =>
        Object.fromEntries(
          Object.entries(order).filter(
            ([key]) => isAdmin || !ADMIN_ONLY_COLUMNS.includes(key),
          ),
        ),
      ),
    [query.data, isAdmin],
  );
  const total = query.data?.meta.total ?? 0;

  return {
    ...queryState(query),
    isFetching: query.isFetching,
    rows,
    total,
    pagination: { page, pageSize: limit, total, onPageChange: setPage },
    limit,
    limitOptions: ROWS_PER_PAGE_OPTIONS,
    setLimit: (value: string) => {
      setLimit(Number(value));
      setPage(0);
    },
    format,
    exportOptions: EXPORT_OPTIONS,
    setFormat: (value: string) => setFormat(value as ExportFormat),
    isExporting,
    exportCurrent: () => exportRows(format, rows, "Data Preview"),
  };
}

export type DataPreviewApi = ReturnType<typeof useDataPreview>;
