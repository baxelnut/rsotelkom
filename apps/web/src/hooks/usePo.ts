import { useQuery } from "@tanstack/react-query";
import type { ApiResponse, PoContact } from "@rso/shared";
import { api } from "@/config/api";

export function usePoContacts() {
  return useQuery({
    queryKey: ["po"],
    queryFn: async () =>
      (await api<ApiResponse<PoContact[]>>("/sheets/po")).data,
    staleTime: 5 * 60_000,
  });
}
