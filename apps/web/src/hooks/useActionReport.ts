import { useMemo, useState } from "react";
// Hooks
import { queryState } from "./queryState";
import { useActionRows } from "./useReports";
import { useSummary } from "./useSummary";
// Config
import { ACTION_BUCKETS } from "@/config/action";
import { ALL } from "@/config/overview";
// Utils
import { buildActionTable, buildWitelCards } from "@/utils/action";
import { uniqueValues, withAllOption } from "@/utils/options";

export function useActionReport() {
  const query = useActionRows();
  const status = useSummary("process-status");
  const [witel, setWitel] = useState(ALL);

  const rows = query.data ?? undefined;

  const witelOptions = useMemo(
    () => withAllOption(uniqueValues(rows, (row) => row.witel || "N/A")),
    [rows],
  );

  const tables = useMemo(
    () =>
      ACTION_BUCKETS.map(({ bucket, label }) => ({
        bucket,
        label,
        ...buildActionTable(rows ?? [], bucket, witel),
      })),
    [rows, witel],
  );

  const cards = useMemo(
    () => buildWitelCards(status.data ?? []),
    [status.data],
  );

  return {
    ...queryState(query),
    witel,
    setWitel,
    witelOptions,
    tables,
    cards,
    cardsLoading: status.isLoading,
    cardsError: status.error?.message ?? null,
  };
}

export type ActionReportApi = ReturnType<typeof useActionReport>;
