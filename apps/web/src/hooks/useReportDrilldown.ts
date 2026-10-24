import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { ReportBucketFilter } from "@rso/shared";
// Hooks
import type { ReportExporterApi } from "./useReportExport";
import { useReportItems } from "./useReports";
// Config
import { ROWS_PER_PAGE_OPTIONS } from "@/config/overview";
import {
  ACTION_COLUMNS,
  BUCKET_LABEL,
  IN_PROCESS,
  PAGE_SIZE_DEFAULT,
} from "@/config/report";
// Contexts
import { useAuth } from "@/contexts/auth";
// Types
import type { ReportSelection } from "@/types/report";
// Utils
import { makeFilename } from "@/utils/download";
import { toReportRow } from "@/utils/orders";
import { describeSelection, selectionQuery } from "@/utils/report";

const NO_COLUMNS: string[] = [];

const isBucket = (value: string | null): value is ReportBucketFilter =>
  !!value && value in BUCKET_LABEL;

function readSelection(params: URLSearchParams): ReportSelection | null {
  const bucket = params.get("bucket");
  const kategori = (params.get("kategori") ?? "").split(",").filter(Boolean);
  if (!isBucket(bucket) || kategori.length === 0) return null;

  return {
    witel: params.get("witel") ?? undefined,
    subtype: params.get("subtype") ?? undefined,
    kategori,
    bucket,
  };
}

function writeSelection(selection: ReportSelection): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(selectionQuery(selection))) {
    if (value) params.set(key, value);
  }
  return params;
}

export function useReportDrilldown(exporter: ReportExporterApi) {
  const { isAdmin } = useAuth();
  const [params, setParams] = useSearchParams();
  const [limit, setLimit] = useState(PAGE_SIZE_DEFAULT);

  const selection = useMemo(() => readSelection(params), [params]);
  const page = Math.max(0, (Number(params.get("page")) || 1) - 1);

  const query = useReportItems(
    selection ? { ...selectionQuery(selection), page: page + 1, limit } : null,
  );

  const showActions = isAdmin || !!selection?.kategori.includes(IN_PROCESS);
  const orders = query.data?.data;

  const rows = useMemo(
    () =>
      (orders ?? []).map((order) =>
        toReportRow(order, isAdmin, showActions ? ACTION_COLUMNS : NO_COLUMNS),
      ),
    [orders, isAdmin, showActions],
  );
  const total = query.data?.meta.total ?? 0;

  const setPage = (next: number) =>
    setParams(
      (prev) => {
        const nextParams = new URLSearchParams(prev);
        if (next > 0) nextParams.set("page", String(next + 1));
        else nextParams.delete("page");
        return nextParams;
      },
      { replace: true },
    );

  return {
    selection,
    crumbs: selection ? describeSelection(selection) : [],
    select: (next: ReportSelection) => setParams(writeSelection(next)),
    clear: () => setParams({}),
    rows,
    total,
    showActions,
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
    exportError: exporter.error,
    exportProps: exporter.controls(() => {
      if (!selection) return;
      exporter.run({
        filter: selection,
        filename: makeFilename("AOSODOMORO", ...describeSelection(selection)),
      });
    }, total === 0),
  };
}

export type ReportDrilldownApi = ReturnType<typeof useReportDrilldown>;
