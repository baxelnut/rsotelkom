import { useMemo } from "react";
// Hooks
import { useSyncStatus } from "./useSync";

export function useLastSynced() {
  const { data } = useSyncStatus();

  return useMemo(
    () =>
      (data ?? [])
        .filter((run) => run.dataset === "orders" && run.status === "ok")
        .map((run) => run.finished_at)
        .filter((value): value is string => !!value)
        .sort()
        .at(-1) ?? null,
    [data],
  );
}
