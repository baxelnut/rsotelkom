import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ApiResponse,
  CreateUserInput,
  ManagedUser,
  Role,
  UpdateUserInput,
} from "@rso/shared";
import { api } from "@/config/api";

const USERS_KEY = ["admin", "users"];

export function useAdminUsers(role?: Role) {
  return useQuery({
    queryKey: [...USERS_KEY, role ?? "all"],
    queryFn: async () =>
      (
        await api<ApiResponse<ManagedUser[]>>("/admin/users", {
          query: { role },
        })
      ).data,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateUserInput) =>
      (
        await api<ApiResponse<ManagedUser>>("/admin/users", {
          method: "POST",
          body: input,
        })
      ).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_KEY }),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateUserInput }) =>
      (
        await api<ApiResponse<ManagedUser>>(`/admin/users/${id}`, {
          method: "PATCH",
          body: input,
        })
      ).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_KEY }),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api<void>(`/admin/users/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_KEY }),
  });
}
