import { useMemo, useState } from "react";
import { witelKey } from "@/config/galaksi";
// Hooks
import { queryState } from "./queryState";
import { useSubtypeReport, useStoredState, type ReportExporterApi } from ".";
import { describeSyncError, useRunSync, useSyncStatus } from ".";
// Config
import { DEFAULT_KATEGORI, REPORT_KATEGORI } from "@/config/report";
// Contexts
import { useAuth } from "@/contexts/auth";
// Utils
import { makeFilename } from "@/utils/download";
import { buildMatrix, buildSummarySheet } from "@/utils/report";

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const isBoolean = (value: unknown): value is boolean =>
  typeof value === "boolean";

export function useReportMatrix(exporter: ReportExporterApi) {
  const { isAdmin } = useAuth();
  const query = useSubtypeReport();
  const syncStatus = useSyncStatus();
  const runSync = useRunSync();
  const [selected, setSelected] = useStoredState(
    "report.aosodomoro.kategori",
    DEFAULT_KATEGORI,
    isStringArray,
  );
  const [compact, setCompact] = useStoredState(
    "report.aosodomoro.compact",
    false,
    isBoolean,
  );
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const [witel, setWitel] = useStoredState(
    "report.aosodomoro.witel",
    [] as string[],
    isStringArray,
  );

  const witelKeys = useMemo(() => witel.map(witelKey), [witel]);
  const kategori = useMemo(
    () => REPORT_KATEGORI.filter((name) => selected.includes(name)),
    [selected],
  );
  const report = query.data;
  const matrix = useMemo(
    () => buildMatrix(report ?? [], kategori, witelKeys),
    [report, kategori, witelKeys],
  );

  const lastSyncedAt = useMemo(
    () =>
      (syncStatus.data ?? [])
        .filter((run) => run.dataset === "orders" && run.status === "ok")
        .map((run) => run.finished_at)
        .filter((value): value is string => !!value)
        .sort()
        .at(-1) ?? null,
    [syncStatus.data],
  );

  const toggleKategori = (name: string) =>
    setSelected(
      selected.includes(name)
        ? selected.filter((item) => item !== name)
        : [...selected, name],
    );

  const toggleSubtype = (subtype: string) =>
    setCollapsed((prev) =>
      prev.includes(subtype)
        ? prev.filter((item) => item !== subtype)
        : [...prev, subtype],
    );

  return {
    witel,
    witelKeys,
    setWitel,
    ...queryState(query),
    kategori,
    kategoriOptions: REPORT_KATEGORI,
    toggleKategori,
    matrix,
    compact,
    setCompact,
    collapsed,
    toggleSubtype,
    lastSyncedAt,
    onSync: isAdmin ? () => runSync.mutate({}) : undefined,
    isSyncing: runSync.isPending,
    syncError: runSync.error ? describeSyncError(runSync.error) : null,
    exportError: exporter.error,
    exportProps: exporter.controls(
      () =>
        exporter.run({
          filter: { kategori, bucket: "all", witels: witelKeys },
          filename: makeFilename("AOSODOMORO", "report"),
          summary: buildSummarySheet(report ?? [], kategori, witelKeys),
        }),
      kategori.length === 0 || !report?.length,
    ),
  };
}

export type ReportMatrixApi = ReturnType<typeof useReportMatrix>;
