import { useMutation } from "@tanstack/react-query";
import type { ApiResponse, Order } from "@rso/shared";
// Hooks
import { useExportControls } from "./useExportControls";
// Config
import { api } from "@/config/api";
// Contexts
import { useAuth } from "@/contexts/auth";
// Types
import type { ReportSelection } from "@/types/report";
import type { SheetSpec } from "@/types/workbook";
// Utils
import { buildOrdersSheet } from "@/utils/orders";
import { selectionQuery } from "@/utils/report";

interface ExportJob {
  filter: ReportSelection;
  filename: string;
  summary?: SheetSpec;
}

export function useReportExport() {
  const { isAdmin } = useAuth();
  const controls = useExportControls();

  const mutation = useMutation({
    mutationFn: async ({ filter, filename, summary }: ExportJob) => {
      const res = await api<ApiResponse<Order[]>>(
        "/reports/regional-3/export",
        { query: selectionQuery(filter) },
      );
      const orders = res.data ?? [];
      if (orders.length === 0) {
        throw new Error("There are no orders to export for this selection.");
      }

      const sheets = [
        ...(summary ? [summary] : []),
        buildOrdersSheet(orders, isAdmin),
      ];
      await controls.runSheets(sheets, filename);
    },
  });

  return {
    error: mutation.error?.message ?? null,
    run: (job: ExportJob) => mutation.mutate(job),
    controls: (onExport: () => void, disabled = false) => ({
      format: controls.format,
      options: controls.options,
      onFormatChange: controls.setFormat,
      onExport,
      loading: mutation.isPending,
      disabled,
    }),
  };
}

export type ReportExporterApi = ReturnType<typeof useReportExport>;
