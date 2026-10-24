import { useCallback, useMemo } from "react";
// Hooks
import { useLastSynced } from "./useLastSynced";
import { useNotice } from "./useNotice";
import { describeSyncError, useRunSync, useSyncStatus } from ".";
// Utils
import { formatNumber } from "@/utils/format";

const HISTORY_LIMIT = 8;

export function useSyncPanel() {
  const status = useSyncStatus();
  const { mutateAsync, isPending } = useRunSync();
  const lastSynced = useLastSynced();
  const { notice, success, failure, clear } = useNotice();

  const history = useMemo(
    () =>
      [...(status.data ?? [])]
        .sort((a, b) => b.started_at.localeCompare(a.started_at))
        .slice(0, HISTORY_LIMIT),
    [status.data],
  );

  const run = useCallback(async () => {
    clear();
    try {
      const outcomes = await mutateAsync({});
      const rows = (outcomes ?? []).reduce((sum, o) => sum + (o.rows ?? 0), 0);
      success(`Sync complete. ${formatNumber(rows)} rows processed.`);
    } catch (error) {
      failure(describeSyncError(error));
    }
  }, [clear, failure, mutateAsync, success]);

  return {
    lastSynced,
    history,
    isLoading: status.isLoading,
    error: status.error instanceof Error ? status.error.message : null,
    retry: () => void status.refetch(),
    isRunning: isPending,
    run,
    notice,
  };
}

export type SyncPanelApi = ReturnType<typeof useSyncPanel>;
