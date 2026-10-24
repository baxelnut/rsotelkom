import { useQuery } from "@tanstack/react-query";
import type { ApiResponse, SummaryMap, SummaryName } from "@rso/shared";
import { api } from "@/config/api";

export function useSummary<N extends SummaryName>(name: N) {
  return useQuery({
    queryKey: ["summary", name],
    queryFn: async () =>
      (await api<ApiResponse<SummaryMap[N]>>(`/sheets/summary/${name}`)).data,
    staleTime: 60_000,
  });
}
