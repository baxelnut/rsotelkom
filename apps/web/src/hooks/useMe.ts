import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse, AuthUser, UpdateMeInput } from "@rso/shared";
import { api } from "@/config/api";

export function useMe(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => (await api<ApiResponse<AuthUser>>("/auth/me")).data,
    enabled: options.enabled ?? true,
    staleTime: 60_000,
  });
}

export function useUpdateMe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateMeInput) =>
      (
        await api<ApiResponse<AuthUser>>("/auth/me", {
          method: "PATCH",
          body: input,
        })
      ).data,
    onSuccess: (user) => {
      queryClient.setQueryData(["me"], user);
    },
  });
}
