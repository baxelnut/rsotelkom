import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse, Dataset, SyncOutcome, SyncRun } from "@rso/shared";
import { api, ApiError } from "@/config/api";

const DATA_KEYS = ["orders", "reports", "summary", "po", "sync"];

export function useSyncStatus() {
  return useQuery({
    queryKey: ["sync", "status"],
    queryFn: async () =>
      (await api<ApiResponse<SyncRun[]>>("/sheets/sync/status")).data,
    staleTime: 30_000,
  });
}

interface RunSyncInput {
  dataset?: Dataset | "all";
  force?: boolean;
}

export function useRunSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dataset = "all", force = false }: RunSyncInput = {}) =>
      (
        await api<ApiResponse<SyncOutcome[]>>("/sheets/sync/run", {
          method: "POST",
          query: { dataset, force: force ? "true" : undefined },
        })
      ).data,
    onSettled: () => {
      for (const key of DATA_KEYS) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
    },
  });
}

export function describeSyncError(error: unknown): string {
  if (error instanceof ApiError) {
    const outcomes = (error.body as { data?: SyncOutcome[] | null } | null)
      ?.data;
    const failed = outcomes
      ?.filter((o) => !o.ok)
      .map((o) => `${o.dataset}: ${o.error ?? "failed"}`);
    if (failed?.length) return failed.join("; ");
    return error.message;
  }
  return "Sync failed";
}
