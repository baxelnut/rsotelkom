import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { ReportAlert } from "@rso/shared";
// Hooks
import { useReportItems, useUpdateOrder, type ReportExporterApi } from ".";
// Config
import { ALERT_LABEL } from "@/config/action";
import { ROWS_PER_PAGE_OPTIONS } from "@/config/overview";
import { BUCKET_LABEL, IN_PROCESS, PAGE_SIZE_DEFAULT } from "@/config/report";
// Contexts
import { useAuth } from "@/contexts/auth";
// Types
import type { ActionSelect, ReportSelection } from "@/types/report";
// Utils
import { alertOf } from "@/utils/action";
import { makeFilename } from "@/utils/download";
import { toReportRow } from "@/utils/orders";
import { readSelection, selectionQuery, writeSelection } from "@/utils/report";

const KEEP_COLUMNS = ["uuid", "status", "notes"];
const ALERT_ALL = "SEMUA";

export function useActionDrilldown(exporter: ReportExporterApi) {
  const { isAdmin } = useAuth();
  const [params, setParams] = useSearchParams();
  const [limit, setLimit] = useState(PAGE_SIZE_DEFAULT);
  const update = useUpdateOrder();

  const selection = useMemo(() => readSelection(params), [params]);
  const page = Math.max(0, (Number(params.get("page")) || 1) - 1);

  const query = useReportItems(
    selection ? { ...selectionQuery(selection), page: page + 1, limit } : null,
  );

  const showAlert = selection?.bucket === "lt2";
  const countBase = showAlert
    ? selectionQuery({ ...selection, alert: undefined })
    : null;
  const aman = useReportItems(
    countBase
      ? { ...countBase, alert: "aman" as const, page: 1, limit: 1 }
      : null,
  );
  const segera = useReportItems(
    countBase
      ? { ...countBase, alert: "segera" as const, page: 1, limit: 1 }
      : null,
  );

  const orders = query.data?.data;
  const rows = useMemo(
    () =>
      (orders ?? []).map((order) => ({
        ...toReportRow(order, isAdmin, KEEP_COLUMNS),
        alert: alertOf(order),
      })),
    [orders, isAdmin],
  );
  const total = query.data?.meta.total ?? 0;

  const patchParams = (change: (next: URLSearchParams) => void) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        change(next);
        return next;
      },
      { replace: true },
    );

  const setPage = (next: number) =>
    patchParams((p) =>
      next > 0 ? p.set("page", String(next + 1)) : p.delete("page"),
    );

  const setAlert = (value: string) =>
    patchParams((p) => {
      p.delete("page");
      if (value === ALERT_ALL) p.delete("alert");
      else p.set("alert", value as ReportAlert);
    });

  const alertOptions = [
    { value: ALERT_ALL, label: "SEMUA" },
    {
      value: "aman",
      label: `${ALERT_LABEL.aman} (${aman.data?.meta.total ?? 0})`,
    },
    {
      value: "segera",
      label: `${ALERT_LABEL.segera} (${segera.data?.meta.total ?? 0})`,
    },
  ];

  const crumbs = selection
    ? [
        selection.pic ?? "Semua PO",
        selection.status ?? "Semua status",
        BUCKET_LABEL[selection.bucket],
      ]
    : [];

  return {
    selection,
    crumbs,
    select: (next: ActionSelect) =>
      setParams(writeSelection({ ...next, kategori: [IN_PROCESS] })),
    clear: () => setParams({}),
    rows,
    total,
    isLoading: query.isFetching,
    error: query.error?.message ?? null,
    onRetry: () => {
      void query.refetch();
    },
    limit,
    limitOptions: ROWS_PER_PAGE_OPTIONS,
    setLimit: (value: string) => {
      setLimit(Number(value));
      setPage(0);
    },
    pagination: { page, pageSize: limit, total, onPageChange: setPage },
    showAlert,
    alert: selection?.alert ?? ALERT_ALL,
    alertOptions,
    setAlert,
    save: async (uuid: string, patch: { status?: string; notes?: string }) => {
      await update.mutateAsync({ uuid, patch });
    },
    exportError: exporter.error,
    exportProps: exporter.controls(() => {
      if (!selection) return;
      const filter: ReportSelection = selection;
      exporter.run({
        filter,
        filename: makeFilename("ACTION", ...crumbs),
      });
    }, total === 0),
  };
}

export type ActionDrilldownApi = ReturnType<typeof useActionDrilldown>;
