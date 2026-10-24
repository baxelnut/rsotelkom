import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  ApiResponse,
  Order,
  OrderPatch,
  OrdersQuery,
  Paged,
} from "@rso/shared";
import { api } from "@/config/api";

export function useOrders(query: OrdersQuery) {
  return useQuery({
    queryKey: ["orders", query],
    queryFn: () =>
      api<Paged<Order[]>>("/sheets/orders", { query: { ...query } }),
    placeholderData: keepPreviousData,
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ uuid, patch }: { uuid: string; patch: OrderPatch }) =>
      (
        await api<ApiResponse<Order>>(`/sheets/orders/${uuid}`, {
          method: "PATCH",
          body: patch,
        })
      ).data,
    onSuccess: () => {
      for (const key of ["orders", "reports", "summary"]) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
    },
  });
}
